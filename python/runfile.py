# -*- coding: utf-8 -*-
# @Author: Jonathan
"""
This code was developed using standard open source libraries
    cv2
    dlib
    imutils
    scipy
    time
    datetime
    numpy
    math
    requests
    picamera
    RPi
    sys
    signal
    pyttsx3
    vlc
    trivia
    fatigue_level
Other than where specified this code is an original product
copyright 2021 Jonathan Allen, All Rights Reserved
"""

#Import Python Libraries
import cv2
import dlib
import imutils
from imutils import face_utils
from scipy.spatial import distance as dist
import time
from datetime import datetime, timedelta
import numpy as np
import math
import requests
from picamera.array import PiRGBArray
from picamera import PiCamera
import RPi.GPIO as GPIO
import sys
import signal
import pyttsx3
import pygame
import trivia #Oliver Sutton's Library
import fatigue_level #Oliver Sutton's Library


#Global Configuration Variables
FACIAL_LANDMARK_PREDICTOR = "shape_predictor_68_face_landmarks.dat" # path to dlib's pre-trained facial landmark predictor
MINIMUM_EAR = 0.25 #Minimum EAR for both the eyes to mark the eyes as open
MAXIMUM_FRAME_COUNT = 12 #Maximum number of consecutive frames in which EAR can remain less than MINIMUM_EAR, otherwise alert drowsiness
FMT = '%H:%M:%S.%f' #Time format
RECORDING = False
DETAILED = False
FATIGUE = True

#Variables
#trivia = "http://localhost:3002/trivia"
#fatigue = "http://localhost:3002/fatigue"
#photo = "http://localhost:3002/photo"
minAngle = 15
camera = PiCamera()
camera.resolution = (640, 480)
camera.framerate = 30
sw1 = 23
sw2 = 24
pwmPin = 13
motorPin1 = 5
motorPin2 = 6
pwm = 0
fatigueState = 0; #0:awake, 1:tones, 2:trivia, 3:haptics, 4:rest

#Modes
GPIO.setmode(GPIO.BCM)
GPIO.cleanup()

def eye_aspect_ratio(eye):
    '''
    Returns the Eye Aspect Ratio of all 6 points around the eye. EAR=(||p2-p6||+||p3-p5||)/(2*||p1-p4||)
    Parameters:
            eye (list): list of all the values of the six points around the eye

    Returns:
            ear (float): float value of the eye aspect ratio for the passed eye points
    '''
    p2_p6 = dist.euclidean(eye[1], eye[5])
    p3_p5 = dist.euclidean(eye[2], eye[4])
    p1_p4 = dist.euclidean(eye[0], eye[3])
    ear = (p2_p6 + p3_p5) / (2.0 * p1_p4)
    return ear

def check_roll_angle(image, lefteyex, lefteyey, righteyex, righteyey):
    '''
    Returns the roll angle of the user's head
    Roll being the rotation around the axis running from the middle of the nose straight back through the head
    Parameters:
            image (array): image containing the user
            lefteyex (int): x value of the left eye pixel (x component of the coordinate for the pixel)
            lefteyey (int): y value of the left eye pixel (y component of the coordinate for the pixel)
            righteyex (int): x value of the right eye pixel (x component of the coordinate for the pixel)
            righteyey (int): y value of the right eye pixel (y component of the coordinate for the pixel)
    Returns:
            rollAngleDegrees (float): roll angle of the user's head
    '''
    deltax = righteyex - lefteyex
    deltay = righteyey - lefteyey
    centery = int((righteyey+lefteyey)/2)
    gradient = (deltay/deltax) #rise over run
    rollAngleRadians = np.arctan(deltay/deltax)
    rollAngleDegrees = (rollAngleRadians*180)/math.pi
    if DETAILED:
        cv2.line(image, (righteyex, righteyey), (lefteyex, lefteyey), (0,0,255), 2)
        cv2.line(image, (0, centery), (800, centery), (0, 255, 255), 2)
        cv2.putText(image, "roll angle: {}".format(round(rollAngleDegrees,2)), (10, 120), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 255), 2)
        if (rollAngleDegrees > minAngle):
            cv2.putText(image, "head rolled left", (500, 120), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
        if (rollAngleDegrees < -minAngle):
            cv2.putText(image, "head rolled right", (500, 120), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
    return rollAngleDegrees

def check_yaw_angle(image, uppernosex, uppernosey, lowernosex, lowernosey):
    '''
    Returns the yaw angle of the user's head
    Yaw being the rotation around the axis running from the middle of the top of the head straight down through the neck
    Parameters:
            image (array): image containing the user
            uppernosex (int): x value of the upper point of the nose (x component of the coordinate for the pixel)
            uppernosey (int): y value of the upper point of the nose (y component of the coordinate for the pixel)
            lowernosex (int): x value of the lower point of the nose (x component of the coordinate for the pixel)
            lowernosey (int): y value of the lower point of the nose (y component of the coordinate for the pixel)
    Returns:
            yawAngleDegrees (float): yaw angle of the user's head
    '''
    deltax = uppernosex - lowernosex
    deltay = uppernosey - lowernosey
    centerx = int((uppernosex+lowernosex)/2)
    verticalgradient = (deltax/deltay)
    yawAngleRadians = np.arctan(deltax/deltay)
    yawAngleDegrees = (yawAngleRadians*180)/math.pi
    if DETAILED:
        cv2.line(image, (uppernosex, uppernosey), (lowernosex, lowernosey), (255,0,0), 2)
        cv2.line(image, (centerx, 0), (centerx, 600), (0, 255, 255), 2)
        cv2.putText(image, "yaw angle: {}".format(round(yawAngleDegrees,2)), (10, 150), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 255), 2)
        if (yawAngleDegrees > minAngle):
            cv2.putText(image, "head yawed left", (500, 150), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
        if ((yawAngleDegrees) < -minAngle):
            cv2.putText(image, "head yawed right", (500, 150), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
    return yawAngleDegrees

def check_pitch_angle(image,
                        leftupperjawx, leftupperjawy,
                        rightupperjawx, rightupperjawy,
                        leftlowerjawx, leftlowerjawy,
                        rightlowerjawx, rightlowerjawy,
                        lefteyex, lefteyey,
                        righteyex, righteyey):
    '''
    Returns the pitch angle of the user's head
    Pitch being the rotation around the axis running from the left ear through the middle of the head to the right ear
    Parameters:
            image (array): image containing the user
            leftupperjawx (int): x value of the upper point of the left jaw (x component of the coordinate for the pixel)
            leftupperjawy (int): y value of the upper point of the left jaw (y component of the coordinate for the pixel)
            rightupperjawx (int): x value of the upper point of the right jaw (x component of the coordinate for the pixel)
            rightupperjawy (int): y value of the upper point of the right jaw (y component of the coordinate for the pixel)
            leftlowerjawx (int): x value of the lower point of the left jaw (x component of the coordinate for the pixel)
            leftlowerjawy (int): y value of the lower point of the left jaw (y component of the coordinate for the pixel)
            rightlowerjawx (int): x value of the lower point of the right jaw (x component of the coordinate for the pixel)
            rightlowerjawy (int): y value of the lower point of the right jaw (y component of the coordinate for the pixel)
            lefteyex (int): x value of the point of the left eye (x component of the coordinate for the pixel)
            lefteyey (int): y value of the point of the left eye (y component of the coordinate for the pixel)
            righteyex (int): x value of the point of the right eye (x component of the coordinate for the pixel)
            righteyey (int): y value of the point of the right eye (y component of the coordinate for the pixel)
    Returns:
            pitchAngleDegrees (float): pitch angle of the user's head
    '''
    #upper
    deltaupperx = rightupperjawx - leftupperjawx
    deltauppery = rightupperjawy - leftupperjawy
    centeruppery = int((rightupperjawy+leftupperjawy)/2)
    #lower
    deltalowerx = rightlowerjawx - leftlowerjawx
    deltalowery = rightlowerjawy - leftlowerjawy
    centerlowery = int((rightlowerjawy+leftlowerjawy)/2)
    #eyes
    deltax = righteyex - lefteyex
    deltay = righteyey - lefteyey
    centery = int((righteyey+lefteyey)/2)
    pitchAngleDegrees = centeruppery-centery
    if DETAILED:
        cv2.line(image, (rightupperjawx, rightupperjawy), (leftupperjawx, leftupperjawy), (0,255,0), 2)
        cv2.putText(image, "pitch angle: {}".format(round(pitchAngleDegrees,2)), (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 255), 2)
        if (centeruppery > (centery + minAngle)):
            cv2.putText(image, "head pitched up", (500, 90), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
        if (centeruppery < (centery - minAngle)):
            cv2.putText(image, "head pitched down", (500, 90), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
    return pitchAngleDegrees

def crop_image(image, dimensions):
    """Returns image cropped out from the center to the dimensions provided
    Parameters:
        image (array): image being cropped
        dimensions (tuple): dimensions of cropped image(width, height)
    Returns:
        image (array): cropped image
    """
    width, height = image.shape[1], image.shape[0]
    if (dimensions[0] < image.shape[1]):
        crop_width = dimensions[0]
    else:
        crop_width = image.shape[1]
    if (dimensions[1] < image.shape[0]):
        crop_height = dimensions[1]
    else:
        crop_height = image.shape[0]
    centerx, centery = int(width/2), int(height/2)
    tmpCropWidth, tmpCropHeight = int(crop_width/2), int(crop_height/2)
    cropped_image = image[centery-tmpCropHeight:centery+tmpCropHeight, centerx-tmpCropWidth:centerx+tmpCropWidth]
    return cropped_image

def signal_handler(signal, frame):
    '''
    Cleans up the GPIO pins on the raspberry pi then exits current system
    Parameters:
            signal: the signal received to the kernal
            frame: the current state of the device
    '''
    GPIO.cleanup()
    sys.exit(0)

def setup_buttons(sw1Pin, sw2Pin):
    '''
    Setups the buttons to the appropriate ready state on interrupts
    Parameters:
            sw1Pin (int): the BCM number of the pin switch 1 is connected to
            sw2Pin (int): the BCM number of the pin switch 2 is connected to
    '''
    GPIO.setup(sw1Pin, GPIO.IN)
    GPIO.setup(sw2Pin, GPIO.IN)
    GPIO.add_event_detect(sw1Pin, GPIO.BOTH, callback=button_callback, bouncetime=50)
    GPIO.add_event_detect(sw2Pin, GPIO.BOTH, callback=button_callback, bouncetime=50)


def button_callback(channel):
    '''
    Callback function for button interrupt. Function is called if either button signals an interrupt
    Parameters:
            channel: the placeholder variable for the interrupt return state
    '''
    if not (GPIO.input(sw1)):
        #do switch one logic right here
        print("switch 1 pressed")
        #sys.exit(0)
    if not (GPIO.input(sw2)):
        #do switch two logic right here
        print("switch 2 pressed")

def set_motor_speed(pwm, speed):
    '''
    Sets the motor to the specified speed
    Parameters:
            pwm (object): the GPIO.PWM object
            speed (int): the desired speed of the motor from 0 to 100
    '''
    GPIO.setup(motorPin1, GPIO.OUT)
    if (speed >= 0 and speed <= 100):
        pwm.ChangeDutyCycle(speed)

def setup_motor(motorPin1, motorPin2, pwmPin):
    '''
    Setups the motor to the desired state with speed control
    Parameters:
            motorPin1 (int): the BCM number of the motor's pin 1
            motorPin2 (int): the BCM number of the motor's pin 2
            pwmPin (int): the BCM number of the motor's speed control pwm pin
    Returns:
            pwm (object): the GPIO.PWM object
    '''
    GPIO.setup(motorPin1, GPIO.OUT)
    GPIO.setup(motorPin2, GPIO.OUT)
    GPIO.setup(pwmPin, GPIO.OUT)
    GPIO.output(motorPin1, GPIO.HIGH)
    GPIO.output(motorPin2, GPIO.LOW)
    pwm = GPIO.PWM(pwmPin, 1000)
    pwm.start(0)
    return pwm

def play_tone():
    pygame.mixer.music.play()



def main():
    #Initializations
    pygame.init() #init pygame for sound
    pygame.mixer.music.load('notification.mp3')
    faceDetector = dlib.get_frontal_face_detector() #dlib's HOG based face detector
    landmarkFinder = dlib.shape_predictor(FACIAL_LANDMARK_PREDICTOR) #dlib's landmark finder/predcitor inside detected face
    rawCapture = PiRGBArray(camera, size=(640,480))
    setup_buttons(sw1, sw2)
    pwm = setup_motor(motorPin1, motorPin2, pwmPin)
    signal.signal(signal.SIGINT, signal_handler)

    #signal.pause()
    trivia.send_trivia("", "")
    #setup text to speech engine
    ttsEngine = pyttsx3.init()
    ttsEngine.setProperty('rate', 170)
    ttsEngine.setProperty('voice', 'english_rp+f3')
    ttsEngine.say("How many planets are there in our solar system?")
    ttsEngine.runAndWait()

    #Finding landmark id for left and right eyes
    (leftEyeStart, leftEyeEnd) = face_utils.FACIAL_LANDMARKS_IDXS["left_eye"]
    (rightEyeStart, rightEyeEnd) = face_utils.FACIAL_LANDMARKS_IDXS["right_eye"]

    eyeClosedCounter = 0
    blinkCounter = 0
    eyeReopened = 0
    prevTime = datetime.now().strftime('%H:%M:%S.%f')[:-4]
    currTime = datetime.now().strftime('%H:%M:%S.%f')[:-4]
    blinkLastChecked = currTime

    if RECORDING:
        frame_width = int(webcamFeed.get(3))
        frame_height = int(webcamFeed.get(4))
        out = cv2.VideoWriter('video1011.avi',cv2.VideoWriter_fourcc(*'XVID'), 15, (800, 600))

    for frame in camera.capture_continuous(rawCapture, format="bgr", use_video_port=True):
        image = frame.array
        image = imutils.rotate(image, 60)
        image = crop_image(image, (350, 400))

        grayImage = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = faceDetector(grayImage, 0)
        currTime = datetime.now().strftime('%H:%M:%S.%f')[:-3]

        tdelta = datetime.strptime(currTime, FMT) - datetime.strptime(prevTime, FMT)
        for face in faces:
            faceLandmarks = landmarkFinder(grayImage, face)
            faceLandmarks = face_utils.shape_to_np(faceLandmarks)
            leftEye = faceLandmarks[leftEyeStart:leftEyeEnd]
            rightEye = faceLandmarks[rightEyeStart:rightEyeEnd]
            check_roll_angle(image, faceLandmarks[45][0], faceLandmarks[45][1], faceLandmarks[36][0], faceLandmarks[36][1])
            check_yaw_angle(image, faceLandmarks[27][0], faceLandmarks[27][1], faceLandmarks[30][0], faceLandmarks[30][1])
            check_pitch_angle(image,
                                faceLandmarks[0][0],faceLandmarks[0][1],
                                faceLandmarks[16][0],faceLandmarks[16][1],
                                faceLandmarks[1][0],faceLandmarks[1][1],
                                faceLandmarks[15][0],faceLandmarks[15][1],
                                faceLandmarks[45][0], faceLandmarks[45][1],
                                faceLandmarks[36][0], faceLandmarks[36][1])

            leftEAR = eye_aspect_ratio(leftEye)
            rightEAR = eye_aspect_ratio(rightEye)

            ear = (leftEAR + rightEAR) / 2.0
            checktime = datetime.strptime(currTime, FMT) - datetime.strptime(blinkLastChecked, FMT)
            checktime = checktime.total_seconds()
            if checktime > 1:
                if ear < MINIMUM_EAR:
                    if eyeReopened == 1:
                        blinkCounter += 1
                        blinkLastChecked = datetime.now().strftime('%H:%M:%S.%f')[:-3]
                        eyeReopened = 0
                else:
                    eyeReopened = 1

            if ear < MINIMUM_EAR:
                eyeClosedCounter += 1
            else:
                eyeClosedCounter = 0
            if DETAILED:
                cv2.putText(image, "Blink Counter: {}".format(blinkCounter), (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (255, 255, 0), 3)

            if FATIGUE:
                if eyeClosedCounter >= MAXIMUM_FRAME_COUNT:
                    cv2.putText(image, "!!Possible Fatigue Detected!!", (8, 300), cv2.FONT_HERSHEY_SIMPLEX, 1.7, (0, 0, 255), 3)

        if RECORDING:
            out.write(image)
        cv2.imshow("Image", image)
        key = cv2.waitKey(1)
        rawCapture.truncate(0)
        if key == 27:
            break

    if RECORDING:
        out.release()
    cv2.destroyAllWindows()
    GPIO.cleanup()

if __name__ == '__main__':
    main()

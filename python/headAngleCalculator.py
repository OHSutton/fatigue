import cv2
import dlib
import imutils
from imutils import face_utils
from scipy.spatial import distance as dist
import time
from datetime import datetime, timedelta
import numpy as np
import math

#Global Configuration Variables
FACIAL_LANDMARK_PREDICTOR = "shape_predictor_68_face_landmarks.dat"  # path to dlib's pre-trained facial landmark predictor
MINIMUM_EAR = 0.25    # Minimum EAR for both the eyes to mark the eyes as open
MAXIMUM_FRAME_COUNT = 12    # Maximum number of consecutive frames in which EAR can remain less than MINIMUM_EAR, otherwise alert drowsiness
FMT = '%H:%M:%S.%f'

RECORDING = False
DETAILED = True
FATIGUE = True

minAngle = 15

def eye_aspect_ratio(eye):
    p2_minus_p6 = dist.euclidean(eye[1], eye[5])
    p3_minus_p5 = dist.euclidean(eye[2], eye[4])
    p1_minus_p4 = dist.euclidean(eye[0], eye[3])
    ear = (p2_minus_p6 + p3_minus_p5) / (2.0 * p1_minus_p4)
    return ear

def check_roll_angle(image, lefteyex, lefteyey, righteyex, righteyey):
    deltax = righteyex - lefteyex
    deltay = righteyey - lefteyey
    centery = int((righteyey+lefteyey)/2)
    gradient = (deltay/deltax)
    if DETAILED:
        cv2.line(image, (righteyex, righteyey), (lefteyex, lefteyey), (0,0,255), 2)
    cv2.line(image, (0, centery), (800, centery), (0, 255, 255), 2)
    angler = np.arctan(deltay/deltax)
    angled = (angler*180)/math.pi
    cv2.putText(image, "roll angle: {}".format(round(angled,2)), (10, 120), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 255), 2)
    if (angled > minAngle):
        cv2.putText(image, "head rolled left", (500, 120), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
    if (angled < -minAngle):
        cv2.putText(image, "head rolled right", (500, 120), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)

def check_yaw_angle(image, uppernosex, uppernosey, lowernosex, lowernosey):
    deltax = uppernosex - lowernosex
    deltay = uppernosey - lowernosey
    centerx = int((uppernosex+lowernosex)/2)
    verticalgradient = (deltax/deltay)
    if DETAILED:
        cv2.line(image, (uppernosex, uppernosey), (lowernosex, lowernosey), (255,0,0), 2)
    cv2.line(image, (centerx, 0), (centerx, 600), (0, 255, 255), 2)
    angler = np.arctan(deltax/deltay)
    angled = (angler*180)/math.pi
    cv2.putText(image, "yaw angle: {}".format(round(angled,2)), (10, 150), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 255), 2)
    if (angled > minAngle):
        cv2.putText(image, "head yawed left", (500, 150), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
    if (angled < -minAngle):
        cv2.putText(image, "head yawed right", (500, 150), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)

def check_pitch_angle(image, 
                        leftupperjawx, leftupperjawy, 
                        rightupperjawx, rightupperjawy,
                        leftlowerjawx, leftlowerjawy, 
                        rightlowerjawx, rightlowerjawy,
                        lefteyex, lefteyey,
                        righteyex, righteyey):
    #upper
    deltaupperx = rightupperjawx - leftupperjawx
    deltauppery = rightupperjawy - leftupperjawy
    centeruppery = int((rightupperjawy+leftupperjawy)/2)
    if DETAILED:
        cv2.line(image, (rightupperjawx, rightupperjawy), (leftupperjawx, leftupperjawy), (0,255,0), 2)
    #lower
    deltalowerx = rightlowerjawx - leftlowerjawx
    deltalowery = rightlowerjawy - leftlowerjawy
    centerlowery = int((rightlowerjawy+leftlowerjawy)/2)
    #cv2.line(image, (rightlowerjawx, rightlowerjawy), (leftlowerjawx, leftlowerjawy), (0,255,0), 2)
    #eyes
    deltax = righteyex - lefteyex
    deltay = righteyey - lefteyey
    centery = int((righteyey+lefteyey)/2)
    #cv2.line(image, (righteyex, righteyey), (lefteyex, lefteyey), (0,255,0), 2)
    
    cv2.putText(image, "pitch angle: {}".format(round(centeruppery-centery,2)), (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 255), 2)
    if (centeruppery > (centery + minAngle)):
        cv2.putText(image, "head pitched up", (500, 90), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
    if (centeruppery < (centery - minAngle)):
        cv2.putText(image, "head pitched down", (500, 90), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)


#Initializations
faceDetector = dlib.get_frontal_face_detector()     # dlib's HOG based face detector
landmarkFinder = dlib.shape_predictor(FACIAL_LANDMARK_PREDICTOR)  # dlib's landmark finder/predcitor inside detected face
webcamFeed = cv2.VideoCapture(0)

# Finding landmark id for left and right eyes
(leftEyeStart, leftEyeEnd) = face_utils.FACIAL_LANDMARKS_IDXS["left_eye"]
(rightEyeStart, rightEyeEnd) = face_utils.FACIAL_LANDMARKS_IDXS["right_eye"]



EYE_CLOSED_COUNTER = 0
blinkCounter = 0
eyeReopened = 0
prevTime = datetime.now().strftime('%H:%M:%S.%f')[:-4]
currTime = datetime.now().strftime('%H:%M:%S.%f')[:-4]
blinkLastChecked = currTime

if RECORDING:
    frame_width = int(webcamFeed.get(3))
    frame_height = int(webcamFeed.get(4))
    out = cv2.VideoWriter('video1011.avi',cv2.VideoWriter_fourcc(*'XVID'), 15, (800, 600))

while True:
    (status, image) = webcamFeed.read()
    image = imutils.resize(image, width=800)
    grayImage = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    faces = faceDetector(grayImage, 0)
    currTime = datetime.now().strftime('%H:%M:%S.%f')[:-3]

    tdelta = datetime.strptime(currTime, FMT) - datetime.strptime(prevTime, FMT)
    for face in faces:
        faceLandmarks = landmarkFinder(grayImage, face)
        faceLandmarks = face_utils.shape_to_np(faceLandmarks)
        #for (x,y) in faceLandmarks:
            #cv2.circle(image, (x,y), 1, (0,255,0), -1)

        #convert dlib rects to opencv bounding box arrays
        (x, y, w, h) = face_utils.rect_to_bb(face)
        #cv2.rectangle(image, (x,y), (x+w,y+h), (255,0,0), 2)
        (centerx, centery) = ((x+w)+x)/2, ((y+h)+y)/2
        

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

        #leftEyeHull = cv2.convexHull(leftEye)
        #rightEyeHull = cv2.convexHull(rightEye)

        #cv2.drawContours(image, [leftEyeHull], -1, (255, 0, 0), 2)
        #cv2.drawContours(image, [rightEyeHull], -1, (255, 0, 0), 2)

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
            EYE_CLOSED_COUNTER += 1
        else:
            EYE_CLOSED_COUNTER = 0

        #cv2.putText(image, "EAR: {}".format(round(ear, 3)), (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 255), 2)
        cv2.putText(image, "Blink Counter: {}".format(blinkCounter), (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (255, 255, 0), 3)

        if FATIGUE:
            if EYE_CLOSED_COUNTER >= MAXIMUM_FRAME_COUNT:
                cv2.putText(image, "!!Possible Fatigue Detected!!", (8, 300), cv2.FONT_HERSHEY_SIMPLEX, 1.7, (0, 0, 255), 3)

    if RECORDING:
        out.write(image)
    image = imutils.rotate(image, 90)
    cv2.imshow("Image", image)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
webcamFeed.release()
if RECORDING:
    out.release()
cv2.destroyAllWindows()

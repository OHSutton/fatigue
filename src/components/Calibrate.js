import React, {useEffect, useRef} from "react"

import userService from '../services/users'
import '../styles/calibrate.css'
import '../styles/common.css'
import face from "../pics/face-pic.png"


import {Button, Paper, Typography} from "@mui/material";
import {Link} from "react-router-dom";



const Calibrate = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const vidConstraints = {
      video: {
        width: 400,
        height: 300,
      }
    }
    userService.setCameraActivity('true')
      .then(() => {
        setTimeout(() => {
          console.log("Using Camera")
          navigator.mediaDevices
            .getUserMedia(vidConstraints)
            .then(stream => {
              let video = videoRef.current
              video.srcObject = stream
              video.play()
            })
            .catch(err => {
              console.log("!!!ERROR!!!", err)
            })
        }, 200)
      })

    return (() => {
      navigator.mediaDevices
        .getUserMedia(vidConstraints)
        .then(stream => {
          stream.getTracks()[0].stop();
        })
      userService.setCameraActivity('false')
        .then(() => {
          console.log("Released Camera")
        })
    })
  }, [videoRef])

  return (
    <Paper className={'page calibrate-container'} square={true}>
      <Typography variant={'h5'} align={'center'} className={'assist-text'} gutterBottom>
        Please ensure face is positioned within the circle.
      </Typography>
      <div className={'centered-video'}>
        <video ref={videoRef}/>
      </div>
      <img className={"face-template"} src={face} alt="face" />
      <div className={'done-button'}>
        <Button className={'skinny-button'} component={Link} to={"/"} variant={'contained'} color={'primary'}>
          Done
        </Button>
      </div>
    </Paper>
  )
}


export default Calibrate
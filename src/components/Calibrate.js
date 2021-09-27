import React, {useEffect, useRef} from "react"

import '../styles/calibrate.css'
import '../styles/common.css'
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

    return (() => {
      navigator.mediaDevices
        .getUserMedia(vidConstraints)
        .then(stream => {
          stream.getTracks()[0].stop();
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
      <div className={'done-button'}>
        <Button className={'skinny-button'} component={Link} to={"/"} variant={'contained'} color={'primary'}>
          Done
        </Button>
      </div>
    </Paper>
  )
}


export default Calibrate
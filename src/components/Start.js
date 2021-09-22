import React, {useEffect, useState} from "react";
import { Link } from "react-router-dom";
import {Paper, Typography, Button} from "@mui/material";
import {makeStyles} from "@mui/styles";


const useStyles = makeStyles({
  page: {
    width: 800,
    height: 480,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  frame: {
    width: '100%',
    height: '100%',
  },

  stopWatch: {
    marginTop: 10,
    marginRight: 10,
  },

  subButton: {
    width: 200,
    height: 80,
    marginBottom: 10,
  },

  trivia: {
    padding: 10,
  }
});



const Header = ({runtime, classes}) => {
  return (
    <div>
      <Typography className={classes.stopWatch} variant={'h3'} gutterBottom>
        {new Date(runtime * 1000).toISOString().substr(11, 8)}
      </Typography>
    </div>
  )
}


const Footer = ({classes}) => {
  return (
    <div>
      <Button className={classes.subButton} component={Link} to={"/"} variant={"contained"} color={"primary"}>
        Stop
      </Button>
    </div>
  )
}

// What animal has black and white stripes?
const Trivia = ({classes}) => {
  const playTTS = () => {
    let utterance = new SpeechSynthesisUtterance("Which country consumes the most chocolate per capita?")
    speechSynthesis.speak(utterance)
  }
  return (
    <div>
      <Typography className={classes.trivia} variant={'h3'} align={'center'}>
        Which country consumes the most chocolate per capita?
      </Typography>
      <Button size={"large"} variant={"contained"} onClick={playTTS}>TTS</Button>
    </div>
  )
}

const Start = () => {
  const [runtime, setRuntime] = useState(0);
  const classes = useStyles();

  useEffect(() => {
    let timerID = setTimeout(() => {
      setRuntime(runtime + 1)
    }, 1000)
    return(() => {
      clearInterval(timerID)
    })
  },[runtime])

  return (
    <Paper className={classes.page} square={true}>
      <Header runtime={runtime} classes={classes}/>
      <Trivia classes={classes} />
      <Footer classes={classes} />
    </Paper>
  )
}

export default Start
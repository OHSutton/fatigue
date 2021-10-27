import React, {useEffect} from "react";
import useState from 'react-usestateref'
import {Link} from "react-router-dom";
import {Alert, Button, LinearProgress, Paper, Typography} from "@mui/material";

import {QuestionTime, TriviaTime, FatigueColours, FatigueStatus, Guest} from '../utils'
import '../styles/common.css'
import '../styles/start.css'
import userService from "../services/users";


// Component for run time & Fatigue Status
const Header = ({runtime, status}) => {
  return (
    <div className={'start-header'}>
      <Typography variant={'h3'}>
        {new Date(runtime * 1000).toISOString().substr(11, 8)}
      </Typography>
      <Typography className={'time-elapsed'} style={{color: FatigueColours[status]}} variant={'h4'}>
        Fatigue Status: {FatigueStatus[status]}
      </Typography>
    </div>
  )
}

// Alert displayed when Parking is set for a fatigue level.
const ParkingAlert = ({fatigueControl}) => {
  if (fatigueControl === "parking") {
    return <Alert severity="error" variant={"filled"}  sx={{"fontSize": 20}}>Please park the vehicle. It is not safe for you to drive.</Alert>
  }
  return <div></div>
}

// Component to display trivia & progress bar
const Trivia = ({trivia}) => {
  if (trivia.question === undefined || trivia.time >= 90) {
    return <div></div>
  }

  if (trivia.time <= QuestionTime) {
    return (
      <div className={"trivia"}>
        <Typography variant={'h3'} align={"center"} style={{wordWrap: "break-word"}}>
          {`${trivia["question"]}`}
        </Typography>
        <LinearProgress variant="determinate" value={trivia.time / QuestionTime * 100} />
      </div>
    )
  } else if (trivia.time <= TriviaTime) {
    return (
      <div className={"trivia"}>
        <Typography variant={'h3'} align={"center"} style={{wordWrap: "break-word"}}>
          {`${trivia["answer"]}`}
        </Typography>
        <LinearProgress variant="determinate" value={(trivia.time - QuestionTime) / (TriviaTime - QuestionTime) * 100} />
      </div>
    )
  }
  return <div></div>
}

// Component for stop button
const Footer = () => {
  return (
    <div className={'start-footer'}>
      <Button className={'skinny-button'} component={Link} to={"/"} variant={"contained"} color={"primary"}>
        Stop
      </Button>
    </div>
  )
}

// Sub-root component
const Start = () => {
  const [runtime, setRuntime] = useState(0)
  const [status, setStatus] = useState('F0')
  const [trivia, setTrivia, triviaRef] = useState({})
  const [user, setUser, userRef] = useState(Guest)
  const [fatigueControl, setFatigueControl] = useState("")


  // Get current user
  useEffect(() => {
    userService
      .getCurrentUser()
      .then(u => {
        console.log("Fetched user", u)
        setUser(u)
      })
  }, [])

  // Interval to increment runtime and trivia display time
  useEffect(() => {
    let intervalID = setInterval(() => {
      setRuntime(runtime + 0.3)

      if (triviaRef.current.question !== undefined) {
        if (triviaRef.current.time < TriviaTime) {
          setTrivia(prevTrivia => {
            return {...prevTrivia, time: prevTrivia['time'] + 0.3}
          })
        } else {
          setTrivia({})
        }
      }
    }, 300)


    return(() => {
      clearInterval(intervalID)
    })
  },[runtime])

  // Sets up event source to allow server -> UI communication
  // used to relay triva & fatigue_level messages from model
  useEffect(() => {
    let eventSource = new EventSource('http://localhost:3002/stream')
    console.log("Started Eventsource", eventSource)
    eventSource.onmessage = e => {
      let data = JSON.parse(e.data)
      if (data.type === "trivia") {
        updateTrivia(data.data)
      } else {
        updateFatigueLevel(data.data)
      }
    }
    return (() => {
      console.log("Closing Source")
      eventSource.close()
    })
  }, [])

  // trigger trivia to display
  const updateTrivia = (rawTrivia) => {
    setFatigueControl("")
    rawTrivia.time = 0
    setTrivia(rawTrivia)
  }

  // trigger fatigue level to update
  const updateFatigueLevel = (fatigueStatus) => {
    setStatus(fatigueStatus['fatigue'])
    if (fatigueStatus['fatigue'] === "F0") {
      setFatigueControl("")
    } else {
      const newCustom = userRef.current !== undefined ? userRef.current[fatigueStatus['fatigue']].type : ""
      setFatigueControl(newCustom)
    }

  }

  return (
    <Paper className={'page start-container'} square={true}>
      <Header runtime={runtime} status={status} />
      {fatigueControl !== "" ?
        <ParkingAlert custom={fatigueControl}/>
        : <Trivia trivia={trivia}/>}

      <Footer />
    </Paper>
  )
}

export default Start
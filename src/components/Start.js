import React, {useEffect} from "react";
import useState from 'react-usestateref'
import {Link} from "react-router-dom";
import {Button, LinearProgress, Paper, Typography} from "@mui/material";

import {QuestionTime, TriviaTime, FatigueColours, FatigueStatus} from '../utils'
import '../styles/common.css'
import '../styles/start.css'

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

const Trivia = ({trivia, answerSpoken, setAnswerSpoken}) => {
  if (trivia.question === undefined || trivia.time >= 90) {
    return <div></div>
  }

  if (trivia.time <= QuestionTime) {
    return (
      <div className={"trivia"}>
        <Typography variant={'h3'}>
          {`Q: ${trivia["question"]}`}
        </Typography>
        <LinearProgress variant="determinate" value={trivia.time / QuestionTime * 100} />
      </div>
    )
  } else if (trivia.time <= TriviaTime) {
    if (!answerSpoken) {
      const utterance = new SpeechSynthesisUtterance(trivia["answer"]);
      window.speechSynthesis.speak(utterance);
      setAnswerSpoken(true)
    }
    return (
      <div className={"trivia"}>
        <Typography variant={'h3'}>
          {`A: ${trivia["answer"]}`}
        </Typography>
        <LinearProgress variant="determinate" value={(trivia.time - QuestionTime) / (TriviaTime - QuestionTime) * 100} />
      </div>
    )
  }
  return <div></div>
}


const Footer = () => {
  return (
    <div className={'start-footer'}>
      <Button className={'skinny-button'} component={Link} to={"/"} variant={"contained"} color={"primary"}>
        Stop
      </Button>
    </div>
  )
}


const Start = () => {
  const [runtime, setRuntime] = useState(0)
  const [status, setStatus] = useState('F0')
  const [trivia, setTrivia, triviaRef] = useState({})
  const [answerSpoken, setAnswerSpoken] = useState(true)

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

  useEffect(() => {
    let eventSource = new EventSource('http://localhost:3002/stream')
    console.log("STARTED EVENTSOURCE", eventSource)
    eventSource.onmessage = e => {
      console.log("RECEIVED MESSAGE", e)

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



  const updateTrivia = (rawTrivia) => {
    rawTrivia.time = 0
    const utterance = new SpeechSynthesisUtterance(rawTrivia["question"]);
    window.speechSynthesis.speak(utterance);
    setTrivia(rawTrivia)
    setAnswerSpoken(false)
  }

  const updateFatigueLevel = (fatigueStatus) => {
    setStatus(fatigueStatus['fatigue'])
  }


  return (
    <Paper className={'page start-container'} square={true}>
      <Header runtime={runtime} status={status} />
      <Trivia trivia={trivia} answerSpoken={answerSpoken} setAnswerSpoken={setAnswerSpoken}/>
      <Footer />
    </Paper>
  )
}

export default Start
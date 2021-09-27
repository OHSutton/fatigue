import React, {useEffect, useState} from "react"
import { Link } from "react-router-dom";

import {Paper, Typography, IconButton, Select, MenuItem, FormControl, InputLabel, Button} from "@mui/material";
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SettingsIcon from '@mui/icons-material/Settings';

import "../styles/settings.css"
import userService from '../services/users'
import {Guest} from "../utils"

const TitleBar = ({user}) => {
  return (
    <div className={"title-bar"}>

      <IconButton component={Link} to={"/"} aria-label={"back"} size={"large"}>
        <ArrowBackRoundedIcon sx={{fontSize: 40}}/>
      </IconButton>

      <Typography variant={'h3'} style={{"margin": 0}} gutterBottom>
        {user.name}'s Settings
      </Typography>
      <IconButton aria-label={"back"} size={"large"} style={{"visibility": "hidden"}}>
        <ArrowBackRoundedIcon sx={{fontSize: 40}}/>
      </IconButton>
    </div>
  )
}

const Configurable = ({name, configId, user, onChange}) => {
  return (
    <div className={"configurable"}>
      <Typography variant={'h5'} style={{"fontSize": 20}} gutterBottom>
        {name}
      </Typography>

      <FormControl sx={{width: 250}}>
        <InputLabel id={`${configId}-label`}>Fatigue Response</InputLabel>
        <Select
          labelId={`${configId}-label`}
          id={configId}
          value={user[configId]}
          label={"Fatigue Response"}
          onChange={(event) => {onChange(event, configId)}}
        >
          <MenuItem value={"auditory"}>Auditory Tones</MenuItem>
          <MenuItem value={"vibrator"}>Vibrations</MenuItem>
          <MenuItem value={"trivia"}>Trivia</MenuItem>
          <MenuItem value={"parking"}>Parking Suggestions</MenuItem>
        </Select>
      </FormControl>

      <IconButton aria-label={"configure"} size={"large"}>
        <SettingsIcon fontSize={'inherit'}/>
      </IconButton>
    </div>
  )
}

const Settings = () => {
  const [user, setUser] = useState(Guest)

  useEffect(() => {
    userService
      .getCurrentUser()
      .then(curUser => {
        setUser(curUser)
      })
  }, [])

  const recordSelection = (event, selectionId) => {
    const newUser = {...user, [selectionId]: event.target.value}
    userService.updateUser(newUser.id, newUser).then(r => setUser(r))
  }

  const reset = () => {
    const newUser = {...Guest, id: user.id, name: user.name}
    userService.updateUser(newUser.id, newUser).then(r => setUser(r))
  }

  return (
    <Paper className={"page"}>
      <TitleBar user={user}/>

      <div>
        <Configurable name={"Slightly Fatigued"} configId={"F1"} user={user} onChange={recordSelection} />
        <Configurable name={"Fatigued"} configId={"F2"} user={user} onChange={recordSelection} />
        <Configurable name={"Very Fatigued"} configId={"F3"} user={user} onChange={recordSelection} />
        <Configurable name={"Extremely Fatigued"} configId={"F4"} user={user} onChange={recordSelection} />
      </div>
      <div style={{display: "flex", justifyContent: 'flex-end'}}>
        <Button variant={"outlined"} size={"large"} style={{marginRight: 10}} onClick={reset}>Reset</Button>
      </div>

    </Paper>
  )
}

export default Settings
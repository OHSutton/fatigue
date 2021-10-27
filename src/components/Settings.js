import React, {useEffect, useState} from "react"
import { Link } from "react-router-dom";

import {
  Paper,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Modal,
  Box,
  Slider, Stack
} from "@mui/material";

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SettingsIcon from '@mui/icons-material/Settings';

import "../styles/settings.css"
import userService from '../services/users'
import {Guest} from "../utils"
import {Vibration, VolumeDown, VolumeUp} from "@mui/icons-material";


const canConfigure = (user, setting) => {
  return user[setting].type !== 'parking';
}

// Settings title: X's Name
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

// Component containing a setting's drop down menu + slider display button
const ConfigDropdown = ({configId, user, onChange, handleOpen}) => {
  return (
    <div>
      <FormControl sx={{width: 250}}>
        <InputLabel id={`${configId}-label`}>Fatigue Response</InputLabel>
        <Select
          labelId={`${configId}-label`}
          id={configId}
          value={user[configId].type}
          label={"Fatigue Response"}
          onChange={(event) => {onChange(event, configId)}}
        >
          <MenuItem value={"auditory"}>Auditory Tones</MenuItem>
          <MenuItem value={"vibrator"}>Vibrations</MenuItem>
          <MenuItem value={"trivia"}>Trivia</MenuItem>
          <MenuItem value={"parking"}>Parking Suggestions</MenuItem>
        </Select>
      </FormControl>

      <IconButton style={{visibility: canConfigure(user, configId) ? 'visible' : 'hidden'}}
                  aria-label={"configure"} size={"large"} onClick={handleOpen(configId)}>
        <SettingsIcon fontSize={'inherit'}/>
      </IconButton>

    </div>
  )
}

// Component containing a name + setting drop down
const Configurable = ({name, configId, user, onChange, handleOpen}) => {
  return (
    <div className={"configurable"}>
      <Typography variant={'h5'} style={{"fontSize": 20, 'marginRight': 10}} gutterBottom>
        {name}
      </Typography>

      <ConfigDropdown configId={configId} user={user} onChange={onChange} handleOpen={handleOpen}/>

    </div>
  )
}

const Settings = () => {
  const [user, setUser] = useState(Guest)
  const [open, setOpen] = useState(false);
  const [sliderVal, setSliderVal] = useState(100);
  const [sliderSetting, setSliderSetting] = useState('F1');

  // handle open slider popup
  const handleOpen = (configId) => {
    return () => {
      setSliderSetting(configId)
      setSliderVal(user[configId].level)
      setOpen(true);
    }
  }

  // handle close slider popup
  const handleClose = () => {
    const newUser = {
      ...user,
      [sliderSetting]: {
        type: user[sliderSetting].type,
        level: sliderVal,
      }
    }
    userService.updateUser(newUser.id, newUser).then(r => setUser(r))
    setOpen(false)
  }

  // fetch current user
  useEffect(() => {
    userService
      .getCurrentUser()
      .then(curUser => {
        setUser(curUser)
      })
  }, [])

  // update current user when modifying user settings
  useEffect(() => {
    return () => {
      // update current-user in db
      userService.setCurrentUser(user).then(r => {
        console.log("SET CURRENT USER,", r)
      })
    }
  }, [user])

  // update when selecting drop down
  const recordSelection = (event, selectionId) => {
    const newUser = {...user,
      [selectionId]: {
      type: event.target.value
      }
    }
    if (event.target.value !== 'parking') {
      newUser[selectionId].level = 100
    }
    userService.updateUser(newUser.id, newUser).then(r => setUser(r))
  }

  // reset settings to default
  const reset = () => {
    const newUser = {...Guest, id: user.id, name: user.name}
    userService.updateUser(newUser.id, newUser).then(r => {
      setUser(newUser)
    })
  }

  // enable slider to move
  const updateSlider = (event, newValue) => {
    setSliderVal(newValue)
  }

  return (
    <Paper className={"page"}>
      <TitleBar user={user}/>

      <div>
        <Configurable name={"Slightly Fatigued"} configId={"F1"} user={user} onChange={recordSelection} handleOpen={handleOpen}/>
        <Configurable name={"Fatigued"} configId={"F2"} user={user} onChange={recordSelection} handleOpen={handleOpen}/>
        <Configurable name={"Very Fatigued"} configId={"F3"} user={user} onChange={recordSelection} handleOpen={handleOpen}/>
        <Configurable name={"Extremely Fatigued"} configId={"F4"} user={user} onChange={recordSelection} handleOpen={handleOpen}/>
      </div>
      <div style={{display: "flex", justifyContent: 'flex-end'}}>
        <Button variant={"outlined"} size={"medium"} style={{marginRight: 10}} onClick={reset}>Reset</Button>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className={'modal-box-style'}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {user[sliderSetting].type === 'vibrator' ? "Vibration Strength" : "Sound Level"}
          </Typography>
          <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
            {user[sliderSetting].type === "vibrator" ? null : <VolumeDown />}
            <Slider value={sliderVal} onChange={updateSlider}/>
            {user[sliderSetting].type === "vibrator" ? <Vibration /> : <VolumeUp /> }
          </Stack>
        </Box>
      </Modal>
    </Paper>
  )
}

export default Settings
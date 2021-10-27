import React, {useEffect, useState} from "react"
import { Link } from "react-router-dom";

import {Paper, Button, InputLabel, Select, MenuItem, FormControl} from "@mui/material";

import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';


import userService from "../services/users";
import {Guest} from "../utils";
import '../styles/common.css'
import '../styles/homescreen.css'
import logo from '../pics/final_no_bg_64x.png'


// Contains logo & drop-down to select user
const Header = ({users, currentUser, updateCurrentUser}) => {
  const menuItems = users.map(user =>
    <MenuItem key={user.name} value={user.name}>{user.name}</MenuItem>
  )

  return (
    <div className={'header'}>
      <img src={logo}  alt={"eye spy logo"} className={'logo'}/>
      <div className={'drop-down'}>
        <FormControl sx={{width: 200}} >
          <InputLabel id={`change-current-user`}>Change User</InputLabel>
          <Select
            labelId={`change-current-user`}
            id={currentUser.id.toString()}
            value={currentUser.name}
            label={"Change User"}
            onChange={(event) => {updateCurrentUser(event)}}
          >
            {menuItems}
          </Select>
        </FormControl>
      </div>

    </div>
  )
}

// Component for the two buttons
const ControlPanel = () => {
  return (
    <div className={'homescreen-buttons'}>
      <Button className={'big-button'} component={Link} to={"/start"} variant={"contained"} color={"primary"}
              startIcon={<PlayArrowRoundedIcon />}>
        Start
      </Button>
      <Button className={'big-button'} component={Link} to={"/settings"} variant={"contained"} color={"secondary"}
              startIcon={<SettingsRoundedIcon />}>
        Settings
      </Button>
    </div>
  )
}

// Home screen for user. Contains links to settings & start & can change user.
const Homescreen = () => {
  const [currentUser, setCurrentUser] = useState(Guest)
  const [allUsers, setAllUsers] = useState([Guest])

  // Get all users
  useEffect(() => {
    userService
      .getAllUsers()
      .then(users => {
        console.log("Fetched all users", users)
        setAllUsers(users)
      })
  }, [])

  // Get current user
  useEffect(() => {
    userService
      .getCurrentUser()
      .then(user => {
        console.log("Fetched user", user)
        setCurrentUser(user)
      })
  }, [])

  // Updates current user on drop-down select
  const updateCurrentUser = (event) => {
    let newCurrent = allUsers.find(user =>
      user.name === event.target.value
    )
    userService.setCurrentUser(newCurrent)
      .then(resp => {
       setCurrentUser(resp)
    })
  }


  return (
    <Paper className={'page homescreen-spaced'} square={true}>
      <Header users={allUsers} currentUser={currentUser} updateCurrentUser={updateCurrentUser} />
      <ControlPanel />
    </Paper>
  )
}


export default Homescreen
import React, {useEffect, useState} from "react"
import { Link } from "react-router-dom";
import {Paper, Button} from "@mui/material";
import {makeStyles} from "@mui/styles";

import userService from "../services/users";
import {Guest} from "../utils";


const useStyles = makeStyles({
  page: {
    width: 800,
    height: 480,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    rowGap: 10,
  },

  homeButton: {
    width: 300,
    height: 100,
  }
});


const Homescreen = () => {
  const [currentUser, setCurrentUser] = useState(Guest)
  const [allUsers, setAllUsers] = useState([])

  let currentUserId = localStorage.getItem('currentUserId')

  if (!currentUserId) {
    localStorage.setItem('currentUserId', '0') // Set to default Guest user
    currentUserId = 0
  } else {
    currentUserId = parseInt(currentUserId)
  }

  // Get current user
  useEffect(() => {
    userService
      .getUserById(currentUserId)
      .then(user => {
        console.log("Fetched user", user)
        setCurrentUser(user)
      })
  }, [currentUserId])
  // Get all users
  useEffect(() => {
    userService
      .getAllUsers()
      .then(users => {
        console.log("Fetched all users", users)
        setAllUsers(users)
      })
  }, [])


  const classes = useStyles();
  return (
    <Paper className={classes.page} square={true}>
      <Button className={classes.homeButton} component={Link} to={"/start"} variant={"contained"} color={"primary"}>
        Start
      </Button>
      <Button className={classes.homeButton} component={Link} to={"/settings"} variant={"contained"} color={"secondary"}>
        Settings
      </Button>
    </Paper>
  )
}


export default Homescreen
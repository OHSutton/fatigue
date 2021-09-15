import React from "react"
import Button from '@material-ui/core/Button';
import { Link } from "react-router-dom";
import {Paper} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";


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
  const classes = useStyles();
  return (
    <Paper className={classes.page} square={true}>
      <Button className={classes.homeButton} component={Link} to={"/start"} variant={"contained"} color={"primary"}>
        Start
      </Button>
      <Button className={classes.homeButton} component={Link} to={"/settings"} variant={"contained"} color={"secondary"} size={'large'}>
        Settings
      </Button>
    </Paper>
  )
}


export default Homescreen
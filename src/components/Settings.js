import React from "react"
import Button from '@material-ui/core/Button';
import { Link } from "react-router-dom";

const Settings = () => {
  return (
    <div className={"page"}>
      <Button component={Link} to={"/"} variant={"contained"} color={"primary"}>
        Return to Home
      </Button>
    </div>
  )
}


export default Settings
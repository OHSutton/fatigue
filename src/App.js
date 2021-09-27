import React from 'react'

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import { ThemeProvider } from '@mui/material/styles';

import Homescreen from "./components/Homescreen";
import Start from "./components/Start";
import Settings from "./components/Settings";
import Calibrate from "./components/Calibrate"

import SiteTheme from "./styles/Theme";



function App() {

  return (
    <ThemeProvider theme={SiteTheme}>
      <div>
        <Router>
          <Switch>
            <Route path={"/"} exact component={() => <Homescreen />} />
            <Route path={"/start"} exact component={() => <Start />} />
            <Route path={"/settings"} exact component={() => <Settings />} />
            <Route path={"/calibrate"} exact component={() => <Calibrate />} />
          </Switch>
        </Router>
      </div>
    </ThemeProvider>
  );
}

export default App;

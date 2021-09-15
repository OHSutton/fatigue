import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ThemeProvider } from '@material-ui/core/styles';

import Homescreen from "./components/Homescreen";
import Start from "./components/Start";
import Settings from "./components/Settings";
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
            {/* Add other routes here */}
          </Switch>
        </Router>
      </div>
    </ThemeProvider>
  );
}

export default App;

import React from 'react';
import { createTheme } from '@material-ui/core/styles';


const SiteTheme = createTheme({
  palette: {
    type: "light",
    primary: {
      main: '#EC4E20'
    },
    secondary: {
      main: '#0000008A' // 8A approx 54% alpha
    }
  }
})

export default SiteTheme
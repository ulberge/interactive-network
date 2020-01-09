import React from 'react';
import ReactDOM from 'react-dom';

import { Router, Route, Redirect } from 'react-router-dom';
import { createHashHistory } from 'history';

import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';

import './index.css';
import * as serviceWorker from './serviceWorker';

import GaborExplorer from './components/Gabor/Explorer';
import DrawSketchANet from './components/Draw/SketchANet';
import DrawSmartCanvas from './components/Draw/SmartCanvas';
import DrawBox from './components/Draw/Box';

const theme = createMuiTheme({
  palette: {
    primary: grey,
  },
});
const history = createHashHistory();

ReactDOM.render(
  (<ThemeProvider theme={theme}>
    <Router onUpdate={() => window.scrollTo(0, 0)} history={history}>
      <Route
        name="Gabor Explorer"
        path="/gabor"
        component={GaborExplorer}
      />
      <Route
        name="DrawSketchANet"
        path="/draw"
        component={DrawSketchANet}
      />
      <Route
        name="Smart Canvas"
        path="/smartcanvas"
        component={DrawSmartCanvas}
      />
      <Route
        name="Draw Box"
        path="/drawbox"
        component={DrawBox}
      />
      <Redirect path="*" to="/drawbox" />
    </Router>
  </ThemeProvider>),
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

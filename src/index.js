import React from 'react';
import ReactDOM from 'react-dom';

import { Router, Route, Redirect, Switch } from 'react-router-dom';
import { createHashHistory } from 'history';

import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';

import './index.css';
import * as serviceWorker from './serviceWorker';

import Layout from './components/Page/Layout';
import KernelsTuner from './components/Kernels/Tuner';
import SmartCanvasDebug from './components/SmartCanvas/Debug';

const theme = createMuiTheme({
  palette: {
    primary: grey,
  },
});
const history = createHashHistory();

ReactDOM.render(
  (<ThemeProvider theme={theme}>
    <Router onUpdate={() => window.scrollTo(0, 0)} history={history}>
      <Layout>
        <Switch>
          <Route
            name="Kernels Tuner"
            path="/kernels"
            component={KernelsTuner}
          />
          <Route
            name="Smart Canvas"
            path="/smartcanvas"
            component={SmartCanvasDebug}
          />
          <Redirect path="*" to="/kernels" />
        </Switch>
      </Layout>
    </Router>
  </ThemeProvider>),
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

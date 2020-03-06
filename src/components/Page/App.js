import React, { useState, useEffect } from 'react';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';
import { kernelTypes } from '../../js/kernel';
import { Router, Route, Redirect, Switch } from 'react-router-dom';
import { createHashHistory } from 'history';
import Layout from '../Page/Layout';
import KernelTuner from '../KernelTuner/KernelTuner';
import NetworkBuilder from '../NetworkBuilder/NetworkBuilder';
import Collage from '../Collage/Collage';

const history = createHashHistory();
const theme = createMuiTheme({
  palette: {
    primary: grey,
  },
});

// Default kernel settings on first page load
const defaultKernelSettings = {
  numComponents: 2, // actual num is 2^numComponents
  lambda: 4.9,
  sigma: 3.3,
  windowSize: 9,
  types: [kernelTypes[0], kernelTypes[2]]
};
// Check the saved kernel settings have not been corrupted somehow
function areValidKernelSettings(kernelSettings) {
  if (!kernelSettings) {
    return false;
  }
  const { numComponents, lambda, sigma, windowSize, types } = kernelSettings;
  if (isNaN(numComponents) || isNaN(lambda) || isNaN(sigma) || isNaN(windowSize)) {
    return false;
  }
  if (!Array.isArray(types) || types.length === 0) {
    return false;
  }
  for (const kernelType of types) {
    if (!kernelTypes.includes(kernelType)) {
      // invalid type
      return false;
    }
  }
  return true;
}
const storageKey = 'kernelSettings';
const storedSettings = JSON.parse(localStorage.getItem(storageKey));
const initialKernelSettings = areValidKernelSettings(storedSettings) ? storedSettings : defaultKernelSettings;

export default function App() {
  const [ kernelSettings, updateKernelSettings ] = useState(initialKernelSettings);

  // save kernel settings on change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(kernelSettings));
  }, [ kernelSettings ]);

  return (
    <ThemeProvider theme={theme}>
      <Router onUpdate={() => window.scrollTo(0, 0)} history={history}>
        <Layout>
          <Switch>
            <Route
              name="Kernel Tuner"
              path="/tuner"
              render={() => (
                <KernelTuner kernelSettings={kernelSettings} updateKernelSettings={updateKernelSettings} />
              )}
            />
            <Route
              name="Network Builder"
              path="/builder"
              render={() => (
                <NetworkBuilder kernelSettings={kernelSettings} />
              )}
            />
            <Route
              name="Collage"
              path="/collage"
              render={() => (
                <Collage />
              )}
            />
            <Redirect path="*" to="/builder" />
          </Switch>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

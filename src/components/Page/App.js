import React, { useState, useEffect, useMemo } from 'react';

import { Router, Route, Redirect, Switch } from 'react-router-dom';
import { createHashHistory } from 'history';

import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';

import Layout from '../Page/Layout';
import KernelsMainView from '../Kernels/MainView';
import SmartCanvasMainView from '../SmartCanvas/MainView';
import DrawMainView from '../Draw/MainView';

import { getKernels } from '../../js/kernel';
import { getLayer } from '../../js/tfhelpers';

const theme = createMuiTheme({
  palette: {
    primary: grey,
  },
});
const history = createHashHistory();

const defaultKernelSettings = JSON.parse(localStorage.getItem('kernel_settings')) || {
  numComponents: 2, // power of 2
  lambda: 6.3,
  sigma: 3,
  windowSize: 9
};

export default function App() {

  const [ kernelSettings, updateKernelSettings ] = useState(defaultKernelSettings);

  const kernels = useMemo(() => {
    const { numComponents, lambda, sigma, windowSize } = kernelSettings;
    const kernels = getKernels(windowSize, 2 ** numComponents, lambda, sigma);
    return kernels;
  }, [ kernelSettings ]);

  const firstLayer = useMemo(() => {
    if (kernels && kernels.length > 0) {
      const firstLayer = getLayer(kernels.map(k => [k]), 0);
      return firstLayer;
    }
    return null;
  }, [ kernels ]);

  useEffect(() => {
    // save values
    localStorage.setItem('kernel_settings', JSON.stringify(kernelSettings));
  }, [ kernelSettings ]);

  return (
    <ThemeProvider theme={theme}>
      <Router onUpdate={() => window.scrollTo(0, 0)} history={history}>
        <Layout>
          <Switch>
            <Route
              name="Kernels Tuner"
              path="/kernels"
              render={() => <KernelsMainView
                              kernelSettings={kernelSettings}
                              updateKernelSettings={updateKernelSettings}
                              kernels={kernels}
                              firstLayer={firstLayer}
                            />}
            />
            <Route
              name="Smart Canvas"
              path="/smartcanvas"
              render={() => <SmartCanvasMainView kernels={kernels} firstLayer={firstLayer} />}
            />
            <Route
              name="Draw"
              path="/draw"
              render={() => <DrawMainView firstLayer={firstLayer} kernels={kernels} />}
            />
            <Redirect path="*" to="/draw" />
          </Switch>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

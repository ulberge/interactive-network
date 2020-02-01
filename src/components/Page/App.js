import React, { useState, useEffect } from 'react';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';
import KernelsPage from './KernelsPage';

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
  types: ['l', 'L', 'T', 'X'] // 'l', 'i', 'L', 'T', 'X', 'Y'
};
const storageKey = 'kernelSettings';
const initialKernelSettings = JSON.parse(localStorage.getItem(storageKey)) || defaultKernelSettings;

export default function App() {
  const [ kernelSettings, updateKernelSettings ] = useState(initialKernelSettings);

  // save kernel settings on change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(kernelSettings));
  }, [ kernelSettings ]);

  return (
    <ThemeProvider theme={theme}>
      <KernelsPage kernelSettings={kernelSettings} updateKernelSettings={updateKernelSettings} />
    </ThemeProvider>
  );
}

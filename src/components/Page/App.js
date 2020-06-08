import React, { useState, useEffect } from 'react';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';
import KernelTuner from '../KernelTuner/KernelTuner';
import { kernelTypes } from '../../js/kernel';

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
  windowSize: 7,
  types: [kernelTypes[0], kernelTypes[1]]
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
      <KernelTuner kernelSettings={kernelSettings} updateKernelSettings={updateKernelSettings} />
    </ThemeProvider>
  );
}

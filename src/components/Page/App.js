import React, { useState, useEffect } from 'react';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';
import KernelTuner from '../KernelTuner/KernelTuner';
import KernelInspector from '../KernelInspector/KernelInspector';
import Container from '@material-ui/core/Container';

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
// Check the saved kernel settings have not been corrupted somehow
function areValidKernelSettings(kernelSettings) {
  if (!kernelSettings) {
    return false;
  }
  const { numComponents, lambda, sigma, windowSize, types } = kernelSettings;
  if (isNaN(numComponents) || isNaN(lambda) || isNaN(sigma) || isNaN(windowSize) || !Array.isArray(types) || types.length === 0) {
    return false;
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
      <Container maxWidth="md">
        <KernelTuner defaultKernelSettings={kernelSettings} updateKernelSettings={updateKernelSettings} />
      </Container>
      <Container maxWidth="lg" style={{ marginTop: '40px' }}>
        <KernelInspector kernelSettings={kernelSettings} />
      </Container>
    </ThemeProvider>
  );
}

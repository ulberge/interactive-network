import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import './index.css';
// import App from './App';
import App2 from './App2';
import * as serviceWorker from './serviceWorker';
// import { loadLayer1, newLayer } from './neuralNetwork';


// const layer1 = loadLayer1();
// const layer2 = newLayer();
// const layers = [layer1, layer2];
// const initData = {
//   layers
// };

const theme = createMuiTheme({
  palette: {
    type: 'dark',
  },
});

ReactDOM.render(
  // (<ThemeProvider theme={theme}><App initData={initData} /></ThemeProvider>),
  (<ThemeProvider theme={theme}><App2 /></ThemeProvider>),
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import * as serviceWorker from './serviceWorker';

import App from './components/Page/App';

// console.log = function(){};

// Import @tensorflow/tfjs or @tensorflow/tfjs-core
import * as tf from '@tensorflow/tfjs';
// Adds the WASM backend to the global backend registry.
import {setWasmPath} from '@tensorflow/tfjs-backend-wasm';
setWasmPath('/tfjs-backend-wasm.wasm'); // or tf.wasm.setWasmPath when using <script> tags.

tf.setBackend('cpu').then(() => main());

function main() {
  ReactDOM.render(
    (<App />),
    document.getElementById('root')
  );

  // If you want your app to work offline and load faster, you can change
  // unregister() to register() below. Note this comes with some pitfalls.
  // Learn more about service workers: https://bit.ly/CRA-PWA
  serviceWorker.unregister();
}


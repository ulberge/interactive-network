import React, { Component } from 'react';

import './App.css';

import Network from './Network';

import loadLayer1 from './neuralNetwork';

export default class App extends Component {
  render() {
    const layer1 = loadLayer1();
    debugger;

    return (
      <div className="App">
        <header className="App-header">
          Network Trainer
        </header>
        <div>
          <Network />
        </div>
      </div>
    );
  }
}

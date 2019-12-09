import React, { Component } from 'react';

import './App2.css';
import Grid from '@material-ui/core/Grid';

import EditNeuron from './EditNeuron';
import Network from './Network';
import ConvNet from './convnet';
import getLayers from './layers';

const layers = getLayers();

export default class App extends Component {
  state = {
    layers: layers,
    layerIndex: 2,
    neuronIndex: 0
  }

  update(kernelIndex, imgArr) {
    const { layers, layerIndex, neuronIndex } = this.state;
    const updated = {
      ...layers
    };
    updated[layerIndex].weights[neuronIndex][kernelIndex] = imgArr;
    this.setState({
      layers: updated
    });
  }

  render() {
    const { layers, layerIndex, neuronIndex } = this.state;

    // compile model
    const convnet = new ConvNet(layers);

    return (
      <div className="App" style={{ margin: '20px' }}>
        <Grid container justify="center" spacing={2} style={{ flexGrow: 1 }} className="editNeuronContainer">
          <Grid item>
            <EditNeuron layers={layers} layerIndex={layerIndex} neuronIndex={neuronIndex} convnet={convnet} onChange={(kernelIndex, imgArr) => this.update(kernelIndex, imgArr)} />
          </Grid>
        </Grid>
        <Grid container justify="center" spacing={2} style={{ flexGrow: 1 }} className="networkContainer">
          <Grid item>
            {/*<Network layers={layers} convnet={convnet} selectNeuron={(layerIndex, neuronIndex) => this.setState({ layerIndex, neuronIndex })} />*/}
          </Grid>
        </Grid>
      </div>
    );
  }
}

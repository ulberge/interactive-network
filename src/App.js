import React, { Component } from 'react';

import './App.css';
import Grid from '@material-ui/core/Grid';

import EditNeuron from './EditNeuron';
import Network from './Network';
import ConvNet from './convnet';
import getLayers from './layers';

// import CompressionTest from './CompressionTest';


const layers = getLayers();

export default class App extends Component {
  state = {
    layers: layers,
    layerIndex: 1,
    neuronIndex: 0
  }

  update(kernelIndex, imgArr) {
    if (this.registerChange) {
      clearTimeout(this.registerChange);
    }
    this.registerChange = setTimeout(() => {
      const { layers, layerIndex, neuronIndex } = this.state;
      const updated = [
        ...layers
      ];
      updated[layerIndex].weights[neuronIndex][kernelIndex] = imgArr;
      this.setState({
        layers: updated
      });
    }, 200);
  }

  selectNeuron(layerIndex, neuronIndex) {
    this.setState({ layerIndex, neuronIndex });
  }

  render() {
    const { layers, layerIndex, neuronIndex } = this.state;

    // compile model
    const convnet = new ConvNet(layers);

    return (
      <div className="App" style={{ margin: '20px' }}>
        <Grid container justify="center" spacing={2} style={{ flexGrow: 1 }} className="editNeuronContainer">
          <Grid item>
            { layerIndex === 1
              ? <EditNeuron key={1} layers={layers} layerIndex={layerIndex} neuronIndex={neuronIndex} convnet={convnet} onChange={(kernelIndex, imgArr) => this.update(kernelIndex, imgArr)} />
              : <EditNeuron key={2} layers={layers} layerIndex={layerIndex} neuronIndex={neuronIndex} convnet={convnet} onChange={(kernelIndex, imgArr) => this.update(kernelIndex, imgArr)} />
            }
          </Grid>
        </Grid>
        <Grid container justify="center" spacing={2} style={{ flexGrow: 1 }} className="networkContainer">
          <Grid item>
            <Network layers={layers} convnet={convnet} selectNeuron={(layerIndex, neuronIndex) => this.selectNeuron(layerIndex, neuronIndex)} layerIndex={layerIndex} neuronIndex={neuronIndex} />
          </Grid>
        </Grid>
      </div>
    );
  }
}

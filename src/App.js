import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

import './App.css';

import NeuronInfo from './NeuronInfo';
import Layer from './Layer';
import NewLayer from './NewLayer';
import Corpus from './Corpus';
import MakeData from './MakeData';
import ArrayToImage from './ArrayToImage';
import TrainIcon from '@material-ui/icons/Train';
import IconButton from '@material-ui/core/IconButton';

import { train } from './neuralNetwork';

/* global corpus */

const paperStyle = {
  padding: '10px 20px 40px'
};

export default class App extends Component {
  state = {
    layerIndex: 1,
    neuronIndex: 0,
    layers: this.props.initData.layers,
    data: []
  }

  addImages(imgs, label) {
    imgs = imgs.map(img => [img, label]);
    console.log(this.state.data.length);
    this.setState({
      data: [...this.state.data, ...imgs]
    });
  }

  async train() {
    const { layers, layerIndex, neuronIndex, data } = this.state;
    // compile the model using the previous layers and the current neuron and add a layer at the end?
    const updatedLayer = await train(layers, layerIndex, neuronIndex, data);

    // update the neuron weights with what we learned...
    this.setState({
      layers: [...this.state.layers.splice(0, 1), updatedLayer]
    });
  }

  render() {
    const { layers, layerIndex, neuronIndex, data } = this.state;
    console.log('rerender!', data);

    return (
      <div className="App">
        <Grid container spacing={2} justify="center" style={{ marginTop: '20px' }}>
          <Grid item xs={12} style={{ display: 'flex' }} >
            <Grid container justify="center" spacing={2} style={{ flexGrow: 1 }}>
              <Grid item xs={6}>
                <Paper style={paperStyle}>
                  <h3>Network</h3>
                  { layers.map((layer, i) => (<Layer key={i} layer={layer} selectedIndex={ layerIndex === i ? neuronIndex : null } selectNeuron={neuronIndex => this.setState({ layerIndex: i, neuronIndex })} />)) }
                  <NewLayer />
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper style={paperStyle}>
                  <h3>Neuron Info</h3>
                  <NeuronInfo layer={layers[layerIndex]} layerIndex={layerIndex} neuronIndex={neuronIndex} />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} style={{ display: 'flex' }} >
            <Grid container justify="center" spacing={2} style={{ flexGrow: 1 }}>
              <Grid item xs={6}>
                <Paper style={paperStyle}>
                  <h3>Make Data</h3>
                  <MakeData imgs={data} addImages={(imgs, label) => this.addImages(imgs, label)} />
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper style={paperStyle}>
                  <h3>Corpus</h3>
                  <Corpus imgs={corpus} addImages={(imgs, label) => this.addImages(imgs, label)} />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} style={{ display: 'flex' }} >
            <Grid container justify="center" spacing={2} style={{ flexGrow: 1 }}>
              <Grid item xs={9}>
                <Paper style={paperStyle}>
                  <h3>
                    <span>Trainer</span>
                    <IconButton aria-label="train" color="secondary" onClick={() => this.train()} style={{ marginLeft: '20px' }}>
                      <TrainIcon />
                    </IconButton>
                    <span id="epochCounter"></span>
                  </h3>
                  <Grid container justify="center" spacing={2} style={{ flexGrow: 1 }}>
                    <Grid item xs={6}>
                      <h4>Positive</h4>
                      <div style={{ textAlign: 'left' }}>
                        { data ? data.filter(d => d[1] === 1).map((d, i) => (<ArrayToImage key={i} imgArr={d[0]} />)) : null }
                      </div>
                    </Grid>
                    <Grid item xs={6}>
                      <h4>Negative</h4>
                      <div style={{ textAlign: 'left' }}>
                        { data ? data.filter(d => d[1] === 0).map((d, i) => (<ArrayToImage key={i} imgArr={d[0]} />)) : null }
                      </div>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
}

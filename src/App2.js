import React, { Component } from 'react';

import './App2.css';

import EditNeuron from './EditNeuron';
import ConvNet from './convnet';
import Grid from '@material-ui/core/Grid';

export default class App extends Component {
  state = {
    weights: {
      'L1': [
        [  // Filter vertical
          [  // Ch 0
              [0, 0, 1, 0, 0],
              [0, 0, 1, 0, 0],
              [0, 0, 1, 0, 0],
              [0, 0, 1, 0, 0],
              [0, 0, 1, 0, 0],
          ]
        ],
        [  // Filter horizontal
          [  // Ch 0
              [0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0],
              [1, 1, 1, 1, 1],
              [0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0],
          ]
        ],
        [  // Filter Diag1
          [  // Ch 0
              [1, 0, 0, 0, 0],
              [0, 1, 0, 0, 0],
              [0, 0, 1, 0, 0],
              [0, 0, 0, 1, 0],
              [0, 0, 0, 0, 1],
          ]
        ],
        [  // Filter Diag2
          [  // Ch 0
              [0, 0, 0, 0, 1],
              [0, 0, 0, 1, 0],
              [0, 0, 1, 0, 0],
              [0, 1, 0, 0, 0],
              [1, 0, 0, 0, 0],
          ]
        ]
      ],
      'L2': [
        [
          [
            [0.01, 0.5, 0.01],
            [0.01, 0.01, 0.01],
            [0.01, 0.01, 0.01],
          ],
          [
            [0.01, 0.01, 0.01],
            [0.01, 0.01, 0.5],
            [0.01, 0.01, 0.01],
          ],
          [
            [0.01, 0.01, 0.01],
            [0.01, 0.5, 0.01],
            [0.01, 0.01, 0.01],
          ],
          [
            [0.01, 0.01, 0.01],
            [0.01, 0.01, 0.01],
            [0.01, 0.01, 0.01],
          ]
        ]
      ]
    },
    layer: 'L2',
    layerIndex: 1,
    neuronIndex: 0
  }

  updateWeights(kernelIndex, imgArr) {
    const { weights, layer, neuronIndex } = this.state;

    const newWeights = {
      ...weights
    };
    newWeights[layer][neuronIndex][kernelIndex] = imgArr;
    this.setState({
      weights: newWeights
    });
  }

  render() {
    const { weights, layer, layerIndex, neuronIndex } = this.state;

    // compile model
    const convnet = new ConvNet(weights);

    return (
      <div className="App" style={{ margin: '20px' }}>
        <Grid container justify="center" spacing={2} style={{ flexGrow: 1 }}>
          <Grid item>
            <EditNeuron weights={ weights } layer={layer} layerIndex={layerIndex} neuronIndex={neuronIndex} convnet={convnet} onChange={(kernelIndex, imgArr) => this.updateWeights(kernelIndex, imgArr)} />
          </Grid>
        </Grid>
      </div>
    );
  }
}

import React, { Component } from 'react';

import './App2.css';
import Grid from '@material-ui/core/Grid';

import EditNeuron from './EditNeuron';
import Network from './Network';
import ConvNet from './convnet';

export default class App extends Component {
  state = {
    weights: {
      'L1': [[[[-0.572,-0.873,0.711,-0.873,-0.572],[-0.618,-0.965,0.931,-0.965,-0.618],[-0.618,-0.988,1.,-1.,-0.618],[-0.607,-0.954,0.884,-0.954,-0.607],[-0.572,-0.838,0.642,-0.85,-0.572]]],[[[-0.516,-0.56,-0.582,-0.56,-0.516],[-0.571,-0.637,-0.659,-0.637,-0.571],[0.714,0.923,1.,0.912,0.714],[-0.846,-0.967,-1.,-0.967,-0.846],[-0.308,-0.319,-0.319,-0.319,-0.308]]],[[[0.538,-0.077,-0.908,-0.344,-0.046],[-0.292,0.867,-0.005,-1.,-0.354],[-0.867,-0.354,1.,0.015,-0.897],[-0.21,-0.928,-0.385,0.826,-0.005],[-0.077,-0.2,-0.826,-0.364,0.477]]],[[[-0.005,-0.401,-0.893,0.134,0.508],[-0.401,-1.,0.23,0.85,-0.455],[-0.893,0.23,1.,-0.54,-0.775],[0.134,0.85,-0.54,-0.85,-0.112],[0.508,-0.455,-0.775,-0.112,-0.07]]]],
      'L2': [
        [
          [
            [0.5, 0.5, 0.01],
            [0.2, 0.5, 0.01],
            [0.01, 0.01, 0.01],
          ],
          [
            [0.01, 0.01, 0.01],
            [0.01, 0.01, 0.01],
            [0.01, 0.01, 0.01],
          ],
          [
            [0.1, 0.2, 0.01],
            [0.2, 0.5, 0.2],
            [0.01, 0.2, 0.5],
          ],
          [
            [0.01, 0.01, 0.01],
            [0.01, 0.01, 0.01],
            [0.01, 0.01, 0.01],
          ]
        ],
        [
          [
            [0.1, 0.5, 0.5],
            [0.1, 0.5, 0.5],
            [0.01, 0.01, 0.01],
          ],
          [
            [0.01, 0.01, 0.01],
            [0.01, 0.01, 0.01],
            [0.01, 0.01, 0.01],
          ],
          [
            [0.01, 0.01, 0.01],
            [0.01, 0.01, 0.01],
            [0.01, 0.01, 0.01],
          ],
          [
            [0.01, 0.2, 0.5],
            [0.2, 0.5, 0.2],
            [0.5, 0.2, 0.01],
          ]
        ],
        [
          [
            [0.1, 0.5, 0.1],
            [0.1, 0.5, 0.1],
            [0.01, 0.5, 0.01],
          ],
          [
            [0.01, 0.01, 0.01],
            [0.01, 0.01, 0.01],
            [0.01, 0.01, 0.01],
          ],
          [
            [0.01, 0.01, 0.01],
            [0.01, 0.01, 0.01],
            [0.01, 0.01, 0.01],
          ],
          [
            [0.01, 0.01, 0.01],
            [0.01, 0.01, 0.01],
            [0.01, 0.01, 0.01],
          ]
        ],
        [
          [
            [0.01, 0.01, 0.01],
            [0.01, 0.01, 0.01],
            [0.01, 0.01, 0.01],
          ],
          [
            [0.01, 0.01, 0.01],
            [0.5, 0.5, 0.5],
            [0.01, 0.01, 0.01],
          ],
          [
            [0.01, 0.01, 0.01],
            [0.01, 0.01, 0.01],
            [0.01, 0.01, 0.01],
          ],
          [
            [0.01, 0.01, 0.01],
            [0.01, 0.01, 0.01],
            [0.01, 0.01, 0.01],
          ]
        ]
      ],
      'L3': [
        [
          [
            [0.5, 0.5, 0.01],
            [0.2, 0.5, 0.01],
            [0.01, 0.01, 0.01],
          ],
          [
            [0.01, 0.01, 0.01],
            [0.01, 0.01, 0.01],
            [0.01, 0.01, 0.01],
          ],
          [
            [0.1, 0.2, 0.01],
            [0.2, 0.5, 0.2],
            [0.01, 0.2, 0.5],
          ],
          [
            [0.01, 0.01, 0.01],
            [0.01, 0.01, 0.01],
            [0.01, 0.01, 0.01],
          ]
        ],
      ]
    },
    layer: 'L2',
    layerIndex: 2,
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

  findMatches() {
    // in the background find better matches for each neuron
  }

  selectNeuron(layerIndex, neuronIndex) {
    const layer = 'L' + (layerIndex + 1);
    layerIndex = layerIndex === 1 ? 2 : layerIndex;

    this.setState({ layer, layerIndex, neuronIndex });
  }

  render() {
    const { weights, layer, layerIndex, neuronIndex } = this.state;

    // compile model
    const convnet = new ConvNet(weights);

    return (
      <div className="App" style={{ margin: '20px' }}>
        <Grid container justify="center" spacing={2} style={{ flexGrow: 1 }} className="editNeuronContainer">
          <Grid item>
            <EditNeuron weights={ weights } layer={layer} layerIndex={layerIndex} neuronIndex={neuronIndex} convnet={convnet} onChange={(kernelIndex, imgArr) => this.updateWeights(kernelIndex, imgArr)} />
          </Grid>
        </Grid>
        <Grid container justify="center" spacing={2} style={{ flexGrow: 1 }} className="networkContainer">
          <Grid item>
            <Network weights={weights} convnet={convnet} selectNeuron={(layerIndex, neuronIndex) => this.selectNeuron(layerIndex, neuronIndex)} />
          </Grid>
        </Grid>
      </div>
    );
  }
}

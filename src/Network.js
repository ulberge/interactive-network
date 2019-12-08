import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import SketcherMin from './SketcherMin';

const paperStyle = i => {
  return {
  };
};

const paperStyle1 = {
  padding: '3px 4px 5px 4px',
  lineHeight: '16px',
  background: '#fff',
  color: '#000',
  border: '1px solid #ababab',
  margin: '4px',
  width: '16px',
  height: '16px'
}

const paperStyle2 = {
  padding: '4px 1px 1px 4px',
  background: '#fff',
  border: '1px solid #ababab',
  margin: '4px',
  width: '64px',
  height: '64px',
}

export default class Network extends Component {

  getExamples(kernels, layerIndex, neuronIndex) {
    const { weights, convnet } = this.props;
    const examples = new Array(4).fill(0).map((v, i) => {
      return (
        <Grid item key={'sketch_' + layerIndex + '_' + neuronIndex + '_' + i}>
          <SketcherMin kernels={kernels} weights={weights} convnet={convnet} scale={1.4} layerIndex={layerIndex} neuronIndex={neuronIndex} />
        </Grid>
      )
    });

    return (<Grid container spacing={0}>{examples}</Grid>);
  }

  render() {
    const { weights, selectNeuron } = this.props;
    const layers = Object.keys(weights).map(key => weights[key]);

    return (
      <Grid container alignItems="center" spacing={2}>
        { layers.map((neurons, layerIndex) => {
          return (
            <Grid key={'layer' + layerIndex} item>
              <Grid container direction="column" alignItems="center" spacing={0}>
                { neurons.map((kernels, neuronIndex) => {
                  return layerIndex === 0
                    ? ( <div className="examples" key={'neuron_' + layerIndex + '_' + neuronIndex} style={paperStyle1}>
                        { ['|', '―', '⟍', '⟋'][neuronIndex] }
                      </div> )
                    : ( <Paper className="examples neuronLink" key={'neuron_' + layerIndex + '_' + neuronIndex} style={paperStyle2} onClick={() => selectNeuron(layerIndex, neuronIndex)}>
                      { this.getExamples(kernels, layerIndex, neuronIndex) }
                      </Paper> )
                }) }
              </Grid>
            </Grid>
          )
        }) }
      </Grid>
    );
  }
}

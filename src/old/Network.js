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

export default class Network extends Component {

  getExamples(kernels, layerIndex, neuronIndex) {
    const { layers, convnet } = this.props;

    return (
      <div className="neuronBlock">
        <div className="neuronRow">
          <SketcherMin layers={layers} convnet={convnet} scale={1.5} layerIndex={layerIndex} neuronIndex={neuronIndex} sketchIndex={0} />
          <SketcherMin layers={layers} convnet={convnet} scale={1.5} layerIndex={layerIndex} neuronIndex={neuronIndex} sketchIndex={1} />
        </div>
        <div className="neuronRow">
          <SketcherMin layers={layers} convnet={convnet} scale={1.5} layerIndex={layerIndex} neuronIndex={neuronIndex} sketchIndex={2} />
          <SketcherMin layers={layers} convnet={convnet} scale={1.5} layerIndex={layerIndex} neuronIndex={neuronIndex} sketchIndex={3} />
        </div>
      </div>
    );
  }

  render() {
    const { layers, selectNeuron, layerIndex, neuronIndex } = this.props;

    return (
      <Grid container alignItems="center" spacing={2}>
        { layers.map((layer, i) => {
          return (
            <Grid key={'layer' + i} item>
              <Grid container direction="column" alignItems="center" spacing={0}>
                { layer.weights.map((kernels, j) => {
                  return i === 0
                    ? ( <div className="examples" key={'neuron_' + i + '_' + j} style={paperStyle1}>
                        { ['|', '―', '⟍', '⟋'][j] }
                      </div> )
                    : ( <div className={'examples neuronLink ' + (layerIndex === i && neuronIndex === j ? 'selected' : '')} key={'neuron_' + i + '_' + j} onClick={() => selectNeuron(i, j)}>
                      { this.getExamples(kernels, i, j) }
                      </div> )
                }) }
              </Grid>
            </Grid>
          )
        }) }
      </Grid>
    );
  }
}

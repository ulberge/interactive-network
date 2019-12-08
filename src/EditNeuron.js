import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

import ArrayToImageEditable from './ArrayToImageEditable';
import Sketcher from './Sketcher';
import StrokeMap from './StrokeMap';

const symbols = [
  ['|', '―', '⟍', '⟋'],
  [],
  ['a', 'b', 'c', 'd']
];
const paperStyle = {
  padding: '2px 2px 0px 2px',
  background: '#fff',
  border: '1px solid #ababab',
  width: '70px'
};

export default class EditNeuron extends Component {

  render() {
    const { layer, layerIndex, neuronIndex, weights, convnet, onChange } = this.props;
    const kernels = weights[layer][neuronIndex];

    return (
      <Grid container alignItems="center" justify="flex-start" spacing={2} style={{ flexGrow: 1 }}>
        <Grid item>
          { kernels.map((kernel, i) => (
            <Grid key={i} container alignItems="center" spacing={2} style={{ flexGrow: 1 }}>
              <Grid item xs={4}>
                <span className="kernelLabel">{ symbols[layerIndex - 2][i] }</span>
              </Grid>
              <Grid item xs={4}>
                <Paper style={paperStyle}>
                  <ArrayToImageEditable imgArr={kernel} scale={20} onChange={imgArr => onChange(i, imgArr)} />
                </Paper>
              </Grid>
            </Grid>
          )) }
        </Grid>
        <Grid item>
          <Grid container alignItems="center" direction="column" spacing={2} style={{ flexGrow: 1 }}>
            <Grid item>
              <StrokeMap kernels={kernels} scale={5.49} size={19} subReceptiveField={9} stride={5} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Sketcher kernels={kernels} weights={weights} convnet={convnet} scale={5.275} layerIndex={layerIndex} neuronIndex={neuronIndex} />
        </Grid>
      </Grid>
    );
  }
}

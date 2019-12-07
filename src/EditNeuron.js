import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';

import ArrayToImageEditable from './ArrayToImageEditable';
import StrokeMap from './StrokeMap';
import Sketcher from './Sketcher';
import Paper from '@material-ui/core/Paper';

const symbols = [
  ['|', '―', '⟍', '⟋'],
  ['a', 'b', 'c', 'd']
];
const paperStyle = {
  padding: '20px',
  background: '#fff',
  border: '1px solid #ababab'
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
                <span className="kernelLabel">{ symbols[layerIndex - 1][i] }</span>
              </Grid>
              <Grid item xs={4}>
                <ArrayToImageEditable imgArr={kernel} scale={20} onChange={imgArr => onChange(i, imgArr)} />
              </Grid>
            </Grid>
          )) }
        </Grid>
       {/* <Grid item>
          <Grid container alignItems="center" direction="column" spacing={2} style={{ flexGrow: 1 }}>
            <Grid item>
              <StrokeMap kernels={kernels} scale={2.745} size={50} offset={17.5} />
            </Grid>
            <Grid item>
              <StrokeMap kernels={kernels} scale={5.49} size={25} offset={5} />
            </Grid>
          </Grid>
        </Grid>*/}
        <Grid item>
          <Paper style={paperStyle}>
            <Sketcher kernels={kernels} weights={weights} convnet={convnet} scale={5.275} />
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

import ArrayToImageEditable from './ArrayToImageEditable';
import Sketcher from './Sketcher';
import StrokeMap from './StrokeMap';

const symbols = [
  ['|', '―', '⟍', '⟋'],
  ['a', 'b', 'c', 'd'],
  ['1', '2']
];

export default class EditNeuron extends Component {

  render() {
    const { layers, layerIndex, neuronIndex, convnet, onChange } = this.props;
    const kernels = layers[layerIndex].weights[neuronIndex];

    return (
      <Grid container alignItems="center" justify="flex-start" spacing={2} style={{ flexGrow: 1 }}>
        <Grid item style={{ marginRight: '40px' }}>
          { kernels.map((kernel, i) => (
            <Grid key={i} container alignItems="center" spacing={2} style={{ flexGrow: 1 }}>
              {
                layerIndex === 1
                ? (
                  <Grid item xs={4}>
                    <span className="kernelLabel">{ symbols[layerIndex - 1][i] }</span>
                  </Grid>
                  ) : null
              }
              <Grid item xs={4}>
                <ArrayToImageEditable imgArr={kernel} scale={20} onChange={imgArr => onChange(i, imgArr)} />
              </Grid>
            </Grid>
          )) }
        </Grid>
        {/*<Grid item>
          <Grid container alignItems="center" direction="column" spacing={2} style={{ flexGrow: 1 }}>
            <Grid item>
              <StrokeMap kernels={kernels} scale={5.49} size={19} subReceptiveField={9} stride={5} />
            </Grid>
          </Grid>
        </Grid>*/}
        <Grid item>
          <Sketcher layers={layers} layerIndex={layerIndex} neuronIndex={neuronIndex} convnet={convnet} scale={5.275} />
        </Grid>
      </Grid>
    );
  }
}

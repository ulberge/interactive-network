import React, { Component } from 'react';
import ArrayToImageAbs from './../ArrayToImageAbs';
import * as tf from '@tensorflow/tfjs';
import Grid from '@material-ui/core/Grid';

/* global nj */

// Show an editable canvas, on edit, render the compressions in all the various ways:
// different kernel sizes, different kernels...
export default class CompressionTestOutput extends Component {
  eval(layer, imgArr) {
    const imgArr_f = [imgArr.map(row => row.map(col => [col]))];
    let curr = tf.tensor4d(imgArr_f);
    const result = layer.apply(curr).arraySync();

    // format output
    let out = nj.array(result[0]);
    out = out.transpose(2, 0, 1);
    return out.tolist();
  }

  render() {
    const { imgArr, filterSets, layers } = this.props;

    let outputs = [];
    if (imgArr && imgArr.length > 0) {
      outputs = layers.map(layer => this.eval(layer, imgArr));
    }

    return (
      <div>
        <Grid item>
          { filterSets.map((filterSet, setIndex) => {
            const { numChannels, Lambda, gamma, filters } = filterSet;
            const output = outputs[setIndex] || [];
            return (
              <div key={numChannels + '_' + Lambda + '_' + gamma}>
                <div>
                  <span style={{ fontSize: '8px' }}># ch: {numChannels}, L: {Lambda}, g: {gamma}  </span>
                  { filters.map((filter, i) => (<ArrayToImageAbs key={i} imgArr={ filter } scale={4} />)) }
                </div>
                <div>
                  { output.map((channel, i) => (<ArrayToImageAbs key={i} imgArr={ channel } scale={1} />)) }
                </div>
              </div>
            )
          })}
        </Grid>
      </div>
    );
  }
}

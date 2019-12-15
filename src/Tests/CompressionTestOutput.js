import React, { Component } from 'react';
import ArrayToImage from './ArrayToImage';
import * as tf from '@tensorflow/tfjs';

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
    return out.tolist()[0];
  }

  doTest(imgArr, kernel, strides=1) {
    if (!imgArr || imgArr.length === 0) {
      return null;
    }

    const weights = nj.array(kernel).transpose(2, 3, 1, 0).tolist();
    const biases = [0];
    const weightsTensor = [tf.tensor4d(weights), tf.tensor1d(biases)];
    const layer = tf.layers.conv2d({
      filters: 1,
      kernelSize: kernel[0][0].length,
      strides: strides,
      padding: 'valid',
      weights: weightsTensor,
      activation: 'relu',
      name: 'conv1'
    });

    const output = this.eval(layer, imgArr);
    return (<ArrayToImage imgArr={output} />);
  }

  doTest1(imgArr) {
    const kernel = [
      [
        [
          [1],
        ],
      ],
    ];
    return this.doTest(imgArr, kernel);
  }

  doTest2(imgArr) {
    const kernel = [
      [
        [
          [0.25, 0.25],
          [0.25, 0.25]
        ],
      ],
    ];
    return this.doTest(imgArr, kernel);
  }

  doTest3(imgArr) {
    const kernel = [
      [
        [
          [0.25, 0.25],
          [0.25, 0.25]
        ],
      ],
    ];
    return this.doTest(imgArr, kernel, 2);
  }

  render() {
    const { imgArr } = this.props;

    return (
      <div>
        <div>{ this.doTest1(imgArr) }</div>
        <div>{ this.doTest2(imgArr) }</div>
        <div>{ this.doTest3(imgArr) }</div>
      </div>
    );
  }
}

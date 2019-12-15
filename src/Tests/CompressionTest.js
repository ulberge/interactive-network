import React, { Component } from 'react';
import p5 from 'p5';
import Grid from '@material-ui/core/Grid';
import CompressionTestOutput from './CompressionTestOutput';

import ArrayToImageAbs from '../ArrayToImageAbs';
import * as tf from '@tensorflow/tfjs';

import { gabor, getGaborSize } from '../helpers';

/* global nj */
const size = [80, 80];

function getGaborFilters(numChannels, Lambda, gamma) {
  const thetaDelta = Math.PI / numChannels;
  const sigma = (1 / 2) * Lambda;

  let maxSize = 0;
  for (let i = 0; i < numChannels; i += 1) {
    const theta = thetaDelta * i;
    const size = getGaborSize(sigma, theta, gamma);
    if (size > maxSize) {
      maxSize = size;
    }
  }
  const windowSize = maxSize + 1;

  const filters = [];
  for (let i = 0; i < numChannels; i += 1) {
    const psi = 0; // offset
    const theta = thetaDelta * i;
    const filter = gabor(sigma, theta, Lambda, psi, gamma, windowSize);
    if (filter) {
      filters.push(filter);
    }
  }
  return filters;
}

function getLayer(filters, strides=1) {
  const kernel = filters.map(filter => [filter]);
  const weights = nj.array(kernel).transpose(2, 3, 1, 0).tolist();
  const biases = new Array(kernel.length).fill(0);
  const weightsTensor = [tf.tensor4d(weights), tf.tensor1d(biases)];
  const layer = tf.layers.conv2d({
    filters: kernel.length,
    kernelSize: filters[0].length,
    strides: strides,
    padding: 'valid',
    weights: weightsTensor,
    activation: 'relu',
    name: 'conv1'
  });
  return layer;
}


// const numChannelsTests = [2, 4, 8, 16];
// const widthTests = [1.5, 2, 2.5, 3, 3.5, 4, 6, 8];
// const lengthTests = [4, 2, 1.5, 1, 0.8, 0.7, 0.6, 0.5, 0.4];

// const numChannelsTests = [2, 4, 8];
const widthTests = [2, 3, 4];
const lengthTests = [4, 2, 1];

const numChannelsTests = [2];
// const widthTests = [2];
// const lengthTests = [4];

const filterSets = [];
numChannelsTests.forEach(numChannels => widthTests.forEach(Lambda => lengthTests.forEach(gamma => {
    const filterSet = {
      numChannels,
      Lambda,
      gamma,
      filters: getGaborFilters(numChannels, Lambda, gamma)
    };
    filterSets.push(filterSet);
})));

const layers = filterSets.map(filterSet => getLayer(filterSet.filters));

// Show an editable canvas, on edit, render the compressions in all the various ways:
// different kernel sizes, different kernels...
export default class CompressionTest extends Component {
  state = {
    imgArr: [],
    filterSets: filterSets,
    layers: layers
  }

  componentDidMount() {
    this._setup();
  }

  async _setup() {
    this.refs.image.innerHTML = '';
    new p5(this.getSketch(size, 1), this.refs.image);
  }

  format(imgArr, size) {
    const gray = [];
    for (let i = 0; i < imgArr.length; i += 4) {
      gray.push(1 - (imgArr[i] / 255));
    }
    const gray_f = nj.array(gray).reshape(size[0], size[1]);
    return gray_f.tolist();
  }

  getSketch(size, scale) {
    const [ h, w ] = size;
    let pressed = false;

    return (p) => {
      p.setup = () => {
        p.pixelDensity(1);
        p.createCanvas(w * scale, h * scale);
        p.background(255);
      };

      p.draw = () => {
        p.fill(0);
        p.stroke(0);
        // p.strokeWeight(1);
        p.strokeWeight(scale);

        // Record mouse pressed events within canvas
        const px = p.pmouseX;
        const py = p.pmouseY;
        const x = p.mouseX;
        const y = p.mouseY;
        if (!(x < 0 || y < 0 || px < 0 || py < 0 || x >= p.width || px >= p.width || y >= p.height || py >= p.height)) {
          if (p.mouseIsPressed) {
            pressed = true;
            // draw line
            p.line(px, py, x, y);
          } else {
            if (pressed) {
              pressed = false;
              p.loadPixels();
              const imgArr = this.format(p.pixels, size);
              this.setState({ imgArr });
            }
          }
        }
      };
    };
  }

  render() {
    const { imgArr, filterSets, layers } = this.state;

    return (
      <Grid container alignItems="center" spacing={2}>
        <Grid item>
          <span ref="image" className="editable drawarea"></span>
        </Grid>
        <Grid item>
          <CompressionTestOutput imgArr={ imgArr } filterSets={ filterSets } layers={ layers }  />
        </Grid>
      </Grid>
    );
  }
}

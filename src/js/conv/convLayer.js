import nj from 'numjs';
import * as tf from '@tensorflow/tfjs';
import { dtype, dilateBounds } from './convArray';

export default class ConvLayer {
  constructor(input, output, filters, kernelSize) {
    this.input = input;
    this.output = output;
    this._kernelSize = kernelSize;
    this._pad = Math.floor(kernelSize / 2);
    this._rawFilters = filters;
    this.filters = filters.map(filter => filter.map(kernel => kernel ? nj[dtype]([kernel]) : null));
    this._tflayer = getConvLayer(nj[dtype](filters.map(filter => filter.map(kernel => kernel ? kernel : nj.zeros([kernelSize, kernelSize], dtype).tolist()))), kernelSize);
  }

  run() {
    // updateBounds for this layer will be the dirtyBounds eroded by the padding for convolution
    const updateBounds = dilateBounds(this.input.dirtyBounds, -this._pad);
    const [ minX, minY, maxX, maxY ] = updateBounds;
    const h = maxY - minY;
    const w = maxX - minX;

    const dirty = this.input.dirty;

    // tf backend
    const times = [];
    let ct0 = Date.now();
    let ct1;

    const d = dirty.reshape([1, ...dirty.shape]).selection;
    const input = tf.tensor4d(d.data, d.shape);

    ct1 = Date.now();
    times.push('to tensor -> ');
    times.push(ct1 - ct0);
    ct0 = ct1;

    times.push(tf.getBackend());
    const output = this._tflayer.apply(input);

    ct1 = Date.now();
    times.push('apply conv -> ');
    times.push(ct1 - ct0);
    ct0 = ct1;

    times.push(tf.getBackend());
    const dsync = output.dataSync();

    ct1 = Date.now();
    times.push('data sync -> ');
    times.push(ct1 - ct0);
    ct0 = ct1;

    times.push(tf.getBackend());
    const updateArr = nj[dtype](dsync);

    ct1 = Date.now();
    times.push('to array -> ');
    times.push(ct1 - ct0);
    ct0 = ct1;

    console.log('conv stats:', 'total time -> ', times.reduce((a, b) => Number.isInteger(b) ? a + b : a, 0), ...times);

    const updateShape = [ this.output._channels, h, w ];
    const update = updateArr.reshape(updateShape);
    this.output.assign(update, null, updateBounds);
    this.output.calcStats(output);
    this.input.clean();
  }
}

function getConvLayer(filters, kernelSize) {
  // data format in: [out, in, h, w]
  // data format out: [filter_height, filter_width, in_channels, out_channels]
  // -> filters: A Tensor. Must have the same type as input. A 4-D tensor of shape
  const numOutputs = filters.shape[0];
  const weights = filters.transpose(2, 3, 1, 0).tolist();
  // create bias such that the ideal input is 1
  const biases = nj.zeros([numOutputs]).tolist();

  // we only need a bias for all negative weights (the others are balanced to equal 1 on ideal)
  filters.tolist().forEach((filter, i) => {
    // for filters that are all negative, give bias of positive 1
    if (filter.flat().flat().filter(v => v > 0).length === 0) {
      biases[i] = 64;
    }
  });

  const weightsTensor = [tf.tensor4d(weights), tf.tensor1d(biases)];
  // const weightsTensor = [tf.tensor4d(weights)];
  const layer = tf.layers.conv2d({
    filters: numOutputs,
    kernelSize: kernelSize,
    strides: 1,
    padding: 'valid',
    weights: weightsTensor,
    activation: 'relu',
    dataFormat: 'channelsFirst',
    // useBias: false
  });
  return layer;
}

import * as tf from '@tensorflow/tfjs';
import { getEmpty2DArray } from './helpers';
const nj = require('./numjs');

export default class Network {
  // kernels: kernels for first layer
  // layers: all other layers
  constructor(kernels, layers) {
    const filters0 = kernels.map(k => [k]);
    this.layersInfo = [
      {
        filters: filters0,
        type: 'conv2d',
        layer: Network.getLayerConv2D(filters0),
        layerTranspose: Network.getLayerConv2DTranspose(filters0),
        kernelSize: filters0[0][0].length
      },
    ];

    for (let layer of layers) {
      if (layer.type === 'maxPool2d') {
        const { poolSize } = layer;
        const layerInfo = {
          filters: null,
          poolSize,
          type: 'maxPool2d',
          layer: tf.layers.maxPooling2d({ poolSize }),
          layerTranspose: tf.layers.upSampling2d({ size: [ poolSize, poolSize ] }),
        };
        this.layersInfo.push(layerInfo);
      } else if (layer.type === 'conv2d') {
        const filters = layer.filters;
        const layerInfo = {
          filters,
          type: 'conv2d',
          layer: Network.getLayerConv2D(filters),
          layerTranspose: Network.getLayerConv2DTranspose(filters),
          kernelSize: filters[0][0].length
        };
        this.layersInfo.push(layerInfo);
      }
    }
  }

  // get the total activation for the image at the given location
  getScore(channels, layerIndex, channelIndex) {
    const acts = this.getActsFromChannels(channels, layerIndex, channelIndex);
    if (!acts) {
      return null;
    }
    const y = Math.floor(acts.length / 2);
    const x = Math.floor(acts[0].length / 2);
    // translate location to layer space...
    const score = acts[y][x];
    return score;
  }

  // skip the first layer (kernels), this is coming from a smart canvas which already calculates them
  getActsFromChannels(channels, layerIndex, channelIndex) {
    if (!channels) {
      return null;
    }
    const channels_f = nj.array(channels).transpose(1, 2, 0).tolist();
    let curr = tf.tensor4d([channels_f]);

    for (let i = 1; i <= layerIndex; i += 1) {
      const layer = this.layersInfo[i].layer;
      curr = layer.apply(curr);
    }
    let result = curr.arraySync();

    // format output
    result = nj.array(result[0]);
    result = result.transpose(2, 0, 1);
    return result.tolist()[channelIndex];
  }

  getActsFromImgArr(imgArr, layerIndex, channelIndex) {
    if (!imgArr || imgArr.length === 0 || imgArr[0].length === 0) {
      return null;
    }

    const imgArr_f = [imgArr.map(row => row.map(col => [col]))];
    let curr = tf.tensor4d(imgArr_f);

    for (let i = 0; i <= layerIndex; i += 1) {
      const layer = this.layersInfo[i].layer;
      curr = layer.apply(curr);
    }
    let result = curr.arraySync();

    // format output
    result = nj.array(result[0]);
    result = result.transpose(2, 0, 1);
    return result.tolist()[channelIndex];
  }

  // Deconvolve the channel in this layer to see what it is selecting for
  // Returns a 2D array with a  "shadow" of this channel and the size of the theoretical receptive field
  getShadow(layerIndex, channelIndex) {
    const padding = Math.floor(this.layersInfo[layerIndex].kernelSize / 2); // half kernel size
    const numfilters = this.layersInfo[layerIndex].filters.length; // number of filters in this layer
    const init = Network.getInitShadowArray(padding, numfilters, channelIndex);
    // console.table(init);
    let curr = tf.tensor4d([init]);

    for (let i = layerIndex; i >= 0; i -= 1) {
      const layer = this.layersInfo[i].layerTranspose;
      curr = layer.apply(curr);
      // const tbs = curr.arraySync();
      // console.log('layer index', i);
      // tbs.forEach(tb => console.table(tb.map(row => row.map(col => col[0] > 0 ? Number(col[0].toFixed(2)) : 0))));
    }
    let result = curr.arraySync();

    // format output
    result = result[0].map(row => row.map(col => col[0]));
    return result;
  }

  getShadowOffset(layerIndex, location) {
    // if all the layers have "same" padding, then you should be able to multiply the stride?
    let xOffset = 1;
    let yOffset = 1;
    for (let layerInfo of this.layersInfo) {
      xOffset *= layerInfo.layer.strides[0];
      yOffset *= layerInfo.layer.strides[1];
    }
    const { x, y } = location;
    return { x: x * xOffset, y: y * yOffset };
  }

  // Get an array of 2D arrays of 0's the size of the kernels at this layer and
  // with length equal to the number of channels at this layer
  // Add a 1 at the center of the channel we care about
  // This fn is used to kick off a deconvolution showing what this channel is selecting for
  static getInitShadowArray(padding, numfilters, channelIndex) {
    // expand the 2D area for backprop by padding
    const wInit = 1 + (2 * padding);
    const hInit = 1 + (2 * padding);
    let init = getEmpty2DArray(hInit, wInit);
    init = init.map((row, y) => row.map((col, x) => {
      const arr = new Array(numfilters).fill(0);
      if (y === padding && x === padding) {
        arr[channelIndex] = 1;
      }
      return arr;
    }));

    return init;
  }

  static getLayerConv2D(filters, bias=0, strides=1, name='conv') {
    // kernels in: [out_filters, in_filters, h, w]
    // convert to: [h, w, in_filters, out_filters]
    const weights = nj.array(filters).transpose(2, 3, 1, 0).tolist();
    const biases = new Array(filters.length).fill(bias);
    const weightsTensor = [tf.tensor4d(weights), tf.tensor1d(biases)];
    const layer = tf.layers.conv2d({
      filters: filters.length,
      kernelSize: filters[0][0].length,
      strides: strides,
      padding: 'same',
      weights: weightsTensor,
      activation: 'relu',
      name: name,
    });
    return layer;
  }

  static getLayerConv2DTranspose(filters, bias=0, strides=1, name='conv') {
    // remove all negative values, since we only use this to calculate potential connections, not suppression
    filters = filters.map(outChannel => outChannel.map(inChannel => inChannel.map(row => row.map(v => v > 0 ? v : 0))));

    // kernels in: [out_filters, in_filters, h, w]
    // convert to: [h, w, in_filters, out_filters]
    const weights = nj.array(filters).transpose(2, 3, 1, 0).tolist();
    const biases = new Array(filters[0].length).fill(bias);
    const weightsTensor = [tf.tensor4d(weights), tf.tensor1d(biases)];
    const layer = tf.layers.conv2dTranspose({
      filters: filters[0].length,
      kernelSize: filters[0][0].length,
      strides: strides,
      padding: 'same',
      weights: weightsTensor,
      activation: 'relu',
      name: name,
    });
    return layer;
  }
}

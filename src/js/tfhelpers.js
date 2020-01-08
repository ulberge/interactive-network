import * as tf from '@tensorflow/tfjs';
tf.setBackend('cpu');

/* global nj */

// Returns the result of a given a layer applied to an image as a 2D array.
export function eval2DArray(layer, imgArr) {
  if (!layer || !imgArr) {
    return null;
  }
  const imgArr_f = [imgArr.map(row => row.map(col => [col]))];
  let curr = tf.tensor4d(imgArr_f);
  const result = layer.apply(curr).arraySync();

  // format output
  let out = nj.array(result[0]);
  out = out.transpose(2, 0, 1);
  return out.tolist();
}

// Returns the result of a given a layer applied to an image as a 2D array.
export function eval2DArrayMultipleLayers(layers, imgArrs) {
  const imgArrs_f = imgArrs.map(imgArr => imgArr.map(row => row.map(col => [col])));

  let curr = tf.tensor4d(imgArrs_f);
  layers.forEach(layer => {
    curr = layer.apply(curr);
  });
  let outputs = curr.arraySync();

  // format output
  const formattedOutputs = outputs.map(output => {
    output = nj.array(output);
    output = output.transpose(2, 0, 1);
    return output.tolist();
  });

  return formattedOutputs;
}

export function evalChannels(layer, channels) {
  if (!layer || !channels) {
    return null;
  }

  // convert from CHW -> NHWC
  // NHWC - data format
  // N: batch
  // H: height (spatial dimension)
  // W: width (spatial dimension)
  // C: channel (depth)

  // const channels_f = channels.map(channel => channel.map(row => row.map(col => [col])));
  const channels_f = nj.array(channels).transpose(1, 2, 0).tolist();
  let curr = tf.tensor4d([channels_f]);
  const result = layer.apply(curr).arraySync();

  // format output
  let out = nj.array(result[0]);
  out = out.transpose(2, 0, 1);
  return out.tolist();
}

export function getLayer(filters, bias=0, strides=1, name='conv') {

  // data format in: [out, in, h, w]
  // data format out: [filter_height, filter_width, in_channels, out_channels]
  // -> filters: A Tensor. Must have the same type as input. A 4-D tensor of shape

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

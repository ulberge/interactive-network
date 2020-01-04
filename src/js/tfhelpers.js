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

export function getLayer(filters, bias, strides=1) {
  const kernel = filters.map(filter => [filter]);
  const weights = nj.array(kernel).transpose(2, 3, 1, 0).tolist();
  const biases = new Array(kernel.length).fill(bias);
  const weightsTensor = [tf.tensor4d(weights), tf.tensor1d(biases)];
  const layer = tf.layers.conv2d({
    filters: kernel.length,
    kernelSize: filters[0].length,
    strides: strides,
    padding: 'same',
    weights: weightsTensor,
    activation: 'relu',
    name: 'conv1'
  });
  return layer;
}

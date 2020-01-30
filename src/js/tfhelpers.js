import * as tf from '@tensorflow/tfjs';
import nj from 'numjs';
// tf.setBackend('cpu');

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

export function evalChannelsMultipleLayers(layers, channels) {
  if (!layers || !channels) {
    return null;
  }

  // convert from CHW -> NHWC
  // NHWC - data format
  // N: batch
  // H: height (spatial dimension)
  // W: width (spatial dimension)
  // C: channel (depth)

  const channels_f = nj.array(channels).transpose(1, 2, 0).tolist();
  let curr = tf.tensor4d([channels_f]);

  const results = [];
  for (let layer of layers) {
    curr = layer.apply(curr);
    results.push(curr.arraySync());
  }

  // format output
  const formattedOutputs = results.map(layerOutputs => layerOutputs.map(output => {
    output = nj.array(output);
    output = output.transpose(2, 0, 1);
    return output.tolist();
  }));

  return formattedOutputs;
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
    // padding: 'valid',
    padding: 'same',
    weights: weightsTensor,
    activation: 'relu',
    name: name,
  });
  return layer;
}

export function getLayerTranspose(filters, bias=0, strides=1, name='conv') {

  // data format in: [out, in, h, w]
  // data format out: [filter_height, filter_width, in_channels, out_channels]
  // -> filters: A Tensor. Must have the same type as input. A 4-D tensor of shape

  // debugger;
  const weights = nj.array(filters).transpose(2, 3, 1, 0).tolist();
  const biases = new Array(filters[0].length).fill(bias);
  const weightsTensor = [tf.tensor4d(weights), tf.tensor1d(biases)];
  const layer = tf.layers.conv2dTranspose({
    filters: filters[0].length,
    kernelSize: filters[0][0].length,
    strides: strides,
    // padding: 'valid',
    padding: 'same',
    weights: weightsTensor,
    activation: 'relu',
    name: name,
  });
  return layer;
}

// // Given a location (2D area) in a channel at a given layer, backprop its activation to find where it is connected to
// export function getShadow(layers, layerIndex, channelIndex, locationBounds) {
//   const [ minX, minY, maxX, maxY ] = locationBounds;
//   const w = maxX - minX;
//   const h = maxY - minY;
//   const init = getEmpty2DArray(h, w, 1);

//   for (let i = layerIndex; i >= 0; i -= 1) {
//     const layer = layers[i];

//   }

//   // data format in: [out, in, h, w]
//   // data format out: [filter_height, filter_width, in_channels, out_channels]
//   // -> filters: A Tensor. Must have the same type as input. A 4-D tensor of shape

//   const weights = nj.array(filters).transpose(2, 3, 1, 0).tolist();
//   const biases = new Array(filters.length).fill(bias);
//   const weightsTensor = [tf.tensor4d(weights), tf.tensor1d(biases)];
//   const layer = tf.layers.conv2d({
//     filters: filters.length,
//     kernelSize: filters[0][0].length,
//     strides: strides,
//     // padding: 'valid',
//     padding: 'same',
//     weights: weightsTensor,
//     activation: 'relu',
//     name: name,
//   });
//   return layer;
// }

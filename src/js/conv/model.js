import * as tf from '@tensorflow/tfjs';
import { enableCache } from './predictionCache';
import nj from 'numjs';
// tf.enableProdMode();

export function getModel(inputShape, layerInfos) {
  const layers = [];
  for (const layerInfo of layerInfos) {
    let layer;
    if (layerInfo.type === 'conv2d') {
      layer = getConvLayer(layerInfo.filters, layerInfo.kernelSize);
    } else if (layerInfo.type === 'maxPool2d') {
      layer = getMaxPoolLayer(layerInfo.poolSize);
    }
    layers.push(layer);
  }

  let input;
  let output = nj.zeros(inputShape);
  layers.forEach(layer => {
    input = output;
    output = layer.apply(input);
  });
  this.model = tf.model({ inputs: input, outputs: output });

  enableCache(this.model);

  return this.model;
}

function getConvLayer(filters, kernelSize) {
  // data format in: [out, in, h, w]
  // data format out: [filter_height, filter_width, in_channels, out_channels]
  // -> filters: A Tensor. Must have the same type as input. A 4-D tensor of shape
  const numOutputs = filters.shape[0];
  const weights = filters.transpose(2, 3, 1, 0).tolist();
  const weightsTensor = [tf.tensor4d(weights)];
  const layer = tf.layers.conv2d({
    filters: numOutputs,
    kernelSize: kernelSize,
    strides: 1,
    padding: 'valid',
    weights: weightsTensor,
    activation: 'relu',
    dataFormat: 'channelsFirst',
    useBias: false
  });
  return layer;
}

function getMaxPoolLayer(poolSize) {
  return tf.layers.maxPooling2d({ poolSize, dataFormat: 'channelsFirst' });
}

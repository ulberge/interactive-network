import * as tf from '@tensorflow/tfjs';

/* global nj */

export default class ConvNet {
  constructor(weights) {
    this._weights = weights;
    this._layers = this.getLayers();
  }

  getLayers() {
    const kernel1 = this._weights['L1'];
    const weights1 = nj.array(kernel1).transpose(2, 3, 1, 0).tolist();
    const biases1 = Array(4).fill(0);
    const weights1Tensor = [tf.tensor4d(weights1), tf.tensor1d(biases1)];
    const layer1 = tf.layers.conv2d({
      filters: 4,
      kernelSize: 5, // 5x5
      strides: 1,
      padding: 'valid',
      weights: weights1Tensor,
      // activation: 'sigmoid',
      // activation: 'linear',
      activation: 'relu',
      name: 'conv1'
    });

    const layer1Pool = tf.layers.maxPooling2d({poolSize: 5});

    const kernel2 = this._weights['L2'];
    const weights2 = nj.array(kernel2).transpose(2, 3, 1, 0).tolist();
    const biases2 = Array(kernel2.length).fill(0);
    const weights2Tensor = [tf.tensor4d(weights2), tf.tensor1d(biases2)];
    const layer2 = tf.layers.conv2d({
      filters: kernel2.length,
      kernelSize: 3, // 3x3
      strides: 1,
      padding: 'valid',
      weights: weights2Tensor,
      // activation: 'sigmoid',
      // activation: 'linear',
      activation: 'relu',
      name: 'conv2'
    });

    return [layer1, layer1Pool, layer2];
  }

  eval(imgArr) {
    let imgArr_f = nj.array([imgArr]);
    imgArr_f = imgArr_f.reshape([1, imgArr.length, imgArr[0].length, 1]);
    imgArr_f = imgArr_f.tolist();

    let curr = tf.tensor4d(imgArr_f);
    let layerOutputs = [];
    this._layers.forEach((layer, i) => {
      const result = layer.apply(curr);
      layerOutputs.push(result.arraySync());
      curr = result;
    });

    // format output
    layerOutputs = layerOutputs.map(out => {
      out = nj.array(out[0]);
      out = out.transpose(2, 0, 1);
      return out.tolist();
    });

    return layerOutputs;
  }

  // async saveModel(filename) {
  //   await that.model.save('localstorage://' + filename);
  //   return true;
  // }

  // async loadModel(filename) {
  //   that.model = await tf.loadLayersModel('localstorage://' + filename);
  //   return true;
  // }
}


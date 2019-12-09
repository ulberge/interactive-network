import * as tf from '@tensorflow/tfjs';

/* global nj */

export default class ConvNet {
  constructor(data) {
    this.data = data;
    this._layers = this.getLayers();
  }

  getLayer(kernel) {
    const weights = nj.array(kernel).transpose(2, 3, 1, 0).tolist();
    const biases = Array(kernel.length).fill(0);
    const weightsTensor = [tf.tensor4d(weights), tf.tensor1d(biases)];
    const layer = tf.layers.conv2d({
      filters: kernel.length,
      kernelSize: 3, // 3x3
      strides: 1,
      padding: 'valid',
      weights: weightsTensor,
      // activation: 'sigmoid',
      // activation: 'linear',
      activation: 'relu'
    });

    return layer;
  }

  getLayers() {
    const layers = [];

    const kernel1 = this.data[0].weights;
    const weights1 = nj.array(kernel1).transpose(2, 3, 1, 0).tolist();
    const biases1 = Array(4).fill(0);
    const weights1Tensor = [tf.tensor4d(weights1), tf.tensor1d(biases1)];
    layers.push(tf.layers.conv2d({
      filters: 4,
      kernelSize: 5, // 5x5
      strides: 1,
      padding: 'valid',
      weights: weights1Tensor,
      // activation: 'sigmoid',
      // activation: 'linear',
      activation: 'relu',
      name: 'conv1'
    }));

    layers.push(tf.layers.maxPooling2d({poolSize: 5}));
    layers.push(this.getLayer(this.data[1].weights));
    layers.push(this.getLayer(this.data[2].weights));
    // layers.push(tf.layers.maxPooling2d({poolSize: 2}));
    // layers.push(this.getLayer(this.data[3].weights));

    return layers;
  }

  eval(imgArr, maxLayer=4) {
    let imgArr_f = nj.array([imgArr]);
    imgArr_f = imgArr_f.reshape([1, imgArr.length, imgArr[0].length, 1]);
    imgArr_f = imgArr_f.tolist();

    let curr = tf.tensor4d(imgArr_f);
    let layerOutputs = [];
    this._layers.forEach((layer, i) => {
      if (i <= maxLayer) {
        const result = layer.apply(curr);
        layerOutputs.push(result.arraySync());
        curr = result;
      }
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


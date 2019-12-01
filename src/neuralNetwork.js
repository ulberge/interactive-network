import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';

/* global nj */


function initLayer(layer, shape) {
  let curr = tf.tensor4d(nj.zeros(shape).tolist());
  layer.apply(curr);
}

export function loadLayer1() {
  // Gabor filters (vert, diag, hor, diag)
  let weights1 = [[[[-3.85,-5.1,-5.4,-4.3,-1.8,1.4,3.95,4.9,3.95,1.35,-1.8,-4.3,-5.4,-5.1,-3.85],[-3.95,-5.3,-5.6,-4.45,-1.8,1.5,4.2,5.25,4.2,1.5,-1.8,-4.45,-5.65,-5.3,-3.9],[-4.05,-5.5,-5.8,-4.55,-1.85,1.6,4.4,5.5,4.4,1.6,-1.85,-4.55,-5.8,-5.5,-4.05],[-4.1,-5.6,-5.95,-4.65,-1.85,1.7,4.6,5.7,4.6,1.7,-1.85,-4.65,-5.95,-5.6,-4.1],[-4.2,-5.7,-6.05,-4.75,-1.85,1.8,4.75,5.9,4.75,1.8,-1.85,-4.75,-6.05,-5.7,-4.2],[-4.2,-5.8,-6.15,-4.8,-1.85,1.85,4.85,6.05,4.85,1.85,-1.85,-4.8,-6.15,-5.8,-4.2],[-4.25,-5.8,-6.2,-4.8,-1.85,1.85,4.9,6.1,4.9,1.85,-1.85,-4.85,-6.2,-5.8,-4.25],[-4.25,-5.8,-6.2,-4.8,-1.85,1.85,4.9,6.1,4.9,1.85,-1.85,-4.85,-6.2,-5.8,-4.25],[-4.2,-5.8,-6.15,-4.8,-1.85,1.85,4.9,6.05,4.85,1.85,-1.85,-4.8,-6.15,-5.8,-4.2],[-4.2,-5.7,-6.05,-4.75,-1.85,1.8,4.75,5.9,4.75,1.8,-1.85,-4.75,-6.05,-5.7,-4.2],[-4.15,-5.6,-5.95,-4.65,-1.85,1.7,4.6,5.7,4.6,1.7,-1.85,-4.65,-5.95,-5.6,-4.15],[-4.05,-5.5,-5.85,-4.55,-1.85,1.6,4.4,5.5,4.4,1.6,-1.85,-4.55,-5.85,-5.5,-4.05],[-3.95,-5.3,-5.65,-4.45,-1.8,1.5,4.2,5.25,4.2,1.5,-1.8,-4.45,-5.65,-5.3,-3.9],[-3.85,-5.15,-5.45,-4.3,-1.8,1.4,3.95,4.95,3.95,1.35,-1.8,-4.3,-5.45,-5.15,-3.85],[-3.7,-4.95,-5.25,-4.15,-1.75,1.2,3.65,4.6,3.65,1.2,-1.75,-4.15,-5.25,-4.95,-3.7]]],[[[-0.6,-1.3,-2.4,-3.75,-4.95,-5.75,-5.85,-5.15,-3.65,-1.6,0.65,2.6,3.8,4.1,3.45],[-1.3,-2.4,-3.75,-5.,-5.85,-6.05,-5.35,-3.75,-1.55,0.8,2.9,4.25,4.6,3.95,2.45],[-2.4,-3.75,-5.05,-5.95,-6.15,-5.45,-3.85,-1.55,0.95,3.2,4.65,5.05,4.4,2.8,0.7],[-3.75,-5.,-5.95,-6.15,-5.5,-3.9,-1.6,1.,3.4,4.95,5.45,4.75,3.1,0.95,-1.3],[-4.95,-5.85,-6.15,-5.5,-3.9,-1.55,1.1,3.5,5.2,5.8,5.1,3.4,1.1,-1.3,-3.3],[-5.75,-6.05,-5.45,-3.9,-1.55,1.1,3.6,5.35,6.,5.35,3.6,1.25,-1.3,-3.45,-4.85],[-5.85,-5.35,-3.85,-1.6,1.1,3.6,5.4,6.1,5.5,3.75,1.3,-1.25,-3.5,-5.05,-5.65],[-5.15,-3.75,-1.55,1.,3.5,5.35,6.1,5.55,3.85,1.4,-1.25,-3.6,-5.2,-5.8,-5.6],[-3.65,-1.55,0.95,3.4,5.2,6.,5.5,3.85,1.4,-1.3,-3.65,-5.3,-6.,-5.8,-4.9],[-1.55,0.8,3.2,4.95,5.8,5.35,3.75,1.4,-1.3,-3.7,-5.35,-6.1,-5.95,-5.05,-3.8],[0.7,2.9,4.65,5.45,5.1,3.6,1.3,-1.25,-3.65,-5.35,-6.1,-6.,-5.15,-3.9,-2.55],[2.6,4.25,5.05,4.75,3.4,1.25,-1.25,-3.6,-5.3,-6.1,-6.,-5.15,-3.9,-2.55,-1.45],[3.8,4.6,4.4,3.1,1.1,-1.3,-3.55,-5.2,-6.,-5.95,-5.15,-3.9,-2.55,-1.4,-0.65],[4.1,3.95,2.8,0.95,-1.3,-3.45,-5.05,-5.8,-5.8,-5.05,-3.9,-2.55,-1.4,-0.65,-0.25],[3.45,2.45,0.7,-1.3,-3.3,-4.85,-5.65,-5.6,-4.9,-3.8,-2.55,-1.45,-0.65,-0.25,-0.15]]],[[[-4.3,-4.4,-4.55,-4.65,-4.7,-4.8,-4.85,-4.85,-4.85,-4.8,-4.7,-4.65,-4.55,-4.4,-4.3],[-5.35,-5.55,-5.7,-5.85,-6.,-6.1,-6.1,-6.1,-6.1,-6.1,-6.,-5.85,-5.7,-5.55,-5.35],[-5.15,-5.35,-5.5,-5.65,-5.75,-5.85,-5.9,-5.9,-5.9,-5.85,-5.75,-5.65,-5.5,-5.35,-5.15],[-3.4,-3.55,-3.6,-3.65,-3.7,-3.75,-3.75,-3.75,-3.75,-3.75,-3.7,-3.65,-3.6,-3.55,-3.4],[-0.55,-0.45,-0.4,-0.35,-0.35,-0.3,-0.3,-0.3,-0.3,-0.3,-0.35,-0.35,-0.4,-0.45,-0.55],[2.55,2.75,2.9,3.1,3.2,3.3,3.35,3.35,3.35,3.3,3.2,3.1,2.9,2.75,2.55],[4.55,4.8,5.1,5.3,5.5,5.65,5.75,5.75,5.75,5.65,5.5,5.3,5.1,4.8,4.55],[4.6,4.9,5.15,5.4,5.6,5.75,5.8,5.85,5.8,5.75,5.6,5.4,5.15,4.9,4.6],[2.75,2.9,3.1,3.25,3.4,3.5,3.55,3.55,3.55,3.5,3.4,3.25,3.1,2.9,2.75],[-0.3,-0.25,-0.2,-0.15,-0.1,-0.05,-0.05,-0.05,-0.05,-0.1,-0.1,-0.15,-0.2,-0.25,-0.3],[-3.25,-3.35,-3.4,-3.5,-3.5,-3.55,-3.6,-3.6,-3.6,-3.55,-3.5,-3.5,-3.4,-3.35,-3.25],[-5.05,-5.25,-5.4,-5.55,-5.65,-5.75,-5.8,-5.8,-5.8,-5.75,-5.65,-5.55,-5.4,-5.25,-5.05],[-5.35,-5.55,-5.7,-5.85,-6.,-6.1,-6.1,-6.1,-6.1,-6.1,-6.,-5.85,-5.7,-5.55,-5.35],[-4.35,-4.5,-4.65,-4.7,-4.8,-4.9,-4.9,-4.9,-4.9,-4.9,-4.8,-4.7,-4.65,-4.5,-4.35],[-2.75,-2.85,-2.9,-2.95,-3.,-3.,-3.05,-3.05,-3.05,-3.,-3.,-2.95,-2.9,-2.85,-2.75]]],[[[3.95,4.05,3.2,1.6,-0.5,-2.7,-4.5,-5.6,-5.9,-5.45,-4.45,-3.2,-1.95,-1.,-0.4],[3.45,4.45,4.5,3.65,1.9,-0.4,-2.75,-4.6,-5.8,-6.1,-5.6,-4.55,-3.25,-1.95,-1.05],[2.05,3.85,4.9,4.95,4.,2.1,-0.3,-2.7,-4.7,-5.9,-6.2,-5.65,-4.6,-3.3,-2.],[0.,2.3,4.15,5.25,5.35,4.25,2.3,-0.2,-2.7,-4.7,-5.9,-6.2,-5.65,-4.55,-3.3],[-2.15,0.15,2.45,4.45,5.6,5.65,4.5,2.4,-0.15,-2.65,-4.7,-5.9,-6.15,-5.6,-4.5],[-4.05,-2.2,0.15,2.6,4.65,5.85,5.85,4.6,2.5,-0.05,-2.6,-4.65,-5.8,-6.05,-5.5],[-5.35,-4.25,-2.35,0.15,2.7,4.8,5.95,5.95,4.7,2.55,-0.05,-2.55,-4.5,-5.65,-5.85],[-5.85,-5.6,-4.4,-2.4,0.15,2.75,4.8,5.95,5.9,4.65,2.55,-0.05,-2.5,-4.4,-5.4],[-5.5,-6.05,-5.75,-4.5,-2.45,0.1,2.7,4.75,5.85,5.8,4.55,2.45,0.,-2.4,-4.2],[-4.6,-5.65,-6.15,-5.8,-4.55,-2.5,0.05,2.6,4.6,5.65,5.55,4.35,2.35,-0.05,-2.25],[-3.35,-4.65,-5.7,-6.2,-5.85,-4.55,-2.55,-0.05,2.45,4.35,5.4,5.25,4.05,2.15,-0.1],[-2.1,-3.35,-4.65,-5.7,-6.2,-5.8,-4.55,-2.55,-0.15,2.25,4.1,5.,4.85,3.75,1.95],[-1.1,-2.05,-3.35,-4.6,-5.65,-6.1,-5.7,-4.5,-2.55,-0.25,2.,3.7,4.6,4.45,3.4],[-0.45,-1.05,-2.,-3.25,-4.55,-5.5,-5.9,-5.55,-4.4,-2.55,-0.35,1.7,3.3,4.1,3.9],[-0.2,-0.45,-1.05,-2.,-3.2,-4.4,-5.3,-5.7,-5.35,-4.25,-2.55,-0.5,1.45,2.9,3.6]]]];
  // let weights1 = [
  //   [  // Filter vertical
  //     [  // Ch 0
  //         [-1, 2, -1],
  //         [-1, 2, -1],
  //         [-1, 2, -1],
  //     ]
  //   ],
  //   [  // Filter horizontal
  //     [  // Ch 0
  //         [-1, -1, -1],
  //         [2, 2, 2],
  //         [-1, -1, -1],
  //     ]
  //   ],
  //   [  // Filter horizontal
  //     [  // Ch 0
  //         [-1, -1, -1],
  //         [2, 2, 2],
  //         [-1, -1, -1],
  //     ]
  //   ],
  //   [  // Filter horizontal
  //     [  // Ch 0
  //         [-1, -1, -1],
  //         [2, 2, 2],
  //         [-1, -1, -1],
  //     ]
  //   ],
  // ];
  // const biases1 = Array(weights1.length).fill(-15);
  const biases1 = [0, -15, 0, -15];

  const weightTs = [];
  let w = weights1;
  const b = biases1;
  w = nj.array(w).transpose(2, 3, 1, 0).tolist();
  weightTs.push([tf.tensor4d(w), tf.tensor1d(b)]);

  const layer1 = tf.layers.conv2d({
    filters: 4,
    kernelSize: 15,
    strides: 5,
    padding: 'valid',
    weights: weightTs[0],
    activation: 'relu',
    inputShape: [45, 45, 1],
    name: 'conv1',
    trainable: false
  });

  initLayer(layer1, [1, 45, 45, 1]);

  return layer1;
}

export function newLayer() {
  const layer = tf.layers.conv2d({
    filters: 2,
    kernelSize: 7,
    strides: 1,
    padding: 'valid',
    activation: 'relu',
    name: 'conv2'
  });

  initLayer(layer, [1, 7, 7, 4]);

  return layer;
}

async function getModel(layers, layerIndex, neuronIndex) {
  const model = tf.sequential();

  // add before layers
  const beforeLayers = layers.slice(0, layerIndex);
  beforeLayers.forEach(layer => model.add(layer));

  // add final layer that has one channel
  const currentLayer = layers[layerIndex];

  // we need to extract the weights we want
  const layerWeights = await currentLayer.getWeights();
  const layerWeightsTensor = await layerWeights[0].array();
  const layerBiasTensor = await layerWeights[1].array();
  const neuronWeights = nj.array(layerWeightsTensor).slice(null, null, null, [neuronIndex, neuronIndex + 1]).tolist();
  const neuronBias = layerBiasTensor.slice(neuronIndex, neuronIndex + 1);

  const neuronWeightsTensor = [tf.tensor4d(neuronWeights), tf.tensor1d(neuronBias)];

  // create a new layer with only one channel with those weights
  const tempLayer = tf.layers.conv2d({
    filters: 1,
    kernelSize: 7,
    strides: 1,
    padding: 'valid',
    weights: neuronWeightsTensor,
    activation: 'relu',
    name: 'tempconv'
  });

  // add that layer
  model.add(tempLayer);

  // add softmax after
  model.add(tf.layers.flatten());
  model.add(tf.layers.dense({units: 2, activation: 'softmax'}));

  return model;
}

function convertToTensor(data, shuffle=true) {
  // Wrapping these calculations in a tidy will dispose any
  // intermediate tensors.
  return tf.tidy(() => {
    // Step 1. Shuffle the data
    if (shuffle) {
      tf.util.shuffle(data);
    }

    // Step 2. Convert data to Tensor
    const inputs = data.map(d => d[0])
    const labels = data.map(d => d[1]);

    const inputTensor = tf.tensor4d(nj.array(inputs).reshape([inputs.length, 45, 45, 1]).tolist());
    const labelTensor = tf.oneHot(tf.tensor1d(labels, 'int32'), 2);

    return {
      xs: inputTensor,
      labels: labelTensor
    }
  });
}

async function trainModel(model, trainData, testData, epochs=1) {
  // Prepare the model for training.
  model.compile({
    optimizer: tf.train.adam(),
    loss: tf.losses.meanSquaredError,
    metrics: ['accuracy'],
  });

  const batchSize = 9;
  return await model.fit(trainData.xs, trainData.labels, {
    batchSize,
    validationData: [testData.xs, testData.labels],
    epochs,
    shuffle: true,
    callbacks: tfvis.show.fitCallbacks(
      { name: 'Training Performance', styles: { height: '500px' } },
      ['acc', 'loss'],
      { callbacks: ['onEpochEnd'] }
    )
    // callbacks: {
    //    onEpochEnd: (epoch, log) => {
    //     const logger = document.getElementById('epochCounter');
    //     if (logger) {
    //       logger.innerHTML = `epoch: ${epoch}, acc: ${(log.acc * 100).toFixed(2)}%`;
    //     }
    //   }
    // }
  });
}

async function evaluateModel(model, data) {
  const [preds, labels] = tf.tidy(() => {
    const labels = data.labels.argMax(-1);
    const xs = data.xs;
    const preds = model.predict(xs).argMax(-1);

    xs.dispose();
    return [preds, labels];
  });
  const classNames = ['Not Match', 'Match'];

  // show accuracy
  const acc = await tfvis.metrics.accuracy(labels, preds);
  console.log('tf vis accuracy?', acc);

  const classAccuracy = await tfvis.metrics.perClassAccuracy(labels, preds);
  const container = {name: 'Accuracy', tab: 'Evaluation'};
  tfvis.show.perClassAccuracy(container, classAccuracy, classNames);

  const confusionMatrix = await tfvis.metrics.confusionMatrix(labels, preds);
  const container2 = {name: 'Confusion Matrix', tab: 'Evaluation'};
  tfvis.render.confusionMatrix(
      container2, {values: confusionMatrix}, classNames);

  labels.dispose();
}

export async function train(layers, layerIndex, neuronIndex, data) {
  const model = await getModel(layers, layerIndex, neuronIndex);

  const trainData = data.slice(8, data.length - 8);
  const testData = [...data.slice(0, 8), ...data.slice(data.length - 8)];

  const tensorDataTrain = convertToTensor(trainData);
  const tensorDataTest = convertToTensor(testData);

  const epochs = 100;
  await trainModel(model, tensorDataTrain, tensorDataTest, epochs);

  await evaluateModel(model, tensorDataTrain);

  return model.layers;
}

export function evalLayers(imgArr, modelLayers) {
  let imgArr_f = nj.array([imgArr]);
  imgArr_f = imgArr_f.reshape([1, 45, 45, 1]);
  imgArr_f = imgArr_f.tolist();

  let curr = tf.tensor4d(imgArr_f);
  let layerOutputs = [];
  modelLayers.forEach((layer, i) => {
    const result = layer.apply(curr);
    layerOutputs.push(result.arraySync());
    curr = result;
  });

  // format into neurons
  layerOutputs = layerOutputs.map(o => {
    o = nj.array(o[0]);
    o = o.transpose(2, 0, 1);
    return o.tolist();
  });

  return layerOutputs;
}


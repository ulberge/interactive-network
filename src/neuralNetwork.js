import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';

/* global nj */


function initLayer(layer, shape) {
  let curr = tf.tensor4d(nj.zeros(shape).tolist());
  layer.apply(curr);
}

export function loadLayer1() {
  // Gabor filters (vert, diag, hor, diag)
  let weights1 = [[[[-1.4,-1.45,-1.45,-1.25,-1.35,-2.15,-1.45,-0.15,-1.45,-2.15,-1.35,-1.25,-1.45,-1.45,-1.4],[-1.4,-1.45,-1.45,-1.2,-1.35,-2.6,-1.5,0.55,-1.5,-2.6,-1.35,-1.2,-1.45,-1.45,-1.4],[-1.4,-1.45,-1.45,-1.05,-1.3,-3.15,-1.5,1.5,-1.5,-3.15,-1.3,-1.1,-1.45,-1.45,-1.4],[-1.4,-1.45,-1.45,-0.95,-1.25,-3.75,-1.5,2.55,-1.55,-3.75,-1.25,-0.95,-1.45,-1.45,-1.4],[-1.4,-1.45,-1.45,-0.85,-1.2,-4.4,-1.55,3.6,-1.55,-4.4,-1.2,-0.85,-1.45,-1.45,-1.4],[-1.4,-1.45,-1.45,-0.7,-1.15,-4.95,-1.6,4.55,-1.6,-4.95,-1.15,-0.7,-1.45,-1.45,-1.4],[-1.4,-1.5,-1.5,-0.65,-1.15,-5.3,-1.6,5.1,-1.6,-5.3,-1.15,-0.65,-1.5,-1.5,-1.4],[-1.4,-1.5,-1.5,-0.65,-1.15,-5.4,-1.6,5.3,-1.6,-5.4,-1.15,-0.65,-1.5,-1.5,-1.4],[-1.4,-1.5,-1.45,-0.65,-1.15,-5.25,-1.6,4.95,-1.6,-5.25,-1.15,-0.65,-1.45,-1.5,-1.4],[-1.4,-1.45,-1.45,-0.75,-1.2,-4.8,-1.55,4.25,-1.6,-4.8,-1.2,-0.75,-1.45,-1.45,-1.4],[-1.4,-1.45,-1.45,-0.85,-1.25,-4.2,-1.55,3.3,-1.55,-4.2,-1.25,-0.9,-1.45,-1.45,-1.4],[-1.4,-1.45,-1.45,-1.,-1.3,-3.6,-1.5,2.2,-1.5,-3.6,-1.3,-1.,-1.45,-1.45,-1.4],[-1.4,-1.45,-1.45,-1.1,-1.3,-2.95,-1.5,1.2,-1.5,-2.95,-1.3,-1.1,-1.45,-1.45,-1.4],[-1.4,-1.45,-1.45,-1.2,-1.35,-2.45,-1.5,0.3,-1.5,-2.45,-1.35,-1.2,-1.45,-1.45,-1.4],[-1.4,-1.4,-1.45,-1.3,-1.35,-2.05,-1.45,-0.35,-1.45,-2.05,-1.35,-1.3,-1.45,-1.4,-1.4]]],[[[-1.4,-1.4,-1.4,-1.4,-1.4,-1.45,-1.5,-1.4,-1.2,-1.2,-1.6,-1.9,-1.55,-1.2,-1.2],[-1.4,-1.4,-1.4,-1.4,-1.45,-1.5,-1.4,-1.05,-1.,-1.75,-2.4,-1.75,-0.9,-0.95,-1.4],[-1.4,-1.4,-1.4,-1.45,-1.5,-1.4,-0.9,-0.8,-2.,-3.15,-2.05,-0.35,-0.35,-1.35,-1.75],[-1.4,-1.4,-1.45,-1.5,-1.4,-0.8,-0.6,-2.25,-4.,-2.55,0.5,0.6,-1.35,-2.1,-1.7],[-1.4,-1.45,-1.5,-1.4,-0.75,-0.45,-2.45,-4.85,-3.05,1.5,1.9,-1.3,-2.75,-2.,-1.3],[-1.45,-1.5,-1.4,-0.8,-0.45,-2.55,-5.45,-3.3,2.5,3.35,-1.3,-3.6,-2.4,-1.25,-1.2],[-1.5,-1.4,-0.9,-0.6,-2.45,-5.45,-3.45,3.05,4.4,-1.15,-4.55,-2.95,-1.15,-1.05,-1.35],[-1.4,-1.05,-0.8,-2.25,-4.85,-3.3,3.05,4.8,-1.1,-5.25,-3.45,-1.,-0.8,-1.3,-1.5],[-1.2,-1.,-2.,-4.,-3.05,2.5,4.4,-1.1,-5.55,-3.8,-0.9,-0.65,-1.25,-1.5,-1.45],[-1.2,-1.75,-3.15,-2.55,1.5,3.35,-1.15,-5.25,-3.8,-0.9,-0.5,-1.25,-1.5,-1.45,-1.4],[-1.6,-2.4,-2.05,0.5,1.9,-1.3,-4.55,-3.45,-0.9,-0.5,-1.2,-1.5,-1.5,-1.4,-1.4],[-1.9,-1.75,-0.35,0.6,-1.3,-3.6,-2.95,-1.,-0.65,-1.25,-1.5,-1.5,-1.4,-1.4,-1.4],[-1.55,-0.9,-0.35,-1.35,-2.75,-2.4,-1.15,-0.8,-1.25,-1.5,-1.5,-1.4,-1.4,-1.4,-1.4],[-1.2,-0.95,-1.35,-2.1,-2.,-1.25,-1.05,-1.3,-1.5,-1.45,-1.4,-1.4,-1.4,-1.4,-1.4],[-1.2,-1.4,-1.75,-1.7,-1.3,-1.2,-1.35,-1.5,-1.45,-1.4,-1.4,-1.4,-1.4,-1.4,-1.4]]],[[[-1.4,-1.4,-1.4,-1.4,-1.4,-1.4,-1.4,-1.4,-1.4,-1.4,-1.4,-1.4,-1.4,-1.4,-1.4],[-1.45,-1.45,-1.45,-1.45,-1.5,-1.5,-1.5,-1.5,-1.5,-1.5,-1.5,-1.45,-1.45,-1.45,-1.45],[-1.45,-1.45,-1.45,-1.45,-1.45,-1.45,-1.45,-1.45,-1.45,-1.45,-1.45,-1.45,-1.45,-1.45,-1.45],[-1.25,-1.15,-1.05,-0.9,-0.8,-0.65,-0.6,-0.55,-0.6,-0.65,-0.8,-0.9,-1.05,-1.15,-1.25],[-1.45,-1.45,-1.45,-1.45,-1.45,-1.45,-1.5,-1.5,-1.5,-1.45,-1.45,-1.45,-1.45,-1.45,-1.45],[-2.2,-2.65,-3.2,-3.85,-4.5,-5.1,-5.5,-5.6,-5.5,-5.1,-4.5,-3.85,-3.2,-2.65,-2.2],[-1.2,-1.1,-0.95,-0.75,-0.55,-0.4,-0.3,-0.25,-0.3,-0.4,-0.55,-0.75,-0.95,-1.1,-1.2],[-0.2,0.45,1.3,2.3,3.3,4.2,4.8,5.05,4.8,4.2,3.3,2.3,1.3,0.45,-0.2],[-1.75,-1.95,-2.15,-2.4,-2.7,-2.95,-3.1,-3.15,-3.1,-2.95,-2.7,-2.4,-2.15,-1.95,-1.75],[-2.05,-2.4,-2.8,-3.3,-3.85,-4.3,-4.6,-4.7,-4.6,-4.3,-3.85,-3.3,-2.8,-2.4,-2.05],[-1.25,-1.2,-1.1,-0.95,-0.85,-0.7,-0.65,-0.65,-0.65,-0.7,-0.85,-0.95,-1.1,-1.2,-1.25],[-1.3,-1.25,-1.2,-1.1,-1.05,-0.95,-0.9,-0.9,-0.9,-0.95,-1.05,-1.1,-1.2,-1.25,-1.3],[-1.5,-1.5,-1.5,-1.5,-1.5,-1.5,-1.5,-1.5,-1.5,-1.5,-1.5,-1.5,-1.5,-1.5,-1.5],[-1.4,-1.4,-1.45,-1.45,-1.45,-1.45,-1.45,-1.45,-1.45,-1.45,-1.45,-1.45,-1.45,-1.4,-1.4],[-1.4,-1.4,-1.4,-1.4,-1.4,-1.4,-1.4,-1.4,-1.4,-1.4,-1.4,-1.4,-1.4,-1.4,-1.4]]],[[[-1.2,-1.25,-1.7,-1.85,-1.5,-1.15,-1.25,-1.45,-1.5,-1.45,-1.4,-1.4,-1.4,-1.4,-1.4],[-1.3,-0.8,-1.05,-2.,-2.35,-1.6,-0.95,-1.1,-1.45,-1.5,-1.45,-1.4,-1.4,-1.4,-1.4],[-1.7,-1.1,-0.15,-0.65,-2.45,-3.05,-1.75,-0.75,-1.,-1.4,-1.5,-1.45,-1.4,-1.4,-1.4],[-1.85,-2.05,-0.85,0.85,0.,-3.1,-3.9,-1.85,-0.55,-0.85,-1.45,-1.5,-1.45,-1.4,-1.4],[-1.45,-2.3,-2.65,-0.5,2.35,0.75,-3.75,-4.7,-2.,-0.4,-0.85,-1.45,-1.5,-1.45,-1.4],[-1.15,-1.45,-2.85,-3.5,-0.25,3.8,1.6,-4.1,-5.2,-2.15,-0.4,-0.85,-1.4,-1.5,-1.45],[-1.25,-0.95,-1.45,-3.55,-4.35,0.1,4.85,2.1,-4.15,-5.25,-2.1,-0.55,-0.95,-1.4,-1.5],[-1.45,-1.2,-0.7,-1.4,-4.1,-5.,0.15,5.2,2.2,-3.9,-4.7,-2.05,-0.8,-1.1,-1.4],[-1.5,-1.45,-1.1,-0.5,-1.3,-4.45,-5.25,0.,4.65,1.85,-3.4,-3.9,-1.9,-1.,-1.2],[-1.4,-1.5,-1.45,-1.05,-0.4,-1.3,-4.35,-5.,-0.35,3.5,1.05,-2.75,-3.05,-1.7,-1.2],[-1.4,-1.4,-1.5,-1.5,-1.1,-0.4,-1.25,-3.85,-4.35,-0.75,2.,0.3,-2.15,-2.35,-1.6],[-1.4,-1.4,-1.4,-1.5,-1.5,-1.1,-0.55,-1.25,-3.2,-3.5,-1.,0.6,-0.45,-1.8,-1.9],[-1.4,-1.4,-1.4,-1.4,-1.5,-1.5,-1.2,-0.8,-1.3,-2.55,-2.65,-1.2,-0.35,-0.9,-1.6],[-1.4,-1.4,-1.4,-1.4,-1.4,-1.5,-1.45,-1.25,-1.,-1.35,-2.05,-2.05,-1.3,-0.95,-1.2],[-1.4,-1.4,-1.4,-1.4,-1.4,-1.4,-1.45,-1.5,-1.3,-1.2,-1.35,-1.7,-1.7,-1.4,-1.2]]]];
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
  const biases1 = Array(weights1.length).fill(1.2);

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

  const batchSize = 5;
  return await model.fit(trainData.xs, trainData.labels, {
    batchSize,
    validationData: [testData.xs, testData.labels],
    epochs,
    shuffle: true,
    // callbacks: tfvis.show.fitCallbacks(
    //   { name: 'Training Performance', styles: { height: '500px' } },
    //   ['acc', 'loss'],
    //   { callbacks: ['onEpochEnd'] }
    // )
    callbacks: {
       onEpochEnd: (epoch, log) => {
        const logger = document.getElementById('epochCounter');
        if (logger) {
          logger.innerHTML = `epoch: ${epoch}, acc: ${(log.acc * 100).toFixed(2)}%`;
        }
      }
    }
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
  const tensorDataTrain = convertToTensor(data);

  const epochs = 100;
  await trainModel(model, tensorDataTrain, tensorDataTrain, epochs);

  // await evaluateModel(model, tensorDataTrain);

  return model.layers[1];
}


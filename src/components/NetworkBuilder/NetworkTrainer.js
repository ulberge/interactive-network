import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { getConvLayer } from '../../js/conv/convLayer';
import { getMaxPoolLayer } from '../../js/conv/maxPoolLayer';
import nj from 'numjs';
import * as tf from '@tensorflow/tfjs';

const canvasSize = 150;

function getModel(networkSettings, kernels) {
  // Define a model for linear regression.
  const model = tf.sequential();

  const filters0 = nj.array(kernels.map(k => [k]));
  const kernelSize0 = kernels[0].length;
  const inputShape = [ 1, canvasSize, canvasSize ];
  const layer0 = getConvLayer(filters0, kernelSize0, 0, inputShape, false);
  model.add(layer0);

  for (const layerInfo of networkSettings.layerInfos) {
    if (layerInfo.type === 'conv2d') {
      const { filters, kernelSize } = layerInfo;
      const layer = getConvLayer(nj.array(filters), kernelSize);
      model.add(layer);
    } else if (layerInfo.type === 'maxPool2d') {
      const { poolSize } = layerInfo;
      const layer = getMaxPoolLayer(poolSize);
      model.add(layer);
    }
  }

  // train weights of network with loss equal to end act divided by an act from list and then subtract from list
  //
  const regularizerTerm = window.regularizerTerm;
  function loss(yPred, yTrue) {
    // test at location we care about, squared loss
    const y = Math.floor(yPred.shape[3] / 2);
    const x = Math.floor(yPred.shape[2] / 2);
    const yPredAtLocation = yPred.slice([0, 0, y, x], [yPred.shape[0], 1, 1, 1]).squeeze();
    const yTrueAtLocation = yTrue.slice([0, 0, y, x], [yTrue.shape[0], 1, 1, 1]).squeeze().div(regularizerTerm);
    return yPredAtLocation.sub(yTrueAtLocation).abs().mean().square();
  }
  // Prepare the model for training: Specify the loss and the optimizer.
  const learningRate = 0.1;
  const optimizer = tf.train.sgd(learningRate);
  model.compile({ loss, optimizer });
  model.summary();

  return model;
}

function formatData(dataSet) {
  // convert to tensors
  const allData = [];
  dataSet.forEach(d => {
    const dFormatted = nj['float32'](d.img).reshape([1, canvasSize, canvasSize, 4]).slice(null, null, null, 3).reshape([1, canvasSize, canvasSize]).tolist();
    allData.push(dFormatted);
  });
  const ys = dataSet.map(d => {
    // const size = 11;
    const size = 4;
    const half = Math.floor(size / 2);
    const y = nj.zeros([size, size]);
    y.set(half, half, d.act);

    return [y.tolist()];
  });
  return { xs: tf.tensor4d(allData), ys: tf.tensor4d(ys) };
}

async function train(networkSettings, kernels, dataSet, onFinished) {
  const model = getModel(networkSettings, kernels);
  const { xs, ys } = formatData(dataSet);
  console.log(tf.getBackend());
  console.log(tf.setBackend('webgl'));
  console.log(tf.getBackend());
  await model.fit(xs, ys, {
    epochs: 500,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(logs.loss);

        // unwrap new weights
        const updates = model.layers.map(layer => {
          const weights = layer.getWeights();
          if (weights.length > 0) {
            // [y, x, c, 1]
            const filters = nj['float32'](weights[0].arraySync()).transpose(3, 2, 0, 1).tolist();
            // const biases = weights[1].arraySync();
            const biases = [0];
            return { filters, biases };
          }
          return null;
        });

        onFinished(updates);

        console.log(tf.getBackend());
        console.log(tf.setBackend('webgl'));
        console.log(tf.getBackend());
      }
    }
  });
}

function NetworkTrainer(props) {

  const handleTrainClick = () => {
    // fetch dataSet
    const dataSet = window.dataSet;
    // generate images from dataURLs

    if (!dataSet || dataSet.length === 0) {
      return;
    }

    // build model from layerInfos
    train(props.networkSettings, props.kernels, dataSet, updates => {
      // update network settings and return
      const newNetworkSettings = { ...props.networkSettings };
      newNetworkSettings.layerInfos.forEach((layerInfo, i) => {
        if (layerInfo.filters) {
          // swap out with new filters and bias
          layerInfo.filters = updates[i + 1].filters;
        }
      });
      console.log('updates', updates);
      props.onUpdate(newNetworkSettings);
    });
  };

  const clearData = () => {
    window.dataSet = [];
  };

  return (
    <Grid container direction="column" spacing={1} alignItems="center">
      <Grid item style={{ width: '300px' }}>
        <Button style={{ marginLeft: '10px' }} variant="contained" size="small" color="primary" aria-label="train" onClick={handleTrainClick}>
          Train
        </Button>
        <Button style={{ marginLeft: '10px' }} variant="contained" size="small" color="primary" aria-label="train" onClick={clearData}>
          Clear Data
        </Button>
      </Grid>
    </Grid>
  );
}

NetworkTrainer.propTypes = {
  onUpdate: PropTypes.func.isRequired,
  networkSettings: PropTypes.object.isRequired
};

export default NetworkTrainer;

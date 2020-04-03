import * as tf from '@tensorflow/tfjs';
import nj from 'numjs';

function getLayerConv2DTranspose(filters) {
  // remove all negative values, since we only use this to calculate potential connections, not suppression
  filters = filters.map(outChannel => outChannel.map(inChannel => inChannel.map(row => row.map(v => v > 0 ? v : 0))));

  // kernels in: [out_filters, in_filters, h, w]
  // convert to: [h, w, in_filters, out_filters]
  const weights = nj.array(filters).transpose(2, 3, 1, 0).tolist();
  const biases = new Array(filters[0].length).fill(0);
  const weightsTensor = [tf.tensor4d(weights), tf.tensor1d(biases)];
  const layer = tf.layers.conv2dTranspose({
    filters: filters[0].length,
    kernelSize: filters[0][0].length,
    strides: 1,
    padding: 'valid',
    weights: weightsTensor,
    activation: 'relu',
    dataFormat: 'channelsFirst'
  });
  return layer;
}

function getLayerMaxPool2DTranspose(poolSize) {
  return tf.layers.upSampling2d({
    size: [ poolSize, poolSize ],
    dataFormat: 'channelsFirst'
  });
}

function deconvolve(layerTransposes, output, layerIndex) {
  let curr = tf.tensor4d(output);
  for (let i = layerIndex; i >= 0; i -= 1) {
    const layer = layerTransposes[i];
    curr = layer.apply(curr);
    // const tbs = curr.arraySync();
    // console.log('layer index', i);
    // tbs.forEach(tb => tb.forEach(d => console.table(d)));
    // tbs[0].forEach(tb => console.table(tb.map(row => row.map(col => col > 0 ? Number(col.toFixed(2)) : 0))));
  }
  let result = curr.arraySync();

  // format output
  return result[0][0];
}

// calculate the network shadow
export function getShadows(layerInfos) {
  const be = tf.getBackend();
  tf.setBackend('cpu');

  // get tf transpose layers
  const layerTransposes = layerInfos.map(layerInfo => {
    if (layerInfo.type === 'conv2d') {
      return getLayerConv2DTranspose(layerInfo.filters);
    } else if (layerInfo.type === 'maxPool2d') {
      return getLayerMaxPool2DTranspose(layerInfo.poolSize);
    }
    return null;
  });

  // calculate shadows for every channel output at each layer
  const shadows = [];
  let channels = 1; // inherit num channels from last layer
  for (const [i, layerInfo] of layerInfos.entries()) {
    if (layerInfo.type === 'conv2d') {
      channels = layerInfo.filters.length; // number of filters in this layer
    }

    const row = [];
    for (let j = 0; j < channels; j += 1) {
      const arr = nj.zeros([ 1, channels, 1, 1 ]);
      // init a high activation for this channel at this layer
      arr.set(0, j, 0, 0, 1);
      const shadow = deconvolve(layerTransposes, arr.tolist(), i);
      row.push(shadow);
    }
    shadows.push(row);
  }

  tf.setBackend(be).then(done => console.log(be + ' ready'));

  return shadows;
}

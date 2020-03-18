import nj from 'numjs';
import * as tf from '@tensorflow/tfjs';

const dtype = 'float32';

export function getActsAndLayer(filters, imgArr) {
  const inputShape = [1, imgArr.length, imgArr[0].length];
  const kernelSize = filters[0][0].length;
  const layer = getConvLayer(nj[dtype](filters), kernelSize, inputShape);


  const input = tf.tensor4d([[imgArr]]);
  tf.setBackend('webgl');
  const output = layer.apply(input);
  // const dsync = output.dataSync();
  // const acts = nj[dtype](dsync);
  const acts = output.arraySync()[0];

  return { acts, layer };
}

function getConvLayer(filters, kernelSize, inputShape=null) {
  // data format in: [out, in, h, w]
  // data format out: [filter_height, filter_width, in_channels, out_channels]
  const numOutputs = filters.shape[0];
  const weights = filters.transpose(2, 3, 1, 0).tolist();

  const weightsTensor = [tf.tensor4d(weights)];
  const layer = tf.layers.conv2d({
    filters: numOutputs,
    kernelSize: kernelSize,
    strides: 1,
    padding: 'same',
    weights: weightsTensor,
    activation: 'relu',
    dataFormat: 'channelsFirst',
    inputShape,
    useBias: false
  });
  return layer;
}

// execute a large convolution
function runConv(pxs0, pxs1) {
  if (pxs0.length !== pxs1.length || pxs0[0].length !== pxs1[0].length) {
    debugger;
  }
  let convSum = 0;
  for (let y = 0; y < pxs0.length; y += 1) {
    for (let x = 0; x < pxs0[0].length; x += 1) {
      convSum += pxs0[y][x] * pxs1[y][x];
    }
  }
  return convSum;
}

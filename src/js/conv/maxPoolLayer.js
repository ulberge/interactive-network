import nj from 'numjs';
import * as tf from '@tensorflow/tfjs';
import { dtype } from './convArray';

export default class MaxPoolLayer {
  constructor(input, output, poolSize) {
    this.input = input;
    this.output = output;
    this.poolSize = poolSize;
    this._tflayer = getMaxPoolLayer(poolSize);
    this.keepStats = true;
  }

  run() {
    // for pool layers, the padding is to the edge of each pool, so update bounds are the reduced dirty bounds
    const dirty = this.input.dirty;
    const updateBounds = this.input.dirtyBounds.map(b => Math.ceil(b / this.poolSize));
    const [ minX, minY, maxX, maxY ] = updateBounds;
    const h = maxY - minY;
    const w = maxX - minX;

    const size = h * w;
    const sizeThreshold = 3000;
    if (size > sizeThreshold) {
      // tf.setBackend('webgl');
      // console.log('opting to use webgl');
    } else {
      // tf.setBackend('cpu');
    }

    // tf backend
    const d = dirty.reshape([1, ...dirty.shape]).selection;
    const input = tf.tensor4d(d.data, d.shape);
    const output = this._tflayer.apply(input);
    const updateShape = [ this.output._channels, h, w ];
    const update = nj[dtype](output.dataSync()).reshape(updateShape);

    // tf.setBackend('cpu');

    this.output.assign(update, null, updateBounds);

    if (this.keepStats) {
      if (size > sizeThreshold) {
        this.output.calcStats(output, 'webgl');
      } else {
        this.output.calcStats(output, 'cpu');
      }
    }

    this.input.clean();
  }
}

export function getMaxPoolLayer(poolSize) {
  return tf.layers.maxPooling2d({ poolSize, dataFormat: 'channelsFirst' });
}

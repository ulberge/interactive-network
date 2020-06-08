import nj from 'numjs';
import * as tf from '@tensorflow/tfjs';
import { dtype } from './convArray';

export default class MaxPoolLayer {
  constructor(input, output, poolSize) {
    this.input = input;
    this.output = output;
    this.poolSize = poolSize;
    this._tflayer = tf.layers.maxPooling2d({ poolSize, dataFormat: 'channelsFirst' });
  }

  run() {
    // for pool layers, the padding is to the edge of each pool, so update bounds are the reduced dirty bounds
    const dirty = this.input.dirty;
    const updateBounds = this.input.dirtyBounds.map(b => Math.ceil(b / this.poolSize));
    const [ minX, minY, maxX, maxY ] = updateBounds;
    const h = maxY - minY;
    const w = maxX - minX;

    const d = dirty.reshape([1, ...dirty.shape]).selection;
    const input = tf.tensor4d(d.data, d.shape);
    const output = this._tflayer.apply(input);
    const updateShape = [ this.output._channels, h, w ];
    const update = nj[dtype](output.dataSync()).reshape(updateShape);

    this.output.assign(update, null, updateBounds);
    this.output.calcStats(output);
    this.input.clean();
  }
}

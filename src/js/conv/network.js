import ConvArray from './convArray';
import ConvLayer from './convLayer';
import MaxPoolLayer from './maxPoolLayer';
import { getShadows } from '../networkShadow';
import p5 from 'p5';
import * as tf from '@tensorflow/tfjs';
tf.enableProdMode();

export default class Network {
  constructor(inputShape, layerInfos, noShadows=false) {
    this.layerInfos = layerInfos;
    if (!noShadows) {
      this.shadows = getShadows(layerInfos);
    }

    // setup input and output data reps
    this.arrs = []; // should be length = layers.length + 1
    let channels = 1;
    let shape = inputShape;
    for (const layerInfo of layerInfos) {
      let arr;
      if (layerInfo.type === 'conv2d') {
        arr = ConvArray.conv(channels, shape, layerInfo.kernelSize);
        // next layer will have the channels created by this layer
        channels = layerInfo.filters.length;
        // we only allow a stride of 1 on convs for now
        // shape = ?
      } else if (layerInfo.type === 'maxPool2d') {
        arr = ConvArray.pool(channels, shape, layerInfo.poolSize);
        // pool layers only affect shape of layers in hyper column
        shape = shape.map(v => Math.ceil(v / layerInfo.poolSize));
      }
      this.arrs.push(arr);
    }
    // add a final arr for the output
    this.arrs.push(ConvArray.conv(channels, shape, 0));

    // setup layers
    this.layers = [];
    for (const [i, layerInfo] of layerInfos.entries()) {
      const input = this.arrs[i];
      const output = this.arrs[i + 1];
      let layer;
      if (layerInfo.type === 'conv2d') {
        const bias = i === 0 ? 0.5 : 0;
        layer = new ConvLayer(input, output, layerInfo.filters, layerInfo.kernelSize, bias);
      } else if (layerInfo.type === 'maxPool2d') {
        layer = new MaxPoolLayer(input, output, layerInfo.poolSize);
      }
      this.layers.push(layer);
    }

    // prune first layer kernels with no connection going forward?
  }

  /**
   * Given a change to the input layer, update all
   */
  run(dirty, dirtyBounds) {
    const backend = tf.getBackend();
    // update first layer
    this.arrs[0].assign(dirty, 0, dirtyBounds);

    // propogate through network by running layers
    // const t00 = Date.now();
    for (const [i, layer] of this.layers.entries()) {
      // const t0 = Date.now();
      layer.run();
      // const t1 = Date.now();
      // console.log('time for layer ' + i, t1 - t0);
    }
    // const t01 = Date.now();
    // console.log('total network time', t01 - t00);

    // mark last layer clean (or it will accumlate dirty!)
    this.arrs[this.arrs.length - 1].clean();
    tf.setBackend(backend);
  }

  getOutput(i) {
    const { arr: acts, _max: max, _ids: ids } = this.arrs[i + 1];
    return { acts, max, ids };
  }

  getScopedOutput(rect) {
    // given the rectangle bounds in the first layer, return all the arrs whose receptive fields touch it
    const arrs = [];
    let currRect = rect;
    for (let i = 0; i < this.layerInfos.length; i += 1) {
      const layerInfo = this.layerInfos[i];
      const [ sx, sy, w, h ] = currRect;
      if (layerInfo.type === 'conv2d') {
        arrs.push(this.arrs[i + 1].arr.slice(null, [sy, sy + h], [sx, sx + w]));
      } else if (layerInfo.type === 'maxPool2d') {
        const { poolSize } = layerInfo;
        currRect = [
          Math.floor(sx  / poolSize),
          Math.floor(sy  / poolSize),
          Math.ceil(w / poolSize),
          Math.ceil(h / poolSize)
        ];
        const [ sx2, sy2, w2, h2 ] = currRect;
        arrs.push(this.arrs[i + 1].arr.slice(null, [sy2, sy2 + h2], [sx2, sx2 + w2]));
      }
      // console.log(layerInfo.type, currRect);
    }
    return arrs;
  }

  getShadowOffset(layerIndex, location) {
    // if all the layers have "same" padding, then you should be able to multiply the stride?
    let xOffset = 1;
    let yOffset = 1;
    for (let layerInfo of this.layerInfos) {
      xOffset *= layerInfo.poolSize || 1;
      yOffset *= layerInfo.poolSize || 1;
    }
    const { x, y } = location;
    return new p5.Vector(x * xOffset, y * yOffset);
  }

  noStats() {
    for (const layer of this.layers) {
      layer.keepStats = false;
    }
  }
}

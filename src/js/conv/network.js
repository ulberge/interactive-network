import ConvArray from './convArray';
import ConvLayer from './convLayer';
import MaxPoolLayer from './maxPoolLayer';

export default class Network {
  constructor(inputShape, layerInfos) {
    this.layerInfos = layerInfos;

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
        layer = new ConvLayer(input, output, layerInfo.filters, layerInfo.kernelSize);
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
    // update first layer
    this.arrs[0].assign(dirty, 0, dirtyBounds);

    // propogate through network by running layers
    const t00 = Date.now();
    for (const [i, layer] of this.layers.entries()) {
      const t0 = Date.now();
      layer.run();
      const t1 = Date.now();
      console.log('time for layer ' + i, t1 - t0);
    }
    const t01 = Date.now();
    console.log('total network time', t01 - t00);

    // mark last layer clean (or it will accumlate dirty!)
    this.arrs[this.arrs.length - 1].clean();
  }

  getOutput(i) {
    const { arr: acts, _max: max, _ids: ids } = this.arrs[i + 1];
    return { acts, max, ids };
  }
}

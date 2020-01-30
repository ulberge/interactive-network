import nj from 'numjs';
import { dilateBounds, limitBounds } from './helpers';
import cwise from 'cwise';
import ops from 'ndarray-ops';
// import { GPU } from 'gpu.js';
import * as tf from '@tensorflow/tfjs';
tf.setBackend('cpu');

export const dtype = 'float32';

// https://observablehq.com/@ukabuer/image-convolution-using-gpu-js
// const gpu = new GPU();
// const convolve = (src, kernel) => {
//   const kernelSize = kernel.length;
//   const pad = (kernelSize - 1) / 2;
//   const [ inputHeight, inputWidth ] = src.shape;
//   const outputHeight = inputHeight - pad;
//   const outputWidth = inputWidth - pad;

//   const convolution = gpu.createKernel(function (src, width, height, kernel, kernelSize) {
//     const pad = (kernelSize - 1) / 2;

//     let i = -pad;
//     let result = 0;
//     while (i <= pad) {
//       const x = this.thread.x + i;
//       if (x < 0 || x >= width) {
//         i++;
//         continue;
//       }

//       let j = -pad;
//       while (j <= pad) {
//         const y = this.thread.y + j;
//         if (y < 0 || y >= height) {
//           j++;
//           continue;
//         }

//         const kernelOffset = ((j + pad) * kernelSize) + i + pad;
//         const weights = kernel[kernelOffset];
//         result += src[y][x] * weights;
//         j++;
//       }
//       i++;
//     }
//     this.color(result, 0, 0);
//   }).setOutput([image.width, image.height]);
// }

function getConvLayer(filters, kernelSize) {
  // data format in: [out, in, h, w]
  // data format out: [filter_height, filter_width, in_channels, out_channels]
  // -> filters: A Tensor. Must have the same type as input. A 4-D tensor of shape
  const numOutputs = filters.shape[0];
  const weights = filters.transpose(2, 3, 1, 0).tolist();
  // const biases = nj.zeros([numOutputs]).tolist();
  // const weightsTensor = [tf.tensor4d(weights), tf.tensor1d(biases)];
  const weightsTensor = [tf.tensor4d(weights)];
  const layer = tf.layers.conv2d({
    filters: numOutputs,
    kernelSize: kernelSize,
    strides: 1,
    padding: 'valid',
    weights: weightsTensor,
    activation: 'relu',
    dataFormat: 'channelsFirst',
    useBias: false
  });
  return layer;
}

// const argmax = cwise({
//   args: ['array'],
//   pre: function() {
//     this.max = 0;
//     this.max_index = -1;
//   },
//   body: function(i, a) {
//     if(a > this.max) {
//       this.max = a;
//       this.max_index = i;
//     }
//   },
//   post: function() {
//     return [ this.max, this.max_index ]
//   }
// });

const relu = cwise({
  args: ['array'],
  body: function(a) {
    a = a > 0 ? a : 0;
  }
});

// A wrapper to simplify the update and retrieval of 2D array slices for convolutions
export class ConvArray {
  constructor(channels, shape, kernelSize, stride) {
    // console.log('create ConvArray');
    // shape of the editable area
    this._shape = shape;
    // settings for convolutions that will be applied to this array (necessary for calculating valid slices)
    this._stride = stride;
    this._pad = Math.floor(kernelSize / 2);
    // backing array with extra padding on sides for valid convolution
    const [ h, w ] = this._shape.map(v => v + (this._pad * 2));
    this._channels = channels;
    this._arr = nj.zeros([channels, h, w], dtype);

    // max data
    this._ids = nj.zeros(this._shape, 'int8').assign(-1, false);
    this._max = nj.zeros(this._shape, dtype);

    // 4-tuple containing bounds of area that has been changed, coordinates relative to editable area
    this._dirtyBounds = null;
  }

  static pool(channels, shape, poolSize) {
    return new ConvArray(channels, shape, 0, poolSize);
  }

  static conv(channels, shape, kernelSize, stride=1) {
    return new ConvArray(channels, shape, kernelSize, stride);
  }

  /**
   * Previous layer assigns its calculations to the editable area
   */
  assign(arr, channel, bounds) {
    if (channel === null) {
      this._slice(bounds).assign(arr, false);
    } else {
      this._slice(bounds).slice([channel, channel + 1], null, null).assign(arr, false);
    }
    this._updateDirtyBounds(bounds);
  }

  /**
   * Clears the dirtyBounds
   */
  clean() {
    this._dirtyBounds = null;
  }

  /**
   * Clears the dirtyBounds
   */
  calcStats() {
    if (this._dirtyBounds) {
      const [ minX, minY, maxX, maxY ] = this._dirtyBounds;
      const visible = this._slice();
      for (let y = minY; y < maxY; y += 1) {
        for (let x = minX; x < maxX; x += 1) {
          const xSel = [x, (x + 1)];
          const ySel = [y, (y + 1)];
          const column = visible.slice(null, ySel, xSel);
          const id = ops.argmax(column.selection)[0];
          const max = column.max();
          this._ids.set(y, x, id);
          this._max.set(y, x, max);
        }
      }
    }
  }

  /**
   * Get the dirty area plus padding so that valid convolutions will happen on any convolution that touches
   * the dirty pixels.
   */
  get dirty() {
    if (!this._dirtyBounds) {
      return null;
    }
    return this._slice(this.dirtyBounds);
  }

  /**
   * Gets the dirty bounds with respect to what the next layer cares about
   */
  get dirtyBounds() {
    if (!this._dirtyBounds) {
      return null;
    }

    let bounds = this._dirtyBounds;

    if (this._pad !== 0) {
      // at a minimum, expand the bounds by twice the kernel padding
      bounds = dilateBounds(this._dirtyBounds, this._pad * 2);
      // limit to the editable area
      bounds = limitBounds(bounds, this._outerBounds);
    }

    if (this._stride !== 1) {
      // match the bounds to the beginning and end of a stride
      bounds = bounds.map(b => b / this._stride);
      const [ sx, sy, ex, ey ] = bounds;
      bounds = [ Math.floor(sx), Math.floor(sy), Math.ceil(ex), Math.ceil(ey) ];
      bounds = bounds.map(b => b * this._stride);
    }

    return bounds;
  }

  /**
   * Return the editable array (not including padding around edges)
   */
  get arr() {
    return this._slice([ 0, 0, this._shape[1], this._shape[0] ]);
  }

  get _outerBounds() {
    return [ -this._pad, -this._pad, this._shape[1] + this._pad, this._shape[0] + this._pad ];
  }

  /**
   * Slice that allows negative values to represent outside of legal area
   */
  _slice(bounds=null) {
    if (!bounds) {
      bounds = [ 0, 0, ...this._shape ];
    }
    const [ sx, sy, ex, ey ] = bounds;
    return this._arr.slice(null, [ sy + this._pad, ey + this._pad ], [ sx + this._pad, ex + this._pad ]);
  }

  /**
   * Expand the dirty bounds to include the given bounds
   */
  _updateDirtyBounds(bounds) {
    if (!this._dirtyBounds) {
      this._dirtyBounds = bounds;
    } else {
      const [ sx, sy, ex, ey ] = bounds;
      const [ dsx, dsy, dex, dey ] = this._dirtyBounds;
      this._dirtyBounds = [ Math.min(sx, dsx), Math.min(sy, dsy), Math.max(ex, dex), Math.max(ey, dey) ];
    }
  }

  print() {
    this.arr.tolist().forEach(c => console.table(c));
  }

  printBacking() {
    this._arr.tolist().forEach(c => console.table(c));
  }
}

export class ConvLayer {
  constructor(input, output, filters, kernelSize) {
    this.input = input;
    this.output = output;
    this._pad = Math.floor(kernelSize / 2);
    this._rawFilters = filters;
    this.filters = filters.map(filter => filter.map(kernel => kernel ? nj[dtype]([kernel]) : null));
    this._tflayer = getConvLayer(nj[dtype](filters.map(filter => filter.map(kernel => kernel ? kernel : nj.zeros([kernelSize, kernelSize], dtype).tolist()))), kernelSize);
  }

  run() {
    const dirty = this.input.dirty;


    // updateBounds for this layer will be the dirtyBounds eroded by the padding for convolution
    const updateBounds = dilateBounds(this.input.dirtyBounds, -this._pad);
    const [ minX, minY, maxX, maxY ] = updateBounds;
    const h = maxY - minY;
    const w = maxX - minX;


    // for (const [outChannel, filter] of this.filters.entries()) {
    //   const sum = nj.zeros([ 1, h, w ]);
    //   for (const [inChannel, kernel] of filter.entries()) {
    //     if (!kernel) {
    //       // ignore null kernels (they are empty, this is a sparse network)
    //       continue;
    //     }

    //     const dirtySlice = dirty.slice([ inChannel, inChannel + 1 ], null, null);
    //     const update = nj.convolve(dirtySlice, kernel);
    //     sum.add(update, false);
    //   }

    //   // relu
    //   relu(sum.selection);
    //   this.output.assign(sum, outChannel, updateBounds);
    // }

    // tf backend
    const d = dirty.reshape([1, ...dirty.shape]).selection;
    const input = tf.tensor4d(d.data, d.shape);
    const output = this._tflayer.apply(input);
    const updateShape = [ this.output._channels, h, w ];
    const update = nj[dtype](output.dataSync()).reshape(updateShape);
    this.output.assign(update, null, updateBounds);

    this.output.calcStats();

    this.input.clean();
  }
}

export class MaxPoolLayer {
  constructor(input, output, poolSize) {
    this.input = input;
    this.output = output;
    this.poolSize = poolSize;
  }

  run() {
    // for pool layers, the padding is to the edge of each pool, so update bounds are the reduced dirty bounds
    const dirty = this.input.dirty;
    const updateBounds = this.input.dirtyBounds.map(b => b / this.poolSize);
    const [ minX, minY, maxX, maxY ] = updateBounds;
    const h = maxY - minY;
    const w = maxX - minX;

    // calculate update
    for (let i = 0; i < dirty.shape[0]; i += 1) {
      const update = nj.zeros([ 1, h, w ]);
      for (let y = 0; y < h; y += 1) {
        for (let x = 0; x < w; x += 1) {
          const xSel = [x * this.poolSize, (x + 1) * this.poolSize];
          const ySel = [y * this.poolSize, (y + 1) * this.poolSize];
          const poolSlice = dirty.slice([i, i + 1], ySel, xSel);
          const max = poolSlice.max();
          update.set(0, y, x, max);
        }
      }
      this.output.assign(update, i, updateBounds);
    }
    this.output.calcStats();

    this.input.clean();
  }
}

export class Network {
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
      console.log('layer ' + i, t1 - t0);
    }
    const t01 = Date.now();
    console.log('total network time', t01 - t00);

    // mark last layer clean (or it will accumlate dirty!)
    this.arrs[this.arrs.length - 1].clean();
  }
}

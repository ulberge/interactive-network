import nj from 'numjs';
import * as tf from '@tensorflow/tfjs';

export const dtype = 'float32';

// A wrapper to simplify the update and retrieval of 2D array slices for convolutions
export default class ConvArray {
  constructor(channels, shape, kernelSize, stride) {
    // console.log('create ConvArray');
    // shape of the editable area
    this._shape = shape;
    // settings for convolutions that will be applied to this array (necessary for calculating valid slices)
    this._stride = stride;
    this._pad = Math.floor(kernelSize / 2);
    // backing array with extra padding on sides for valid convolution
    let outerShape;
    if (this._pad !== 0) {
      // for conv2d filters with stride===1
      outerShape = this._shape.map(v => v + (this._pad * 2));
      this._outerBounds = [ -this._pad, -this._pad, this._shape[1] + this._pad, this._shape[0] + this._pad ];
    } else {
      // for maxPool2d filters, need extra padding to width and height to be divisible by pool size
      outerShape = shape.map(v => Math.ceil(v / this._stride) * this._stride);
      this._outerBounds = [ 0, 0, outerShape[1], outerShape[0] ];
    }

    const [ h, w ] = outerShape;
    this._channels = channels;
    this._arr = nj.zeros([channels, h, w], dtype);

    // max data
    this._ids = nj.zeros(this._shape, 'int32').assign(-1, false);
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
  calcStats(outputTensor) {
    if (this._dirtyBounds) {
      const [ minX, minY, maxX, maxY ] = this._dirtyBounds;
      const h = maxY - minY;
      const w = maxX - minX;

      const times = [];
      let ct0 = Date.now();
      let ct1;

      times.push(tf.getBackend());
      const idsT = outputTensor.argMax(1);

      ct1 = Date.now();
      times.push('argmax -> ');
      times.push(ct1 - ct0);
      ct0 = ct1;

      times.push(tf.getBackend());
      const dsync = idsT.dataSync();

      ct1 = Date.now();
      times.push('data sync -> ');
      times.push(ct1 - ct0);
      ct0 = ct1;

      times.push(tf.getBackend());
      let idsUpdate = nj['int32'](dsync);
      idsUpdate = idsUpdate.reshape([ h, w ]);
      const idsSlice = this._ids.slice([minY, maxY], [minX, maxX]);
      idsSlice.assign(idsUpdate, false);

      ct1 = Date.now();
      times.push('update _ids -> ');
      times.push(ct1 - ct0);
      ct0 = ct1;

      // gather max
      times.push(tf.getBackend());
      const flatOutputTensor = outputTensor.reshape([-1]);
      const flatIdsTensor = idsT.reshape([-1]);
      const layerOffsets = tf.mul(flatIdsTensor, tf.scalar(w * h, 'int32'));
      const withinLayerOffsets = tf.range(0, h * w, 1, 'int32');
      const idLookups = tf.add(layerOffsets, withinLayerOffsets);

      ct1 = Date.now();
      times.push('prepare gather -> ');
      times.push(ct1 - ct0);
      ct0 = ct1;

      times.push(tf.getBackend());
      const maxT = flatOutputTensor.gather(idLookups);

      ct1 = Date.now();
      times.push('gather -> ');
      times.push(ct1 - ct0);
      ct0 = ct1;

      times.push(tf.getBackend());
      const maxUpdate = nj[dtype](maxT.dataSync()).reshape([ h, w ]);
      const maxSlice = this._max.slice([minY, maxY], [minX, maxX]);
      maxSlice.assign(maxUpdate, false);

      ct1 = Date.now();
      times.push('update _max -> ');
      times.push(ct1 - ct0);
      ct0 = ct1;

      console.log('calc stats:', 'total time -> ', times.reduce((a, b) => Number.isInteger(b) ? a + b : a, 0), ...times);
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

    // for conv2d kernels with stride=1
    if (this._pad !== 0) {
      // at a minimum, expand the bounds by twice the kernel padding
      bounds = dilateBounds(this._dirtyBounds, this._pad * 2);
      // limit to the editable area
      bounds = limitBounds(bounds, this._outerBounds);
    }

    // for maxPool2d kernels
    if (this._stride !== 1) {
      // match the bounds to the beginning and end of a stride (limited by backing array)
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

// reduce bounds to be within limits
export function limitBounds(bounds, limit) {
  if (!bounds || !limit) {
    return bounds;
  }

  // update with most extreme
  const [ minX0, minY0, maxX0, maxY0 ] = bounds;
  const [ minX1, minY1, maxX1, maxY1 ] = limit;
  const minX = Math.max(minX0, minX1);
  const minY = Math.max(minY0, minY1);
  const maxX = Math.min(maxX0, maxX1);
  const maxY= Math.min(maxY0, maxY1);
  return [ minX, minY, maxX, maxY ];
}

// Eat away padding amount from 2D array
export function dilateBounds(selection, padding) {
  if (!selection || selection.length === 0 || !padding) {
    return selection;
  }
  let [ minX, minY, maxX, maxY ] = selection;

  return [ minX - padding, minY - padding, maxX + padding, maxY + padding ];
}

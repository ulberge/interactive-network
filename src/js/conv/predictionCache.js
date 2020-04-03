import * as tf from '@tensorflow/tfjs';
import nj from 'numjs';

function getConnectionMapsValid(inputShape, outputShape, strides, kernelShape) {
  const toNextArray = nj.zeros(inputShape).tolist();
  const toPrevArray = nj.zeros(outputShape).tolist();

  // Record min and max positions from input for output
  toPrevArray.forEach((row, y) => row.forEach((col, x) => {
    const yMin = y * strides[0];
    const yMax = yMin + kernelShape[0] - 1;
    const xMin = x * strides[1];
    const xMax = xMin + kernelShape[1] - 1;
    toPrevArray[y][x] = { min: [yMin, xMin], max: [yMax, xMax] };

    // Keep track of min and max in output for each input
    for (let py = yMin; py <= yMax; py += 1) {
      for (let px = xMin; px <= xMax; px += 1) {
        if (!toNextArray[py][px]) {
          // Nothing set, so just insert
          toNextArray[py][px] = { min: [y, x], max: [y, x] };
        } else {
          // Compare to current and choose most extreme
          const { min, max } = toNextArray[py][px];
          const update = { min, max };
          if (y <= min[0] && x <= min[1]) {
            update.min = [y, x];
          }
          if (y >= max[0] && x >= max[1]) {
            update.max = [y, x];
          }
          toNextArray[py][px] = update;
        }
      }
    }
  }));

  return { toNextArray, toPrevArray };
}

function getConnectionMapsSame(inputShape, outputShape, strides, kernelShape) {
  const toNextArray = nj.zeros(inputShape).tolist();
  const toPrevArray = nj.zeros(outputShape).tolist();

  // Record min and max positions from input for output
  toPrevArray.forEach((row, y) => row.forEach((col, x) => {
    let yMin = (y * strides[0]) - ((kernelShape[0] - 1) / 2);
    let yMax = yMin + kernelShape[0] - 1;
    let xMin = (x * strides[1]) - ((kernelShape[1] - 1) / 2);
    let xMax = xMin + kernelShape[1] - 1;

    yMin = Math.max(0, yMin);
    xMin = Math.max(0, xMin);
    yMax = Math.min(outputShape[0] - 1, yMax);
    xMax = Math.min(outputShape[1] - 1, xMax);

    toPrevArray[y][x] = {
      min: [
        yMin,
        xMin
      ],
      max: [
        yMax,
        xMax
      ]
    };

    // Keep track of min and max in output for each input
    for (let py = yMin; py <= yMax; py += 1) {
      for (let px = xMin; px <= xMax; px += 1) {
        if (!toNextArray[py][px]) {
          // Nothing set, so just insert
          toNextArray[py][px] = { min: [y, x], max: [y, x] };
        } else {
          // Compare to current and choose most extreme
          const { min, max } = toNextArray[py][px];
          const update = { min, max };
          if (y <= min[0] && x <= min[1]) {
            update.min = [y, x];
          }
          if (y >= max[0] && x >= max[1]) {
            update.max = [y, x];
          }
          toNextArray[py][px] = update;
        }
      }
    }
  }));

  return { toNextArray, toPrevArray };
}

// Should work for conv2d, max pool, avg pool, and pass through layers...
function getConnectionMaps(layers, inputShapeStart, savedTensors) {
  return this.layers.map((layer, i) => {
    let inputShape;
    if (i === 0) {
      inputShape = inputShapeStart.slice(-2);
    } else {
      inputShape = savedTensors[i - 1].shape.slice(-2);
    }
    const outputShape = savedTensors[i].shape.slice(-2);

    // Calc from layer info
    const strides = layer.strides;
    const kernelShape = layer.kernelShape;
    const padding = layer.padding;
    debugger;

    if (padding === 'same') {
      return getConnectionMapsSame(inputShape, outputShape, strides, kernelShape);
    } else if (padding === 'valid') {
      return getConnectionMapsValid(inputShape, outputShape, strides, kernelShape);
    }

    debugger;
    return null;
  });
}

function getSavedTensorsForZeroImage(layers, inputShape) {
  const empty = tf.zeros(inputShape);

  const savedTensors = [];
  let inputTensor = empty;
  this.layers.forEach(layer => {
    const savedTensor = tf.tidy(() => {
      return layer.apply(inputTensor);
    });
    savedTensors.push(savedTensor);
    inputTensor = savedTensor;
  });

  return savedTensors;
}

// Given the change area (2d), return the scope area (2d) necessary for convolution
function getBounds(toNextArray, toPrevArray, dirtyStart, dirtySize) {
  // Get the bounds in output affected by this dirty area
  const dirtyStartNext = toNextArray[dirtyStart[0]][dirtyStart[1]].min;
  const dirtyEndNext = toNextArray[dirtyStart[0] + dirtySize[0]][dirtyStart[1] + dirtySize[1]].max;
  const dirtySizeNext = [dirtyEndNext[0] - dirtyStartNext[0], dirtyEndNext[1] - dirtyStartNext[1]];

  // Get the bounds of input connected to bounds in output affected by this dirty area
  const scopeStart = toPrevArray[dirtyStartNext[0]][dirtyStartNext[1]].min;
  const scopeEnd = toPrevArray[dirtyStartNext[0] + dirtySizeNext[0]][dirtyStartNext[1] + dirtySizeNext[1]].max;
  const scopeSize = [scopeEnd[0] - scopeStart[0], scopeEnd[1] - scopeStart[1]];

  return { scopeStart, scopeSize, dirtyStartNext, dirtySizeNext };
}

export default class PredictionCache {
  constructor(layers, inputShape) {
    this.layers = layers;
    // Calc savedTensors by running once with an empty input
    this.savedTensors = getSavedTensorsForZeroImage(this.layers, inputShape);
    // Calc maps to and from layers
    this.connectionMaps = getConnectionMaps(this.layers, inputShape);
  }

  /**
   * Return the editable array (not including padding around edges)
   */
  get outputs() {
    return this.savedTensors.map(t => t.arraySync()[0]);
  }

  // Given a current version of the input tensor and the area that has been updated, update the
  // output tensors at every layer for this network.
  predict(inputTensor, dirtyStart, dirtySize) {
    // Iterate through the layers, only updating based on what has been updated in the previous layer
    this.layers.forEach((layer, i) => {
      tf.tidy(() => {
        // Based on the dirty area, calculate the bounds of the connected areas in the input and output
        const { toNextArray, toPrevArray } = this.connectionMaps[i];
        const { scopeStart, scopeSize, dirtyStartNext, dirtySizeNext } = getBounds(toNextArray, toPrevArray, dirtyStart, dirtySize);
        // Cut out the area of the input that is connected to affected areas in the output
        const inputTensorScoped = inputTensor.slice3d([-1, ...scopeStart], [-1, ...scopeSize]);
        const outputTensorScoped = layer.apply(inputTensorScoped);

        // TODO: Same padding will yield extra results that need to be trimmed
        // if (layer.isSamePadding) {
        //   // Calc offset in scoped output and slice
        // }

        // Create new saved tensor from previous tensor and updated area
        // Create a mask of updated area
        const mask = tf.fill(dirtySizeNext, 0);
        // Create version of saved tensor with updated area zeroed out
        const savedTensor = this.savedTensors[i];
        const masked = savedTensor.mult(mask);

        // Create padded version of scoped output to add to masked
        const startPad = [dirtyStartNext.y, savedTensor.shape[1] - dirtyStartNext[0] - dirtySizeNext[0]];
        const endPad = [dirtyStartNext.x, savedTensor.shape[2] - dirtyStartNext[1] - dirtySizeNext[1]];
        const update = outputTensorScoped.pad3d([[0, 0], startPad, endPad]);

        // Save updated tensor
        const savedTensorUpdated = tf.keep(masked.add(update));
        this.savedTensors[i] = savedTensorUpdated;


        // Use this as the input tensor for the next iteration
        inputTensor = savedTensorUpdated;
        dirtyStart = dirtyStartNext;
        dirtySize = dirtySizeNext;
      });
    });
  }
}

// Add cache to existing model
export function enableCache(model) {
  const layers = model.layers;
  const inputShape = model.inputShape;
  model._predictionCache = new PredictionCache(layers, inputShape);
  model.predictCache = (inputTensor, dirtyStart, dirtySize) => {
    return model._predictionCache.predict(inputTensor, dirtyStart, dirtySize);
  };
}

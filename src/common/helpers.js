import * as tf from '@tensorflow/tfjs';

/* global nj */


// Returns the result of a given a layer applied to an image as a 2D array.
export function eval2DArray(layer, imgArr) {
  const imgArr_f = [imgArr.map(row => row.map(col => [col]))];
  let curr = tf.tensor4d(imgArr_f);
  const result = layer.apply(curr).arraySync();

  // format output
  let out = nj.array(result[0]);
  out = out.transpose(2, 0, 1);
  return out.tolist();
}

// make array add up to 1
export function normalize(arr) {
  let sum = arr.reduce((a, b) => a + b, 0);
  if (sum === 0) {
    return arr.map(v => (1 / arr.length));
  }
  return arr.map(v => (v / sum));
}

// choose index from array with probability equal to relative value
export function choose(arr) {
  const arr_n = normalize(arr);
  const selector = Math.random();
  let cursor = 0;
  for (let i = 0; i < arr_n.length; i += 1) {
    cursor += arr_n[i];
    if (selector <= cursor) {
      return i;
    }
  }
}

// normalize 3D array based on max positive value
export function scale3DArray(arr3D) {
  let maxPos = 0;
  arr3D.forEach(arr2D => arr2D.forEach(arr => arr.forEach(val => {
    if (val > 0 && val > maxPos) {
      maxPos = val;
    }
  })));
  const scale = maxPos || 1;

  // scale all values by this number
  const arr3DScaled = arr3D.map(arr2D => arr2D.map(arr => arr.map(val => val / scale)));
  return arr3DScaled;
}

/**
 * Returns an empty 2D array
 * @param {int} rows - Number of rows in the array
 * @param {int} columns - Number of columns in the array
 * @param defaultValue - Default value for new array cells
 */
export function getEmpty2DArray(rows, columns, defaultValue = null) {
  const arr = new Array(rows);
  for (let i = 0; i < rows; i += 1) {
    arr[i] = new Array(columns);
    for (let j = 0; j < columns; j += 1) {
      arr[i][j] = defaultValue;
    }
  }
  return arr;
}

export function getGaborSize(sigma, theta, gamma) {
    const sigma_x = sigma;
    const sigma_y = sigma / gamma;

    // Bounding box
    const nstds = 3;  // Number of standard deviation sigma
    let xmax = Math.max(Math.abs(nstds * sigma_x * Math.cos(theta)), Math.abs(nstds * sigma_y * Math.sin(theta)));
    xmax = Math.floor(Math.max(1, xmax));
    let ymax = Math.max(Math.abs(nstds * sigma_x * Math.sin(theta)), Math.abs(nstds * sigma_y * Math.cos(theta)));
    ymax = Math.floor(Math.max(1, ymax));
    const xmin = -xmax;
    const ymin = -ymax;

    return Math.max(xmax - xmin, ymax - ymin);
}

// A port of Python gabor implementation to JS
// https://en.wikipedia.org/wiki/Gabor_filter
export function getGaborFilter(sigma, theta, lambda, psi, gamma, windowSize) {
    const sigma_x = sigma;
    const sigma_y = sigma / gamma;

    // Bounding box
    const nstds = 3;  // Number of standard deviation sigma
    let xmax = Math.max(Math.abs(nstds * sigma_x * Math.cos(theta)), Math.abs(nstds * sigma_y * Math.sin(theta)));
    xmax = Math.floor(Math.max(1, xmax));
    let ymax = Math.max(Math.abs(nstds * sigma_x * Math.sin(theta)), Math.abs(nstds * sigma_y * Math.cos(theta)));
    ymax = Math.floor(Math.max(1, ymax));
    const xmin = -xmax;
    const ymin = -ymax;

    const filter = getEmpty2DArray(windowSize, windowSize, 0);

    const yOffset = Math.floor((windowSize - (ymax - ymin)) / 2);
    const xOffset = Math.floor((windowSize - (xmax - xmin)) / 2);

    for (let y = ymin; y <= ymax; y += 1) {
      for (let x = xmin; x <= xmax; x += 1) {
        // Rotation
        const x_theta = x * Math.cos(theta) + y * Math.sin(theta);
        const y_theta = -x * Math.sin(theta) + y * Math.cos(theta);

        // restrict vals to center bulge and side dips
        const cosVal = 2 * Math.PI / lambda * x_theta + psi;
        let gb = 0;
        if (Math.abs(cosVal) < (Math.PI * 1.5)) {
          gb = Math.exp(-.5 * (x_theta ** 2 / sigma_x ** 2 + y_theta ** 2 / sigma_y ** 2)) * Math.cos(cosVal);
        }

        const yIndex = y - ymin + yOffset;
        const xIndex = x - xmin + xOffset;
        if (yIndex >= 0 && yIndex < windowSize && xIndex >= 0 && xIndex < windowSize) {
          filter[y - ymin + yOffset][x - xmin + xOffset] = gb;
        }
      }
    }

    return filter;
}

export function getGaborFilters(numChannels, lambda, gamma, sigma, windowSize) {
  const thetaDelta = Math.PI / numChannels;
  const filters = [];
  for (let i = 0; i < numChannels; i += 1) {
    const psi = 0; // offset
    const theta = thetaDelta * i;
    const filter = getGaborFilter(sigma, theta, lambda, psi, gamma, windowSize);
    if (filter) {
      filters.push(filter);
    }
  }
  return filters;
}

export function getLayer(filters, strides=1) {
  const kernel = filters.map(filter => [filter]);
  const weights = nj.array(kernel).transpose(2, 3, 1, 0).tolist();
  const biases = new Array(kernel.length).fill(0);
  const weightsTensor = [tf.tensor4d(weights), tf.tensor1d(biases)];
  const layer = tf.layers.conv2d({
    filters: kernel.length,
    kernelSize: filters[0].length,
    strides: strides,
    padding: 'valid',
    weights: weightsTensor,
    activation: 'relu',
    name: 'conv1'
  });
  return layer;
}

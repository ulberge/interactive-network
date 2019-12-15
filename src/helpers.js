
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
export function gabor(sigma, theta, Lambda, psi, gamma, windowSize) {
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

    const maxSize = Math.max(xmax - xmin, ymax -ymin);
    if (windowSize < maxSize) {
      console.log('Window size too small at ' + windowSize + '. Needs to be ' + maxSize);
      return
    } else {
      // console.log('Window size is ' + windowSize + '. Could be ' + maxSize);
    }
    for (let y = ymin; y <= ymax; y += 1) {
      for (let x = xmin; x <= xmax; x += 1) {
        // Rotation
        const x_theta = x * Math.cos(theta) + y * Math.sin(theta);
        const y_theta = -x * Math.sin(theta) + y * Math.cos(theta);

        const gb = Math.exp(-.5 * (x_theta ** 2 / sigma_x ** 2 + y_theta ** 2 / sigma_y ** 2)) * Math.cos(2 * Math.PI / Lambda * x_theta + psi);
        filter[y - ymin + yOffset][x - xmin + xOffset] = gb;
      }
    }

    return filter;
}

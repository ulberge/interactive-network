import p5 from 'p5';

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

export function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

// copy 2d array
export function deepCopy(arr2D) {
  if (arr2D.length === 0) {
    return [];
  }

  return arr2D.map(row => row.slice(0));
  // return JSON.parse(JSON.stringify(arr2D));

  // speed test
  // (function testSpeed() {
  //   const deepCopy = a => {
  //     if (a.length === 0) {
  //       return [];
  //     }

  //     // return a.map(row => row.slice(0));
  //     return a.slice(0);
  //     // const b = [];
  //     // let i = a.length;
  //     // while (i--) {
  //     //   let c = [];
  //     //   let j = a[i].length;
  //     //   while (j--) {
  //     //     c[j] = a[i][j];
  //     //   }
  //     //   b[i] = c;
  //     //   b[i] = a[i].slice(0);
  //     // }
  //     // return b;
  //   };

  //   const rows = 800;
  //   const cols = 600;
  //   const arr = new Array(rows);
  //   for (let i = 0; i < rows; i += 1) {
  //     arr[i] = new Array(cols);
  //     for (let j = 0; j < cols; j += 1) {
  //       arr[i][j] = 1;
  //     }
  //   }
  //   console.time('timer');
  //   JSON.parse(JSON.stringify(arr));
  //   for (let i = 0; i < 100; i++) {
  //     deepCopy(arr);
  //     // JSON.parse(JSON.stringify(arr));
  //   }
  //   console.timeEnd('timer');
  // })();
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

// Given a pixel array (from a graphics object, ie. transparent background) and the shape, return the image
export const getImgArrFromPixels = (pixels, width) => {
  const imgArr = [];
  let row = [];
  for (let i = 3; i < pixels.length; i += 4) {
    // use opacity since this a graphics object
    row.push(pixels[i] / 255);
    if (row.length === width) {
      imgArr.push(row);
      row = [];
    }
  }
  return imgArr;
}

export function delay(timer) {
  return new Promise(resolve => setTimeout(() => resolve(), timer));
}

// Return the list of pixels within N steps (including diagonal steps as 1 step) from the given pixel within bounds
export function getPixelsWithinDistance(pixel, N, bounds) {
  const { x: cx, y: cy } = pixel;
  const [ sx, sy, ex, ey ] = bounds;
  const neighbors = [];
  for (let y = cy - N; y <= (cy + N); y += 1) {
    if (y < sy || y >= ey) {
      continue;
    }
    for (let x = cx - N; x <= (cx + N); x += 1) {
      if (x < sx || x >= ex) {
        continue;
      }

      neighbors.push(new p5.Vector(x, y));
    }
  }
  return neighbors;
}

// Return a unique list of pixels within N steps (including diagonal steps as 1 step) from the supplied pixels within bounds
export function getUniqueNeighbors(pixels, N, bounds) {
  const allNeighbors = new Set([]);

  pixels.forEach(p => {
    // add the pixel itself
    allNeighbors.add(p.x + '_' + p.y);

    // get matrix of pixels in area that are within bounds
    const neighbors = getPixelsWithinDistance(p, N, bounds);
    neighbors.forEach(n => allNeighbors.add(n.x + '_' + n.y));
  });

  const allNeighborsFormatted = [];
  allNeighbors.forEach(v => {
    const xy = v.split('_');
    allNeighborsFormatted.push(new p5.Vector(parseInt(xy[0]), parseInt(xy[1])));
  });
  return allNeighborsFormatted;
}

// Modifies arr2D in place: start with point, flood fill by switching all values matching old value at point with newVal
export function floodFill(arr2D, start, newVal) {
  if (!arr2D || arr2D.length === 0 || !start) {
    return;
  }

  const bounds = [0, 0, arr2D[0].length, arr2D.length];
  const { x, y } = start;
  const matchVal = arr2D[y][x];

  if (matchVal === newVal) {
    return;
  }

  const floodFillRecursive = pixel => {
    // replace this pixel
    const { x, y } = pixel;
    arr2D[y][x] = newVal;

    // spread to other pixels that have matching value
    const neighbors = getPixelsWithinDistance(pixel, 1, bounds);
    neighbors.forEach(n => {
      const { x, y } = n;
      if (arr2D[y][x] === matchVal) {
        floodFillRecursive(n);
      }
    })
  };

  floodFillRecursive(start);
}

// interpolated between start and end at the step provided, recording unique pixels crossed
export function getApproximateCrossings(start, end, stepSize=0.5) {
  const diff = end.copy().sub(start);
  const step = diff.copy().normalize().mult(stepSize);
  const numSteps = Math.floor(diff.mag() / stepSize);

  const curr = start.copy();
  // add first
  let prev = new p5.Vector(Math.floor(curr.x), Math.floor(curr.y));
  const pixels = [prev];

  // main loop
  for (let i = 0; i < numSteps; i += 1) {
    curr.add(step);

    if (Math.floor(curr.x) !== prev.x || Math.floor(curr.y) !== prev.y) {
      // new square!
      prev = new p5.Vector(Math.floor(curr.x), Math.floor(curr.y));
      pixels.push(prev);
    }
  }

  // add last (if new)
  if (Math.floor(end.x) !== prev.x || Math.floor(end.y) !== prev.y) {
    pixels.push(new p5.Vector(Math.floor(end.x), Math.floor(end.y)));
  }

  return pixels;
}

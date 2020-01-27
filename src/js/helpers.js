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

export function choose2D(arr2D) {
  const w = arr2D[0].length;
  const arr_f = arr2D.flat();
  const arr_n = normalize(arr_f);
  const selector = Math.random();
  let cursor = 0;
  for (let i = 0; i < arr_n.length; i += 1) {
    cursor += arr_n[i];
    if (selector <= cursor) {
      const y = Math.floor(i / w);
      const x = i % w;
      return { x, y };
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

export const getImgArrFromP = (p) => {
  p.loadPixels();
  const { pixels, width } = p;
  return getImgArrFromPixels(pixels, width);
}

export const getImgArrFromPSelection = (p, selection) => {
  const [ w, h ] = getBoundsShape(selection);
  const g = p.createGraphics(w, h);
  const [ minX, minY, maxX, maxY ] = selection;
  const toCopy = p.get(minX, minY, maxX, maxY);
  g.image(toCopy, 0, 0);
  g.loadPixels();
  return getImgArrFromPixels(g.pixels, w);
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

// export function getImgArrFromPixelsSelection(pixels, width, selection) {
//   const [ minX, minY, maxX, maxY ] = selection;
//   const rowWidth = maxX - minX;
//   const imgArr = [];
//   let row = [];
//   let colIndex = -1;
//   const rowSelection = pixels.slice(minY * width * 4, maxY * width * 4);
//   debugger;
//   for (let i = 3; i < rowSelection.length; i += 4) {
//     colIndex += 1;
//     if ((colIndex % width) < minX || (colIndex % width) > maxX) {
//       // skip columns out of bounds
//       continue;
//     }

//     row.push(rowSelection[i] / 255);
//     if (row.length === rowWidth) {
//       imgArr.push(row);
//       row = [];
//     }
//   }
//   return imgArr;
// }

export function get2DArraySlice(arr, selection) {
  if (!arr || arr.length === 0 || arr[0].length === 0 || !selection) {
    return arr;
  }
  let [ minX, minY, maxX, maxY ] = selection;
  minX = Math.max(0, minX);
  minY = Math.max(0, minY);
  maxX = Math.min(arr[0].length, maxX);
  maxY = Math.min(arr.length, maxY);

  const slice = arr.slice(minY, maxY).map(row => row.slice(minX, maxX));
  return slice;
}

export function slice2D(arr2D, selection) {
  if (!arr2D || arr2D.length === 0 || arr2D[0].length === 0 || !selection) {
    return arr2D.slice().map(row => row.slice());
  }
  let [ minX, minY, maxX, maxY ] = selection;
  minX = Math.max(0, minX);
  minY = Math.max(0, minY);
  maxX = Math.min(arr2D[0].length, maxX);
  maxY = Math.min(arr2D.length, maxY);

  const slice = arr2D.slice(minY, maxY).map(row => row.slice(minX, maxX));
  return slice;
}

// Eat away padding amount from 2D array
export function erode2D(arr2D, padding) {
  if (!arr2D || arr2D.length === 0 || arr2D[0].length === 0 || !padding) {
    return arr2D.slice().map(row => row.slice());
  }

  const slice = arr2D.slice(padding, arr2D.length - padding).map(row => row.slice(padding, row.length - padding));
  return slice;
}

// Eat away padding amount from 2D array
export function dilateBounds(selection, padding) {
  if (!selection || selection.length === 0 || !padding) {
    return selection;
  }
  let [ minX, minY, maxX, maxY ] = selection;

  return [ minX - padding, minY - padding, maxX + padding, maxY + padding ];
}

// splice in place
export function splice2D(arr2D, insert2D, offset) {
  if (!arr2D || arr2D.length === 0 || arr2D[0].length === 0 ||
      !insert2D || insert2D.length === 0 || insert2D[0].length === 0) {
    return arr2D;
  }

  if (!offset) {
    offset = { x: 0, y: 0 };
  } else if (offset.y >= arr2D.length || offset.x >= arr2D[0].length) {
    return arr2D;
  }

  const yStart = Math.max(0, offset.y); // ignore below 0 offset
  const yEnd = Math.min(arr2D.length, offset.y + insert2D.length); // dont go past end
  const xStart = Math.max(0, offset.x); // ignore below 0 offset
  const sliceStart = offset.x < 0 ? (-offset.x) : 0; // if negative offset, trim that, else start from beginning
  const sliceEnd = sliceStart + (arr2D[0].length - xStart); // cap length at arr2D length
  for (let y = yStart; y < yEnd; y += 1) {
    // get the in bounds part of corresponding row of the insert array
    const rowToSplice = insert2D[y - offset.y].slice(sliceStart, sliceEnd);
    arr2D[y].splice(xStart, rowToSplice.length, ...rowToSplice);
  }

  return arr2D;
}

export function getLineBounds(start, end, padding=0) {
  const { x: sx, y: sy } = start;
  const { x: ex, y: ey } = end;
  let minX = Math.min(sx, ex) - padding;
  let minY = Math.min(sy, ey) - padding;
  let maxX = Math.max(sx, ex) + padding + 1;
  let maxY = Math.max(sy, ey) + padding + 1;

  return [ minX, minY, maxX, maxY ].map(v => Math.floor(v));
}

export function getBoundsShape(bounds) {
  const [ minX, minY, maxX, maxY ] = bounds;
  const h = maxY - minY;
  const w = maxX - minX;
  return [ w, h ];
}

export function combineBounds(bounds0, bounds1) {
  if (!bounds0) {
    return bounds1;
  }
  if (!bounds1) {
    return bounds0;
  }

  // update with most extreme
  const [ minX0, minY0, maxX0, maxY0 ] = bounds0;
  const [ minX1, minY1, maxX1, maxY1 ] = bounds1;
  const minX = Math.min(minX0, minX1);
  const minY = Math.min(minY0, minY1);
  const maxX = Math.max(maxX0, maxX1);
  const maxY= Math.max(maxY0, maxY1);
  return [ minX, minY, maxX, maxY ];
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

// Return a list of { v: value, i: index } with the top N values
export function getTopValues(arr, N) {
  const sorted = arr.map((s, i) => [i, s]).sort((a, b) => (a[1] > b[1]) ? -1 : 1);
  return sorted.slice(0, N);
}


export function max2D(arr2D) {
  let max = -Infinity;
  arr2D.forEach(row => row.forEach(v => v > max ? max = v : null));
  return max;
}

export function max3D(arr3D) {
  let max = -Infinity;
  arr3D.forEach(arr2D => arr2D.forEach(row => row.forEach(v => v > max ? max = v : null)));
  return max;
}

export function sum2D(arr2D) {
  let sum = 0;
  arr2D.forEach(row => row.forEach(v => sum += v));
  return sum;
}

// Given an array of 2D arrays, normalize all the 2D arrays to max value across all of them
export function normalize3DByMax(arr3D) {
  let max = max3D(arr3D);
  if (max === 0) {
    return max = 1;
  }
  return arr3D.map(arr2D => arr2D.map(row => row.map(v => v / max)));
}

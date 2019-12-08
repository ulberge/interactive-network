
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

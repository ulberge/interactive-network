import nj from 'numjs';

// export const kernelTypes = ['┃', '╻', '┗', '┳', '╋', 'Y', '>', '_/', ')', '⭑'];
export const kernelTypes = ['I', 'i', 'L', 'T', 'X', 'Y', '>', '_/', ')', '⭑'];

// Returns a f(x, y) for 2D cosine wave at angle theta of width inverse lambda from -PI to PI, scaled by pos and neg
function getCosWaveFn(theta, lambda, period=1) {
  return (x, y) => {
    const a = (2 * Math.PI / lambda) * ((x * Math.cos(theta)) + (y * Math.sin(theta)));
    if (a > (Math.PI * period) || a < (-Math.PI * period)) {
      return null;
    }

    return Math.cos(a);
  }
}

// Returns f(x, y) for a 2D Gaussian with spread sigma
function getGaussianFn(sigma) {
  return (x, y) => {
    return Math.exp(-.5 * ((x ** 2 / (sigma ** 2)) + (y ** 2 / (sigma ** 2))));
  }
}

function getLine(windowSize, theta, lambda, sigma) {
  const wave = getCosWaveFn(theta, lambda);
  const gauss = getGaussianFn(sigma);
  const kernel = nj.zeros([windowSize, windowSize]).assign(-1, false).tolist();
  const halfWindowSize = Math.floor(windowSize / 2);

  for (let y = 0; y < windowSize; y += 1) {
    const yCentered = y - halfWindowSize;
    for (let x = 0; x < windowSize; x += 1) {
      const xCentered = x - halfWindowSize;
      const z = wave(xCentered, yCentered);
      if (z !== null) {
        kernel[y][x] = z;
      }

      kernel[y][x] = kernel[y][x] * gauss(xCentered, yCentered);
    }
  }

  return kernel;
}

function getLines(windowSize, numKernels, lambda, sigma) {
  const rotationDelta = Math.PI / numKernels; // divide 180 degrees in number

  const kernels = [];
  for (let i = 0; i < numKernels; i += 1) {
    const theta = i * rotationDelta; // angle of this cos wave
    const kernel = getLine(windowSize, theta, lambda, sigma);

    kernels.push(kernel);
  }

  return kernels;
}

function getLineEnd(windowSize, theta, lambda, sigma) {
  const wave = getCosWaveFn(theta, lambda);
  const gauss = getGaussianFn(sigma);
  const kernel = nj.zeros([windowSize, windowSize]).assign(-1, false).tolist();
  const halfWindowSize = Math.floor(windowSize / 2);

  for (let y = 0; y < windowSize; y += 1) {
    const yCentered = y - halfWindowSize;
    for (let x = 0; x < windowSize; x += 1) {
      const xCentered = x - halfWindowSize;
      let z = null;
      let a = (Math.sin(theta) * xCentered) - (Math.cos(theta) * yCentered); // pos in rotation space
      if (a < 0.00001) { // rounding error
        z = wave(xCentered, yCentered);
      } else if (a < 1.00001) {
        // special case for after center point
        z = wave(xCentered, yCentered);
        z = z > 0 ? (z / 2) : z;
      }
      if (z !== null) {
        kernel[y][x] = z;
      }

      kernel[y][x] = kernel[y][x] * gauss(xCentered, yCentered);
    }
  }

  return kernel;
}

function getLineEnds(windowSize, numKernels, lambda, sigma) {
  const rotationDelta = 2 * Math.PI / numKernels; // divide 180 degrees in number
  const kernels = [];
  for (let i = 0; i < numKernels; i += 1) {
    const theta = i * rotationDelta; // angle of this cos wave
    const kernel = getLineEnd(windowSize, theta, lambda, sigma);
    kernels.push(kernel);
  }

  return kernels;
}

function getLs(windowSize, angle, numKernels, lambda, sigma) {
  const rotationDelta = 2 * Math.PI / numKernels; // divide 180 degrees in number
  const halfWindowSize = Math.floor(windowSize / 2);
  const kernels = [];
  for (let i = 0; i < numKernels; i += 1) {
    const theta = i * rotationDelta; // angle of this cos wave
    const a = Math.sin(theta + (Math.PI / 2) - (angle / 2));
    const b = Math.cos(theta + (Math.PI / 2) - (angle / 2));

    // Create two line ends at 90 degrees to each other and merge at diagonal between them
    const kernelLineEnd0 = getLineEnd(windowSize, theta, lambda, sigma);
    const kernelLineEnd1 = getLineEnd(windowSize, theta - angle, lambda, sigma);
    const kernel = nj.zeros([windowSize, windowSize]).tolist();

    for (let y = 0; y < windowSize; y += 1) {
      const yCentered = y - halfWindowSize;
      for (let x = 0; x < windowSize; x += 1) {
        const xCentered = x - halfWindowSize;
        const c = (a * xCentered) - (b * yCentered); // pos in rotation space
        if (c < 0.00001) { // rounding error at 0
          kernel[y][x] = kernelLineEnd0[y][x];
        } else {
          kernel[y][x] = kernelLineEnd1[y][x];
        }
      }
    }

    kernels.push(kernel);
  }

  return kernels;
}

function getTs(windowSize, angle, numKernels, lambda, sigma) {
  const rotationDelta = 2 * Math.PI / numKernels; // divide 180 degrees in number
  const halfWindowSize = Math.floor(windowSize / 2);
  const kernels = [];
  for (let i = 0; i < numKernels; i += 1) {
    const theta = i * rotationDelta; // angle of this cos wave
    const a = Math.sin(theta + (Math.PI / 2));
    const b = Math.cos(theta + (Math.PI / 2));

    // Create two line ends at 90 degrees to each other and merge at diagonal between them
    const kernelLine = getLine(windowSize, theta, lambda, sigma);
    const kernelLineEnd = getLineEnd(windowSize, theta - angle, lambda, sigma);
    const kernel = nj.zeros([windowSize, windowSize]).tolist();
    for (let y = 0; y < windowSize; y += 1) {
      const yCentered = y - halfWindowSize;
      for (let x = 0; x < windowSize; x += 1) {
        const xCentered = x - halfWindowSize;
        const c = (a * xCentered) - (b * yCentered); // pos in rotation space
        if (c < 0.00001) { // rounding error at 0
          // use line
          kernel[y][x] = kernelLine[y][x];
        } else {
          // use most extreme towards T line
          const zMax = Math.max(kernelLine[y][x], kernelLineEnd[y][x]);
          const zMin = Math.min(kernelLine[y][x], kernelLineEnd[y][x]);
          kernel[y][x] = zMax > 0 ? zMax : zMin;
        }
      }
    }

    kernels.push(kernel);
  }

  return kernels;
}

function getXs(windowSize, angle, numKernels, lambda, sigma) {
  const rotationDelta = (Math.PI / 2) / numKernels; // divide 90 degrees in number
  const kernels = [];
  for (let i = 0; i < numKernels; i += 1) {
    const theta = i * rotationDelta; // angle of this cos wave

    // Create two line ends at 90 degrees to each other and merge at diagonal between them
    const kernelLine0 = getLine(windowSize, theta, lambda, sigma);
    const kernelLine1 = getLine(windowSize, theta - angle, lambda, sigma);
    const kernel = nj.zeros([windowSize, windowSize]).tolist();
    for (let y = 0; y < windowSize; y += 1) {
      for (let x = 0; x < windowSize; x += 1) {
        // use most extreme
        const zMax = Math.max(kernelLine0[y][x], kernelLine1[y][x]);
        const zMin = Math.min(kernelLine0[y][x], kernelLine1[y][x]);
        kernel[y][x] = zMax > 0 ? zMax : zMin;
      }
    }

    kernels.push(kernel);
  }

  return kernels;
}

function getDot(windowSize, lambda, sigma, size=1) {
  const gaussNeg = getGaussianFn(sigma);
  const gaussPos = getGaussianFn(size * lambda / 4);
  const kernel = nj.zeros([windowSize, windowSize]).assign(-1, false).tolist();
  const halfWindowSize = Math.floor(windowSize / 2);

  for (let y = 0; y < windowSize; y += 1) {
    const yCentered = y - halfWindowSize;
    for (let x = 0; x < windowSize; x += 1) {
      const xCentered = x - halfWindowSize;
      kernel[y][x] = (gaussPos(xCentered, yCentered) * 8) - gaussNeg(xCentered, yCentered);
    }
  }

  // normalize
  const max = Math.max(...kernel.flat());
  const kernelNorm = kernel.map(row => row.map(v => v / max));

  return kernelNorm;
}

function getYs(windowSize, angle, numKernels, lambda, sigma) {
  const rotationDelta = 2 * Math.PI / numKernels; // divide 360 degrees in number
  const halfWindowSize = Math.floor(windowSize / 2);
  const kernels = [];
  for (let i = 0; i < numKernels; i += 1) {
    const theta = i * rotationDelta; // angle of this cos wave

    // Create line at angle, and two other lines spread from 180 degree from that line by angle
    const kernelLineEndBase = getLineEnd(windowSize, theta, lambda, sigma);
    const kernelLineEndBranch0 = getLineEnd(windowSize, theta - Math.PI + angle, lambda, sigma);
    const kernelLineEndBranch1 = getLineEnd(windowSize, theta - Math.PI - angle, lambda, sigma);

    const a = Math.sin(theta);
    const b = Math.cos(theta);
    const kernel = nj.zeros([windowSize, windowSize]).tolist();
    for (let y = 0; y < windowSize; y += 1) {
      const yCentered = y - halfWindowSize;
      for (let x = 0; x < windowSize; x += 1) {
        const xCentered = x - halfWindowSize;
        const c = (a * xCentered) - (b * yCentered); // pos in rotation space
        if (c < -1.00001) { // rounding error at 0
          // use line
          kernel[y][x] = kernelLineEndBase[y][x];
        } else {
          // use max between all
          const zMax = Math.max(kernelLineEndBranch0[y][x], kernelLineEndBranch1[y][x], kernelLineEndBase[y][x]);
          const zMin = Math.min(kernelLineEndBranch0[y][x], kernelLineEndBranch1[y][x], kernelLineEndBase[y][x]);
          kernel[y][x] = zMax > 0 ? zMax : zMin;
        }
      }
    }

    kernels.push(kernel);
  }

  return kernels;
}

// process kernels
export function scaleKernel(kernel) {
  let positiveSum = 0;
  let positiveMax = 0;
  let negativeMin = 0;
  kernel.forEach(row => row.forEach(v => {
    if (v > 0) {
      positiveSum += v;
      if (v > positiveMax) {
        positiveMax = v;
      }
    } else {
      if (v < negativeMin) {
        negativeMin = v;
      }
    }
  }));

  let negativeScaleFactor;
  if (positiveMax === 0 || negativeMin === 0) {
    negativeScaleFactor = 1;
  } else {
    negativeScaleFactor = -negativeMin / (positiveMax / positiveSum);
  }
  const positiveScaleFactor = positiveSum;

  kernel = kernel.map(row => row.map(v => {
    if (v > 0) {
      // normalize positive weights, such that the total adds up to 1 (ie. max activation is 1 if input max is 1)
      return v / positiveScaleFactor;
    } else {
      // scale negative weights with scale where min is equal negative magnitude of max positive
      // there may be a lot more negative than positive, but by scaling to match, an equal number
      // of mismatch pixels will cancel out with positive
      return v / negativeScaleFactor;
    }
  }));

  return kernel;
}

export function getKernels(windowSize, numComponents, lambda, sigma, types) {
  const kernels = [];
  if (!windowSize || !numComponents) {
    return kernels;
  }

  if (types.includes(kernelTypes[0])) {
    kernels.push(...getLines(windowSize, numComponents, lambda, sigma));
  }
  if (types.includes(kernelTypes[1])) {
    kernels.push(...getLineEnds(windowSize, numComponents, lambda, sigma));
  }
  if (types.includes(kernelTypes[2])) {
    kernels.push(...getLs(windowSize, Math.PI * 0.5, numComponents * 2, lambda, sigma));
  }
  if (types.includes(kernelTypes[3])) {
    kernels.push(...getTs(windowSize, Math.PI * 0.5, numComponents, lambda, sigma));
  }
  if (types.includes(kernelTypes[4])) {
    kernels.push(...getXs(windowSize, Math.PI * 0.5, numComponents / 2, lambda, sigma));
  }
  if (types.includes(kernelTypes[5])) {
    kernels.push(...getYs(windowSize, Math.PI * 0.25, numComponents, lambda, sigma));
  }
  if (types.includes(kernelTypes[6])) {
    kernels.push(...getLs(windowSize, Math.PI * 0.25, numComponents, lambda, sigma));
  }
  if (types.includes(kernelTypes[7])) {
    kernels.push(...getLs(windowSize, Math.PI * 0.75, numComponents, lambda, sigma));
  }
  if (types.includes(kernelTypes[8])) {
    kernels.push(...getLs(windowSize, Math.PI * 0.925, numComponents * 2, lambda, sigma));
  }
  if (types.includes(kernelTypes[9])) {
    kernels.push(getDot(windowSize, lambda, sigma, 0.7));
    kernels.push(getDot(windowSize, lambda, sigma, 1));
  }

  // Other potentials
  // kernels.push(...getTs(windowSize, Math.PI * 0.75, numComponents * 2, lambda, sigma));
  // kernels.push(...getTs(windowSize, Math.PI * 0.25, numComponents * 2, lambda, sigma));
  // kernels.push(...getXs(windowSize, Math.PI * 0.25, numComponents, lambda, sigma));
  // points, small circles, blank, dense intersection, round corners, pinched round corners
  // look at internal representations in Sketch-A-Net and try to add those

  const scaledKernels = kernels.map(scaleKernel);

  if (types.includes(kernelTypes[9])) {
    // Blank, full, single pixel
    // scaledKernels.push(nj.zeros([windowSize, windowSize]).assign(1 / (windowSize * windowSize), false).tolist());
    // scaledKernels.push(nj.zeros([windowSize, windowSize]).assign(-1 / 4, false).tolist());
    // const pixel = nj.zeros([windowSize, windowSize]);
    // pixel.set(Math.floor(windowSize / 2), Math.floor(windowSize / 2), 1);
    // scaledKernels.push(pixel.tolist());
  }
  // console.log(JSON.stringify(scaledKernels.map(k => k.map(r => r.map(v => Number(v.toFixed(5)))))));
  console.log(scaledKernels.map(kernel => kernel.map(row => row.join(',')).join('\n')).join('\n:\n'));

  return scaledKernels;
}

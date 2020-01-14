import { getEmpty2DArray } from './helpers';

// Returns a f(x, y) for 2D cosine wave at angle theta of width inverse lambda from -PI to PI, scaled by pos and neg
function getCosWaveFn(theta, lambda, pos, neg) {
  return (x, y) => {
    const a = (2 * Math.PI / lambda) * ((x * Math.cos(theta)) + (y * Math.sin(theta)));
    if (a > Math.PI || a < -Math.PI) {
      return null;
    }

    const b = Math.cos(a);
    return b > 0 ? (b * pos) : (b * -neg);
  }
}

// Returns f(x, y) for a 2D Gaussian with spread sigma
function getGaussianFn(sigma) {
  return (x, y) => {
    return Math.exp(-.5 * ((x ** 2 / (sigma ** 2)) + (y ** 2 / (sigma ** 2))));
  }
}

function getLine(windowSize, theta, lambda, sigma, pos, neg, empty) {
  const wave = getCosWaveFn(theta, lambda, pos, neg);
  const gauss = getGaussianFn(sigma);
  const kernel = getEmpty2DArray(windowSize, windowSize, empty);
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
  const pos = 1; // max value at positive
  const neg = -2; // min value at negative
  const empty = -2; // default value outside of wave fn

  const kernels = [];
  for (let i = 0; i < numKernels; i += 1) {
    const theta = i * rotationDelta; // angle of this cos wave
    const kernel = getLine(windowSize, theta, lambda, sigma, pos, neg, empty);

    kernels.push(kernel);
  }

  return kernels;
}

function getLineEnd(windowSize, theta, lambda, sigma, pos, neg, empty) {
  const wave = getCosWaveFn(theta, lambda, pos, neg);
  const gauss = getGaussianFn(sigma);
  const kernel = getEmpty2DArray(windowSize, windowSize, empty);
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
  const pos = 1; // max value at positive
  const neg = -2; // min value at negative
  const empty = -2; // default value outside of wave fn
  const kernels = [];
  for (let i = 0; i < numKernels; i += 1) {
    const theta = i * rotationDelta; // angle of this cos wave
    const kernel = getLineEnd(windowSize, theta, lambda, sigma, pos, neg, empty);
    kernels.push(kernel);
  }

  return kernels;
}

function getLs(windowSize, angle, numKernels, lambda, sigma) {
  const rotationDelta = 2 * Math.PI / numKernels; // divide 180 degrees in number
  const pos = 1; // max value at positive
  const neg = -2; // min value at negative
  const empty = -2; // default value outside of wave fn
  const halfWindowSize = Math.floor(windowSize / 2);
  const kernels = [];
  for (let i = 0; i < numKernels; i += 1) {
    const theta = i * rotationDelta; // angle of this cos wave
    const a = Math.sin(theta + (Math.PI / 2) - (angle / 2));
    const b = Math.cos(theta + (Math.PI / 2) - (angle / 2));

    // Create two line ends at 90 degrees to each other and merge at diagonal between them
    const kernelLineEnd0 = getLineEnd(windowSize, theta, lambda, sigma, pos, neg, empty);
    const kernelLineEnd1 = getLineEnd(windowSize, theta - angle, lambda, sigma, pos, neg, empty);
    const kernel = getEmpty2DArray(windowSize, windowSize, empty);
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
  const pos = 1; // max value at positive
  const neg = -2; // min value at negative
  const empty = -2; // default value outside of wave fn
  const halfWindowSize = Math.floor(windowSize / 2);
  const kernels = [];
  for (let i = 0; i < numKernels; i += 1) {
    const theta = i * rotationDelta; // angle of this cos wave
    const a = Math.sin(theta + (Math.PI / 2));
    const b = Math.cos(theta + (Math.PI / 2));

    // Create two line ends at 90 degrees to each other and merge at diagonal between them
    const kernelLine = getLine(windowSize, theta, lambda, sigma, pos, neg, empty);
    const kernelLineEnd = getLineEnd(windowSize, theta - angle, lambda, sigma, pos, neg, empty);
    const kernel = getEmpty2DArray(windowSize, windowSize, empty);
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
  const pos = 1; // max value at positive
  const neg = -2; // min value at negative
  const empty = -2; // default value outside of wave fn
  const kernels = [];
  for (let i = 0; i < numKernels; i += 1) {
    const theta = i * rotationDelta; // angle of this cos wave

    // Create two line ends at 90 degrees to each other and merge at diagonal between them
    const kernelLine0 = getLine(windowSize, theta, lambda, sigma, pos, neg, empty);
    const kernelLine1 = getLine(windowSize, theta - angle, lambda, sigma, pos, neg, empty);
    const kernel = getEmpty2DArray(windowSize, windowSize, empty);
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

function getYs(windowSize, angle, numKernels, lambda, sigma) {
  const rotationDelta = 2 * Math.PI / numKernels; // divide 360 degrees in number
  const halfWindowSize = Math.floor(windowSize / 2);
  const pos = 1; // max value at positive
  const neg = -2; // min value at negative
  const empty = -2; // default value outside of wave fn
  const kernels = [];
  for (let i = 0; i < numKernels; i += 1) {
    const theta = i * rotationDelta; // angle of this cos wave

    // Create line at angle, and two other lines spread from 180 degree from that line by angle
    const kernelLineEndBase = getLineEnd(windowSize, theta, lambda, sigma, pos, neg, empty);
    const kernelLineEndBranch0 = getLineEnd(windowSize, theta - Math.PI + angle, lambda, sigma, pos, neg, empty);
    const kernelLineEndBranch1 = getLineEnd(windowSize, theta - Math.PI - angle, lambda, sigma, pos, neg, empty);

    const a = Math.sin(theta);
    const b = Math.cos(theta);
    const kernel = getEmpty2DArray(windowSize, windowSize, empty);
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

export function getKernels(windowSize, numComponents, lambda, sigma) {
  const kernels = [];
  if (!windowSize || !numComponents) {
    return kernels;
  }

  // numComponents = Math.min(numComponents, 4);

  kernels.push(...getLines(windowSize, numComponents, lambda, sigma));

  // curves?
  kernels.push(...getLs(windowSize, Math.PI * 0.925, numComponents * 2, lambda, sigma));

  kernels.push(...getLs(windowSize, Math.PI * 0.75, numComponents * 2, lambda, sigma));
  kernels.push(...getLs(windowSize, Math.PI * 0.5, numComponents * 2, lambda, sigma));
  kernels.push(...getLs(windowSize, Math.PI * 0.25, numComponents * 2, lambda, sigma));

  kernels.push(...getLineEnds(windowSize, numComponents * 2, lambda, sigma));

  kernels.push(...getTs(windowSize, Math.PI * 0.5, numComponents * 2, lambda, sigma));
  kernels.push(...getTs(windowSize, Math.PI * 0.75, numComponents * 2, lambda, sigma));
  kernels.push(...getTs(windowSize, Math.PI * 0.25, numComponents * 2, lambda, sigma));

  kernels.push(...getYs(windowSize, Math.PI * 0.25, numComponents * 2, lambda, sigma));

  kernels.push(...getXs(windowSize, Math.PI * 0.5, numComponents / 2, lambda, sigma));
  kernels.push(...getXs(windowSize, Math.PI * 0.25, numComponents, lambda, sigma));

  // points, small circles, blank, dense intersection

  console.log(kernels.length);

  return kernels;
}

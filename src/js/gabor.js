import { getEmpty2DArray } from './helpers';

export const CONSTANTS = {
  ANGLES: [
    0, Math.PI / 2,
    Math.PI / 4, 3 * Math.PI / 4,
    Math.PI / 8, 3 * Math.PI / 8, 5 * Math.PI / 8, 7 * Math.PI / 8,
    Math.PI / 16, 3 * Math.PI / 16, 5 * Math.PI / 16, 7 * Math.PI / 16, 9 * Math.PI / 16, 11 * Math.PI / 16, 13 * Math.PI / 16, 15 * Math.PI / 16,
    Math.PI / 32, 3 * Math.PI / 32, 5 * Math.PI / 32, 7 * Math.PI / 32, 9 * Math.PI / 32, 11 * Math.PI / 32, 13 * Math.PI / 32, 15 * Math.PI / 32, 17 * Math.PI / 32, 19 * Math.PI / 32, 21 * Math.PI / 32, 23 * Math.PI / 32, 25 * Math.PI / 32, 27 * Math.PI / 32, 29 * Math.PI / 32, 31 * Math.PI / 32
  ]
};

const LINE_END_ANGLES = [
  0, Math.PI / 2, Math.PI, Math.PI * 1.5,
  Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4,
  Math.PI / 8, 3 * Math.PI / 8, 5 * Math.PI / 8, 7 * Math.PI / 8,
  9 * Math.PI / 8, 11 * Math.PI / 8, 13 * Math.PI / 8, 15 * Math.PI / 8,
];

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
        if (Math.abs(cosVal) < (Math.PI * 1)) {
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

function getGaborFilterLineEnd(sigma, theta, lambda, psi, gamma, windowSize) {
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

    // only calc up to half line, then rotate?
    for (let y = ymin; y <= ymax; y += 1) {
      for (let x = xmin; x <= xmax; x += 1) {
        // Rotation
        const x_theta = x * Math.cos(theta) + y * Math.sin(theta);
        const y_theta = -x * Math.sin(theta) + y * Math.cos(theta);

        // restrict vals to center bulge and side dips
        const cosVal = 2 * Math.PI / lambda * x_theta + psi;
        let gb = 0;
        if (Math.abs(cosVal) < (Math.PI * 1)) {
          gb = Math.exp(-.5 * (x_theta ** 2 / sigma_x ** 2 + y_theta ** 2 / sigma_y ** 2)) * Math.cos(cosVal);
        }

        const yIndex = y - ymin + yOffset;
        const xIndex = x - xmin + xOffset;
        if (yIndex >= 0 && yIndex < windowSize && xIndex >= 0 && xIndex < windowSize) {
          if (((Math.sin(theta) * x) - (Math.cos(theta) * y)) < 0) {
            // Leave normal
            filter[yIndex][xIndex] = gb;
          } else {
            // Get 90 degree rotation and use that
            // Rotation
            const thetaRot = theta + (Math.PI / 2);
            const x_thetaRot = x * Math.cos(thetaRot) + y * Math.sin(thetaRot);
            const y_thetaRot = -x * Math.sin(thetaRot) + y * Math.cos(thetaRot);

            // restrict vals to center bulge and side dips
            const cosVal = 2 * Math.PI / lambda * x_thetaRot + psi;
            let gbRot = 0;
            if (Math.abs(cosVal) < (Math.PI * 1)) {
              gbRot = Math.exp(-.5 * (x_thetaRot ** 2 / sigma_x ** 2 + y_thetaRot ** 2 / sigma_y ** 2)) * Math.cos(cosVal);
            }

            filter[yIndex][xIndex] = Math.min(gb, gbRot);
          }
        }
      }
    }

    return filter;
}

function getGaborFilterCorner(sigma, theta, lambda, psi, gamma, windowSize) {
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

    // only calc up to half line, then rotate?
    for (let y = ymin; y <= ymax; y += 1) {
      for (let x = xmin; x <= xmax; x += 1) {
        const yIndex = y - ymin + yOffset;
        const xIndex = x - xmin + xOffset;
        if (yIndex >= 0 && yIndex < windowSize && xIndex >= 0 && xIndex < windowSize) {

            // Divide between two rotations at quarter turn
            if (((Math.sin(theta + (Math.PI / 4)) * x) - (Math.cos(theta + (Math.PI / 4)) * y)) < 0) {
              // Rotation 0
              const x_theta = x * Math.cos(theta) + y * Math.sin(theta);
              const y_theta = -x * Math.sin(theta) + y * Math.cos(theta);

              // restrict vals to center bulge and side dips
              const cosVal = 2 * Math.PI / lambda * x_theta + psi;
              let gb = 0;
              if (Math.abs(cosVal) < (Math.PI * 1)) {
                gb = Math.exp(-.5 * (x_theta ** 2 / sigma_x ** 2 + y_theta ** 2 / sigma_y ** 2)) * Math.cos(cosVal);
              }

              filter[yIndex][xIndex] = gb;
            } else {
              // Get 90 degree rotation and use that
              // Rotation
              const thetaRot = theta + (Math.PI / 2);
              const x_thetaRot = x * Math.cos(thetaRot) + y * Math.sin(thetaRot);
              const y_thetaRot = -x * Math.sin(thetaRot) + y * Math.cos(thetaRot);

              // restrict vals to center bulge and side dips
              const cosVal = 2 * Math.PI / lambda * x_thetaRot + psi;
              let gbRot = 0;
              if (Math.abs(cosVal) < (Math.PI * 1)) {
                gbRot = Math.exp(-.5 * (x_thetaRot ** 2 / sigma_x ** 2 + y_thetaRot ** 2 / sigma_y ** 2)) * Math.cos(cosVal);
              }

              filter[yIndex][xIndex] = gbRot;
            }

            // Negative corners with negative eigth turn
          if (((Math.sin(theta - (Math.PI / 4)) * x) - (Math.cos(theta - (Math.PI / 4)) * y)) > 3) {
            // Rotation
            const x_theta = x * Math.cos(theta + (Math.PI / 4)) + y * Math.sin(theta + (Math.PI / 4));
            const y_theta = -x * Math.sin(theta + (Math.PI / 4)) + y * Math.cos(theta + (Math.PI / 4));

            // restrict vals to center bulge and side dips
            const cosVal = 2 * Math.PI / (lambda * 1.1) * x_theta + psi; // increase lambda slightly
            let gb = 0;
            if (Math.abs(cosVal) < (Math.PI * 1)) {
              gb = Math.exp(-.5 * (x_theta ** 2 / sigma_x ** 2 + y_theta ** 2 / sigma_y ** 2)) * Math.cos(cosVal);
            }

            filter[yIndex][xIndex] = filter[yIndex][xIndex] < 0.01 ? gb : filter[yIndex][xIndex];
          } else if (((Math.sin(theta - (Math.PI / 4)) * x) - (Math.cos(theta - (Math.PI / 4)) * y)) < -3) {
            // Rotation
            const x_theta = x * Math.cos(theta + (Math.PI / 4)) + y * Math.sin(theta + (Math.PI / 4));
            const y_theta = -x * Math.sin(theta + (Math.PI / 4)) + y * Math.cos(theta + (Math.PI / 4));

            // restrict vals to center bulge and side dips
            const cosVal = 2 * Math.PI / (lambda * 1.1) * x_theta + psi; // increase lambda slightly
            let gb = 0;
            if (Math.abs(cosVal) < (Math.PI * 1.5)) {
              gb = Math.exp(-.5 * (x_theta ** 2 / sigma_x ** 2 + y_theta ** 2 / sigma_y ** 2)) * Math.cos(cosVal);
            }

            filter[yIndex][xIndex] = filter[yIndex][xIndex] < 0.001 ? gb * 3 : filter[yIndex][xIndex];
          }
        }
      }
    }

    return filter;
}

export function getGaborFilters(numChannels, lambda, gamma, sigma, windowSize) {
  // const thetaDelta = Math.PI / numChannels;
  const filters = [];

  // get line channels
  for (let i = 0; i < numChannels; i += 1) {
    const psi = 0; // offset
    // const theta = thetaDelta * i;
    const theta = CONSTANTS.ANGLES[i];
    const filter = getGaborFilter(sigma, theta, lambda, psi, gamma, windowSize);
    if (filter && (i % 2 === 0)) {
      filters.push(filter);
    }
  }

  // get line end channels
  for (let i = 0; i < numChannels * 2; i += 1) {
    const psi = 0; // offset
    const theta = LINE_END_ANGLES[i];
    const filter = getGaborFilterLineEnd(sigma, theta, lambda * 0.8, psi, gamma, windowSize);
    if (filter && (i % 4 === 0)) {
      filters.push(filter);
    }
  }

  // get 90 degree corners
  for (let i = 0; i < numChannels * 2; i += 1) {
    const psi = 0; // offset
    const theta = LINE_END_ANGLES[i];
    const filter = getGaborFilterCorner(sigma, theta, lambda * 0.8, psi, gamma, windowSize);
    if (filter && (i % 4 === 0)) {
      filters.push(filter);
    }
  }


  return filters;
}

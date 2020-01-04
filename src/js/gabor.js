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
  // const thetaDelta = Math.PI / numChannels;
  const filters = [];
  for (let i = 0; i < numChannels; i += 1) {
    const psi = 0; // offset
    // const theta = thetaDelta * i;
    const theta = CONSTANTS.ANGLES[i];
    const filter = getGaborFilter(sigma, theta, lambda, psi, gamma, windowSize);
    if (filter) {
      filters.push(filter);
    }
  }
  return filters;
}

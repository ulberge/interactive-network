import { getEmpty2DArray } from './helpers';

// Returns the sum of the given 2D arrays with a limit
export function sumChannelsWithLimit(arrays2D, limit=1) {
  const h = arrays2D[0].length;
  const w = arrays2D[0][0].length;
  const remaining = getEmpty2DArray(h, w, 0);
  arrays2D.forEach(array2D => array2D.forEach((row, i) => row.forEach((v, j) => {
    // sum the values, but limit abs value of sum to limit
    remaining[i][j] = Math.max(Math.min(limit, remaining[i][j] + v), -limit);
  })));

  return remaining;
}

/**
 * Draws the given channels output on the provided canvas
 * @param {Object} p - p5 sketch to draw on
 * @param {number[][][]} channels - Activations for the different channels
 * @param {number} speed - Speed with which to execute animation (0 = fast as possible, higher is slower)
 */
export function Draw(p, channels, speed) {
  if (!channels || channels.length === 0) {
    return;
  }

  // create a grid of remaining marks to make (max val of 1 for any given point)
  const remaining = sumChannelsWithLimit(channels);

  // while still has remaining marks
  // decide on a start location and direction


  // create a boid
  // update the boid with the info from the current location
}

import { getEmpty2DArray } from './helpers';
import Boid from './boid';

import p5 from 'p5';

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

/*
* Pauses the execution loop to allow animation of action.
*/
async function pause(t) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, t);
  });
}

function drawTick(p, pDebug, boid, speed) {
  boid.run(new p5.Vector(4, 4));
  boid.isDrawing = true;
  boid.draw(p);
  if (pDebug) {
    pDebug.clear();
    boid.drawBoid(pDebug);
  }
}


async function drawLine(p, pDebug, boid, speed=0) {
  // update the boid with the info from the current location
  let i = 10;
  while (i > 0) {
    drawTick(p, pDebug, boid);
    i -= 1;
    await pause(speed);
  }
}

/**
 * Draws the given channels output on the provided canvas
 * @param {Object} p - p5 sketch to draw on
 * @param {number[][][]} channels - Activations for the different channels
 * @param {number} speed - Speed with which to execute animation (0 = fast as possible, higher is slower)
 */
export async function draw(p, channels, scale, strokeWeight, speed, pDebug) {
  if (!channels || channels.length === 0) {
    return;
  }

  // create a grid of remaining marks to make (max val of 1 for any given point)
  const remaining = sumChannelsWithLimit(channels);

  // while still has remaining marks
  // decide on a start location and direction
  // create a boid
  const startPos = new p5.Vector(0, 0);
  const startVel = new p5.Vector(0, 0);
  const diameter = strokeWeight;
  const boid = new Boid(startPos, startVel, diameter);

  p.push();
  p.scale(scale);
  pDebug.push();
  pDebug.scale(scale);

  await drawLine(p, pDebug, boid, speed);

  pDebug.pop();
  p.pop();
}

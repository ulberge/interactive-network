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

function drawTick(p, pDebug, boid) {
  boid.run(new p5.Vector(4, 4));
  boid.isDrawing = true;
  boid.draw(p);
  if (pDebug) {
    pDebug.clear();
    boid.drawBoid(pDebug);
  }
}

export class Drawer {
  constructor(p, pDebug) {
    this.p = p;
    this.pDebug = pDebug;
  }

  // Cancel the last drawing, then draw from the channels provided
  /**
   * Draws the given channels output on the provided canvas
   * @param {Object} p - p5 sketch to draw on
   * @param {number[][][]} channels - Activations for the different channels
   * @param {number} speed - Speed with which to execute animation (0 = fast as possible, higher is slower)
   */
  draw(channels, strokeWeight, speed) {
    if (this.drawingTimer) {
      clearTimeout(this.drawingTimer);
    }

    // create a grid of remaining marks to make (max val of 1 for any given point)
    // const remaining = sumChannelsWithLimit(channels);

    // decide on a start location and direction and create a boid
    const startPos = new p5.Vector(0, 0);
    const startVel = new p5.Vector(0, 0);
    const diameter = strokeWeight;
    const boid = new Boid(startPos, startVel, diameter);

    this.drawingTimer = setTimeout(() => {
      drawTick(this.p, this.pDebug, boid);
    }, speed);
  }
}

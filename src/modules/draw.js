import { getEmpty2DArray, getImgArrFromPixels, CONSTANTS } from './helpers';
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

export class Drawer {
  constructor(p, pDisplay=null, pDebug=null, scale=1, speed=1) {
    // Sketch at 1:1 scale
    this.p = p;
    // Sketch scaled up for viewing
    this.pDisplay = pDisplay;
    // Debug also at higher def
    this.pDebug = pDebug;

    this.scale = scale;
    this.speed = speed;
    this.boid = null;
    this.drawingTimer = null;
  }

  // Cancel the last drawing, then draw from the channels provided
  /**
   * Draws the given channels output on the provided canvas
   * @param {number[][][]} channels - Activations for the different channels
   * @param {number} speed - Speed with which to execute animation (0 = fast as possible, higher is slower)
   * @param {number} scale - scale of the canvas relative to 1:1
   * @param {number} strokeWeight - diameter of the marks made
   */
  draw(channels, strokeWeight) {
    if (this.drawingTimer) {
      clearTimeout(this.drawingTimer);
    }

    this.boid = new Boid(strokeWeight);

    const runDraw = () => {
      const isDone = this.drawTick(channels);
      if (!isDone) {
        this.drawingTimer = setTimeout(runDraw, this.speed);
      }
    }

    runDraw();
  }

  stop() {
    if (this.drawingTimer) {
      clearTimeout(this.drawingTimer);
    }
  }

  // Subtract the activation from the 2D arrays
  getRemaining(arrays2D, imgArr) {
    const remaining = arrays2D.map(array2D => array2D.map((row, i) => row.map((v, j) => {
      // could check surrounding areas?
      return imgArr[i][j] > 0 ? 0 : v;
    })));

    return remaining;
  }

  findBestLineIntersectAboveThreshold(channels, threshold) {
    let max = -Infinity;
    let selected = null;
    channels.forEach((channel, channelIndex) => channel.forEach((row, rowIndex) => row.forEach((val, colIndex) => {
      if (val > max) {
        max = val;
        selected = { channelIndex, rowIndex, colIndex };
      }
    })));

    if (max > threshold) {
      return selected;
    }

    return null;
  }

  // given a channel and a point in that channel that is on a line, grow outwards
  // until more line found
  growLine(channel, angle, rowIndex, colIndex, threshold) {
    let start = new p5.Vector(colIndex, rowIndex);
    let end = new p5.Vector(colIndex, rowIndex);

    let delta = p5.Vector.fromAngle(angle).mult(0.1);

    const isInBounds = pt => {
      return pt.y > 0 && pt.x > 0 && pt.y < channel.length && pt.x < channel[0].length;
    }

    const nextStart = start.copy().sub(delta);
    while (isInBounds(nextStart) && channel[Math.floor(nextStart.y)][Math.floor(nextStart.x)] > threshold) {
      start.sub(delta);
      nextStart.sub(delta);
    }

    const nextEnd = end.copy().add(delta);
    while (isInBounds(nextEnd) && channel[Math.floor(nextEnd.y)][Math.floor(nextEnd.x)] > threshold) {
      end.add(delta);
      nextEnd.add(delta);
    }

    return { start, end };
  }

  getNextLine(remaining, channels, threshold) {
    // Get the most probable line given the remaining activations
    let lineIntersect = this.findBestLineIntersectAboveThreshold(remaining, threshold);

    if (!lineIntersect) {
      return null;
    }

    // draw a line through the intersect, spreading outward until whitespace-like area found
    const { channelIndex, rowIndex, colIndex } = lineIntersect;
    // need to rotate by a quarter turn to make coordinate systems match
    const angle = CONSTANTS.ANGLES[channelIndex] + (Math.PI / 2);

    // given angle of line and point on that line, expand outwards until no more matches found
    const lineGrowThreshold = 0.3;
    // add half step to look at center of pixels
    const nextLine = this.growLine(channels[channelIndex], angle, rowIndex + 0.5, colIndex + 0.5, lineGrowThreshold);
    return nextLine;
  }

  // Draw one step of animation, returns true if done
  drawTick(channels) {
    // check if ready to draw new line
    const matchDistance = 0.1;

    if (this.boid.pos === null || this.boid.pos.copy().sub(this.boid.goal).mag() <= matchDistance) {
      // start new line

      // get current image
      this.p.loadPixels();
      const imgArr = getImgArrFromPixels(this.p.pixels, this.p.width);

      // subtract current image from channels to see what is left to draw
      const remaining = this.getRemaining(channels, imgArr);

      // halt after one run
      // if (this.boid.pos !== null) {
      //   return true;
      // }

      // start a new line if better than threshold
      const threshold = 1;
      const nextLine = this.getNextLine(remaining, channels, threshold);
      if (!nextLine) {
        return true;
      }

      const { start, end } = nextLine;
      this.boid.pos = start;
      this.boid.vel = new p5.Vector(0, 0);
      this.boid.goal = end;
    }

    // get force
    // force is equal to change in velocity necessary to reach goal
    const force = this.boid.goal.copy().sub(this.boid.pos.copy().add(this.boid.vel));

    // run update
    this.boid.run(force);
    this.boid.isDrawing = true;

    // draw
    this.boid.draw(this.p);

    // draw display version scaled up
    if (this.pDisplay) {
      this.p.loadPixels();
      const imgArr = getImgArrFromPixels(this.p.pixels, this.p.width);
      this.pDisplay.customDraw(imgArr, this.scale);
    }

    // draw debug
    if (this.pDebug) {
      this.pDebug.push();
      this.pDebug.scale(this.scale);
      this.pDebug.clear();
      this.boid.drawBoid(this.pDebug);
      this.pDebug.pop();
    }

    return false;
  }
}

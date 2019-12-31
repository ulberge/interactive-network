import { getImgArrFromPixels, deepCopy, eval2DArrayMultipleLayers } from './helpers';
import Boid from './boid';

import p5 from 'p5';

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

  /**
   * Draws the given channels output on the provided canvas
   */
  draw(layers, layerIndex, neuronIndex) {
    if (this.drawingTimer) {
      clearTimeout(this.drawingTimer);
    }

    this.boid = new Boid();

    const runDraw = () => {
      const isDone = this.drawTick(layers, layerIndex, neuronIndex);
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

  // Draw one step of animation, returns true if done
  drawTick(layers, layerIndex, neuronIndex) {
    let vel;
    if (this.boid.pos === null) {
      // get pos of new line

      // get current image
      this.p.loadPixels();
      const imgArr = getImgArrFromPixels(this.p.pixels, this.p.width);

      // try flipping every bit and getting new activation
      const startPositions = [];
      const starts = [];
      for (let y = 0; y < imgArr.length; y++) {
        for (let x = 0; x < imgArr[0].length; x++) {
          if (imgArr[y][x] !== 1) {
            const testArr = deepCopy(imgArr);
            testArr[y][x] = 1;
            starts.push(testArr);
            startPositions.push({ x, y });
          }
        }
      }
      // get activations
      const acts = eval2DArrayMultipleLayers(layers, layerIndex, neuronIndex).map((act, i) => [i, act[0][0]]);

      // sort by activation and select highest (if all negative, halt)
      const sorted = acts.sort((a, b) => (a[1] > b[1]) ? -1 : 1);
      const best = sorted[0];
      if (best[1] <= 0) {
        // if no more improvements possible, halt
        return true;
      }

      const startPos = startPositions[best[0]];
      this.boid.pos = new p5.Vector(startPos.x, startPos.y);

      // get next pos of new line
      // try flipping every bit around pos of new line and getting new activation
      const nextPositionActs = [];
      startPositions.forEach((pos, i) => {
        // is pos next to boid pos (within 1 and not best itself)
        if (Math.abs(pos.x - this.boid.pos.x) <= 1 && Math.abs(pos.y - this.boid.pos.y) <= 1 && i !== best[0]) {
          nextPositionActs.push([i, acts[i]]);
        }
      });

      // sort and select highest
      const sortedNextPositionActs = nextPositionActs.sort((a, b) => (a[1] > b[1]) ? -1 : 1);
      const bestNextPositionAct = sortedNextPositionActs[0];
      const bestNextPosition = startPositions[bestNextPositionAct[0]];

      vel = (new p5.Vector(bestNextPosition.x, bestNextPosition.y)).sub(this.boid.pos);
    } else {
      // get next pos of line
      // try flipping every bit around pos of line (excluding previous pos)
      // sort and select highest (tie goes to current direction)
      // if all negative, get new line
      // else, draw line segment from pos to next pos and update pos

      // get current image
      this.p.loadPixels();
      const imgArr = getImgArrFromPixels(this.p.pixels, this.p.width);

      // try flipping every bit around pos of line (excluding previous pos)
      const nextPositions = [];
      const tests = [];
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          // exclude pixels out of bounds, center pixel, previous location, and any pixels already at 1
          const x = this.boid.pos.x + dx;
          const y = this.boid.pos.y + dy;
          if (!(x < 0 || y < 0 || x >= imgArr[0].length || y >= imgArr.length)
              && !(dy === 0 && dx === 0)
              && !(this.boid.prevPos.x !== x && this.boid.prevPos.y !== y)
              && !(imgArr[y][x] === 1)) {
            const testArr = deepCopy(imgArr);
            testArr[y][x] = 1;
            tests.push(testArr);
            nextPositions.push({ x, y });
          }
        }
      }
      if (tests.length === 0) {
        return true;
      }

      // get activations
      const acts = eval2DArrayMultipleLayers(layers, layerIndex, neuronIndex).map((act, i) => [i, act[0][0]]);

      // sort by activation and select highest (if all negative, halt)
      const sorted = acts.sort((a, b) => (a[1] > b[1]) ? -1 : 1);
      const best = sorted[0];
      if (best[1] <= 0) {
        // if no more improvements possible, halt
        return true;
      }

      const nextPos = nextPositions[best[0]];
      vel = (new p5.Vector(nextPos.x, nextPos.y)).sub(this.boid.pos);
    }

    // draw line segment from pos to next pos and update pos
    // run update
    this.boid.run(vel);
    this.boid.isDrawing = true;
    this.boid.draw(this.p);

    this.p.stroke(0);
    this.p.noFill();
    this.p.rect(this.boid.pos.x, this.boid.pos.y, 1, 1);

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

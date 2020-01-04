import { getImgArrFromPixels, deepCopy, eval2DArrayMultipleLayers, delay } from './helpers';
import Boid from './boid';
import p5 from 'p5';

export class Drawer {
  constructor(p, pDisplay=null) {
    // Sketch at 1:1 scale
    this.p = p;
    // Sketch scaled up for viewing and debugging
    this.pDisplay = pDisplay;
    this.boid = null;
    this.drawingTimer = null;
  }

  configure(layers, layerIndex, neuronIndex, displayScale, strokeWeight, speed) {
    this.speed = speed;
    this.displayScale = displayScale;
    this.strokeWeight = strokeWeight;
    this.layers = layers;
    this.layerIndex = layerIndex;
    this.neuronIndex = neuronIndex;
    this.boid = new Boid();
  }

  /**
   * Draws the given channels output on the provided canvas
   */
  async start() {
    if (this.drawingTimer) {
      clearTimeout(this.drawingTimer);
    }

    while (!this.p._setupDone || (this.pDisplay && !this.pDisplay._setupDone)) {
      await delay(10);
    }

    const runDraw = () => {
      const isDone = this.drawTick();
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
  drawTick() {
    // let vel;
    // if (this.boid.pos === null) {
    // } else {
    //   // get next pos of line
    //   // try flipping every bit around pos of line (excluding previous pos)
    //   // sort and select highest (tie goes to current direction)
    //   // if all negative, get new line
    //   // else, draw line segment from pos to next pos and update pos

    //   // get current image
    //   this.p.loadPixels();
    //   const imgArr = getImgArrFromPixels(this.p.pixels, this.p.width);

    //   // try flipping every bit around pos of line (excluding previous pos)
    //   const nextPositions = [];
    //   const tests = [];
    //   for (let dy = -1; dy <= 1; dy++) {
    //     for (let dx = -1; dx <= 1; dx++) {
    //       // exclude pixels out of bounds, center pixel, previous location, and any pixels already at 1
    //       const x = this.boid.pos.x + dx;
    //       const y = this.boid.pos.y + dy;
    //       if (!(x < 0 || y < 0 || x >= imgArr[0].length || y >= imgArr.length)
    //           && !(dy === 0 && dx === 0)
    //           && !(this.boid.prevPos.x !== x && this.boid.prevPos.y !== y)
    //           && !(imgArr[y][x] === 1)) {
    //         const testArr = deepCopy(imgArr);
    //         testArr[y][x] = 1;
    //         tests.push(testArr);
    //         nextPositions.push({ x, y });
    //       }
    //     }
    //   }
    //   if (tests.length === 0) {
    //     return true;
    //   }

    //   // get activations
    //   const acts = eval2DArrayMultipleLayers(this.layers, starts).map((act, i) => [i, act[this.layerIndex][this.neuronIndex]]);

    //   // sort by activation and select highest (if all negative, halt)
    //   const sorted = acts.sort((a, b) => (a[1] > b[1]) ? -1 : 1);
    //   const best = sorted[0];
    //   if (best[1] <= 0) {
    //     // if no more improvements possible, halt
    //     return true;
    //   }

    //   const nextPos = nextPositions[best[0]];
    //   vel = (new p5.Vector(nextPos.x, nextPos.y)).sub(this.boid.pos);
    // }

    // // draw line segment from pos to next pos and update pos
    // // run update
    // this.boid.run(vel);
    // this.boid.isDrawing = true;
    // this.boid.draw(this.p);

    // this.p.stroke(0);
    // this.p.noFill();
    // this.p.rect(this.boid.pos.x, this.boid.pos.y, 1, 1);

    // // draw display version scaled up
    // if (this.pDisplay) {
    //   this.p.loadPixels();
    //   const imgArr = getImgArrFromPixels(this.p.pixels, this.p.width);
    //   this.pDisplay.customDraw(imgArr, this.displayScale);
    //   this.pDisplay.push();
    //   this.pDisplay.scale(this.displayScale);
    //   this.boid.drawBoid(this.pDisplay);
    //   this.pDisplay.pop();
    // }

    return false;
  }

  // get pos of new line
  findStart() {
    // test random lines and choose one with probability equal to quality

    // get current image
    this.p.loadPixels();
    const imgArr = getImgArrFromPixels(this.p.pixels, this.p.width);

    // try make lines are random positions
    const lineRate = 1; // 1 == a line at every pixel, 2 == lines at about every 2 pixels

    const startPositions = [];
    const starts = [];
    for (let y = 0; y < imgArr.length; y++) {
      for (let x = 0; x < imgArr[0].length; x++) {
        // for each pixel
        // skip if above rate
        if (Math.random() > (1 / lineRate)) {
          continue;
        }

        // make a random line

        const testArr = deepCopy(imgArr);
        testArr[y][x] = 1;
        starts.push(testArr);
        startPositions.push({ x, y });
      }
    }
    // get activations
    const acts = eval2DArrayMultipleLayers(this.layers, starts).map((act, i) => [i, act[this.layerIndex][this.neuronIndex]]);

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

    const vel = (new p5.Vector(bestNextPosition.x, bestNextPosition.y)).sub(this.boid.pos);

  }
}

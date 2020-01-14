import { getImgArrFromPixels, delay, getRandomArbitrary, choose } from './helpers';
import Boid from './boid';
import p5 from 'p5';

export class Drawer {
  constructor(smartCanvas, getScore, p, pDisplay=null, displayScale=1, strokeWeight=1, speed=100, canvasScale=1, bounds=null) {
    // stores abstract info
    this.smartCanvas = smartCanvas;
    // Sketch at 1:1 scale
    this.p = p;
    // Sketch scaled up for viewing and debugging
    this.pDisplay = pDisplay;
    this.displayScale = displayScale;
    this.speed = speed;
    this.strokeWeight = strokeWeight;
    this.canvasScale = canvasScale;
    this.getScore = getScore;
    this.boid = new Boid();
    this.drawingTimer = null;

    this.bounds = bounds;
    if (!bounds) {
      this.bounds = { sx: 0, sy: 0, ex: p.width, ey: p.height };
    }

    this.angleRange = Math.PI * 0.75;
    // this.segmentLength = Math.sqrt(2) * 2.01 * canvasScale;
    this.segmentLength = 1.5 * canvasScale;
    const approxNumTriesStart = 64;
    this.startLineRate = (this.bounds.ex - this.bounds.sx) * (this.bounds.ey - this.bounds.sy) / approxNumTriesStart; // 1 == a line at every pixel, 2 == lines at about every 2 pixels
    this.minStartTries = 5;
    this.countStartFails = 0;
    this.numTries = 64;
    this.minNextSegmentTries = 20;
    this.countNextSegmentFails = 0;
    this.prevScore = 0;
  }

  /**
   * Draws the given channels output on the provided canvas
   */
  async start(callback) {
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
      } else {
        setTimeout(callback, 0); // wrap in setTimeout in case async is depended on (can fail on first attempt)
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
    if (this.boid.pos === null) {
      const hasMoreStarts = this.findStart();
      if (!hasMoreStarts) {
        this.countStartFails++;
        if (this.countStartFails >= this.minStartTries) {
          this.countStartFails = 0;
          return true;
        }
      } else {
        this.countStartFails = 0;
      }
    } else {
      const hasNextSegment = this.findNextSegment();
      if (!hasNextSegment) {
        this.countNextSegmentFails++;
        if (this.countNextSegmentFails >= this.minNextSegmentTries) {
          this.countNextSegmentFails = 0;
          this.boid.pos = null;
        }
      } else {
        this.countNextSegmentFails = 0;
      }
    }

    return false;
  }

  // get pos of new line
  // test random lines and choose one with probability equal to quality
  findStart() {
    this.smartCanvas.setupStroke();

    // make a list of options and evalutate them
    const startParams = [];
    const lineInfos = [];
    const scores = [];
    let count = 0;
    for (let y = this.bounds.sy; y < this.bounds.ey; y++) {
      for (let x = this.bounds.sx; x < this.bounds.ex; x++) {
        if (Math.random() > (1 / this.startLineRate)) {
          continue; // skip at a certain rate
        }
        count++;

        // make a random line segment
        const start = new p5.Vector(x, y);
        const vel = p5.Vector.random2D().setMag(this.segmentLength);
        const end = start.copy().add(vel);
        if (!this.isWithinBounds(end)) {
          continue;
        }

        const lineInfo = this.smartCanvas.testSegment(start.copy().mult(1 / this.canvasScale), end.copy().mult(1 / this.canvasScale), true);
        if (!lineInfo) {
          continue;
        }

        const score = this.getScore(lineInfo) - this.prevScore;
        if (score <= 0) {
          continue;
        }

        startParams.push({ start, vel, end });
        lineInfos.push(lineInfo);
        scores.push(score);
      }
    }
    console.log('Try #' + (this.countStartFails + 1) + ' to find start. Attempting ' + count + ' times.');

    if (scores.length === 0) {
      return false; // if no more improvements possible, halt
    }


    const optionIndex = Drawer.chooseScore(scores);
    const { vel, start } = startParams[optionIndex];
    const lineInfo = lineInfos[optionIndex];
    const score = scores[optionIndex];

    console.log('Found ' + scores.length + ' starts with average score ' + (scores.reduce((a, b) => a + b, 0) / scores.length), scores);

    this.boid.move(start);
    this.update(vel, lineInfo, score);

    // debug
    for (let i = 0; i < startParams.length; i += 1) {
      const { start, end } = startParams[i];
      this.pDisplay.push();
      this.pDisplay.scale(this.displayScale);
      this.pDisplay.stroke(500 * scores[i], 0, 0);
      this.pDisplay.line(start.x, start.y, end.x, end.y);
      this.pDisplay.pop();
    }

    return true;
  }

  findNextSegment() {
    // choose a random line segment from the current position
    // make a list of options and evalutate them
    const vels = [];
    const lineInfos = [];
    const scores = [];

    // try angles center at angle segments
    const startAngle = this.boid.vel.copy().rotate(-this.angleRange);
    const angleDelta = (this.angleRange * 2) / (this.numTries - 1);
    const debug = []
    for (let i = 0; i < this.numTries; i += 1) {
      const angleNoise = getRandomArbitrary(-angleDelta / 2, angleDelta / 2);
      const angle = (angleDelta * i) + angleNoise;
      const vel = startAngle.copy().rotate(angle);
      // console.log((360 * angle) / (Math.PI * 2));
      // console.log(vel.heading());
      // const vel = this.boid.vel.copy().rotate(angleDelta);
      const start = this.boid.pos;
      const end = this.boid.pos.copy().add(vel);
      if (!this.isWithinBounds(end)) {
        continue;
      }

      const lineInfo = this.smartCanvas.testSegment(start.copy().mult(1 / this.canvasScale), end.copy().mult(1 / this.canvasScale));
      if (!lineInfo) {
        continue;
      }

      const score = this.getScore(lineInfo) - this.prevScore;
      debug.push([vel, score]);
      if (score <= 0) {
        continue;
      }

      vels.push(vel);
      lineInfos.push(lineInfo);
      scores.push(score);
    }
    console.log('Try #' + (this.countNextSegmentFails + 1) + ' to find next segment. Attempting ' + this.numTries + ' times.');
    // console.log(debug);

    if (scores.length === 0) {
      // debug
      // for (let i = 0; i < debug.length; i += 1) {
      //   const [ vel, score ] = debug[i];
      //   const start = this.boid.prevPos;
      //   this.pDisplay.push();
      //   this.pDisplay.scale(this.displayScale);
      //   this.pDisplay.stroke(500 * score, 0, 0);
      //   this.pDisplay.strokeWeight((0.1 * score) + 0.1);
      //   this.pDisplay.line(start.x, start.y, start.x + vel.copy().mult(5).x, start.y + vel.copy().mult(5).y);
      //   this.pDisplay.pop();
      // }
      return false; // if no more improvements possible, halt
    }

    const optionIndex = Drawer.chooseScore(scores);

    const vel = vels[optionIndex];
    const lineInfo = lineInfos[optionIndex];
    const score = scores[optionIndex];

    console.log('Found ' + scores.length + ' starts with average score ' + (scores.reduce((a, b) => a + b, 0) / scores.length), scores);

    this.update(vel, lineInfo, score);

    // debug
    for (let i = 0; i < debug.length; i += 1) {
      const [ vel, score ] = debug[i];
      const start = this.boid.prevPos;
      this.pDisplay.push();
      this.pDisplay.scale(this.displayScale);
      this.pDisplay.stroke(500 * score, 0, 0);
      this.pDisplay.strokeWeight(0.1 * score);
      this.pDisplay.line(start.x, start.y, start.x + vel.copy().mult(5).x, start.y + vel.copy().mult(5).y);
      this.pDisplay.pop();
    }

    return true;
  }

  // Return index of one of the better scores ([index, score]), chosen randomly, but weight towards better
  static chooseScore(scores) {
    if (scores.length === 0) {
      return -1;
    } else if (scores.length === 1) {
      return 0;
    }

    // sort the scores, but keep indices
    const sortedScores = scores.map((s, i) => [i, s]).sort((a, b) => (a[1] > b[1]) ? -1 : 1);
    const highScore = sortedScores[0][1];

    // select from one of the better scores
    const topScores = sortedScores.filter(el => (highScore * 0.5) - el[1]);

    // randomly choose one of the better scores with probability equal to amount
    const randomWeightedtopScoreIndex = choose(topScores.map(el => el[1]));

    const chosenTopScore = topScores[randomWeightedtopScoreIndex];
    const scoreIndex = chosenTopScore[0];
    return scoreIndex;
  }

  update(vel, lineInfo, score) {
    this.boid.run(vel);
    this.boid.draw(this.p);

    // draw display version scaled up
    if (this.pDisplay) {
      const imgArr = this.getCurrentImage();
      this.pDisplay.customDraw(imgArr, this.displayScale);
      this.pDisplay.push();
      this.pDisplay.scale(this.displayScale);
      this.boid.drawBoid(this.pDisplay);

      this.pDisplay.push();
      this.pDisplay.stroke(255, 0, 0);
      this.pDisplay.rect(this.bounds.sx, this.bounds.sy, this.bounds.ex - this.bounds.sx, this.bounds.ey - this.bounds.sy);
      this.pDisplay.pop();

      this.pDisplay.pop();
    }

    this.smartCanvas.lineInfo = lineInfo;
    // lineInfo.print();
    this.prevScore += score;
  }

  getCurrentImage() {
    this.p.loadPixels();
    const imgArr = getImgArrFromPixels(this.p.pixels, this.p.width);
    return imgArr;
  }

  isWithinBounds(v) {
    if (v.x >= 0 && v.y >= 0 && v.x < this.p.width && v.y < this.p.height) {
      return true;
    }
    return false;
  }
}

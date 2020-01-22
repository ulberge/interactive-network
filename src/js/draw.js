import { delay, getRandomArbitrary, choose2D } from './helpers';
import Boid from './boid';
import p5 from 'p5';

const settings = {
  strokeWeight: 2,
  speed: 10,
  angleRange: Math.PI * 0.75,
  // segmentLength: Math.sqrt(2) * 2.01,
  segmentLength: 3,
  minStartTries: 3,
  numTries: 24,
  minNextSegmentTries: 2,
};

export default class Drawer {
  constructor(smartCanvas, pOverlay=null, debug=null) {
    // canvas + abstract info
    this.smartCanvas = smartCanvas;
    // debugging sketch
    this.pOverlay = pOverlay;
    this.debug = debug;
    this.drawingTimer = null;
    this.isStep = false;

    document.addEventListener('keypress', () => {
      console.log('step');
      this.start();
    });
  }

  /**
   * Draws the given channels output on the provided canvas
   */
  async draw(network, layerIndex, channelIndex, location, callback) {
    // calc shadow (2D array of activation potential)
    this.shadow = network.getShadow(layerIndex, channelIndex);
    this.shadowOffset = network.getShadowOffset(layerIndex, location);
    this.getScore = channels => network.getScore(channels, layerIndex, channelIndex);

    const { x, y } = this.shadowOffset;
    const h = this.shadow.length;
    const w = this.shadow[0].length;
    this.bounds = [ x, y, w + x, h + y ];

    // initialize new drawer
    this.boid = new Boid(10);
    this.callback = callback;

    this.prevScore = 0;
    this.countStartFails = 0;
    this.countNextSegmentFails = 0;
    this.isDone = false;

    this.start();
  }

  async start() {
    console.log('start');
    if (this.isDone) {
      return;
    }

    if (this.drawingTimer) {
      clearTimeout(this.drawingTimer);
    }

    // wait until drawing canvases are ready
    while (!this.smartCanvas.p || !this.smartCanvas.p._setupDone || (this.pOverlay && !this.pOverlay._setupDone)) {
      console.log('waiting for p5 to be setup');
      await delay(10);
    }

    const runDraw = () => {
      this.isDone = this.drawTick();
      if (!this.isDone) {
        if (!this.isStep) {
          // auto update, do not wait for user keypress
          this.drawingTimer = setTimeout(runDraw, settings.speed);
        }
      } else {
        if (this.callback) {
          setTimeout(this.callback, 0); // wrap in setTimeout in case async is depended on (can fail on first attempt)
        }
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
    console.log('drawTick');
    if (this.boid.pos === null) {
      const hasMoreStarts = this.getNewLine();
      if (!hasMoreStarts) {
        this.countStartFails++;
        if (this.countStartFails >= settings.minStartTries) {
          this.countStartFails = 0;
          return true;
        }
      } else {
        this.countStartFails = 0;
      }
    } else {
      const hasNextSegment = this.getNextSegment();
      if (!hasNextSegment) {
        this.countNextSegmentFails++;
        if (this.countNextSegmentFails >= settings.minNextSegmentTries) {
          this.countNextSegmentFails = 0;
          this.boid.pos = null;
        }
      } else {
        this.countNextSegmentFails = 0;
      }
    }

    return false;
  }

  testSegment(start, end) {
    const result = this.smartCanvas.testSegment(start, end);
    if (!result) {
      return null;
    }

    const { lineInfo } = result;
    const channelsSelection = lineInfo.getChannelsInSelection(this.bounds);
    const score = this.getScore(channelsSelection) - this.prevScore;

    return score;
  }

  // get pos of new line
  // test random lines and choose one with probability equal to quality
  getNewLine() {
    const numStarts = 4;
    const numAngles = 4;
    console.log('Try #' + (this.countNextSegmentFails + 1) + ' to find start. Attempting ' + (numStarts * numAngles) + ' times.');

    const options = [];
    const scores = [];
    const { x: offX, y: offY } = this.shadowOffset;
    const offset = new p5.Vector(offX, offY);
    for (let i = 0; i < numStarts; i += 1) {
      const { x, y } = choose2D(this.shadow);
      const start = new p5.Vector(x, y).add(offset);

      for (let j = 0; j < numAngles; j += 1) {
        const vel = p5.Vector.random2D().setMag(settings.segmentLength);
        const end = start.copy().add(vel);
        const score = this.testSegment(start, end);

        options.push({ start, vel, end });
        scores.push(score);
      }
    }

    if (scores.filter(s => s > 0.2).length === 0) {
      return false; // if no more improvements possible, halt
    }

    const optionIndex = Drawer.chooseScore(scores);
    const score = scores[optionIndex];
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    console.log('Found ' + scores.length + ' starts with average score ' + avgScore, scores);
    const { start, end, vel } = options[optionIndex];
    this.boid.move(start);
    this.update(start, end, vel, score);

    return true;
  }

  getNextSegment() {
    console.log('Try #' + (this.countNextSegmentFails + 1) + ' to find next segment. Attempting ' + settings.numTries + ' times.');
    // choose a random line segment from the current position
    // make a list of options and evalutate them
    const startParams = [];
    // const lineInfos = [];
    const scores = [];
    const debugOptions = [];

    // try angles center at angle segments
    const startAngle = this.boid.vel.copy().rotate(-settings.angleRange);
    const angleDelta = (settings.angleRange * 2) / (settings.numTries - 1);

    for (let i = 0; i < settings.numTries; i += 1) {
      const angleNoise = getRandomArbitrary(-angleDelta / 2, angleDelta / 2);
      const angle = (angleDelta * i) + angleNoise;
      const vel = startAngle.copy().rotate(angle);
      const start = this.boid.pos.copy();
      const end = this.boid.pos.copy().add(vel);

      const debugOption = { start, end };
      debugOptions.push(debugOption);
      if (!this.isWithinBounds(end)) {
        continue;
      }
      debugOption.withinBounds = true;

      const result = this.smartCanvas.testSegment(start, end);
      if (!result) {
        continue;
      }

      const { lineInfo, imgArr, oldImgArr, max, ids, channelsDebug } = result;
      debugOption.imgArr = imgArr;
      debugOption.oldImgArr = oldImgArr;
      debugOption.max = max;
      debugOption.ids = ids;
      debugOption.channelsDebug = channelsDebug;
      // debugOption.lineInfo = lineInfo;

      const channelsSelection = lineInfo.getChannelsInSelection(this.bounds);
      const score = this.getScore(channelsSelection) - this.prevScore;
      debugOption.score = score;

      startParams.push({ start, vel, end });
      // lineInfos.push(lineInfo);
      scores.push(score);
    }
    if (this.debug && this.debug.ongetNextSegment) {
      console.log('test debug', debugOptions);
      this.debug.ongetNextSegment(debugOptions);
    }

    if (scores.filter(s => s > 0.1).length === 0) {
      return false; // if no more improvements possible, halt
    }

    const optionIndex = Drawer.chooseScore(scores);

    const { start, end, vel } = startParams[optionIndex];
    // const lineInfo = lineInfos[optionIndex];
    const score = scores[optionIndex];
    console.log('update', optionIndex, start, end, vel, score, scores);

    console.log('Found ' + scores.length + ' starts with average score ' + (scores.reduce((a, b) => a + b, 0) / scores.length), scores);

    this.update(start, end, vel, score);
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

    // return top index
    return sortedScores[0][0];
    // const highScore = sortedScores[0][1];

    // // select from one of the better scores
    // const topScores = sortedScores.filter(el => (highScore * 0.5) - el[1]);

    // // randomly choose one of the better scores with probability equal to amount
    // const randomWeightedtopScoreIndex = choose(topScores.map(el => el[1]));

    // const chosenTopScore = topScores[randomWeightedtopScoreIndex];
    // const scoreIndex = chosenTopScore[0];
    // return scoreIndex;
  }

  // Returns inclusive bounds centered at location inside shape
  // canvasShape: [w,h] of canvas
  // boundsShape: [w,h] of bounds centered at location
  // location: center of bounds
  static getLegalBounds(canvasShape, boundsShape, location) {
    // center the shadow at the location
    // crop to legal bounds
    const padX = Math.floor(boundsShape[0] / 2);
    const padY = Math.floor(boundsShape[1] / 2);
    const { x, y } = location;
    const sx = Math.max(0, x - padX);
    const sy = Math.max(0, y - padY);
    const ex = Math.min(canvasShape[0] - 1, x + padX);
    const ey = Math.min(canvasShape[1] - 1, y + padY);

    return [ sx, sy, ex, ey ];
  }

  update(start, end, vel, score) {
    this.boid.run(vel);

    // draw display version scaled up
    if (this.pOverlay) {
      this.pOverlay.clear();
      this.pOverlay.push();
      this.pOverlay.noFill();
      this.pOverlay.stroke(255, 0, 0);
      const [ sx, sy, ex, ey ] = this.bounds;
      this.pOverlay.rect(sx, sy, ex - sx, ey - sy);
      this.pOverlay.pop();
      this.pOverlay.stroke(0);
      this.boid.drawBoid(this.pOverlay);
    }

    // this.smartCanvas.lineInfo = lineInfo;
    this.smartCanvas.addSegment(start, end);
    this.smartCanvas.update();
    this.prevScore += score;
  }

  isWithinBounds(v) {
    const [ sx, sy, ex, ey ] = this.bounds;
    if (v.x >= sx && v.y >= sy && v.x < ex && v.y < ey) {
      return true;
    }
    return false;
  }
}

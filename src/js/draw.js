import { delay, getRandomArbitrary, choose2D, getImgArrFromP, getImgArrFromPSelection, slice2D, getBoundsShape, limitBounds, dilateBounds, getLineBounds } from './helpers';
import p5 from 'p5';

const settings = {
  strokeWeight: 2,
  speed: 1,
  angleRange: Math.PI * 0.75,
  segmentLength: 4,
  startMinTries: 6,
  startNumStarts: 4,
  startNumAngles: 4,
  nextMinTries: 2,
  nextNumStarts: 24,
};

export default class Drawer {
  constructor(smartCanvas, pOverlay=null, debug=null) {
    // canvas + abstract info
    this.smartCanvas = smartCanvas;
    // debugging sketch
    this.pOverlay = pOverlay;
    this.debug = debug;
    this.drawingTimer = null;
    this.isStep = true;

    document.addEventListener('keypress', () => {
      console.log('step');
      this.start();
    });
  }

  /**
   * Draws the given channels output on the provided canvas
   */
  async draw(network, layerIndex, channelIndex, location, callback) {
    // calc shadow (2D array of activation potential) which is the size of the theoretical receptive field
    this.shadow = network.getShadow(layerIndex, channelIndex);
    const { x, y } = network.getShadowOffset(layerIndex, location); // uses stride size to convert location to original coordinates
    this.shadowOffset = new p5.Vector(x, y);
    const h = this.shadow.length;
    const w = this.shadow[0].length;
    this.bounds = [ x, y, w + x, h + y ];

    // TODO: limit # of channels by passing channel filter
    this.getScore = lineInfo => network.getScore(lineInfo.channels, layerIndex, channelIndex);

    // initialize new drawer
    this.boid = new Boid();
    this.callback = callback;

    this.prevScore = 0;
    this.countStartFails = 0;
    this.countNextSegmentFails = 0;
    this.isDone = false;

    this.start();
  }

  getTester() {
    const lineInfoCropped = this.smartCanvas.lineInfo.copy(this.bounds);
    const tester = new Tester(this.smartCanvas.p, lineInfoCropped, this.bounds, this.getScore);
    return tester;
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
    // console.log('drawTick');
    if (this.boid.pos === null) {
      const hasMoreStarts = this.getNewLine();
      if (!hasMoreStarts) {
        this.countStartFails++;
        if (this.countStartFails >= settings.startMinTries) {
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
        if (this.countNextSegmentFails >= settings.nextMinTries) {
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
  getNewLine() {
    const tester = this.getTester();

    console.log('Try #' + (this.countNextSegmentFails + 1) + ' to find start. Attempting ' + (settings.startNumStarts * settings.startNumAngles) + ' times.');

    const options = [];
    const scores = [];
    for (let i = 0; i < settings.startNumStarts; i += 1) {
      const { x, y } = choose2D(this.shadow);
      // add random so it is not always at corner of pixel
      // add offset so that start and end are relative to origin
      const start = new p5.Vector(x + Math.random(), y + Math.random()).add(this.shadowOffset);
      for (let j = 0; j < settings.startNumAngles; j += 1) {
        const vel = p5.Vector.random2D().setMag(settings.segmentLength);
        const end = start.copy().add(vel);

        if (!this.isWithinBounds(start) || !this.isWithinBounds(end)) {
          continue;
        }

        const result = tester.testSegment(start, end);
        if (!result) {
          continue;
        }

        const { score } = result;
        options.push({ start, vel, end });
        scores.push(score - this.prevScore);
      }
    }

    if (scores.filter(s => s > 0.5).length === 0) {
      return false; // if no more improvements possible, halt
    }

    const optionIndex = Drawer.chooseScore(scores);
    const score = scores[optionIndex];
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    console.log('Found ' + scores.length + ' starts with average score ' + avgScore, scores.sort((a, b) => (a > b) ? -1 : 1));
    const { start, end, vel } = options[optionIndex];
    this.boid.move(start);
    this.update(start, end, vel, score);

    return true;
  }

  getNextSegment() {
    const tester = this.getTester();

    console.log('Try #' + (this.countNextSegmentFails + 1) + ' to find next segment. Attempting ' + settings.nextNumStarts + ' times.');
    // choose a random line segment from the current position
    // make a list of options and evalutate them
    const options = [];
    const scores = [];
    const debugOptions = [];

    // try angles center at angle segments
    const startAngle = this.boid.vel.copy().rotate(-settings.angleRange);
    const angleDelta = (settings.angleRange * 2) / (settings.nextNumStarts - 1);

    for (let i = 0; i < settings.nextNumStarts; i += 1) {
      const angleNoise = getRandomArbitrary(-angleDelta / 2, angleDelta / 2);
      const angle = (angleDelta * i) + angleNoise;
      const vel = startAngle.copy().rotate(angle);
      const start = this.boid.pos.copy();
      const end = this.boid.pos.copy().add(vel);

      if (!this.isWithinBounds(start) || !this.isWithinBounds(end)) {
        continue;
      }

      let debugOption = { start, end };
      debugOptions.push(debugOption);
      const result = tester.testSegment(start, end);
      if (!result) {
        continue;
      }

      const { score } = result;
      debugOptions[debugOptions.length - 1] = { ...debugOption, ...result };

      options.push({ start, vel, end });
      scores.push(score - this.prevScore);
    }

    if (this.debug && this.debug.onGetNextSegment) {
      // console.log('test debug', debugOptions);
      this.debug.onGetNextSegment(debugOptions);
    }

    if (scores.filter(s => s > 0.5).length === 0) {
      return false; // if no more improvements possible, halt
    }

    const optionIndex = Drawer.chooseScore(scores);

    const { start, end, vel } = options[optionIndex];
    // const lineInfo = lineInfos[optionIndex];
    const score = scores[optionIndex];
    // console.log('update', optionIndex, start, end, vel, score, scores);
    console.log('Found ' + scores.length + ' segments with average score ' + (scores.reduce((a, b) => a + b, 0) / scores.length), scores.sort((a, b) => (a > b) ? -1 : 1));

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

  update(start, end, vel, score) {
    console.log('New high score', this.prevScore + score, score);
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

// A class for an agent that can be controlled to make a drawing
class Boid {
  constructor() {
    this.diameter = 10;
    this.reset();
  }

  reset() {
    this.prevPos = null;
    this.pos = null;
    this.vel = null;
  }

  move(pos) {
    this.prevPos = pos.copy();
    this.pos = pos.copy();
  }

  // Update the position and velocity of the boid
  run(vel) {
    this.vel = vel;
    this.prevPos = this.pos.copy();
    this.pos.add(this.vel);
  }

  // For debugging purposes, draw the boid itself and its direction
  drawBoid(p) {
    p.push();
    p.noFill();
    p.stroke(0, 0, 0, 210);
    p.ellipseMode(p.CENTER);
    // Draw "boid" outline
    p.ellipse(this.pos.x, this.pos.y, this.diameter, this.diameter);
    // Draw velocity
    p.line(this.pos.x, this.pos.y, this.pos.x + this.diameter, this.pos.y + this.diameter);
    p.pop();
  }
}

class Tester {
  constructor(p, lineInfo, bounds, getScore) {
    this.p = p;
    this.lineInfo = lineInfo;
    // bounds of the cropped view, we need to expand...
    this.lineInfoBounds = bounds;
    this.bounds = dilateBounds(bounds, this.lineInfo.getPadding());
    this.offset = new p5.Vector(bounds[0], bounds[1]);
    this.getScore = getScore;
  }

  /**
   * Test out this line segment and get the results of what would happen
   * @param {{x: number, y: number}} start - Start point of line segment
   * @param {{x: number, y: number}} end - End point of line segment
   */
  testSegment(start, end) {
    // There are 3 scopes: this.p (the whole canvas), this.lineInfo (the cropped LineInfo for this tester), and dirtyBounds (the padded area around this change (the padding needs to be))
    const { x: sx, y: sy } = start;
    const { x: ex, y: ey } = end;

    const dirtyBounds = limitBounds(getLineBounds(start, end, this.lineInfo.getPadding() * 2), this.bounds);
    const [ w, h ] = getBoundsShape(dirtyBounds);
    const [ minX, minY, maxX, maxY ] = dirtyBounds;
    // this offset should be relative to lineInfo (which is not dilated)
    const dirtyBoundsLocalOffset = [ minX - this.lineInfoBounds[0], minY - this.lineInfoBounds[1], maxX - this.lineInfoBounds[0], maxY - this.lineInfoBounds[1] ]

    // cut out piece of original image (shifted by offset of this tester's cropped view)
    const oldImg = this.p.get(minX, minY, maxX, maxY);
    const oldImgArr = getImgArrFromPSelection(this.p, dirtyBounds);

    // create graphics the size of receptive field for the dirty area
    const g = this.p.createGraphics(w, h);
    g.image(oldImg, 0, 0);
    g.strokeWeight(2);
    // adjust line to dirtyBounds view...
    g.line(sx - minX, sy - minY, ex - minX, ey - minY);
    const dirtyImgArr = getImgArrFromP(g);

    // collect some info before change
    // const channelsOriginal = this.lineInfo.getChannels(dirtyBounds);
    const maxOriginal = slice2D(this.lineInfo.max, dirtyBoundsLocalOffset);
    const idsOriginal = slice2D(this.lineInfo.ids, dirtyBoundsLocalOffset);

    // update the LineInfo temporarily to get the resulting score
    this.lineInfo.update(dirtyImgArr, dirtyBoundsLocalOffset, true);
    const score = this.getScore(this.lineInfo);

    // collect some info after change
    // const channelsUpdated = this.lineInfo.getChannels(dirtyBounds);
    const channelsDebug = [];
    // debugger;
    // channelsDebug.push(LineInfo.diff(channelsOriginal, channelsUpdated, dirtyBounds, [0]));
    // channelsDebug.push(LineInfo.diff(channelsOriginal, channelsUpdated, dirtyBounds, [1]));
    const max = slice2D(this.lineInfo.max, dirtyBoundsLocalOffset);
    const ids = slice2D(this.lineInfo.ids, dirtyBoundsLocalOffset);
    const results = {
      score,
      imgArr: dirtyImgArr,
      oldImgArr: oldImgArr,
      // channelsOriginal,
      // channelsUpdated,
      max,
      ids,
      maxOriginal,
      idsOriginal,
      channelsDebug
    };

    // restore the LineInfo to its state from before this test
    this.lineInfo.restore();

    // const results = {
    //   score: Math.random(),
    //   channelsDebug: []
    // };

    return results;
  }
}


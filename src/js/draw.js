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

function delay(timer) {
  return new Promise(resolve => setTimeout(() => resolve(), timer));
}

function normalize(arr) {
  let sum = arr.reduce((a, b) => a + b, 0);
  if (sum === 0) {
    return arr.map(v => (1 / arr.length));
  }
  return arr.map(v => (v / sum));
}

function choose2D(arr2D) {
  const w = arr2D[0].length;
  const arr_f = arr2D.flat();
  const arr_n = normalize(arr_f);
  const selector = Math.random();
  let cursor = 0;
  for (let i = 0; i < arr_n.length; i += 1) {
    cursor += arr_n[i];
    if (selector <= cursor) {
      const y = Math.floor(i / w);
      const x = i % w;
      return { x, y };
    }
  }
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

export default class Drawer {
  constructor(smartCanvas, pOverlay=null) {
    // canvas + abstract info
    this.smartCanvas = smartCanvas;
    // debugging sketch
    this.pOverlay = pOverlay;
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
  async draw(layerIndex, filterIndex, location, callback) {
    // calc shadow (2D array of activation potential) which is the size of the theoretical receptive field
    this.shadow = this.smartCanvas.network.shadows[layerIndex][filterIndex];

    // the center of the shadow
    const { x, y } = this.smartCanvas.network.getShadowOffset(layerIndex, location);
    const h = this.shadow.length;
    const w = this.shadow[0].length;
    this.bounds = [
      Math.floor(x - (w / 2)),
      Math.floor(y - (h / 2)),
      Math.ceil(x + (w / 2)),
      Math.ceil(y + (h / 2))
    ];
    this.shadowOffset = this.bounds.slice(0, 2);

    // TODO: limit # of channels by passing channel filter
    this.getScore = () => {
      const { x, y } = location;
      return this.smartCanvas.network.arrs[layerIndex + 1].arr.tolist()[filterIndex][y][x];
    };

    // initialize new drawer
    this.boid = new Boid();
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
          console.log('rejected', start, end);
          continue;
        }

        this.smartCanvas.addSegment(start, end, true);
        this.smartCanvas.update(false);
        const score = this.getScore();
        console.log('score', score, this.prevScore, score - this.prevScore);
        this.smartCanvas.restore();
        options.push({ start, vel, end });
        scores.push(score - this.prevScore);
      }
    }

    if (scores.filter(s => s > 0.5).length === 0) {
      console.log('No scores over 0.5 found');
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
    console.log('Try #' + (this.countNextSegmentFails + 1) + ' to find next segment. Attempting ' + settings.nextNumStarts + ' times.');
    // choose a random line segment from the current position
    // make a list of options and evalutate them
    const options = [];
    const scores = [];

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
        console.log('Next segment rejection', start, end);
        continue;
      }
      this.smartCanvas.addSegment(start, end, true);
      this.smartCanvas.update(false);
      const score = this.getScore();
      console.log('score', score, this.prevScore, score - this.prevScore);
      this.smartCanvas.restore();
      options.push({ start, vel, end });
      scores.push(score - this.prevScore);
    }

    if (scores.filter(s => s > 0.5).length === 0) {
      console.log('Next segment no scores over 0.5');
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


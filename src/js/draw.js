import p5 from 'p5';

const settings = {
  strokeWeight: 2,
  speed: 0,
  angleRange: Math.PI * 0.85,
  // angleRange: Math.PI * 0.1,
  segmentLength: 5,
  startMinTries: 3000,
  startNumStarts: 8,
  startNumAngles: 4,
  nextMinTries: 2,
  nextNumStarts: 21,
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

// choose index from array with probability equal to relative value
function choose(arr) {
  const arr_n = normalize(arr);
  const selector = Math.random();
  let cursor = 0;
  for (let i = 0; i < arr_n.length; i += 1) {
    cursor += arr_n[i];
    if (selector <= cursor) {
      return i;
    }
  }
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

function chooseRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
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
      if (this.isStep) {
        console.log('step');
        this.start();
      }
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

    this.lineEnds = [];
    this.lineSegmentEnds = [];
    this.stages = [];
    this.dynamicMinScore = 50;
    this.updateOnTest = false;

    this.start();
  }

  /**
   * Draws multiple networks to the canvas, optimizing whatever score is passed
   */
  async drawMultiple(getScore, callback) {
    this.shadow = null;
    this.bounds = null;
    this.shadowOffset = null;

    // TODO: limit # of channels by passing channel filter
    this.getScore = getScore;
    this.updateOnTest = true;

    // initialize new drawer
    this.boid = new Boid();
    this.callback = callback;

    this.prevScore = 0;
    this.countStartFails = 0;
    this.countNextSegmentFails = 0;
    this.isDone = false;

    this.lineEnds = [];
    this.lineSegmentEnds = [];
    this.stages = [];
    this.dynamicMinScore = 50;

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

    const starts = [];
    for (let i = 0; i < settings.startNumStarts; i += 1) {
      let start;
      // if (this.lineEnds.length === 0) {
      //   // choose random point from shadow if no line ends or with probability
      //   const { x, y } = choose2D(this.shadow);
      //   // add offset so that start and end are relative to origin
      //   start = new p5.Vector(x, y).add(this.shadowOffset);
      //   // add random so it is not always at corner of pixel
      //   start.add(new p5.Vector(Math.random(), Math.random()));
      // } else {
      //   // choose line end
      //   start = chooseRandom(this.lineEnds);
      //   const offsetMax = 3;
      //   start.copy().add(new p5.Vector(Math.random() * offsetMax, Math.random() * offsetMax));
      // }

      if (this.lineEnds.length === 0 || Math.random() < 0.3) {
      // if (this.lineEnds.length === 0) {
        if (this.shadow) {
          // choose random point from shadow if no line ends or with probability
          const { x, y } = choose2D(this.shadow);
          // add offset so that start and end are relative to origin
          start = new p5.Vector(x, y).add(this.shadowOffset);
          // add random so it is not always at corner of pixel
          start.add(new p5.Vector(Math.random(), Math.random()));
        } else {
          // if no shadow, use random locations
          start = new p5.Vector(Math.random() * this.smartCanvas.shape[0], Math.random()  * this.smartCanvas.shape[1]);
        }
      } else {
        // choose line end
        if (this.lineSegmentEnds.length === 0 || Math.random() < 0.5) {
          start = chooseRandom(this.lineEnds);
        } else {
          start = chooseRandom(this.lineSegmentEnds);
        }
        const offsetMax = 3;
        start.copy().add(new p5.Vector(Math.random() * offsetMax, Math.random() * offsetMax));
      }
      starts.push(start);
    }

    const options = [];
    const scores = [];
    for (let start of starts) {
      for (let j = 0; j < settings.startNumAngles; j += 1) {
        const vel = p5.Vector.random2D().setMag(settings.segmentLength);
        const end = start.copy().add(vel);

        if (!this.isWithinBounds(start) || !this.isWithinBounds(end)) {
          console.log('rejected', start, end);
          continue;
        }

        this.smartCanvas.addSegment(start, end, true);
        this.smartCanvas.update(this.updateOnTest);
        const score = this.getScore();
        // console.log('score', score, this.prevScore, score - this.prevScore);
        this.smartCanvas.restore();
        options.push({ start, vel, end });
        scores.push(score - this.prevScore);
      }
    }

    if (scores.filter(s => s > this.dynamicMinScore).length === 0) {
      console.log('No scores over ' + this.dynamicMinScore + ' found');
      return false; // if no more improvements possible, halt
    }

    const optionIndex = this.chooseScore(scores);
    const score = scores[optionIndex];
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    console.log('Found ' + scores.length + ' starts with average score ' + avgScore, scores.slice().sort((a, b) => (a > b) ? -1 : 1));
    const { start, end, vel } = options[optionIndex];
    if (this.boid.pos) {
      this.lineEnds.push(this.boid.pos);
    }
    this.boid.move(start);
    this.lineEnds.push(start);
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
    const startAngle = this.boid.vel.copy().setMag(Math.max(1, settings.segmentLength - this.countNextSegmentFails)).rotate(-settings.angleRange);
    const angleDelta = (settings.angleRange * 2) / (settings.nextNumStarts - 1);

    const testOptions = [];
    for (let i = 0; i < settings.nextNumStarts; i += 1) {
      const angleNoise = getRandomArbitrary(-angleDelta / 2, angleDelta / 2);
      const angle = (angleDelta * i) + angleNoise;
      const vel = startAngle.copy().rotate(angle);
      const start = this.boid.pos.copy();
      const end = this.boid.pos.copy().add(vel);
      testOptions.push({ start, vel, end });
    }

    if (this.prevOption) {
      const { vel } = this.prevOption;
      const angleNoise = getRandomArbitrary(-angleDelta / 8, angleDelta / 8);
      const velAdj = vel.copy().rotate(angleNoise);
      const start = this.boid.pos.copy();
      const end = this.boid.pos.copy().add(velAdj);
      testOptions.push({ start, vel: velAdj, end });
    }

    for (let option of testOptions) {
      const { start, end } = option;
      if (!this.isWithinBounds(start) || !this.isWithinBounds(end)) {
        console.log('Next segment rejection', start, end);
        continue;
      }
      this.smartCanvas.addSegment(start, end, true);
      this.smartCanvas.update(this.updateOnTest);
      const score = this.getScore();
      // console.log('score', score, this.prevScore, score - this.prevScore);
      this.smartCanvas.restore();
      options.push(option);
      scores.push(score - this.prevScore);
    }

    if (scores.filter(s => s > this.dynamicMinScore).length === 0) {
      console.log('Next segment no scores over ' + this.dynamicMinScore);
      return false; // if no more improvements possible, halt
    }

    const optionIndex = this.chooseScore(scores);

    const { start, end, vel } = options[optionIndex];
    // const lineInfo = lineInfos[optionIndex];
    const score = scores[optionIndex];
    // console.log('update', optionIndex, start, end, vel, score, scores);
    console.log('Chose ' + optionIndex, 'Found ' + scores.length + ' segments with average score ' + (scores.reduce((a, b) => a + b, 0) / scores.length), scores, scores.slice().sort((a, b) => (a > b) ? -1 : 1));

    this.lineSegmentEnds.push(start);
    this.update(start, end, vel, score);
    return true;
  }

  // Return index of one of the better scores ([index, score]), chosen randomly, but weight towards better
  chooseScore(scores) {
    if (scores.length === 0) {
      return -1;
    } else if (scores.length === 1) {
      return 0;
    }

    // sort the scores, but keep indices
    const sortedScores = scores.map((s, i) => [i, s]).sort((a, b) => (a[1] > b[1]) ? -1 : 1);

    // return top index
    return sortedScores[0][0];

    // return random weighted by score
    // const filteredScores = scores.map((s, i) => [i, s]).filter(el => el[1] > this.dynamicMinScore);
    // const choice = choose(filteredScores.map(el => el[1] ** 2));
    // const scoreIndex = filteredScores[choice][0];
    // return scoreIndex;

    // const highScore = sortedScores[0][1];

    // // select from one of the better scores
    // const topScores = sortedScores.filter(el => (el[1] - (highScore * 0.5)) > 0);

    // randomly choose one of the better scores with probability equal to amount
    // const choice = choose(sortedScores.map(el => el[1] ** 8));

    // const scoreIndex = sortedScores[choice][0];
    // return scoreIndex;
  }

  update(start, end, vel, score) {
    this.prevOption = { start, end, vel };
    // console.log('New high score', this.prevScore + score, score);
    this.boid.run(vel);
    this.smartCanvas.p.loadPixels();
    this.stages.push({ dist: start.dist(end), img: this.smartCanvas.p.pixels.slice() });

    // draw display version scaled up
    if (this.pOverlay) {
      this.pOverlay.clear();
      if (this.bounds) {
        this.pOverlay.push();
        this.pOverlay.noFill();
        this.pOverlay.stroke(255, 0, 0);
        const [ sx, sy, ex, ey ] = this.bounds;
        this.pOverlay.rect(sx, sy, ex - sx, ey - sy);
        this.pOverlay.pop();
      }
      this.pOverlay.stroke(0);
      this.boid.drawBoid(this.pOverlay);
    }

    this.smartCanvas.addSegment(start, end);
    this.smartCanvas.update();
    this.prevScore += score;

    this.dynamicMinScore = 50;
    if (this.lineSegmentEnds.length > 5) {
      this.dynamicMinScore = (this.prevScore / (this.lineSegmentEnds.length + 1)) / 5;
    }
  }

  isWithinBounds(v) {
    let bounds = this.bounds;
    if (!bounds) {
      bounds = this.smartCanvas.bounds;
    }

    const [ sx, sy, ex, ey ] = bounds;
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


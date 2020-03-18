import p5 from 'p5';

const settings = {
  strokeWeight: 1,
  speed: 1,
  angleRange: Math.PI * 0.85,
  segmentLength: 5,
  startMinTries: 100,
  startNumStarts: 8,
  startNumAngles: 4,
  nextMinTries: 4,
  nextNumStarts: 12,
  sensitivity: 5,
};

function delay(timer) {
  return new Promise(resolve => setTimeout(() => resolve(), timer));
}

function chooseRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

export default class Drawer {
  constructor(smartCanvas) {
    this.smartCanvas = smartCanvas;
    this._listeners = [];
  }

  /**
   * Draws multiple networks to the canvas, optimizing whatever score is passed
   */
  async draw(getScore, callback) {
    this.getScore = getScore;
    this.callback = callback;

    this.boid = new Boid(this.smartCanvas.p);
    this.countStartFails = 0;
    this.countNextSegmentFails = 0;
    this.isDone = false;
    this.lineEnds = [];
    this.lineSegmentEnds = [];
    this.dynamicMinScore = 50;
    this.scores = [];
    this.smartCanvas.p.strokeWeight(settings.strokeWeight);
    this.start();
  }

  addListener(fn) {
    this._listeners.push(fn);
  }

  removeListener(fn) {
    const i = this._listeners.indexOf(fn);
    if (i > -1) {
      this._listeners.splice(i, 1);
    }
  }

  _notifyListeners(...params) {
    for (let fn of this._listeners) {
      if (fn) {
        fn(...params);
      }
    }
  }

  async start() {
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
    if (this.boid.pos === null) {
      this._notifyListeners('NEWLINE');
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
        // slow speed on fail to find
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

  getNewLine() {
    console.log('Try #' + (this.countNextSegmentFails + 1) + ' to find start. Attempting ' + (settings.startNumStarts * settings.startNumAngles) + ' times.');

    // Select starts with equal weight between random, at line ends, or along the lines
    const starts = [];
    for (let i = 0; i < settings.startNumStarts; i += 1) {
      let start;
      if ((this.lineEnds.length === 0 && this.lineSegmentEnds.length === 0) || Math.random() < 0.83) {
        // if no shadow, use random locations
        start = new p5.Vector(Math.random() * this.smartCanvas.shape[0], Math.random()  * this.smartCanvas.shape[1]);
      } else {
        if (this.lineSegmentEnds.length === 0 || Math.random() < 0.5) {
          start = chooseRandom(this.lineEnds);
        } else {
          start = chooseRandom(this.lineSegmentEnds);
        }
        // Add random noise
        const offsetMax = 3;
        start.copy().add(new p5.Vector(Math.random() * offsetMax, Math.random() * offsetMax));
      }
      starts.push(start);
    }

    // Get line segments
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

        // Check the scores
        this.smartCanvas.addSegment(start, end, true);
        this.smartCanvas.update();
        const score = this.getScore();

        // Record and undo
        this.smartCanvas.restore();
        options.push({ start, vel, end });
        scores.push(score);
      }
    }

    // Filter out scores that are too low (to eliminate drawing lines slightly thicker and darker)
    if (scores.filter(s => s > this.dynamicMinScore).length === 0) {
      console.log('No scores over ' + this.dynamicMinScore + ' found');
      return false; // if no more improvements possible, halt
    }


    const optionIndex = this.chooseScore(scores);
    const score = scores[optionIndex];
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    console.log('Found ' + scores.length + ' starts with average score ' + avgScore, scores.slice().sort((a, b) => (a > b) ? -1 : 1));
    const { start, end, vel } = options[optionIndex];

    // Always add start
    this.lineEnds.push(start);
    // If this was not the first line, add the end of the last line as an end
    if (this.boid.pos) {
      this.lineEnds.push(this.boid.pos);
    }

    this.boid.move(start);

    this.update(start, end, vel, score);

    return true;
  }

  getNextSegment() {
    console.log('Try #' + (this.countNextSegmentFails + 1) + ' to find next segment. Attempting ' + settings.nextNumStarts + ' times.');
    const options = [];
    const scores = [];

    // Try angles center at angle segments
    const segmentLength = Math.max(1, settings.segmentLength * Math.pow(0.85, this.countNextSegmentFails));
    console.log('segmentLength', segmentLength);
    const testOptions = this.boid.getNextVelOptions(segmentLength, settings.angleRange, settings.nextNumStarts);

    for (let option of testOptions) {
      const { start, end } = option;
      if (!this.isWithinBounds(start) || !this.isWithinBounds(end)) {
        console.log('Next segment rejection', start, end);
        continue;
      }
      this.smartCanvas.addSegment(start, end, true);
      this.smartCanvas.update();
      const score = this.getScore();
      this.smartCanvas.restore();
      options.push(option);
      scores.push(score);
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
  }

  update(start, end, vel, score) {
    this.prevOption = { start, end, vel };
    this.boid.run(vel);

    // Add the segment that was chosen
    this.smartCanvas.addSegment(start, end);
    this.smartCanvas.update();
    this._notifyListeners('ADDSEG');
    this.scores.push(score);

    // Update the dynamic min score to filter out super minor updates
    this.dynamicMinScore = 50;
    if (this.scores.length > 5) {
      const avgScore = this.scores.reduce((a, b) => a + b) / this.scores.length;
      this.dynamicMinScore = avgScore / settings.sensitivity;
    }
  }

  isWithinBounds(v) {
    const [ sx, sy, ex, ey ] = this.smartCanvas.bounds;
    if (v.x >= sx && v.y >= sy && v.x < ex && v.y < ey) {
      return true;
    }
    return false;
  }
}

// A class for an agent that can be controlled to make a drawing
class Boid {
  constructor(p) {
    this.diameter = 10;
    this.reset();
    this.p = p;
  }

  getNextVelOptions(segmentLength, angleRange, num) {
    const startAngle = this.vel.copy().setMag(segmentLength);

    // Generate even distribution of angles with higher density at center
    function getOffsetsAndDeltas(num, angleRange) {
      let n = num / 2;
      let sum = 0;
      const offsets = [];
      const deltas = [];
      for (let i = 0; i < n; i += 1) {
        offsets.push(sum);
        deltas.push(n - i);
        sum += (n - i);
      }
      for (let i = 0; i < n; i += 1) {
        offsets.push(sum);
        deltas.push(1 + i);
        sum += (1 + i);
      }
      const numSegs = n * (n+1);
      const segSize = angleRange / numSegs;
      return [offsets, deltas].map(arr => arr.map(v => v * segSize));
    }
    const options = [];
    const [angleOffsets, angleDeltas] = getOffsetsAndDeltas(num, angleRange * 2);
    console.log(angleOffsets, angleRange * 2);
    for (let i = 0; i < num; i += 1) {
      const angleDelta = angleDeltas[i];
      const angleOffset = angleOffsets[i];
      const angleNoise = getRandomArbitrary(-angleDelta / 2, angleDelta / 2);
      const angle = angleOffset + angleNoise - angleRange;
      const vel = startAngle.copy().rotate(angle).setMag(segmentLength);
      options.push(vel);
    }

    // Generate even distribution of angles with noise
    // const angleDelta = (angleRange * 2) / (num - 1);
    // const options = [];
    // for (let i = 0; i < num; i += 1) {
    //   const angleNoise = getRandomArbitrary(-angleDelta / 2, angleDelta / 2);
    //   const angle = (angleDelta * i) + angleNoise - angleRange;
    //   const vel = startAngle.copy().setMag(segmentLength).rotate(angle);
    //   options.push(vel);
    // }

    // Generate random angles
    // const options = [];
    // for (let i = 0; i < num; i += 1) {
    //   const angle = this.p.randomGaussian() * angleRange;
    //   const vel = startAngle.copy().setMag(segmentLength).rotate(angle);
    //   options.push(vel);
    // }

    // get slightly altered copy of original
    const prevCopy = this.vel.copy().rotate(getRandomArbitrary(-Math.PI / 64, Math.PI / 64));
    options.push(prevCopy);

    return options.map(vel => ({
      vel,
      start: this.pos.copy(),
      end: this.pos.copy().add(vel),
    }));
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
}

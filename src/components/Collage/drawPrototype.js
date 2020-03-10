import p5 from 'p5';

const settings = {
  strokeWeight: 2,
  speed: 1,
  angleRange: Math.PI * 0.85,
  segmentLength: 5,
  startMinTries: 3000,
  startNumStarts: 8,
  startNumAngles: 4,
  nextMinTries: 4,
  nextNumStarts: 16,
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

export default class Drawer {
  constructor(p) {
    this.p = p;
  }

  /**
   * Draws multiple networks to the canvas, optimizing whatever score is passed
   */
  async draw(imgArr, callback) {
    this.imgArr = imgArr;
    this.callback = callback;

    this.boid = new Boid(this.p);
    this.prevScore = 0;
    this.countStartFails = 0;
    this.countNextSegmentFails = 0;
    this.isDone = false;
    this.lineEnds = [];
    this.lineSegmentEnds = [];
    this.dynamicMinScore = 50;

    this.start();
  }

  async start() {
    if (this.isDone) {
      return;
    }

    if (this.drawingTimer) {
      clearTimeout(this.drawingTimer);
    }

    // wait until drawing canvases are ready
    while (!this.p || !this.p._setupDone) {
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

  _getLineBounds(start, end) {
    const pad = 1; // stroke weight is 2 right now, so pad by 1
    let minX = Math.max(0, Math.min(start.x, end.x) - pad);
    let minY = Math.max(0, Math.min(start.y, end.y) - pad);
    let maxX = Math.min(this.p.width - 1, Math.max(start.x, end.x) + pad + 1);
    let maxY = Math.min(this.p.height - 1, Math.max(start.y, end.y) + pad + 1);
    const bounds = [ minX, minY, maxX, maxY ].map(v => Math.floor(v));
    return bounds;
  }

  _getImgArr(pxs, rowWidth) {
    const imgArr = [];
    let row = [];
    for (let i = 3; i < pxs.length; i += 4) {
      row.push(pxs[i]);
      if (row.length === rowWidth) {
        imgArr.push(row);
        row = [];
      }
    }
    return imgArr;
  }

  _convolve(pxs0, pxs1) {
    if (pxs0.length !== pxs1.length || pxs0[0].length !== pxs1[0].length) {
      debugger;
    }
    let convSum = 0;
    for (let y = 0; y < pxs0.length; y += 1) {
      for (let x = 0; x < pxs0[0].length; x += 1) {
        convSum += pxs0[y][x] * pxs1[y][x];
      }
    }
    return convSum;
  }

  _get2DArraySlice(arr, selection) {
    if (!arr || arr.length === 0 || arr[0].length === 0 || !selection) {
      return arr;
    }
    let [ minX, minY, maxX, maxY ] = selection;
    minX = Math.max(0, minX);
    minY = Math.max(0, minY);
    maxX = Math.min(arr[0].length, maxX);
    maxY = Math.min(arr.length, maxY);

    const slice = arr.slice(minY, maxY).map(row => row.slice(minX, maxX));
    return slice;
  }

  // Create copy of area, multiply by section of protype
  // Draw to the copy, multiply by section of prototype
  // Calculate diff in score and set that as score
  getScore(start, end) {
    const bounds = this._getLineBounds(start, end);
    const [ minX, minY, maxX, maxY ] = bounds;
    const copy = this.p.get(minX, minY, maxX - minX, maxY - minY);
    copy.loadPixels();
    const copyPixels = this._getImgArr(copy.pixels, maxX - minX);
    const kernelPixels = this._get2DArraySlice(this.imgArr, bounds);
    const scoreBefore = this._convolve(copyPixels, kernelPixels);

    const g = this.p.createGraphics(maxX - minX, maxY - minY);
    g.image(copy, 0, 0);
    const startAdj = start.copy().sub(minX, minY);
    const endAdj = end.copy().sub(minX, minY);
    g.strokeWeight(settings.strokeWeight);
    g.line(startAdj.x, startAdj.y, endAdj.x, endAdj.y);

    g.loadPixels();
    const copyPixelsAfter = this._getImgArr(g.pixels, maxX - minX);
    const scoreAfter = this._convolve(copyPixelsAfter, kernelPixels);

    return scoreAfter - scoreBefore;
  }

  getNewLine() {
    console.log('Try #' + (this.countNextSegmentFails + 1) + ' to find start. Attempting ' + (settings.startNumStarts * settings.startNumAngles) + ' times.');

    // Select starts with equal weight between random, at line ends, or along the lines
    const starts = [];
    const weights = this.imgArr.map(row => row.map(v => v > 0 ? v : 0));
    for (let i = 0; i < settings.startNumStarts; i += 1) {
      let start;
      if ((this.lineEnds.length === 0 && this.lineSegmentEnds.length === 0) || Math.random() < 0.33) {
        // if (this.lineEnds.length === 0) {
        if (this.imgArr) {
          // choose random point from shadow if no line ends or with probability
          const { x, y } = choose2D(weights);
          start = new p5.Vector(x, y);
          // add random so it is not always at corner of pixel
          start.add(new p5.Vector(Math.random(), Math.random()));
        } else {
          // if no shadow, use random locations
          start = new p5.Vector(Math.random() * this.smartCanvas.shape[0], Math.random()  * this.smartCanvas.shape[1]);
        }
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
        const score = this.getScore(start, end);

        // Record and undo
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
      const score = this.getScore(start, end);
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
    this.p.line(start.x, start.y, end.x, end.y);
    this.prevScore += score;

    // Update the dynamic min score to filter out super minor updates
    this.dynamicMinScore = 50;
    if (this.lineSegmentEnds.length > 10) {
      this.dynamicMinScore = (this.prevScore / (this.lineSegmentEnds.length + 1)) / 10;
    }
  }

  isWithinBounds(v) {
    const [ sx, sy, ex, ey ] = [0, 0, this.p.width, this.p.height];
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

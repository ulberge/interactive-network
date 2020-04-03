import p5 from 'p5';
// const bresenham = require('bresenham-js');

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
function chooseRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function getRandomVector(magnitude) {
  return p5.Vector.random2D().setMag(magnitude);
  // return new p5.Vector(magnitude, 0).rotate(Math.PI * 2 * Math.random());
}

// get angles that are spaced into buckets
function getRandomAnglesDistributed(startAngle, angleRange, num) {
  // Generate even distribution of angles with noise
  const angleDelta = angleRange / (num - 1);
  const angles = [];
  for (let i = 0; i < num; i += 1) {
    const angleNoise = getRandomArbitrary(-angleDelta / 2, angleDelta / 2);
    const angle = startAngle + (angleDelta * i) + angleNoise;
    angles.push(angle);
  }
  return angles;
}

function argMax(arr) {
  return arr.indexOf(Math.max(...arr));
}

// draws a filter at a given attention location
export default class FilterRenderer {
  constructor(bounds, getScore, addSegment, settings={}) {
    this.settings = {
      // default settings
      defaultSegmentLength: 5,
      // new line settings
      newLineNum: 20,
      newLineRandomRatio: 0.5,
      // newLineWhiteSpaceThreshold: [2, 100],
      newLineMinThreshold: 50, // minimum score for acceptance
      newLinePatience: 3, // number of steps to attempt new line before being isStuck
      // next segment settings
      nextSegmentNum: 12,
      nextSegmentAngleRange: Math.PI * 0.85,
      // nextSegmentWhiteSpaceThreshold: [2, 100],
      nextSegmentMinThreshold: 50, // minimum score for acceptance
      nextSegmentPatience: 3, // number of steps to attempt next segment before new line
      // custom settings
      ...settings
    };

    this.segmentGroup = []; // keeps track of Segments added by this render attempt
    this.lineEnds = []; // list of xy locations on canvas at line ends, to influence new starts
    this.getScore = getScore;
    this.addSegment = addSegment;
    this.bounds = bounds;
    this.newLineFails = 0;
    this.nextSegmentFails = 0;
    this.pos = null;
    this.vel = null;
  }

  // return true if stuck
  step() {
    if (this.newLineFails >= this.settings.newLinePatience) {
      // is stuck at this attention location in the activations
      return true;
    }

    let segment;
    if (this.pos === null) {
      // try to draw a new line
      segment = this.getNewLine();

      if (!segment) {
        this.newLineFails++;
      } else {
        this.addSegment(segment.start, segment.end);
        if (this.pos) { // add end of last line if not first line
          this.lineEnds.push(this.pos);
        }
        // add the start of this line as a line start
        this.lineEnds.push(segment.start);
        this.pos = segment.end;
        this.vel = segment.end.copy().sub(segment.start);
        // console.log('new line score:', segment.score);
        this.newLineFails = 0;
      }
    } else {
      // try to draw a segment at the end of the current position
      segment = this.getNextSegment();

      if (!segment) {
        this.nextSegmentFails++;

        if (this.nextSegmentFails >= this.settings.nextSegmentPatience) {
          // is stuck at this canvas position, reset
          this.pos = null;
          this.vel = null;
        }
      } else {
        this.addSegment(segment.start, segment.end);
        // console.log('next segment score:', segment.score);
        this.pos = segment.end;
        this.vel = segment.end.copy().sub(segment.start);
        this.nextSegmentFails = 0;
      }
    }

    return false;
  }

  getNewLine() {
    // create options with random starts and ends (or starting from line ends)
    let options = [];
    for (let i = 0; i < this.settings.newLineNum; i += 1) {
      let start;
      if (this.lineEnds.length === 0 || Math.random() < this.settings.newLineRandomRatio) {
        const [ sx, sy, ex, ey ] = this.bounds;
        start = new p5.Vector(getRandomArbitrary(sx, ex), getRandomArbitrary(sy, ey));
      } else {
        start = chooseRandom(this.lineEnds).copy();
      }
      const offset = getRandomVector(this.settings.defaultSegmentLength);
      const end = start.copy().add(offset);
      options.push({ start, end });
    }

    // filter invalid options: out of bounds or overlapping
    options = options.filter(option => {
      const { start, end } = option;
      if (!this.isWithinBounds(start) || !this.isWithinBounds(end)) {
        return false;
      }
      // Check if it crosses enough light colored squares
      // if (!this.doesCrossWhiteSquare(start, end, ...this.settings.newLineWhiteSpaceThreshold)) {
      //   console.log('New Line rejected: Does not cross open area', start, end);
      //   return false;
      // }
      return true;
    });

    // get scores for valid options
    options.forEach(option => {
      // mutate option object, forgive me
      option.score = this.getScore(option.start, option.end);
    });

    // filter scores below threshold
    options = options.filter(option => option.score >= this.settings.newLineMinThreshold);

    if (options.length === 0) {
      // no options found!
      return null;
    }

    // return the highest scoring option
    const optionIndex = argMax(options.map(option => option.score));
    return options[optionIndex];
  }

  getNextSegment() {
    // calc dynamic segment length (it shortens as more failures!)
    const dynamicSegmentLength = Math.max(1, this.settings.defaultSegmentLength * Math.pow(0.85, this.nextSegmentFails));

    const angles = getRandomAnglesDistributed(-this.settings.nextSegmentAngleRange, this.settings.nextSegmentAngleRange * 2, this.settings.nextSegmentNum);

    let options = angles.map(angle => {
      const vel = this.vel.copy().setMag(dynamicSegmentLength).rotate(angle);
      const end = this.pos.copy().add(vel);
      return { start: this.pos, end };
    });

    // get slightly altered version of if you continued straight
    const prevVelNoisy = this.vel.copy().rotate(getRandomArbitrary(-Math.PI / 64, Math.PI / 64));
    options.push({ start: this.pos, end: this.pos.copy().add(prevVelNoisy) });

    // filter invalid options: out of bounds or overlapping
    options = options.filter(option => {
      const { start, end } = option;
      if (!this.isWithinBounds(start) || !this.isWithinBounds(end)) {
        return false;
      }
      // Check if it crosses enough light colored squares
      // if (!this.doesCrossWhiteSquare(start, end, ...this.settings.nextSegmentWhiteSpaceThreshold)) {
      //   console.log('New Line rejected: Does not cross open area', start, end);
      //   return false;
      // }
      return true;
    });

    // get scores for valid options
    options.forEach(option => {
      // mutate option object, forgive me
      option.score = this.getScore(option.start, option.end);
    });

    // const sortedOptionScores = options.map(o => o.score).sort((a, b) => (a > b ? -1 : 1));
    // console.log('next seg high score: ', sortedOptionScores[0]);

    // filter scores below threshold
    options = options.filter(option => option.score >= this.settings.nextSegmentMinThreshold);

    if (options.length === 0) {
      // no options found!
      return null;
    }

    // return the highest scoring option
    const optionIndex = argMax(options.map(option => option.score));
    return options[optionIndex];
  }

  isWithinBounds(v) {
    const [ sx, sy, ex, ey ] = this.bounds;
    if (v.x >= sx && v.y >= sy && v.x < ex && v.y < ey) {
      return true;
    }
    return false;
  }

  // Does this line cross squares that are white based on the threshold?
  // doesCrossWhiteSquare(start, end, amt=1, threshold=1) {
  //   const squares = bresenham([Math.floor(start.x), Math.floor(start.y)], [Math.floor(end.x), Math.floor(end.y)]);

  //   const g = this.p.get(start.x, start.y, end.x, end.y);
  //   g.loadPixels();
  //   let count = 0;
  //   for (const pt of squares) {
  //     const [x, y] = pt;
  //     const c = p.get(x, y);
  //     if (c[3] <= threshold) {
  //       count++;
  //     }

  //     if (count >= amt) {
  //       return true;
  //     }
  //   }

  //   return false;
  // }
}

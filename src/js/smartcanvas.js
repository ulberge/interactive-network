import p5 from 'p5';
import { getEmpty2DArray, deepCopy, getUniqueNeighbors, floodFill } from './helpers';

export const CONSTANTS = {
  ANGLES: [
    0, Math.PI / 2, // 0, 90 degrees: horiz (--), vert (|)
    Math.PI / 4, 3 * Math.PI / 4, // 45, 135 degrees: diag (/), diag (\)
    Math.PI / 8, 3 * Math.PI / 8, 5 * Math.PI / 8, 7 * Math.PI / 8, // 22.5, 67.5, 112.5, 157.5 degrees
    Math.PI / 16, 3 * Math.PI / 16, 5 * Math.PI / 16, 7 * Math.PI / 16, 9 * Math.PI / 16, 11 * Math.PI / 16, 13 * Math.PI / 16, 15 * Math.PI / 16,
    Math.PI / 32, 3 * Math.PI / 32, 5 * Math.PI / 32, 7 * Math.PI / 32, 9 * Math.PI / 32, 11 * Math.PI / 32, 13 * Math.PI / 32, 15 * Math.PI / 32, 17 * Math.PI / 32, 19 * Math.PI / 32, 21 * Math.PI / 32, 23 * Math.PI / 32, 25 * Math.PI / 32, 27 * Math.PI / 32, 29 * Math.PI / 32, 31 * Math.PI / 32
  ]
};

const numAngles = 8;
const LINE_ANGLES = CONSTANTS.ANGLES.slice(0, numAngles).map(angle => new p5.Vector.fromAngle(angle));

const getNumArray = (start, end) => {
  const arr = [];
  for (let i = start; i < end; i += 1) {
    arr.push(i);
  }
  return arr;
}

class LineInfo {
  constructor(w, h) {
    if (w && h) {
      this.channels = [];

      // map storing locations of channels by name
      const refs = {};

      // add line channels
      refs.lines = { start: 0, end: numAngles };
      for (let i = 0; i < numAngles; i += 1) {
        this.channels.push(getEmpty2DArray(h, w, 0));
      }

      // add line end channel
      refs.lineEnd = { start: this.channels.length, end: this.channels.length + 1 };
      this.channels.push(getEmpty2DArray(h, w, 0));

      // add corner channels
      const numCorners = 4;
      refs.corners = { start: this.channels.length, end: this.channels.length + numCorners };
      for (let i = 0; i < numCorners; i += 1) {
        this.channels.push(getEmpty2DArray(h, w, 0));
      }

      // add list of indices at 'all' for each for convenience
      Object.keys(refs).forEach(key => refs[key].all = getNumArray(refs[key].start, refs[key].end));
      this.refs = Object.freeze(refs);
    }
  }

  static copy(lineInfo) {
    const copy = new this();
    copy.channels = deepCopy(lineInfo.channels);
    // map storing locations of channels by name
    copy.refs = lineInfo.refs;
    return copy;
  }

  getChannelsAt(pos) {
    const { x, y } = pos;
    return this.channels.map(channel => channel[y][x]);
  }

  setChannelAt(pos, channelIndex, v) {
    const { x, y } = pos;
    this.channels[channelIndex][y][x] = v;
  }

  floodFillChannelAt(pos, channelIndex, v) {
    floodFill(this.channels[channelIndex], pos, v);
  }
}


export class SmartCanvas {
  constructor(w, h) {
    this.lineInfo = new LineInfo(w, h);
    this.bounds = [0, 0, w, h];
    this.r = 1;
  }

  // Return the line type that has the minimum diff in angle from the line between start and end
  static getLineType(start, end) {
    const lineBetween = end.copy().sub(start);
    let minAngle = Infinity;
    let minAngleIndex = -1;
    LINE_ANGLES.forEach((angle, i) => {
      const angleBetween = Math.min(Math.abs(angle.angleBetween(lineBetween)), Math.abs(angle.copy().mult(-1).angleBetween(lineBetween)));
      if (angleBetween < minAngle) {
        minAngle = angleBetween;
        minAngleIndex = i;
      }
    });
    return minAngleIndex;
  }

  // interpolated between start and end at the step provided, recording unique pixels crossed
  static getApproximateCrossings(start, end, stepSize=0.5) {
    const diff = end.copy().sub(start);
    const step = diff.copy().normalize().mult(stepSize);
    const numSteps = Math.floor(diff.mag() / stepSize);

    const curr = start.copy();
    // add first
    let prev = { x: Math.floor(curr.x), y: Math.floor(curr.y) };
    const pixels = [prev];

    // main loop
    for (let i = 0; i < numSteps; i += 1) {
      curr.add(step);

      if (Math.floor(curr.x) !== prev.x || Math.floor(curr.y) !== prev.y) {
        // new square!
        prev = { x: Math.floor(curr.x), y: Math.floor(curr.y) };
        pixels.push(prev);
      }
    }

    // add last (if new)
    if (Math.floor(end.x) !== prev.x || Math.floor(end.y) !== prev.y) {
      pixels.push({ x: Math.floor(end.x), y: Math.floor(end.y) });
    }

    return pixels;
  }

  // Return the pixels that are dirty given the start and end point of a new line segment, in order
  static getDirty(start, end) {
    const pixels = SmartCanvas.getApproximateCrossings(start, end, 0.2);
    return pixels;
  }

  // Given a new line segment specified by start and end {x,y} coordinates,
  // create a copy of the current lineInfo with the addition and return it
  getTestLineInfo(start, end) {
    const testLineInfo = LineInfo.copy(this.lineInfo);

    // calculate the angle of the line formed by the start and end
    const lineType = SmartCanvas.getLineType(start, end);

    // calculate all the pixels the line crosses
    const dirtyPixels = SmartCanvas.getDirty(start, end);
    const startPixel = dirtyPixels[0];
    const endPixel = dirtyPixels[dirtyPixels.length - 1];
    let otherPixels = [];
    if (dirtyPixels.length > 2) {
      otherPixels = dirtyPixels.slice(1, dirtyPixels.length - 1);
    }

    // calc lineEnds
    // for start and end, if pixel has 0 for all line channels, set lineEnd channel to 1, else 0
    const isStartEmpty = testLineInfo.getChannelsAt(startPixel).filter(v => v !== 0).length === 0;
    testLineInfo.setChannelAt(startPixel, testLineInfo.refs.lineEnd.start, isStartEmpty ? 1 : 0);

    const isEndEmpty = testLineInfo.getChannelsAt(endPixel).filter(v => v !== 0).length === 0;
    testLineInfo.setChannelAt(endPixel, testLineInfo.refs.lineEnd.start, isEndEmpty ? 1 : 0);

    // for all other dirty pixels, set lineEnd to 0, since it now has another line crossing
    otherPixels.forEach(pixel => testLineInfo.setChannelAt(pixel, testLineInfo.refs.lineEnd.start, 0));

    // calc lines
    // set channel for line type to 1 for all dirty pixels
    dirtyPixels.forEach(pixel => testLineInfo.setChannelAt(pixel, lineType, 1));

    // calc corners (L)
    // corners should check start and end pixels and all adjacent pixels in a given search radius
    // this will connect line ends that are less than N pixels from each other, but will also match
    // pixels up to N+1.
    const dirtyPixelsExpanded = getUniqueNeighbors(dirtyPixels, this.r, this.bounds);

    // flood fill all corners within N pixels of dirty pixels with 0
    dirtyPixelsExpanded.forEach(pixel => {
      testLineInfo.refs.corners.all.forEach(channelIndex => testLineInfo.floodFillChannelAt(pixel, channelIndex, 0));
    });

    // if pixels within N pixels of start or end positions were previously line ends, and the angle between the two lines in
    // the pixel is close to 90 degrees, than set to 1
    // const startPixelExpanded = getUniqueNeighbors([startPixel], this.r, this.bounds);

    // const startChannelsPrev = this.lineInfo.getChannelsAt(startPixel);
    // const startLineEndPrev = startChannelsPrev[this.lineInfo.refs.lineEnd.start];
    // if (startLineEndPrev === 1) {
    //   // get current line indices, should be 2
    //   const lineChannels = testLineInfo.getChannelsAt(startPixel).slice(testLineInfo.refs.lines.start, testLineInfo.refs.lines.end);
    //   const lineChannelIndices = [];
    //   lineChannels.forEach((channel, i) => {
    //     if (channel === 1) {
    //       lineChannelIndices.push(i);
    //     }
    //   });
    // }
    // const endChannelsPrev = this.lineInfo.getChannelsAt(endPixel);
    // const endLineEndPrev = this.lineInfo.getChannelsAt(endPixel)[testLineInfo.refs.lineEnd.start];


    // calc T-intersections (T)

    // calc Y-intersections (Y)

    // calc X-intersections (X)

    // calc multiple intersections (*)

    // calc inside/outsideness

    // calc closed/open form lines

    return testLineInfo;
  }
}

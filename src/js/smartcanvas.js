import p5 from 'p5';
import { getEmpty2DArray, deepCopy, getUniqueNeighbors, getPixelsWithinDistance, floodFill, getApproximateCrossings } from './helpers';

const LINE_ANGLES = [
  0, Math.PI / 2, // 0, 90 degrees: horiz (--), vert (|)
  Math.PI / 4, 3 * Math.PI / 4, // 45, 135 degrees: diag (/), diag (\)
  Math.PI / 8, 3 * Math.PI / 8, 5 * Math.PI / 8, 7 * Math.PI / 8, // 22.5, 67.5, 112.5, 157.5 degrees
];
const LINE_VECTORS = LINE_ANGLES.map(angle => new p5.Vector.fromAngle(angle));

const LINE_END_ANGLES = [
  0, Math.PI / 2, Math.PI, Math.PI * 1.5,
  Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4,
  Math.PI / 8, 3 * Math.PI / 8, 5 * Math.PI / 8, 7 * Math.PI / 8,
  9 * Math.PI / 8, 11 * Math.PI / 8, 13 * Math.PI / 8, 15 * Math.PI / 8,
];
const LINE_END_VECTORS = LINE_END_ANGLES.map(angle => new p5.Vector.fromAngle(angle));

export function getCornersRef() {
  const ref = {};
  let count = 0;
  LINE_END_VECTORS.forEach((v0, i) => LINE_END_VECTORS.forEach((v1, j) => {
    // ignore self and reflection
    const angleBetween = Math.abs(v0.angleBetween(v1));
    if (i !== j && Math.abs(angleBetween - Math.PI) > 0.0001) {
      const key = i < j ? (i + '_' + j) : (j + '_' + i);
      if (!(key in ref)) {
        ref[key] = count;
        count++;
      }
    }
  }));
  return ref;
}

// Should be every combination of line ends accept with themselves or reflection
// Create map with lower index as first part of key and higher as second, value is the index
const CORNERS_REF = getCornersRef();
const NUM_CORNERS = Object.keys(CORNERS_REF).length;

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
      refs.lines = { start: 0, end: LINE_ANGLES.length };
      for (let i = 0; i < LINE_ANGLES.length; i += 1) {
        this.channels.push(getEmpty2DArray(h, w, 0));
      }

      // add line end channel
      refs.lineEnds = { start: this.channels.length, end: this.channels.length + LINE_END_ANGLES.length };
      for (let i = 0; i < LINE_END_ANGLES.length; i += 1) {
        this.channels.push(getEmpty2DArray(h, w, 0));
      }
      this.channels.push(getEmpty2DArray(h, w, 0));

      // add corner channels
      refs.corners = { start: this.channels.length, end: this.channels.length + NUM_CORNERS };
      for (let i = 0; i < NUM_CORNERS; i += 1) {
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

  getChannelAt(pos, channelIndex) {
    const { x, y } = pos;
    return this.channels[channelIndex][y][x];
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
    this.cornerTolerance = Math.PI / 32;
  }

  // Return the line type that has the minimum diff in angle from the line between start and end
  static getLineType(start, end) {
    const lineBetween = end.copy().sub(start);
    let minAngle = Infinity;
    let minAngleIndex = -1;
    LINE_VECTORS.forEach((angle, i) => {
      const angleBetween = Math.min(Math.abs(angle.angleBetween(lineBetween)), Math.abs(angle.copy().mult(-1).angleBetween(lineBetween)));
      if (angleBetween < minAngle) {
        minAngle = angleBetween;
        minAngleIndex = i;
      }
    });
    return minAngleIndex;
  }

  // Return type of line end for start and end of line
  static getLineEndType(start, end) {
    const v = end.copy().sub(start);
    let minAngle = Infinity;
    let minAngleIndex = -1;
    LINE_END_VECTORS.forEach((angle, i) => {
      const angleBetween = Math.abs(angle.angleBetween(v));
      if (angleBetween < minAngle) {
        minAngle = angleBetween;
        minAngleIndex = i;
      }
    });

    return minAngleIndex;
  }

  // Return the type of corner formed by two line ends
  static getCornerType(lineEndType0, lineEndType1) {
    const key = lineEndType0 < lineEndType1 ? (lineEndType0 + '_' + lineEndType1) : (lineEndType1 + '_' + lineEndType0);
    if (!(key in CORNERS_REF)) {
      return -1;
    }
    return CORNERS_REF[key];
  }

  // Return the pixels that are dirty given the start and end point of a new line segment, in order
  static getDirty(start, end) {
    return getApproximateCrossings(start, end, 0.2);
  }

  // Return the line end positions and types nearby the position provided
  getLineEndNeighborsNear(pixel) {
    const posExpanded = getPixelsWithinDistance(pixel, this.r, this.bounds);
    const lineEndNeighbors = [];
    posExpanded.forEach(n => {
      const { start, end } = this.lineInfo.refs.lineEnds;
      const channels = this.lineInfo.getChannelsAt(n).slice(start, end);
      channels.forEach((c, i) => {
        if (c === 1) {
          lineEndNeighbors.push({ pos: n, type: i });
        }
      });
    });
    return lineEndNeighbors;
  }

  // Return the line types (int) at the position
  getLineTypesAt(pixel) {
    const channels = this.lineInfo.getChannelsAt(pixel);
    const lineTypes = [];
    channels.forEach((channel, i) => {
      if (channel === 1) {
        lineTypes.push(i);
      }
    });
    return lineTypes;
  }

  isEmptyAt(pixel) {
    const channels = this.lineInfo.getChannelsAt(pixel);
    const nonEmptyChannels = channels.filter(v => v !== 0);
    return nonEmptyChannels.length === 0;
  }

  // Given a new line segment specified by start and end {x,y} coordinates,
  // create a copy of the current lineInfo with the addition and return it
  getTestLineInfo(start, end) {
    // special case for lines that are all in one pixel?
    if (start.x === end.x && start.y === end.y) {
      console.log('Warning: line begins and ends in same pixel, could cause bad behavior');
    }

    const testLineInfo = LineInfo.copy(this.lineInfo);

    // calculate the angle of the line formed by the start and end
    const lineType = SmartCanvas.getLineType(start, end);

    // calculate all the pixels the line crosses
    const dirtyPixels = SmartCanvas.getDirty(start, end);
    const startPixel = dirtyPixels[0];
    const endPixel = dirtyPixels[dirtyPixels.length - 1];

    // get neighbors within radius this.r
    const dirtyPixelsExpanded = getUniqueNeighbors(dirtyPixels, this.r, this.bounds);
    const startExpanded = getPixelsWithinDistance(startPixel, this.r, this.bounds);
    const endExpanded = getPixelsWithinDistance(endPixel, this.r, this.bounds);

    // CLEANUP
    // remove any lineEnds, corners within radius of new line since a new line has destroyed them
    dirtyPixelsExpanded.forEach(pixel => {
      const toClear = [ ...testLineInfo.refs.lineEnds.all, ...testLineInfo.refs.corners.all ];
      toClear.forEach(channelIndex => {
        if (testLineInfo.getChannelAt(pixel, channelIndex) === 1) {
          testLineInfo.floodFillChannelAt(pixel, channelIndex, 0);
        }
      });
    });

    // LINE ENDS (i)
    // End of a line with no other object within a tolerance
    const startNeighborsWithLine = startExpanded.filter(pixel => !this.isEmptyAt(pixel));
    if (startNeighborsWithLine.length === 0) {
      // is line end, get type of line end pointing towards start
      const lineEndType = SmartCanvas.getLineEndType(end, start);
      testLineInfo.setChannelAt(startPixel, testLineInfo.refs.lineEnds.start + lineEndType, 1);
    }
    const endNeighborsWithLine = endExpanded.filter(pixel => !this.isEmptyAt(pixel));
    if (endNeighborsWithLine.length === 0) {
      // is line end, get type of line end pointing towards start
      const lineEndType = SmartCanvas.getLineEndType(start, end);
      testLineInfo.setChannelAt(endPixel, testLineInfo.refs.lineEnds.start + lineEndType, 1);
    }

    // LINES (|)
    // All dirty pixels now have this type of line
    dirtyPixels.forEach(pixel => testLineInfo.setChannelAt(pixel, lineType, 1));

    // CORNERS (L)
    // Exactly two line ends meet within a tolerance
    const startLineEndNeighbors = this.getLineEndNeighborsNear(startPixel);
    if (startLineEndNeighbors.length === 1) {
      // start is corner!
      const prevStartLineEndType = startLineEndNeighbors[0].type;
      const startLineEndType = SmartCanvas.getLineEndType(end, start);
      const cornerType = SmartCanvas.getCornerType(prevStartLineEndType, startLineEndType);
      testLineInfo.setChannelAt(startPixel, testLineInfo.refs.corners.start + cornerType, 1);
    }
    const endLineEndNeighbors = this.getLineEndNeighborsNear(endPixel);
    if (endLineEndNeighbors.length === 1) {
      // end is corner!
      const prevEndLineEndType = endLineEndNeighbors[0].type;
      const endLineEndType = SmartCanvas.getLineEndType(start, end);
      const cornerType = SmartCanvas.getCornerType(prevEndLineEndType, endLineEndType);
      if (cornerType !== -1) {
        testLineInfo.setChannelAt(endPixel, testLineInfo.refs.corners.start + cornerType, 1);
      }
    }

    // calc T-intersections (T)

    // calc Y-intersections (Y)

    // calc X-intersections (X)

    // calc multiple intersections (*)

    // calc inside/outsideness

    // calc closed/open form lines

    return testLineInfo;
  }
}

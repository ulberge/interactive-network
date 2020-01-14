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
  // For every line end, there should be two corners that map to the three line end angles close to 90 degrees
  const ref = {};
  let count = 0;
  LINE_END_VECTORS.forEach((v0, i) => {
    LINE_END_VECTORS.forEach((v1, j) => {
      // turn left
      const angleBetween = Math.abs(v0.angleBetween(v1));
      const rightRot = Math.PI / 2;
      const leftRot = -Math.PI / 2;
      const margin = (Math.PI / 8) + 0.0001;
      const key = i < j ? (i + '_' + j) : (j + '_' + i);

      const isRightTurn = Math.abs(angleBetween - rightRot) < margin;
      const isLeftTurn = Math.abs(angleBetween - leftRot) < margin;
      if (isRightTurn || isLeftTurn) {
        // add unique combinations
        if (!(key in ref)) {
          ref[key] = count;
          count++;
        }
      }
    });
  });
  return ref;
}

// Should be every combination of line ends accept with themselves or reflection
// Create map with lower index as first part of key and higher as second, value is the index
const CORNERS_REF = getCornersRef();
const NUM_CORNERS = Object.keys(CORNERS_REF).length;
// Return the type of corner formed by two line ends
function getCornerType(lineEndType0, lineEndType1) {
  const key = lineEndType0 < lineEndType1 ? (lineEndType0 + '_' + lineEndType1) : (lineEndType1 + '_' + lineEndType0);
  if (!(key in CORNERS_REF)) {
    return null;
  }
  return CORNERS_REF[key];
}

// Return the line type that has the minimum diff in angle from the line between start and end
function getLineType(start, end) {
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
function getLineEndType(start, end) {
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
      this.w = w;
      this.h = h;
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
    copy.channels = lineInfo.channels.map(channel => deepCopy(channel));
    // map storing locations of channels by name
    copy.refs = lineInfo.refs;
    copy.w = lineInfo.w;
    copy.h = lineInfo.h;
    return copy;
  }

  getChannelsAt(pos) {
    const { x, y } = pos;
    return this.channels.map(channel => channel[y][x]);
  }

  isEmptyAt(pos) {
    const { x, y } = pos;
    // The number of channels not equal to 0 is 0
    return this.channels.filter(channel => channel[y][x] !== 0).length === 0;
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

  getLineChannels(channels) {
    return this.refs.lines.all.filter(i => channels.includes(i - this.refs.lines.start)).map(i => this.channels[i]);
  }

  getLineEndChannels(channels) {
    return this.refs.lineEnds.all.filter(i => channels.includes(i - this.refs.lineEnds.start)).map(i => this.channels[i]);
  }

  getCornerChannels(channels) {
    return this.refs.corners.all.filter(i => channels.includes(i - this.refs.corners.start)).map(i => this.channels[i]);
  }

  getAllLines() {
    const allLines = getEmpty2DArray(this.h, this.w);
    this.refs.lines.all.forEach(i => this.channels[i].forEach((row, y) => row.forEach((v, x) => allLines[y][x] += v)));
    return allLines;
  }

  getAllLineIds() {
    const lineIds = getEmpty2DArray(this.h, this.w);
    this.refs.lines.all.forEach(i => this.channels[i].forEach((row, y) => row.forEach((v, x) => {
      if (v !== 0) {
        lineIds[y][x] = i - this.refs.lines.start;
      }
    })));
    return lineIds;
  }

  getAllLineEnds() {
    const allEnds = getEmpty2DArray(this.h, this.w);
    this.refs.lineEnds.all.forEach(i => this.channels[i].forEach((row, y) => row.forEach((v, x) => allEnds[y][x] += v)));
    return allEnds;
  }

  getAllLineEndIds() {
    const endIds = getEmpty2DArray(this.h, this.w);
    this.refs.lineEnds.all.forEach(i => this.channels[i].forEach((row, y) => row.forEach((v, x) => {
      if (v !== 0) {
        endIds[y][x] = i - this.refs.lineEnds.start;
      }
    })));
    return endIds;
  }

  getAllCorners() {
    const allCorners = getEmpty2DArray(this.h, this.w);
    this.refs.corners.all.forEach(i => this.channels[i].forEach((row, y) => row.forEach((v, x) => allCorners[y][x] += v)));
    return allCorners;
  }

  getAllCornerIds() {
    const allCorners = getEmpty2DArray(this.h, this.w);
    this.refs.corners.all.forEach(i => this.channels[i].forEach((row, y) => row.forEach((v, x) => {
      if (v !== 0) {
        allCorners[y][x] = i - this.refs.corners.start;
      }
    })));
    return allCorners;
  }

  print() {
    // console.table(this.getAllLines());
    console.table(this.getAllLineIds());
    console.table(this.getAllLineEnds());
    console.table(this.getAllLineEndIds());
    // console.table(this.getAllCorners());
    console.table(this.getAllCornerIds());
  }
}


export default class SmartCanvas {
  constructor(w, h) {
    this.lineInfo = new LineInfo(w, h);
    // keep a copy between lines
    this.setupStroke();
    this.bounds = [0, 0, w, h];
    this.r = 1; // must always be 1
    this.cornerTolerance = Math.PI / 32;
  }

  setupStroke() {
    this.oldLineInfo = LineInfo.copy(this.lineInfo);
    this.stroke = {
      start: {
        pixel: null,
        lineEndType: null,
        cornerType: null
      },
      prevSegment: {
        start: {
          pixel: null,
          lineEndType: null,
          cornerType: null
        },
        end: {
          pixel: null,
          lineEndType: null,
          cornerType: null
        }
      }
    };
  }

  // Return the pixels that are dirty given the start and end point of a new line segment, in order
  static getDirty(start, end) {
    return getApproximateCrossings(start, end, 0.2).map(p => new p5.Vector(p.x, p.y));
  }

  static pixelListContains(pixels, pixel) {
    for (let p of pixels) {
      if (p.x === pixel.x && p.y === pixel.y) {
        return true;
      }
    }
    return false;
  }

  static isEmpty(lineInfo, pixelExpanded) {
    // assuming p is a point at the end of a line segment
    return pixelExpanded.filter(p => !lineInfo.isEmptyAt(p)).length === 0;
  }

  static isNextTo(p0, p1) {
    if (!p0 || !p1) {
      return false;
    }

    // Is p1 within one step (including diagonals) of p0
    if ((Math.abs(p0.x - p1.x) <= 1) && (Math.abs(p0.y - p1.y) <= 1)) {
      return true;
    }
    return false;
  }

  static getCornerType(lineInfo, pixelExpanded, lineEndType) {
    // assuming p is a point at the end of a line segment
    const lineEndNeighbors = [];
    // console.log('Check corners', p);
    for (let neighbor of pixelExpanded) {
      const lineEndChannels = lineInfo.getChannelsAt(neighbor).slice(lineInfo.refs.lineEnds.start, lineInfo.refs.lineEnds.end);
      // console.log(this.lineInfo.getChannelsAt(neighbor).slice(0, this.lineInfo.refs.lineEnds.end));
      for (let i = 0; i < lineEndChannels.length; i += 1) {
        if (lineEndChannels[i] === 1) {
          lineEndNeighbors.push({ pos: neighbor, type: i });
        }
      }
    }

    if (lineEndNeighbors.length === 1) {
      const cornerType = getCornerType(lineEndNeighbors[0].type, lineEndType);
      return cornerType;
    }

    return null;
  }

  // Add the array of arrays [x,y] as line segments with a min length
  addStroke(stroke) {
    if (stroke.length < 2) {
      return;
    }

    this.setupStroke();
    const toVector = m => new p5.Vector(m[0], m[1]);

    if (stroke.length === 2) {
      const start = toVector(stroke[0]);
      const end = toVector(stroke[1]);
      this.lineInfo = this.testSegment(start, end, true);
    } else {
      let start = toVector(stroke[0]);
      let end = null;
      // convert to segments of a mininum length
      const minDist = 0.5;
      const segments = [];
      for (let i = 1; i < stroke.length; i += 1) {
        const prevEnd = end;
        end = toVector(stroke[i]);

        // if major change in direction, dont group
        if (prevEnd !== null) {
          const prevSeg = prevEnd.copy().sub(start);
          const currSeg = end.copy().sub(start);
          if (prevSeg.mag() > 0.2 && Math.abs(prevSeg.angleBetween(currSeg)) > (Math.PI / 8)) {
            segments.push([start, prevEnd]);
            start = prevEnd;
          }
        }

        if (start.dist(end) >= minDist) {
          segments.push([start, end]);
          start = end;
          end = null;
        }
      }
      // add last remaining, if any
      if (end && start.dist(end) > 0) {
        segments.push([start, end]);
      }

      for (let i = 0; i < segments.length; i += 1) {
        const [ start, end ] = segments[i];
        console.log(start, end);
        this.lineInfo = this.testSegment(start, end, i === 0);
      }
    }
  }

  // get the line info that would result with the following segment being added to current stroke
  testSegment(start, end, isFirstSegment=false) {
    // special case for lines that are all in one pixel?
    if (start.dist(end) === 0) {
      console.log('Warning: line segment is of length 0');
    }

    const testLineInfo = LineInfo.copy(this.lineInfo);

    // calculate all the pixels the line crosses
    const dirtyPixels = SmartCanvas.getDirty(start, end);
    const startPixel = dirtyPixels[0];
    const endPixel = dirtyPixels[dirtyPixels.length - 1];

    // get neighbors within radius this.r
    const startPixelExpanded = getPixelsWithinDistance(startPixel, this.r, this.bounds);
    const endPixelExpanded = getPixelsWithinDistance(endPixel, this.r, this.bounds);
    const dirtyPixelsExpanded = getUniqueNeighbors(dirtyPixels, this.r, this.bounds);

    // Line type is based on the angle of the line formed by the start and end
    const lineType = getLineType(start, end);
    // Line end types are based on angle and direction
    const startLineEndType = getLineEndType(end, start);
    const endLineEndType = getLineEndType(start, end);
    // Corners are based on ~90 degree changes of angle between exactly two lines
    const startCornerType = SmartCanvas.getCornerType(this.oldLineInfo, startPixelExpanded, startLineEndType);
    const endCornerType = SmartCanvas.getCornerType(this.oldLineInfo, endPixelExpanded, endLineEndType);

    if (isFirstSegment) {
      this.stroke.start = {
        pixel: startPixel,
        lineEndType: startLineEndType,
        cornerType: startCornerType
      };
    }

    /***************************************************/
    // LINES (|)
    // := any pixel in ray cast between start and end with accuracy of ray step size
    /***************************************************/
    // all pixels crossed by line get that line
    for (let pixel of dirtyPixels) {
      testLineInfo.setChannelAt(pixel, lineType, 1)
    }

    /***************************************************/
    // LINE ENDS (i)
    // := beginning and end of a stroke (continuous series of line segments) that falls in empty area
    //
    // 0 0 0      0 0 X         0 X 0
    // 0 E X  or  0 E X  , not  0 E 0
    // 0 0 0      0 0 0         X 0 E
    //
    /***************************************************/
    // clear line ends from previous strokes near this segment
    for (let channelIndex of testLineInfo.refs.lineEnds.all) {
      for (let pixel of dirtyPixelsExpanded) {
        if (this.oldLineInfo.getChannelAt(pixel, channelIndex) === 1) {
          testLineInfo.setChannelAt(pixel, channelIndex, 0);
        }
      }
    }

    if (isFirstSegment) {
      // on first segment of stroke, add a line end if area was empty
      if (SmartCanvas.isEmpty(this.oldLineInfo, startPixelExpanded)) {
        testLineInfo.setChannelAt(startPixel, testLineInfo.refs.lineEnds.start + startLineEndType, 1);
      }
    } else {
      // on next segments, always remove line end placed at end of previous segment
      if (this.stroke.prevSegment.end.lineEndType !== null) {
        testLineInfo.setChannelAt(startPixel, testLineInfo.refs.lineEnds.start + this.stroke.prevSegment.end.lineEndType, 0);
      }
    }

    // add a line end at end of segment if current area is empty
    if (SmartCanvas.isEmpty(this.oldLineInfo, endPixelExpanded)) {
      testLineInfo.setChannelAt(endPixel, testLineInfo.refs.lineEnds.start + endLineEndType, 1);
    }

    // special case: if stroke left start pixel and returned, remove line end there
    if (!isFirstSegment && !SmartCanvas.isNextTo(this.stroke.start.pixel, this.stroke.prevSegment.end.pixel)) {
      // if the dirty pixels touch
      for (let pixel of dirtyPixelsExpanded) {
        if (pixel.equals(this.stroke.start.pixel)) {
          testLineInfo.setChannelAt(pixel, testLineInfo.refs.lineEnds.start + this.stroke.start.lineEndType, 0);
        }
      }
    }

    // special case: if segment end is near start
    for (let pixel of startPixelExpanded) {
      if (pixel.equals(this.stroke.start.pixel)) {
        testLineInfo.setChannelAt(pixel, testLineInfo.refs.lineEnds.start + endLineEndType, 0);
      }
    }

    // special case: if segment end is near old portions of this stroke
    // TODO

    /***************************************************/
    // CORNERS (L)
    // := intersection formed by two line ends that are not ~180 or ~0 degrees
    // := or, an abrupt shift in line direction within a stroke (not a curve...)
    //
    // 0 0 0      0 0 0         0 A 0
    // A B B  or  0 X B  , not  0 X 0
    // A 0 0      0 A 0         0 A 0
    //
    /***************************************************/
    // clear corners from previous strokes near this segment
    for (let channelIndex of testLineInfo.refs.corners.all) {
      for (let pixel of dirtyPixelsExpanded) {
        if (this.oldLineInfo.getChannelAt(pixel, channelIndex) === 1) {
          testLineInfo.setChannelAt(pixel, channelIndex, 0);
        }
      }
    }

    if (isFirstSegment) {
      // potentially add corner at start
      if (startCornerType !== null) {
        testLineInfo.setChannelAt(startPixel, testLineInfo.refs.corners.start + startCornerType, 1);
      }
    } else {
      // remove corner formed by last segment in this stroke since we continued
      if (this.stroke.prevSegment.end.cornerType !== null) {
        // previous end of is now the start
        testLineInfo.setChannelAt(startPixel, testLineInfo.refs.corners.start + this.stroke.prevSegment.end.cornerType, 0);
      }
    }

    if (endCornerType !== null) {
      testLineInfo.setChannelAt(endPixel, testLineInfo.refs.corners.start + endCornerType, 1);
    }

    // detect abrupt shift in line if nothing else is around
    const cornerWithinStrokeType = getCornerType(this.stroke.prevSegment.end.lineEndType, startLineEndType);
    if (cornerWithinStrokeType !== null) {
      testLineInfo.setChannelAt(startPixel, testLineInfo.refs.corners.start + cornerWithinStrokeType, 1);
    }

    // special case: if segment end is near original start, and stroke left start pixel and returned
    if (!isFirstSegment && !SmartCanvas.isNextTo(this.stroke.start.pixel, this.stroke.prevSegment.end.pixel)) {
      if (this.stroke.start.lineEndType !== null && endLineEndType !== null) {
        for (let pixel of endPixelExpanded) {
          if (pixel.equals(this.stroke.start.pixel)) {
            const cornerType = getCornerType(this.stroke.start.lineEndType, endLineEndType);
            if (cornerType !== null) {
              testLineInfo.setChannelAt(pixel, testLineInfo.refs.corners.start + cornerType, 1);
            }
          }
        }
      }
    }


    // calc T-intersections (T)

    // calc Y-intersections (Y)

    // calc X-intersections (X)

    // calc multiple intersections (*)

    // calc inside/outsideness

    // calc closed/open form lines

    // Record data
    this.stroke.prevSegment = {
      start: {
        pixel: startPixel,
        lineEndType: startLineEndType,
        cornerType: startCornerType
      },
      end: {
        pixel: endPixel,
        lineEndType: endLineEndType,
        cornerType: endCornerType
      }
    };

    return testLineInfo;
  }

}

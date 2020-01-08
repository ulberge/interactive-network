import SmartCanvas, { getCornersRef } from './smartcanvas';
import { getEmpty2DArray } from './helpers';
import p5 from 'p5';

const getAllLines = lineInfo => {
  const allLines = getEmpty2DArray(8, 8);
  lineInfo.refs.lines.all.forEach(i => lineInfo.channels[i].forEach((row, y) => row.forEach((v, x) => allLines[y][x] += v)));
  return allLines;
}

const getAllLineEnds = lineInfo => {
  const allEnds = getEmpty2DArray(8, 8);
  lineInfo.refs.lineEnds.all.forEach(i => lineInfo.channels[i].forEach((row, y) => row.forEach((v, x) => allEnds[y][x] += v)));
  return allEnds;
}

const getAllLineEndIds = lineInfo => {
  const endIds = getEmpty2DArray(8, 8);
  lineInfo.refs.lineEnds.all.forEach(i => lineInfo.channels[i].forEach((row, y) => row.forEach((v, x) => {
    if (v !== 0) {
      endIds[y][x] = i - lineInfo.refs.lineEnds.start;
    }
  })));
  return endIds;
}

const getAllCorners = lineInfo => {
  const allCorners = getEmpty2DArray(8, 8);
  lineInfo.refs.corners.all.forEach(i => lineInfo.channels[i].forEach((row, y) => row.forEach((v, x) => allCorners[y][x] += v)));
  return allCorners;
}

const getAllCornerIds = lineInfo => {
  const allCorners = getEmpty2DArray(8, 8);
  lineInfo.refs.corners.all.forEach(i => lineInfo.channels[i].forEach((row, y) => row.forEach((v, x) => {
    if (v !== 0) {
      allCorners[y][x] = i - lineInfo.refs.corners.start;
    }
  })));
  return allCorners;
}

const debugLineInfo = lineInfo => {
  console.table(getAllLines(lineInfo));
  console.table(getAllLineEnds(lineInfo));
  console.table(getAllLineEndIds(lineInfo));
  console.table(getAllCorners(lineInfo));
  console.table(getAllCornerIds(lineInfo));
}

it('correctly gets line type between two points: getLineType', () => {
  const p0 = new p5.Vector(1, 1);
  const p1 = new p5.Vector(1, 2);
  const lineType = SmartCanvas.getLineType(p0, p1);
  expect(lineType).toBe(1);
});

it('correctly gets line type between two points: getLineType', () => {
  const p0 = new p5.Vector(1, 1);
  const p1 = new p5.Vector(2, 1);
  const lineType = SmartCanvas.getLineType(p0, p1);
  expect(lineType).toBe(0);
});

it('correctly gets line type between two points: getLineType', () => {
  const p0 = new p5.Vector(1, 1);
  const p1 = new p5.Vector(-2, 1);
  const lineType = SmartCanvas.getLineType(p0, p1);
  expect(lineType).toBe(0);
});

it('correctly gets line type between two points: getLineType', () => {
  const p0 = new p5.Vector(1, 1);
  const p1 = new p5.Vector(-2, -2);
  const lineType = SmartCanvas.getLineType(p0, p1);
  expect(lineType).toBe(2);
});

it('correctly gets line type between two points: getLineType', () => {
  const p0 = new p5.Vector(1, 1);
  const p1 = new p5.Vector(2, 2);
  const lineType = SmartCanvas.getLineType(p0, p1);
  expect(lineType).toBe(2);
});

it('checks smart canvas is created without crashing and has a line info with channels set to 0: SmartCanvas', () => {
  const smartCanvas = new SmartCanvas(8, 8);
  const lineInfo = smartCanvas.lineInfo;
  expect(lineInfo.channels[0][0][0]).toBe(0);
  expect(lineInfo.channels[0][7][7]).toBe(0);
});

it('updates line channels correctly with vertical line of length of around 1 at non-corner coordinates: testSegment', () => {
  const smartCanvas = new SmartCanvas(8, 8);
  const start = new p5.Vector(0.5, 0.5);
  const end = new p5.Vector(0.5, 1.9);
  const lineInfo = smartCanvas.testSegment(start, end, true);
  expect(lineInfo.channels[0][0][0]).toBe(0);
  expect(lineInfo.channels[0][7][7]).toBe(0);
  expect(lineInfo.channels[1][0][0]).toBe(1);
  expect(lineInfo.channels[1][1][0]).toBe(1);
  expect(lineInfo.channels[1][0][1]).toBe(0);
  expect(lineInfo.channels[1][1][1]).toBe(0);
  expect(lineInfo.channels[1][2][1]).toBe(0);
});

it('updates line channels correctly with horizontal line of length of around 1 at non-corner coordinates: testSegment', () => {
  const smartCanvas = new SmartCanvas(8, 8);
  const start = new p5.Vector(2.5, 4.5);
  const end = new p5.Vector(3.6, 4.5);
  const lineInfo = smartCanvas.testSegment(start, end, true);
  expect(lineInfo.channels[0][4][2]).toBe(1);
  expect(lineInfo.channels[0][4][3]).toBe(1);
  expect(lineInfo.channels[0][4][1]).toBe(0);
  expect(lineInfo.channels[0][4][5]).toBe(0);
  expect(lineInfo.channels[0][3][2]).toBe(0);
  expect(lineInfo.channels[0][3][3]).toBe(0);
  expect(lineInfo.channels[0][5][2]).toBe(0);
  expect(lineInfo.channels[0][5][3]).toBe(0);
});

it('updates line channels correctly with diagonal line of length of around 1 at non-corner coordinates: testSegment', () => {
  const smartCanvas = new SmartCanvas(8, 8);
  const start = new p5.Vector(5.4, 5.5);
  const end = new p5.Vector(6.3, 6.2);
  const lineInfo = smartCanvas.testSegment(start, end, true);
  expect(lineInfo.channels[2][5][5]).toBe(1);
  expect(lineInfo.channels[2][5][6]).toBe(1);
  expect(lineInfo.channels[2][6][6]).toBe(1);
  expect(lineInfo.channels[2][6][5]).toBe(0);
});

it('updates line end channels correctly with horizontal line: testSegment', () => {
  const smartCanvas = new SmartCanvas(8, 8);
  const start = new p5.Vector(5.4, 5.5);
  const end = new p5.Vector(6.5, 5.5);
  const lineInfo = smartCanvas.testSegment(start, end, true);
  const channel0 = lineInfo.channels[lineInfo.refs.lineEnds.start];
  const channel1 = lineInfo.channels[lineInfo.refs.lineEnds.start + 2];
  expect(channel0[5][6]).toBe(1);
  expect(channel0[5][5]).toBe(0);
  expect(channel0[5][7]).toBe(0);
  expect(channel1[5][5]).toBe(1);
  expect(channel1[5][6]).toBe(0);
});

it('updates line end channels correctly with diagonal line of length of around 1 at non-corner coordinates: testSegment', () => {
  const smartCanvas = new SmartCanvas(8, 8);
  const start = new p5.Vector(5.4, 5.5);
  const end = new p5.Vector(6.3, 6.2);
  const lineInfo = smartCanvas.testSegment(start, end, true);
  // lineInfo.refs.lineEnds.all.forEach(i => {
  //   console.log(i - lineInfo.refs.lineEnds.start);
  //   console.table(lineInfo.channels[i])
  // });
  const channel0 = lineInfo.channels[lineInfo.refs.lineEnds.start + 4];
  const channel1 = lineInfo.channels[lineInfo.refs.lineEnds.start + 6];
  expect(channel0[6][6]).toBe(1);
  expect(channel0[5][5]).toBe(0);
  expect(channel0[5][7]).toBe(0);
  expect(channel1[5][5]).toBe(1);
  expect(channel1[6][6]).toBe(0);
});

it('updates line end channels correctly with diagonal line of length of more than 2 at non-corner coordinates: testSegment', () => {
  const smartCanvas = new SmartCanvas(8, 8);
  const start = new p5.Vector(4.4, 4.5);
  const end = new p5.Vector(6.3, 6.2);
  const lineInfo = smartCanvas.testSegment(start, end, true);
  // lineInfo.refs.lineEnds.all.forEach(i => {
  //   console.log(i - lineInfo.refs.lineEnds.start);
  //   console.table(lineInfo.channels[i])
  // });
  const channel0 = lineInfo.channels[lineInfo.refs.lineEnds.start + 4];
  const channel1 = lineInfo.channels[lineInfo.refs.lineEnds.start + 6];
  expect(channel0[6][6]).toBe(1);
  expect(channel0[5][5]).toBe(0);
  expect(channel0[5][7]).toBe(0);
  expect(channel1[4][4]).toBe(1);
  expect(channel1[6][6]).toBe(0);
});

it('leaves all line ends with criss cross with enough distance : testSegment', () => {
  const smartCanvas = new SmartCanvas(8, 8);

  // make first update (diag line)
  const start0 = new p5.Vector(3.4, 3.4);
  const end0 = new p5.Vector(7.3, 7.3);
  const lineInfo0 = smartCanvas.testSegment(start0, end0, true);

  const expectedAllLines0 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1],
  ];
  expect(getAllLines(lineInfo0)).toEqual(expectedAllLines0);

  const expectedAllLineEnds0 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1],
  ];
  expect(getAllLineEnds(lineInfo0)).toEqual(expectedAllLineEnds0);

  const expectedAllLineEndIds0 = [
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, 6, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, 4],
  ];
  expect(getAllLineEndIds(lineInfo0)).toEqual(expectedAllLineEndIds0);

  // update the lineInfo with this new lineInfo
  smartCanvas.lineInfo = lineInfo0;

  // make second update (diag line)
  const start1 = new p5.Vector(3.2, 7.2);
  const end1 = new p5.Vector(7.2, 3.2);
  smartCanvas.setupStroke();
  const lineInfo1 = smartCanvas.testSegment(start1, end1, true);

  // debugLineInfo(lineInfo1);

  const expectedAllLines1 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 1, 1],
    [0, 0, 0, 0, 1, 1, 1, 0],
    [0, 0, 0, 0, 1, 2, 0, 0],
    [0, 0, 0, 1, 1, 0, 1, 0],
    [0, 0, 0, 1, 0, 0, 0, 1],
  ];
  expect(getAllLines(lineInfo1)).toEqual(expectedAllLines1);

  const expectedAllLineEnds1 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 1],
  ];
  expect(getAllLineEnds(lineInfo1)).toEqual(expectedAllLineEnds1);

  const expectedAllLineEndIds1 = [
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, 6, null, null, null, 7],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, 5, null, null, null, 4],
  ];
  expect(getAllLineEndIds(lineInfo1)).toEqual(expectedAllLineEndIds1);
});

it('does not add line end near existing line: testSegment', () => {
  const smartCanvas = new SmartCanvas(8, 8);

  // make first update (diag line)
  const start0 = new p5.Vector(3.4, 3.4);
  const end0 = new p5.Vector(7.3, 7.3);
  const lineInfo0 = smartCanvas.testSegment(start0, end0, true);
  // update the lineInfo with this new lineInfo
  smartCanvas.lineInfo = lineInfo0;

  // debugLineInfo(lineInfo0);

  // make second update (diag line)
  const start1 = new p5.Vector(4.2, 6.2);
  const end1 = new p5.Vector(7.2, 3.2);
  smartCanvas.setupStroke();
  const lineInfo1 = smartCanvas.testSegment(start1, end1, true);

  // debugLineInfo(lineInfo1);

  const expectedAllLines1 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 1, 1],
    [0, 0, 0, 0, 1, 1, 1, 0],
    [0, 0, 0, 0, 1, 2, 0, 0],
    [0, 0, 0, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1],
  ];
  expect(getAllLines(lineInfo1)).toEqual(expectedAllLines1);

  const expectedAllLineEnds1 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1],
  ];
  expect(getAllLineEnds(lineInfo1)).toEqual(expectedAllLineEnds1);

  const expectedAllLineEndIds1 = [
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, 6, null, null, null, 7],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, 4],
  ];
  expect(getAllLineEndIds(lineInfo1)).toEqual(expectedAllLineEndIds1);
});

it('removes end point when line passes nearby: testSegment', () => {
  const smartCanvas = new SmartCanvas(8, 8);

  // make first update (diag line)
  const start0 = new p5.Vector(3.4, 3.4);
  const end0 = new p5.Vector(6.3, 6.3);
  const lineInfo0 = smartCanvas.testSegment(start0, end0, true);
  // update the lineInfo with this new lineInfo
  smartCanvas.lineInfo = lineInfo0;

  // make second update (diag line)
  const start1 = new p5.Vector(2.2, 1.2);
  const end1 = new p5.Vector(2.2, 5.2);
  smartCanvas.setupStroke();
  const lineInfo1 = smartCanvas.testSegment(start1, end1, true);

  // debugLineInfo(lineInfwo1);

  const expectedAllLines1 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 1, 0, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  expect(getAllLines(lineInfo1)).toEqual(expectedAllLines1);

  const expectedAllLineEnds1 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  expect(getAllLineEnds(lineInfo1)).toEqual(expectedAllLineEnds1);

  const expectedAllLineEndIds1 = [
    [null, null, null, null, null, null, null, null],
    [null, null, 3, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, 1, null, null, null, null, null],
    [null, null, null, null, null, null, 4, null],
    [null, null, null, null, null, null, null, null],
  ];
  expect(getAllLineEndIds(lineInfo1)).toEqual(expectedAllLineEndIds1);
});

it('cancels end point and old end point when new end point on top of existing end point: testSegment', () => {
  const smartCanvas = new SmartCanvas(8, 8);

  // make first update (diag line)
  const start0 = new p5.Vector(3.4, 3.4);
  const end0 = new p5.Vector(6.3, 6.3);
  const lineInfo0 = smartCanvas.testSegment(start0, end0, true);
  // update the lineInfo with this new lineInfo
  smartCanvas.lineInfo = lineInfo0;

  // make second update (diag line)
  const start1 = new p5.Vector(1.2, 3.2);
  const end1 = new p5.Vector(3.2, 3.2);
  smartCanvas.setupStroke();
  const lineInfo1 = smartCanvas.testSegment(start1, end1, true);

  debugLineInfo(lineInfo1);

  const expectedAllLines1 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 2, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  expect(getAllLines(lineInfo1)).toEqual(expectedAllLines1);

  const expectedAllLineEnds1 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  expect(getAllLineEnds(lineInfo1)).toEqual(expectedAllLineEnds1);

  const expectedAllLineEndIds1 = [
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, 2, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, 4, null],
    [null, null, null, null, null, null, null, null],
  ];
  expect(getAllLineEndIds(lineInfo1)).toEqual(expectedAllLineEndIds1);
});

it('cancels end point and old end point when new end point near existing end point: testSegment', () => {
  const smartCanvas = new SmartCanvas(8, 8);

  // make first update (diag line)
  const start0 = new p5.Vector(3.4, 3.4);
  const end0 = new p5.Vector(6.3, 6.3);
  const lineInfo0 = smartCanvas.testSegment(start0, end0, true);
  // update the lineInfo with this new lineInfo
  smartCanvas.lineInfo = lineInfo0;

  // make second update (diag line)
  const start1 = new p5.Vector(1.2, 2.2);
  const end1 = new p5.Vector(2.2, 2.2);
  smartCanvas.setupStroke();
  const lineInfo1 = smartCanvas.testSegment(start1, end1, true);

  // debugLineInfo(lineInfo1);

  const expectedAllLines1 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  expect(getAllLines(lineInfo1)).toEqual(expectedAllLines1);

  const expectedAllLineEnds1 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  expect(getAllLineEnds(lineInfo1)).toEqual(expectedAllLineEnds1);

  const expectedAllLineEndIds1 = [
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, 2, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, 4, null],
    [null, null, null, null, null, null, null, null],
  ];
  expect(getAllLineEndIds(lineInfo1)).toEqual(expectedAllLineEndIds1);
});

it('updates line and line end channels correctly with multiple very short lines: testSegment', () => {
  const smartCanvas = new SmartCanvas(8, 8);

  // make first update (diag line)
  const start0 = new p5.Vector(3.4, 3.4);
  const end0 = new p5.Vector(3.7, 3.8);
  const lineInfo0 = smartCanvas.testSegment(start0, end0, true);
  // update the lineInfo with this new lineInfo
  smartCanvas.lineInfo = lineInfo0;

  // make second update (diag line)
  const start1 = new p5.Vector(3.7, 3.2);
  const end1 = new p5.Vector(3.2, 3.7);
  smartCanvas.setupStroke();
  const lineInfo1 = smartCanvas.testSegment(start1, end1, true);

  // debugLineInfo(lineInfo1);

  const expectedAllLines1 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  expect(getAllLines(lineInfo1)).toEqual(expectedAllLines1);

  const expectedAllLineEnds1 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  expect(getAllLineEnds(lineInfo1)).toEqual(expectedAllLineEnds1);

  const expectedAllLineEndIds1 = [
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
  ];
  expect(getAllLineEndIds(lineInfo1)).toEqual(expectedAllLineEndIds1);
});

it('adds a corner for two line ends on top of each other: testSegment', () => {
  const smartCanvas = new SmartCanvas(8, 8);

  // make first update (diag line)
  const start0 = new p5.Vector(3.4, 3.4);
  const end0 = new p5.Vector(6.3, 6.3);
  const lineInfo0 = smartCanvas.testSegment(start0, end0, true);
  // update the lineInfo with this new lineInfo
  smartCanvas.lineInfo = lineInfo0;

  // make second update (diag line)
  const start1 = new p5.Vector(1.2, 3.2);
  const end1 = new p5.Vector(3.2, 3.2);
  smartCanvas.setupStroke();
  const lineInfo1 = smartCanvas.testSegment(start1, end1, true);

  // debugLineInfo(lineInfo1);

  const expectedAllCorners1 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  expect(getAllCorners(lineInfo1)).toEqual(expectedAllCorners1);

  const expectedAllCornerIds1 = [
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, 4, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
  ];
  expect(getAllCornerIds(lineInfo1)).toEqual(expectedAllCornerIds1);
});

it('adds no corner for continuing line: testSegment', () => {
  const smartCanvas = new SmartCanvas(8, 8);

  // make first update (diag line)
  const start0 = new p5.Vector(3.4, 3.4);
  const end0 = new p5.Vector(4.3, 4.3);
  const lineInfo0 = smartCanvas.testSegment(start0, end0, true);
  // update the lineInfo with this new lineInfo
  smartCanvas.lineInfo = lineInfo0;

  // make second update (diag line)
  const start1 = new p5.Vector(4.3, 4.3);
  const end1 = new p5.Vector(5.2, 5.2);
  smartCanvas.setupStroke();
  const lineInfo1 = smartCanvas.testSegment(start1, end1, true);

  // debugLineInfo(lineInfo1);

  const expectedAllCorners1 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  expect(getAllCorners(lineInfo1)).toEqual(expectedAllCorners1);

  const expectedAllCornerIds1 = [
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
  ];
  expect(getAllCornerIds(lineInfo1)).toEqual(expectedAllCornerIds1);
});

it('adds no corner for line joining almost straight on: testSegment', () => {
  const smartCanvas = new SmartCanvas(8, 8);

  // make first update (diag line)
  const start0 = new p5.Vector(3.4, 3.4);
  const end0 = new p5.Vector(4.3, 4.3);
  const lineInfo0 = smartCanvas.testSegment(start0, end0, true);
  // update the lineInfo with this new lineInfo
  smartCanvas.lineInfo = lineInfo0;

  // make second update (diag line)
  const start1 = new p5.Vector(5.2, 5.25);
  const end1 = new p5.Vector(4.3, 4.3);
  smartCanvas.setupStroke();
  const lineInfo1 = smartCanvas.testSegment(start1, end1, true);

  // debugLineInfo(lineInfo1);

  const expectedAllCorners1 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  expect(getAllCorners(lineInfo1)).toEqual(expectedAllCorners1);

  const expectedAllCornerIds1 = [
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
  ];
  expect(getAllCornerIds(lineInfo1)).toEqual(expectedAllCornerIds1);
});

it('correctly gets corners reference map: getCornersRef', () => {
  const cornersRef = getCornersRef();
  expect(Object.keys(cornersRef).length).toBe(112);
});

it('correctly gets corners reference map: pixelListContains', () => {
  const pixels = [{x: 1, y: 1}, {x: 2, y: 3}];
  const pixel = {x: 2, y: 3};
  const pixel2 = {x: 2, y: 4};
  const result = SmartCanvas.pixelListContains(pixels, pixel);
  expect(result).toBe(true);
  const result2 = SmartCanvas.pixelListContains(pixels, pixel2);
  expect(result2).toBe(false);
});

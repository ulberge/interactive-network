import { SmartCanvas } from './smartcanvas';
import p5 from 'p5';

// it('correctly gets line type between two points: getLineType', () => {
//   const p0 = new p5.Vector(1, 1);
//   const p1 = new p5.Vector(1, 2);
//   const lineType = SmartCanvas.getLineType(p0, p1);
//   expect(lineType).toBe(1);
// });

// it('correctly gets line type between two points: getLineType', () => {
//   const p0 = new p5.Vector(1, 1);
//   const p1 = new p5.Vector(2, 1);
//   const lineType = SmartCanvas.getLineType(p0, p1);
//   expect(lineType).toBe(0);
// });

// it('correctly gets line type between two points: getLineType', () => {
//   const p0 = new p5.Vector(1, 1);
//   const p1 = new p5.Vector(-2, 1);
//   const lineType = SmartCanvas.getLineType(p0, p1);
//   expect(lineType).toBe(0);
// });

// it('correctly gets line type between two points: getLineType', () => {
//   const p0 = new p5.Vector(1, 1);
//   const p1 = new p5.Vector(-2, -2);
//   const lineType = SmartCanvas.getLineType(p0, p1);
//   expect(lineType).toBe(2);
// });

// it('correctly gets line type between two points: getLineType', () => {
//   const p0 = new p5.Vector(1, 1);
//   const p1 = new p5.Vector(2, 2);
//   const lineType = SmartCanvas.getLineType(p0, p1);
//   expect(lineType).toBe(2);
// });

// it('correctly gets pixels of line type between two points: getApproximateCrossings', () => {
//   const p0 = new p5.Vector(1, 1);
//   const p1 = new p5.Vector(3, 3);
//   const pixels = SmartCanvas.getApproximateCrossings(p0, p1, 1);
//   expect(pixels[0].x).toBe(1);
//   expect(pixels[0].y).toBe(1);
//   expect(pixels[1].x).toBe(2);
//   expect(pixels[1].y).toBe(2);
//   expect(pixels[2].x).toBe(3);
//   expect(pixels[2].y).toBe(3);
// });

// it('correctly gets pixels of line type between two points: getApproximateCrossings', () => {
//   const p0 = new p5.Vector(0.1, 0.6);
//   const p1 = new p5.Vector(2.1, 2.2);
//   const pixels = SmartCanvas.getApproximateCrossings(p0, p1, 0.1);
//   expect(pixels[0].x).toBe(0);
//   expect(pixels[0].y).toBe(0);
//   expect(pixels[1].x).toBe(0);
//   expect(pixels[1].y).toBe(1);
//   expect(pixels[2].x).toBe(1);
//   expect(pixels[2].y).toBe(1);
//   expect(pixels[3].x).toBe(1);
//   expect(pixels[3].y).toBe(2);
//   expect(pixels[4].x).toBe(2);
//   expect(pixels[4].y).toBe(2);
// });

// it('does not go past the end point: getApproximateCrossings', () => {
//   const p0 = new p5.Vector(0.5, 0.5);
//   const p1 = new p5.Vector(1.8, 1.9);
//   const pixels = SmartCanvas.getApproximateCrossings(p0, p1, 1.2);
//   expect(pixels[0].x).toBe(0);
//   expect(pixels[0].y).toBe(0);
//   expect(pixels[1].x).toBe(1);
//   expect(pixels[1].y).toBe(1);
// });

// it('captures small crossings when low step size: getApproximateCrossings', () => {
//   const p0 = new p5.Vector(0.9, 0.9);
//   const p1 = new p5.Vector(1.09, 1.1);
//   const pixels = SmartCanvas.getApproximateCrossings(p0, p1, 0.009);
//   expect(pixels[0].x).toBe(0);
//   expect(pixels[0].y).toBe(0);
//   expect(pixels[1].x).toBe(0);
//   expect(pixels[1].y).toBe(1);
//   expect(pixels[2].x).toBe(1);
//   expect(pixels[2].y).toBe(1);
// });

// it('checks smart canvas is created without crashing and has a line info with channels set to 0: SmartCanvas', () => {
//   const smartCanvas = new SmartCanvas(8, 8);
//   const lineInfo = smartCanvas.lineInfo;
//   expect(lineInfo.channels[0][0][0]).toBe(0);
//   expect(lineInfo.channels[0][7][7]).toBe(0);
// });

// it('updates line channels correctly with vertical line of length of around 1 at non-corner coordinates: getTestLineInfo', () => {
//   const smartCanvas = new SmartCanvas(8, 8);
//   const start = new p5.Vector(0.5, 0.5);
//   const end = new p5.Vector(0.5, 1.9);
//   const lineInfo = smartCanvas.getTestLineInfo(start, end);
//   expect(lineInfo.channels[0][0][0]).toBe(0);
//   expect(lineInfo.channels[0][7][7]).toBe(0);
//   expect(lineInfo.channels[1][0][0]).toBe(1);
//   expect(lineInfo.channels[1][1][0]).toBe(1);
//   expect(lineInfo.channels[1][0][1]).toBe(0);
//   expect(lineInfo.channels[1][1][1]).toBe(0);
//   expect(lineInfo.channels[1][2][1]).toBe(0);
// });

// it('updates line channels correctly with horizontal line of length of around 1 at non-corner coordinates: getTestLineInfo', () => {
//   const smartCanvas = new SmartCanvas(8, 8);
//   const start = new p5.Vector(2.5, 4.5);
//   const end = new p5.Vector(3.6, 4.5);
//   const lineInfo = smartCanvas.getTestLineInfo(start, end);
//   expect(lineInfo.channels[0][4][2]).toBe(1);
//   expect(lineInfo.channels[0][4][3]).toBe(1);
//   expect(lineInfo.channels[0][4][1]).toBe(0);
//   expect(lineInfo.channels[0][4][5]).toBe(0);
//   expect(lineInfo.channels[0][3][2]).toBe(0);
//   expect(lineInfo.channels[0][3][3]).toBe(0);
//   expect(lineInfo.channels[0][5][2]).toBe(0);
//   expect(lineInfo.channels[0][5][3]).toBe(0);
// });

// it('updates line channels correctly with diagonal line of length of around 1 at non-corner coordinates: getTestLineInfo', () => {
//   const smartCanvas = new SmartCanvas(8, 8);
//   const start = new p5.Vector(5.4, 5.5);
//   const end = new p5.Vector(6.3, 6.2);
//   const lineInfo = smartCanvas.getTestLineInfo(start, end);
//   expect(lineInfo.channels[2][5][5]).toBe(1);
//   expect(lineInfo.channels[2][5][6]).toBe(1);
//   expect(lineInfo.channels[2][6][6]).toBe(1);
//   expect(lineInfo.channels[2][6][5]).toBe(0);
// });

// it('updates line end channels correctly with diagonal line of length of around 1 at non-corner coordinates: getTestLineInfo', () => {
//   const smartCanvas = new SmartCanvas(8, 8);
//   const start = new p5.Vector(5.4, 5.5);
//   const end = new p5.Vector(6.3, 6.2);
//   const lineInfo = smartCanvas.getTestLineInfo(start, end);
//   const channel = lineInfo.channels[lineInfo.refs.lineEnd.start];
//   expect(channel[5][5]).toBe(1);
//   expect(channel[5][6]).toBe(0);
//   expect(channel[6][6]).toBe(1);
//   expect(channel[6][5]).toBe(0);
// });

// it('updates line end channels correctly with diagonal line of length of more than 2 at non-corner coordinates: getTestLineInfo', () => {
//   const smartCanvas = new SmartCanvas(8, 8);
//   const start = new p5.Vector(4.4, 4.5);
//   const end = new p5.Vector(6.3, 6.2);
//   const lineInfo = smartCanvas.getTestLineInfo(start, end);
//   const channel = lineInfo.channels[lineInfo.refs.lineEnd.start];
//   expect(channel[4][4]).toBe(1);
//   expect(channel[5][5]).toBe(0);
//   expect(channel[5][6]).toBe(0);
//   expect(channel[6][6]).toBe(1);
//   expect(channel[6][5]).toBe(0);
// });

it('updates line and line end channels correctly with multiple lines: getTestLineInfo', () => {
  const smartCanvas = new SmartCanvas(8, 8);

  // make first update (diag line)
  const start0 = new p5.Vector(3.4, 3.4);
  const end0 = new p5.Vector(6.3, 6.3);
  const lineInfo0 = smartCanvas.getTestLineInfo(start0, end0);

  // update the lineInfo with this new lineInfo
  smartCanvas.lineInfo = lineInfo0;

  // console.table(lineInfo0.channels[2]);
  // console.table(lineInfo0.channels[lineInfo0.refs.lineEnd.start]);

  // make second update (diag line)
  const start1 = new p5.Vector(4.2, 6.2);
  const end1 = new p5.Vector(7.2, 3.2);
  const lineInfo1 = smartCanvas.getTestLineInfo(start1, end1);

  // console.table(lineInfo1.channels[3]);
  // console.table(lineInfo1.channels[lineInfo1.refs.lineEnd.start]);

  // update the lineInfo with this new lineInfo
  smartCanvas.lineInfo = lineInfo1;

  // make third update (horizontal line)
  const start2 = new p5.Vector(2.2, 5.5);
  const end2 = new p5.Vector(7.3, 5.5);
  const lineInfo2 = smartCanvas.getTestLineInfo(start2, end2);

  // console.table(lineInfo2.channels[0]);
  // console.table(lineInfo2.channels[lineInfo2.refs.lineEnd.start]);

  const diagChannel0 = lineInfo2.channels[2];
  expect(diagChannel0[3][3]).toBe(1);
  expect(diagChannel0[4][4]).toBe(1);
  expect(diagChannel0[4][5]).toBe(0);
  expect(diagChannel0[5][5]).toBe(1);
  expect(diagChannel0[6][6]).toBe(1);

  const diagChannel1 = lineInfo2.channels[3];
  // console.table(diagChannel1);
  expect(diagChannel1[6][4]).toBe(1);
  expect(diagChannel1[5][4]).toBe(1);
  expect(diagChannel1[6][5]).toBe(0);
  expect(diagChannel1[5][5]).toBe(1);
  expect(diagChannel1[4][5]).toBe(1);
  expect(diagChannel1[4][6]).toBe(1);
  expect(diagChannel1[3][6]).toBe(1);
  expect(diagChannel1[3][7]).toBe(1);

  const horChannel = lineInfo2.channels[0];
  // console.table(horChannel);
  expect(horChannel[5][2]).toBe(1);
  expect(horChannel[5][5]).toBe(1);
  expect(horChannel[6][6]).toBe(0);
  expect(horChannel[5][7]).toBe(1);

  const lineEndChannel = lineInfo2.channels[lineInfo2.refs.lineEnd.start];
  expect(lineEndChannel[3][3]).toBe(1);
  expect(lineEndChannel[6][6]).toBe(1);
  expect(lineEndChannel[6][4]).toBe(1);
  expect(lineEndChannel[3][7]).toBe(1);
  expect(lineEndChannel[5][2]).toBe(1);
  expect(lineEndChannel[5][7]).toBe(1);
  expect(lineEndChannel[5][5]).toBe(0);
});

// test very short changes
it('updates line and line end channels correctly with multiple very short lines: getTestLineInfo', () => {
  const smartCanvas = new SmartCanvas(8, 8);

  // make first update (diag line)
  const start0 = new p5.Vector(3.3, 3.3);
  const end0 = new p5.Vector(3.7, 3.7);
  const lineInfo0 = smartCanvas.getTestLineInfo(start0, end0);

  // update the lineInfo with this new lineInfo
  smartCanvas.lineInfo = lineInfo0;

  // console.table(lineInfo0.channels[2]);
  // console.table(lineInfo0.channels[lineInfo0.refs.lineEnd.start]);

  // make second update (diag line)
  const start1 = new p5.Vector(3.7, 3.3);
  const end1 = new p5.Vector(3.3, 3.7);
  const lineInfo1 = smartCanvas.getTestLineInfo(start1, end1);

  // console.table(lineInfo1.channels[3]);
  // console.table(lineInfo1.channels[lineInfo1.refs.lineEnd.start]);

  // update the lineInfo with this new lineInfo
  smartCanvas.lineInfo = lineInfo1;

  // make third update (horizontal line)
  const start2 = new p5.Vector(3.3, 3.5);
  const end2 = new p5.Vector(3.7, 3.5);
  const lineInfo2 = smartCanvas.getTestLineInfo(start2, end2);

  // console.table(lineInfo2.channels[0]);
  // console.table(lineInfo2.channels[lineInfo2.refs.lineEnd.start]);

  const diagChannel0 = lineInfo2.channels[2];
  expect(diagChannel0[3][3]).toBe(1);
  expect(diagChannel0[4][3]).toBe(0);

  const diagChannel1 = lineInfo2.channels[3];
  // console.table(diagChannel1);
  expect(diagChannel1[3][3]).toBe(1);
  expect(diagChannel1[3][4]).toBe(0);

  const horChannel = lineInfo2.channels[0];
  // console.table(horChannel);
  expect(horChannel[3][3]).toBe(1);
  expect(horChannel[3][2]).toBe(0);

  const lineEndChannel = lineInfo2.channels[lineInfo2.refs.lineEnd.start];
  expect(lineEndChannel[3][3]).toBe(0);
  expect(lineEndChannel[3][4]).toBe(0);
});

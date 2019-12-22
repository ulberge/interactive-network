import { sumChannelsWithLimit, Drawer } from './draw';
import { CONSTANTS } from './helpers';

it('correctly adds positive and negative numbers: sumChannelsWithLimit', () => {
  const arr0 = [[-1, -1],[1, 0]];
  const arr1 = [[0, 1],[0, 1]];

  const expectedResult = [[-1, 0],[1, 1]].flat();
  const result = sumChannelsWithLimit([arr0, arr1], 3).flat();

  result.forEach((v, i) => expect(v).toBe(expectedResult[i]));
});

it('correctly adds positive and negative numbers with limits: sumChannelsWithLimit', () => {
  const arr0 = [[-1, -1],[1, 2]];
  const arr1 = [[-2, 0],[0, 1]];

  const expectedResult = [[-2, -1],[1, 2]].flat();
  const result = sumChannelsWithLimit([arr0, arr1], 2).flat();

  result.forEach((v, i) => expect(v).toBe(expectedResult[i]));
});

it('findBestLineIntersectAboveThreshold correctly finds position in first channel', () => {
  const drawer = new Drawer();

  const arr0 = [[1, 0, 0],[0, 2, 0],[0, 0, 3]];
  const arr1 = [[0, 2, 0],[0, 2, 0],[0, 0, 0]];
  const channels = [ arr0, arr1 ];

  const { channelIndex, rowIndex, colIndex } = drawer.findBestLineIntersectAboveThreshold(channels, 0.5);
  expect(channelIndex).toBe(0);
  expect(rowIndex).toBe(2);
  expect(colIndex).toBe(2);
});

it('findBestLineIntersectAboveThreshold correctly finds position in other channel', () => {
  const drawer = new Drawer();

  const arr0 = [[1, 0, 0],[0, 2, 0],[0, 0, 0]];
  const arr1 = [[0, 2, 0],[0, 3, 0],[0, 0, 0]];
  const channels = [ arr0, arr1 ];

  const { channelIndex, rowIndex, colIndex } = drawer.findBestLineIntersectAboveThreshold(channels, 0.5);
  expect(channelIndex).toBe(1);
  expect(rowIndex).toBe(1);
  expect(colIndex).toBe(1);
});

it('findBestLineIntersectAboveThreshold fails to find position with high threshold', () => {
  const drawer = new Drawer();

  const arr0 = [[1, 0, 0],[0, 2, 0],[0, 0, 0]];
  const arr1 = [[0, 2, 0],[0, 3, 0],[0, 0, 0]];
  const channels = [ arr0, arr1 ];

  const result = drawer.findBestLineIntersectAboveThreshold(channels, 4);
  expect(result).toBe(null);
});

it('getNextLine correctly finds start and end for vertical', () => {
  const drawer = new Drawer();

  const arr0 = [[1, 2, 0],[0, 4, 0],[0, 3, 0]];
  const arr1 = [[0, 2, 0],[0, 2, 0],[0, 0, 0]];
  const channels = [ arr0, arr1 ];

  const { start, end } = drawer.getNextLine(channels, channels, 0.5);
  const round2 = val => Math.round(val * 100) / 100;
  expect(round2(start.x)).toBe(1.5);
  expect(round2(start.y)).toBe(0.1);
  expect(round2(end.x)).toBe(1.5);
  expect(round2(end.y)).toBe(2.9);
});

it('getNextLine correctly finds start and end for diagonal', () => {
  const drawer = new Drawer();

  const arr0 = [[1, 0, 0],[0, 2, 0],[0, 0, 0]];
  const arr1 = [[0, 2, 0],[0, 3, 0],[0, 0, 0]];
  const arr2 = [[0, 2, 0],[0, 3, 0],[4, 0, 0]];
  const channels = [ arr0, arr1, arr2 ];

  const { start, end } = drawer.getNextLine(channels, channels, 0.5);
  const round2 = val => Math.round(val * 100) / 100;
  expect(round2(start.x)).toBe(1.98);
  expect(round2(start.y)).toBe(1.02);
  expect(round2(end.x)).toBe(0.01);
  expect(round2(end.y)).toBe(2.99);
});

it('getNextLine fails to find start and end when high threshold', () => {
  const drawer = new Drawer();

  const arr0 = [[1, 0, 0],[0, 2, 0],[0, 0, 0]];
  const arr1 = [[0, 2, 0],[0, 3, 0],[0, 0, 0]];
  const arr2 = [[0, 2, 0],[0, 3, 0],[4, 0, 0]];
  const channels = [ arr0, arr1, arr2 ];

  const result = drawer.getNextLine(channels, channels, 5);
  expect(result).toBe(null);
});

it('growLine correct expands horizontally', () => {
  const drawer = new Drawer();

  const channel = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 1, 1, 1],
    [0, 0, 0, 0],
  ];

  const { start, end } = drawer.growLine(channel, 0, 2.5, 2.5, 0.5);
  const round2 = val => Math.round(val * 100) / 100;
  expect(round2(start.x)).toBe(1.1);
  expect(round2(start.y)).toBe(2.5);
  expect(round2(end.x)).toBe(3.9);
  expect(round2(end.y)).toBe(2.5);
});

it('growLine correct expands vertically', () => {
  const drawer = new Drawer();

  const channel = [
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 1, 1, 1],
    [0, 0, 1, 0],
  ];

  const { start, end } = drawer.growLine(channel, Math.PI / 2, 2.5, 2.5, 0.5);
  const round2 = val => Math.round(val * 100) / 100;
  expect(round2(start.x)).toBe(2.5);
  expect(round2(start.y)).toBe(0.1);
  expect(round2(end.x)).toBe(2.5);
  expect(round2(end.y)).toBe(3.9);
});

it('growLine correct expands diag1', () => {
  const drawer = new Drawer();

  const channel = [
    [0, 0, 0, 1],
    [0, 0, 1, 0],
    [0, 1, 0, 0],
    [0, 0, 0, 0],
  ];

  const { start, end } = drawer.growLine(channel, CONSTANTS.ANGLES[2] + (Math.PI / 2), 1.5, 2.5, 0.5);
  const round2 = val => Math.round(val * 100) / 100;
  expect(round2(start.x)).toBe(3.98);
  expect(round2(start.y)).toBe(0.02);
  expect(round2(end.x)).toBe(1.02);
  expect(round2(end.y)).toBe(2.98);
});

it('growLine correct expands diag2', () => {
  const drawer = new Drawer();

  const channel = [
    [0, 1, 0, 1],
    [0, 0, 1, 0],
    [0, 1, 0, 1],
    [0, 0, 0, 0],
  ];

  const { start, end } = drawer.growLine(channel, CONSTANTS.ANGLES[3] + (Math.PI / 2), 1.5, 2.5, 0.5);
  const round2 = val => Math.round(val * 100) / 100;
  expect(round2(start.x)).toBe(3.98);
  expect(round2(start.y)).toBe(2.98);
  expect(round2(end.x)).toBe(1.02);
  expect(round2(end.y)).toBe(0.02);
});

it('growLine correct expands with threshold', () => {
  const drawer = new Drawer();

  const channel = [
    [0, 0, 1, 0],
    [0, 0, 0.4, 0],
    [0, 1, 1, 1],
    [0, 0, 1, 0],
  ];

  const { start, end } = drawer.growLine(channel, Math.PI / 2, 2.5, 2.5, 0.5);
  const round2 = val => Math.round(val * 100) / 100;
  expect(round2(start.x)).toBe(2.5);
  expect(round2(start.y)).toBe(2.1);
  expect(round2(end.x)).toBe(2.5);
  expect(round2(end.y)).toBe(3.9);
});

// end-to-end tests
// choose a line and draw it

// const pMock = {
//   state: {
//     canvas: [[0, 0, 0],[0, 0, 0],[0, 0, 0]]
//   }
//   push: () => {},
//   pop: () => {},
//   stroke: () => {},
//   strokeWeight: () => {},
//   noFill: () => {},
//   line: (x0, y0, x1, y1) => {},
// }

// it('getRemaining correctly subtracts array from others', () => {
//   const drawer = new Drawer();

//   const arr0 = [[0, 1, 0],[0, 2, 0],[0, 1, 0]];
//   const arr1 = [[0, 2, 0],[0, 3, 0],[0, 2, 0]];
//   const channels = [ arr0, arr1 ];

//   const strokeWeight = 1;
//   drawer.draw(channels, strokeWeight);

//   const result0 = [[0, 0],[0.3, 0]];
//   const result1 = [[0, 0],[0, 1]];

//   const remaining = drawer.getRemaining(channels, imgArr);

//   remaining[0].forEach((row, i) => row.forEach((val, j) => expect(val).toBe(result0[i][j])));
//   remaining[1].forEach((row, i) => row.forEach((val, j) => expect(val).toBe(result1[i][j])));
// });

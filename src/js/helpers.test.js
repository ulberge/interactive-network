import { getPixelsWithinDistance, getUniqueNeighbors, floodFill, getApproximateCrossings, getEmpty2DArray, get2DArraySlice } from './helpers';
import p5 from 'p5';

const getPixelsAs2DArray = pixels => {
  const pixelArr2D = getEmpty2DArray(8, 8, 0);
  pixels.forEach(pixel => pixelArr2D[pixel.y][pixel.x] = 1);
  return pixelArr2D;
}

it('correctly gets pixels within distance: getPixelsWithinDistance', () => {
  const pixels = getPixelsWithinDistance({ x: 3, y: 4 }, 2, [0, 0, 8, 8]);

  const expectedResult = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  // console.table(getPixelsAs2DArray(pixels));
  expect(getPixelsAs2DArray(pixels)).toEqual(expectedResult);
});

it('correctly gets pixels within distance with lower bound encounter: getPixelsWithinDistance', () => {
  const pixels = getPixelsWithinDistance({ x: 0, y: 1 }, 2, [0, 0, 8, 8]);

  const expectedResult = [
    [1, 1, 1, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  // console.table(getPixelsAs2DArray(pixels));
  expect(getPixelsAs2DArray(pixels)).toEqual(expectedResult);
});

it('correctly gets pixels within distance with upper bound encounter: getPixelsWithinDistance', () => {
  const pixels = getPixelsWithinDistance({ x: 6, y: 7 }, 2, [0, 0, 8, 8]);

  const expectedResult = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 1, 1, 1],
  ];
  console.table(getPixelsAs2DArray(pixels));
  expect(getPixelsAs2DArray(pixels)).toEqual(expectedResult);
});

it('correctly gets unique pixels within distance: getUniqueNeighbors', () => {
  const pixels = getUniqueNeighbors([{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }], 1, [0, 0, 8, 8]);

  const expectedResult = [
    [1, 1, 1, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  // console.table(getPixelsAs2DArray(pixels));
  expect(getPixelsAs2DArray(pixels)).toEqual(expectedResult);
});

it('correctly gets unique pixels within distance when bounds encountered: getUniqueNeighbors', () => {
  const pixels = getUniqueNeighbors([{ x: 0, y: 0 }, { x: 7, y: 7 }], 1, [0, 0, 8, 8]);

  const expectedResult = [
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 1],
  ];
  // console.table(getPixelsAs2DArray(pixels));
  expect(getPixelsAs2DArray(pixels)).toEqual(expectedResult);
});

it('correctly flood fills one pixel: floodFill', () => {
  const input = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  const expectedResult = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  floodFill(input, { x: 1, y: 6 }, 0);
  // console.table(result);
  expect(input).toEqual(expectedResult);
});

it('correctly flood fills: floodFill', () => {
  const input = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  const expectedResult = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  floodFill(input, { x: 3, y: 3 }, 0);
  // console.table(result);
  expect(input).toEqual(expectedResult);
});

it('correctly gets pixels of line type between two points: getApproximateCrossings', () => {
  const p0 = new p5.Vector(1, 1);
  const p1 = new p5.Vector(3, 3);
  const result = getApproximateCrossings(p0, p1, 1);

  const expectedResult = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  // console.table(getPixelsAs2DArray(result));
  expect(getPixelsAs2DArray(result)).toEqual(expectedResult);
});

it('correctly gets pixels of line type between two points (non-integers): getApproximateCrossings', () => {
  const p0 = new p5.Vector(0.1, 0.6);
  const p1 = new p5.Vector(2.1, 2.2);
  const result = getApproximateCrossings(p0, p1, 0.1);

  const expectedResult = [
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  // console.table(getPixelsAs2DArray(result));
  expect(getPixelsAs2DArray(result)).toEqual(expectedResult);
});

it('does not go past the end point: getApproximateCrossings', () => {
  const p0 = new p5.Vector(0.5, 0.5);
  const p1 = new p5.Vector(1.8, 1.9);
  const pixels = getApproximateCrossings(p0, p1, 1.2);
  const expectedResult = [
    [1, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  // console.table(getPixelsAs2DArray(pixels));
  expect(getPixelsAs2DArray(pixels)).toEqual(expectedResult);
});

it('captures small crossings when low step size: getApproximateCrossings', () => {
  const p0 = new p5.Vector(0.9, 0.9);
  const p1 = new p5.Vector(1.09, 1.1);
  const pixels = getApproximateCrossings(p0, p1, 0.009);
  const expectedResult = [
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  // console.table(getPixelsAs2DArray(pixels));
  expect(getPixelsAs2DArray(pixels)).toEqual(expectedResult);
});

it('correctly extracts a slice of middle of array: get2DArraySlice', () => {
  const arr = [
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 1, 0, 0, 0, 0],
    [0, 0, 2, 0, 5, 0, 0, 0],
    [0, 4, 0, 3, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  const result = get2DArraySlice(arr, [1, 1, 3, 4]);
  const expectedResult = [
    [1, 0, 1, 0],
    [0, 2, 0, 5],
    [4, 0, 3, 0],
  ];
  console.table(result);
  expect(result).toEqual(expectedResult);
});

it('correctly extracts a slice of edge at beginning of array: get2DArraySlice', () => {
  const arr = [
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 1, 0, 0, 0, 0],
    [0, 0, 2, 0, 5, 0, 0, 0],
    [0, 4, 0, 3, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  const result = get2DArraySlice(arr, [0, 0, 3, 2]);
  const expectedResult = [
    [1, 0, 0, 0, 0],
    [1, 1, 0, 1, 0],
  ];
  console.table(result);
  expect(result).toEqual(expectedResult);
});



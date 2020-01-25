import { getPixelsWithinDistance, getUniqueNeighbors, floodFill, getApproximateCrossings, getEmpty2DArray, slice2D, choose2D, cropArray2D, splice2D, combineBounds, limitBounds, erode2D, dilateBounds, getLineBounds } from './helpers';
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
  // console.table(getPixelsAs2DArray(pixels));
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

it('correctly extracts a slice of middle of array: slice2D', () => {
  const arr = [
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 1, 0, 0, 0, 0],
    [0, 0, 2, 0, 5, 0, 0, 0],
    [0, 4, 0, 3, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  const result = slice2D(arr, [1, 1, 4, 5]);
  const expectedResult = [
    [1, 0, 1],
    [0, 2, 0],
    [4, 0, 3],
    [0, 0, 0],
  ];
  // console.table(result);
  expect(result).toEqual(expectedResult);
});

it('correctly extracts a slice of edge at beginning of array: slice2D', () => {
  const arr = [
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 1, 0, 0, 0, 0],
    [0, 0, 2, 0, 5, 0, 0, 0],
    [0, 4, 0, 3, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  const result = slice2D(arr, [0, 0, 4, 2]);
  const expectedResult = [
    [1, 0, 0, 0],
    [1, 1, 0, 1],
  ];
  // console.log('id: 1');
  // console.table(result);
  expect(result).toEqual(expectedResult);
});

it('correctly inserts smaller array into middle of larger array: splice2D', () => {
  const arrBig = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
  const arrSmall = [
    [2, 3],
    [4, 5],
  ];
  const result = splice2D(arrBig, arrSmall, { x: 1, y: 1 });
  const expectedResult = [
    [1, 0, 0, 0],
    [0, 2, 3, 0],
    [0, 4, 5, 0],
    [0, 0, 0, 1],
  ];
  expect(result).toEqual(expectedResult);
});

it('correctly inserts larger array into smaller array: splice2D', () => {
  const arrBig = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
  const arrSmall = [
    [2, 3],
    [4, 5],
  ];
  const result = splice2D(arrSmall, arrBig, { x: -1, y: -1 });
  const expectedResult = [
    [1, 0],
    [0, 1],
  ];
  expect(result).toEqual(expectedResult);
});

it('correctly inserts smaller array beginning offset into larger array: splice2D', () => {
  const arrBig = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
  const arrSmall = [
    [2, 3],
    [4, 5],
  ];
  const result = splice2D(arrBig, arrSmall, { x: -1, y: -1 });
  const expectedResult = [
    [5, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
  expect(result).toEqual(expectedResult);
});

it('correctly inserts smaller array end offset into larger array: splice2D', () => {
  const arrBig = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
  const arrSmall = [
    [2, 3],
    [4, 5],
  ];
  const result = splice2D(arrBig, arrSmall, { x: 3, y: 3 });
  const expectedResult = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 2],
  ];
  expect(result).toEqual(expectedResult);
});

it('correctly picks a place with probability: choose2D', () => {
  const arr = [
    [0, 0, 0],
    [0, 0.5, 0],
    [0, 1, 0],
  ];
  const result = choose2D(arr);
  const { x, y } = result;
  expect(x).toEqual(1);
  expect([1, 2]).toContain(y);
});

it('correctly combines two bounds: combineBounds', () => {
  const bounds0 = [ 1, 2, 6, 7 ];
  const bounds1 = [ 2, 1, 8, 5 ];
  const result = combineBounds(bounds0, bounds1);
  // console.log(result);
  const expectedResult = [ 1, 1, 8, 7 ];
  expect(result).toEqual(expectedResult);
});

it('correctly combines null bounds: combineBounds', () => {
  const bounds = [ 1, 2, 6, 7 ];
  const result0 = combineBounds(bounds, null);
  // console.log(result0);
  expect(result0).toEqual(bounds);
  const result1 = combineBounds(null, bounds);
  // console.log(result1);
  expect(result1).toEqual(bounds);
});

it('correctly limits null bounds and deals with null limit: limitBounds', () => {
  const bounds = [ 1, 2, 6, 7 ];
  const result0 = limitBounds(bounds, null);
  expect(result0).toEqual(bounds);
  const result1 = limitBounds(null, bounds);
  expect(result1).toEqual(null);
});

it('ignores limit outside of bounds: limitBounds', () => {
  const bounds = [ 1, 2, 6, 7 ];
  const limit = [ 0, 0, 8, 8 ];
  const result = limitBounds(bounds, limit);
  expect(result).toEqual(bounds);
});

it('applies limit inside of bounds: limitBounds', () => {
  const bounds = [ 0, 0, 8, 8 ];
  const limit = [ 1, 2, 6, 7 ];
  const result = limitBounds(bounds, limit);
  expect(result).toEqual(limit);
});

it('dilates bounds: dilateBounds', () => {
  const bounds = [ 3, 2, 6, 7 ];
  const expectedResult = [ 1, 0, 8, 9 ];
  const result = dilateBounds(bounds, 2);
  expect(result).toEqual(expectedResult);
});

it('removes the edges of the 2D array: erode2D', () => {
  const arr = [
    [1, 0, 0, 0],
    [0, 2, 4, 0],
    [0, 5, 3, 0],
    [0, 0, 0, 1],
  ];
  const expectedResult = [
    [2, 4],
    [5, 3],
  ];
  const result = erode2D(arr, 1);
  expect(result).toEqual(expectedResult);
});

it('gets line bounds when no padding: getLineBounds', () => {
  const start = { x: 1.3, y: 2.2 };
  const end = { x: 4.5, y: 6.7 };
  const result = getLineBounds(start, end);
  const expectedResult = [ 1, 2, 5, 7 ];
  expect(result).toEqual(expectedResult);
});

it('gets line bounds when no padding when order reversed: getLineBounds', () => {
  const end = { x: 1.3, y: 2.2 };
  const start = { x: 4.5, y: 6.7 };
  const result = getLineBounds(start, end);
  const expectedResult = [ 1, 2, 5, 7 ];
  expect(result).toEqual(expectedResult);
});

it('gets line bounds when padding: getLineBounds', () => {
  const start = { x: 1.3, y: 2.2 };
  const end = { x: 4.5, y: 6.7 };
  const result = getLineBounds(start, end, 1);
  const expectedResult = [ 0, 1, 6, 8 ];
  expect(result).toEqual(expectedResult);
});

it('gets line bounds when padding and order reversed: getLineBounds', () => {
  const end = { x: 1.3, y: 2.2 };
  const start = { x: 4.5, y: 6.7 };
  const result = getLineBounds(start, end, 1);
  const expectedResult = [ 0, 1, 6, 8 ];
  expect(result).toEqual(expectedResult);
});


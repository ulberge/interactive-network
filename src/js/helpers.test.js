import { getPixelsWithinDistance, getUniqueNeighbors, floodFill } from './helpers';

// it('correctly gets pixels within distance: getPixelsWithinDistance', () => {
//   const pixels = getPixelsWithinDistance({ x: 3, y: 4 }, 2, [0, 0, 10, 10]);

//   expect(pixels.length).toBe(25);
// });

// it('correctly gets pixels within distance with lower bound encounter: getPixelsWithinDistance', () => {
//   const pixels = getPixelsWithinDistance({ x: 3, y: 4 }, 3, [2, 2, 10, 10]);

//   expect(pixels.length).toBe(30);
// });

// it('correctly gets pixels within distance with upper bound encounter: getPixelsWithinDistance', () => {
//   const pixels = getPixelsWithinDistance({ x: 3, y: 4 }, 3, [0, 0, 6, 6]);

//   expect(pixels.length).toBe(30);
// });

// it('correctly gets pixels within distance with both bound encounter: getPixelsWithinDistance', () => {
//   const pixels = getPixelsWithinDistance({ x: 1, y: 1 }, 2, [0, 0, 3, 3]);

//   expect(pixels.length).toBe(9);
// });

// it('correctly gets unique pixels within distance: getUniqueNeighbors', () => {
//   const pixels = getUniqueNeighbors([{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }], 1, [0, 0, 5, 5]);

//   expect(pixels.length).toBe(15);
// });

// it('correctly gets unique pixels within distance when bounds encountered: getUniqueNeighbors', () => {
//   const pixels = getUniqueNeighbors([{ x: 0, y: 0 }, { x: 4, y: 4 }], 1, [0, 0, 5, 5]);

//   expect(pixels.length).toBe(8);
// });

// it('correctly gets unique pixels within distance when bounds encountered: getUniqueNeighbors', () => {
//   const pixels = getUniqueNeighbors([{ x: 4, y: 3 }], 1, [0, 0, 8, 7]);
//   console.log(pixels);
//   expect(pixels.length).toBe(8);
// });

it('correctly flood fills: floodFill', () => {
  const arr2D = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ]
  const newArr2D = floodFill(arr2D, { x: 3, y: 3 }, 0);
  console.table(newArr2D);
  expect(newArr2D[2][2]).toBe(0);
  expect(newArr2D[2][3]).toBe(0);
  expect(newArr2D[2][4]).toBe(0);
  expect(newArr2D[2][6]).toBe(0);
  expect(newArr2D[3][3]).toBe(0);
  expect(newArr2D[3][4]).toBe(0);
  expect(newArr2D[3][5]).toBe(0);
  expect(newArr2D[5][1]).toBe(1);
});



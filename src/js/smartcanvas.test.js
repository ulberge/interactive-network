import { getNewBounds, LineInfo } from './smartcanvas';

it('correctly get bounds when no bounds provided: getNewBounds', () => {
  const result = getNewBounds(null, 3, 4);
  expect(result).toEqual([ 3, 4, 3, 4 ]);

  const result2 = getNewBounds([], 3, 4);
  expect(result2).toEqual([ 3, 4, 3, 4 ]);
});

it('does not expand bounds when point inside provided: getNewBounds', () => {
  const bounds = [ 1, 2, 4, 5 ];
  const result = getNewBounds(bounds, 3, 4);
  expect(result).toEqual(bounds);
});

it('correctly expands bounds when points outside provided: getNewBounds', () => {
  const bounds = [ 1, 2, 4, 5 ];
  const result = getNewBounds(bounds, 5, 7);
  expect(result).toEqual([ 1, 2, 5, 7 ]);
});

it('correctly expands bounds when points outside provided: getNewBounds', () => {
  const bounds = [ 1, 2, 4, 5 ];
  const result = getNewBounds(bounds, 0, 0);
  expect(result).toEqual([ 0, 0, 4, 5 ]);
});

it('gets correct pos and neg diff between channel stacks with no bounds applied: LineInfo.diff', () => {
  const channels0 = [
    [[1, 0],
     [0, 2]],
    [[0, 1],
     [2, 0]],
  ];
  const channels1 = [
    [[4, 0],
     [0, 1]],
    [[2, 0],
     [2, 2]],
  ];

  const expectedMaxPos = [
    [3, 0],
     [0, 2],
  ];
  const expectedIdsPos = [
    [0, -1],
     [-1, 1],
  ];
  const expectedMaxNeg = [
    [0, 1],
     [0, 1],
  ];
  const expectedIdsNeg = [
    [-1, 1],
     [-1, 0],
  ];

  const { maxPos, idsPos, maxNeg, idsNeg } = LineInfo.diff(channels0, channels1, [0, 0, 1, 1]);
  // console.log(maxPos);
  // console.log(idsPos);
  // console.log(maxNeg);
  // console.log(idsNeg);

  expect(maxPos).toEqual(expectedMaxPos);
  expect(idsPos).toEqual(expectedIdsPos);
  expect(maxNeg).toEqual(expectedMaxNeg);
  expect(idsNeg).toEqual(expectedIdsNeg);
});

it('gets correct pos and neg diff between channel stacks with bounds applied: LineInfo.diff', () => {
  const channels0 = [
    [[1, 0],
     [0, 2]],
    [[0, 1],
     [2, 0]],
  ];
  const channels1 = [
    [[4, 0],
     [0, 1]],
    [[2, 0],
     [2, 2]],
  ];

  const expectedMaxPos = [
    [2],
  ];
  const expectedIdsPos = [
    [1],
  ];
  const expectedMaxNeg = [
    [1],
  ];
  const expectedIdsNeg = [
    [0],
  ];

  const { maxPos, idsPos, maxNeg, idsNeg } = LineInfo.diff(channels0, channels1, [1, 1, 1, 1]);
  // console.log(maxPos);
  // console.log(idsPos);
  // console.log(maxNeg);
  // console.log(idsNeg);

  expect(maxPos).toEqual(expectedMaxPos);
  expect(idsPos).toEqual(expectedIdsPos);
  expect(maxNeg).toEqual(expectedMaxNeg);
  expect(idsNeg).toEqual(expectedIdsNeg);
});

it('gets correct pos and neg diff between channel stacks with filter applied: LineInfo.diff', () => {
  const channels0 = [
    [[1, 0],
     [0, 2]],
    [[0, 1],
     [2, 0]],
  ];
  const channels1 = [
    [[4, 0],
     [0, 1]],
    [[2, 0],
     [1, 2]],
  ];

  const expectedMaxPos = [
    [2, 0],
     [0, 2],
  ];
  const expectedIdsPos = [
    [1, -1],
     [-1, 1],
  ];
  const expectedMaxNeg = [
    [0, 1],
     [1, 0],
  ];
  const expectedIdsNeg = [
    [-1, 1],
     [1, -1],
  ];

  const { maxPos, idsPos, maxNeg, idsNeg } = LineInfo.diff(channels0, channels1, [0, 0, 1, 1], [1]);
  // console.log(maxPos);
  // console.log(idsPos);
  // console.log(maxNeg);
  // console.log(idsNeg);

  expect(maxPos).toEqual(expectedMaxPos);
  expect(idsPos).toEqual(expectedIdsPos);
  expect(maxNeg).toEqual(expectedMaxNeg);
  expect(idsNeg).toEqual(expectedIdsNeg);
});


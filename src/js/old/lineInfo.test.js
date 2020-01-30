import LineInfo from './lineInfo';

function getKernels(num) {
  const kernel = [[0]];
  const kernelsMock = [];
  for (let i = 0; i < num; i += 1) {
    kernelsMock.push(kernel);
  }
  return kernelsMock;
}

it('creates a LineInfo', () => {
  const lineInfo = LineInfo.create(getKernels(2), [ 6, 6 ]);

  expect(lineInfo.channels.length).toBe(2);

  expect(lineInfo.channels[0].length).toBe(6);
  expect(lineInfo.channels[0][0].length).toBe(6);

  expect(lineInfo.max.length).toBe(6);
  expect(lineInfo.max[0].length).toBe(6);
  expect(lineInfo.ids.length).toBe(6);
  expect(lineInfo.ids[0].length).toBe(6);
});

it('copies a LineInfo with indices filter', () => {
  const lineInfo = LineInfo.create(getKernels(3), [ 6, 6 ]);

  lineInfo.channels[0][0][0] = 3;
  lineInfo.channels[0][5][5] = 3;
  lineInfo.channels[1][2][2] = 5;
  lineInfo.channels[2][4][4] = 7;

  const newLineInfo = lineInfo.copy([2, 2, 6, 6], [0, 2]);

  expect(lineInfo.channels.length).toBe(3);
  expect(newLineInfo.channels.length).toBe(2);

  const expectedChannel = [
    [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 3]],
    [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 7, 0], [0, 0, 0, 0]],
  ];
  expect(newLineInfo.channels).toEqual(expectedChannel);

  const expectedMax = [
    [0.05, 0.05, 0.05, 0.05], [0.05, 0.05, 0.05, 0.05], [0.05, 0.05, 7, 0.05], [0.05, 0.05, 0.05, 3],
  ];
  const expectedIds = [
    [-1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, 1, -1], [-1, -1, -1, 0],
  ];
  // console.table(newLineInfo.max);
  // console.table(expectedMax);
  // console.table(newLineInfo.ids);
  // console.table(expectedIds);
  expect(newLineInfo.max).toEqual(expectedMax);
  expect(newLineInfo.ids).toEqual(expectedIds);
});


it('copies a LineInfo with no indices provided', () => {
  const lineInfo = LineInfo.create(getKernels(3), [ 6, 6 ]);
  lineInfo.channels[0][0][0] = 3;
  lineInfo.channels[0][5][5] = 3;
  lineInfo.channels[1][2][2] = 5;
  lineInfo.channels[2][4][4] = 7;
  const newLineInfo = lineInfo.copy([2, 2, 6, 6]);

  expect(lineInfo.channels.length).toBe(3);
  expect(newLineInfo.channels.length).toBe(3);
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

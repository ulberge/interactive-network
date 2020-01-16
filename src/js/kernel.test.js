import { scaleKernel } from './kernel';

it('scales positive values so that their sum is 1 and negative values relative: scaleKernel', () => {
  const input = [
    [-4, -1, 0],
    [0.5, 2, 0.5],
    [0, -0.3, 1],
  ];
  const expectedResult = [
    [-4/8, -1/8, 0],
    [0.5/4, 2/4, 0.5/4],
    [0, -0.3/8, 1/4],
  ];
  const output = scaleKernel(input);
  // console.table(output);
  expect(output).toEqual(expectedResult);
});

it('works when no negative values: scaleKernel', () => {
  const input = [
    [0, 0, 0],
    [0.5, 2, 0.5],
    [0, 0, 1],
  ];
  const expectedResult = [
    [0, 0, 0],
    [0.5/4, 2/4, 0.5/4],
    [0, 0, 1/4],
  ];
  const output = scaleKernel(input);
  // console.table(output);
  expect(output).toEqual(expectedResult);
});

it('works when no positive values: scaleKernel', () => {
  const input = [
    [0, 0, 0],
    [-4, -1, 0],
    [0, 0, -1],
  ];
  const expectedResult = [
    [0, 0, 0],
    [-4, -1, 0],
    [0, 0, -1],
  ];
  const output = scaleKernel(input);
  // console.table(output);
  expect(output).toEqual(expectedResult);
});

import { sumChannelsWithLimit } from './draw';
import 'jest-canvas-mock';

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

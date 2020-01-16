import { getNewBounds } from './smartcanvas';

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

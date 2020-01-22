import Drawer from './draw';

it('returns correct bounds when everything is legal: getLegalBounds', () => {
  const result = Drawer.getLegalBounds([16, 16], [3, 5], { x: 6, y: 7 });
  const expectedResult = [ 5, 5, 7, 9 ];
  expect(result).toEqual(expectedResult);
});

it('returns correct bounds when everything is legal: getLegalBounds', () => {
  const result = Drawer.getLegalBounds([16, 16], [15, 13], { x: 6, y: 3 });
  const expectedResult = [ 0, 0, 13, 9 ];
  expect(result).toEqual(expectedResult);
});

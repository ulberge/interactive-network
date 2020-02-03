import nj from 'numjs';
import ConvArray, { dilateBounds, limitBounds } from './convArray';
import ConvLayer from './convLayer';
window.HTMLCanvasElement.prototype.getContext = () => {};

it('constructs a padded backing array', () => {
  const cArr = ConvArray.conv(1, [ 5, 10 ], 3);

  const backingArr = cArr._arr.tolist();
  expect(backingArr.length).toBe(1);
  expect(backingArr[0].length).toBe(5 + (2 * cArr._pad));
  expect(backingArr[0][0].length).toBe(10 + (2 * cArr._pad));
});

it('constructs a hypercolumnm, padded backing array', () => {
  const cArr = ConvArray.conv(2, [ 5, 10 ], 3);

  const backingArr = cArr._arr.tolist();
  expect(backingArr.length).toBe(2);
  expect(backingArr[0].length).toBe(5 + (2 * cArr._pad));
  expect(backingArr[0][0].length).toBe(10 + (2 * cArr._pad));
});

it('assigns the area of the bounds', () => {
  const cArr = ConvArray.conv(1, [ 5, 6 ], 3);

  const updateArr = nj.ones([ 1, 3, 4 ], 'float64');
  cArr.assign(updateArr, 0, [ 1, 1, 5, 4 ]);

  const arr = cArr.arr.tolist()[0];
  // console.table(arr);
  // console.table(cArr._arr.tolist()[0]);

  const expectedResult = [
    [0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0],
  ];
  expect(arr).toEqual(expectedResult);
});

it('gets a slice for a conv in the middle', () => {
  const cArr = ConvArray.conv(1, [ 12, 13 ], 3);
  const updateArr = nj.ones([ 1, 3, 2 ], 'float64');
  cArr.assign(updateArr, 0, [ 3, 4, 5, 7 ]);

  const dirtySlice = cArr.dirty.tolist()[0];

  // console.table(cArr.arr.tolist()[0]);
  // console.table(cArr._arr.tolist()[0]);
  // console.table(dirtySlice);

  const expectedResult = [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
  ];
  expect(dirtySlice).toEqual(expectedResult);
});

it('gets a conv slice that includes pad at start and extra pad at end', () => {
  const cArr = ConvArray.conv(1, [ 3, 4 ], 2);
  const updateArr = nj.ones([ 1, 2, 3 ], 'float64');
  cArr.assign(updateArr, 0, [ 1, 1, 4, 3 ]);

  const dirtySlice = cArr.dirty.tolist()[0];

  // console.table(cArr.arr.tolist()[0]);
  // console.table(cArr._arr.tolist()[0]);
  // console.table(dirtySlice);

  const expectedResult = [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0],
  ];
  expect(dirtySlice).toEqual(expectedResult);
});

it('gets a conv slice that includes pad at end and extra pad at start', () => {
  const cArr = ConvArray.conv(1, [ 3, 4 ], 2);
  const updateArr = nj.ones([ 1, 2, 3 ], 'float64');
  cArr.assign(updateArr, 0, [ 0, 0, 3, 2 ]);

  const dirtySlice = cArr.dirty.tolist()[0];

  // console.table(cArr.arr.tolist()[0]);
  // console.table(cArr._arr.tolist()[0]);
  // console.table(dirtySlice);

  const expectedResult = [
    [0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
  ];
  expect(dirtySlice).toEqual(expectedResult);
});

it('gets a conv slice that includes pad at end and extra pad at start with ND array', () => {
  const cArr = ConvArray.conv(2, [ 3, 4 ], 2);
  const updateArr = nj.ones([ 1, 2, 3 ], 'float64');
  cArr.assign(updateArr, 1, [ 0, 0, 3, 2 ]);

  const dirtySlice = cArr.dirty.tolist()[1];

  // console.table(cArr.arr.tolist()[0]);
  // console.table(cArr._arr.tolist()[0]);
  // console.table(dirtySlice);

  const expectedResult = [
    [0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
  ];
  expect(dirtySlice).toEqual(expectedResult);
});

it('gets a pool slice with overflow on x', () => {
  const cArr = ConvArray.pool(1, [ 6, 7 ], 3);
  const updateArr = nj.ones([ 1, 3, 5 ], 'float64');
  cArr.assign(updateArr, 0, [ 0, 0, 5, 3 ]);

  const dirtySlice = cArr.dirty.tolist()[0];

  // console.table(cArr.arr.tolist()[0]);
  // console.table(cArr._arr.tolist()[0]);
  // console.table(dirtySlice);

  const expectedResult = [
    [ 1, 1, 1, 1, 1, 0],
    [ 1, 1, 1, 1, 1, 0],
    [ 1, 1, 1, 1, 1, 0],
  ];
  expect(dirtySlice).toEqual(expectedResult);
});

it('gets a pool slice with underflow and overflow on x', () => {
  const cArr = ConvArray.pool(1, [ 6, 7 ], 3);
  const updateArr = nj.ones([ 1, 3, 3 ], 'float64');
  cArr.assign(updateArr, 0, [ 1, 0, 4, 3 ]);

  const dirtySlice = cArr.dirty.tolist()[0];

  // console.table(cArr.arr.tolist()[0]);
  // console.table(cArr._arr.tolist()[0]);
  // console.table(dirtySlice);

  const expectedResult = [
    [0, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 0, 0],
  ];
  expect(dirtySlice).toEqual(expectedResult);
});

it('gets a pool slice with underflow and overflow on all', () => {
  const cArr = ConvArray.pool(1, [ 6, 7 ], 3);
  const updateArr = nj.ones([ 1, 3, 3 ], 'float64');
  cArr.assign(updateArr, 0, [ 1, 1, 4, 4 ]);

  const dirtySlice = cArr.dirty.tolist()[0];

  // console.table(cArr.arr.tolist()[0]);
  // console.table(cArr._arr.tolist()[0]);
  // console.table(dirtySlice);

  const expectedResult = [
    [0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
  ];
  expect(dirtySlice).toEqual(expectedResult);
});

it('gets a pool slice on even pool size', () => {
  const cArr = ConvArray.pool(1, [ 6, 7 ], 2);
  const updateArr = nj.ones([ 1, 3, 3 ], 'float64');
  cArr.assign(updateArr, 0, [ 1, 1, 4, 4 ]);

  const dirtySlice = cArr.dirty.tolist()[0];

  // console.table(cArr.arr.tolist()[0]);
  // console.table(cArr._arr.tolist()[0]);
  // console.table(dirtySlice);

  const expectedResult = [
    [0, 0, 0, 0],
    [0, 1, 1, 1],
    [0, 1, 1, 1],
    [0, 1, 1, 1],
  ];
  expect(dirtySlice).toEqual(expectedResult);
});

it('resets dirtyBounds after either dirtySlice', () => {
  const cArr = ConvArray.pool(1, [ 4, 4 ], 2);
  const updateArr = nj.ones([ 1, 1, 1 ], 'float64');
  cArr.assign(updateArr, 0, [ 1, 1, 2, 2 ]);
  expect(cArr._dirtyBounds).toBeDefined();
  cArr.clean();
  expect(cArr._dirtyBounds).toBeNull();
  cArr.assign(updateArr, 0, [ 1, 1, 2, 2 ]);
  expect(cArr._dirtyBounds).toBeDefined();
  cArr.clean();
  expect(cArr._dirtyBounds).toBeNull();
});

it('updates the outputs after each layer run when running ConvLayer between ConvArrays', () => {
  const filters0 = [
    [
      [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
    ],
    [
      [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
    ],
    [
      [
        [0, 0, 1],
        [0, 0, 0],
        [1, 0, 0],
      ],
    ],
  ];

  const filters1 = [
    [
      [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
      [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
      [
        [0, 0, 1],
        [0, 0, 0],
        [1, 0, 0],
      ],
    ],
  ];

  const arr0 = ConvArray.conv(1, [ 4, 4 ], 3);
  const arr1 = ConvArray.conv(3, [ 4, 4 ], 3);
  const arr2 = ConvArray.conv(1, [ 4, 4 ], 0);

  const layer0 = new ConvLayer(arr0, arr1, filters0, 3);
  const layer1 = new ConvLayer(arr1, arr2, filters1, 3);

  // create an update, and propogate it through
  const updateArr = nj.ones([ 1, 1, 1], 'float64');
  arr0.assign(updateArr, 0, [ 1, 1, 2, 2 ]);

  // console.log('arr0');
  // arr0.print();
  // console.log('arr1');
  // arr1.print();
  // console.log('arr2');
  // arr2.print();

  // console.log('arr0 dirty');
  // console.table(arr0.dirty.tolist()[0]);

  expect(arr0._dirtyBounds).toEqual([ 1, 1, 2, 2 ]);
  expect(arr0.dirtyBounds).toEqual([ -1, -1, 4, 4 ]);
  expect(arr0.dirty.tolist()[0]).toEqual([
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ]);
  expect(arr1._dirtyBounds).toBeNull();
  expect(arr2._dirtyBounds).toBeNull();

  layer0.run();

  // console.log('arr0');
  // arr0.print();
  // console.log('arr1');
  // arr1.print();
  // console.log('arr2');
  // arr2.print();

  // console.log('arr1 dirty');
  // console.table(arr1.dirty.tolist()[0]);

  expect(arr0._dirtyBounds).toBeNull();
  expect(arr1._dirtyBounds).toEqual([ 0, 0, 3, 3 ]);
  expect(arr1.dirtyBounds).toEqual([ -1, -1, 5, 5 ]);
  expect(arr2._dirtyBounds).toBeNull();

  layer1.run();

  // console.log('arr0');
  // arr0.print();
  // console.log('arr1');
  // arr1.print();
  // console.log('arr2');
  // arr2.print();

  // console.log('arr2 dirty');
  // console.table(arr2.dirty.tolist()[0]);

  expect(arr0._dirtyBounds).toBeNull();
  expect(arr1._dirtyBounds).toBeNull();
  expect(arr2._dirtyBounds).toEqual([ 0, 0, 4, 4 ]);
  expect(arr2.dirtyBounds).toEqual([ 0, 0, 4, 4 ]);
});

it('initializes stats', () => {
  const cArr = ConvArray.pool(3, [ 4, 4 ], 1);

  expect(cArr._ids.tolist()).toEqual([
    [-1, -1, -1, -1],
    [-1, -1, -1, -1],
    [-1, -1, -1, -1],
    [-1, -1, -1, -1],
  ]);
  expect(cArr._max.tolist()).toEqual([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
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

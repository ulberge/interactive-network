import nj from 'numjs';
import { ConvArray, ConvLayer, Network } from './conv';

// it('constructs a padded backing array', () => {
//   const cArr = ConvArray.conv(1, [ 5, 10 ], 3);

//   const backingArr = cArr._arr.tolist();
//   expect(backingArr.length).toBe(1);
//   expect(backingArr[0].length).toBe(5 + (2 * cArr._pad));
//   expect(backingArr[0][0].length).toBe(10 + (2 * cArr._pad));
// });

// it('constructs a hypercolumnm, padded backing array', () => {
//   const cArr = ConvArray.conv(2, [ 5, 10 ], 3);

//   const backingArr = cArr._arr.tolist();
//   expect(backingArr.length).toBe(2);
//   expect(backingArr[0].length).toBe(5 + (2 * cArr._pad));
//   expect(backingArr[0][0].length).toBe(10 + (2 * cArr._pad));
// });

// it('assigns the area of the bounds', () => {
//   const cArr = ConvArray.conv(1, [ 5, 6 ], 3);

//   const updateArr = nj.ones([ 1, 3, 4 ], 'float64');
//   cArr.assign(updateArr, 0, [ 1, 1, 5, 4 ]);

//   const arr = cArr.arr.tolist()[0];
//   // console.table(arr);
//   // console.table(cArr._arr.tolist()[0]);

//   const expectedResult = [
//     [0, 0, 0, 0, 0, 0],
//     [0, 1, 1, 1, 1, 0],
//     [0, 1, 1, 1, 1, 0],
//     [0, 1, 1, 1, 1, 0],
//     [0, 0, 0, 0, 0, 0],
//   ];
//   expect(arr).toEqual(expectedResult);
// });

// it('gets a slice for a conv in the middle', () => {
//   const cArr = ConvArray.conv(1, [ 12, 13 ], 3);
//   const updateArr = nj.ones([ 1, 3, 2 ], 'float64');
//   cArr.assign(updateArr, 0, [ 3, 4, 5, 7 ]);

//   const dirtySlice = cArr.dirty.tolist()[0];

//   // console.table(cArr.arr.tolist()[0]);
//   // console.table(cArr._arr.tolist()[0]);
//   // console.table(dirtySlice);

//   const expectedResult = [
//     [0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0],
//     [0, 0, 1, 1, 0, 0],
//     [0, 0, 1, 1, 0, 0],
//     [0, 0, 1, 1, 0, 0],
//     [0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0],
//   ];
//   expect(dirtySlice).toEqual(expectedResult);
// });

// it('gets a conv slice that includes pad at start and extra pad at end', () => {
//   const cArr = ConvArray.conv(1, [ 3, 4 ], 2);
//   const updateArr = nj.ones([ 1, 2, 3 ], 'float64');
//   cArr.assign(updateArr, 0, [ 1, 1, 4, 3 ]);

//   const dirtySlice = cArr.dirty.tolist()[0];

//   // console.table(cArr.arr.tolist()[0]);
//   // console.table(cArr._arr.tolist()[0]);
//   // console.table(dirtySlice);

//   const expectedResult = [
//     [0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0],
//     [0, 0, 1, 1, 1, 0],
//     [0, 0, 1, 1, 1, 0],
//     [0, 0, 0, 0, 0, 0],
//   ];
//   expect(dirtySlice).toEqual(expectedResult);
// });

// it('gets a conv slice that includes pad at end and extra pad at start', () => {
//   const cArr = ConvArray.conv(1, [ 3, 4 ], 2);
//   const updateArr = nj.ones([ 1, 2, 3 ], 'float64');
//   cArr.assign(updateArr, 0, [ 0, 0, 3, 2 ]);

//   const dirtySlice = cArr.dirty.tolist()[0];

//   // console.table(cArr.arr.tolist()[0]);
//   // console.table(cArr._arr.tolist()[0]);
//   // console.table(dirtySlice);

//   const expectedResult = [
//     [0, 0, 0, 0, 0, 0],
//     [0, 1, 1, 1, 0, 0],
//     [0, 1, 1, 1, 0, 0],
//     [0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0],
//   ];
//   expect(dirtySlice).toEqual(expectedResult);
// });

// it('gets a conv slice that includes pad at end and extra pad at start with ND array', () => {
//   const cArr = ConvArray.conv(2, [ 3, 4 ], 2);
//   const updateArr = nj.ones([ 1, 2, 3 ], 'float64');
//   cArr.assign(updateArr, 1, [ 0, 0, 3, 2 ]);

//   const dirtySlice = cArr.dirty.tolist()[1];

//   // console.table(cArr.arr.tolist()[0]);
//   // console.table(cArr._arr.tolist()[0]);
//   // console.table(dirtySlice);

//   const expectedResult = [
//     [0, 0, 0, 0, 0, 0],
//     [0, 1, 1, 1, 0, 0],
//     [0, 1, 1, 1, 0, 0],
//     [0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0],
//   ];
//   expect(dirtySlice).toEqual(expectedResult);
// });

// it('gets a pool slice with overflow on x', () => {
//   const cArr = ConvArray.pool(1, [ 6, 7 ], 3);
//   const updateArr = nj.ones([ 1, 3, 5 ], 'float64');
//   cArr.assign(updateArr, 0, [ 0, 0, 5, 3 ]);

//   const dirtySlice = cArr.dirty.tolist()[0];

//   // console.table(cArr.arr.tolist()[0]);
//   // console.table(cArr._arr.tolist()[0]);
//   // console.table(dirtySlice);

//   const expectedResult = [
//     [ 1, 1, 1, 1, 1, 0],
//     [ 1, 1, 1, 1, 1, 0],
//     [ 1, 1, 1, 1, 1, 0],
//   ];
//   expect(dirtySlice).toEqual(expectedResult);
// });

// it('gets a pool slice with underflow and overflow on x', () => {
//   const cArr = ConvArray.pool(1, [ 6, 7 ], 3);
//   const updateArr = nj.ones([ 1, 3, 3 ], 'float64');
//   cArr.assign(updateArr, 0, [ 1, 0, 4, 3 ]);

//   const dirtySlice = cArr.dirty.tolist()[0];

//   // console.table(cArr.arr.tolist()[0]);
//   // console.table(cArr._arr.tolist()[0]);
//   // console.table(dirtySlice);

//   const expectedResult = [
//     [0, 1, 1, 1, 0, 0],
//     [0, 1, 1, 1, 0, 0],
//     [0, 1, 1, 1, 0, 0],
//   ];
//   expect(dirtySlice).toEqual(expectedResult);
// });

// it('gets a pool slice with underflow and overflow on all', () => {
//   const cArr = ConvArray.pool(1, [ 6, 7 ], 3);
//   const updateArr = nj.ones([ 1, 3, 3 ], 'float64');
//   cArr.assign(updateArr, 0, [ 1, 1, 4, 4 ]);

//   const dirtySlice = cArr.dirty.tolist()[0];

//   // console.table(cArr.arr.tolist()[0]);
//   // console.table(cArr._arr.tolist()[0]);
//   // console.table(dirtySlice);

//   const expectedResult = [
//     [0, 0, 0, 0, 0, 0],
//     [0, 1, 1, 1, 0, 0],
//     [0, 1, 1, 1, 0, 0],
//     [0, 1, 1, 1, 0, 0],
//     [0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0],
//   ];
//   expect(dirtySlice).toEqual(expectedResult);
// });

// it('gets a pool slice on even pool size', () => {
//   const cArr = ConvArray.pool(1, [ 6, 7 ], 2);
//   const updateArr = nj.ones([ 1, 3, 3 ], 'float64');
//   cArr.assign(updateArr, 0, [ 1, 1, 4, 4 ]);

//   const dirtySlice = cArr.dirty.tolist()[0];

//   // console.table(cArr.arr.tolist()[0]);
//   // console.table(cArr._arr.tolist()[0]);
//   // console.table(dirtySlice);

//   const expectedResult = [
//     [0, 0, 0, 0],
//     [0, 1, 1, 1],
//     [0, 1, 1, 1],
//     [0, 1, 1, 1],
//   ];
//   expect(dirtySlice).toEqual(expectedResult);
// });

// it('resets dirtyBounds after either dirtySlice', () => {
//   const cArr = ConvArray.pool(1, [ 4, 4 ], 2);
//   const updateArr = nj.ones([ 1, 1, 1 ], 'float64');
//   cArr.assign(updateArr, 0, [ 1, 1, 2, 2 ]);
//   expect(cArr._dirtyBounds).toBeDefined();
//   cArr.clean();
//   expect(cArr._dirtyBounds).toBeNull();
//   cArr.assign(updateArr, 0, [ 1, 1, 2, 2 ]);
//   expect(cArr._dirtyBounds).toBeDefined();
//   cArr.clean();
//   expect(cArr._dirtyBounds).toBeNull();
// });

// function are2DArraysClose(result, expected) {
//   expect(result.length).toBe(expected.length);
//   expect(result[0].length).toBe(expected[0].length);
//   result.forEach((row, y) => row.forEach((v, x) => expect(v).toBeCloseTo(expected[y][x])));
// }

// it('updates the outputs end-to-end when running ConvLayers and MaxPoolLayers between ConvArrays', () => {
//   const filters0 = [
//     [
//       [
//         [1, 1, 1],
//         [1, 1, 1],
//         [1, 1, 1],
//       ],
//     ],
//     [
//       [
//         [10, 10, 10],
//         [10, 10, 10],
//         [10, 10, 10],
//       ],
//     ],
//     [
//       [
//         [100, 100, 100],
//         [100, 100, 100],
//         [100, 100, 100],
//       ],
//     ],
//   ];

//   const filters2 = [
//     [
//       [
//         [1, 1, 1],
//         [1, 1, 1],
//         [1, 1, 1],
//       ],
//       [
//         [10, 10, 10],
//         [10, 10, 10],
//         [10, 10, 10],
//       ],
//       [
//         [100, 100, 100],
//         [100, 100, 100],
//         [100, 100, 100],
//       ],
//     ],
//   ];

//   const inputShape = [ 10, 10 ];
//   const layerInfos = [
//     { type: 'conv2d', kernelSize: 3, filters: filters0 },
//     { type: 'maxPool2d', poolSize: 3 },
//     { type: 'conv2d', kernelSize: 3, filters: filters2 },
//   ];
//   const network = new Network(inputShape, layerInfos);

//   // inits the arrs and layers correctly
//   // console.log('arr0');
//   // network.arrs[0].print();
//   // console.log('arr1');
//   // network.arrs[1].print();
//   // console.log('arr2');
//   // network.arrs[2].print();
//   // console.log('arr3');
//   // network.arrs[3].print();

//   expect(network.arrs[0]._dirtyBounds).toBeNull();
//   expect(network.arrs[1]._dirtyBounds).toBeNull();
//   expect(network.arrs[2]._dirtyBounds).toBeNull();
//   expect(network.arrs[3]._dirtyBounds).toBeNull();

//   // check visible arrays
//   expect(network.arrs[0].arr.shape).toEqual([ 1, 10, 10 ]);
//   expect(network.arrs[1].arr.shape).toEqual([ 3, 10, 10 ]);
//   expect(network.arrs[2].arr.shape).toEqual([ 3, 4, 4 ]);
//   expect(network.arrs[3].arr.shape).toEqual([ 1, 4, 4 ]);

//   // check backing arrays
//   expect(network.arrs[0]._arr.shape).toEqual([ 1, 12, 12 ]);
//   expect(network.arrs[1]._arr.shape).toEqual([ 3, 10, 10 ]);
//   expect(network.arrs[2]._arr.shape).toEqual([ 3, 6, 6 ]);
//   expect(network.arrs[3]._arr.shape).toEqual([ 1, 4, 4 ]);

//   // create an update, and propogate it through
//   const updateArr = nj.ones([ 1, 3, 6], 'float64');
//   network.run(updateArr, [ 1, 1, 7, 4 ]);

//   // console.log('arr0');
//   // network.arrs[0].print();
//   // console.log('arr1');
//   // network.arrs[1].print();
//   // console.log('arr2');
//   // network.arrs[2].print();
//   // console.log('arr3');
//   // network.arrs[3].print();

//   // should be clean again
//   expect(network.arrs[0]._dirtyBounds).toBeNull();
//   expect(network.arrs[1]._dirtyBounds).toBeNull();
//   expect(network.arrs[2]._dirtyBounds).toBeNull();
//   expect(network.arrs[3]._dirtyBounds).toEqual([ 0, 0, 4, 3 ]);

//   // final layer should have correct output
//   are2DArraysClose(network.arrs[3].arr.tolist()[0], [
//     [303030, 404040, 252525, 101010],
//     [303030, 404040, 252525, 101010],
//     [121212, 161616, 101010, 40404],
//     [0, 0, 0, 0],
//   ]);
// });

// it('correctly updates when update in top right corner', () => {
//   const filters0 = [
//     [
//       [
//         [1, 1, 1],
//         [1, 1, 1],
//         [1, 1, 1],
//       ],
//     ],
//     [
//       [
//         [10, 10, 10],
//         [10, 10, 10],
//         [10, 10, 10],
//       ],
//     ],
//     [
//       [
//         [100, 100, 100],
//         [100, 100, 100],
//         [100, 100, 100],
//       ],
//     ],
//   ];

//   const filters2 = [
//     [
//       [
//         [1, 1, 1],
//         [1, 1, 1],
//         [1, 1, 1],
//       ],
//       [
//         [10, 10, 10],
//         [10, 10, 10],
//         [10, 10, 10],
//       ],
//       [
//         [100, 100, 100],
//         [100, 100, 100],
//         [100, 100, 100],
//       ],
//     ],
//   ];

//   const inputShape = [ 10, 10 ];
//   const layerInfos = [
//     { type: 'conv2d', kernelSize: 3, filters: filters0 },
//     { type: 'maxPool2d', poolSize: 3 },
//     { type: 'conv2d', kernelSize: 3, filters: filters2 },
//   ];
//   const network = new Network(inputShape, layerInfos);

//   // create an update, and propogate it through
//   const updateArr = nj.ones([ 1, 3, 6], 'float64');
//   network.run(updateArr, [ 3, 6, 9, 9 ]);

//   // console.log('arr0');
//   // network.arrs[0].print();
//   // console.log('arr1');
//   // network.arrs[1].print();
//   // console.log('arr2');
//   // network.arrs[2].print();
//   // console.log('arr3');
//   // network.arrs[3].print();

//   // should be clean again
//   expect(network.arrs[0]._dirtyBounds).toBeNull();
//   expect(network.arrs[1]._dirtyBounds).toBeNull();
//   expect(network.arrs[2]._dirtyBounds).toBeNull();
//   expect(network.arrs[3]._dirtyBounds).toEqual([ 0, 0, 4, 4 ]);

//   // final layer should have correct output
//   are2DArraysClose(network.arrs[3].arr.tolist()[0], [
//     [40404, 70707, 70707, 40404],
//     [161616, 282828, 282828, 161616],
//     [202020, 353535, 353535, 202020],
//     [161616, 282828, 282828, 161616],
//   ]);
// });

// it('updates the outputs after each layer run when running ConvLayer between ConvArrays', () => {
//   const filters0 = [
//     [
//       [
//         [0, 0, 0],
//         [0, 1, 0],
//         [0, 0, 1],
//       ],
//     ],
//     [
//       [
//         [1, 0, 0],
//         [0, 1, 0],
//         [0, 0, 1],
//       ],
//     ],
//     [
//       [
//         [0, 0, 1],
//         [0, 0, 0],
//         [1, 0, 0],
//       ],
//     ],
//   ];

//   const filters1 = [
//     [
//       [
//         [0, 0, 0],
//         [0, 1, 0],
//         [0, 0, 1],
//       ],
//       [
//         [1, 0, 0],
//         [0, 1, 0],
//         [0, 0, 1],
//       ],
//       [
//         [0, 0, 1],
//         [0, 0, 0],
//         [1, 0, 0],
//       ],
//     ],
//   ];

//   const arr0 = ConvArray.conv(1, [ 4, 4 ], 3);
//   const arr1 = ConvArray.conv(3, [ 4, 4 ], 3);
//   const arr2 = ConvArray.conv(1, [ 4, 4 ], 0);

//   const layer0 = new ConvLayer(arr0, arr1, filters0, 3);
//   const layer1 = new ConvLayer(arr1, arr2, filters1, 3);

//   // create an update, and propogate it through
//   const updateArr = nj.ones([ 1, 1, 1], 'float64');
//   arr0.assign(updateArr, 0, [ 1, 1, 2, 2 ]);

//   // console.log('arr0');
//   // arr0.print();
//   // console.log('arr1');
//   // arr1.print();
//   // console.log('arr2');
//   // arr2.print();

//   // console.log('arr0 dirty');
//   // console.table(arr0.dirty.tolist()[0]);

//   expect(arr0._dirtyBounds).toEqual([ 1, 1, 2, 2 ]);
//   expect(arr0.dirtyBounds).toEqual([ -1, -1, 4, 4 ]);
//   expect(arr0.dirty.tolist()[0]).toEqual([
//     [0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0],
//     [0, 0, 1, 0, 0],
//     [0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0],
//   ]);
//   expect(arr1._dirtyBounds).toBeNull();
//   expect(arr2._dirtyBounds).toBeNull();

//   layer0.run();

//   // console.log('arr0');
//   // arr0.print();
//   // console.log('arr1');
//   // arr1.print();
//   // console.log('arr2');
//   // arr2.print();

//   // console.log('arr1 dirty');
//   // console.table(arr1.dirty.tolist()[0]);

//   expect(arr0._dirtyBounds).toBeNull();
//   expect(arr1._dirtyBounds).toEqual([ 0, 0, 3, 3 ]);
//   expect(arr1.dirtyBounds).toEqual([ -1, -1, 5, 5 ]);
//   expect(arr2._dirtyBounds).toBeNull();

//   layer1.run();

//   // console.log('arr0');
//   // arr0.print();
//   // console.log('arr1');
//   // arr1.print();
//   // console.log('arr2');
//   // arr2.print();

//   // console.log('arr2 dirty');
//   // console.table(arr2.dirty.tolist()[0]);

//   expect(arr0._dirtyBounds).toBeNull();
//   expect(arr1._dirtyBounds).toBeNull();
//   expect(arr2._dirtyBounds).toEqual([ 0, 0, 4, 4 ]);
//   expect(arr2.dirtyBounds).toEqual([ 0, 0, 4, 4 ]);
// });

// it('calcs stats after update', () => {
//   const cArr = ConvArray.pool(3, [ 4, 4 ], 1);

//   cArr.assign(nj.ones([ 1, 2, 2 ]), 0, [ 1, 1, 3, 3 ]);
//   cArr.assign(nj.ones([ 1, 2, 2 ]).assign(3), 1, [ 1, 1, 3, 3 ]);
//   cArr.assign(nj.ones([ 1, 2, 2 ]).assign(2), 2, [ 1, 1, 3, 3 ]);

//   // console.table(cArr._ids.tolist());
//   // console.table(cArr._max.tolist());
//   expect(cArr._dirtyBounds).toEqual([ 1, 1, 3, 3 ]);
//   expect(cArr._ids.tolist()).toEqual([
//     [-1, -1, -1, -1],
//     [-1, -1, -1, -1],
//     [-1, -1, -1, -1],
//     [-1, -1, -1, -1],
//   ]);
//   expect(cArr._max.tolist()).toEqual([
//     [0, 0, 0, 0],
//     [0, 0, 0, 0],
//     [0, 0, 0, 0],
//     [0, 0, 0, 0],
//   ]);

//   cArr.calcStats();

//   // console.table(cArr._ids.tolist());
//   // console.table(cArr._max.tolist());
//   expect(cArr._ids.tolist()).toEqual([
//     [-1, -1, -1, -1],
//     [-1, 0, 0, -1],
//     [-1, 0, 0, -1],
//     [-1, -1, -1, -1],
//   ]);
//   expect(cArr._max.tolist()).toEqual([
//     [0, 0, 0, 0],
//     [0, 3, 3, 0],
//     [0, 3, 3, 0],
//     [0, 0, 0, 0],
//   ]);
// });

window.HTMLCanvasElement.prototype.getContext = () => {};

// speed test
it('updates efficiently', () => {
  const n0 = 80;
  const n = 10;
  const sparse = 4;
  const canvas = [ 2000, 2000 ];
  const ks0 = 11;
  const ks = 9;

  const kernel0 = new Array(ks0).fill(0).map(v => new Array(ks0).fill(1));
  const kernel = new Array(ks).fill(0).map(v => new Array(ks).fill(1));

  const filters0 = new Array(n0).fill(0).map(v => [kernel0]);
  const filters2 = new Array(n).fill(0).map(v => [ ...new Array(sparse).fill(0).map(v => kernel), ...new Array(n0 - sparse).fill(null) ]);
  const filters4 = new Array(n).fill(0).map(v => [ ...new Array(sparse).fill(0).map(v => kernel), ...new Array(n - sparse).fill(null) ]);
  const filters5 = [ new Array(n).fill(0).map(v => kernel) ];

  const inputShape = canvas;
  const layerInfos = [
    { type: 'conv2d', kernelSize: ks0, filters: filters0 },
    { type: 'maxPool2d', poolSize: 6 },
    { type: 'conv2d', kernelSize: ks, filters: filters2 },
    { type: 'maxPool2d', poolSize: 3 },
    { type: 'conv2d', kernelSize: ks, filters: filters4 },
    { type: 'conv2d', kernelSize: ks, filters: filters5 },
  ];

  const t0 = Date.now();
  const network = new Network(inputShape, layerInfos);
  const t1 = Date.now();
  console.log(t1 - t0);
  for (let i = 0; i < 10; i++) {
    const updateArr = nj.ones([ 1, 3, 6], 'float64');
    network.run(updateArr, [ 43, 46, 49, 49 ]);
  }
  const t2 = Date.now();
  console.log('avg time', (t2 - t1) / 10);
});


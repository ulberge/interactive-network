import nj from 'numjs';
import Network from './network';
window.HTMLCanvasElement.prototype.getContext = () => {};

function are2DArraysClose(result, expected) {
  expect(result.length).toBe(expected.length);
  expect(result[0].length).toBe(expected[0].length);
  result.forEach((row, y) => row.forEach((v, x) => expect(v).toBeCloseTo(expected[y][x])));
}

it('updates the outputs end-to-end when running ConvLayers and MaxPoolLayers between ConvArrays', () => {
  const filters0 = [
    [
      [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
      ],
    ],
    [
      [
        [10, 10, 10],
        [10, 10, 10],
        [10, 10, 10],
      ],
    ],
    [
      [
        [100, 100, 100],
        [100, 100, 100],
        [100, 100, 100],
      ],
    ],
  ];

  const filters2 = [
    [
      [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
      ],
      [
        [10, 10, 10],
        [10, 10, 10],
        [10, 10, 10],
      ],
      [
        [100, 100, 100],
        [100, 100, 100],
        [100, 100, 100],
      ],
    ],
  ];

  const inputShape = [ 10, 10 ];
  const layerInfos = [
    { type: 'conv2d', kernelSize: 3, filters: filters0 },
    { type: 'maxPool2d', poolSize: 3 },
    { type: 'conv2d', kernelSize: 3, filters: filters2 },
  ];
  const network = new Network(inputShape, layerInfos);

  // inits the arrs and layers correctly
  // console.log('arr0');
  // network.arrs[0].print();
  // console.log('arr1');
  // network.arrs[1].print();
  // console.log('arr2');
  // network.arrs[2].print();
  // console.log('arr3');
  // network.arrs[3].print();

  expect(network.arrs[0]._dirtyBounds).toBeNull();
  expect(network.arrs[1]._dirtyBounds).toBeNull();
  expect(network.arrs[2]._dirtyBounds).toBeNull();
  expect(network.arrs[3]._dirtyBounds).toBeNull();

  // check visible arrays
  expect(network.arrs[0].arr.shape).toEqual([ 1, 10, 10 ]);
  expect(network.arrs[1].arr.shape).toEqual([ 3, 10, 10 ]);
  expect(network.arrs[2].arr.shape).toEqual([ 3, 4, 4 ]);
  expect(network.arrs[3].arr.shape).toEqual([ 1, 4, 4 ]);

  // check backing arrays
  expect(network.arrs[0]._arr.shape).toEqual([ 1, 12, 12 ]);
  expect(network.arrs[1]._arr.shape).toEqual([ 3, 12, 12 ]);
  expect(network.arrs[2]._arr.shape).toEqual([ 3, 6, 6 ]);
  expect(network.arrs[3]._arr.shape).toEqual([ 1, 4, 4 ]);

  // create an update, and propogate it through
  const updateArr = nj.ones([ 1, 3, 6], 'float64');
  network.run(updateArr, [ 1, 1, 7, 4 ]);

  // console.log('arr0');
  // network.arrs[0].print();
  // console.log('arr1');
  // network.arrs[1].print();
  // console.log('arr2');
  // network.arrs[2].print();
  // console.log('arr3');
  // network.arrs[3].print();

  // should be clean again
  expect(network.arrs[0]._dirtyBounds).toBeNull();
  expect(network.arrs[1]._dirtyBounds).toBeNull();
  expect(network.arrs[2]._dirtyBounds).toBeNull();
  expect(network.arrs[3]._dirtyBounds).toBeNull();

  // final layer should have correct output
  are2DArraysClose(network.arrs[3].arr.tolist()[0], [
    [303030, 404040, 252525, 101010],
    [303030, 404040, 252525, 101010],
    [121212, 161616, 101010, 40404],
    [0, 0, 0, 0],
  ]);
});

it('correctly updates when update in top right corner', () => {
  const filters0 = [
    [
      [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
      ],
    ],
    [
      [
        [10, 10, 10],
        [10, 10, 10],
        [10, 10, 10],
      ],
    ],
    [
      [
        [100, 100, 100],
        [100, 100, 100],
        [100, 100, 100],
      ],
    ],
  ];

  const filters2 = [
    [
      [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
      ],
      [
        [10, 10, 10],
        [10, 10, 10],
        [10, 10, 10],
      ],
      [
        [100, 100, 100],
        [100, 100, 100],
        [100, 100, 100],
      ],
    ],
  ];

  const inputShape = [ 10, 10 ];
  const layerInfos = [
    { type: 'conv2d', kernelSize: 3, filters: filters0 },
    { type: 'maxPool2d', poolSize: 3 },
    { type: 'conv2d', kernelSize: 3, filters: filters2 },
  ];
  const network = new Network(inputShape, layerInfos);

  // create an update, and propogate it through
  const updateArr = nj.ones([ 1, 3, 6], 'float32p');
  network.run(updateArr, [ 3, 6, 9, 9 ]);

  // console.log('arr0');
  // network.arrs[0].print();
  // console.log('arr1');
  // network.arrs[1].print();
  // network.arrs[1].printBacking();
  // console.log('arr2');
  // network.arrs[2].print();
  // network.arrs[2].printBacking();
  // console.log('arr3');
  // network.arrs[3].print();

  // should be clean again
  expect(network.arrs[0]._dirtyBounds).toBeNull();
  expect(network.arrs[1]._dirtyBounds).toBeNull();
  expect(network.arrs[2]._dirtyBounds).toBeNull();
  expect(network.arrs[3]._dirtyBounds).toBeNull();

  // final layer should have correct output
  are2DArraysClose(network.arrs[3].arr.tolist()[0], [
    [40404, 70707, 70707, 40404],
    [161616, 282828, 282828, 161616],
    [202020, 353535, 353535, 202020],
    [161616, 282828, 282828, 161616],
  ]);
});

// // speed test
// it('updates efficiently', () => {
//   const n0 = 80;
//   const n = 10;
//   const sparse = 4;
//   const canvas = [ 2000, 2000 ];
//   const ks0 = 11;
//   const ks = 9;

//   const kernel0 = new Array(ks0).fill(0).map(v => new Array(ks0).fill(1));
//   const kernel = new Array(ks).fill(0).map(v => new Array(ks).fill(1));

//   const filters0 = new Array(n0).fill(0).map(v => [kernel0]);
//   const filters2 = new Array(n).fill(0).map(v => [ ...new Array(sparse).fill(0).map(v => kernel), ...new Array(n0 - sparse).fill(null) ]);
//   const filters4 = new Array(n).fill(0).map(v => [ ...new Array(sparse).fill(0).map(v => kernel), ...new Array(n - sparse).fill(null) ]);
//   const filters5 = [ new Array(n).fill(0).map(v => kernel) ];

//   const inputShape = canvas;
//   const layerInfos = [
//     { type: 'conv2d', kernelSize: ks0, filters: filters0 },
//     { type: 'maxPool2d', poolSize: 6 },
//     { type: 'conv2d', kernelSize: ks, filters: filters2 },
//     { type: 'maxPool2d', poolSize: 3 },
//     { type: 'conv2d', kernelSize: ks, filters: filters4 },
//     { type: 'conv2d', kernelSize: ks, filters: filters5 },
//   ];

//   const t0 = Date.now();
//   const network = new Network(inputShape, layerInfos);
//   const t1 = Date.now();
//   console.log(t1 - t0);
//   for (let i = 0; i < 10; i++) {
//     const updateArr = nj.ones([ 1, 3, 6], 'float64');
//     network.run(updateArr, [ 43, 46, 49, 49 ]);
//   }
//   const t2 = Date.now();
//   console.log('avg time', (t2 - t1) / 10);
// });

import Network from './network';
import { getEmpty2DArray } from './helpers';
import { getKernels } from './kernel';

const network = getBoxNetwork0();

const imgArr = getEmpty2DArray(18, 20, 0);
imgArr[8][8] = 1;
imgArr[9][8] = 1;
imgArr[10][8] = 1;
imgArr[11][8] = 1;

// it('calculates acts for the network for an img array for the first layer', () => {
//   const result = network.getActsFromChannels(channels, 0, 0);

//   // console.table(result);

//   expect(result.length).toBe(18);
//   expect(result[0].length).toBe(20);
// });

it('calculates acts for the network for an img array for the first layer', () => {
  const result = network.getActsFromImgArr(imgArr, 0, 0);

  // console.table(result);

  expect(result.length).toBe(18);
  expect(result[0].length).toBe(20);
});

it('calculates acts for the network for an img array for the second layer', () => {
  const result = network.getActsFromImgArr(imgArr, 1, 0);

  // console.table(result);

  expect(result.length).toBe(9);
  expect(result[0].length).toBe(10);
});

it('calculates acts for the network for an img array for the third layer', () => {

  const result = network.getActsFromImgArr(imgArr, 2, 0);

  // console.table(result);

  expect(result.length).toBe(9);
  expect(result[0].length).toBe(10);
});

it('inverts the network and produces a shadow', () => {
  const shadow = network.getShadow(2, 0);

  // console.table(shadow.map(row => row.map(col => col > 0 ? Number(col.toFixed(3)) : 0)));

  expect(shadow.length).toBe(18);
  expect(shadow[0].length).toBe(18);
});

it('initializes the shadow array', () => {
  const padding = 2;
  const numChannels = 2;
  const channelIndex = 1;
  const result = Network.getInitShadowArray(padding, numChannels, channelIndex);
  const expectedResult = [
    [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 1], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
  ];
  // console.table(result);
  expect(result).toEqual(expectedResult);
});

function getBoxNetwork0() {
  const defaultKernel = getEmpty2DArray(9, 9, 0);

  const filters = [
    [
      [ // vert
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0, 0, 1, 0],
        [0, 1, 0, 0, 0, 0, 0, 1, 0],
        [0, 1, 0, 0, 0, 0, 0, 1, 0],
        [0, 1, 0, 0, 0, 0, 0, 1, 0],
        [0, 1, 0, 0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      [ // hor
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      [ // 8: top left corner
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 10, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      [ // 12: top right corner
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 10, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      [ // 16: bottom right corner
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 10, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      [ // 20: bottom left corner
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 10, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      defaultKernel,
      defaultKernel,
      defaultKernel,
      defaultKernel,
    ],
  ];

  const layers = [
    {
      type: 'maxPool2d',
      poolSize: 2
    },
    {
      type: 'conv2d',
      filters
    }
  ];

  const kernelSettings = {
    numComponents: 1, // power of 2
    lambda: 4.3,
    sigma: 3.5,
    windowSize: 5
  };
  const { numComponents, lambda, sigma, windowSize } = kernelSettings;
  const kernels = getKernels(windowSize, 2 ** numComponents, lambda, sigma);

  const network = new Network(kernels, layers);

  return network;
}

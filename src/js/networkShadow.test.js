import { getShadows } from './networkShadow';


it('calculates acts for the network for an img array for the first layer', () => {
  const layerInfos = getLayerInfos();
  const results = getShadows(layerInfos);

  // results.map(layer => layer.map(channelShadow => console.table(channelShadow)));

  expect(results[0][0]).toEqual([
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0]
  ]);
  expect(results[0][1]).toEqual([
    [0, 0, 0],
    [0, 0, 0],
    [1, 0, 1]
  ]);

  expect(results[1][0]).toEqual([
    [0, 1, 1, 1, 0],
    [0, 2, 2, 2, 0],
    [0, 3, 3, 3, 0],
    [0, 2, 2, 2, 0],
    [0, 1, 1, 1, 0],
  ]);
});

function getLayerInfos() {

  const filters0 = [
    [
      [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
      ]
    ],
    [
      [
        [-1, -1, -1],
        [-1, -1, -1],
        [1, 0, 1],
      ]
    ],
  ];

  const filters2 = [
    [
      [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 0, 0, 0, 1, 1, 0],
        [0, 1, 1, 0, 0, 0, 1, 1, 0],
        [0, 1, 1, 0, 0, 0, 1, 1, 0],
        [0, 1, 1, 0, 0, 0, 1, 1, 0],
        [0, 1, 1, 0, 0, 0, 1, 1, 0],
        [0, 1, 1, 0, 0, 0, 1, 1, 0],
        [0, 1, 1, 0, 0, 0, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
    ],
  ];

  const layerInfos = [
    {
      type: 'conv2d',
      kernelSize: 4,
      filters: filters0
    },
    {
      type: 'maxPool2d',
      poolSize: 3
    },
    {
      type: 'conv2d',
      kernelSize: 9,
      filters: filters2
    }
  ];

  return layerInfos;
}

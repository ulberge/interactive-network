import nj from 'numjs';

function reflectY(arr2d) {
  arr2d.forEach(row => row.reverse());
  return arr2d;
}
function reflectX(arr2d) {
  arr2d.reverse();
  return arr2d;
}
function rot90(arr2d) {
  return nj.rot90(nj.array(arr2d)).tolist();
}

export function getNetworkSettings() {
  const layer1Size = 7;
  const layer1DefaultKernel = nj.zeros([layer1Size, layer1Size]).tolist();
  const c = 3;

  const filters = [
    [
      [ // vert
        [-1,-1, 0, 0,-1,-1, 0],
        [-1,-1, 1, 0,-1,-1, 0],
        [-1,-1, 1, 0,-1,-1, 0],
        [-1,-1, 1, 0,-1,-1, 0],
        [-1,-1, 0, 0,-1,-1, 0],
        [-3,-3,-3,-3,-1,-1, 0],
        [-1,-1,-1,-1,-1,-1, 0],
      ],
      layer1DefaultKernel.slice(),
      [ // hor
        [ 0, 0, 0, 0, 0, 0, 0],
        [-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1],
        [-1,-3, 0, 0, 0, 0, 0],
        [-1,-3, 0, 1, 1, 1, 0],
        [-1,-3,-1,-1,-1,-1,-1],
        [-1,-3,-1,-1,-1,-1,-1],
      ],
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      [ // bottomleft corner
        [ 0, 0, 0, 0, 0, 0, 0],
        [-1,-1,-1,-1,-1,-1, 0],
        [-1,-1,-1,-1,-1,-1, 0],
        [-1,-1, 0, 0,-1,-1, 0],
        [-1,-1, c, 0,-1,-1, 0],
        [-1,-1,-1,-1,-1,-1, 0],
        [-1,-1,-1,-1,-1,-1, 0],
      ],
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
    ],
    [
      reflectY([ // vert
        [-1,-1, 0, 0,-1,-1, 0],
        [-1,-1, 1, 0,-1,-1, 0],
        [-1,-1, 1, 0,-1,-1, 0],
        [-1,-1, 1, 0,-1,-1, 0],
        [-1,-1, 0, 0,-1,-1, 0],
        [-3,-3,-3,-3,-1,-1, 0],
        [-1,-1,-1,-1,-1,-1, 0],
      ]),
      layer1DefaultKernel.slice(),
      reflectY([ // hor
        [ 0, 0, 0, 0, 0, 0, 0],
        [-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1],
        [-1,-3, 0, 0, 0, 0, 0],
        [-1,-3, 0, 1, 1, 1, 0],
        [-1,-3,-1,-1,-1,-1,-1],
        [-1,-3,-1,-1,-1,-1,-1],
      ]),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      reflectY([ // bottomright corner
        [ 0, 0, 0, 0, 0, 0, 0],
        [-1,-1,-1,-1,-1,-1, 0],
        [-1,-1,-1,-1,-1,-1, 0],
        [-1,-1, 0, 0,-1,-1, 0],
        [-1,-1, c, 0,-1,-1, 0],
        [-1,-1,-1,-1,-1,-1, 0],
        [-1,-1,-1,-1,-1,-1, 0],
      ]),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
    ],
    [
      [ // vert
        [-1,-1,-1,-1,-1,-1, 0],
        [-1,-1,-1,-1,-1,-1, 0],
        [-1,-1,-5,-1,-1,-1, 0],
        [-1,-1, 0, 0,-1,-1, 0],
        [-1,-1, 1, 0,-1,-1, 0],
        [-1,-1, 1, 0,-1,-1, 0],
        [-1,-1, 0, 0,-1,-1, 0],
      ],
      [ // diag to right
        [ 0, 0,-1,-1,.5, 0,-1],
        [ 0,-1,-1,.5, 1,.5,-1],
        [-1,-1,.5, 1,.5,-1,-1],
        [-1,-1, 0,.5,-1,-1,-1],
        [-1,-5,-1,-1,-1,-1, 0],
        [-1,-1,-1,-1,-1, 0, 0],
        [ 0, 0, 0, 0, 0, 0, 0],
      ],
      layer1DefaultKernel.slice(),
      [
        [-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1],
        [ 0, 0, 0, 0, 0, 0, 0],
        [ 0, 0, 0, 0, 0, 0, 0],
        [ 0, 0, 0, 0, 0, 0, 0],
      ],
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      [ // left hip
        [-1,-1,-1,-1,-1,-1, 0],
        [-1,-1,-1,-1,-1,-1, 0],
        [-1,-1, 0, 0,-1,-1, 0],
        [-1,-1, c, 0,-1,-1, 0],
        [-1,-1,-1,-1,-1,-1, 0],
        [-1,-1,-1,-1,-1,-1, 0],
        [ 0, 0, 0, 0, 0, 0, 0],
      ],
      layer1DefaultKernel.slice(),
    ],
    [
      reflectY([ // vert
        [-1,-1,-1,-1,-1,-1, 0],
        [-1,-1,-1,-1,-1,-1, 0],
        [-1,-1,-5,-1,-1,-1, 0],
        [-1,-1, 0, 0,-1,-1, 0],
        [-1,-1, 1, 0,-1,-1, 0],
        [-1,-1, 1, 0,-1,-1, 0],
        [-1,-1, 0, 0,-1,-1, 0],
      ]),
      [
        [-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1],
        [ 0, 0, 0, 0, 0, 0, 0],
        [ 0, 0, 0, 0, 0, 0, 0],
        [ 0, 0, 0, 0, 0, 0, 0],
      ],
      layer1DefaultKernel.slice(),
      reflectY([ // diag to left
        [ 0, 0,-1,-1,.5, 0,-1],
        [ 0,-1,-1,.5, 1,.5,-1],
        [-1,-1,.5, 1,.5,-1,-1],
        [-1,-1, 0,.5,-1,-1,-1],
        [-1,-5,-1,-1,-1,-1, 0],
        [-1,-1,-1,-1,-1, 0, 0],
        [ 0, 0, 0, 0, 0, 0, 0],
      ]),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      reflectY([ // right hip
        [-1,-1,-1,-1,-1,-1, 0],
        [-1,-1,-1,-1,-1,-1, 0],
        [-1,-1, 0, 0,-1,-1, 0],
        [-1,-1, c, 0,-1,-1, 0],
        [-1,-1,-1,-1,-1,-1, 0],
        [-1,-1,-1,-1,-1,-1, 0],
        [ 0, 0, 0, 0, 0, 0, 0],
      ]),
    ],
    [
      layer1DefaultKernel.slice(),
      [ // diag to right
        [ 0, 0, 0, 0, 0, 0, 0],
        [-1,-1,-1,-1,-5,-1,-1],
        [-1,-1,.5, 0,-1,-1,-1],
        [-1,.5, 1,.5,-1,-1,-1],
        [.5, 1,.5,-1,-1,-1,-1],
        [ 0,.5,-1,-1,-1,-1,-1],
        [ 0, 0,-1,-1,-1,-1,-1],
      ],
      layer1DefaultKernel.slice(),
      [ // diag to left
        [ 0, 0, 0, 0, 0, 0, 0],
        [-1,-1,-5,-1,-1,-1,-1],
        [-1,-1,-1, 0,.5,-1,-1],
        [-1,-1,-1,.5, 1,.5,-1],
        [-1,-1,-1,-1,.5, 1,.5],
        [-1,-1,-1,-1,-1,.5, 0],
        [-1,-1,-1,-1,-1, 0, 0],
      ],
      [ // cap
        [-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1],
        [-1,-1, 0, c, 0,-1,-1],
        [-1,-1, 0, 0, 0,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1],
        [ 0, 0, 0, 0, 0, 0, 0],
        [ 0, 0, 0, 0, 0, 0, 0],
      ],
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
    ],
    [
      [ // vert
        [-1,-1, 0, 0, 0,-1,-1],
        [-1,-1, 0,.5, 0,-1,-1],
        [-1,-1, 0, 1, 0,-1,-1],
        [-1,-1, 0, 1, 0,-1,-1],
        [-1,-1, 0, 1, 0,-1,-1],
        [-1,-1, 0,.5, 0,-1,-1],
        [-1,-1, 0, 0, 0,-1,-1],
      ],
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
    ],
    [
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      rot90([ // hor
        [-1,-1, 0, 0, 0,-1,-1],
        [-1,-1, 0,.5, 0,-1,-1],
        [-1,-1, 0, 1, 0,-1,-1],
        [-1,-1, 0, 1, 0,-1,-1],
        [-1,-1, 0, 1, 0,-1,-1],
        [-1,-1, 0,.5, 0,-1,-1],
        [-1,-1, 0, 0, 0,-1,-1],
      ]),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
    ],
    [
      layer1DefaultKernel.slice(),
      [ // diag to right
        [ 0, 0,-1,-1,-1, 0, 0],
        [ 0,-1,-1,-1,.5,.5, 0],
        [-1,-1,-1,.5, 1,.5,-1],
        [-1,-1,.5, 1,.5,-1,-1],
        [-1,.5, 1,.5,-1,-1,-1],
        [ 0,.5,.5,-1,-1,-1, 0],
        [ 0, 0,-1,-1,-1, 0, 0],
      ],
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
    ],
    [
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      reflectY([ // diag to left
        [ 0, 0,-1,-1,-1, 0, 0],
        [ 0,-1,-1,-1,.5,.5, 0],
        [-1,-1,-1,.5, 1,.5,-1],
        [-1,-1,.5, 1,.5,-1,-1],
        [-1,.5, 1,.5,-1,-1,-1],
        [ 0,.5,.5,-1,-1,-1, 0],
        [ 0, 0,-1,-1,-1, 0, 0],
      ]),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
      layer1DefaultKernel.slice(),
    ],
  ];

  // const layer2Size = 5;
  // const layer2DefaultKernel = nj.zeros([layer2Size, layer2Size]).tolist();
  // const filters2 = [
  //   [
  //     [
  //       [-1,-1,-1,-1,-1],
  //       [-1, 0, 0, 0,-1],
  //       [-1, 0, 1, 0,-1],
  //       [-1, 0, 0, 0,-1],
  //       [-1,-1,-1,-1,-1],
  //     ],
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //   ],
  //   [
  //     layer2DefaultKernel.slice(),
  //     [
  //       [-1,-1,-1,-1,-1],
  //       [-1, 0, 0, 0,-1],
  //       [-1, 0, 1, 0,-1],
  //       [-1, 0, 0, 0,-1],
  //       [-1,-1,-1,-1,-1],
  //     ],
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //   ],
  //   [
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     [
  //       [-1,-1,-1,-1,-1],
  //       [-1, 0, 0, 0,-1],
  //       [-1, 0, 1, 0,-1],
  //       [-1, 0, 0, 0,-1],
  //       [-1,-1,-1,-1,-1],
  //     ],
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //   ],
  //   [
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     [
  //       [-1,-1,-1,-1,-1],
  //       [-1, 0, 0, 0,-1],
  //       [-1, 0, 1, 0,-1],
  //       [-1, 0, 0, 0,-1],
  //       [-1,-1,-1,-1,-1],
  //     ],
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //   ],
  //   [
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     [
  //       [-1,-1,-1,-1,-1],
  //       [-1, 0, 0, 0,-1],
  //       [-1, 0, 1, 0,-1],
  //       [-1, 0, 0, 0,-1],
  //       [-1,-1,-1,-1,-1],
  //     ],
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //   ],
  //   [
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     [
  //       [-1, 0, 0, 0,-1],
  //       [-1, 0, 0, 0,-1],
  //       [-1, 0, 1, 0,-1],
  //       [-1, 0, 0, 0,-1],
  //       [-1, 0, 0, 0,-1],
  //     ],
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //   ],
  //   [
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     [
  //       [-1,-1,-1,-1,-1],
  //       [ 0, 0, 0, 0, 0],
  //       [ 0, 0, 1, 0, 0],
  //       [ 0, 0, 0, 0, 0],
  //       [-1,-1,-1,-1,-1],
  //     ],
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //   ],
  //   [
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     [
  //       [-1,-1, 0, 0, 0],
  //       [-1, 0, 0, 0, 0],
  //       [ 0, 0, 1, 0, 0],
  //       [ 0, 0, 0, 0,-1],
  //       [ 0, 0, 0,-1,-1],
  //     ],
  //     layer2DefaultKernel.slice(),
  //   ],
  //   [
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     layer2DefaultKernel.slice(),
  //     [
  //       [ 0, 0, 0,-1,-1],
  //       [ 0, 0, 0, 0,-1],
  //       [ 0, 0, 1, 0, 0],
  //       [-1, 0, 0, 0, 0],
  //       [-1,-1, 0, 0, 0],
  //     ],
  //   ],
  // ];

  // const layer3Size = 9;
  // const layer3DefaultKernel = nj.zeros([layer3Size, layer3Size]).tolist();
  // const r = 3;
  // const filters3 = [
  //   [
  //     reflectY([
  //       [-1,-1,-1,-1,-1,-1,-1],
  //       [-1,-1,-1,-1,-1,-1,-1],
  //       [-1,-1,-1,-1,-1,-1,-1],
  //       [-1,-1,-1,-1,-1,-1,-1],
  //       [-1,-1,-1,-1, r, r,-3],
  //       [-1,-1,-1,-1, r, r,-3],
  //       [-1,-1,-1,-1,-3,-3,-3],
  //     ]),
  //     [
  //       [-1,-1,-1,-1,-1,-1,-1],
  //       [-1,-1,-1,-1,-1,-1,-1],
  //       [-1,-1,-1,-1,-1,-1,-1],
  //       [-1,-1,-1,-1,-1,-1,-1],
  //       [-1,-1,-1,-1, r, r,-3],
  //       [-1,-1,-1,-1, r, r,-3],
  //       [-1,-1,-1,-1,-3,-3,-3],
  //     ],
  //     layer3DefaultKernel.slice(),
  //     layer3DefaultKernel.slice(),
  //     layer3DefaultKernel.slice(),
  //     [
  //       [-1, 0, 0,-1, 0, 0,-1],
  //       [-1, 1, 1,-1, 1, 1,-1],
  //       [-1, 1, 1,-1, 1, 1,-1],
  //       [-1, 1, 1,-1, 1, 1,-1],
  //       [-1, 1, 1,-1, 1, 1,-1],
  //       [-3, 0, 0,-1, 0, 0,-3],
  //       [-3,-3,-3,-1,-3,-3,-3],
  //     ],
  //     [
  //       [ 0, 0, 0, 0, 0, 0, 0],
  //       [ 0, 0, 0, 0, 0, 0, 0],
  //       [-1,-1,-1,-1,-1,-1,-1],
  //       [-1,-1,-1,-1,-1,-1,-1],
  //       [-3, 0, 1, 1, 1, 0,-3],
  //       [-3, 0, 1, 1, 1, 0,-3],
  //       [-3,-1,-1,-1,-1,-1,-3],
  //     ],
  //     layer3DefaultKernel.slice(),
  //     layer3DefaultKernel.slice(),
  //   ],
  //   [
  //     layer3DefaultKernel.slice(),
  //     layer3DefaultKernel.slice(),
  //     reflectY([
  //       [-1,-1,-1,-1,-1,-1,-1],
  //       [-1,-1,-1,-1,-1,-1,-1],
  //       [-1,-1,-1,-1,-1,-1,-1],
  //       [-1,-1,-1,-1, r, r,-3],
  //       [-1,-1,-1,-1, r, r,-3],
  //       [-1,-1,-1,-1,-3,-3,-3],
  //       [-1,-1,-1,-1,-1,-1,-1],
  //     ]),
  //     [
  //       [-1,-1,-1,-1,-1,-1,-1],
  //       [-1,-1,-1,-1,-1,-1,-1],
  //       [-1,-1,-1,-1,-1,-1,-1],
  //       [-1,-1,-1,-1, r, r,-3],
  //       [-1,-1,-1,-1, r, r,-3],
  //       [-1,-1,-1,-1,-3,-3,-3],
  //       [-1,-1,-1,-1,-1,-1,-1],
  //     ],
  //     [
  //       [-1,-1, 0, 0, 0,-1,-1],
  //       [-1,-1, 1, 1, 1,-1,-1],
  //       [-1,-1, 1, 1, 1,-1,-1],
  //       [-1,-1,-1,-1,-1,-1,-1],
  //       [-1,-1,-1,-1,-1,-1,-1],
  //       [-1,-1,-1,-1,-1,-1,-1],
  //       [-1,-1,-1,-1,-1,-1,-1],
  //     ],
  //     [
  //       [-1,-1,-1,-1,-1,-1,-1],
  //       [-1,-1,-1,-1,-1,-1,-1],
  //       [-3,-3,-3,-1,-3,-3,-3],
  //       [-1, 0, 0,-1, 0, 0,-1],
  //       [-1, 1, 1,-1, 1, 1,-1],
  //       [-1, 1, 1,-1, 1, 1,-1],
  //       [-1, 0, 0,-1, 0, 0,-1],
  //     ],
  //     layer3DefaultKernel.slice(),
  //     reflectY([
  //       [-1,-1,-1,-1,-1,-1,-1],
  //       [-1, 0, 0, 0,-1,-1,-1],
  //       [-1, 1, 1, 1,-1,-1,-1],
  //       [-1, 1, 1, 1,-1,-1,-1],
  //       [-1,-1,-1,-1,-1,-1,-1],
  //       [-1,-1,-1,-1,-1,-1,-1],
  //       [-1,-1,-1,-1,-1,-1,-1],
  //     ]),
  //     [
  //       [-1,-1,-1,-1,-1,-1,-1],
  //       [-1, 0, 0, 0,-1,-1,-1],
  //       [-1, 1, 1, 1,-1,-1,-1],
  //       [-1, 1, 1, 1,-1,-1,-1],
  //       [-1,-1,-1,-1,-1,-1,-1],
  //       [-1,-1,-1,-1,-1,-1,-1],
  //       [-1,-1,-1,-1,-1,-1,-1],
  //     ],
  //   ],
  // ];

  // const layer4Size = 5;
  // const filters4 = [
  //   [
  //     [
  //       [ 0, 0, 0, 0, 0],
  //       [ 0, 0, 0, 0, 0],
  //       [ 0, 0, 0, 0, 0],
  //       [ 0, 1, 1, 1, 0],
  //       [ 0, 1, 1, 1, 0],
  //     ],
  //     [
  //       [ 0, 0, 0, 0, 0],
  //       [ 0, 1, 1, 1, 0],
  //       [ 0, 1, 1, 1, 0],
  //       [ 0, 0, 0, 0, 0],
  //       [ 0, 0, 0, 0, 0],
  //     ],
  //     // [
  //     //   [ 0, 0, 0, 0, 0],
  //     //   [ 0, 1, 0, 0, 0],
  //     //   [ 0, 1, 0, 0, 0],
  //     //   [ 0, 1, 0, 0, 0],
  //     //   [ 0, 1, 0, 0, 0],
  //     // ],
  //     // [
  //     //   [ 0, 0, 0, 0, 0],
  //     //   [ 0, 0, 0, 1, 0],
  //     //   [ 0, 0, 0, 1, 0],
  //     //   [ 0, 0, 0, 1, 0],
  //     //   [ 0, 0, 0, 1, 0],
  //     // ],
  //   ],
  // ];

  const layerInfos = [
    {
      type: 'maxPool2d',
      poolSize: 3
    },
    {
      type: 'conv2d',
      kernelSize: layer1Size,
      filters
    },
    {
      type: 'maxPool2d',
      poolSize: 3
    },
    // {
    //   type: 'conv2d',
    //   kernelSize: layer2Size,
    //   filters: filters2
    // },
    // {
    //   type: 'maxPool2d',
    //   poolSize: 2
    // },
    {
      type: 'conv2d',
      kernelSize: layer3Size,
      filters: filters3
    },
    {
      type: 'conv2d',
      kernelSize: layer4Size,
      filters: filters4
    },
  ];

  const kernelInfos = [
    {
      type: 0,
      angles: [0, 0.5, 0.25, 0.75],
    },
    {
      type: 2,
      angles: [0.25, 1, 1.5],
    },
    {
      type: 7,
      angles: [0, 0.75],
    },
  ];
  const kernelFilter = [];
  kernelInfos.forEach(d => d.angles.forEach(angle => kernelFilter.push(d.type + '_' + (angle * Math.PI).toFixed(2))));

  return { layerInfos, kernelFilter };
}

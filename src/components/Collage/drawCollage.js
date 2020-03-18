import nj from 'numjs';
import Network from '../../js/conv/network';
import SmartCollage from './smartCollage';
import Drawer from './draw';
import { filters } from './storedFilters2';

function rotateLayerInfos(layerInfos, rotations) {
  return layerInfos.map(layerInfo => {
    if (layerInfo.type === 'conv2d') {
      const { filters } = layerInfo;
      let rotatedFilters = filters;
      if (rotations !== 0) {
        rotatedFilters = filters.map(filter => {
          return filter.map(kernel => nj.rot90(kernel, rotations).tolist());
        });
      }
      return { ...layerInfo, filters: rotatedFilters };
    }

    // return other layers as is
    return layerInfo;
  });
}

function rotateNetworks(networkInfos) {
  return networkInfos.map(networkInfo => {
    const { layerInfos, rotations } = networkInfo;
    return rotations.map(rotation => rotateLayerInfos(layerInfos, rotation));
  });
}

// get the sum of all the maximums by locations provided
function getSum(arr, locs) {
  let sum = 0;
  arr.forEach((row, y) => row.forEach((v, x) => {
    if (locs[`${x},${y}`]) {
      sum += v;
    }
  }));
  return sum;
}

// get the 2d array of maximums by location
function getMaxArr(arrs) {
  const [x, y] = [arrs[0][0].length, arrs[0].length];
  const maxArr = nj.zeros([y, x]).tolist();
  arrs.forEach(arr => arr.forEach((row, y) => row.forEach((v, x) => {
    if (v > maxArr[y][x]) {
      maxArr[y][x] = v;
    }
  })));
  return maxArr;
}

// get the max and location of max of this 2d array
function getMax(arr) {
  let maxVal = -1;
  let maxLoc = { x: 0, y: 0 };
  arr.forEach((row, y) => row.forEach((v, x) => {
    if (v > maxVal) {
      maxVal = v;
      maxLoc = { x, y };
    }
  }));
  return { loc: maxLoc, v: maxVal };
};

function getMaxDiff(maxArr, prevMaxArr) {
  let diffArr;
  if (prevMaxArr) {
    diffArr = nj.array(maxArr).subtract(nj.array(prevMaxArr)).tolist();
  } else {
    diffArr = maxArr;
  }
  const { loc, v } = getMax(diffArr);
  return { loc, v };
}

export function drawMaxPool(p, callback) {
  // load salal network
  const layerInfos = JSON.parse(localStorage.getItem('salal2_d_export'));
  // make 4 rotations and pool at end
  const networkInfos = [
    {
      layerInfos: [
        ...layerInfos,
        { // add pooling at end
          type: 'maxPool2d',
          poolSize: 5
        }
      ],
      rotations: [0, 1, 2, 3]
    }
  ];

  // Generate all the networks
  const shape = [p.width, p.height]
  const networks = rotateNetworks(networkInfos).flat().map(layerInfos => new Network(shape, layerInfos, true));
  // turn off stats for speed
  networks.forEach(network => network.noStats());
  const smartCollage = new SmartCollage(p, shape, networks);
  smartCollage.init();
  const drawer = new Drawer(smartCollage);

  const getScore = () => {
    let maxArr;
    networks.forEach(network => {
      const finalArr = network.arrs[network.arrs.length - 1].arr.tolist()[0];
      if (!maxArr) {
        maxArr = finalArr;
      } else {
        finalArr.forEach((row, y) => row.forEach((v, x) => {
          v = v * 1.1;
          if (v > maxArr[y][x]) {
            maxArr[y][x] = v;
          }
        }))
      }
    });
    // get sum of max array and return
    const maxSum = maxArr.flat().flat().reduce((a, b) => a + b);
    return maxSum;
  };
  drawer.draw(getScore, callback);

  return () => drawer.stop();
}

export function drawStoredPrototype(p, callback, update) {
  const shape = [p.width, p.height];
  const networkInfos = [
    {
      layerInfos: [
        {
          type: 'conv2d',
          filters,
          kernelSize: 31
        },
      ],
      rotations: [0, 1, 2, 3]
    }
  ];
  const layerInfos = [
    {
      type: 'conv2d',
      filters: rotateNetworks(networkInfos).flat().map(layerInfos => layerInfos[0].filters).flat(),
      kernelSize: 31
    },
    { // add pooling at end
      type: 'maxPool2d',
      poolSize: 19
    }
  ];
  // Generate all the networks
  const networks = [new Network(shape, layerInfos)];
  // turn off stats for speed
  networks.forEach(network => network.noStats());
  const smartCollage = new SmartCollage(p, shape, networks);
  smartCollage.addListener(update);
  smartCollage.init();
  const drawer = new Drawer(smartCollage);

  // Focus on acts at a single location at a time
  let actLoc = null;
  const actLocs = [];
  let prevMaxArr = null;
  let prevSum = 0;

  drawer.addListener((e, data) => {
    switch(e) {
      case 'NEWLINE':
        // reset location to monitor
        actLoc = null;
        break;
      case 'ADDSEG':
        getScore(true);
        break;
      default:
        break;
    }
  });

  const getScore = (shouldSetValues=false) => {

    // if lower overall score, return 0
    const arrs = networks.map(network => network.arrs[network.arrs.length - 1].arr.tolist()).flat();
    const maxArr = getMaxArr(arrs);
    const maxSum = getSum(maxArr, actLocs);
    if (maxSum < prevSum) {
      return 0;
    }

    // else, return the diff at the attention location
    let score;
    if (!actLoc) {
      // First time for this line
      // Get biggest positive difference, that is the score
      const { loc, v } = getMaxDiff(maxArr, prevMaxArr);
      if (shouldSetValues) {
        actLoc = loc;
        actLocs.push(`${actLoc.x},${actLoc.y}`);
      }
      score = v;
    } else {
      const { x, y } = actLoc;
      const diffAtLoc = maxArr[y][x] - prevMaxArr[y][x];
      score = diffAtLoc;
    }

    if (shouldSetValues) {
      prevMaxArr = maxArr;
      prevSum = maxSum;
    }
    return score;
  };
  drawer.draw(getScore, callback);

  return { drawer, networks };
}

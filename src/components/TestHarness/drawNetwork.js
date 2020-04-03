import nj from 'numjs';
import Network from '../../js/conv/network';
import SmartCollage from './smartCollage';
import Drawer from './draw';

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

function convolve(pxs0, pxs1) {
  if (pxs0.length !== pxs1.length || pxs0[0].length !== pxs1[0].length) {
    debugger;
  }
  let convSum = 0;
  for (let y = 0; y < pxs0.length; y += 1) {
    for (let x = 0; x < pxs0[0].length; x += 1) {
      convSum += pxs0[y][x] * pxs1[y][x];
    }
  }
  return convSum;
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

export default function drawNetwork(kernels, rewards, p, callback, pTest) {
  const shape = [p.width, p.height];
  const layerInfos = [
    // { // add pooling at beginning
    //   type: 'maxPool2d',
    //   poolSize: 3
    // },
    {
      type: 'conv2d',
      filters: kernels.map(k => [k]),
      kernelSize: kernels[0].length
    },
    // { // add pooling at end
    //   type: 'maxPool2d',
    //   poolSize: 3
    // }
  ];
  // Generate all the networks
  const network = new Network(shape, layerInfos);
  network.noStats();
  const smartCollage = new SmartCollage(p, shape, [network]);
  // smartCollage.addListener(update);
  smartCollage.init();
  const drawer = new Drawer(smartCollage, pTest);

  // Focus on acts at a single location at a time
  let actLoc = null;
  const actLocs = {};
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
    // get output arrs
    const arrsRaw = network.arrs[network.arrs.length - 1].arr.tolist();

    // adjust for rewards
    const arrs = arrsRaw.map((arr, i) => arr.map((row, y) => row.map((v, x) => rewards[i][y][x] * v)));

    // if lower overall score, return 0
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
        actLocs[`${actLoc.x},${actLoc.y}`] = true;
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
  drawer.draw(getScore, () => {
    callback(smartCollage);
  });

  return drawer;
}

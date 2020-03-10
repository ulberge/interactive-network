import nj from 'numjs';
import Network from '../../js/conv/network';
import SmartCollage from './smartCollage';
import Drawer from './draw';
import { filters } from './storedFilters';

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
  const layerInfos = [
    {
      type: 'conv2d',
      filters,
      kernelSize: 19
    }
  ];
  const networkInfos = [
    {
      layerInfos: [
        ...layerInfos,
        { // add pooling at end
          type: 'maxPool2d',
          poolSize: 10
        }
      ],
      rotations: [0, 1]
    }
  ];
  // Generate all the networks
  const networks = rotateNetworks(networkInfos).flat().map(layerInfos => new Network(shape, layerInfos));
  // turn off stats for speed
  networks.forEach(network => network.noStats());
  const smartCollage = new SmartCollage(p, shape, networks);
  smartCollage.addListener(update);
  smartCollage.init();
  const drawer = new Drawer(smartCollage);

  // Focus on acts at a single location at a time
  let actLoc = null;
  let prevMaxArr = null;

  const getMaxArr = () => {
    let maxArr;
    const arrs = networks.map(network => network.arrs[network.arrs.length - 1].arr.tolist()).flat();
    arrs.forEach(finalArr => {
      if (!maxArr) {
        maxArr = finalArr;
      } else {
        finalArr.forEach((row, y) => row.forEach((v, x) => {
          if (v > maxArr[y][x]) {
            maxArr[y][x] = v;
          }
        }));
      }
    });
    return maxArr;
  }

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
    const maxArr = getMaxArr();

    const getMax = arr2d => {
      let maxVal = -1;
      let maxLoc = { x: 0, y: 0 };
      arr2d.forEach((row, y) => row.forEach((v, x) => {
        if (v > maxVal) {
          maxVal = v;
          maxLoc = { x, y };
        }
      }));
      return { loc: maxLoc, v: maxVal };
    };

    let score;
    if (!prevMaxArr) {
      // First time!
      // Use max location of maxArr
      const { loc, v } = getMax(maxArr);
      if (shouldSetValues) {
        actLoc = loc;
      }
      score = v;
    } else {
      // Not first time
      if (!actLoc) {
        // First time for this line
        // Get biggest positive difference, that is the score
        const diffArr = nj.array(maxArr).subtract(nj.array(prevMaxArr)).tolist();
        const { loc, v } = getMax(diffArr);
        if (shouldSetValues) {
          actLoc = loc;
        }
        score = v;
      } else {
        const { x, y } = actLoc;
        const diffAtLoc = maxArr[y][x] - prevMaxArr[y][x];
        score = diffAtLoc;
      }
    }

    if (shouldSetValues) {
      prevMaxArr = maxArr;
    }
    return score;
  };
  drawer.draw(getScore, callback);

  return { drawer, networks };
}

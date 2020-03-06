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

export function drawMaxPool(p, callback) {
  // load salal network
  const layerInfos = JSON.parse(localStorage.getItem('salal2_export'));
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

import React, { useRef, useEffect, useState } from 'react';
import nj from 'numjs';
import Grid from '@material-ui/core/Grid';
import Array2DViewList from '../UI/Array2DViewList';
import { getActsAndLayer } from './helpers';
import DrawTest from './DrawTest';

const dtype = 'float32';

// process kernels
function scaleKernel(kernel) {
  let positiveSum = 0;
  let positiveMax = 0;
  let negativeMin = 0;
  kernel.forEach(row => row.forEach(v => {
    if (v > 0) {
      positiveSum += v;
      if (v > positiveMax) {
        positiveMax = v;
      }
    } else {
      if (v < negativeMin) {
        negativeMin = v;
      }
    }
  }));

  let negativeScaleFactor;
  if (positiveMax === 0 || negativeMin === 0) {
    negativeScaleFactor = 1;
  } else {
    negativeScaleFactor = -negativeMin / (positiveMax / positiveSum);
  }
  const positiveScaleFactor = positiveSum;

  kernel = kernel.map(row => row.map(v => {
    if (v > 0) {
      // normalize positive weights, such that the total adds up to 1 (ie. max activation is 1 if input max is 1)
      return v / positiveScaleFactor;
    } else {
      // scale negative weights with scale where min is equal negative magnitude of max positive
      // there may be a lot more negative than positive, but by scaling to match, an equal number
      // of mismatch pixels will cancel out with positive
      return 0.6 * v / negativeScaleFactor;
    }
  }));

  return kernel;
}

function getImgArr(pxs, rowWidth, ch) {
  const imgArr = [];
  let row = [];
  for (let i = ch; i < pxs.length; i += 4) {
    row.push(255 - pxs[i]);
    if (row.length === rowWidth) {
      imgArr.push(row);
      row = [];
    }
  }
  return imgArr;
}

function getImgArrFromImg(img, ch) {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  canvas.getContext('2d').drawImage(img, 0, 0);
  const pxs = canvas.getContext('2d').getImageData(0, 0, img.width, img.height).data;
  const imgArr = getImgArr(pxs, img.width, ch);
  return imgArr;
}

function getImgArrForKernel(pxs, rowWidth) {
  const imgArr = [];
  let row = [];
  for (let i = 0; i < pxs.length; i += 4) {
    if (pxs[i + 1] === 255) {
      // green => positive
      row.push(255);
    } else if (pxs[i + 2] === 255) {
      // blue => neutral
      row.push(0);
    } else {
      // else, negative
      row.push(-155);
    }
    if (row.length === rowWidth) {
      imgArr.push(row);
      row = [];
    }
  }
  return imgArr;
}

function getImgArrFromKernelImg(img) {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  canvas.getContext('2d').drawImage(img, 0, 0);
  const pxs = canvas.getContext('2d').getImageData(0, 0, img.width, img.height).data;
  const imgArr = getImgArrForKernel(pxs, img.width);
  return imgArr;
}

function get2DArraySlice(arr, selection) {
  if (!arr || arr.length === 0 || arr[0].length === 0 || !selection) {
    return arr;
  }
  let [ minX, minY, maxX, maxY ] = selection;
  minX = Math.max(0, minX);
  minY = Math.max(0, minY);
  maxX = Math.min(arr[0].length, maxX);
  maxY = Math.min(arr.length, maxY);

  const slice = arr.slice(minY, maxY).map(row => row.slice(minX, maxX));
  return slice;
}

// load kernel img file and translate to 2D array
function getKernelsFromSpriteArr(spriteArr) {
  // const kernelSize = 13;
  const kernelSize = 7;
  const spriteWidth = spriteArr[0].length / kernelSize;
  const kernels = [];
  for (let i = 0; i < spriteWidth; i += 1) {
    const bounds = [i * kernelSize, 0, (i + 1) * kernelSize, kernelSize];
    const kernel = get2DArraySlice(spriteArr, bounds);
    const scaledKernel = scaleKernel(kernel);
    kernels.push(scaledKernel);
  }

  // // translate values
  // const kernelsAdj = kernels.map(k => k.map(row => row.map(v => v === 255 ? -155 : 255 - v)));

  return kernels;
}

// load kernel img file and translate to 2D array
function getRewardsFromSpriteArr(spriteArr) {
  const size = 31;
  // const kernelSize = 13;
  // const padding = (kernelSize - 1) / 2;
  const padding = 0;
  const spriteWidth = spriteArr[0].length / size;
  const rewardsByTest = [];
  for (let row = 0; row < 9; row += 1) {
    const rewards = [];
    for (let i = 0; i < spriteWidth; i += 1) {
      const bounds = [
        (i * size) + padding,
        (row * size) + padding,
        ((i + 1) * size) - padding,
        ((row + 1) * size) - padding
      ];
      const reward = get2DArraySlice(spriteArr, bounds);
      rewards.push(reward);
    }
    rewardsByTest.push(rewards);
  }

  // translate values
  // const rewardsAdj = rewards.map(k => k.map(row => row.map(v => v)));

  return rewardsByTest;
}


export default function Harness(props) {
  const kernelsImgRef = useRef(null);
  const rewardsImgRef = useRef(null);

  const [ kernels, setKernels ] = useState([]);
  const [ rewards, setRewards ] = useState([]);

  useEffect(() => {
    kernelsImgRef.current.addEventListener('load', function() {
      const kernelsSpriteArr = getImgArrFromKernelImg(kernelsImgRef.current);
      const newKernels = getKernelsFromSpriteArr(kernelsSpriteArr);
      setKernels(newKernels);
    }, false);
    rewardsImgRef.current.addEventListener('load', function() {
      const rewardsSpriteArr = getImgArrFromImg(rewardsImgRef.current, 0);
      const newRewards = getRewardsFromSpriteArr(rewardsSpriteArr);
      setRewards(newRewards);
    }, false);
  });

  // useEffect(() => {
  //   if (!kernels || kernels.length === 0 || !outputImgArr) {
  //     return;
  //   }

  //   const filters = kernels.map(k => [k]);
  //   const { acts: newActs, layer } = getActsAndLayer(filters, outputImgArr);
  //   setActs(newActs);
  // }, [kernels, outputImgArr]);
  //

  let testArea;
  if (!kernels || kernels.length === 0 || !rewards || rewards.length === 0) {
    testArea = null;
  } else {
    const numTests = 9;
    const drawTests = [];
    for (let i = 0; i < numTests; i++) {
      drawTests.push(<DrawTest kernels={kernels} rewards={rewards[i]} numTests={10} testId={i} />);
    }
    const drawTestResults = [];
    for (let i = 0; i < numTests; i++) {
      drawTestResults.push(<div id={`saved-drawings${i}`} style={{ maxWidth: '1300px' }}></div>);
    }
    const drawTestResultsB = [];
    for (let i = 0; i < numTests; i++) {
      drawTestResultsB.push(<div id={`saved-drawings${i}b`} style={{ maxWidth: '1300px' }}></div>);
    }

    testArea = (
      <div>
        <div>
          <h3>Render Output</h3>
          { drawTests }
        </div>
        <Grid item xs={12} style={{ paddingTop: '40px' }} className="zoom93 saved-drawings">
          { drawTestResults }
        </Grid>
        <Grid item xs={12} style={{ paddingTop: '40px' }} className="zoom93 saved-drawings">
          { drawTestResultsB }
        </Grid>
      </div>
    );
  }


  return (
    <div>
      <div>
        <h3>Make Reward Filters</h3>
        <div style={{ display: 'none' }}>
          <img ref={kernelsImgRef} src="./data/tests/lines_kernels.png" alt="kernels" />
        </div>
        <div style={{ display: 'none' }}>
          <img ref={rewardsImgRef} src="./data/tests/lines_acts.png" alt="rewards" />
        </div>
        <Grid container>
          <Grid item xs={2}>
            <h4>Kernels</h4>
            <Array2DViewList imgArrs={kernels} scale={1} cols={3} />
          </Grid>
          <Grid item xs={2}>
            <h4>Rewards</h4>
            <Array2DViewList imgArrs={rewards} scale={1} cols={3} />
          </Grid>
        </Grid>
        { testArea }
      </div>
    </div>
  )
}

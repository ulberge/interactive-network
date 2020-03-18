import React, { useRef, useEffect, useState } from 'react';
import nj from 'numjs';
import Grid from '@material-ui/core/Grid';
import Array2DViewList from '../UI/Array2DViewList';
import { getActsAndLayer } from './helpers';
import DrawTest from './DrawTest';

const dtype = 'float32';
const testFolder = './data/kernelsC';

function getImgArr(pxs, rowWidth, ch) {
  const imgArr = [];
  let row = [];
  for (let i = ch; i < pxs.length; i += 4) {
    row.push(pxs[i]);
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
      // if full green, that is negative
      row.push(-155);
    } else if (pxs[i + 2] === 255) {
      // if full blue, that is neutral
      row.push(0);
    } else {
      // else, it is the inverse value of any color (gray)
      row.push(255 - pxs[i]);
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
  const kernelSize = 31;
  const spriteWidth = spriteArr[0].length / kernelSize;
  const kernels = [];
  for (let i = 0; i < spriteWidth; i += 1) {
    const bounds = [i * kernelSize, 0, (i + 1) * kernelSize, kernelSize];
    const kernel = get2DArraySlice(spriteArr, bounds);
    kernels.push(kernel);
  }

  // // translate values
  // const kernelsAdj = kernels.map(k => k.map(row => row.map(v => v === 255 ? -155 : 255 - v)));

  return kernels;
}

// load kernel img file and translate to 2D array
function getRewardsFromSpriteArr(spriteArr) {
  const size = 50;
  const spriteWidth = spriteArr[0].length / size;
  const rewards = [];
  for (let i = 0; i < spriteWidth; i += 1) {
    const bounds = [i * size, 0, (i + 1) * size, size];
    const reward = get2DArraySlice(spriteArr, bounds);
    rewards.push(reward);
  }

  // translate values
  // const rewardsAdj = rewards.map(k => k.map(row => row.map(v => v)));

  return rewards;
}


export default function Harness(props) {
  const kernelsImgRef = useRef(null);
  const rewardsImgRef = useRef(null);
  const outputImgRef = useRef(null);

  const [ kernels, setKernels ] = useState([]);
  const [ rewards, setRewards ] = useState([]);

  useEffect(() => {
    kernelsImgRef.current.addEventListener('load', function() {
      const kernelsSpriteArr = getImgArrFromKernelImg(kernelsImgRef.current);
      const newKernels = getKernelsFromSpriteArr(kernelsSpriteArr);
      setKernels(newKernels);
    }, false);
    rewardsImgRef.current.addEventListener('load', function() {
      const rewardsSpriteArr = getImgArrFromImg(rewardsImgRef.current, 3);
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

  return (
    <div>
      <div>
        <h3>Make Reward Filters</h3>
        <div style={{ display: 'none' }}>
          <img ref={kernelsImgRef} src={`${testFolder}/kernel_spriteb.png`} alt="kernels" />
        </div>
        <div style={{ display: 'none' }}>
          <img ref={rewardsImgRef} src={`${testFolder}/reward_sprite1.png`} alt="rewards" />
        </div>
        <Grid container>
          <Grid item xs={3}>
            <img ref={outputImgRef} src={`${testFolder}/output.png`} alt="example output" />
          </Grid>
          <Grid item xs={2}>
            <h4>Kernels</h4>
            <Array2DViewList imgArrs={kernels} scale={1} cols={3} />
          </Grid>
          <Grid item xs={2}>
            <h4>Rewards</h4>
            <Array2DViewList imgArrs={rewards} scale={1} cols={3} />
          </Grid>
        </Grid>

      </div>
      <div>
        <h3>Render Output</h3>
        <DrawTest kernels={kernels} rewards={rewards} numTests={10} />
      </div>
    </div>
  )
}

import { getLayer, evalChannels } from './tfhelpers';

// const lineChannels = [0, 1];
// const lineEndChannels = [0, 1, 2, 3];
// const cornerChannels = [0, 1, 14, 27];

const defaultFilter = [ // le3
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// data format
// out
// in
// h
// w

const getChannels = lineInfo => {
  const lineChannels = lineInfo.getLineChannels([0, 1]);
  const lineEndChannels = lineInfo.getLineEndChannels([0, 1, 2, 3]);
  const lineCornerChannels = lineInfo.getCornerChannels([0, 1, 14, 27]);
  const channels = [ ...lineChannels, ...lineEndChannels, ...lineCornerChannels ];

  // scope channels
  const center = [10, 10];
  // const kernelSize = 9;
  const padding = 4;
  const bounds = {
    sx: center[0] - padding,
    sy: center[1] - padding,
    ex: center[0] + padding + 1,
    ey: center[1] + padding + 1,
  }
  const scopedChannels = channels.map(channel => {
    // filter rows
    const filteredRows = channel.filter((row, i) => (i >= bounds.sy && i < bounds.ey));
    // filter columns
    return filteredRows.map(row => row.slice(bounds.sx, bounds.ex));
  });

  return scopedChannels;
}

// const max2D = arr2D => {
//   let max = -Infinity;
//   arr2D.forEach(row => row.forEach(v => v > max ? max = v : null));
//   return max;
// }

const getScore = (layer, lineInfo) => {
  const channels = getChannels(lineInfo);
  const acts = evalChannels(layer, channels)[0];

  // const maxScore = max2D(acts);
  // return maxScore;

  const scoreAt = acts[0][0];
  return scoreAt;
}

// const getScoreFromLayers = (layers, lineInfo) => {
//   const channels = getChannels(lineInfo);
//   const acts = evalChannels(layer, channels)[0];

//   // const maxScore = max2D(acts);
//   // return maxScore;

//   const scoreAt = acts[0][0];
//   return scoreAt;
// }

export function getTest0() {
  const filters = [
    [
      [ // hor
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
      [ // vert
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
      defaultFilter.slice(),
      defaultFilter.slice(),
      defaultFilter.slice(),
      defaultFilter.slice(),
      defaultFilter.slice(),
      defaultFilter.slice(),
      defaultFilter.slice(),
      defaultFilter.slice(),
    ],
  ];

  const layer0 = getLayer(filters);

  return (lineInfo => getScore(layer0, lineInfo));
}

// const lineChannels = [0, 1];
// const lineEndChannels = [0, 1, 2, 3];
// const cornerChannels = [0, 1, 14, 27];
export function getTest1() {
  const filters = [
    [
      defaultFilter.slice(),
      [ // vert
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      defaultFilter.slice(),
      defaultFilter.slice(),
      defaultFilter.slice(),
      defaultFilter.slice(),
      defaultFilter.slice(),
      defaultFilter.slice(),
      [ // bottomleft corner
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      [ // topleft corner
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
    ],
  ];


  const layer0 = getLayer(filters);

  return (lineInfo => getScore(layer0, lineInfo));
}

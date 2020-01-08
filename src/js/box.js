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

  return (channels => evalChannels(layer0, channels));
}

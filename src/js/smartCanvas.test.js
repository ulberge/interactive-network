import SmartCanvas from './smartCanvas2';

const filters0 = [
  [
    [
      [0, 0],
      [0, 1],
    ],
  ],
  [
    [
      [1, 0],
      [0, 1],
    ],
  ],
  [
    [
      [0, 1],
      [0, 1],
    ],
  ],
];

const filters2 = [
  [
    [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
    [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
    [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
  ],
];

const layers = [
  {
    type: 'conv2d',
    filters: filters0
  },
  {
    type: 'maxPool2d',
      poolSize: 6
  },
  {
    type: 'conv2d',
    filters: filters2
  },
];

const shape = [ 32, 24 ];
const p = {
  height: shape[0],
  width: shape[1],
  get: (x0, y0, x1, y1) => {
    return {
      loadPixels: () => {},
      pixels: new Uint8ClampedArray(new Array((y1 - y0) * (x1 - x0)).fill(0).map((v, i) => i)),
      width: (x1 - x0),
      height: (y1 - y0),
    };
  },
  line: () => {},
  image: () => {}
}

it('calculates line bounds correctly', () => {
  const sc = new SmartCanvas(p, shape, layers);
  const result = sc._getLineBounds({ x: 3, y: 4 }, { x: 6, y: 7 });
  const expected = [ 2, 3, 7, 8 ];
  expect(result).toEqual(expected);
});

it('calculates line bounds correctly when switched order', () => {
  const sc = new SmartCanvas(p, shape, layers);
  const result = sc._getLineBounds({ x: 6, y: 7 }, { x: 3, y: 4 });
  const expected = [ 2, 3, 7, 8 ];
  expect(result).toEqual(expected);
});

it('updates dirty bounds from null', () => {
  const sc = new SmartCanvas(p, shape, layers);
  const bounds = sc._getLineBounds({ x: 6, y: 7 }, { x: 3, y: 4 });
  sc._updateDirtyBounds(bounds);
  const expected = [ 2, 3, 7, 8 ];
  expect(sc._dirtyBounds).toEqual(expected);
});

it('updates dirty bounds from existing', () => {
  const sc = new SmartCanvas(p, shape, layers);
  const bounds0 = sc._getLineBounds({ x: 6, y: 7 }, { x: 3, y: 4 });
  const bounds1 = sc._getLineBounds({ x: 8, y: 9 }, { x: 4, y: 5 });
  sc._updateDirtyBounds(bounds0);
  sc._updateDirtyBounds(bounds1);
  expect(sc._dirtyBounds).toEqual([ 2, 3, 9, 10 ]);

  const bounds2 = sc._getLineBounds({ x: 8, y: 9 }, { x: 1, y: 2 });
  sc._updateDirtyBounds(bounds2);
  expect(sc._dirtyBounds).toEqual([ 0, 1, 9, 10 ]);
});

it('updates dirty bounds but not backup on addSegment', () => {
  const sc = new SmartCanvas(p, shape, layers);
  sc.addSegment({ x: 6, y: 7 }, { x: 3, y: 4 });
  expect(sc._dirtyBounds).toEqual([ 2, 3, 7, 8 ]);
  expect(sc._backup).toBeNull();
});

it('creates backup on addSegment when true', () => {
  const sc = new SmartCanvas(p, shape, layers);
  sc.addSegment({ x: 6, y: 7 }, { x: 3, y: 4 }, true);
  expect(sc._backup).toBeDefined();
  expect(sc._backup.bounds).toEqual([ 2, 3, 7, 8 ]);
});

it('restores from backup and clears backup', () => {
  const sc = new SmartCanvas(p, shape, layers);
  sc.addSegment({ x: 6, y: 7 }, { x: 3, y: 4 }, true);
  expect(sc._backup).toBeDefined();
  expect(sc._backup.bounds).toEqual([ 2, 3, 7, 8 ]);
  sc.restore();
  expect(sc._backup).toBeNull();
});

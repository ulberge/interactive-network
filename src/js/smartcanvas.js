import { getEmpty2DArray, deepCopy } from './helpers';
import { eval2DArray } from './tfhelpers';
import { get2DArraySlice, getImgArrFromPSelection, getImgArrFromP } from './helpers';

export class LineInfo {
  constructor(shape, numChannels) {
    if (shape && numChannels) {
      const [ w, h ] = shape;
      this.w = w;
      this.h = h;
      this.channels = [];

      // keep track of max channels at each location
      this.max = getEmpty2DArray(this.h, this.w, 0.05);
      this.ids = getEmpty2DArray(this.h, this.w, -1);

      for (let i = 0; i < numChannels; i += 1) {
        this.channels.push(getEmpty2DArray(h, w, 0));
      }
    }
  }

  // update the channels within the given bounds (reduced by the padding)
  update(channels, bounds=null, padding=0) {
    if (!bounds) {
      // update all
      this.channels = channels;
    } else {
      // update the channels in the location
      let [ minX, minY, maxX, maxY ] = bounds;
      const w = maxX - minX + 1 - (2 * padding);
      const h = maxY - minY + 1 - (2 * padding);
      this.channels.forEach((channel, channelIndex) => {
        for (let y = padding; y < (padding + h); y += 1) {
          const section = channels[channelIndex][y].slice(padding, w + padding);
          channel[minY + y].splice(minX + padding, w, ...section);
        }
      });
    }

    this.updateMaxChannels(bounds);
  }

  updateMaxChannels(bounds=null) {
    if (!bounds) {
      bounds = [ 0, 0, this.width - 1, this.height - 1 ];
    }

    let [ minX, minY, maxX, maxY ] = bounds;
    this.channels.forEach((channel, chIndex) => {
      for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) {
          if (channel[y][x] > this.max[y][x]) {
            this.max[y][x] = channel[y][x];
            this.ids[y][x] = chIndex;
          }
        }
      }
    });
  }

  // Returns two 2D arrays with max id and value
  getMaxChannels() {
    return { max : this.max, ids: this.ids };
  }

  getChannelsAt(pos) {
    const { x, y } = pos;
    return this.channels.map(channel => channel[y][x]);
  }

  getChannelsInSelection(bounds) {
    const [ minX, minY, maxX, maxY ] = bounds;
    const channelSelections = this.channels.map(channel => {
      const channelSelection = [];
      for (let y = minY; y <= maxY; y += 1) {
        const section = channel[y].slice(minX, maxX + 1);
        channelSelection.push(section);
      }
      return channelSelection;
    });
    return channelSelections;
  }

  getChannels(channelIndices) {
    return this.channels.filter((channel, i) => channelIndices.includes(i));
  }

  copy() {
    return LineInfo.copy(this);
  }

  static copy(lineInfo) {
    const copy = new this();
    copy.channels = lineInfo.channels.map(channel => deepCopy(channel));
    copy.w = lineInfo.w;
    copy.h = lineInfo.h;
    copy.max = deepCopy(lineInfo.max);
    copy.ids = deepCopy(lineInfo.ids);
    return copy;
  }

  // get the max/ids of positive/negative change between two line infos inside selection
  static diff(channels0, channels1, bounds, filter) {
    // update the channels in the location
    let [ minX, minY, maxX, maxY ] = bounds;
    const w = maxX - minX + 1;
    const h = maxY - minY + 1;

    const maxPos = getEmpty2DArray(h, w, 0);
    const idsPos = getEmpty2DArray(h, w, -1);
    const maxNeg = getEmpty2DArray(h, w, 0);
    const idsNeg = getEmpty2DArray(h, w, -1);

    let channelIndices;
    if (filter) {
      channelIndices = filter;
    } else {
      channelIndices = new Array(channels0.length).fill(0).map((v, i) => i);
    }
    for (let i of channelIndices) {
      const channel0 = channels0[i];
      const channel1 = channels1[i];

      for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) {
          const delta = channel1[y][x] - channel0[y][x];
          const yAdj = y - minY;
          const xAdj = x - minX;
          if (delta > maxPos[yAdj][xAdj]) {
            maxPos[yAdj][xAdj] = delta;
            idsPos[yAdj][xAdj] = i;
          }
          if (-delta > maxNeg[yAdj][xAdj]) {
            maxNeg[yAdj][xAdj] = -delta;
            idsNeg[yAdj][xAdj] = i;
          }
        }
      }
    }

    return { maxPos, idsPos, maxNeg, idsNeg };
  }

  print(channelIndices) {
    if (!channelIndices || channelIndices.length === 0) {
      for (let channel of this.channels) {
        console.table(channel);
      }
    } else {
      for (let channelIndex of channelIndices) {
        console.table(this.channels[channelIndex]);
      }
    }
  }
}

// if pt is outside bounds, update bounds to include
export function getNewBounds(bounds, x, y) {
  if (!bounds || bounds.length !== 4) {
    // new  bounds
    return [ x, y, x, y ];
  } else {
    let [ minX, minY, maxX, maxY ] = bounds;
    minX = Math.min(x, minX);
    minY = Math.min(y, minY);
    maxX = Math.max(x, maxX);
    maxY = Math.max(y, maxY);
    return [ minX, minY, maxX, maxY ];
  }
}

// should wrap a canvas object and specify what actions you can take on it
export default class SmartCanvas {
  constructor(shape, layer) {
    this.shape = shape;
    this.layer = layer;
    this.onChange = null;
    this.dirtyBounds = null;
    this.boundsPadding = this.layer.kernelSize[0];
    this.halfBoundsPadding = Math.floor(this.boundsPadding / 2);

    const numKernels = layer.filters;
    this.lineInfo = new LineInfo(shape, numKernels);
  }

  update() {
    if (!this.p) {
      return;
    }

    // update just the dirty part
    if (this.dirtyBounds) {
      let [ minX, minY, maxX, maxY ] = this.dirtyBounds;
      const halfKernelSize = Math.floor(11 / 2);
      const [ w, h ] = this.shape;
      minX = Math.max(0, minX - halfKernelSize);
      minY = Math.max(0, minY - halfKernelSize);
      maxX = Math.min(w - 1, maxX + halfKernelSize);
      maxY = Math.min(h - 1, maxY + halfKernelSize);
      const dirtyBoundsExpanded = [ minX, minY, maxX, maxY ];

      const imgArrSelection = getImgArrFromPSelection(this.p, dirtyBoundsExpanded);

      if (imgArrSelection.length > 0 && imgArrSelection[0].length > 0) {
        const channelsInSelection = eval2DArray(this.layer, imgArrSelection);
        this.lineInfo.update(channelsInSelection, dirtyBoundsExpanded, this.halfBoundsPadding);
      }

      if (this.onChange) {
        const imgArr = getImgArrFromP(this.p);
        this.onChange(this.lineInfo, imgArr);
      }

      this.dirtyBounds = null;
    }
  }

  testSegment(start, end) {
    if (!this.p) {
      return null;
    }
    const p = this.p;

    const { x: sx, y: sy } = start;
    const { x: ex, y: ey } = end;
    const dirtyBoundsExpanded = this.getExpandedBounds(start, end);
    const [ minX, minY, maxX, maxY ] = dirtyBoundsExpanded;
    const w = maxX - minX + 1;
    const h = maxY - minY + 1;

    // copy p to graphics
    const g = p.createGraphics(w, h);
    const toCopy = p.get(minX, minY, maxX + 1, maxY + 1);
    g.image(toCopy, 0, 0);
    // draw line
    g.strokeWeight(2);
    g.line(sx - minX, sy - minY, ex - minX, ey - minY);
    const imgArrSelection = getImgArrFromP(g);

    if (imgArrSelection.length > 0 && imgArrSelection[0].length > 0) {
      const oldImgArrSelection = getImgArrFromPSelection(p, dirtyBoundsExpanded);

      const channelsInSelection = eval2DArray(this.layer, imgArrSelection);

      const testLineInfo = LineInfo.copy(this.lineInfo);
      testLineInfo.update(channelsInSelection, dirtyBoundsExpanded, this.halfBoundsPadding);

      const channelsDebug = [];
      channelsDebug.push(LineInfo.diff(this.lineInfo.channels, testLineInfo.channels, dirtyBoundsExpanded, [0]));
      // channelsDebug.push(LineInfo.diff(this.lineInfo.channels, testLineInfo.channels, dirtyBoundsExpanded, [4]));
      // channelsDebug.push(LineInfo.diff(this.lineInfo.channels, testLineInfo.channels, dirtyBoundsExpanded, [8]));
      // channelsDebug.push(LineInfo.diff(this.lineInfo.channels, testLineInfo.channels, dirtyBoundsExpanded, [12]));
      // channelsDebug.push(LineInfo.diff(this.lineInfo.channels, testLineInfo.channels, dirtyBoundsExpanded, [16]));
      // channelsDebug.push(LineInfo.diff(this.lineInfo.channels, testLineInfo.channels, dirtyBoundsExpanded, [20]));

      const max = get2DArraySlice(testLineInfo.max, dirtyBoundsExpanded);
      const ids = get2DArraySlice(testLineInfo.ids, dirtyBoundsExpanded);

      return { lineInfo: testLineInfo, imgArr: imgArrSelection, oldImgArr: oldImgArrSelection, max, ids, channelsDebug };
    }

    return null;
  }

  addSegment(start, end) {
    if (!this.p) {
      return;
    }

    const { x: sx, y: sy } = start;
    const { x: ex, y: ey } = end;

    const [ w, h ] = this.shape;
    if (!(ex < 0 || ey < 0 || sx < 0 || sy < 0 || ex >= w || sx >= w || ey >= h || sy >= h)) {
      console.log(start, end);
      this.p.line(sx, sy, ex, ey);
      // update the bounds based on the new points
      this.dirtyBounds = this.getExpandedBounds(start, end);
    }
  }

  getExpandedBounds(start, end) {
    const { x: sx, y: sy } = start;
    const { x: ex, y: ey } = end;
    const padding = this.boundsPadding;
    let minX = Math.max(0, Math.min(sx, ex) - padding);
    let minY = Math.max(0, Math.min(sy, ey) - padding);
    const [ w, h ] = this.shape;
    let maxX = Math.min(w - 1, Math.max(sx, ex) + padding);
    let maxY = Math.min(h - 1, Math.max(sy, ey) + padding);

    const boundsExpanded = [ minX, minY, maxX, maxY ].map(v => Math.floor(v));
    return boundsExpanded;
  }

  getSketch() {
    return (p) => {
      this.p = p;

      p.setup = () => {
        p.pixelDensity(1);
        const [ w, h ] = this.shape;
        p.createCanvas(w, h);
        p.strokeWeight(2);

        // testing hack
        // setTimeout(() => {
        //   p.line(120, 150, 100, 100);
        //   this.dirtyBounds = [99, 99, 121, 151];
        //   this.update(p);
        // }, 100);
      };

      p.draw = () => {
        if (p.mouseIsPressed) {
          const start = { x: p.pmouseX, y: p.pmouseY };
          const end = { x: p.mouseX, y: p.mouseY };
          this.addSegment(start, end);
        } else {
          this.update();
        }
      };
    };
  }
}

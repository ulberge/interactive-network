import { getEmpty2DArray, deepCopy } from './helpers';
// import getKernels from './smartcanvasconfig';
import { getKernels } from './kernel';
import { getLayer, eval2DArray } from './tfhelpers';
import { getImgArrFromPixelsSelection } from './helpers';

// the kernels are their own documentation... we can generate images for them or draw them on the

class LineInfo {
  constructor(shape, numChannels) {
    if (shape && numChannels) {
      const [ w, h ] = shape;
      this.w = w;
      this.h = h;
      this.channels = [];
      for (let i = 0; i < numChannels; i += 1) {
        this.channels.push(getEmpty2DArray(h, w, 0));
      }
    }
  }

  updateChannels(channelsInSelection, bounds) {
    console.log('update', bounds);
    // update the channels in the location
    let [ minX, minY, maxX, maxY ] = bounds;
    const rowWidth = maxX - minX + 1;
    this.channels.forEach((channel, channelIndex) => {
      const update = channelsInSelection[channelIndex];
      for (let y = minY; y <= maxY; y += 1) {
        channel[y].splice(minX, rowWidth, ...update[y - minY]);
      }
    });
  }

  // Returns two 2D arrays with max id and value
  getMaxChannels() {
    const max = getEmpty2DArray(this.h, this.w, -1);
    const channelIds = getEmpty2DArray(this.h, this.w, -1);
    this.channels.forEach((channel, chIndex) => channel.forEach((row, rowIndex) => row.forEach((v, colIndex) => {
      if (v > 0.05 && v > max[rowIndex][colIndex]) {
        max[rowIndex][colIndex] = v;
        channelIds[rowIndex][colIndex] = chIndex;
      }
    })));
    return { max, ids: channelIds };
  }

  getChannelsAt(pos) {
    const { x, y } = pos;
    return this.channels.map(channel => channel[y][x]);
  }

  static copy(lineInfo) {
    const copy = new this();
    copy.channels = lineInfo.channels.map(channel => deepCopy(channel));
    copy.w = lineInfo.w;
    copy.h = lineInfo.h;
    return copy;
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
export class SmartCanvas {
  constructor(shape, onChange) {
    this.shape = shape;
    this.kernels = getKernels(11, 8, 4.3, 3.5);
    this.layer = getLayer(this.kernels.map(kernel => [kernel]));
    this.lineInfo = new LineInfo(shape, this.kernels.length);
    this.onChange = onChange;
    this.dirtyBounds = null;
  }

  update(p) {
    // update just the dirty part
    if (this.dirtyBounds) {
      p.loadPixels();
      let [ minX, minY, maxX, maxY ] = this.dirtyBounds;
      const halfKernelSize = Math.floor(11 / 2);
      const [ w, h ] = this.shape;
      minX = Math.max(0, minX - halfKernelSize);
      minY = Math.max(0, minY - halfKernelSize);
      maxX = Math.min(w - 1, maxX + halfKernelSize);
      maxY = Math.min(h - 1, maxY + halfKernelSize);
      const dirtyBoundsExpanded = [ minX, minY, maxX, maxY ];
      const imgArr = getImgArrFromPixelsSelection(p.pixels, p.width, dirtyBoundsExpanded);
      console.log(imgArr.length * imgArr[0].length);
      const channelsInSelection = eval2DArray(this.layer, imgArr);
      this.lineInfo.updateChannels(channelsInSelection, dirtyBoundsExpanded);
      this.onChange(this.lineInfo);
    }

    this.dirtyBounds = null;
  }

  getSketch() {
    return (p) => {
      p.setup = () => {
        p.pixelDensity(1);
        const [ w, h ] = this.shape;
        p.createCanvas(w, h);
        p.strokeWeight(2);

        // testing hack
        setTimeout(() => {
          p.line(120, 150, 100, 100);
          this.dirtyBounds = [99, 99, 121, 151];
          this.update(p);
        }, 100);
      };

      p.draw = () => {
        if (p.mouseIsPressed) {
          const start = { x: p.pmouseX, y: p.pmouseY };
          const end = { x: p.mouseX, y: p.mouseY };
          p.addSegment(start, end);
        } else {
          this.update(p);
        }
      };

      p.addSegment = (start, end) => {
        const { x: sx, y: sy } = start;
        const { x: ex, y: ey } = end;

        if (!(ex < 0 || ey < 0 || sx < 0 || sy < 0 || ex >= p.width || sx >= p.width || ey >= p.height || sy >= p.height)) {
          p.line(sx, sy, ex, ey);
          // update the bounds based on the new points
          this.dirtyBounds = getNewBounds(this.dirtyBounds, Math.floor(sx), Math.floor(sy));
          this.dirtyBounds = getNewBounds(this.dirtyBounds, Math.floor(ex), Math.floor(ey));
        }
      };

      p.testSegments = segments => {
        // should test adding the segments...
        // get the base pixels
        // make adjustments
        // choose one and return, or addSegment...?
      };
    };
  }
}

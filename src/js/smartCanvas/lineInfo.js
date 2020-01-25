import { getEmpty2DArray, slice2D, splice2D, getBoundsShape } from '../helpers';
import { eval2DArray } from '../tfhelpers';
import { getLayer } from '../../js/tfhelpers';

export default class LineInfo {
  /**
   * Returns a new LineInfo
   * @param {number[][][]} kernels - Kernels to use in eval layer
   * @param {number[]} shape - Array of [ w, h ] of channels
   */
  static create(kernels, shape) {
    const lineInfo = new LineInfo();
    lineInfo.shape = shape;
    lineInfo.kernels = kernels;
    lineInfo.layer = getLayer(kernels.map(k => [k]));
    lineInfo.channels = [];
    const [ w, h ] = shape;
    for (let i = 0; i < kernels.length; i += 1) {
      lineInfo.channels.push(getEmpty2DArray(h, w, 0));
    }
    // keep track of max channels at each location
    lineInfo.max = getEmpty2DArray(h, w, 0.05);
    lineInfo.ids = getEmpty2DArray(h, w, -1);

    return lineInfo;
  }

  /**
   * Returns a copy of a LineInfo, cropped by bounds at pool level and channels
   * @param {number[]} channelIndices - Indices of channels to keep
   * @param {number[]} bounds - Area of those channels to keep [ minX, minY, maxX, maxY ]
   */
  copy(bounds, channelIndices=null) {
    if (!channelIndices) {
      channelIndices = this.kernels.map((k, i) => i); // get all indices
    }

    const copy = new LineInfo();
    // filter the kernels to the indices given
    copy.kernels = this.kernels.filter((k, i) => channelIndices.includes(i));
    copy.layer = getLayer(copy.kernels.map(k => [k]));

    copy.channels = [];
    for (let i of channelIndices) {
      const channel = this.channels[i];
      const crop = slice2D(channel, bounds);
      copy.channels.push(crop);
    }

    // recalculate max/ids
    const [ w, h ] = getBoundsShape(bounds);
    copy.shape = [ w, h ];
    copy.max = getEmpty2DArray(h, w, 0.05);
    copy.ids = getEmpty2DArray(h, w, -1);
    copy._updateMaxChannels();

    return copy;
  }

  /**
   * Update the state of the lineInfo given this dirty area and its location
   * @param {number[][]} dirtyImgArr - 2D array of the image area that is dirty (should include padding)
   * @param {{x: number, y: number}} offset - Offset of img arr from origin
   * @param {boolean} makeBackup - If true, store the area in the backup cache before change is made (for testSegment)
   */
  update(dirtyImgArr, dirtyBounds, makeBackup=false) {
    // calc new value of channels for dirty area
    const channelUpdates = eval2DArray(this.layer, dirtyImgArr);

    // crop channel updates to area that has full coverage (ie. "valid" activations, not "same")
    const padding = this.getPadding();
    const h = dirtyImgArr.length;
    const w = dirtyImgArr[0].length;
    // bounds for cropping the channel updates
    const cropBounds = [ padding, padding, w - padding, h - padding ];
    const [ wCropBounds, hCropBounds ] = getBoundsShape(cropBounds);

    // bounds of changed area
    const offset = { x: dirtyBounds[0], y: dirtyBounds[1] };
    const changeBounds = [ padding + offset.x, padding + offset.y, padding + offset.x + wCropBounds, padding + offset.y + hCropBounds ];
    const changeOffset = { x: changeBounds[0], y: changeBounds[1] };

    this.backup = {
      changeBounds,
      channels: []
    };
    for (let i = 0; i < this.channels.length; i += 1) {
      const channelUpdate = channelUpdates[i];
      const channel = this.channels[i];

      if (makeBackup) {
        // make a copy of the channel before changing
        const channelBackup = slice2D(channel, changeBounds);
        // const channelBackup = slice2D(channel);
        this.backup.channels.push(channelBackup);
      }

      // remove padding (we evaluated the receptive field of what we cared about, but we only want to update the channels
      // for the center of the receptive field)
      const channelCropped = slice2D(channelUpdate, cropBounds);
      // insert cropped at offset + padding
      splice2D(channel, channelCropped, changeOffset);
    }

    // this._updateMaxChannels();
    this._updateMaxChannels(changeBounds);
  }

  // Copy backup into channels and clear backup
  restore() {
    // console.log('pre restore', this.channels[0].flat().filter(v => v > 0));
    const { channels: channelBackups, changeBounds } = this.backup;
    for (let i = 0; i < this.channels.length; i += 1) {
      const channelBackup = channelBackups[i];
      const channel = this.channels[i];
      const changeBoundsOffset = { x: changeBounds[0], y: changeBounds[1] };
      splice2D(channel, channelBackup, changeBoundsOffset);
      // splice2D(channel, channelBackup);
    }
    // console.log('post restore', this.channels[0].flat().filter(v => v > 0));
    // this._updateMaxChannels();
    this._updateMaxChannels(changeBounds);
    this.backup = null;
  }

  /**
   * Return the channels within the given bounds
   * @param {number[]} bounds - Area to crop to [ minX, minY, maxX, maxY ]
   */
  getChannels(bounds) {
    return this.channels.map(channel => slice2D(channel, bounds));
  }

  getChannelsAt(pt) {
    return this.getChannels([ pt.x, pt.y, pt.x + 1, pt.y + 1 ]).map(channel => channel[0][0]);
  }

  // Returns the padding for the receptive field of the kernels for this LineInfo
  getPadding() {
    return Math.floor(this.layer.kernelSize[0] / 2) + 1; // +1 since strokeWidth = 2
  }

  /**
   * Update max/ids in place within the given bounds for the given channels
   * @param {number[]} bounds - Area that needs to be rechecked [ minX, minY, maxX, maxY ]
   */
  _updateMaxChannels(bounds=null) {
    if (!bounds) {
      bounds = [ 0, 0, this.max.length, this.max[0].length ];
    }

    let [ minX, minY, maxX, maxY ] = bounds;
    for (let y = minY; y < maxY; y += 1) {
      for (let x = minX; x < maxX; x += 1) {
        let max = 0.05;
        let id = -1;
        this.channels.forEach((channel, channelIndex) => {
          if (channel[y][x] > max) {
            max = channel[y][x];
            id = channelIndex;
          }
        });
        this.max[y][x] = max;
        this.ids[y][x] = id;
      }
    }
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

  print(channelIndices=null) {
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

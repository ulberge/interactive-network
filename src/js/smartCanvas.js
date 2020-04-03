import nj from 'numjs';
import { dtype } from './conv/convArray';
import Network from './conv/network';
import p5 from 'p5';

function limit(v, min, max) {
  return v < min ? min : (v >= max ? max - 0.001 : v);
}

function safePt(pt, bounds) {
  const [ minX, minY, maxX, maxY ] = bounds;
  const x = limit(pt.x, minX, maxX);
  const y = limit(pt.y, minY, maxY);
  return new p5.Vector(x, y);
}

// Adapted from : https://medium.com/mlreview/a-guide-to-receptive-field-arithmetic-for-convolutional-neural-networks-e0f514068807
function outFromIn(layer, layerIn) {
  // const n_in = layerIn[0];
  const j_in = layerIn[0];
  const r_in = layerIn[1];
  const pool_in = layerIn[3];
  // const start_in = layerIn[3];
  const k = layer[0];// kernelSize;
  const s = layer[1];// stride;
  // const p = layer[2];// padding;
  const pool_size = layer[2];// poolSize;

  // const n_out = Math.floor((n_in - k + 2*p)/s) + 1;
  // const actualP = (n_out-1)*s - n_in + k;
  // const pR = Math.ceil(actualP/2);
  // const pL = Math.floor(actualP/2);

  const j_out = j_in * s;
  const r_out = r_in + (k - 1)*j_in;
  const pool_out = pool_size * pool_in;
  const start_out = pool_out / 2;
  return [j_out, r_out, start_out, pool_out];
  // return [n_out, j_out, r_out, start_out];
}

function getReceptiveFieldInfos(layerInfos, canvasSize) {
  const layers = layerInfos.map(layer => {
    if (layer.type === 'conv2d') {
      return [layer.kernelSize, 1, 1];
    } else {
      return [layer.poolSize, layer.poolSize, layer.poolSize];
    }
  })

  let currentLayer = [1, 1, 0.5, 1];
  console.log(currentLayer);
  const receptiveFieldInfos = [];
  layers.forEach(layer => {
    currentLayer = outFromIn(layer, currentLayer);
    receptiveFieldInfos.push(currentLayer.slice(0, 3)); // we can prune the number of features, not useful later
    console.log(currentLayer, layer);
  });

  return receptiveFieldInfos;
}

export default class SmartCanvas {
  constructor(p, pOverlay, shape, layerInfos) {
    // assumes p is blank
    this.p = p;
    this.pOverlay = pOverlay;
    this.shape = shape;
    this.layerInfos = layerInfos;
    this.network = new Network(this.shape, layerInfos);
    this.receptiveFieldInfos = getReceptiveFieldInfos(layerInfos, shape[0]);
    this._dirtyBounds = null;
    this._backup = null;
    this._listeners = [];
  }

  // do full calc once p5 is ready
  init() {
    if (!this.p._setupDone) {
      setTimeout(() => this.init(), 10);
    } else {
      this.forceFullUpdate();
    }
  }

  reset() {
    this.p.clear();
    this.forceFullUpdate();
  }

  get bounds() {
    const [ maxY, maxX ] = this.shape;
    return [ 0, 0, maxX, maxY ];
  }

  getReceptiveField(layerIndex, location) {
    const [ jump, size, offset ] = this.receptiveFieldInfos[layerIndex];
    const { x, y } = location;
    // get center of receptive field
    const cx = (jump * x) + offset;
    const cy = (jump * y) + offset;
    // get bounds
    let start = new p5.Vector(cx - (size / 2), cy - (size / 2));
    let end = new p5.Vector(cx + (size / 2), cy + (size / 2));
    start = safePt(start, this.bounds);
    end = safePt(end, this.bounds);
    return [start.x, start.y, end.x, end.y];
  }

  /**
   * Draw a new line segment and update the dirtyBounds for this SmartCanvas
   * @param {{x: number, y: number}} start - Start point of line segment
   * @param {{x: number, y: number}} end - End point of line segment
   * @param {boolean} makeBackup - If true, store the affected canvas area in the backup cache before change is applied.
   */
  addSegment(start, end, makeBackup=false) {
    // sanitize
    start = safePt(start, this.bounds);
    end = safePt(end, this.bounds);
    const bounds = this._getLineBounds(start, end);
    if (makeBackup) {
      if (this._backup !== null) {
        console.log('Overwriting existing backup! Should call restore() first');
      }
      const w = bounds[2] - bounds[0];
      const h = bounds[3] - bounds[1];
      this._backup = {
        img: this.p.get(...bounds.slice(0, 2), w, h),
        bounds
      };
    }

    this.p.line(start.x, start.y, end.x, end.y);
    this._updateDirtyBounds(bounds);
  }

  /**
   * Restore the image are from the backup cache to what it was previously and update dirty bounds to include
   */
  restore() {
    if (this._backup !== null) {
      const { img, bounds } = this._backup;
      const [ x, y ] = bounds.slice(0, 2);
      const w = bounds[2] - bounds[0];
      const h = bounds[3] - bounds[1];
      // erase area behind since these are transparent images
      this.p.push();
      this.p.erase();
      this.p.noStroke();
      this.p.rect(x, y, w, h);
      this.p.noErase();
      this.p.pop();
      // draw backup image on fresh background
      this.p.image(img, x, y);
      this._backup = null;
      this._updateDirtyBounds(bounds);
    } else {
      console.log('Backup failed, no backup cache available');
    }
  }

  /**
   * Recalculate the network activations within the current dirty bounds and reset dirty bounds to null
   */
  update(notify=true) {
    if (this._dirtyBounds) {
      // get dirty area
      let ct0 = Date.now();
      const [ sx, sy, ex, ey ] = this._dirtyBounds;
      const g = this.p.get(sx, sy, ex - sx, ey - sy);
      // console.log('get dirty area', ex - sx, ey - sy, Date.now() - ct0);
      g.loadPixels();
      // console.log('load dirty area', ex - sx, ey - sy, Date.now() - ct0);
      ct0 = Date.now();

      const dirty = nj[dtype](g.pixels).reshape(g.height, g.width, 4).slice(null, null, [3, 4]).reshape(1, g.height, g.width);
      // const dirty = '';
      // console.log('reshape', Date.now() - ct0);
      this.network.run(dirty, this._dirtyBounds);
      ct0 = Date.now();
      if (notify) {
        this._notifyListeners({ network: this.network, dirtyBounds: [...this._dirtyBounds] });
      }
      // console.log('notify', Date.now() - ct0);
      // let t = Date.now() - ct0;
      // if (typeof window.ttot === 'undefined') {
      //   window.ttot = 0;
      //   window.tcount = 0;
      // } else {
      //   window.ttot += t;
      //   window.tcount += 1;
      // }
      // console.log(window.ttot / window.tcount, ' current -> ', t);
      this._dirtyBounds = null; // reset dirty bounds
    }
  }

  forceFullUpdate() {
    this._dirtyBounds = this.bounds;
    this.update();
  }

  /**
   * Expand the dirty bounds to include the given bounds
   */
  _updateDirtyBounds(bounds) {
    if (!this._dirtyBounds) {
      this._dirtyBounds = bounds;
    } else {
      const [ sx, sy, ex, ey ] = bounds;
      const [ dsx, dsy, dex, dey ] = this._dirtyBounds;
      this._dirtyBounds = [ Math.min(sx, dsx), Math.min(sy, dsy), Math.max(ex, dex), Math.max(ey, dey) ];
    }
  }

  _getLineBounds(start, end) {
    const pad = 1; // stroke weight is 2 right now, so pad by 1
    let minX = Math.min(start.x, end.x) - pad;
    let minY = Math.min(start.y, end.y) - pad;
    let maxX = Math.max(start.x, end.x) + pad + 1;
    let maxY = Math.max(start.y, end.y) + pad + 1;
    const bounds = [ minX, minY, maxX, maxY ].map(v => Math.floor(v));
    return bounds;
  }

  addListener(fn) {
    this._listeners.push(fn);
  }

  removeListener(fn) {
    const i = this._listeners.indexOf(fn);
    if (i > -1) {
      this._listeners.splice(i, 1);
    }
  }

  _notifyListeners(...params) {
    for (let fn of this._listeners) {
      if (fn) {
        fn(...params);
      }
    }
  }
}

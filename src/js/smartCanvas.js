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

export default class SmartCanvas {
  constructor(p, shape, layerInfos) {
    // assumes p is blank
    this.p = p;
    this.shape = shape;
    this.layerInfos = layerInfos;
    this.network = new Network(this.shape, layerInfos);
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
      const [ sx, sy, ex, ey ] = this._dirtyBounds;
      const g = this.p.get(sx, sy, ex - sx, ey - sy);
      g.loadPixels();
      const dirty = nj[dtype](g.pixels).reshape(g.height, g.width, 4).slice(null, null, [3, 4]).reshape(1, g.height, g.width);
      this.network.run(dirty, this._dirtyBounds);
      if (notify) {
        this._notifyListeners({ network: this.network, dirtyBounds: [...this._dirtyBounds] });
      }
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

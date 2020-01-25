import { getImgArrFromPSelection, combineBounds, limitBounds, getLineBounds } from '../helpers';
import LineInfo from './lineInfo';
import p5 from 'p5';

// should wrap a canvas object and specify what actions you can take on it
export default class SmartCanvas {
  constructor(el, kernels, shape) {
    this.shape = shape;
    this.bounds = [0, 0, shape[0], shape[1] ];
    this.lineInfo = LineInfo.create(kernels, shape);
    this.p = new p5(this._getSketch(), el);
    this.listeners = [];
    this.dirtyBounds = null;
  }

  /**
   * Draw a new line segment and update the dirtyBounds for this canvas
   * @param {{onChange: function}} l - Listener to onChange events to add
   * @param {{x: number, y: number}} end - End point of line segment
   */
  addListener(fn) {
    this.listeners.push(fn);
  }

  removeListener(fn) {
    const i = this.listeners.indexOf(fn);
    if (i > -1) {
      this.listeners.splice(i, 1);
    }
  }

  notifyListeners(...params) {
    for (let fn of this.listeners) {
      if (fn) {
        fn(...params);
      }
    }
  }

  /**
   * Draw a new line segment and update the dirtyBounds for this canvas
   * @param {{x: number, y: number}} start - Start point of line segment
   * @param {{x: number, y: number}} end - End point of line segment
   */
  addSegment(start, end) {
    const { x: sx, y: sy } = start;
    const { x: ex, y: ey } = end;
    // draw line
    this.p.line(sx, sy, ex, ey);
    this._updateDirtyBounds(start, end);
    // console.log(start, end, this.dirtyBounds);
  }

  /**
   * Update the LineInfo based on line segments added since last "update()"
   * @param {Object} p - p5 sketch
   */
  update() {
    if (this.dirtyBounds) {
      // update LineInfo at dirty part of image
      const dirtyImgArr = getImgArrFromPSelection(this.p, this.dirtyBounds);
      const offset = { x: this.dirtyBounds[0], y: this.dirtyBounds[1] };
      this.lineInfo.update(dirtyImgArr, this.dirtyBounds);
      this.notifyListeners({ lineInfo: this.lineInfo, dirtyImgArr: dirtyImgArr, offset, dirtyBounds: [...this.dirtyBounds] });
      // reset dirty bounds
      this.dirtyBounds = null;
    }
  }

  /**
   * Expand the dirtyBounds based on these two points (+ padding)
   * @param {{x: number, y: number}} start - Start point of line segment
   * @param {{x: number, y: number}} end - End point of line segment
   */
  _updateDirtyBounds(start, end) {
    // padding to add to any change for marking dirty area (comes from the kernel size of the LineInfo)
    const dirtyBounds = limitBounds(getLineBounds(start, end, this.lineInfo.getPadding() * 2), this.bounds);
    this.dirtyBounds = combineBounds(this.dirtyBounds, dirtyBounds);
  }

  /**
   * return the p5 sketch for the SmartCanvas
   */
  _getSketch() {
    let dirty = false;
    return (p) => {
      this.p = p;
      p.setup = () => {
        p.pixelDensity(1);
        const [ w, h ] = this.shape;
        p.createCanvas(w, h);
        p.strokeWeight(2);
      };

      p.draw = () => {
        if (p.mouseIsPressed) {
          // while mouse is pressed, add line segments to canvas
          const start = { x: p.pmouseX, y: p.pmouseY };
          const end = { x: p.mouseX, y: p.mouseY };
          if (!(start.x < 0 || start.y < 0 || end.x < 0 || end.y < 0 || end.x >= p.width || start.x >= p.width || end.y >= p.height || start.y >= p.height)) {
            this.addSegment(start, end);
            dirty = true;
          }
        } else {
          // at end of mouse press, update LineInfo
          if (dirty) {
            this.update(p);
            dirty = false;
          }
        }
      };
    };
  }
}

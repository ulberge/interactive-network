import { getImgArrFromP, getImgArrFromPSelection, slice2D, getBoundsShape, limitBounds, dilateBounds, getLineBounds } from '../helpers';
import p5 from 'p5';

// should wrap a canvas object and specify what actions you can take on it
export default class Tester {
  constructor(p, lineInfo, bounds, getScore) {
    this.p = p;
    this.lineInfo = lineInfo;
    // bounds of the cropped view, we need to expand...
    this.lineInfoBounds = bounds;
    this.bounds = dilateBounds(bounds, this.lineInfo.getPadding());
    this.offset = new p5.Vector(bounds[0], bounds[1]);
    this.getScore = getScore;
  }

  /**
   * Test out this line segment and get the results of what would happen
   * @param {{x: number, y: number}} start - Start point of line segment
   * @param {{x: number, y: number}} end - End point of line segment
   */
  testSegment(start, end) {
    // There are 3 scopes: this.p (the whole canvas), this.lineInfo (the cropped LineInfo for this tester), and dirtyBounds (the padded area around this change (the padding needs to be))
    const { x: sx, y: sy } = start;
    const { x: ex, y: ey } = end;

    const dirtyBounds = limitBounds(getLineBounds(start, end, this.lineInfo.getPadding() * 2), this.bounds);
    const [ w, h ] = getBoundsShape(dirtyBounds);
    const [ minX, minY, maxX, maxY ] = dirtyBounds;
    // this offset should be relative to lineInfo (which is not dilated)
    const dirtyBoundsLocalOffset = [ minX - this.lineInfoBounds[0], minY - this.lineInfoBounds[1], maxX - this.lineInfoBounds[0], maxY - this.lineInfoBounds[1] ]

    // cut out piece of original image (shifted by offset of this tester's cropped view)
    const oldImg = this.p.get(minX, minY, maxX, maxY);
    const oldImgArr = getImgArrFromPSelection(this.p, dirtyBounds);

    // create graphics the size of receptive field for the dirty area
    const g = this.p.createGraphics(w, h);
    g.image(oldImg, 0, 0);
    g.strokeWeight(2);
    // adjust line to dirtyBounds view...
    g.line(sx - minX, sy - minY, ex - minX, ey - minY);
    const dirtyImgArr = getImgArrFromP(g);

    // collect some info before change
    // const channelsOriginal = this.lineInfo.getChannels(dirtyBounds);
    const maxOriginal = slice2D(this.lineInfo.max, dirtyBoundsLocalOffset);
    const idsOriginal = slice2D(this.lineInfo.ids, dirtyBoundsLocalOffset);

    // update the LineInfo temporarily to get the resulting score
    this.lineInfo.update(dirtyImgArr, dirtyBoundsLocalOffset, true);
    const score = this.getScore(this.lineInfo);

    // collect some info after change
    // const channelsUpdated = this.lineInfo.getChannels(dirtyBounds);
    const channelsDebug = [];
    // debugger;
    // channelsDebug.push(LineInfo.diff(channelsOriginal, channelsUpdated, dirtyBounds, [0]));
    // channelsDebug.push(LineInfo.diff(channelsOriginal, channelsUpdated, dirtyBounds, [1]));
    const max = slice2D(this.lineInfo.max, dirtyBoundsLocalOffset);
    const ids = slice2D(this.lineInfo.ids, dirtyBoundsLocalOffset);
    const results = {
      score,
      imgArr: dirtyImgArr,
      oldImgArr: oldImgArr,
      // channelsOriginal,
      // channelsUpdated,
      max,
      ids,
      maxOriginal,
      idsOriginal,
      channelsDebug
    };

    // restore the LineInfo to its state from before this test
    this.lineInfo.restore();

    // const results = {
    //   score: Math.random(),
    //   channelsDebug: []
    // };

    return results;
  }
}


/**
 * Returns an empty p5 sketch
 */
export function getEmptySketch(shape=null, scale=1) {
  return (p) => {
    p.setup = () => {
      p.pixelDensity(1);
      if (shape) {
        const [ h, w ] = shape;
        p.createCanvas(w * scale, h * scale);
      } else {
        p.createCanvas(1, 1);
      }
      p.noLoop();
    };

    p.update = (shape, scale) => {
      const [ h, w ] = shape;
      if ((h * scale) !== p.height || (w * scale) !== p.width) {
        p.resizeCanvas(w * scale, h * scale);
      } else {
        p.clear();
      }
    }
  };
}

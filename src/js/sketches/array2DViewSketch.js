/**
 * Returns a p5 sketch that can draw a 2D array
 */
export function getSketch() {
  return (p) => {
    /**
     * Draw a 2D array at the given scale
     * @param {Number[][]} imgArr - 2D array to initialize canvas (values between [-1, 1])
     * @param {Number} scale - Scale at which to render (uses css, hopefully pixelated, but depends on browser)
     */
    p._draw = (imgArr, scale=1, fixedWidth=null) => {
      if (!imgArr) {
        return;
      }

      // protect against rendering before sketch ready
      if (!p._setupDone) {
        setTimeout(() => p._draw(imgArr, scale, fixedWidth), 10);
        return;
      }

      const h = imgArr.length;
      const w = imgArr[0].length;
      if (h !== p.height || w !== p.width) {
        p.resizeCanvas(w, h);
      }

      if (fixedWidth) {
        p.canvas.style.height = fixedWidth + 'px';
        p.canvas.style.width = fixedWidth + 'px';
      } else {
        p.canvas.style.height = (h * scale) + 'px';
        p.canvas.style.width = (w * scale) + 'px';
      }

      p.clear();

      // normalize to max value (positive or negative)
      const flatArr = imgArr.flat();
      let max = Math.max(...flatArr);
      max = max > 0 ? max : -Math.min(...flatArr);
      imgArr = imgArr.map(row => row.map(v => v / max));

      // render pixels using image
      p.loadPixels();
      for (let y = 0; y < imgArr.length; y += 1) {
        for (let x = 0; x < imgArr[0].length; x += 1) {
          const v = imgArr[y][x] * 255;
          if (v >= 0) {
            p.set(x, y, p.color(0, 0, 0, v));
          } else if (v < 0) {
            p.set(x, y, p.color(214, 30, 30, -v * 0.75));
          }
        }
      }
      p.updatePixels();
    }

    p.setup = () => {
      p.pixelDensity(1);
      p.createCanvas(1, 1);
      p.stroke(255);
      p.noLoop();
      p.noSmooth();
    };
  };
}

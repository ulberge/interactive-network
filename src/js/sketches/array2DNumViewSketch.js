/**
 * Returns a p5 sketch that can draw a 2D array
 */
export function getSketch() {
  const fontSize = 14;
  const lineHeight = 48;

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

      const h = imgArr.length * lineHeight;
      const w = imgArr[0].length * lineHeight;
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

      // render pixels using image
      for (let y = 0; y < imgArr.length; y += 1) {
        for (let x = 0; x < imgArr[0].length; x += 1) {
          const v = imgArr[y][x].toFixed(0);
          p.text(v, (x + 0.5) * lineHeight, (y + 0.5) * lineHeight);
        }
      }
    }

    p.setup = () => {
      p.pixelDensity(1);
      p.createCanvas(1, 1);
      p.fill(0);
      p.textSize(fontSize);
      p.textAlign(p.CENTER, p.CENTER);
      p.noLoop();
    };
  };
}

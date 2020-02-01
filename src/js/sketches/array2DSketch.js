/**
 * Returns a p5 sketch that can draw a 2D array
 */
export function getSketch() {
  const gridWeight = 0.08;

  return (p) => {
    /**
     * Draw a 2D array at the given scale
     * @param {Number[][]} imgArr - 2D array to initialize canvas (values between [-1, 1])
     * @param {Number} scale - Scale to draw the canvas
     */
    p._draw = (imgArr, scale=1) => {
      if (!imgArr) {
        return;
      }

      if (!p._setupDone) {
        setTimeout(() => p._draw(imgArr, scale), 10);
        return;
      }

      const h = imgArr.length * scale;
      const w = imgArr[0].length * scale;
      if (h !== p.height || w !== p.width) {
        p.resizeCanvas(w, h);
      }

      p.clear();
      p.strokeWeight(scale * gridWeight);

      // normalize to max value (positive or negative)
      let max = Math.max(...imgArr.flat());
      imgArr = imgArr.map(row => row.map(v => v / (max || 1)));

      for (let y = 0; y < imgArr.length; y += 1) {
        for (let x = 0; x < imgArr[0].length; x += 1) {
          const v = imgArr[y][x] * 255;
          if (v > 0) {
            p.fill(0, 0, 0, v);
            p.rect(x * scale, y * scale, scale, scale);
          } else if (v < 0) {
            p.fill(214, 30, 30, -v / 2);
            p.rect(x * scale, y * scale, scale, scale);
          }
        }
      }
    }

    p.setup = () => {
      p.pixelDensity(1);
      p.createCanvas(1, 1);
      p.stroke(255);
      p.noLoop();
    };
  };
}

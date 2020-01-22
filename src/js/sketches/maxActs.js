/**
 * Returns a p5 sketch that can draw a 2D array
 */
export function getSketch() {
  /**
   * Draw a 2D array at the given scale
   * @param {p5} p - p5 sketch
   * @param {Number[][]} ids - 2D array of ids
   * @param {Number[][]} max - 2D array of value for max id
   * @param {Number} scale - Scale to draw the canvas
   */
  function drawIconArray(p, ids, max, kernels, scale=1) {
    if (!ids || ids.length === 0) {
      return;
    }

    p.push();
    for (let y = 0; y < ids.length; y += 1) {
      for (let x = 0; x < ids[0].length; x += 1) {
        let key = ids[y][x];
        let intensity = max[y][x];
        if (intensity > 0.2) {
          const kernel = kernels[key];
          drawIcon(p, kernel, intensity, scale, [ x * scale, y * scale ]);
        }
      }
    }
    p.pop();
  }

  function drawIcon(p, imgArr, intensity, scale=1, location) {
    if (!imgArr || imgArr.length === 0) {
      return;
    }

    // normalize
    let max = Math.max(...imgArr.map(row => Math.max(...row.map(v => Math.abs(v)))));
    imgArr = imgArr.map(row => row.map(v => v / max));

    const pixelScale = scale / imgArr.length;

    p.push();
    const [ ox, oy ] = location;
    p.translate(ox, oy);
    p.noStroke();
    for (let y = 0; y < imgArr.length; y += 1) {
      for (let x = 0; x < imgArr[0].length; x += 1) {
        let v = imgArr[y][x] * 255;
        if (v > 0) {
          p.fill(0, 0, 0, v * intensity);
          p.rect(x * pixelScale, y * pixelScale, pixelScale, pixelScale);
        } else if (v < 0) {
          p.fill(255, 0, 0, intensity * -v / 2);
          p.rect(x * pixelScale, y * pixelScale, pixelScale, pixelScale);
        }
      }
    }
    p.pop();
  }

  return (p) => {
    p.customDraw = (ids, max, kernels, scale=1) => {
      if (!ids || ids.length === 0) {
        return;
      }

      // protection from attempting to draw before p5 is setup
      if (!p._setupDone) {
        setTimeout(() => p.customDraw(ids, max, kernels, scale), 10);
        return;
      }

      const h = ids.length * scale;
      const w = ids[0].length * scale;
      if (h !== p.height || w !== p.width) {
        p.resizeCanvas(w, h);
      }

      p.clear();
      drawIconArray(p, ids, max, kernels, scale);
    }

    p.setup = () => {
      p.pixelDensity(1);
      p.createCanvas(1, 1);
      p.stroke(255);
    };
  };
}

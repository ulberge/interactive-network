/**
 * Returns a p5 sketch that can draw a 2D array
 */
export function getArraySketch(withColors=false, normalize=false) {
  const gridWeight = 0.08;

  return (p) => {
    /**
     * Draw a 2D array at the given scale
     * @param {Number[][]} imgArr - 2D array to initialize canvas (values between [-1, 1])
     * @param {Number} scale - Scale to draw the canvas
     */
    p.customDraw = (imgArr, scale=1) => {
      if (!imgArr || imgArr.length === 0) {
        return;
      }

      if (!p._setupDone) {
        setTimeout(() => p.customDraw(imgArr, scale), 10);
        return;
      }

      p._scale = scale;
      const h = imgArr.length * scale;
      const w = imgArr[0].length * scale;
      if (h !== p.height || w !== p.width) {
        p.resizeCanvas(w, h);
      }

      p.clear();
      p.strokeWeight(p._scale * gridWeight);

      // normalize to max value (positive or negative)
      let imgArr_c = imgArr;
      if (normalize) {
        let max = Math.max(...imgArr.map(row => Math.max(...row.map(v => Math.abs(v)))));
        imgArr_c = imgArr.map(row => row.map(v => v / max));
      }

      const colorMap = {};
      const colors = ['#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075'];

      for (let y = 0; y < imgArr_c.length; y += 1) {
        for (let x = 0; x < imgArr_c[0].length; x += 1) {
          // const v = (imgArr[y][x] / max) * 255;
          const v = imgArr_c[y][x] * 255;
          if (withColors) {
            if (v >= 0) {
              const key = Math.floor(v);
              if (!(key in colorMap)) {
                if (Object.keys(colorMap).length < colors.length) {
                  colorMap[key] = p.color(colors[Object.keys(colorMap).length]);
                } else {
                  colorMap[key] = p.color(Math.random() * 155, Math.random() * 155, Math.random() * 155);
                }
                // colorMap[key] = p.color(Math.random() * 155, Math.random() * 155, Math.random() * 155);
              }
              const c = colorMap[key];
              p.fill(c);
              p.rect(x * p._scale, y * p._scale, p._scale, p._scale);
            }
          } else {
            if (v > 0) {
              p.fill(0, 0, 0, v);
              p.rect(x * p._scale, y * p._scale, p._scale, p._scale);
            } else if (v < 0) {
              p.fill(255, 0, 0, -v / 2);
              p.rect(x * p._scale, y * p._scale, p._scale, p._scale);
            }
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

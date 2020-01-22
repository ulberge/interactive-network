/**
 * Returns a p5 sketch that can draw a 2D array
 */
export function getSketch() {
  const gridWeight = 0.08;

  const drawArray = (p, imgArr, oldImgArr, scale) => {
    for (let y = 0; y < imgArr.length; y += 1) {
      for (let x = 0; x < imgArr[0].length; x += 1) {
        const v = imgArr[y][x] * 255;
        const vOld = oldImgArr[y][x] * 255;
        if (v > 0 || vOld > 0) {
          let c;
          if (v - vOld > 20) {
            c = p.color('#e6194b');
          } else {
            c = p.color('#000');
          }

          c.setAlpha(v);
          p.fill(c);
          p.rect(x * scale, y * scale, scale, scale);
        }
      }
    }
  }

  return (p) => {
    p.customDraw = (oldImgArr, imgArr, scale) => {
      if (!imgArr || imgArr.length === 0) {
        return;
      }

      if (!p._setupDone) {
        setTimeout(() => p.customDraw(imgArr, scale), 10);
        return;
      }

      const h = imgArr.length * scale;
      const w = imgArr[0].length * scale;
      if (h !== p.height || w !== p.width) {
        p.resizeCanvas(w, h);
      }

      p.clear();
      p.strokeWeight(scale * gridWeight);

      drawArray(p, imgArr, oldImgArr, scale);
    }

    p.setup = () => {
      p.pixelDensity(1);
      p.createCanvas(1, 1);
      p.stroke(255);
      p.noLoop();
    };
  };
}

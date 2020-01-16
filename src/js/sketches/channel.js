import { get2DArraySlice } from '../helpers';
import { getKernels } from '../kernel';

/**
 * Returns a p5 sketch that can draw a 2D array
 */
export function getChannelSketch() {
  // spacing between rectangles
  const gridWeight = 0.08;
  // some good contrast colors to start
  const colors = ['#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075'];
  const getColor = i => {
    if (i < colors.length) {
      return colors[i];
    } else {
      // overrun, start making random colors
      return [Math.random() * 155, Math.random() * 155, Math.random() * 155];
    }
  }
  let imgArr_last = null;
  let scale_last = 1;
  let zoomPresent = false;

  const kernels = getKernels(11, 8, 3.9, 3.5);

  /**
   * Draw a 2D array at the given scale
   * @param {p5} p - p5 sketch
   * @param {Number[][]} imgArr - 2D array of ids
   * @param {Number} scale - Scale to draw the canvas
   */
  function drawColorArray(p, imgArr, scale=1) {
    if (!imgArr || imgArr.length === 0) {
      return;
    }

    p.strokeWeight(scale * gridWeight);
    const colorMap = {};
    for (let y = 0; y < imgArr.length; y += 1) {
      for (let x = 0; x < imgArr[0].length; x += 1) {
        let key = imgArr[y][x];
        if (key >= 0) {
          let c = colorMap[key];
          if (!c) {
            c = p.color(getColor(Object.keys(colorMap).length));
            colorMap[key] = c;
          }
          p.fill(c);
          p.rect(x * scale, y * scale, scale, scale);
        }
      }
    }
  }

  function drawIconArray(p, imgArr, scale=1, location=[0,0]) {
    if (!imgArr || imgArr.length === 0) {
      return;
    }

    p.push();
    const [ ox, oy ] = location;
    p.translate(ox, oy);
    p.strokeWeight(scale * gridWeight);
    for (let y = 0; y < imgArr.length; y += 1) {
      for (let x = 0; x < imgArr[0].length; x += 1) {
        let key = imgArr[y][x];
        const kernel = kernels[key];
        drawIcon(p, kernel, (scale / imgArr.length), [ x * scale, y * scale ]);
      }
    }
    p.pop();
  }

  function drawIcon(p, imgArr, scale=1, location) {
    if (!imgArr || imgArr.length === 0) {
      return;
    }

    // normalize
    let max = Math.max(...imgArr.map(row => Math.max(...row.map(v => Math.abs(v)))));
    imgArr = imgArr.map(row => row.map(v => v / max));

    p.push();
    p.noStroke();
    const [ ox, oy ] = location;
    p.translate(ox, oy);
    for (let y = 0; y < imgArr.length; y += 1) {
      for (let x = 0; x < imgArr[0].length; x += 1) {
        let v = imgArr[y][x] * 255;
        if (v > 0) {
          p.fill(0, 0, 0, v);
          p.rect(x * scale, y * scale, scale, scale);
        } else if (v < 0) {
          p.fill(255, 0, 0, -v / 2);
          p.rect(x * scale, y * scale, scale, scale);
        }
      }
    }
    p.pop();
  }

  return (p) => {
    p.customDraw = (imgArr, scale=1) => {
      if (!imgArr || imgArr.length === 0) {
        return;
      }

      // protection from attempting to draw before p5 is setup
      if (!p._setupDone) {
        setTimeout(() => p.customDraw(imgArr, scale), 10);
        return;
      }

      imgArr_last = imgArr;
      scale_last = scale;
      const h = imgArr.length * scale;
      const w = imgArr[0].length * scale;
      if (h !== p.height || w !== p.width) {
        p.resizeCanvas(w, h);
      }

      p.clear();
      drawColorArray(p, imgArr, scale);
    }

    p.setup = () => {
      p.pixelDensity(1);
      p.createCanvas(1, 1);
      p.stroke(255);
    };

    p.draw = () => {
      if (imgArr_last) {
        const x = Math.floor(p.mouseX / scale_last);
        const y = Math.floor(p.mouseY / scale_last);
        const size = 5;
        if (!(x < size || y < size || x >= (imgArr_last.length - size) || y >= (imgArr_last[0].length - size))) {
          // draw zoomed in version
          const bounds = [x - size, y - size, x + size, y + size];
          const slice = get2DArraySlice(imgArr_last, bounds);
          const zoomScale = scale_last * 6;
          // clear
          p.push();
          p.fill(255);
          p.noStroke();
          p.rect(1, 1, slice.length * zoomScale, slice[0].length * zoomScale);
          p.pop();
          // draw zoom
          drawIconArray(p, slice, zoomScale);
          // outline
          p.push();
          p.noFill();
          p.stroke(1);
          p.rect(1, 1, slice.length * zoomScale, slice[0].length * zoomScale);
          p.pop();
          zoomPresent = true;
        } else {
          if (zoomPresent) {
            p.clear();
            drawColorArray(p, imgArr_last, scale_last);
            zoomPresent = false;
          }
        }
      }
    };
  };
}

import { get2DArraySlice } from '../helpers';

const colors = ['#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075'];
for (let i = 0; i < 1000; i += 1) {
  colors.push([Math.random() * 155, Math.random() * 155, Math.random() * 155]);
}
const colorMap = {};

function getIcon(p, imgArr) {
  const kernelSize = imgArr.length;
  const g = p.createGraphics(kernelSize, kernelSize);

  // normalize
  let max = Math.max(...imgArr.flat());
  imgArr = imgArr.map(row => row.map(v => v / max));

  g.noStroke();
  for (let y = 0; y < imgArr.length; y += 1) {
    for (let x = 0; x < imgArr[0].length; x += 1) {
      let v = imgArr[y][x] * 255;
      if (v > 0) {
        g.fill(0, 0, 0, v);
        g.rect(x, y, 1, 1);
      } else if (v < 0) {
        g.fill(255, 0, 0, -v / 2);
        g.rect(x, y, 1, 1);
      }
    }
  }

  return g.get();
}

/**
 * Returns a p5 sketch that can draw a 2D array
 */
export function getChannelSketch(kernels) {
  // spacing between rectangles
  const gridWeight = 0.08;
  // some good contrast colors to start
  const getColor = i => {
    if (i < colors.length) {
      return colors[i];
    } else {
      // overrun, start making random colors
      return [Math.random() * 155, Math.random() * 155, Math.random() * 155];
    }
  }
  let ids_last = null;
  let max_last = null;
  let scale_last = 1;
  let pt = null;
  let zoomPresent = false;

  /**
   * Draw a 2D array at the given scale
   * @param {p5} p - p5 sketch
   * @param {Number[][]} ids - 2D array of ids
   * @param {Number} scale - Scale to draw the canvas
   */
  function drawColorArray(p, ids, max, scale=1) {
    if (!ids || ids.length === 0) {
      return;
    }

    p.strokeWeight(scale * gridWeight);
    for (let y = 0; y < ids.length; y += 1) {
      for (let x = 0; x < ids[0].length; x += 1) {
        let key = ids[y][x];
        if (key >= 0) {
          let c = colorMap[key];
          if (!c) {
            c = p.color(getColor(Object.keys(colorMap).length));
            colorMap[key] = c;
          }
          c.setAlpha(max[y][x] * 255);
          p.fill(c);
          p.rect(x * scale, y * scale, scale, scale);
        }
      }
    }

    if (pt) {
      p.push();
      p.scale(scale);
      const { x, y } = pt;
      p.fill(0);
      p.stroke(0);
      p.triangle(x + 0.5, y + 1, x + 2, y + 5, x - 1, y + 5);
      p.pop();
    }
  }

  /**
   * Draw a 2D array at the given scale
   * @param {p5} p - p5 sketch
   * @param {Number[][]} ids - 2D array of ids
   * @param {Number[][]} max - 2D array of value for max id
   * @param {Number} scale - Scale to draw the canvas
   */
  function drawIconArray(p, ids, max, scale=1) {
    if (!ids || ids.length === 0) {
      return;
    }

    for (let y = 0; y < ids.length; y += 1) {
      for (let x = 0; x < ids[0].length; x += 1) {
        let key = ids[y][x];
        if (key >= 0) {
          let intensity = max[y][x];
          const kernel = p._kernelCache[key];
          p.push();
          p.tint(255, intensity * 255);
          p.image(kernel, x * scale, y * scale, scale, scale);
          p.pop();
        }
      }
    }
  }

  return (p) => {
    p.customDraw = (ids, max, scale=1) => {
      if (!ids || ids.length === 0) {
        return;
      }

      // protection from attempting to draw before p5 is setup
      if (!p._setupDone) {
        setTimeout(() => p.customDraw(ids, max, kernels, scale), 10);
        return;
      }

      ids_last = ids;
      // normalize max 2d array
      let maxMax = Math.max(...max.flat());
      max = max.map(row => row.map(v => v / maxMax));
      max_last = max;
      scale_last = scale;
      const h = ids_last.length * scale;
      const w = ids_last[0].length * scale;
      if (h !== p.height || w !== p.width) {
        p.resizeCanvas(w, h);
      }

      p.clear();
      drawColorArray(p, ids, max, scale);
    }

    p.setup = () => {
      p.pixelDensity(1);
      p.createCanvas(1, 1);
      p.stroke(255);

      // testing hack
      setTimeout(() => {
        pt = { x: 120, y: 150 };
        p._onSelect(pt);
      }, 150);

      // create the kernel image cache
      p._kernelCache = [];
      for (const kernel of kernels) {
        const icon = getIcon(p, kernel);
        p._kernelCache.push(icon);
      }
    };

    p.draw = () => {
      if (ids_last) {
        const x = Math.floor(p.mouseX / scale_last);
        const y = Math.floor(p.mouseY / scale_last);
        const size = 3;

        if (!(x < size || y < size || x >= (ids_last.length - size) || y >= (ids_last[0].length - size))) {
          p.clear();
          drawColorArray(p, ids_last, max_last, scale_last);

          // draw zoomed in version
          const bounds = [x - size, y - size, x + size + 1, y + size + 1];
          const slice_ids = get2DArraySlice(ids_last, bounds);
          const slice_max = get2DArraySlice(max_last, bounds);
          const zoomScale = scale_last * 10;
          p.push();
          p.translate((x * scale_last) - ((size + 0.5) * zoomScale), (y * scale_last) - ((size + 0.5) * zoomScale));
          // clear
          p.push();
          p.fill(255);
          p.noStroke();
          p.rect(0, 0, slice_ids.length * zoomScale, slice_ids[0].length * zoomScale);
          p.pop();
          // draw zoom
          drawIconArray(p, slice_ids, slice_max, zoomScale);
          // outline
          p.push();
          p.noFill();
          p.strokeWeight(2);
          p.stroke('#777');
          p.rect(0, 0, slice_ids.length * zoomScale, slice_ids[0].length * zoomScale);
          p.pop();
          // outline center
          p.push();
          p.noFill();
          p.stroke('#000');
          p.rect(size * zoomScale, size * zoomScale, zoomScale, zoomScale);
          p.pop();
          p.pop();
          zoomPresent = true;
        } else {
          if (zoomPresent) {
            p.clear();
            drawColorArray(p, ids_last, max_last, scale_last);
            zoomPresent = false;
          }
        }
      }
    };

    p._onSelect = () => {}

    p.mouseClicked = () => {
      if (ids_last && scale_last) {
        const x = Math.floor(p.mouseX / scale_last);
        const y = Math.floor(p.mouseY / scale_last);
        if (!(x < 0 || y < 0 || x >= ids_last.length || y >= ids_last[0].length)) {
          p._onSelect({ x, y });
          pt = { x, y };
        }
      }
    }
  };
}

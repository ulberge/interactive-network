import { get2DArraySlice } from '../helpers';

// some good contrast colors to start
const colors = ['#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075'];
// save colors so that they are consistent between renders
const colorMap = {};

/**
 * Returns a p5 sketch that can draw a 2D array
 */
export function getSketch(kernels) {
  // spacing between rectangles
  const gridWeight = 0.08;
  let ids = null;
  let max = null;
  let scale = 1;
  let needsRefresh = false;

  return (p) => {
    p.setData = (_ids, _max, _scale=1) => {
      // save the data for rendering in draw loop
      ids = _ids;
      // normalize max 2d array
      let maxMax = Math.max(..._max.flat());
      max = _max.map(row => row.map(v => v / maxMax));
      scale = _scale;
      needsRefresh = true;
    }

    p.setKernels = kernels => {
      // create images based on kernels so we dont have to recalculate
      p._kernelCache = [];
      for (const kernel of kernels) {
        const icon = p._getIcon(kernel);
        p._kernelCache.push(icon);
      }
    }

    p.setup = () => {
      p.pixelDensity(1);
      p.createCanvas(300, 300);
      p.stroke(255);
    };

    p.draw = () => {
      if (ids && max) {
        // check if we need to resize
        const h = ids.length * scale;
        const w = ids[0].length * scale;
        if (h !== p.height || w !== p.width) {
          p.resizeCanvas(w, h);
        }

        // check if mouse is in canvas (with padding of zoomWindow)
        const x = Math.floor(p.mouseX / scale);
        const y = Math.floor(p.mouseY / scale);
        const zoomWindow = 4;
        const zoomScale = scale * 8;
        if (x > 0 && y > 0 && x < (w / scale) && y < (h / scale)) {
          // if so, we need to redraw with overlay
          p.clear();
          p._drawBackground(ids, max, scale);

          // get zoomed in version
          const bounds = [
            Math.max(0, x - zoomWindow),
            Math.max(0, y - zoomWindow),
            Math.min(w / scale, x + zoomWindow + 1),
            Math.min(h / scale, y + zoomWindow + 1)
          ];
          const slice_ids = get2DArraySlice(ids, bounds);
          const slice_max = get2DArraySlice(max, bounds);

          // draw zoomed in version as overlay
          p.push();
          p.translate((x * scale) - ((zoomWindow + 0.5) * zoomScale), (y * scale) - ((zoomWindow + 0.5) * zoomScale));
          // blank out background
          p.push();
          p.fill(255);
          p.noStroke();
          p.rect(0, 0, slice_ids.length * zoomScale, slice_ids[0].length * zoomScale);
          p.pop();
          // draw zoom
          p._drawIconArray(slice_ids, slice_max, zoomScale);
          // draw outline
          p.push();
          p.noFill();
          p.strokeWeight(1);
          p.stroke('#b2b2b2');
          p.rect(0, 0, slice_ids.length * zoomScale, slice_ids[0].length * zoomScale);
          p.pop();
          // outline the center of the zoom
          p.push();
          p.noFill();
          p.stroke('#b2b2b2');
          p.strokeWeight(1);
          p.rect(zoomWindow * zoomScale, zoomWindow * zoomScale, zoomScale, zoomScale);
          p.pop();
          p.pop();

          needsRefresh = true;
        } else {
          // Only redraw once when zoom leaves, because then it is static
          if (needsRefresh) {
            p.clear();
            p._drawBackground(ids, max, scale);
            needsRefresh = false;
          }
        }
      }
    };

    p.mouseClicked = () => {
      if (ids && scale) {
        const x = Math.floor(p.mouseX / scale);
        const y = Math.floor(p.mouseY / scale);
        if (x > 0 && y > 0 && x < ids.length && y < ids[0].length) {
          if (p._onSelect) {
            p._onSelect({ x, y });
          }
          p._pt = { x, y };
        }
      }
    };

    p._drawBackground = (ids, max, scale=1) => {
      p.strokeWeight(scale * gridWeight);
      for (let y = 0; y < ids.length; y += 1) {
        for (let x = 0; x < ids[0].length; x += 1) {
          // for performance reasons only draw ones that are dark enough
          if (max[y][x] >= 0.1) {
            let key = ids[y][x];
            if (key >= 0) {
              let c = p._getColor(key);
              c.setAlpha(max[y][x] * 255);
              p.fill(c);
              p.rect(x * scale, y * scale, scale, scale);
            }
          }
        }
      }

      if (p._pt) {
        p.push();
        p.scale(scale);
        p.fill(0);
        const { x, y } = p._pt;
        const zoomScale = 6 / scale;
        p.translate(0.5, 1);
        p.triangle(x, y, x + (zoomScale * 0.75), y + (zoomScale * 2), x - (zoomScale * 0.75), y + (zoomScale * 2));
        p.pop();
      }
    };

    p._drawIconArray = (ids, max, scale=1) => {
      for (let y = 0; y < ids.length; y += 1) {
        for (let x = 0; x < ids[0].length; x += 1) {
          let intensity = max[y][x];
          if (intensity > 0.1) {
            let key = ids[y][x];
            if (key >= 0) {
              const kernel = p._kernelCache[key];
              p.push();
              p.tint(255, intensity * 255);
              p.image(kernel, x * scale, y * scale, scale, scale);
              p.pop();
            }
          }
        }
      }
    };

    p._getColor = i => {
      let c = colorMap[i];
      if (!c) {
        if (colors[i]) {
          c = p.color(colors[i]);
        } else {
          c = p.color([ Math.random() * 155, Math.random() * 155, Math.random() * 155 ]);
        }
        colorMap[i] = c;
      }
      return c;
    };

    p._getIcon = imgArr => {
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
            g.fill(214, 30, 30, -v / 2);
            g.rect(x, y, 1, 1);
          }
        }
      }
      return g.get();
    };
  };
}

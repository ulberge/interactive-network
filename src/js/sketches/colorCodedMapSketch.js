import nj from 'numjs';

// some good contrast colors to start
const colors = ['#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075'];
// save colors so that they are consistent between renders
const colorMap = {};

/**
 * Returns a p5 sketch that can draw a 2D array
 */
export function getSketch(kernels) {
  // spacing between rectangles
  let ids = null;
  let max = null;
  let scale = 1;
  let needsRefresh = false;
  let drawWindow = true;
  const zoomWindow = 4;

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
      p.noSmooth();

      p._colorCodedGraphics = p.createGraphics(300, 300);
    };

    p.draw = () => {
      if (ids && max) {
        // check if we need to resize
        const h = ids.length * scale;
        const w = ids[0].length * scale;
        if (h !== p.height || w !== p.width) {
          p.resizeCanvas(w, h);
          p._colorCodedGraphics = p.createGraphics(ids[0].length, ids.length);
        }

        // check if mouse is in canvas (with padding of zoomWindow)
        const x = Math.floor(p.mouseX / scale);
        const y = Math.floor(p.mouseY / scale);
        const zoomScale = scale * 4;
        const isMouseInBounds = p._isMouseInBounds();
        if (isMouseInBounds && drawWindow) {
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
          const [ x0, y0, x1, y1 ] = bounds;
          const slice_ids = nj.array(ids).slice([y0, y1], [x0, x1]).tolist();
          const slice_max = nj.array(max).slice([y0, y1], [x0, x1]).tolist();

          // draw zoomed in version as overlay
          p.push();
          p.translate((x * scale) - ((zoomWindow + 0.5) * zoomScale), (y * scale) - ((zoomWindow + 0.5) * zoomScale));
          // blank out background
          p.push();
          p.fill(255);
          p.noStroke();
          p.rect(0, 0, slice_ids[0].length * zoomScale, slice_ids.length * zoomScale);
          p.pop();
          // draw zoom
          p._drawIconArray(slice_ids, slice_max, zoomScale);
          // draw outline
          p.push();
          p.noFill();
          p.strokeWeight(1);
          p.stroke('#b2b2b2');
          p.rect(0, 0, slice_ids[0].length * zoomScale, slice_ids.length * zoomScale);
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

    // check if legal mouse position
    p._isMouseInBounds = () => {
      const h = p.height;
      const w = p.width;
      const x = p.mouseX;
      const y = p.mouseY;
      const pad = zoomWindow * scale;
      return x > pad && y > pad && x < w - pad && y < h - pad;
    }

    p.mouseClicked = () => {
      if (ids && scale) {
        if (p._isMouseInBounds()) {
          const x = Math.floor(p.mouseX / scale);
          const y = Math.floor(p.mouseY / scale);
          if (p._onSelect) {
            p._onSelect({ x, y });
            // close zoom window for a brief moment like a camera shutter
            drawWindow = false;
            setTimeout(() => {
              drawWindow = true;
            }, 150);
          }
          p._pt = { x, y };
        }
      }
    };

    p._drawBackground = (ids, max, scale=1) => {
      const g = p._colorCodedGraphics;
      g.clear();
      g.loadPixels();
      for (let y = 0; y < ids.length; y += 1) {
        for (let x = 0; x < ids[0].length; x += 1) {
          // for performance reasons only draw ones that are dark enough
          if (max[y][x] >= 0.1) {
            let key = ids[y][x];
            if (key >= 0) {
              let c = p._getColor(key);
              c.setAlpha(max[y][x] * 255);
              g.set(x, y, c);
            }
          }
        }
      }
      g.updatePixels();
      p.push();
      p.scale(scale);
      p.image(g.get(), 0, 0);
      p.pop();

      if (p._pt) {
        const { x, y } = p._pt;
        // draw triangle
        // p.push();
        // p.scale(scale);
        // p.fill(0);
        // p.noStroke();
        // const zoomScale = 6 / scale;
        // p.translate(0.5, 0);
        // p.triangle(x, y, x + (zoomScale * 0.75), y - (zoomScale * 2), x - (zoomScale * 0.75), y - (zoomScale * 2));
        // p.pop();


        // draw selected point
        const key = ids[y][x];
        const intensity = max[y][x];
        const rectScale = 10;

        p.push();
        p.translate(((x + 0.5) - (rectScale / 2)) * scale, ((y + 0.5) - (rectScale / 2)) * scale);
        if (intensity > 0.1) {
          p.fill(255);
          p.noStroke();
          p.rect(0, 0, scale * rectScale, scale * rectScale);
          const kernel = p._kernelCache[key];
          // p.tint(255, intensity * 255 * );
          p.image(kernel, 0, 0, scale * rectScale, scale * rectScale);
          p.noFill();
          p.stroke(0);
          p.rect(0, 0, scale * rectScale, scale * rectScale);
        } else {
          p.fill(255);
          p.stroke(0);
          p.rect(0, 0, scale * rectScale, scale * rectScale);
        }
        p.pop();

        // const c = (intensity > 0.1) ? p._getColor(key) : p.color(255, 255, 255);
        // const rectScale = 5;
        // c.setAlpha(255);
        // p.push();
        // p.fill(c);
        // p.stroke(0);
        // p.translate(((x + 0.5) - (rectScale / 2)) * scale, ((y + 0.5) - (rectScale / 2)) * scale);
        // p.rect(0, 0, scale * rectScale, scale * rectScale);
        // p.pop();


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
      // normalize to max value (positive or negative)
      const flatArr = imgArr.flat();
      let max = Math.max(...flatArr);
      max = max > 0 ? max : -Math.min(...flatArr);
      imgArr = imgArr.map(row => row.map(v => v / max));

      g.loadPixels();
      for (let y = 0; y < imgArr.length; y += 1) {
        for (let x = 0; x < imgArr[0].length; x += 1) {
          const v = imgArr[y][x] * 255;
          if (v > 0) {
            g.set(x, y, p.color(0, 0, 0, v));
          } else if (v < 0) {
            g.set(x, y, p.color(214, 30, 30, -v * 0.75));
          }
        }
      }
      g.updatePixels();
      return g.get();
    };
  };
}

import { getImgArrFromPixels } from './helpers';

/**
 * Returns a p5 sketch that can be drawn on with the mouse
 * @param {Number[]} shape - Real shape of the canvas
 * @param {Number[][][]} originalMarks - An array of marks, each of which is a series of points that will be connected with a line
 * @param {function} onChange - Callback on end of mark
 * @param {Number} strokeWeight - Width of lines
 * @param {Number} scale - Scale to draw the canvas
 */
export function getEditableSketch(config) {
  // a sketch that renders marks with the provided strokeWeight
  // returns the rendered version
  // accepts a mark and returns the updated marks

  // setup, draw => drawOnce, runInput

  const state = {};

  return (p) => {
    const drawOnce = (marks) => {
      state.g.clear();
      p.clear();

      state.g.push();
      state.g.angleMode(state.g.DEGREES);
      state.g.translate(state.g.width / 2, state.g.height / 2);
      state.g.rotate(state.rotation);
      state.g.push();
      state.g.translate(-state.g.width / 2, -state.g.height / 2);
      marks.forEach(pts => {
        let prev = pts[0];
        if (pts.length > 1) {
          for (let i = 1; i < pts.length; i += 1) {
            let curr = pts[i];
            state.g.strokeWeight(state.strokeWeight);
            state.g.stroke(0);
            state.g.line(prev[0] + state.offset, prev[1] + state.offset, curr[0] + state.offset, curr[1] + state.offset);
            prev = curr;
          }
        }
      });
      state.g.pop();
      state.g.pop();

      state.g.loadPixels();
      upscalePixels(p, state.g.pixels, state.shape[1], state.scale);
    };

    const runInput = () => {
      const px = p.pmouseX;
      const py = p.pmouseY;
      const x = p.mouseX;
      const y = p.mouseY;

      if (p.mouseIsPressed) {
        if (!(x < 0 || y < 0 || px < 0 || py < 0 || x >= p.width || px >= p.width || y >= p.height || py >= p.height)) {
          // if mouse pressed on canvas, record marks and draw to scaled canvas and screen
          const start = [px / state.scale, py / state.scale];
          const end = [x / state.scale, y / state.scale];

          if (!state.wasPressed) {
            // start of press
            state.newMark.push(start);
            state.marks.push(state.newMark)
          }
          state.wasPressed = true;

          if ((Math.abs(end[0] - state.newMark[state.newMark.length - 1][0]) + Math.abs(end[1] - state.newMark[state.newMark.length - 1][1])) > 1) {
            state.newMark.push(end);
          }

          drawOnce(state.marks);
        }
      } else {
        // at end of press, if it was being pressed trigger change with current state
        if (state.wasPressed) {
          state.wasPressed = false;
          // trigger change to marks
          state.onNewMark(state.newMark);
        }
      }
    }

    p.setup = () => {
      const { shape, marks, onRender, onNewMark, strokeWeight, scale, offset, rotation } = config;

      const [ h, w ] = shape;
      p.createCanvas(w * scale, h * scale);
      p.pixelDensity(1);

      // setup off screen canvas at actual shape
      state.g = p.createGraphics(w, h);
      state.g.pixelDensity(1);
      // HACK: for some reason load pixels causes sharpness of the line to change
      // calling this here prevents a wierd change in the rendering on first draw
      state.g.loadPixels();

      state.marks = marks.slice();
      state.onNewMark = onNewMark || (() => {});
      state.onRender = onRender || (() => {});
      state.shape = shape;
      state.scale = scale || 1;
      state.strokeWeight = strokeWeight || 1;
      state.offset = offset || 0;
      state.rotation = rotation || 0;

      state.newMark = [];

      state.wasPressed = false;
      state.firstDraw = true;
    };

    p.draw = () => {
      // On first draw after invalidation, render and send up
      if (state.firstDraw) {
        drawOnce(state.marks);

        state.g.loadPixels();
        const imgArr = getImgArrFromPixels(state.g.pixels, state.shape[0]);
        state.onRender(imgArr);
        state.firstDraw = false;
      }

      // Gather input and draw until mark ends, then send up new mark
      runInput();
    };

    p.updateConfig = config => {
      const { shape, marks, onRender, onNewMark, strokeWeight, scale, offset, rotation } = config;

      const [ h, w ] = shape;
      if ((h * scale) !== p.height || (w * scale) !== p.width) {
        p.resizeCanvas(w * scale, h * scale);
      }

      // setup off screen canvas at actual shape
      if (!state.g || h !== state.g.height || w !== state.g.width) {
        // new size, remake
        state.g = p.createGraphics(w, h);
        state.g.pixelDensity(1);
        // HACK: for some reason load pixels causes sharpness of the line to change
        // calling this here prevents a wierd change in the rendering on first draw
        state.g.loadPixels();
      }

      state.marks = marks.slice();
      state.onNewMark = onNewMark || (() => {});
      state.onRender = onRender || (() => {});
      state.shape = shape;
      state.scale = scale || 1;
      state.strokeWeight = strokeWeight || 1;
      state.offset = offset || 0;
      state.rotation = rotation || 0;

      state.newMark = [];

      state.wasPressed = false;
      state.firstDraw = true;
    }
  };
}

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
      if (!imgArr) {
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

      for (let y = 0; y < imgArr_c.length; y += 1) {
        for (let x = 0; x < imgArr_c[0].length; x += 1) {
          // const v = (imgArr[y][x] / max) * 255;
          const v = imgArr_c[y][x] * 255;
          if (withColors) {
            const key = Math.floor(v);
            if (!(key in colorMap)) {
              const colors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075'];
              if (Object.keys(colorMap).length < colors.length) {
                colorMap[key] = p.color(colors[Object.keys(colorMap).length]);
              } else {
                colorMap[key] = p.color(Math.random() * 155, Math.random() * 155, Math.random() * 155);
              }
              // colorMap[key] = p.color(Math.random() * 155, Math.random() * 155, Math.random() * 155);
            }
            const c = colorMap[key];
            if (v >= 0) {
              p.fill(c);
            } else {
              // p.fill(255, 0, 0, -v / 4);
              p.fill(255, 255, 255, 255);
            }
          } else {
            if (v >= 0) {
              p.fill(0, 0, 0, v);
            } else {
              p.fill(255, 0, 0, -v / 2);
            }
          }

          p.rect(x * p._scale, y * p._scale, p._scale, p._scale);
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

/**
 * Returns an empty p5 sketch
 */
export function getEmptySketch(shape=null, scale=1) {
  return (p) => {
    p.setup = () => {
      p.pixelDensity(1);
      if (shape) {
        const [ h, w ] = shape;
        p.createCanvas(w * scale, h * scale);
      } else {
        p.createCanvas(1, 1);
      }
      p.noLoop();
    };

    p.update = (shape, scale) => {
      const [ h, w ] = shape;
      if ((h * scale) !== p.height || (w * scale) !== p.width) {
        p.resizeCanvas(w * scale, h * scale);
      } else {
        p.clear();
      }
    }
  };
}

// Given a pixel array and the image height, render at a larger scale
function upscalePixels(p, pixels, height, scale) {
  const gridWeight = 0.08;
  p.stroke(255);
  p.strokeWeight(scale * gridWeight);

  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] > 0) {
      p.fill(255 - pixels[i]);
      const x = ((i - 3) / 4) % height;
      const y = Math.floor(((i - 3) / 4) / height);
      p.rect(x * scale, y * scale, scale, scale);
    }
  }
}

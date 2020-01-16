import { getImgArrFromPixels } from '../helpers';

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

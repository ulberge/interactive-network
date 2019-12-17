
/* global nj */

/**
 * Returns a p5 sketch that can be drawn on with the mouse
 * @param {Number[]} size - Real size of the canvas
 * @param {function} onChange - Callback on end of mark
 * @param {Number} scale - Scale to draw the canvas
 */
export function getEditableSketch(size, onChange, scale=1) {
  const [ h, w ] = size;
  let pressed = false;

  // Retrieve the drawing as a 2D array of size
  const format = (imgArr, size) => {
    const gray = [];
    for (let i = 0; i < imgArr.length; i += 4) {
      gray.push(1 - (imgArr[i] / 255));
    }
    const gray_f = nj.array(gray).reshape(size[0], size[1]);
    return gray_f.tolist();
  }

  return (p) => {
    p.setup = () => {
      p.pixelDensity(1);
      p.createCanvas(w * scale, h * scale);
      p.background(255);
      p.strokeWeight(scale);
    };

    p.draw = () => {
      // Record mouse pressed events within canvas
      const px = p.pmouseX;
      const py = p.pmouseY;
      const x = p.mouseX;
      const y = p.mouseY;
      if (!(x < 0 || y < 0 || px < 0 || py < 0 || x >= p.width || px >= p.width || y >= p.height || py >= p.height)) {
        if (p.mouseIsPressed) {
          pressed = true;
          // draw line
          p.line(px, py, x, y);
        } else {
          if (pressed) {
            pressed = false;
            p.loadPixels();
            const imgArr = format(p.pixels, size);
            if (onChange) {
              onChange(imgArr);
            }
          }
        }
      }
    };
  };
}

/**
 * Returns a p5 sketch that displays a 2D array
 * @param {Number[][]} imgArr - 2D array to initialize canvas (values between [-1, 1])
 * @param {Number} scale - Scale to draw the canvas
 */
export function getArraySketch(imgArr, scale) {
  const h = imgArr.length;
  const w = imgArr[0].length;

  return (p) => {
    p.setup = () => {
      p.pixelDensity(1);
      p.createCanvas(w * scale, h * scale);
      p.background(255);
      p.stroke(255);
      p.strokeWeight(scale / 20);
      p.noLoop();
    };

    p.draw = () => {
      p.clear();
      for (let y = 0; y < h; y += 1) {
        for (let x = 0; x < w; x += 1) {
          p.fill(((1 - imgArr[y][x]) / 2) * 255);
          p.rect(x * scale, y * scale, scale, scale);
        }
      }
    }
  };
}

/**
 * Returns a p5 sketch that displays a 2D array that can be edited with the mouse
 * @param {Number[][]} imgArr - 2D array to initialize canvas (values between [-1, 1])
 * @param {Number} scale - Scale to draw the canvas
 * @param {Number} increment - Amount to change value on click
 * @param {function} onChange - Callback after change
 */
export function getArraySketchEditable(imgArr, scale, onChange, increment=0.2) {
  const h = imgArr.length;
  const w = imgArr[0].length;

  const imgArrCopy = imgArr.map(row => row.map(val => val));

  return (p) => {
    p.setup = () => {
      p.pixelDensity(1);
      p.createCanvas(w * scale, h * scale);
      p.noStroke();
      p.background(255);
    };

    p.draw = () => {
      p.clear();
      for (let y = 0; y < h; y += 1) {
        for (let x = 0; x < w; x += 1) {
          p.fill(((1 - imgArr[y][x]) / 2) * 255);
          p.rect(x * scale, y * scale, scale, scale);
        }
      }
    }

    p.mousePressed = (e) => {
      const x = p.mouseX;
      const y = p.mouseY;
      if (!(x < 0 || y < 0 || x >= p.width || y >= p.height)) {
        const scaledX = Math.floor(x / scale);
        const scaledY = Math.floor(y / scale);

        if (e.button === 0 && !e.shiftKey) { // left click
          imgArrCopy[scaledY][scaledX] = Math.min(1, imgArrCopy[scaledY][scaledX] + increment);
        } else if (e.button === 0 && e.shiftKey) { // right click
          imgArrCopy[scaledY][scaledX] = Math.max(0, imgArrCopy[scaledY][scaledX] - increment);
          e.preventDefault();
        }

        if (onChange) {
          onChange(imgArrCopy);
        }
      }
    }
  };
}

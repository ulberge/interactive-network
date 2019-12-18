
// function drawPixelsScaled(p, imgArr, scale) {
//   const gridWeight = 0.08;
//   p.strokeWeight(scale * gridWeight);

//   for (let y = 0; y < imgArr.length; y += 1) {
//     for (let x = 0; x < imgArr[0].length; x += 1) {
//       const v = ((1 - imgArr[y][x]) / 2) * 255;
//       if (v > 255) {
//         p.fill(255, 0, 0);
//       } else if (v < 0) {
//         p.fill(0, 0, 255);
//       } else {
//         p.fill(v);
//       }
//       p.rect(x * scale, y * scale, scale, scale);
//     }
//   }
// }

// function drawPixels(p, imgArr) {
//   p.push();
//   p.noStroke();

//   for (let y = 0; y < imgArr.length; y += 1) {
//     for (let x = 0; x < imgArr[0].length; x += 1) {
//       p.fill(imgArr[y][x]);
//       p.rect(x, y, 1, 1);
//     }
//   }
//   p.pop();
// }

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

// Given a pixel array (from a graphics object, ie. transparent background) and the shape, return the image
const getImgArr = (pixels, width) => {
  const imgArr = [];
  let row = [];
  for (let i = 3; i < pixels.length; i += 4) {
    // use opacity since this a graphics object
    row.push(pixels[i] / 255);
    if (row.length === width) {
      imgArr.push(row);
      row = [];
    }
  }
  return imgArr;
}

/**
 * Returns a p5 sketch that can be drawn on with the mouse
 * @param {Number[]} shape - Real shape of the canvas
 * @param {function} onChange - Callback on end of mark
 * @param {Number} scale - Scale to draw the canvas
 */
export function getEditableSketch(shape, strokeWidth, onChange, scale=1, hasDefault=true) {
  const [ h, w ] = shape;
  let pressed = false;

  return (p) => {
    let g = null;

    p.setup = () => {
      p.pixelDensity(1);
      p.createCanvas(w * scale, h * scale);

      g = p.createGraphics(w, h);
      g.strokeWeight(strokeWidth);
      g.pixelDensity(1);

      // create initial drawing
      if (hasDefault) {
        g.noFill();
        g.arc(w * 0.4, h * 0.2, w * 0.4, h * 0.4, Math.PI * 0.5, Math.PI);
        g.arc(w * 0.4, h * 0.6, w * 0.4, h * 0.4, Math.PI * 1.5, Math.PI);
        g.loadPixels();
        upscalePixels(p, g.pixels, h, scale);
        const imgArr = getImgArr(g.pixels, w);
        if (onChange) {
          onChange(imgArr);
        }
      }
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
          // draw line to graphics at scale we want
          g.line(px / scale, py / scale, x / scale, y / scale);
          // upscale and render on screen
          g.loadPixels();
          upscalePixels(p, g.pixels, h, scale);
        } else {
          if (pressed) {
            pressed = false;
            g.loadPixels();
            const imgArr = getImgArr(g.pixels, w);
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
 * Returns a p5 sketch that can draw a 2D array
 */
export function getArraySketch() {
  const gridWeight = 0.08;

  return (p) => {
    /**
     * Draw a 2D array at the given scale
     * @param {Number[][]} imgArr - 2D array to initialize canvas (values between [-1, 1])
     * @param {Number} scale - Scale to draw the canvas
     */
    p.customDraw = (imgArr, scale) => {
      if (!p._setupDone) {
        setTimeout(() => p.customDraw(imgArr, scale), 10);
        return;
      }

      p.scale = scale;
      const h = imgArr.length * scale;
      const w = imgArr[0].length * scale;
      if (h !== p.height || w !== p.width) {
        p.resizeCanvas(w, h);
      }

      p.clear();
      p.strokeWeight(p.scale * gridWeight);

      // normalize to max value (positive or negative)
      let max = Math.max(...imgArr.map(row => Math.max(...row.map(v => Math.abs(v)))));

      for (let y = 0; y < imgArr.length; y += 1) {
        for (let x = 0; x < imgArr[0].length; x += 1) {
          const v = (imgArr[y][x] / max) * 255;
          if (v >= 0) {
            p.fill(0, 0, 0, v);
          } else {
            p.fill(255, 0, 0, -v / 4);
          }
          p.rect(x * p.scale, y * p.scale, p.scale, p.scale);
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


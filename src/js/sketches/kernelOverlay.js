/**
 * Returns a p5 sketch that can draw a 2D array
 */
export function getSketch() {
  const gridWeight = 0.08;

  return (p) => {
    /**
     * Draw a 2D array at the given scale
     * @param {Number[][]} imgArr - 2D array to initialize canvas (values between [-1, 1])
     * @param {Number} scale - Scale to draw the canvas
     */
    p.customDraw = (kernel, imgArrSlice, scale=1) => {
      if (!kernel || kernel.length === 0 || !imgArrSlice || imgArrSlice.length === 0) {
        return;
      }

      if (!p._setupDone) {
        setTimeout(() => p.customDraw(kernel, imgArrSlice, scale), 10);
        return;
      }

      const h = kernel.length * scale;
      const w = kernel[0].length * scale;
      if (h !== p.height || w !== p.width) {
        p.resizeCanvas(w, h);
      }

      p.clear();
      p.strokeWeight(scale * gridWeight);

      // normalize kernel to max value (positive or negative)
      let max = Math.max(...kernel.map(row => Math.max(...row.map(v => Math.abs(v)))));
      kernel = kernel.map(row => row.map(v => v / max));

      for (let y = 0; y < kernel.length; y += 1) {
        for (let x = 0; x < kernel[0].length; x += 1) {
          // draw image pixel
          const iv = imgArrSlice[y][x] * 255;
          p.fill(0, 0, 0, iv);
          p.rect(x * scale, y * scale, scale, scale);

          // draw transparent kernel pixel
          const kv = kernel[y][x] * 255;
          const overlayOpacity = 0.6;
          if (kv > 0) {
            p.fill(0, 0, 0, kv * overlayOpacity);
            p.rect(x * scale, y * scale, scale, scale);
          } else if (kv < 0) {
            p.fill(255, 0, 0, -kv * 0.5 * overlayOpacity);
            p.rect(x * scale, y * scale, scale, scale);
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

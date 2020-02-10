/**
 * return the p5 sketch for the SmartCanvas
 */
export function getSketch(shape, smartCanvasRef) {
  let dirty = false;
  return (p) => {
    p.setup = () => {
      p.pixelDensity(1);
      const [ w, h ] = shape;
      p.createCanvas(w, h);
      p.strokeWeight(2);
    };

    p.draw = () => {
      if (p.mouseIsPressed) {
        // while mouse is pressed, add line segments to canvas
        const start = { x: p.pmouseX, y: p.pmouseY };
        const end = { x: p.mouseX, y: p.mouseY };
        if (!(start.x < 0 || start.y < 0 || end.x < 0 || end.y < 0 || end.x >= p.width || start.x >= p.width || end.y >= p.height || start.y >= p.height)) {
          // clear cache on draw (multiple new lines and new rotations will degrade image, but can clear)
          if (p._rotationCache) {
            p._rotationCache = null;
          }   // draw new line
          smartCanvasRef.current.addSegment(start, end);
          dirty = true;
        }
      } else {
        // at end of mouse press, update LineInfo
        if (dirty) {
          smartCanvasRef.current.update();
          dirty = false;
        }
      }
    };

    p.setRotation = rotation => {
      // we store the image since redraws will degrade (clears on draw)
      if (!p._rotationCache) {
        p._rotationCache = p.get();
      }
      p.clear();
      p.push();
      p.angleMode(p.DEGREES);
      console.log(rotation, p._rotationCache);

      p.translate(p.width / 2, p.height / 2);
      p.rotate(rotation);
      p.translate(-p.width / 2, -p.height / 2);

      p.image(p._rotationCache, 0, 0);
      p.pop();
    };
  };
}

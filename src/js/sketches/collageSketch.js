/**
 * return the p5 sketch for the SmartCanvas
 */
export function getSketch(shape) {
  let dirty = false;
  return (p) => {
    p.setup = () => {
      p.pixelDensity(1);
      const [ w, h ] = shape;
      p.createCanvas(w, h);
      p.strokeWeight(2);
      p._noDraw = false;
      p._listeners = [];
    };

    p.addListener = smartCanvasRef => {
      p._listeners.push(smartCanvasRef);
    };

    p.clearListeners = () => {
      p._listeners = [];
    }

    p.draw = () => {
      if (!p._noDraw && p.mouseIsPressed && p.mouseButton === p.LEFT) {
        // while mouse is pressed, add line segments to canvas
        const start = { x: p.pmouseX, y: p.pmouseY };
        const end = { x: p.mouseX, y: p.mouseY };
        if (!(start.x < 0 || start.y < 0 || end.x < 0 || end.y < 0 || end.x >= p.width || start.x >= p.width || end.y >= p.height || start.y >= p.height)) {
          if (p.keyIsDown(p.SHIFT)) {
            p.push();
            p.erase();
            p.strokeWeight(4);
            p._listeners.forEach(smartCanvasRef => {
              smartCanvasRef.current.addSegment(start, end);
            });
            p.noErase();
            p.pop();
          } else {
            p.push();
            p.strokeWeight(1.5);
            p._listeners.forEach(smartCanvasRef => {
              smartCanvasRef.current.addSegment(start, end);
            });
            p.pop();
          }
          dirty = true;
        }
      } else {
        // at end of mouse press, update LineInfo
        if (dirty) {
          p._listeners.forEach(smartCanvasRef => {
            smartCanvasRef.current.update();
          });
          dirty = false;
        }
      }
    };
  };
}

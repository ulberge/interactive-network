export function getSketch(shape, onSelect) {
  let windowSize = 25;

  const getRect = (x, y) => {
    return [ Math.floor(x - windowSize), Math.floor(y - windowSize), windowSize * 2, windowSize * 2 ];
  };

  return (p) => {
    p.setup = () => {
      p.pixelDensity(1);
      p.createCanvas(...shape);
      p.stroke(0);

      p._isActive = false;
    };

    p.draw = () => {
      p.clear();
      if (!p._isActive) {
        return;
      }
      // check if mouse is in canvas (with padding of zoomWindow)
      const x = p.mouseX;
      const y = p.mouseY;
      if (p._isInBounds(x, y)) {
        // if so, we need to redraw with overlay
        p.noFill();
        p.rect(...getRect(x, y));
      }
    };

    p.mouseClicked = event => {
      if (!p._isActive) {
        return;
      }
      const x = p.mouseX;
      const y = p.mouseY;

      if (p._isInBounds(x, y)) {
        if (onSelect) {
          const rect = getRect(x, y);
          onSelect(rect);
        }
      }
    };

    p._isInBounds = (x, y) => {
      return (x >= 0 && y >= 0 && x < p.width && y < p.height);
    };

    p.mouseWheel = event => {
      if (!p._isActive) {
        return;
      }
      const x = p.mouseX;
      const y = p.mouseY;

      if (p._isInBounds(x, y)) {
        windowSize += event.delta;
        event.preventDefault();
      }
    };
  };
}

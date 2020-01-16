import p5 from 'p5';

function getDebugSketch(img, label) {
  return p => {
    p.setup = () => {
      p.pixelDensity(1);
      p.createCanvas(img.width, img.height);
      p.noLoop();
      p.image(img, 0, 0);
      if (label) {
        p.text(label, 10, 10);
      }
    };
  };
}

export function clearDebug() {
  const debug = document.getElementById('debug');
  if (debug) {
    debug.innerHTML = '';
  }
}

export function drawToDebug(img, label) {
  let debug = document.getElementById('debug');
  if (!debug) {
    debug = document.createElement('div');
    debug.id = 'debug';
    document.body.appendChild(debug);
  }
  new p5(getDebugSketch(img, label), debug);
}

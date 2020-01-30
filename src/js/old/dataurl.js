import p5 from 'p5';

// given a p5.Image, returns the dataURL
export async function getDataURL(img) {
  return new Promise(resolve => {
    const drawAndRetrieve = p => {
      p.background(255);
      p.image(img, 0, 0);
      resolve(p.canvas.toDataURL());
    };

    if (window._dataURLGetter) {
      // if the getter already exists
      const p = window._dataURLGetter;
      if (img.width !== p.width || img.height !== p.height) {
        p.resizeCanvas(img.width, img.height);
      }
      drawAndRetrieve(p);
    } else {
      // create the getter the first time
      const getSketch = () => {
        return p => {
          p.setup = () => {
            p.pixelDensity(1);
            p.createCanvas(img.width, img.height);
            p.noLoop();
            drawAndRetrieve(p);
          };
        };
      };
      const container = document.createElement('div');
      container.style.display = 'hidden';
      document.body.appendChild(container);
      window._dataURLGetter = new p5(getSketch(), container);
    }
  });
}

// draw the dataurl to the container
export function drawDataURL(container, dataURL) {
  const img = new Image();
  if (!dataURL.includes('data:image/png;base64,')) {
    dataURL = 'data:image/png;base64,' + dataURL;
  }
  img.src = dataURL;
  container.appendChild(img);
}

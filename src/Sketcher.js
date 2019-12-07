import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import p5 from 'p5';

import Boid from './boid';
// import StrokeMap from './StrokeMap';

const h = 25;
const w = 25;
const speed = 10;
const threshold = 0.1;

/* global nj */

function getSketch(scale, pixelDensity) {
  return (p) => {
    p._scale = scale;

    p.setup = () => {
      if (pixelDensity) {
        p.pixelDensity(pixelDensity);
      }
      p.createCanvas(w * scale, h * scale);
      p.background(255);
      p.noLoop();
    };

    p.drawFiltersMap = remainingMap => {
      p.push();
      p.stroke(0);
      p.strokeWeight(1);
      p.strokeCap(p.SQUARE);
      p.scale(scale);
      Object.keys(remainingMap).forEach(key => drawType(key, remainingMap[key]));
      p.pop();
    }

    function drawType(type, filter) {
      filter.forEach((row, offsetY) => row.forEach((val, offsetX) => {
        p.push();
        p.translate(offsetX * 5, offsetY * 5);
        p.stroke(0, 0, 0, val * 255);

        // draw 3x3 grid matching first layer with opacity equal to value filtersMap
        for (let y = 0; y < 3; y += 1) {
          for (let x = 0; x < 3; x += 1) {
            p.push();
            p.translate(x * 5, y * 5);

            const lines = [
              [ 2.5, 0, 2.5, 5 ], // vertical
              [ 0, 2.5, 5, 2.5 ], // horizontal
              [ 0, 0, 5, 5 ], // diag1
              [ 0, 5, 5, 0 ], // diag2
            ];

            p.line(...lines[type]);
            p.pop();
          }
        }

        p.pop();
      }));
    }
  };
}

function getGradientSketch(scale) {
  return (p) => {
    p._scale = scale;

    p.setup = () => {
      p.createCanvas(w * scale, h * scale);
      p.noLoop();
    };

    p.drawFiltersMap = remainingMap => {
      Object.keys(remainingMap).forEach(key => remainingMap[key].forEach((row, offsetY) => row.forEach((val, offsetX) => {
        p.push();
        p.scale(scale);
        p.translate(offsetX * 5, offsetY * 5);
        p.fill(0, 0, 0, val * 150);
        p.noStroke();
        p.rect(0, 0, 15, 15);
        p.pop();
      })));
    }
  };
}

function getBlockSketch(scale) {
  return (p) => {
    p.setup = () => {
      p.pixelDensity(1);
      p.createCanvas(1, 1);
      p.noLoop();
      p.noStroke();
    };

    p.drawArr = (imgArr) => {
      p.createCanvas(imgArr[0].length * scale, imgArr.length * scale);
      for (let y = 0; y < imgArr.length; y += 1) {
        for (let x = 0; x < imgArr[y].length; x += 1) {
          p.fill(0, 0, 0, imgArr[y][x] * 255);
          p.rect(x * scale, y * scale, scale * 5, scale);
        }
      }
    };
  };
}

function getEmptySketch(scale) {
  return (p) => {
    p._scale = scale;
    p.setup = () => {
      p.createCanvas(w * scale, h * scale);
      p.noLoop();
    };
  };
}

export default class Sketcher extends Component {

  componentDidMount() {
    this.setup();

    // start animation
    this.timeout = setTimeout(() => {
      this.animate();
    }, 0);
  }

  componentDidUpdate() {
    this.reset();
  }

  reset() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    // clear canvases and reset boid
    this.canvases.forEach(p => p.clear());
    this.boid = new Boid(this.drawing, [w, h]);

    const { kernels } = this.props;
    // draw something on them
    this.channelSketches.forEach((p, i) => {
      p.clear();
      const remainingMapFiltered = {};
      remainingMapFiltered[i] = kernels[i];
      p.drawFiltersMap(remainingMapFiltered);
    });
    this.channelGradients.forEach((p, i) => {
      p.clear();
      const remainingMapFiltered = {};
      remainingMapFiltered[i] = kernels[i];
      p.drawFiltersMap(remainingMapFiltered);
    });

    // start animation
    this.timeout = setTimeout(() => {
      this.animate();
    }, 0);
  }

  setup() {
    const { scale, kernels } = this.props;

    // create channel maps
    this.channelSketches = kernels.map((kernel, i) => {
      const p = new p5(getSketch(scale / 2), this.refs['channel' + i]);
      p._gradKey = i;
      return p;
    });
    this.channelGradients = kernels.map((kernel, i) => {
      const p = new p5(getGradientSketch(scale / 2), this.refs['channelGradient' + i]);
      p._gradKey = i;
      return p;
    });
    this.channelOverlays = kernels.map((kernel, i) => {
      return new p5(getEmptySketch(scale / 2), this.refs['channelOverlay' + i]);
    });

    // create drawing area
    const drawingScale = 2.12;
    this.drawing = new p5(getEmptySketch(scale * drawingScale), this.refs.drawing);
    this.drawingOverlay = new p5(getEmptySketch(scale * drawingScale), this.refs.drawingOverlay);

    // create extra canvases for processing
    this.drawingExact = new p5(getEmptySketch(1), this.refs.drawingExact, 1);
    this.remainingSketch = new p5(getBlockSketch(25), this.refs.remaining);

    this.canvases = [
      ...this.channelSketches, ...this.channelGradients, ...this.channelOverlays,
      this.drawing, this.drawingOverlay, this.drawingExact, this.remainingSketch
    ];

    // initialize boid
    this.boid = new Boid(this.drawing, [w, h]);
  }

  animate() {
    // Get gradient vectors at position
    const gradients = this.channelGradients.map(p => {
      const c = p.get(this.boid.pos.x * p._scale, this.boid.pos.y * p._scale);
      const gradMagnitude = c[3] / 255; // magnitude of gradient equal to opacity
      return gradMagnitude;
    });

    this.boid.run(gradients);
    this.boid.drawBoid(this.drawingOverlay);
    this.channelOverlays.forEach(p => this.boid.drawBoid(p));
    gradients.forEach(v => this.boid.drawVector(this.drawingOverlay, v));

    const remaining = this.updateGradients();

    // If no strong gradients left
    let sum = 0;
    remaining.forEach(kernel => kernel.forEach(row => row.forEach(val => sum += val)));
    if (sum <= threshold) {
      // done...
      this.boid.dieOnNextWall = true;
    }

    if (!this.boid.dead) {
      this.timeout = setTimeout(() => {
        this.animate();
      }, speed);
    } else {
      // clear boid
      // this.drawingOverlay.clear();
      this.reset();
    }
  }

  format(imgArr, size) {
    const gray = [];
    for (let i = 3; i < imgArr.length; i += 4) {
      gray.push(imgArr[i] / 255);
    }
    const gray_f = nj.array(gray).reshape(size[0], size[1]);
    return gray_f.tolist();
  }

  updateGradients() {
    const { convnet, kernels } = this.props;

    // Get current state of canvas as 2D array
    const input = this.drawing.get();
    input.resize(this.drawingExact.width, this.drawingExact.height);
    this.drawingExact.image(input, 0, 0);
    this.drawingExact.loadPixels();
    const imgArr = this.format(this.drawingExact.pixels, [this.drawingExact.height, this.drawingExact.width]);

    // Evaluate with network
    const layerOutputs = convnet.eval(imgArr);
    // Get modifier for active neuron
    const total = layerOutputs[1][0];

    // Calculate remaining map
    const remaining = kernels.map(kernel => kernel.map((row, i) => row.map((val, j) => Math.max(0, val - total[i][j]))));

    // Update remaining gradients
    this.channelSketches.forEach((p, i) => {
      p.clear();
      const remainingMapFiltered = {};
      remainingMapFiltered[i] = remaining[i];
      p.drawFiltersMap(remainingMapFiltered);
    });
    this.channelGradients.forEach((p, i) => {
      p.clear();
      const remainingMapFiltered = {};
      remainingMapFiltered[i] = remaining[i];
      p.drawFiltersMap(remainingMapFiltered);
    });
    this.remainingSketch.drawArr(total.map(row => row.map(val => val / 3)));

    return remaining;
  }

  render() {
    const { kernels } = this.props;

    console.log('rerender...');

    return (
      <Grid container alignItems="center" spacing={2}>
        <Grid>
          { kernels.map((kernel, i) => (
            <Grid key={i} container>
              <Grid item xs={4} style={{ position: 'relative' }}>
                <div ref={'channel' + i} className="canvasContainer"></div>
                <div ref={'channelGradient' + i} className="overlay canvasContainer"></div>
                <div ref={'channelOverlay' + i} className="overlay canvasContainer"></div>
              </Grid>
            </Grid>
          )) }
        </Grid>
        <Grid>
          <div style={{ position: 'relative' }}>
            <div ref="drawing" className="drawing canvasContainer"></div>
            <div ref="drawingOverlay" className="overlay drawing canvasContainer"></div>
          </div>
          <div style={{ position: 'relative', display: 'none' }}>
            <div ref="drawingExact" className="drawing canvasContainer"></div>
            <div ref="remaining" className="canvasContainer"></div>
          </div>
        </Grid>
      </Grid>
    );
  }
}

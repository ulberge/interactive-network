import React, { Component } from 'react';
import p5 from 'p5';
import Boid from './boid';

const h = 19;
const w = 19;
const speed = 0;
const threshold = 5;
const maxLines = 3;
const stride = 5;
const subReceptiveField = 9;

/* global nj */

function getEmptySketch(scale) {
  return (p) => {
    p._scale = scale;
    p.setup = () => {
      p.pixelDensity(1);
      p.createCanvas(w * scale, h * scale);
      p.noLoop();
    };
  };
}

function getGradientSketch() {
  return (p) => {
    p.setup = () => {
      p.pixelDensity(1);
      p.createCanvas(w, h);
      p.noLoop();
    };

    p.drawKernel = kernel => {
      kernel.forEach((row, offsetY) => row.forEach((val, offsetX) => {
        p.push();
        p.translate(offsetX * stride, offsetY * stride);
        p.fill(0, 0, 0, val * 150);
        p.noStroke();
        p.rect(0, 0, subReceptiveField, subReceptiveField);
        p.pop();
      }));
    }
  };
}

export default class SketcherMin extends Component {
  componentDidMount() {
    this.setup();
    this.animate();
  }

  componentDidUpdate() {
    this.reset();
  }

  reset() {
    const { kernels } = this.props;
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    // clear canvases and reset boid
    this.canvases.forEach(p => p.clear());
    this.boid = new Boid(this.drawing, [w, h], maxLines);

    this.channelGradients.forEach((p, i) => {
      p.clear();
      p.drawKernel(kernels[i]);
    });

    this.animate();
  }

  setup() {
    const { scale, kernels } = this.props;
    this.drawing = new p5(getEmptySketch(scale), this.refs.drawing);
    // set pixel density to 1 on sketch!
    this.drawingExact = new p5(getEmptySketch(1), this.refs.drawingExact, 1);

    this.channelGradients = kernels.map((kernel, i) => {
      return new p5(getGradientSketch(scale / 2), this.refs['channelGradient' + i]);
    });

    this.canvases = [ this.drawing, this.drawingExact, ...this.channelGradients ];
    this.boid = new Boid(this.drawing, [w, h], maxLines);
  }

  animate() {
    if (!this.drawing._renderer || this.channelGradients.filter(p => !!p._renderer).length === 0) {
      setTimeout(() => this.animate(), 10);
      return;
    }

    // Get gradient vectors at boid position
    const gradients = this.channelGradients.map(p => {
      const c = p.get(this.boid.pos.x, this.boid.pos.y);
      const gradMagnitude = c[3] / 255; // magnitude of gradient equal to opacity
      return gradMagnitude;
    });

    // Draw marks
    this.boid.run(gradients);

    if (this.boid.shouldUpdateGradients()) {
      // Update gradients based on new marks
      const { remaining, total } = this.updateGradients();

      // Udpate gradient image
      this.channelGradients.forEach((p, i) => {
        p.clear();
        p.drawKernel(remaining[i]);
      });

      // If no strong gradients left
      if (total > threshold) {
        // done, but let line finish drawing...
        this.boid.dieOnNextWall = true;
      }
    }

    if (!this.boid.dead) {
      this.timeout = setTimeout(() => {
        this.animate();
      }, speed);
    } else {
      // const { onFinished } = this.props;
      // const image = this.drawing.get();
      // onFinished(image, total);
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
    const { convnet, kernels, layerIndex, neuronIndex } = this.props;

    // Get current state of canvas as 2D array
    const input = this.drawing.get();
    input.resize(this.drawingExact.width, this.drawingExact.height);
    this.drawingExact.clear();
    this.drawingExact.image(input, 0, 0);
    this.drawingExact.loadPixels();
    const imgArr = this.format(this.drawingExact.pixels, [this.drawingExact.height, this.drawingExact.width]);

    // Evaluate with network
    const layerOutputs = convnet.eval(imgArr);

    // Subtract current activation from original kernel weights to get remaining
    // const out = layerOutputs[layerIndex - 1];
    const out = layerOutputs[1];
    const remaining = out.map((outKernel, i) => outKernel.map((row, y) => row.map((col, x) => Math.max(0, kernels[i][y][x] - col))));

    // total activation of this neuron...
    const total = layerOutputs[2][neuronIndex][0][0];
    return { remaining, total };
  }

  render() {
    const { kernels } = this.props;
    return (
      <div>
        <div ref="drawing" className="drawing canvasContainer"></div>
        <div style={{ position: 'relative', display: 'none' }}>
          <div ref="drawingExact" className="drawing canvasContainer"></div>
          { kernels.map((kernel, i) => (
            <div key={i} ref={'channelGradient' + i} className="overlay canvasContainer"></div>
          )) }
        </div>
      </div>
    );
  }
}

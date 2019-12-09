import React, { Component } from 'react';
import p5 from 'p5';
import Boid from './boid';
import { choose } from './helpers';

const speed = 0;

/* global nj */
/* global window */

export default class SketcherMin extends Component {
  componentDidMount() {
    this.setup();
    this.animate();
  }

  componentDidUpdate() {
    this.reset();
  }

  reset() {
    const { layers, layerIndex, neuronIndex } = this.props;
    const kernels = layers[layerIndex].weights[neuronIndex];
    const { w, h, maxLines } = layers[layerIndex];

    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.attentionTimer = 0;

    // clear canvases and reset boid
    this.canvases.forEach(p => p.clear());
    this.boid = new Boid(this.drawing, this.drawingExact, [w, h], maxLines, kernels);

    this.animate();
  }

  setup() {
    const { layers, layerIndex, neuronIndex, scale } = this.props;
    const kernels = layers[layerIndex].weights[neuronIndex];
    const { w, h, maxLines } = layers[layerIndex];

    this.drawing = new p5(this.getEmptySketch(scale), this.refs.drawing);
    // set pixel density to 1 on sketch!
    this.drawingExact = new p5(this.getEmptySketch(1), this.refs.drawingExact, 1);

    this.channelGradients1 = kernels.map((kernel, i) => {
      return new p5(this.getGradientSketch(1, 1), this.refs['channelGradient1' + i]);
    });

    this.canvases = [ this.drawing, this.drawingExact, ...this.channelGradients1 ];

    if (layerIndex > 1) {
      this.channelGradients2 = kernels.map((kernel, i) => {
        const p = new p5(this.getGradientSketch(1, 2), this.refs['channelGradient2' + i]);
        p._gradKey = i;
        return p;
      });
      this.canvases.push(...this.channelGradients2);
    }

    this.boid = new Boid(this.drawing, this.drawingExact, [w, h], maxLines, kernels);
  }

  animate() {
    const { layers, layerIndex, convnet, neuronIndex, sketchIndex } = this.props;
    const { threshold } = layers[layerIndex];

    if (!this.drawing._renderer || this.channelGradients1.filter(p => !!p._renderer).length === 0) {
      setTimeout(() => this.animate(), 10);
      return;
    }

    // Draw marks
    if (this.force) {
      if (this.force.mag() > 0.01) {
        this.boid.isDrawing = true;
      }

      this.boid.run(this.force);
    }

    // after timer ends, update force
    if (!this.attentionTimer || this.attentionTimer <= 0) {
      // evaluate current state
      const imgArr = this.getCurrentImageArr();
      const maxLayer = layers[layerIndex].modelLayerIndex;
      const layerOutputs = convnet.eval(imgArr, maxLayer);

      // check if we are done
      const total = layerOutputs[layers[layerIndex].modelLayerIndex][neuronIndex][0][0];
      this.total = total;
      // If no strong gradients left
      if (total > threshold) {
        // done, but let line finish drawing...
        this.boid.dieOnNextWall = true;
      }

      // update gradient map
      this.updateForce(layerOutputs);

      this.attentionTimer = Math.floor(Math.random() * 3) + 3;
    } else {
      this.attentionTimer--;
    }

    if (!this.boid.dead) {
      this.timeout = setTimeout(() => {
        this.animate();
      }, speed);
    } else {
      // if did not pass threshold, try again
      // console.log('final for layer ' + layerIndex + ' neuron ' + neuronIndex + ': ' + this.total);
      // if (this.total < threshold) {
      //   this.reset();
      // } else {
      //   console.log('Success! for layer ' + layerIndex + ' neuron ' + neuronIndex + ' sketch ' + sketchIndex + ': ' + this.total);
      // }
      console.log('Success! for layer ' + layerIndex + ' neuron ' + neuronIndex + ' sketch ' + sketchIndex + ': ' + this.total);
      if (!window._data_sketches) {
        window._data_sketches = {};
      }
      if (!window._data_sketches[layerIndex + '_' + neuronIndex]) {
        window._data_sketches[layerIndex + '_' + neuronIndex] = {
          results: [Infinity, Infinity, Infinity, Infinity],
          callbacks: [0, 0, 0, 0]
        };
      }

      const dataStore = window._data_sketches[layerIndex + '_' + neuronIndex];
      dataStore.results[sketchIndex] = this.total;
      dataStore.callbacks[sketchIndex] = () => {
        this.reset();
      };

      let min = Infinity;
      dataStore.results.forEach(v => v < min ? min = v : null);
      const lowestIndex = dataStore.results.indexOf(min);
      dataStore.callbacks[lowestIndex]();
    }
  }


  getGradient(remaining, kernelIndex) {
    const p = this.channelGradients1[kernelIndex];
    p.clear();
    p.drawKernel(remaining);
    const c = p.get(this.boid.pos.x * p._scale, this.boid.pos.y * p._scale);
    const gradient = c[3] / 255; // magnitude of gradient equal to opacity
    return gradient;
  }

  getGradientN(remaining, kernelIndex) {
    const p = this.channelGradients2[kernelIndex];
    p.clear();
    p.drawKernel(remaining);
    const c = p.get(this.boid.pos.x * p._scale, this.boid.pos.y * p._scale);
    const gradient = c[3] / 255; // magnitude of gradient equal to opacity
    return gradient;
  }

  /**
   * Returns an empty 2D array
   * @param {int} rows - Number of rows in the array
   * @param {int} columns - Number of columns in the array
   * @param defaultValue - Default value for new array cells
   */
  getEmpty2DArray(rows, columns, defaultValue = null) {
    const arr = new Array(rows);
    for (let i = 0; i < rows; i += 1) {
      arr[i] = new Array(columns);
      for (let j = 0; j < columns; j += 1) {
        arr[i][j] = defaultValue;
      }
    }
    return arr;
  }

  combineKernels(kernels) {
    const arr2D = this.getEmpty2DArray(5, 5, 0);
    kernels.forEach((row, offsetY) => row.forEach((kernel, offsetX) => {
      kernel.forEach((rowInner, offsetYInner) => rowInner.forEach((val, offsetXInner) => {
        arr2D[offsetY + offsetYInner][offsetX + offsetXInner] += val;
      }))
    }));
    return arr2D;
  }

  getForces(gradients) {
    // get forces
    const forces = gradients.map((mag, i) => {
      // choose gradient direction that is closer to current velocity
      const vecs = [
        [[0, 1], [0, -1]],
        [[1, 0], [-1, 0]],
        [[1, 1], [-1, -1]],
        [[-1, 1], [1, -1]],
      ];
      const gradDirection1 = this.drawing.createVector(...vecs[i][0]);
      const gradDirection2 = this.drawing.createVector(...vecs[i][1]);
      let gradientVector;
      if (Math.abs(this.boid.vel.angleBetween(gradDirection1)) < Math.abs(this.boid.vel.angleBetween(gradDirection2))) {
        gradientVector = gradDirection1;
      } else {
        gradientVector = gradDirection2;
      }

      // return that gradient multiplied by its current magnitude
      return gradientVector.normalize().mult(mag);
    });

    return forces;
  }

  updateForce(layerOutputs) {
    const { layers, layerIndex, neuronIndex } = this.props;

    if (layerIndex === 1) {
      const scopedOutputs = layerOutputs;
      // calculate remaining at level 1
      const kernels = layers[1].weights[neuronIndex];
      const out = layerOutputs[layers[1].modelLayerIndex - 1];
      const remaining = out.map((outKernel, i) => outKernel.map((row, y) => row.map((col, x) => Math.max(0, kernels[i][y][x] - col))));

      // Generate the remaining map for each level for each channel showing remaining activation potential and fetch mag at location
      const gradients = remaining.map((kernel, i) => this.getGradient(kernel, i));
      const forces = this.getForces(gradients);

      // At the location, select a channel with probability equal to magnitude
      const channelIndex = choose(gradients);

      // Set the force equal to this channel at bottom
      this.force = forces[channelIndex];
    } else if (layerIndex === 2) {
      const kernels2 = layers[2].weights[neuronIndex];
      const out2 = layerOutputs[layers[2].modelLayerIndex - 1];
      const remaining2 = out2.map((outKernel, i) => outKernel.map((row, y) => row.map((col, x) => Math.max(0, kernels2[i][y][x] - col))));
      const gradients2 = remaining2.map((kernel, i) => this.getGradientN(kernel, i));

      const channelIndexLayer2 = choose(gradients2);

      // use the selected neuron to calculate the gradient like previous
      const kernels1 = layers[1].weights[channelIndexLayer2];
      const out1 = layerOutputs[layers[1].modelLayerIndex - 1];

      // We can apply those kernels to the Layer 0 max pool output to make a gradient....
      // produce the layer 1 original kernels modified by layer 2
      const kernel2Selected = kernels2[channelIndexLayer2];
      // for each channel in layer 1, produce a map multiplied by the kernel value
      // should be a list of 3x3 kernels
      const modifiedKernels = kernels1.map(kernel1 => kernel2Selected.map(row2 => row2.map(val2 => {
        return kernel1.map(row1 => row1.map(val1 => val1 * val2 / 3));
      })));

      const projectedKernels = modifiedKernels.map(kernels2D => this.combineKernels(kernels2D));
      const remaining = out1.map((outKernel, i) => outKernel.map((row, y) => row.map((col, x) => Math.max(0, projectedKernels[i][y][x] - col))));

      const gradients = remaining.map((kernel, i) => this.getGradient(kernel, i));
      const forces = this.getForces(gradients);

      // At the location, select a channel with probability equal to magnitude
      const channelIndexLayer1 = choose(gradients);

      // Set the force equal to this channel at bottom
      this.force = forces[channelIndexLayer1];
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

  getEmptySketch(scale, pixelDensity=1) {
    const { layers, layerIndex } = this.props;
    const { w, h } = layers[layerIndex];

    return (p) => {
      p._scale = scale;
      p.setup = () => {
        p.pixelDensity(pixelDensity);
        p.createCanvas(w * scale, h * scale);
        p.noLoop();
      };
    };
  }

  getGradientSketch(scale, layerIndexForSketch) {
    const { layers, layerIndex } = this.props;
    const { w, h } = layers[layerIndex];
    const { subReceptiveField, stride } = layers[layerIndexForSketch];

    return (p) => {
      p._scale = scale;

      p.setup = () => {
        p.createCanvas(w * scale, h * scale);
        p.noLoop();
      };

      p.drawKernel = kernel => {
        kernel.forEach((row, offsetY) => row.forEach((val, offsetX) => {
          p.push();
          p.scale(scale);
          p.translate(offsetX * stride, offsetY * stride);
          p.fill(0, 0, 0, val * 150);
          p.noStroke();
          p.rect(0, 0, subReceptiveField, subReceptiveField);
          p.pop();
        }));
      };
    };
  }

  // Get current state of canvas as 2D array
  getCurrentImageArr() {
    // const input = this.drawing.get();
    // input.resize(this.drawingExact.width, this.drawingExact.height);
    // this.drawingExact.clear();
    // this.drawingExact.image(input, 0, 0);
    this.drawingExact.loadPixels();
    const imgArr = this.format(this.drawingExact.pixels, [this.drawingExact.height, this.drawingExact.width]);
    return imgArr;
  }

  render() {
    const { layers, layerIndex } = this.props;
    return (
      <div>
        <div ref="drawing" className="drawing canvasContainer"></div>
        <div style={{ position: 'relative', display: 'none' }}>
          <div ref="drawingExact" className="drawing canvasContainer"></div>
          { layers[0].weights.map((kernel, i) => (
            <div key={i} ref={'channelGradient1' + i} className="canvasContainer"></div>
          )) }
          { layerIndex > 1
            ? new Array(4).fill(0).map((kernel, i) => (
                <div key={'_2' + i} ref={'channelGradient2' + i} className="canvasContainer"></div>
              ))
            : null
          }
        </div>
      </div>
    );
  }
}

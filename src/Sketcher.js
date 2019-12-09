import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import p5 from 'p5';
import ReplayIcon from '@material-ui/icons/Replay';
import IconButton from '@material-ui/core/IconButton';
import PauseIcon from '@material-ui/icons/Pause';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

import Boid from './boid';
import { choose } from './helpers';

const speed = 50;

/* global nj */

export default class Sketcher extends Component {
  state = {
    play: true
  }

  componentDidMount() {
    this.setup();
    this.animate();
  }

  componentDidUpdate() {
    if (this.state.play) {
      this.reset();
    }
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

    // draw something on them
    this.channelSketches1.forEach((p, i) => {
      const remainingMapFiltered = {};
      remainingMapFiltered[i] = kernels[i];
      p.clear();
      p.drawFiltersMap(remainingMapFiltered);
    });
    this.channelGradients1.forEach((p, i) => {
      p.clear();
      p.drawKernel(kernels[i]);
    });

    this.animate();
  }

  setup() {
    const { layers, layerIndex, neuronIndex, scale } = this.props;
    const kernels = layers[layerIndex].weights[neuronIndex];
    const { w, h, maxLines } = layers[layerIndex];

    const channelScale = 10 * scale / w;

    // create channel maps
    this.channelSketches1 = kernels.map((kernel, i) => {
      const p = new p5(this.getSketch(channelScale, 1), this.refs['channel1' + i]);
      p._gradKey = i;
      return p;
    });
    this.channelGradients1 = kernels.map((kernel, i) => {
      const p = new p5(this.getGradientSketch(channelScale, 1), this.refs['channelGradient1' + i]);
      p._gradKey = i;
      return p;
    });
    this.channelOverlays1 = kernels.map((kernel, i) => {
      return new p5(this.getEmptySketch(channelScale), this.refs['channelOverlay1' + i]);
    });

    // create drawing area
    const drawingScale = 6 * scale / w;
    this.drawing = new p5(this.getEmptySketch(scale * drawingScale), this.refs.drawing);
    this.drawingOverlay = new p5(this.getEmptySketch(scale * drawingScale), this.refs.drawingOverlay);

    // create extra canvases for processing
    this.drawingExact = new p5(this.getEmptySketch(1), this.refs.drawingExact, 1);

    this.acts = kernels.map((kernel, i) => {
      return new p5(this.getBlockSketch(15), this.refs.acts);
    });

    this.canvases = [
      ...this.channelSketches1, ...this.channelGradients1, ...this.channelOverlays1,
      this.drawing, this.drawingOverlay, this.drawingExact, ...this.acts
    ];

    if (layerIndex > 1) {
      this.channelGradients2 = kernels.map((kernel, i) => {
        const p = new p5(this.getGradientSketch(channelScale, 2), this.refs['channelGradient2' + i]);
        p._gradKey = i;
        return p;
      });
      this.channelOverlays2 = kernels.map((kernel, i) => {
        return new p5(this.getEmptySketch(channelScale), this.refs['channelOverlay2' + i]);
      });
      this.canvases.push(...this.channelGradients2);
      this.canvases.push(...this.channelOverlays2);
    }

    // initialize boid
    this.boid = new Boid(this.drawing, this.drawingExact, [w, h], maxLines, kernels);
  }

  animate() {
    const { layers, layerIndex, convnet, neuronIndex } = this.props;
    const { threshold } = layers[layerIndex];

    if (!this.drawing._renderer || this.channelGradients1.filter(p => !!p._renderer).length === 0) {
      setTimeout(() => this.animate(), 10);
      return;
    }

    // clear overlays
    this.drawingOverlay.clear();
    this.channelOverlays1.forEach(p => p.clear());

    if (this.force) {
      // only start drawing once we hit something
      if (this.force.mag() > 0.01) {
        this.boid.isDrawing = true;
      }

      // run boid
      this.boid.run(this.force);

      // render
      this.boid.drawBoid(this.drawingOverlay);
      this.channelOverlays1.forEach(p => this.boid.drawBoid(p));
      this.boid.drawVector(this.drawingOverlay, this.force.copy().mult(10));
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
      if (this.refs.total) {
        this.refs.total.innerHTML = total.toFixed(2);
      }
      // If no strong gradients left
      if (total > threshold) {
        // done, but let line finish drawing...
        this.boid.dieOnNextWall = true;
      }

      // update gradient map
      this.updateForce(layerOutputs);

      this.attentionTimer = Math.floor(Math.random() * 2) + 2;
    } else {
      this.attentionTimer--;
    }

    if (!this.boid.dead) {
      if (this.state.play) {
        this.timeout = setTimeout(() => {
          this.animate();
        }, speed);
      }
    } else {
      // clear boid
      this.drawingOverlay.clear();
      this.channelOverlays1.forEach(p => p.clear());

      console.log(this.total);
      if (this.state.play) {
        this.reset();
      }
    }
  }

  getGradient(remaining, kernelIndex) {
    const p = this.channelGradients1[kernelIndex];
    p.clear();
    p.drawKernel(remaining);
    const remainingMapFiltered = {};
    remainingMapFiltered[kernelIndex] = remaining;
    this.channelSketches1[kernelIndex].clear();
    this.channelSketches1[kernelIndex].drawFiltersMap(remainingMapFiltered);

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
      const options = [gradDirection1, gradDirection2];
      const optionIndex = choose([Math.abs(this.boid.vel.angleBetween(gradDirection1)), Math.abs(this.boid.vel.angleBetween(gradDirection2))]);
      gradientVector = options[optionIndex === 1 ? 0 : 1];
      // if (Math.abs(this.boid.vel.angleBetween(gradDirection1)) < Math.abs(this.boid.vel.angleBetween(gradDirection2))) {
      //   gradientVector = gradDirection1;
      // } else {
      //   gradientVector = gradDirection2;
      // }

      // return that gradient multiplied by its current magnitude
      return gradientVector.normalize().mult(mag);
    });

    return forces;
  }

  updateForce(layerOutputs) {
    const { layers, layerIndex, neuronIndex } = this.props;

    if (layerIndex === 1) {
      // calculate remaining at level 1
      const kernels = layers[1].weights[neuronIndex];
      const out = layerOutputs[layers[1].modelLayerIndex - 1];
      out.forEach((outKernel, i) => this.acts[i].drawArr(outKernel));
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
      out2.forEach((outKernel, i) => this.acts[i].drawArr(outKernel));
      debugger;
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

  getSketch(scale, layerIndexForSketch, pixelDensity) {
    const { layers, layerIndex } = this.props;
    const { w, h } = layers[layerIndex];
    const { subReceptiveField, stride } = layers[layerIndexForSketch];

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
        const h = subReceptiveField / 6;
        const f = subReceptiveField / 3;
        const subStride = (subReceptiveField - f) / 2;
        filter.forEach((row, offsetY) => row.forEach((val, offsetX) => {
          p.push();
          p.translate(offsetX * stride, offsetY * stride);
          p.stroke(0, 0, 0, val * 255);
          // draw 3x3 grid matching first layer with opacity equal to value filtersMap
          for (let y = 0; y < 3; y += 1) {
            for (let x = 0; x < 3; x += 1) {
              p.push();
              p.translate(x * subStride, y * subStride);
              const lines = [
                [ h, 0, h, f ], // vertical
                [ 0, h, f, h ], // horizontal
                [ 0, 0, f, f ], // diag1
                [ 0, f, f, 0 ], // diag2
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

  getBlockSketch(scale) {
    return (p) => {
      p.setup = () => {
        p.pixelDensity(1);
        p.createCanvas(3 * scale, 3 * scale);
        p.noLoop();
        p.noStroke();
      };

      p.drawArr = (imgArr) => {
        for (let y = 0; y < imgArr.length; y += 1) {
          for (let x = 0; x < imgArr[y].length; x += 1) {
            // p.fill(0, 0, 0, imgArr[y][x] * 255);
            p.fill(0, 0, 0, imgArr[y][x] * 100);
            p.rect(x * scale, y * scale, scale, scale);
          }
        }
      };
    };
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

  format(imgArr, size) {
    const gray = [];
    for (let i = 3; i < imgArr.length; i += 4) {
      gray.push(imgArr[i] / 255);
    }
    const gray_f = nj.array(gray).reshape(size[0], size[1]);
    return gray_f.tolist();
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

  togglePlay() {
    this.setState({ play: !this.state.play });
    // this.reset();
  }

  render() {
    const { layerIndex } = this.props;

    return (
      <Grid container alignItems="center" spacing={2}>
        { layerIndex > 1
          ? (
             <Grid>
              { new Array(4).fill(0).map((kernel, i) => (
                <Grid key={i} container>
                  <Grid item style={{ position: 'relative' }}>
                    <div ref={'channelGradient2' + i} className="canvasContainer"></div>
                    <div ref={'channelOverlay2' + i} className="overlay canvasContainer"></div>
                  </Grid>
                </Grid>
              )) }
            </Grid>
          )
          : null
        }
        <Grid>
          { new Array(4).fill(0).map((kernel, i) => (
            <Grid key={i} container>
              <Grid item style={{ position: 'relative' }}>
                <div ref={'channel1' + i} className="canvasContainer"></div>
                <div ref={'channelGradient1' + i} className="overlay canvasContainer"></div>
                <div ref={'channelOverlay1' + i} className="overlay canvasContainer"></div>
              </Grid>
            </Grid>
          )) }
        </Grid>
        <Grid>
          <div style={{ position: 'relative' }}>
            <div ref="drawing" className="drawing canvasContainer"></div>
            <div ref="drawingOverlay" className="overlay drawing canvasContainer"></div>
          </div>
          <IconButton aria-label="generate batch" onClick={() => this.togglePlay()}>
            { this.state.play
              ? (<PauseIcon style={{ color: '#000' }}/>)
              : (<PlayArrowIcon style={{ color: '#000' }}/>)
            }
            &nbsp;
            <span ref="total" style={{ color: '#000', fontSize: '10px' }}></span>
          </IconButton>
        </Grid>
        <Grid style={{ position: 'relative', display: 'block' }}>
          <div ref="acts" className="drawing canvasContainer acts" style={{ display: 'none' }}></div>
          <div ref="drawingExact" className="drawing canvasContainer" style={{ display: 'none' }}></div>
        </Grid>
      </Grid>
    );
  }
}

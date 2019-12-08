import React, { Component } from 'react';
import p5 from 'p5';

export default class StrokeMap extends Component {
  componentDidMount() {
    this.sketch = new p5(this.getSketch(), this.refs.image);
    this._draw();
  }

  componentDidUpdate() {
    this._draw();
  }

  _draw() {
    if (!this.sketch._renderer) {
      setTimeout(() => this._draw(), 10);
      return;
    }

    const { kernels, scale, size, subReceptiveField, stride } = this.props;
    this.sketch.drawKernels(kernels, scale, size, subReceptiveField, stride);
  }

  getSketch() {
    return (p) => {
      p.setup = () => {
        const { size, scale } = this.props;
        p.createCanvas(size * scale, size * scale);
        p.background(255);
        p.noLoop();
      };

      p.draw = () => {};

      p.drawKernels = (kernels, scale, size, subReceptiveField, stride) => {
        p.clear();
        p.push();
        p.stroke(0);
        p.strokeWeight(1);
        p.strokeCap(p.SQUARE);
        p.scale(scale);
        kernels.forEach((kernel, i) => {
          const h = subReceptiveField / 6;
          const f = subReceptiveField / 3;
          const subStride = (subReceptiveField - f) / 2;
          kernel.forEach((row, offsetY) => row.forEach((val, offsetX) => {
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

                p.line(...lines[i]);
                p.pop();
              }
            }

            p.pop();
          }));
        });
        p.pop();
      }
    };
  }

  render() {
    return (
      <span ref="image"></span>
    );
  }
}

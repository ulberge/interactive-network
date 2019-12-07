import React, { Component } from 'react';
import p5 from 'p5';

export default class StrokeMap extends Component {
  componentDidMount() {
    const { kernels } = this.props;

    if (kernels) {
      this._draw(kernels);
    }
  }

  componentDidUpdate() {
    const { kernels } = this.props;

    if (kernels) {
      this._draw(kernels);
    }
  }

  async _draw(kernels) {
    this.refs.image.innerHTML = '';

    const { scale, size, offset } = this.props;
    new p5(this.getSketch(kernels, size, offset, scale), this.refs.image);
  }

  getSketch(kernels, size, offsetSize, scale) {
    const h = size;
    const w = size;

    return (p) => {
      p.setup = () => {
        p.createCanvas(w * scale, h * scale);
        p.noLoop();
      };

      p.draw = () => {
        p.stroke(0);
        p.strokeWeight(1);
        p.strokeCap(p.SQUARE);
        p.push();
        p.scale(scale);
        kernels.forEach((kernel, i) => drawType(i, kernel));
        p.pop();
      };

      function drawType(type, filter) {
        filter.forEach((row, offsetY) => row.forEach((val, offsetX) => {
          p.push();
          p.translate(offsetX * offsetSize, offsetY * offsetSize);

          p.stroke(0, 0, 0, val * 255);
          // draw 3x3 grid matching first layer with opacity equal to value kernels
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

  render() {
    return (
      <span ref="image"></span>
    );
  }
}

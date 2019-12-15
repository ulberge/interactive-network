import React, { Component } from 'react';
import p5 from 'p5';
import Grid from '@material-ui/core/Grid';
import CompressionTestOutput from './CompressionTestOutput';

/* global nj */
const size = [150, 150];

// Show an editable canvas, on edit, render the compressions in all the various ways:
// different kernel sizes, different kernels...
export default class CompressionTest extends Component {
  state = {
    imgArr: []
  }

  componentDidMount() {
    this._setup();
  }

  async _setup() {
    this.refs.image.innerHTML = '';
    new p5(this.getSketch(size, 1), this.refs.image);
  }

  format(imgArr, size) {
    const gray = [];
    for (let i = 0; i < imgArr.length; i += 4) {
      gray.push(1 - (imgArr[i] / 255));
    }
    const gray_f = nj.array(gray).reshape(size[0], size[1]);
    return gray_f.tolist();
  }

  getSketch(size, scale) {
    const [ h, w ] = size;
    let pressed = false;

    return (p) => {
      p.setup = () => {
        p.pixelDensity(1);
        p.createCanvas(w * scale, h * scale);
        p.background(255);
      };

      p.draw = () => {
        p.fill(0);
        p.stroke(0);
        // p.strokeWeight(1);
        p.strokeWeight(scale);

        // Record mouse pressed events within canvas
        const px = p.pmouseX;
        const py = p.pmouseY;
        const x = p.mouseX;
        const y = p.mouseY;
        if (!(x < 0 || y < 0 || px < 0 || py < 0 || x >= p.width || px >= p.width || y >= p.height || py >= p.height)) {
          if (p.mouseIsPressed) {
            pressed = true;
            // draw line
            p.line(px, py, x, y);
          } else {
            if (pressed) {
              pressed = false;
              p.loadPixels();
              const imgArr = this.format(p.pixels, size);
              this.setState({ imgArr });
            }
          }
        }
      };
    };
  }

  render() {
    const { imgArr } = this.state;

    return (
      <Grid container alignItems="center" spacing={2}>
        <Grid item>
          <span ref="image" className="editable drawarea"></span>
        </Grid>
        <Grid item>
          <CompressionTestOutput imgArr={ imgArr } />
        </Grid>
      </Grid>
    );
  }
}

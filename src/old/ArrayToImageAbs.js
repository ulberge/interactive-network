import React, { Component } from 'react';
import p5 from 'p5';

export default class ArrayToImageAbs extends Component {
  componentDidMount() {
    const { imgArr } = this.props;
    this._draw(imgArr);
  }

  componentDidUpdate() {
    const { imgArr } = this.props;
    this._draw(imgArr);
  }

  async _draw(imgArr) {
    this.refs.image.innerHTML = '';

    if (imgArr.length > 0 && imgArr[0].length > 0) {
      new p5(this.getSketch(imgArr), this.refs.image);
    }
  }

  getSketch(imgArr) {
    const scale = this.props.scale || 1;
    const h = imgArr.length;
    const w = imgArr[0].length;

    return (p) => {
      p.setup = () => {
        p.pixelDensity(1);
        p.createCanvas(w * scale, h * scale);
        p.background(255);
        p.noLoop();
        p.noStroke();
      };

      p.draw = () => {
        // normalize array in 255
        const arr_flat = imgArr.flat();
        let i = 0;
        for (let y = 0; y < h; y += 1) {
          for (let x = 0; x < w; x += 1) {
            p.fill(0, 0, 0, (arr_flat[i] * 127) + 127);
            p.rect(x * scale, y * scale, scale, scale);
            i += 1;
          }
        }
      };
    };
  }

  render() {
    return (
      <span ref="image" className="data"></span>
    );
  }
}

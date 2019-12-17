import React, { Component } from 'react';
import p5 from 'p5';

export default class ArrayToImage extends Component {
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

  normalizeArray(arr) {
    const normalize = (v, max, min) => {
      return (v - min) / (max - min);
    };

    const max = Math.max.apply(null, arr);
    const min = Math.min.apply(null, arr);

    if ((max - min) === 0) {
      return arr.map(v => v > 0 ? 1 : 0);
    }

    const norms = arr.map(v => normalize(v, max, min));
    return norms;
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
        const arr_flat_norm = this.normalizeArray(arr_flat);
        let i = 0;
        for (let y = 0; y < h; y += 1) {
          for (let x = 0; x < w; x += 1) {
            // p.fill(arr_flat_norm[i] * 255);
            p.fill(0, 0, 0, arr_flat_norm[i] * 255);
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

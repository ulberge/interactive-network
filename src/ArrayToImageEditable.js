import React, { Component } from 'react';
import p5 from 'p5';

export default class ArrayToImageEditable extends Component {
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
    const { scale, onChange } = this.props;
    const h = imgArr.length;
    const w = imgArr[0].length;

    const imgArrCopy = imgArr.map(row => row.map(val => val));

    return (p) => {
      p.setup = () => {
        p.pixelDensity(1);
        p.createCanvas(w * scale, h * scale);
        p.noStroke();
        drawImgArr();
      };

      const drawImgArr = () => {
        p.clear();
        for (let y = 0; y < h; y += 1) {
          for (let x = 0; x < w; x += 1) {
            p.fill(0, 0, 0, imgArrCopy[y][x] * 255);
            p.rect(x * scale, y * scale, scale, scale);
          }
        }
      }

      p.mousePressed = (e) => {
        const x = p.mouseX;
        const y = p.mouseY;
        if (!(x < 0 || y < 0 || x >= p.width || y >= p.height)) {
          const scaledX = Math.floor(x / scale);
          const scaledY = Math.floor(y / scale);
          if (e.button === 0 && !e.shiftKey) { // left click
            imgArrCopy[scaledY][scaledX] = Math.min(1, imgArrCopy[scaledY][scaledX] + 0.2);
          }
          if (e.button === 0 && e.shiftKey) { // right click
            imgArrCopy[scaledY][scaledX] = Math.max(0, imgArrCopy[scaledY][scaledX] - 0.2);
            e.preventDefault();
          }
          onChange(imgArrCopy);
        }
      }

      p.draw = () => {};
    };
  }

  render() {
    return (
      <span ref="image" className="editable"></span>
    );
  }
}

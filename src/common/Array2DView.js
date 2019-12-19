import React, { Component } from 'react';
import p5 from 'p5';

import { getArraySketch } from '../modules/sketches';

export default class Array2DView extends Component {
  componentDidMount() {
    const { imgArr, scale } = this.props;
    this.p = new p5(getArraySketch(), this.refs.image);
    this.p.customDraw(imgArr, scale);
  }

  componentDidUpdate() {
    const { imgArr, scale } = this.props;
    this.p.customDraw(imgArr, scale);
  }

  render() {
    return (
      <div ref="image"></div>
    );
  }
}

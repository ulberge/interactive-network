import React, { Component } from 'react';
import p5 from 'p5';

import { getArraySketch } from './sketches';

export default class Array2DView extends Component {
  componentDidMount() {
    const { imgArr, scale } = this.props;
    new p5(getArraySketch(imgArr, scale), this.refs.image);
  }

  render() {
    return (
      <span ref="image"></span>
    );
  }
}

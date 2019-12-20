import React, { Component } from 'react';
import PropTypes from 'prop-types';
import p5 from 'p5';

import { getEmptySketch } from '../modules/sketches';
import { draw } from '../modules/draw';

class Array2DDraw extends Component {
  componentDidMount() {
    const { channels, scale, strokeWeight, speed } = this.props;

    // const { shape, marks, onRender, onNewMark, strokeWeight, scale, offset } = config;

    // const config = {
    //   shape, [], strokeWeight, scale
    // }

    // this.p = new p5(getEditableSketch(), this.refs.image);
    this.p = new p5(getEmptySketch(), this.refs.image);
    this.pDebug = new p5(getEmptySketch(), this.refs.overlay);

    if (channels && channels.length > 0) {
      const h = channels[0].length;
      const w = channels[0][0].length;
      this.p.update([ h, w ], scale);
      this.pDebug.update([ h, w ], scale);
      draw(this.p, channels, scale, strokeWeight, speed, this.pDebug);
    }
  }

  render() {
    return (
      <div className="overlay-container">
        <div ref="image"></div>
        <div ref="overlay" className="overlay"></div>
      </div>
    );
  }
}

Array2DDraw.propTypes = {
  channels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
  scale: PropTypes.number.isRequired,
  strokeWeight: PropTypes.number.isRequired,
  speed: PropTypes.number.isRequired,
};

export default Array2DDraw;

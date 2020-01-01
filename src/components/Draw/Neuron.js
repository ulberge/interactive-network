import React, { Component } from 'react';
import PropTypes from 'prop-types';
import p5 from 'p5';
import { getEmptySketch, getArraySketch } from '../../js/sketches';
import { Drawer } from '../../js/draw';

class DrawNeuron extends Component {
  componentDidMount() {
    const { scale, speed, channels } = this.props;

    let shape = [ 0, 0 ];
    if (channels && channels.length > 0) {
      shape = [ channels[0].length, channels[0][0].length ];
    }

    // Create p5 sketches for both
    // Sketch at 1:1 scale
    this.p = new p5(getEmptySketch(shape, 1), this.refs.image);
    // Sketch scaled up for viewing
    this.pDisplay = new p5(getArraySketch(), this.refs.display);
    // Debug also at higher def
    this.pDebug = new p5(getEmptySketch(shape, scale), this.refs.overlay);

    this.drawer = new Drawer(this.p, this.pDisplay, this.pDebug, scale, speed);
    this.startDrawing();
  }

  componentDidUpdate() {
    this.startDrawing();
  }

  startDrawing() {
    const { channels, strokeWeight } = this.props;

    // Clear out any stale requests
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
    if (this.drawDelay) {
      clearTimeout(this.drawDelay);
    }
    this.drawer.stop();

    if (this.p._setupDone && this.pDebug._setupDone) {
      // Clear canvases
      this.p.clear();
      this.pDisplay.clear();
      this.pDebug.clear();

      // execute drawing after slight delay to speed up page
      this.drawDelay = setTimeout(() => {
        this.drawer.draw(channels, strokeWeight);
      }, 300);
    } else {
      // Need to wait for p5 sketches to be ready for drawing before we actually start
      this.retryTimer = setTimeout(() => {
        this.startDrawing();
      }, 10);
    }
  }

  render() {
    return (
      <div className="overlay-container">
        <div ref="display"></div>
        <div ref="overlay" className="overlay"></div>
        <div ref="image" style={{ display: 'block' }}></div>
      </div>
    );
  }
}

DrawNeuron.propTypes = {
  channels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
  scale: PropTypes.number.isRequired,
  strokeWeight: PropTypes.number.isRequired,
  speed: PropTypes.number.isRequired,
  shape: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default DrawNeuron;

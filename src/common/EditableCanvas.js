import React, { Component } from 'react';
import p5 from 'p5';

import { getEditableSketch } from '../modules/sketches';

export default class EditableCanvas extends Component {
  componentDidMount() {
    this.p = new p5(getEditableSketch(this.props), this.refs.canvas);
  }

  componentDidUpdate() {
    this.p.updateConfig(this.props);
  }

  render() {
    return (
      <div ref="canvas" className="editable" style={{ textAlign: 'center' }}></div>
    );
  }
}

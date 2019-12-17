import React, { Component } from 'react';
import p5 from 'p5';

import { getEditableSketch } from './sketches';

export default class EditableCanvas extends Component {
  componentDidMount() {
    const { size, onChange } = this.props;
    new p5(getEditableSketch(size, onChange), this.refs.canvas);
  }

  render() {
    return (
      <span ref="canvas" className="editable"></span>
    );
  }
}

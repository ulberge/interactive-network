import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import p5 from 'p5';
import { getEditableSketch } from '../../js/sketches';

const EditableCanvas = props => {
  const imgRef = useRef(null);
  const pRef = useRef(null);

  useEffect(() => {
    // run once
    if (!pRef.current && imgRef.current) {
      pRef.current = new p5(getEditableSketch(props), imgRef.current);
    }
    // run every time
    if (pRef.current) {
      pRef.current.updateConfig(props);
    }
  }, [props]);

  return (
    <div ref={imgRef}></div>
  );
};

EditableCanvas.propTypes = {
  shape: PropTypes.arrayOf(PropTypes.number).isRequired,
  marks: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
  strokeWeight: PropTypes.number,
  scale: PropTypes.number,
  offset: PropTypes.number,
  rotation: PropTypes.number,
  onNewMark: PropTypes.func,
  onRender: PropTypes.func,
};

export default EditableCanvas;

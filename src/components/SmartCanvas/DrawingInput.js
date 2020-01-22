import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import p5 from 'p5';
import SmartCanvas from '../../js/smartcanvas';

const SmartCanvasDrawingInput = props => {
  const imgRef = useRef(null);
  const pRef = useRef(null);
  const smartCanvasRef = useRef(null);

  useEffect(() => {
    if (!pRef.current) {
      smartCanvasRef.current = new SmartCanvas(props.shape, props.firstLayer);
      pRef.current = new p5(smartCanvasRef.current.getSketch(), imgRef.current);
    }
  }, [props]);

  useEffect(() => {
    if (smartCanvasRef.current) {
      smartCanvasRef.current.onChange = props.onChange;
    }
  }, [props.onChange]);

  useEffect(() => {
    if (smartCanvasRef.current) {
      smartCanvasRef.current.layer = props.firstLayer;
    }
  }, [props.firstLayer]);

  return (
    <div ref={imgRef}></div>
  );
};

SmartCanvasDrawingInput.propTypes = {
  firstLayer: PropTypes.object.isRequired,
  shape: PropTypes.arrayOf(PropTypes.number).isRequired,
  onChange: PropTypes.func,
};

export default SmartCanvasDrawingInput;

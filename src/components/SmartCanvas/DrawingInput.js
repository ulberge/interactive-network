import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import SmartCanvas from '../../js/smartCanvas/smartCanvas';
import ClearIcon from '@material-ui/icons/Clear';
import IconButton from '@material-ui/core/IconButton';

const SmartCanvasDrawingInput = props => {
  const imgRef = useRef(null);
  const smartCanvasRef = useRef(null);

  useEffect(() => {
    if (!smartCanvasRef.current) {
      smartCanvasRef.current = new SmartCanvas(imgRef.current, props.kernels, props.shape);
      smartCanvasRef.current.addListener(props.onChange);
    }
  }, [props]);

  const clear = () => {
    if (smartCanvasRef.current) {
      smartCanvasRef.current.reset();
    }
  };

  return (
    <div>
      <div ref={imgRef}></div>
      <IconButton aria-label="reset" onClick={clear}>
        <ClearIcon />
      </IconButton>
    </div>
  );
};

SmartCanvasDrawingInput.propTypes = {
  kernels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
  shape: PropTypes.arrayOf(PropTypes.number).isRequired,
  onChange: PropTypes.func,
};

export default SmartCanvasDrawingInput;

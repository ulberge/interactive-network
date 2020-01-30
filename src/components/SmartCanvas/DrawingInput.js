import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import SmartCanvas from '../../js/smartCanvas';
import ClearIcon from '@material-ui/icons/Clear';
import IconButton from '@material-ui/core/IconButton';
import p5 from 'p5';

/**
 * return the p5 sketch for the SmartCanvas
 */
function getSketch(shape, smartCanvasRef) {
  let dirty = false;
  return (p) => {
    p.setup = () => {
      p.pixelDensity(1);
      const [ w, h ] = shape;
      p.createCanvas(w, h);
      p.strokeWeight(2);
    };

    p.draw = () => {
      if (p.mouseIsPressed) {
        // while mouse is pressed, add line segments to canvas
        const start = { x: p.pmouseX, y: p.pmouseY };
        const end = { x: p.mouseX, y: p.mouseY };
        if (!(start.x < 0 || start.y < 0 || end.x < 0 || end.y < 0 || end.x >= p.width || start.x >= p.width || end.y >= p.height || start.y >= p.height)) {
          smartCanvasRef.current.addSegment(start, end);
          dirty = true;
        }
      } else {
        // at end of mouse press, update LineInfo
        if (dirty) {
          smartCanvasRef.current.update();
          dirty = false;
        }
      }
    };
  };
}

const SmartCanvasDrawingInput = props => {
  const imgRef = useRef(null);
  const smartCanvasRef = useRef(null);

  useEffect(() => {
    if (!smartCanvasRef.current) {
      console.log('init smart canvas');
      const p = new p5(getSketch(props.shape, smartCanvasRef), imgRef.current);
      const layerInfos = [{
        type: 'conv2d',
        kernelSize: props.kernels[0].length,
        filters: props.kernels.map(k => [k])
      }];
      const [ w, h ] = props.shape;
      smartCanvasRef.current = new SmartCanvas(p, [ h, w ], layerInfos);
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

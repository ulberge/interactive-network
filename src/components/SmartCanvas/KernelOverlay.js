import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import p5 from 'p5';
import { getSketch } from '../../js/sketches/kernelOverlay';

const SmartCanvasKernelOverlay = props => {
  const imgRef = useRef(null);
  const pRef = useRef(null);

  useEffect(() => {
    // run once
    if (!pRef.current && imgRef.current) {
      pRef.current = new p5(getSketch(), imgRef.current);
    }

    // run every time
    if (pRef.current) {
      const { kernel, imgArrSlice, scale } = props;
      pRef.current.customDraw(kernel, imgArrSlice, scale);
    }
  }, [props]);

  return (
    <div ref={imgRef}></div>
  );
};

SmartCanvasKernelOverlay.propTypes = {
  kernel: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  imgArrSlice: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  scale: PropTypes.number,
};

export default SmartCanvasKernelOverlay;

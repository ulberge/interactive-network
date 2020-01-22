import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import p5 from 'p5';
import { getSketch } from '../../js/sketches/newMark';

const DrawDebugNewMark = props => {
  const imgRef = useRef(null);
  const pRef = useRef(null);

  useEffect(() => {
    // run once
    if (!pRef.current && imgRef.current) {
      pRef.current = new p5(getSketch(), imgRef.current);
    }

    // run every time
    if (pRef.current) {
      const { debugOption, scale } = props;
      pRef.current.customDraw(debugOption.oldImgArr, debugOption.imgArr, scale);
    }
  }, [props]);

  return ( <div ref={imgRef}></div> );
};

DrawDebugNewMark.propTypes = {
  debugOption: PropTypes.object,
  scale: PropTypes.number,
};

export default DrawDebugNewMark;

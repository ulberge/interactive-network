import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import p5 from 'p5';
import { getSketch } from '../../js/sketches/maxActs';

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
      const { ids, max, scale, kernels } = props;
      pRef.current.customDraw(ids, max, kernels, scale);
    }
  }, [props]);

  return ( <div ref={imgRef}></div> );
};

DrawDebugNewMark.propTypes = {
  max: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  ids: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  scale: PropTypes.number,
  kernels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))),
};

export default DrawDebugNewMark;

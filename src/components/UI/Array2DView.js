import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import p5 from 'p5';
import { getArraySketch } from '../../js/sketches';

const Array2DView = props => {
  const imgRef = useRef(null);
  const pRef = useRef(null);

  useEffect(() => {
    // run once
    if (!pRef.current && imgRef.current) {
      pRef.current = new p5(getArraySketch(), imgRef.current);
    }

    // run every time
    if (pRef.current) {
      pRef.current.customDraw(props.imgArr, props.scale);
    }
  }, [props]);

  return (
    <div ref={imgRef}></div>
  );
};

Array2DView.propTypes = {
  imgArr: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
  scale: PropTypes.number.isRequired,
};

export default Array2DView;

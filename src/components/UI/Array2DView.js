import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import p5 from 'p5';
import { getSketch } from '../../js/sketches/array2DSketch';

const Array2DView = props => {
  const imgRef = useRef(null);
  const pRef = useRef(null);

  useEffect(() => {
    // run once
    if (!pRef.current) {
      pRef.current = new p5(getSketch(), imgRef.current);
    }

    // run every time
    if (pRef.current) {
      pRef.current._draw(props.imgArr, props.scale);
    }
  }, [props]);

  return (
    <div ref={imgRef}></div>
  );
};

Array2DView.propTypes = {
  imgArr: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  scale: PropTypes.number
};

export default Array2DView;

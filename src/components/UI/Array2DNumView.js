import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import p5 from 'p5';
import { getSketch } from '../../js/sketches/array2DNumViewSketch';

// Renders a 2D array as a p5 sketch
const Array2DNumView = props => {
  const { imgArr, scale, fixedWidth, normalize } = props;
  const imgRef = useRef(null);
  const pRef = useRef(null);

  useEffect(() => {
    // run once
    if (!pRef.current) {
      pRef.current = new p5(getSketch(), imgRef.current);
    }

    // run every time
    if (pRef.current) {
      pRef.current._draw(imgArr, scale, fixedWidth);
    }
  }, [ imgArr, scale, fixedWidth, normalize ]);

  return (
    <div ref={imgRef} style={props.style}></div>
  );
};

Array2DNumView.propTypes = {
  imgArr: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  scale: PropTypes.number,
  fixedWidth: PropTypes.number
};

export default Array2DNumView;

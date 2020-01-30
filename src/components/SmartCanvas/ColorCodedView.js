import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import p5 from 'p5';
import { getChannelSketch } from '../../js/sketches/channel';

const SmartCanvasColorCodedView = props => {
  const imgRef = useRef(null);
  const pRef = useRef(null);

  useEffect(() => {
    // run once
    if (!pRef.current && imgRef.current) {
      pRef.current = new p5(getChannelSketch(props.kernels), imgRef.current);
    }

    // run every time
    if (pRef.current) {
      const { onSelect, ids, max, scale } = props;
      pRef.current._onSelect = onSelect;
      pRef.current.customDraw(ids, max, scale);
    }
  }, [props]);

  return (
    <div ref={imgRef}></div>
  );
};

SmartCanvasColorCodedView.propTypes = {
  ids: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  max: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  kernels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))),
  scale: PropTypes.number,
  onSelect: PropTypes.func,
};

export default SmartCanvasColorCodedView;

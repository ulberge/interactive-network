import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import p5 from 'p5';
import { getChannelSketch } from '../../js/sketches/channel';

const ChannelView = props => {
  const imgRef = useRef(null);
  const pRef = useRef(null);

  useEffect(() => {
    // run once
    if (!pRef.current && imgRef.current) {
      pRef.current = new p5(getChannelSketch(), imgRef.current);
    }

    // run every time
    if (pRef.current) {
      pRef.current._onSelect = props.onSelect;
      pRef.current.customDraw(props.ids, props.max, props.scale);
    }
  }, [props]);

  return (
    <div ref={imgRef}></div>
  );
};

ChannelView.propTypes = {
  ids: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  max: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  scale: PropTypes.number,
  onSelect: PropTypes.func,
};

export default ChannelView;

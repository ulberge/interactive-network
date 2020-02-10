import React from 'react';
import PropTypes from 'prop-types';
import Array2DViewList from '../UI/Array2DViewList';

// Renders two lists of 2D arrays as p5 sketches with one overlaid and transparent
const Array2DViewOverlayList = props => {
  const { imgArrs, imgArrsOverlay, scale, overlayOpacity } = props;
  return (
    <div style={{ ...props.style, position: 'relative' }}>
      <Array2DViewList
        imgArrs={imgArrs}
        scale={scale}
      />
      <Array2DViewList
        imgArrs={imgArrsOverlay}
        scale={scale}
        style={{ position: 'absolute', top: '4px', opacity: overlayOpacity || 0.75 }}
      />
    </div>
  );
}

Array2DViewOverlayList.propTypes = {
  imgArrs: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))),
  imgArrsOverlay: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))),
  scale: PropTypes.number,
  overlayOpacity: PropTypes.number,
};

export default Array2DViewOverlayList;

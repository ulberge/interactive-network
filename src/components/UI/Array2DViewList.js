import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Array2DView from './Array2DView';

// Renders a series of 2D arrays as p5 sketches
const Array2DViewList = props => {
  const { imgArrs, cols, scale } = props;
  return (
    <Grid container spacing={1} style={props.style}>
      { imgArrs.map((imgArr, i) => (
        <Grid item key={i} style={ cols && ((i % cols) === (cols - 1)) ? { breakAfter: 'always' } : {}} >
          <Array2DView imgArr={imgArr} scale={scale} />
        </Grid>
      )) }
    </Grid>
  );
}

Array2DViewList.propTypes = {
  imgArrs: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
  scale: PropTypes.number.isRequired,
  cols: PropTypes.number,
};

export default Array2DViewList;

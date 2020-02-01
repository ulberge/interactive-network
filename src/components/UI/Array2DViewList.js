import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Array2DView from './Array2DView';

const Array2DViewList = props => {
  return (
    <Grid container spacing={1} style={props.style}>
      { props.imgArrs.map((imgArr, i) => (
        <Grid item key={i} style={ props.cols && ((i % props.cols) === (props.cols - 1)) ? { breakAfter: 'always' } : {}} >
          <Array2DView imgArr={imgArr} scale={props.scale} />
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

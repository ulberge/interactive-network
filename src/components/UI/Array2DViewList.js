import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Array2DView from './Array2DView';

const Array2DViewList = props => {
  return (
    <Grid container spacing={2} style={{ position: 'relative' }}>
      { props.imgArrs.map((imgArr, i) => {
        return (
          <Grid item key={i} style={{ margin: 'auto' }}>
            <Grid container alignItems="center" justify="center" spacing={2}>
              <Grid item>
                <Array2DView imgArr={imgArr} scale={props.scale} />
              </Grid>
            </Grid>
          </Grid>
        );
      }) }
    </Grid>
  );
}

Array2DViewList.propTypes = {
  imgArrs: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
  scale: PropTypes.number.isRequired,
};

export default Array2DViewList;

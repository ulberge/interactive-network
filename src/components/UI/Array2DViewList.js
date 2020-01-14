import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Array2DView from './Array2DView';

const Array2DViewList = props => {
  return (
    <Grid container spacing={1} style={{ position: 'relative', margin: 'auto' }}>
      { props.imgArrs.map((imgArr, i) => {
        return (
          <Grid item key={i}>
            <Grid container alignItems="center" justify="center" spacing={1}>
              <Grid item>
                <Array2DView imgArr={imgArr} scale={props.scale} normalize={props.normalize} />
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
  normalize: PropTypes.bool,
  scale: PropTypes.number.isRequired,
};

export default Array2DViewList;

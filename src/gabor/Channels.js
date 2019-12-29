import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';

import Array2DView from '../common/Array2DView';

const Channels = props => {
  const { channels, scale } = props;

  return (
    <Grid container spacing={2} style={{ position: 'relative' }}>
      { channels.map((output, i) => {
        return (
          <Grid item key={i} style={{ margin: 'auto' }}>
            <Grid container alignItems="center" justify="center" spacing={2}>
              <Grid item className={i !== 0 ? '' : ''}>
                <Array2DView imgArr={output} scale={scale} />
              </Grid>
            </Grid>
          </Grid>
        );
      }) }
    </Grid>
  );
}

Channels.propTypes = {
  channels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
  scale: PropTypes.number.isRequired,
};

export default Channels;

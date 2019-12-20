import React from 'react';
import Grid from '@material-ui/core/Grid';

import GaborFilter from './GaborFilter';
import Array2DView from '../common/Array2DView';

const Channels = props => {
  const { channels, filters, scale } = props;

  return (
    <Grid container spacing={2}>
      { channels.map((output, i) => {
        return (
          <Grid item key={i}>
            <Grid container alignItems="center" justify="center" spacing={2}>
              <Grid item>
                <GaborFilter filter={filters[i]} scale={40} />
              </Grid>
              <Grid item>
                <Array2DView imgArr={output} scale={scale} />
              </Grid>
            </Grid>
          </Grid>
        );
      }) }
    </Grid>
  );
}

export default Channels;

import React from 'react';
import Grid from '@material-ui/core/Grid';

import GaborFilter from './GaborFilter';
import Array2DView from '../common/Array2DView';
import { eval2DArray } from '../modules/helpers';

const Layer = props => {
  const { imgArr, layer, filters, scale } = props;

  let outputs = [];
  if (imgArr && imgArr.length > 0 && layer) {
    outputs = eval2DArray(layer, imgArr);
  }

  return (
    <Grid container spacing={2}>
      { outputs.map((output, i) => {
        return (
          <Grid item>
            <Grid container alignItems="center" justify="center" spacing={2}>
              <Grid item>
                <GaborFilter filter={filters[i]} scale={40} />
              </Grid>
              <Grid item>
                <Array2DView key={i} imgArr={output} scale={scale} />
              </Grid>
            </Grid>
          </Grid>
        );
      }) }
    </Grid>
  );
}

export default Layer;

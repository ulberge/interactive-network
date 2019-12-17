import React from 'react';
import Grid from '@material-ui/core/Grid';

import GaborFiltersControls from './GaborFiltersControls';
import Array2DView from '../common/Array2DView';

const GaborFilters = props => {
  const { filters, filterConfig } = props;
  const { numComponents, lambda, gamma, sigma, windowSize } = filterConfig;
  const filterScale = 100 / filters[0].length;
  return (
    <Grid container spacing={4}>
      <Grid item xs={3}>
        <GaborFiltersControls
          numComponents={numComponents} lambda={lambda} gamma={gamma} sigma={sigma} windowSize={windowSize}
          onChange={props.onChange}
         />
      </Grid>
      <Grid item xs={9}>
        { filters.map((filter, i) => <span key={numComponents + '_' + lambda + '_' + gamma + '_' + sigma + '_' + windowSize+ '_' + i} style={{ margin: '4px' }}><Array2DView imgArr={filter} scale={filterScale} /></span>) }
      </Grid>
    </Grid>
  );
}

export default GaborFilters;

import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';

import GaborFiltersControls from './GaborFiltersControls';
import Array2DView from '../common/Array2DView';

import { getGaborFilters } from '../common/helpers';

export default class GaborFilters extends Component {
  state = {
    numComponents: 3,
    lambda: 4,
    gamma: 2,
    sigma: 1.1,
    windowSize: 5
  }

  render() {
    const { numComponents, lambda, gamma, sigma, windowSize } = this.state;
    const gaborFilters = getGaborFilters(2 ** numComponents, lambda, gamma, sigma * 0.5 * lambda, windowSize);
    const filterScale = 200 / gaborFilters[0].length;

    return (
      <Grid container spacing={4}>
        <Grid item xs={3}>
          <GaborFiltersControls
            numComponents={numComponents} lambda={lambda} gamma={gamma} sigma={sigma} windowSize={windowSize}
            onChange={update => this.setState(update)}
           />
        </Grid>
        <Grid item xs={9}>
          { gaborFilters.map((filter, i) => <span key={numComponents + '_' + lambda + '_' + gamma + '_' + sigma + '_' + windowSize+ '_' + i} style={{ margin: '4px' }}><Array2DView imgArr={filter} scale={filterScale} /></span>) }
        </Grid>
      </Grid>
    );
  }
}

import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';

import EditableCanvas from '../common/EditableCanvas';
import GaborFilters from './GaborFilters';
import Layer from './Layer';

import { getLayer, getGaborFilters } from '../common/helpers';

export default class GaborExplorer extends Component {
  state = {
    imgArr: [],
    filterConfig: {
      numComponents: 3,
      lambda: 4,
      gamma: 2,
      sigma: 1.1,
      windowSize: 5
    }
  }

  render() {
    const { imgArr, filterConfig } = this.state;
    const { numComponents, lambda, gamma, sigma, windowSize } = filterConfig;
    const filters = getGaborFilters(2 ** numComponents, lambda, gamma, sigma * 0.5 * lambda, windowSize);

    let layer = null;
    if (filters && filters.length > 0) {
      layer = getLayer(filters);
    }

    return (
      <Grid container direction="column" spacing={4}>
        <Grid item>
          <GaborFilters onChange={update => this.setState({ filterConfig: { ...filterConfig, ...update }})} filterConfig={filterConfig} filters={filters} />
        </Grid>
        <Grid item>
          <Grid container spacing={4}>
            <Grid item className="bordered-canvas" xs={4}>
              <EditableCanvas size={[80, 80]} scale={3} onChange={imgArr => this.setState({ imgArr })} />
            </Grid>
            <Grid item xs={8}>
              <Layer scale={1} layer={layer} imgArr={imgArr} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

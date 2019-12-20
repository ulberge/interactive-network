import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';

import GaborFilters from './GaborFilters';
import GaborFiltersControls from './GaborFiltersControls';
import GaborDrawingInput from './GaborDrawingInput';
import Layer from './Layer';

import { getLayer, getGaborFilters } from '../modules/helpers';

export default class GaborExplorer extends Component {
  state = {
    imgArr: [],
    filterConfig: {
      numComponents: 2, // power of 2
      lambda: 4,
      gamma: 2,
      sigma: 1.1,
      windowSize: 7,
      bias: 0
    },
    selectedIndex: 1
  }

  render() {
    const { imgArr, filterConfig, selectedIndex } = this.state;
    const { numComponents, lambda, gamma, sigma, windowSize, bias } = filterConfig;

    const filters = getGaborFilters(2 ** numComponents, lambda, gamma, sigma * lambda, windowSize);

    let layer = null;
    if (filters && filters.length > selectedIndex) {
      // layer = getLayer([filters[selectedIndex]], bias);
      layer = getLayer(filters, bias);
    }

    return (
      <div>
        <h2>Gabor Explorer</h2>
        <Grid container spacing={4}>
          <Grid item xs={2}>
            <GaborFiltersControls
              filterConfig={filterConfig} onChange={update => this.setState({ filterConfig: { ...filterConfig, ...update }})}
             />
          </Grid>
          <Grid item xs={1} className="bordered-canvas">
            <GaborFilters filters={filters} scale={75} selectedIndex={selectedIndex} onSelect={(selectedIndex) => this.setState({selectedIndex})} />
          </Grid>
          <Grid item xs={2}>
            <GaborDrawingInput onChange={imgArr => this.setState({ imgArr })} />
          </Grid>
          <Grid item xs={2} className="bordered-canvas">
            <Layer scale={5} filters={filters} layer={layer} imgArr={imgArr} />
          </Grid>
        </Grid>
      </div>
    );
  }
}

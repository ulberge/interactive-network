import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';

import GaborFilters from './GaborFilters';
import GaborFiltersControls from './GaborFiltersControls';
import GaborDrawingInput from './GaborDrawingInput';
import Channels from './Channels';

import { getLayer, getGaborFilters, eval2DArray } from '../modules/helpers';

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
    strokeWeight: 1
  }

  render() {
    const { imgArr, filterConfig, strokeWeight } = this.state;
    const { numComponents, lambda, gamma, sigma, windowSize, bias } = filterConfig;

    const filters = getGaborFilters(2 ** numComponents, lambda, gamma, sigma * lambda, windowSize);

    let layer = null;
    let channels = [];
    if (filters) {
      layer = getLayer(filters, bias);

      if (imgArr && imgArr.length > 0 && layer) {
        channels = eval2DArray(layer, imgArr);
      }
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
            <GaborFilters filters={filters} scale={75} />
          </Grid>
          <Grid item xs={2}>
            <GaborDrawingInput strokeWeight={strokeWeight} onDraw={imgArr => this.setState({ imgArr })} onChangeStrokeWeight={strokeWeight => this.setState({ strokeWeight })} />
          </Grid>
          <Grid item xs={2} className="bordered-canvas">
            <Channels scale={5} filters={filters} channels={channels} />
          </Grid>
        </Grid>
      </div>
    );
  }
}

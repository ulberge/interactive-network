import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';

import GaborFilters from './GaborFilters';
import GaborFiltersControls from './GaborFiltersControls';
import GaborDrawingInput from './GaborDrawingInput';
import Channels from './Channels';

import Array2DDraw from '../common/Array2DDraw';

import { getLayer, getGaborFilters, eval2DArray } from '../modules/helpers';

export default class GaborExplorer extends Component {
  constructor(props) {
    super(props);
    this.onFilterConfigChange = this.onFilterConfigChange.bind(this);
    this.onDraw = this.onDraw.bind(this);
    this.onChangeStrokeWeight = this.onChangeStrokeWeight.bind(this);

    const filterConfig = {
      numComponents: 2, // power of 2
      lambda: 4,
      gamma: 2,
      sigma: 1.1,
      windowSize: 7,
      bias: -1.6
    };
    const { numComponents, lambda, gamma, sigma, windowSize, bias } = filterConfig;
    const filters = getGaborFilters(2 ** numComponents, lambda, gamma, sigma * lambda, windowSize);
    const layer = getLayer(filters, bias);

    this.layer = layer;
    this.state = {
      ...filterConfig,
      filters,
      channels: [],
      strokeWeight: 1.3,
      imgArr: [],
      layer: null,
    };
  }

  onFilterConfigChange(field, value) {
    this.setState({
      [field]: value
    });
    let { numComponents, lambda, gamma, sigma, windowSize, bias } = this.state;
    // update the filters and CNN layer
    const filters = getGaborFilters(2 ** numComponents, lambda, gamma, sigma * lambda, windowSize);
    const layer = getLayer(filters, bias);
    this.layer = layer;

    // reevaluate output of layer
    const channels = eval2DArray(this.layer, this.imgArr);
    this.setState({
      filters,
      channels
    });
  }

  onDraw(imgArr) {
    this.imgArr = imgArr; // save for updates to config to use
    const channels = eval2DArray(this.layer, this.imgArr); // output of CNN
    this.setState({ channels });
  }

  onChangeStrokeWeight(strokeWeight) {
    this.setState({ strokeWeight });
  }

  render() {
    const { numComponents, lambda, gamma, sigma, windowSize, bias, strokeWeight, filters, channels } = this.state;

    let shape = null;
    if (channels && channels.length > 0) {
      shape = [ channels[0].length, channels[0][0].length ];
    }

    return (
      <div>
        <h2>Gabor Explorer</h2>
        <Grid container spacing={4}>
          <Grid item xs={2}>
            <GaborFiltersControls
              numComponents={numComponents}
              lambda={lambda}
              gamma={gamma}
              sigma={sigma}
              windowSize={windowSize}
              bias={bias}
              onChange={this.onFilterConfigChange}
             />
          </Grid>
          <Grid item xs={1} className="bordered-canvas">
            <GaborFilters filters={filters} scale={60} />
          </Grid>
          <Grid item xs={2}>
            <GaborDrawingInput scale={6} strokeWeight={strokeWeight} onDraw={this.onDraw} onChangeStrokeWeight={this.onChangeStrokeWeight} />
          </Grid>
          <Grid item xs={2} className="bordered-canvas">
            <Channels scale={5} channels={channels} />
          </Grid>
          <Grid item xs={2} className="bordered-canvas">
            { shape ?
                <Array2DDraw scale={6} channels={channels} strokeWeight={strokeWeight} speed={100} shape={shape} />
                : null
            }
          </Grid>
        </Grid>
      </div>
    );
  }
}

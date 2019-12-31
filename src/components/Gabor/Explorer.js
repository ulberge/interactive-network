import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import * as tf from '@tensorflow/tfjs';

import GaborFilters from './Filters';
import GaborFiltersControls from './FiltersControls';
import GaborDrawingInput from './DrawingInput';
import Array2DViewList from '../UI/Array2DViewList';
import { getLayer, getGaborFilters, eval2DArray, eval2DArrayMultipleLayers } from '../../js/helpers';

// Set to cpu to avoid high cost of syncing gpu to cpu (and there
// is little gain from using gpu on such a small network)
tf.setBackend('cpu');

export default class GaborExplorer extends Component {
  constructor(props) {
    super(props);

    this.onFilterConfigChange = this.onFilterConfigChange.bind(this);
    this.onDraw = this.onDraw.bind(this);

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
    this.layer = getLayer(filters, bias);
    // Set up pooling layers
    this.maxPoolLayer = tf.layers.maxPooling2d({poolSize: 3});
    this.avgPoolLayer = tf.layers.avgPooling2d({poolSize: 3});

    this.state = {
      ...filterConfig,
      filters,
    };
  }

  onFilterConfigChange(field, value) {
    // create a copy of the state with the field updated
    const newState = { ...this.state };
    newState[field] = value;

    // update the filters and CNN layer
    let { numComponents, lambda, gamma, sigma, windowSize, bias } = newState;
    newState.filters = getGaborFilters(2 ** numComponents, lambda, gamma, sigma * lambda, windowSize);
    this.layer = getLayer(newState.filters, bias);

    // reevaluate output of layers
    newState.channels = eval2DArray(this.layer, this.imgArr);
    newState.channelsMaxPool = eval2DArrayMultipleLayers([this.layer, this.maxPoolLayer], [this.imgArr])[0];
    newState.channelsAvgPool = eval2DArrayMultipleLayers([this.layer, this.avgPoolLayer], [this.imgArr])[0];

    this.setState(newState);
  }

  onDraw(imgArr) {
    // save for updates to config to use
    this.imgArr = imgArr;

    // reevaluate output of layers
    const channels = eval2DArray(this.layer, this.imgArr);
    const channelsMaxPool = eval2DArrayMultipleLayers([this.layer, this.maxPoolLayer], [this.imgArr])[0];
    const channelsAvgPool = eval2DArrayMultipleLayers([this.layer, this.avgPoolLayer], [this.imgArr])[0];

    this.setState({
      channels,
      channelsMaxPool,
      channelsAvgPool,
    });
  }

  render() {
    const { numComponents, lambda, gamma, sigma, windowSize, bias, filters, channels, channelsMaxPool, channelsAvgPool } = this.state;

    return (
      <div>
        <h2>Gabor Explorer</h2>
        <Grid container justify="center" spacing={4}>
          <Grid item xs={3}>
            <h3>Filter Builder</h3>
            <Grid container spacing={4}>
              <Grid item xs={8}>
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
              <Grid item xs={4} className="bordered-canvas">
                <GaborFilters filters={filters} scale={80} />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={3}>
            <h3>Test Input</h3>
            <GaborDrawingInput scale={6} onDraw={this.onDraw} />
          </Grid>
          { !!channels ?
            <Grid item xs={3} className="bordered-canvas">
              <h3>Activations</h3>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Array2DViewList scale={4} imgArrs={channels} />
                  <h4>Conv2D</h4>
                </Grid>
                <Grid item xs={4}>
                  <Array2DViewList scale={12} imgArrs={channelsMaxPool} />
                  <h4>Max Pool</h4>
                </Grid>
                <Grid item xs={4}>
                  <Array2DViewList scale={12} imgArrs={channelsAvgPool} />
                  <h4>Avg Pool</h4>
                </Grid>
              </Grid>
            </Grid>
            : null
          }
        </Grid>
      </div>
    );
  }
}

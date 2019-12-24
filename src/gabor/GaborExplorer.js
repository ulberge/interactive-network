import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';

import GaborFilters from './GaborFilters';
import GaborFiltersControls from './GaborFiltersControls';
import GaborDrawingInput from './GaborDrawingInput';
import Channels from './Channels';

import Array2DDraw from '../common/Array2DDraw';

import { getLayer, getGaborFilters, eval2DArray, eval2DArrayMultipleLayers } from '../modules/helpers';

import * as tf from '@tensorflow/tfjs';
tf.setBackend('cpu');
const maxPoolLayer = tf.layers.maxPooling2d({poolSize: 3});
const avgPoolLayer = tf.layers.avgPooling2d({poolSize: 3});

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
      channelsMaxPool: [],
      channelsAvgPool: [],
      strokeWeight: 1.3,
      imgArr: [],
      layer: null,
    };
  }

  onFilterConfigChange(field, value) {
    const newState = { ...this.state };
    newState[field] = value;

    let { numComponents, lambda, gamma, sigma, windowSize, bias } = newState;
    // update the filters and CNN layer
    const filters = getGaborFilters(2 ** numComponents, lambda, gamma, sigma * lambda, windowSize);
    newState.filters = filters;
    const layer = getLayer(filters, bias);
    this.layer = layer;

    // reevaluate output of layer
    const channels = eval2DArray(this.layer, this.imgArr);
    newState.channels = channels;
    const channelsMaxPool = eval2DArrayMultipleLayers([this.layer, maxPoolLayer], this.imgArr);
    newState.channelsMaxPool = channelsMaxPool;
    const channelsAvgPool = eval2DArrayMultipleLayers([this.layer, avgPoolLayer], this.imgArr);
    newState.channelsAvgPool = channelsAvgPool;

    this.setState(newState);
  }

  onDraw(imgArr) {
    this.imgArr = imgArr; // save for updates to config to use
    const channels = eval2DArray(this.layer, this.imgArr); // output of CNN
    const channelsMaxPool = eval2DArrayMultipleLayers([this.layer, maxPoolLayer], this.imgArr);
    const channelsAvgPool = eval2DArrayMultipleLayers([this.layer, avgPoolLayer], this.imgArr);

    this.setState({
      channels,
      channelsMaxPool,
      channelsAvgPool,
    });
  }

  onChangeStrokeWeight(strokeWeight) {
    this.setState({ strokeWeight });
  }

  render() {
    const { numComponents, lambda, gamma, sigma, windowSize, bias, strokeWeight, filters, channels, channelsMaxPool, channelsAvgPool } = this.state;

    let shape = null;
    if (channels && channels.length > 0) {
      shape = [ channels[0].length, channels[0][0].length ];
    }

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
            <GaborDrawingInput scale={6} strokeWeight={strokeWeight} onDraw={this.onDraw} onChangeStrokeWeight={this.onChangeStrokeWeight} />
          </Grid>
          <Grid item xs={3} className="bordered-canvas">
            <h3>Activations</h3>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Channels scale={4} channels={channels} />
                <h4>Conv2D</h4>
              </Grid>
              <Grid item xs={4}>
                <Channels scale={12} channels={channelsMaxPool} />
                <h4>Max Pool</h4>
              </Grid>
              <Grid item xs={4}>
                <Channels scale={12} channels={channelsAvgPool} />
                <h4>Avg Pool</h4>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={1} className="bordered-canvas">
            <h3>Decode</h3>
            { shape ?
                <Array2DDraw scale={4} channels={channels} strokeWeight={strokeWeight} speed={100} shape={shape} />
                : null
            }
          </Grid>
        </Grid>
      </div>
    );
  }
}

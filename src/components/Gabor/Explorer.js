import React, { useState, useMemo, useCallback } from 'react';
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

export default function GaborExplorer(props) {
  const [state, setState] = useState({
    numComponents: 2, // power of 2
    lambda: 4,
    gamma: 3,
    sigma: 0.6,
    windowSize: 5,
    bias: -0.8,
    imgArr: null
  });
  const { numComponents, lambda, gamma, sigma, windowSize, bias, imgArr } = state;

  // the TensorFlow layer is created using the filters
  const { filters, layer } = useMemo(() => {
    const filters = getGaborFilters(2 ** numComponents, lambda, gamma, sigma * lambda, windowSize);
    const layer = getLayer(filters, bias);
    return { filters, layer };
  }, [numComponents, lambda, gamma, sigma, windowSize, bias]);

  // Set up pooling layers
  const maxPoolLayer = useMemo(() => tf.layers.maxPooling2d({poolSize: 3}), []);
  const avgPoolLayer = useMemo(() => tf.layers.avgPooling2d({poolSize: 3}), []);

  let channels, channelsMaxPool, channelsAvgPool;
  // imgArr is generated async after p5 adds canvas and animates
  if (imgArr) {
    // reevaluate output of layers
    channels = eval2DArray(layer, imgArr);
    channelsMaxPool = eval2DArrayMultipleLayers([layer, maxPoolLayer], [imgArr])[0];
    channelsAvgPool = eval2DArrayMultipleLayers([layer, avgPoolLayer], [imgArr])[0];
  }

  const onChange = useCallback((field, value) => setState(state => ({ ...state, [field]: value })), []);
  const onUpdate = useCallback(imgArr => setState(state => ({ ...state, imgArr })), []);

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
                onChange={onChange}
               />
            </Grid>
            <Grid item xs={4} className="bordered-canvas">
              <GaborFilters filters={filters} scale={80} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={3}>
          <h3>Test Input</h3>
          <GaborDrawingInput scale={6} onUpdate={onUpdate} />
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

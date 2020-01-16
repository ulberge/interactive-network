import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import * as tf from '@tensorflow/tfjs';
import GaborFilters from './Filters';
import GaborFiltersControls from './FiltersControls';
import GaborDrawingInput from './DrawingInput';
import Array2DViewList from '../UI/Array2DViewList';
import { getKernels } from '../../js/kernel';
import { getLayer, eval2DArrayMultipleLayers } from '../../js/tfhelpers';

// Set to cpu to avoid high cost of syncing gpu to cpu (and there
// is little gain from using gpu on such a small network)
tf.setBackend('cpu');

const kernelSettings = JSON.parse(localStorage.getItem('kernel_settings')) || {
  numComponents: 2, // power of 2
  lambda: 6.3,
  sigma: 3,
  windowSize: 9,
  bias: -4,
};

export default function KernelsTuner(props) {
  const [state, setState] = useState({
    ...kernelSettings,
    imgArr: null
  });
  const { numComponents, lambda, sigma, windowSize, bias, imgArr } = state;

  const [filters, setFilters] = useState([]);
  const [layer, setLayer] = useState(null);

  // the TensorFlow layer is created using the filters
  useEffect(() => {
    async function fetchFilters() {
      const filters = getKernels(windowSize, 2 ** numComponents, lambda, sigma);
      if (filters && filters.length > 0) {
        setFilters(filters);
        const layer = getLayer(filters.map(filter => [filter]), bias);
        setLayer(layer);
      }
    }

    fetchFilters();
  }, [numComponents, lambda, sigma, windowSize, bias]);

  useEffect(() => {
    // save values
    localStorage.setItem('kernel_settings', JSON.stringify({
      numComponents, lambda, sigma, windowSize, bias
    }));
  }, [numComponents, lambda, sigma, windowSize, bias]);

  // Set up pooling layers
  const maxPoolLayer = useMemo(() => tf.layers.maxPooling2d({poolSize: 3}), []);
  // const avgPoolLayer = useMemo(() => tf.layers.avgPooling2d({poolSize: 3}), []);

  // let channels;
  let channelsPool;
  // imgArr is generated async after p5 adds canvas and animates
  if (imgArr && layer) {
    // reevaluate output of layers
    // channels = eval2DArray(layer, imgArr);
    channelsPool = eval2DArrayMultipleLayers([layer, maxPoolLayer], [imgArr])[0];
    // channelsPool = eval2DArrayMultipleLayers([layer, avgPoolLayer], [imgArr])[0];
  }

  const onChange = useCallback((field, value) => setState(state => ({ ...state, [field]: value })), []);
  const onUpdate = useCallback(imgArr => setState(state => ({ ...state, imgArr })), []);

  return (
    <div>
      <Grid container justify="center" spacing={4}>
        <Grid item xs={6}>
          <h3>Kernels</h3>
          <Grid container spacing={4}>
            <Grid item xs={4}>
              <GaborFiltersControls
                numComponents={numComponents}
                lambda={lambda}
                sigma={sigma}
                windowSize={windowSize}
                bias={bias}
                onChange={onChange}
               />
            </Grid>
            <Grid item xs={8} className="bordered-canvas">
              <GaborFilters filters={filters} scale={45} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={6}>
          <Grid container spacing={4}>
            <Grid item xs={4}>
              <h3>Test</h3>
              <GaborDrawingInput scale={3} onUpdate={onUpdate} />
            </Grid>
            <Grid item xs={8} className="bordered-canvas">
              {/*<h3>Activations</h3>
              { !!channels ? <Array2DViewList scale={1} imgArrs={channels} /> : null }*/}
              <h3>Activations</h3>
              { !!channelsPool ? <Array2DViewList scale={3.5} imgArrs={channelsPool} /> : null }
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

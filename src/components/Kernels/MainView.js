import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import * as tf from '@tensorflow/tfjs';
import KernelsListView from './ListView';
import KernelsControls from './Controls';
import KernelsDrawingInput from './DrawingInput';
import Array2DViewList from '../UI/Array2DViewList';
import { eval2DArrayMultipleLayers } from '../../js/tfhelpers';

// Set up pooling layer
const maxPoolLayer = tf.layers.maxPooling2d({poolSize: 3});

function KernelsMainView(props) {
  const { firstLayer, kernels, kernelSettings, updateKernelSettings } = props;
  const { numComponents, lambda, sigma, windowSize, bias } = kernelSettings;

  const [imgArr, setImgArr] = useState(null);

  let channelsPool;
  // imgArr is generated async after p5 adds canvas and animates
  if (imgArr && firstLayer) {
    // reevaluate output of layers
    // channels = eval2DArray(layer, imgArr);
    channelsPool = eval2DArrayMultipleLayers([firstLayer, maxPoolLayer], [imgArr])[0];
  }

  const onChangeKernelSettings = useCallback((field, value) => updateKernelSettings({ ...kernelSettings, [field]: value }),
                               [ kernelSettings, updateKernelSettings ]);
  const onUpdateTestImg = useCallback(imgArr => setImgArr(imgArr), []);

  return (
    <div>
      <Grid container justify="center" spacing={4}>
        <Grid item xs={6}>
          <h3>Kernels</h3>
          <Grid container spacing={4}>
            <Grid item xs={4}>
              <KernelsControls
                numComponents={numComponents}
                lambda={lambda}
                sigma={sigma}
                windowSize={windowSize}
                bias={bias}
                onChange={onChangeKernelSettings}
               />
            </Grid>
            <Grid item xs={8} className="bordered-canvas">
              <KernelsListView kernels={kernels} scale={45} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={6}>
          <Grid container spacing={4}>
            <Grid item xs={4}>
              <h3>Test</h3>
              <KernelsDrawingInput scale={3} onUpdate={onUpdateTestImg} />
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

KernelsMainView.propTypes = {
  firstLayer: PropTypes.object.isRequired,
  kernels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
  kernelSettings: PropTypes.object.isRequired,
  updateKernelSettings: PropTypes.func.isRequired
};

export default KernelsMainView;

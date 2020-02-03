import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import KernelInspectorDrawingInput from './KernelInspectorDrawingInput';
import KernelInspectorViewOutput from './KernelInspectorViewOutput';
import { getKernels } from '../../js/kernel';

// shape of the drawing area
const shape = [ 150, 150 ];
const defaultPt = { x: Math.floor(shape[0] / 2) - 1, y: Math.floor(shape[1] / 2) - 1 }

function KernelInspector(props) {
  // store up-to-date data from network, use this object to trigger updates
  const [ data, setData ] = useState(null);

  // get the kernels
  const { numComponents, lambda, sigma, windowSize, types } = props.kernelSettings;
  const kernels = useMemo(() => {
    return getKernels(windowSize, 2 ** numComponents, lambda, sigma, types);
  }, [ numComponents, lambda, sigma, windowSize, types ]);

  return (
    <div style={props.style}>
      <h3>Kernel Inspector</h3>
      <Grid container spacing={4} justify="center">
        <Grid item>
          <KernelInspectorDrawingInput
            kernels={kernels}
            shape={shape}
            onUpdate={setData}
          />
          <div style={{ marginTop: '10px', textAlign: 'center' }}>Make a test drawing</div>
        </Grid>
        <Grid item>
          { data && <KernelInspectorViewOutput kernels={kernels} data={data} defaultPt={defaultPt} /> }
        </Grid>
      </Grid>
    </div>
  );
}

KernelInspector.propTypes = {
  kernelSettings: PropTypes.object.isRequired,
};

export default KernelInspector;

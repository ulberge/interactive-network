import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import KernelInspectorDrawingInput from './KernelInspectorDrawingInput';
import KernelInspectorActivationMap from './KernelInspectorActivationMap';
import KernelInspectorSelection from './KernelInspectorSelection';

const shape = [ 150, 150 ];

function KernelInspector(props) {
  const [ data, setData ] = useState(null);
  const [ pt, setPt ] = useState({ x: Math.floor(shape[0] / 2) - 1, y: Math.floor(shape[1] / 2) - 1 });

  const { imgArr, acts, max, ids } = useMemo(() => {
    if (data && data.network) {
      // get input
      const { acts: imgArr } = data.network.getOutput(-1);
      // get output
      const { acts, max, ids } = data.network.getOutput(0);
      // unwrap ndarrays into arrays
      return { imgArr: imgArr.tolist()[0], acts: acts.tolist(), max: max.tolist(), ids: ids.tolist() };
    }
    return {};
  }, [data]);

  const onUpdate = useCallback(data => setData({ ...data }), [setData]);

  return (
    <div style={props.style}>
      <h2>Kernel Inspector</h2>
      <Grid container spacing={4} justify="center">
        <Grid item>
          <KernelInspectorDrawingInput
            kernels={props.kernels}
            shape={shape}
            onUpdate={onUpdate}
          />
          <div style={{ marginTop: '10px', textAlign: 'center' }}>Make a test drawing</div>
        </Grid>
        { data ? (
          <Grid item>
            <div>
              <KernelInspectorActivationMap
                kernels={props.kernels}
                max={max}
                ids={ids}
                scale={2.5}
                onSelect={setPt}
                pt={pt}
              />
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginTop: '10px' }}><b>A color-coded map of maximum activation</b></div>
                <div style={{ marginTop: '10px' }}>Select a pixel to inspect</div>
              </div>
            </div>
          </Grid>
        ) : null }
        { data ? (
          <Grid item>
            <KernelInspectorSelection
              kernels={props.kernels}
              imgArr={imgArr}
              acts={acts}
              pt={pt}
              count={Math.min(8, props.kernels.length)}
              style={{ width: '400px' }}
            />
          </Grid>
        ) : null }
      </Grid>
    </div>
  );
}

KernelInspector.propTypes = {
  kernels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
};

export default KernelInspector;

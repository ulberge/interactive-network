import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import KernelInspectorColorCodedMap from './KernelInspectorColorCodedMap';
import KernelInspectorViewOutputAtPoint from './KernelInspectorViewOutputAtPoint';

function KernelInspectorViewOutput(props) {
  const { data, kernels, defaultPt } = props;
  // store selected point on color-coded map
  const [ pt, setPt ] = useState(defaultPt);

  // format data coming from network on updates
  const { imgArr, acts, max, ids } = useMemo(() => {
    if (data && data.network) {
      const { acts: imgArr } = data.network.getOutput(-1); // get input
      const { acts, max, ids } = data.network.getOutput(0); // get output
      // unwrap ndarrays into arrays
      return { imgArr: imgArr.tolist()[0], acts: acts.tolist(), max: max.tolist(), ids: ids.tolist() };
    }
    return {};
  }, [ data ]);

  return (
    <Grid container spacing={4} justify="center" style={props.style}>
      <Grid item>
        <div>
          <KernelInspectorColorCodedMap
            kernels={kernels}
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
      <Grid item>
        <KernelInspectorViewOutputAtPoint
          kernels={kernels}
          imgArr={imgArr}
          acts={acts}
          pt={pt}
          count={Math.min(8, kernels.length)}
          style={{ width: '400px' }}
        />
      </Grid>
    </Grid>
  );
}

KernelInspectorViewOutput.propTypes = {
  data: PropTypes.object.isRequired,
  kernels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
  defaultPt: PropTypes.object.isRequired,
};

export default KernelInspectorViewOutput;

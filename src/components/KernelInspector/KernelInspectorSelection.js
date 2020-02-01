import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import KernelInspectorActivationChart from './KernelInspectorActivationChart';
import KernelInspectorKernelOverlays from './KernelInspectorKernelOverlays';
import { slice2D } from '../../js/helpers';

// get indices of kernels with top activations
function selectTopIndices(acts, count) {
  const topIndices = acts.map((s, i) => [i, s]).sort((a, b) => (a[1] > b[1]) ? -1 : 1).slice(0, count).map(d => d[0]);
  return topIndices;
}

const KernelInspectorSelection = props => {
  const { acts, kernels, count, imgArr, pt } = props;

  if (!acts || !pt || !kernels || kernels.length !== acts.length) {
    return null;
  }

  const { x, y } = pt;
  const actsAtPt = acts.map(channel => channel[y][x]);
  const topIndices = selectTopIndices(actsAtPt, count);
  const kernelsTop = topIndices.map(i => kernels[i]);
  const actsAtPtTop = topIndices.map(i => actsAtPt[i]);

  // get section of image for this pt
  // get padding equal to half kernel size - 1
  const pad = (kernels[0].length - 1) / 2;
  const bounds = [ x - pad, y - pad, x + pad + 1, y + pad + 1 ];
  const imgArrSlice = slice2D(imgArr, bounds);
  const ptDisplay = `(${pt.x}, ${pt.y})`;

  return (
    <Grid container spacing={4} justify="center" style={props.style}>
      <Grid item>
        <KernelInspectorActivationChart kernels={kernelsTop} acts={actsAtPtTop} />
        <div style={{ margin: '5px 0 25px 0', textAlign: 'center' }}>
          <b>Top activations for pixel {ptDisplay}</b>
        </div>
        <KernelInspectorKernelOverlays kernels={kernelsTop} imgArr={imgArrSlice} scale={6}/>
        <div style={{ margin: '10px 0', textAlign: 'center' }}>
          <b>Kernel overlays for pixel {ptDisplay}</b>
        </div>
      </Grid>
    </Grid>
  );
};

KernelInspectorSelection.propTypes = {
  acts: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))),
  kernels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))),
  imgArr: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  pt: PropTypes.object,
  count: PropTypes.number.isRequired,
};

export default KernelInspectorSelection;

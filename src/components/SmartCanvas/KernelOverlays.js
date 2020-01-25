import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import SmartCanvasKernelOverlay from './KernelOverlay';
import { getTopValues, slice2D } from '../../js/helpers';

const SmartCanvasKernelOverlays = props => {
  const { kernels, imgArr, pt, acts, numKernels, scale } = props;

  if (!kernels || kernels.length === 0 || !imgArr || imgArr.length === 0 || !pt || !acts || acts.length === 0) {
    return null;
  }

  const topKernelActs = getTopValues(acts, numKernels);

  // get kernel size
  const kernelSize = kernels[0].length;
  const halfKernelSize = Math.floor(kernelSize / 2);

  // get section of imgArr at pt
  const { x, y } = pt;
  const bounds = [ x - halfKernelSize, y - halfKernelSize, x + halfKernelSize + 1, y + halfKernelSize + 1 ];
  const imgArrSlice = slice2D(imgArr, bounds);

  if (!imgArrSlice) {
    return null;
  }

  // choose the kernels with top acts
  const topKernels = topKernelActs.map(d => kernels[d[0]]);

  return (
    <Grid container spacing={1} style={{ position: 'relative', margin: 'auto' }}>
      { topKernels.map((kernel, i) => {
        return (
          <Grid item key={i}>
            <Grid container alignItems="center" justify="center" spacing={1}>
              <Grid item>
                <SmartCanvasKernelOverlay kernel={kernel} imgArrSlice={imgArrSlice} scale={scale} />
              </Grid>
            </Grid>
          </Grid>
        );
      }) }
    </Grid>
  );
}

SmartCanvasKernelOverlays.propTypes = {
  kernels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))),
  imgArr: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  acts: PropTypes.arrayOf(PropTypes.number),
  pt: PropTypes.object,
  numKernels: PropTypes.number.isRequired,
  scale: PropTypes.number,
};

export default SmartCanvasKernelOverlays;

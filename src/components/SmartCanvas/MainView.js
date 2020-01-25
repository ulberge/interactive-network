import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import SmartCanvasColorCodedView from './ColorCodedView';
import Grid from '@material-ui/core/Grid';
import SmartCanvasActChart from './ActChart';
import SmartCanvasDrawingInput from './DrawingInput';
import SmartCanvasKernelOverlays from './KernelOverlays';
import Array2DView from '../UI/Array2DView';

const SmartCanvasMainView = props => {
  const { kernels } = props;

  const [ state, setState ] = useState({});

  const onDrawingChange = useCallback(result => {
    const { lineInfo, dirtyImgArr, offset } = result;
    setState({ ...state, lineInfo, imgArr: dirtyImgArr, offset })
  }, [state, setState]);
  const onSelect = useCallback(pt => {
    if (state.offset) {
      const ptAdj = { x: pt.x - state.offset.x, y: pt.y - state.offset.y };
      setState({ ...state, pt: pt, ptAdj: ptAdj });
    }
  }, [state, setState]);

  let max = [];
  let ids = [];
  if (state.lineInfo) {
    max = state.lineInfo.max;
    ids = state.lineInfo.ids;
  }

  const acts = useMemo(() => {
    const { lineInfo, pt } = state;
    if (lineInfo && pt) {
      return lineInfo.getChannelsAt(pt);
    }
    return null;
  }, [state]);

  return (
    <Grid container spacing={1} className="bordered-canvas">
      <Grid item>
        <SmartCanvasDrawingInput kernels={kernels} shape={[200, 200]} onChange={onDrawingChange} />
        <Array2DView imgArr={state.imgArr} scale={5} />
      </Grid>
      <Grid item>
        <SmartCanvasColorCodedView kernels={kernels} scale={3} ids={ids} max={max} onSelect={onSelect} />
      </Grid>
      <Grid item xs={3}>
        <SmartCanvasActChart kernels={kernels} acts={acts} numKernels={9} />
        <SmartCanvasKernelOverlays kernels={kernels} imgArr={state.imgArr} acts={acts} pt={state.ptAdj} numKernels={9} scale={8.5} />
      </Grid>
    </Grid>
  );
};

SmartCanvasMainView.propTypes = {
  kernels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
};

export default SmartCanvasMainView;

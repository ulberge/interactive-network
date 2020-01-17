import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import SmartCanvasColorCodedView from './ColorCodedView';
import Grid from '@material-ui/core/Grid';
import SmartCanvasActChart from './ActChart';
import SmartCanvasDrawingInput from './DrawingInput';
import SmartCanvasKernelOverlays from './KernelOverlays';

const SmartCanvasMainView = props => {
  const { firstLayer, kernels } = props;

  const [ state, setState ] = useState({});

  const onDrawingChange = useCallback((lineInfo, imgArr) => {
    setState({ ...state, lineInfo, imgArr })
  }, [state, setState]);
  const onSelect = useCallback(pt => {
    setState({ ...state, pt })
  }, [state, setState]);

  const { max, ids } = useMemo(() => {
    if (state.lineInfo) {
      return state.lineInfo.getMaxChannels();
    }
    return { max: [], ids: [] };
  }, [state]);

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
        <SmartCanvasDrawingInput firstLayer={firstLayer} shape={[200, 200]} onChange={onDrawingChange} />
      </Grid>
      <Grid item>
        <SmartCanvasColorCodedView kernels={kernels} scale={3} ids={ids} max={max} onSelect={onSelect} />
      </Grid>
      <Grid item xs={3}>
        <SmartCanvasActChart kernels={kernels} acts={acts} numKernels={9} />
        <SmartCanvasKernelOverlays kernels={kernels} imgArr={state.imgArr} acts={acts} pt={state.pt} numKernels={9} scale={8.5} />
      </Grid>
    </Grid>
  );
};

SmartCanvasMainView.propTypes = {
  firstLayer: PropTypes.object.isRequired,
  kernels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
};

export default SmartCanvasMainView;

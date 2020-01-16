import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import p5 from 'p5';
import { SmartCanvas } from '../../js/smartcanvas';
import ChannelView from './ChannelView';
import { renderChart } from '../../js/activationchart';
import Grid from '@material-ui/core/Grid';

const SmartCanvasComponent = props => {
  const [ state, setState ] = useState({});

  const imgRef = useRef(null);
  const chartRef = useRef(null);
  const pRef = useRef(null);
  const smartCanvasRef = useRef(null);

  useEffect(() => {
    if (!pRef.current) {
      const onChange = lineInfo => setState({ lineInfo });
      smartCanvasRef.current = new SmartCanvas(props.shape, onChange);
      pRef.current = new p5(smartCanvasRef.current.getSketch(), imgRef.current);
    }
  }, [props, setState]);

  const { max, ids } = useMemo(() => {
    if (state.lineInfo) {
      return state.lineInfo.getMaxChannels();
    }
    return { max: [], ids: [] };
  }, [state]);

  const onSelect = useCallback(pt => {
    if (state.lineInfo && chartRef.current) {
      // render chart
      const acts = state.lineInfo.getChannelsAt(pt);
      chartRef.current.innerHTML = '';
      renderChart(chartRef.current, acts);
    }
  }, [state]);

  return (
    <Grid container spacing={1}>
      <Grid item>
        <div ref={imgRef}></div>
      </Grid>
      <Grid item>
        <ChannelView scale={3} ids={ids} max={max} onSelect={onSelect} />
      </Grid>
      <Grid item>
        <div ref={chartRef} style={{ width: '400px' }}></div>
      </Grid>
    </Grid>
  );
};

SmartCanvasComponent.propTypes = {
  shape: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default SmartCanvasComponent;

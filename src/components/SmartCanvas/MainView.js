import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import SmartCanvasDrawingInput from './DrawingInput';
import NetworkView1 from './NetworkView1';

const SmartCanvasMainView = props => {
  const [ drawingResult, setDrawingResult ] = useState(null);
  const onDrawingChange = useCallback(result => {
    setDrawingResult({ network: result.network });
  }, [setDrawingResult]);

  // let zoomScale = 1;
  // if (state.imgArr && state.imgArr.length > 0) {
  //   zoomScale = Math.min(200 / state.imgArr[0].length, 20);
  // }
  console.log('render main view');

  return (
    <Grid container spacing={1} className="bordered-canvas">
      <Grid item>
        <SmartCanvasDrawingInput kernels={props.kernels} shape={[200, 200]} onChange={onDrawingChange} />
        {/*<Array2DView imgArr={state.imgArr} scale={zoomScale} />*/}
      </Grid>
      <Grid item>
        { drawingResult && drawingResult.network ? <NetworkView1 network={drawingResult.network} /> : null }
      </Grid>
    </Grid>
  );
};

SmartCanvasMainView.propTypes = {
  kernels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
};

export default SmartCanvasMainView;

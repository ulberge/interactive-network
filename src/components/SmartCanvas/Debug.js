import React, { memo } from 'react';
import Grid from '@material-ui/core/Grid';
import SmartCanvasComponent from './SmartCanvasComponent';

const SmartCanvasDebug = memo(function SmartCanvasDebug(props) {
  return (
    <Grid container spacing={1} style={{ position: 'relative' }}>
      <Grid item className="bordered-canvas">
        <SmartCanvasComponent
          shape={[200, 200]}
        />
      </Grid>
    </Grid>
  );
});

export default SmartCanvasDebug;

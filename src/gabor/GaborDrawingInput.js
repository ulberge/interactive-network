import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import ClearIcon from '@material-ui/icons/Clear';
import IconButton from '@material-ui/core/IconButton';
import Slider from '@material-ui/core/Slider';

import EditableCanvas from '../common/EditableCanvas';

const GaborDrawingInput = props => {
  const [drawingKey, setDrawingKey] = useState(Math.random());
  const [strokeWidth, setStrokeWidth] = useState(1);

  const strokeWidthBounds = [0.1, 3];

  return (
    <Grid container direction="column" spacing={4} style={{ position: 'relative' }}>
      <Grid item className="bordered-canvas">
        <EditableCanvas key={ drawingKey } shape={[20, 20]} strokeWidth={strokeWidth} scale={10} onChange={props.onChange} />
      </Grid>
      <Grid item>
        <IconButton aria-label="clear" onClick={() => setDrawingKey(Math.random())} style={{ position: 'absolute', right: '12px', top: '12px' }}>
          <ClearIcon />
        </IconButton>
        <Grid container direction="column" spacing={4}>
          <Grid item xs>
            <div>Stroke</div>
            <Slider
              value={strokeWidth}
              aria-labelledby="stroke width"
              valueLabelDisplay="auto"
              marks={strokeWidthBounds.map(value => ({ value, label: value }))}
              step={0.1}
              min={strokeWidthBounds[0]}
              max={strokeWidthBounds[1]}
              onChange={(event, value) => {
                setStrokeWidth(value);
                setDrawingKey(Math.random());
              }}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

GaborDrawingInput.propTypes = {
  onChange: PropTypes.func.isRequired
};

export default GaborDrawingInput;

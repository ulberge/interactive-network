import React, { useState, useCallback, memo } from 'react';
import Grid from '@material-ui/core/Grid';
import EditableCanvas from '../UI/EditableCanvas';
import Array2DView from '../UI/Array2DView';
import ClearIcon from '@material-ui/icons/Clear';
import IconButton from '@material-ui/core/IconButton';


const DrawSmartCanvas = memo(function GaborDrawingInput(props) {
  const [ state, setState ] = useState({
    marks: [],
    strokeWeight: 1,
  });

  const onNewMark = useCallback(newMark => setState(state => ({ ...state, marks: [...state.marks, newMark] })), []);
  const clear = useCallback(newMark => setState(state => ({ ...state, marks: [] })), []);

  // on new marks, test new mars?

  return (
    <Grid container spacing={1} style={{ position: 'relative' }}>
      <Grid item className="bordered-canvas" style={{ margin: '0 auto' }}>
        <EditableCanvas
          shape={[21, 21]}
          marks={state.marks}
          strokeWeight={state.strokeWeight}
          scale={5}
          onNewMark={onNewMark}
        />
        <IconButton aria-label="reset" onClick={clear}>
          <ClearIcon />
        </IconButton>
      </Grid>
      <Grid item style={{ margin: '0 auto', width: '200px' }}>
        {/*<Array2DView imgArr={} />*/}
      </Grid>
    </Grid>
  );
});

export default DrawSmartCanvas;

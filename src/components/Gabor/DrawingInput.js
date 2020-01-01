import React, { useState, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import EditableCanvas from '../UI/EditableCanvas';
import { deepCopy } from '../../js/helpers';
import ClearIcon from '@material-ui/icons/Clear';
import ReplayIcon from '@material-ui/icons/Replay';
import IconButton from '@material-ui/core/IconButton';
import DebounceSlider from '../UI/DebounceSlider';

// Some default marks
const defaultMarks = [
  [[5.2, 5.4],[11.7, 11.1]],
  [[5.2, 5.6],[5.2, 13.0]],
  [[5.1, 16.4],[15.2, 16.4]],
  [[18.2, 3.7],[15.2, 7.4]],
];

const GaborDrawingInput = memo(function GaborDrawingInput(props) {
  const [ state, setState ] = useState({
    marks: deepCopy(defaultMarks),
    strokeWeight: 1,
    offset: 0,
    rotation: 0,
  });

  const onChange = useCallback((field, value) => setState(state => ({ ...state, [field]: value })), []);
  const onNewMark = useCallback(newMark => setState(state => ({ ...state, marks: [...state.marks, newMark] })), []);
  const reset = useCallback(newMark => setState(state => ({ ...state, marks: deepCopy(defaultMarks) })), []);
  const clear = useCallback(newMark => setState(state => ({ ...state, marks: [] })), []);

  return (
    <Grid container direction="column" spacing={1} style={{ position: 'relative' }}>
      <Grid item className="bordered-canvas" style={{ margin: '0 auto' }}>
        <EditableCanvas
          shape={[21, 21]}
          marks={state.marks}
          strokeWeight={state.strokeWeight}
          scale={props.scale}
          rotation={state.rotation}
          offset={state.offset}
          onNewMark={onNewMark}
          onRender={props.onUpdate}
        />
      </Grid>
      <Grid item style={{ margin: '0 auto', width: '200px' }}>
        <Grid container direction="column" justify="center" spacing={1}>
          <Grid item xs style={{ textAlign: 'center' }}>
            <IconButton aria-label="reset" onClick={reset}>
              <ReplayIcon />
            </IconButton>
            <IconButton aria-label="reset" onClick={clear}>
              <ClearIcon />
            </IconButton>
          </Grid>
          <Grid item xs>
            <div>
              <div>Stroke</div>
              <DebounceSlider
                defaultValue={state.strokeWeight}
                track={false}
                aria-labelledby="stroke width"
                valueLabelDisplay="auto"
                marks={[{ value: 0.1, label: '0.1'}, { value: 3, label: '3'}]}
                step={0.1}
                min={0.1}
                max={3}
                onChange={value => onChange('strokeWeight', value)}
              />
            </div>
            <div>
              <div>Offset</div>
              <DebounceSlider
                defaultValue={state.offset}
                track={false}
                aria-labelledby="stroke offset"
                valueLabelDisplay="auto"
                marks={[{ value: -1, label: '-1'}, { value: 0, label: '0'}, { value: 1, label: '1'}]}
                step={0.1}
                min={-1}
                max={1}
                onChange={value => onChange('offset', value)}
              />
            </div>
            <div>
              <div>Rotation</div>
              <DebounceSlider
                defaultValue={state.rotation}
                track={false}
                aria-labelledby="drawing rotation"
                valueLabelDisplay="auto"
                marks={[{ value: -360, label: '-360'}, { value: 0, label: '0'}, { value: 360, label: '360'}]}
                step={1}
                min={-360}
                max={360}
                onChange={value => onChange('rotation', value)}
              />
            </div>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
});

GaborDrawingInput.propTypes = {
  onUpdate: PropTypes.func.isRequired,
  scale: PropTypes.number.isRequired,
};

export default GaborDrawingInput;

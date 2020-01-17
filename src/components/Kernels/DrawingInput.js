import React, { useState, useCallback, memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import KernelsEditableCanvas from './EditableCanvas';
import { deepCopy } from '../../js/helpers';
import ClearIcon from '@material-ui/icons/Clear';
import ReplayIcon from '@material-ui/icons/Replay';
import IconButton from '@material-ui/core/IconButton';
import DebounceSlider from '../UI/DebounceSlider';

// Some default marks
const defaultMarks = [
  [[15.2, 15.4],[21.7, 15.4]],
  [[15.2, 15.6],[15.2, 23.0]],
  [[15.1, 26.4],[25.2, 26.4]],
  [[28.2, 13.7],[25.2, 17.4]],
];

const drawingSettings = JSON.parse(localStorage.getItem('drawing_settings')) || {
  strokeWeight: 2,
};

const KernelsDrawingInput = memo(function KernelsDrawingInput(props) {
  const [ state, setState ] = useState({
    marks: deepCopy(defaultMarks),
    ...drawingSettings,
    offset: 0,
    rotation: 0,
  });

  const onChange = useCallback((field, value) => setState(state => ({ ...state, [field]: value })), []);
  const onNewMark = useCallback(newMark => setState(state => ({ ...state, marks: [...state.marks, newMark] })), []);
  const reset = useCallback(newMark => setState(state => ({ ...state, marks: deepCopy(defaultMarks) })), []);
  const clear = useCallback(newMark => setState(state => ({ ...state, marks: [] })), []);

  useEffect(() => {
    // save values
    localStorage.setItem('drawing_settings', JSON.stringify({
      strokeWeight: state.strokeWeight,
    }));
  }, [state.strokeWeight]);

  return (
    <Grid container direction="column" spacing={1} style={{ position: 'relative' }}>
      <Grid item className="bordered-canvas" style={{ margin: '0 auto' }}>
        <KernelsEditableCanvas
          shape={[41, 41]}
          marks={state.marks}
          strokeWeight={state.strokeWeight}
          scale={props.scale}
          rotation={state.rotation}
          offset={state.offset}
          onNewMark={onNewMark}
          onRender={props.onUpdate}
        />
      </Grid>
      <Grid item style={{ margin: '0 auto', maxWidth: '200px', minWidth: '160px' }}>
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
                marks={[{ value: 0.1, label: '0.1'}, { value: 5, label: '5'}]}
                step={0.1}
                min={0.1}
                max={5}
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

KernelsDrawingInput.propTypes = {
  onUpdate: PropTypes.func.isRequired,
  scale: PropTypes.number.isRequired,
};

export default KernelsDrawingInput;

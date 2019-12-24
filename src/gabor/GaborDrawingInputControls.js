import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import ClearIcon from '@material-ui/icons/Clear';
import ReplayIcon from '@material-ui/icons/Replay';
import IconButton from '@material-ui/core/IconButton';
import Slider from '@material-ui/core/Slider';

const strokeWidthBounds = [0.1, 3];
const strokeWidthMarks = strokeWidthBounds.map(value => ({ value, label: value }));
const StrokeSlider = React.memo(function StrokeSlider(props) {
  return (
    <div>
      <div>Stroke</div>
      <Slider
        value={props.strokeWeight}
        track={false}
        aria-labelledby="stroke width"
        valueLabelDisplay="auto"
        marks={strokeWidthMarks}
        step={0.1}
        min={strokeWidthBounds[0]}
        max={strokeWidthBounds[1]}
        onChange={(event, strokeWeight) => props.onChangeStrokeWeight(strokeWeight)}
      />
    </div>
  )
});
StrokeSlider.propTypes = {
  strokeWeight: PropTypes.number.isRequired,
  onChangeStrokeWeight: PropTypes.func.isRequired
};

const offsetBounds = [-1, 1];
const offsetMarks = offsetBounds.map(value => ({ value, label: value }));
const OffsetSlider = React.memo(function OffsetSlider(props) {
  return (
    <div>
      <div>Offset</div>
      <Slider
        value={props.offset}
        track={false}
        aria-labelledby="stroke offset"
        valueLabelDisplay="auto"
        marks={offsetMarks}
        step={0.1}
        min={offsetBounds[0]}
        max={offsetBounds[1]}
        onChange={(event, offset) => props.onChangeOffset(offset)}
      />
    </div>
  )
});
OffsetSlider.propTypes = {
  offset: PropTypes.number.isRequired,
  onChangeOffset: PropTypes.func.isRequired
};

const MemoResetButton = React.memo(function MemoResetButton(props) {
  return (
    <IconButton aria-label="reset" onClick={props.onReset}>
      <ReplayIcon />
    </IconButton>
  )
});
MemoResetButton.propTypes = {
  onReset: PropTypes.func.isRequired
};

const MemoClearButton = React.memo(function MemoClearButton(props) {
  return (
    <IconButton aria-label="reset" onClick={props.onClear}>
      <ClearIcon />
    </IconButton>
  )
});
MemoClearButton.propTypes = {
  onClear: PropTypes.func.isRequired
};

const GaborDrawingInputControls = (function GaborDrawingInputControls(props) {
  const { strokeWeight, onChangeStrokeWeight, offset, onChangeOffset, onReset, onClear } = props;

  return (
    <Grid container direction="column" justify="center" spacing={1}>
      <Grid item xs style={{ textAlign: 'center' }}>
        <MemoResetButton onReset={onReset} />
        <MemoClearButton onClear={onClear} />
      </Grid>
      <Grid item xs>
        <StrokeSlider strokeWeight={strokeWeight} onChangeStrokeWeight={onChangeStrokeWeight} />
        <OffsetSlider offset={offset} onChangeOffset={onChangeOffset} />
      </Grid>
    </Grid>
  );
});

GaborDrawingInputControls.propTypes = {
  onChangeStrokeWeight: PropTypes.func.isRequired,
  onChangeOffset: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  strokeWeight: PropTypes.number.isRequired,
  offset: PropTypes.number.isRequired,
};

export default GaborDrawingInputControls;

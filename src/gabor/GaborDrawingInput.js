import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import ClearIcon from '@material-ui/icons/Clear';
import ReplayIcon from '@material-ui/icons/Replay';
import IconButton from '@material-ui/core/IconButton';
import Slider from '@material-ui/core/Slider';

import EditableCanvas from '../common/EditableCanvas';
import { deepCopy } from '../modules/helpers';

const defaultMarks = [
  [[5.2, 5.4],[11.7, 11.1]],
  [[5.2, 5.6],[5.2, 13.0]],
  [[5.1, 16.4],[15.2, 16.4]],
  [[18.2, 3.7],[15.2, 7.4]],
];

export default class GaborDrawingInput extends Component {
  state = {
    marks: deepCopy(defaultMarks),
    strokeWidth: 1,
    offset: 0
  }

  updateCanvas(imgArr, marks) {
    this.setState({ marks });
    this.props.onChange(imgArr);
  }

  render() {
    const { strokeWidth, marks, offset } = this.state;
    const { onChange } = this.props;
    const strokeWidthBounds = [0.1, 3];
    const offsetBounds = [-0.5, 0.5];

    return (
      <Grid container direction="column" spacing={4} style={{ position: 'relative' }}>
        <Grid item className="bordered-canvas">
          <EditableCanvas shape={[20, 20]} marks={marks} strokeWidth={strokeWidth} scale={10} offset={offset}
            onNewMark={newMark => this.setState({ marks: [...marks, newMark] })}
            onRender={onChange}
          />
        </Grid>
        <Grid item>
          <IconButton aria-label="reset" onClick={() => this.setState({ marks: deepCopy(defaultMarks) })}>
            <ReplayIcon />
          </IconButton>
          <IconButton aria-label="clear" onClick={() => this.setState({ marks: [] })}>
            <ClearIcon />
          </IconButton>
          <Grid container direction="column" spacing={4}>
            <Grid item xs>
              <div>Stroke</div>
              <Slider
                value={strokeWidth}
                track={false}
                aria-labelledby="stroke width"
                valueLabelDisplay="auto"
                marks={strokeWidthBounds.map(value => ({ value, label: value }))}
                step={0.1}
                min={strokeWidthBounds[0]}
                max={strokeWidthBounds[1]}
                onChange={(event, strokeWidth) => this.setState({ strokeWidth })}
              />
              <div>Offset</div>
              <Slider
                value={offset}
                track={false}
                aria-labelledby="stroke offset"
                valueLabelDisplay="auto"
                marks={offsetBounds.map(value => ({ value, label: value }))}
                step={0.1}
                min={offsetBounds[0]}
                max={offsetBounds[1]}
                onChange={(event, offset) => this.setState({ offset })}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

GaborDrawingInput.propTypes = {
  onChange: PropTypes.func.isRequired
};

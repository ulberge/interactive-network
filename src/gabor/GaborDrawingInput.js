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
  [[5.2, 5.4],[11.7, 11.1]]
];

export default class GaborDrawingInput extends Component {
  state = {
    marks: deepCopy(defaultMarks),
    strokeWidth: 1
  }

  updateCanvas(imgArr, marks) {
    this.setState({ marks });
    this.props.onChange(imgArr);
  }

  render() {
    const { strokeWidth, marks } = this.state;
    const { onChange } = this.props;
    const strokeWidthBounds = [0.1, 3];

    return (
      <Grid container direction="column" spacing={4} style={{ position: 'relative' }}>
        <Grid item className="bordered-canvas">
          <EditableCanvas shape={[20, 20]} marks={marks} strokeWidth={strokeWidth} scale={10}
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
                aria-labelledby="stroke width"
                valueLabelDisplay="auto"
                marks={strokeWidthBounds.map(value => ({ value, label: value }))}
                step={0.1}
                min={strokeWidthBounds[0]}
                max={strokeWidthBounds[1]}
                onChange={(event, strokeWidth) => this.setState({ strokeWidth })}
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

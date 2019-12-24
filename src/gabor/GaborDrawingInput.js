import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';

import EditableCanvas from '../common/EditableCanvas';
import GaborDrawingInputControls from './GaborDrawingInputControls';
import { deepCopy } from '../modules/helpers';

// Some default marks
const defaultMarks = [
  [[5.2, 5.4],[11.7, 11.1]],
  [[5.2, 5.6],[5.2, 13.0]],
  [[5.1, 16.4],[15.2, 16.4]],
  [[18.2, 3.7],[15.2, 7.4]],
];

class GaborDrawingInput extends Component {
  constructor(props) {
    super(props);
    this.onNewMark = this.onNewMark.bind(this);
    this.onChangeOffset = offset => this.setState({ offset });
    this.onClear = () => this.setState({ marks: [] });

    this.state = {
      marks: deepCopy(defaultMarks),
      offset: 0
    };
  }

  updateCanvas(imgArr, marks) {
    this.setState({ marks });
    this.props.onChange(imgArr);
  }

  reset() {
    this.setState({ marks: deepCopy(defaultMarks) });
  }

  onNewMark(newMark) {
    const { marks } = this.state;
    this.setState({ marks: [...marks, newMark] });
  }

  render() {
    const { marks, offset } = this.state;
    const { onDraw, strokeWeight, onChangeStrokeWeight, scale } = this.props;

    return (
      <Grid container direction="column" spacing={1} style={{ position: 'relative' }}>
        <Grid item className="bordered-canvas">
          <EditableCanvas shape={[20, 20]} marks={marks} strokeWeight={strokeWeight} scale={scale} offset={offset}
            onNewMark={this.onNewMark}
            onRender={onDraw}
          />
        </Grid>
        <Grid item>
          <GaborDrawingInputControls
            strokeWeight={strokeWeight}
            offset={offset}
            onChangeStrokeWeight={onChangeStrokeWeight}
            onChangeOffset={this.onChangeOffset}
            onReset={this.reset}
            onClear={this.onClear}
          />
        </Grid>
      </Grid>
    );
  }
}

GaborDrawingInput.propTypes = {
  onChangeStrokeWeight: PropTypes.func.isRequired,
  onDraw: PropTypes.func.isRequired,
  strokeWeight: PropTypes.number.isRequired,
};

export default GaborDrawingInput;

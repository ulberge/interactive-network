import React, { PureComponent } from 'react';
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

class GaborDrawingInput extends PureComponent {
  constructor(props) {
    super(props);

    this.onNewMark = this.onNewMark.bind(this);
    this.onChangeOffset = this.onChangeOffset.bind(this);
    this.onChangeStrokeWeight = this.onChangeStrokeWeight.bind(this);
    this.clear = this.clear.bind(this);
    this.reset = this.reset.bind(this);

    this.state = {
      marks: deepCopy(defaultMarks),
      strokeWeight: 1.3,
      offset: 0,
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

  onChangeStrokeWeight(strokeWeight) {
    this.setState({ strokeWeight });
  }

  onChangeOffset(offset) {
    this.setState({ offset });
  }

  clear() {
    this.setState({ marks: [] });
  }

  render() {
    const { marks, offset, strokeWeight } = this.state;
    const { onDraw, scale } = this.props;

    return (
      <Grid container direction="column" spacing={1} style={{ position: 'relative' }}>
        <Grid item className="bordered-canvas">
          <EditableCanvas shape={[21, 21]} marks={marks} strokeWeight={strokeWeight} scale={scale} offset={offset}
            onNewMark={this.onNewMark}
            onRender={onDraw}
          />
        </Grid>
        <Grid item style={{ margin: '0 auto', width: '200px' }}>
          {<GaborDrawingInputControls
            strokeWeight={strokeWeight}
            offset={offset}
            onChangeStrokeWeight={this.onChangeStrokeWeight}
            onChangeOffset={this.onChangeOffset}
            onReset={this.reset}
            onClear={this.clear}
          />}
        </Grid>
      </Grid>
    );
  }
}

GaborDrawingInput.propTypes = {
  onDraw: PropTypes.func.isRequired,
};

export default GaborDrawingInput;

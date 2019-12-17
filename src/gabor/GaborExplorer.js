import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';

import EditableCanvas from '../common/EditableCanvas';
import GaborFilters from './GaborFilters';

export default class GaborExplorer extends Component {
  state = {
    imgArr: []
  }

  render() {
    const { imgArr, filterSets, layers } = this.state;

    return (
      <Grid container direction="column" spacing={4}>
        <Grid item>
          <EditableCanvas size={[80, 80]} onChange={imgArr => this.setState({ imgArr })}/>
        </Grid>
        <Grid item>
          <GaborFilters />
        </Grid>
      </Grid>
    );
  }
}

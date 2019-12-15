import React, { Component } from 'react';

import './../App.css';
import Grid from '@material-ui/core/Grid';

import CompressionTest from './CompressionTest';

export default class App extends Component {
  render() {
    return (
      <div className="Test" style={{ margin: '20px' }}>
        <Grid container justify="center" spacing={2} style={{ flexGrow: 1 }}>
          <Grid item>
            <CompressionTest />
          </Grid>
        </Grid>
        <Grid container justify="center" spacing={2} style={{ flexGrow: 1 }}>
          <Grid item>
          </Grid>
        </Grid>
      </div>
    );
  }
}

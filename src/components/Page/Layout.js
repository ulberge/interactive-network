import React from 'react';
import Header from './Header';
import Grid from '@material-ui/core/Grid';

export default function Layout(props) {
  return (
    <Grid container spacing={1}>
      <Grid item xs={1}>
        <Header />
      </Grid>
      <Grid item xs={11}>
        {props.children}
      </Grid>
    </Grid>
  );
}

import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import DrawMachineInput from './MachineInput';


const DrawMainView = props => {
  return (
    <Grid container justify="center" spacing={4} className="bordered-canvas">
      <Grid item xs={12}>
        <DrawMachineInput shape={[80, 80]} kernels={props.kernels} />
      </Grid>
    </Grid>
  );
};

DrawMainView.propTypes = {
  kernels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
};

export default DrawMainView;

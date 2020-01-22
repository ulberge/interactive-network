import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
// import { getTest3 } from '../../js/box';
// import Array2DViewList from '../UI/Array2DViewList';
import DrawMachineInput from './MachineInput';


const DrawMainView = props => {
  return (
    <Grid container justify="center" spacing={4} className="bordered-canvas">
      <Grid item xs={12}>
        <DrawMachineInput firstLayer={props.firstLayer} shape={[80, 80]} kernels={props.kernels} />
      </Grid>
    </Grid>
  );
};

DrawMainView.propTypes = {
  firstLayer: PropTypes.object.isRequired,
  kernels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
};

export default DrawMainView;

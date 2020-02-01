import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Array2DViewList from '../UI/Array2DViewList';
import KernelTunerControls from './KernelTunerControls';

function KernelTuner(props) {
  const { numComponents, lambda, sigma, windowSize, types } = props.kernelSettings;

  const updateKernelSettings = useCallback((field, value) => {
    props.updateKernelSettings({ ...props.kernelSettings, [field]: value });
  }, [props]);

  return (
    <ExpansionPanel defaultExpanded={true} square={true} style={{ boxShadow: 'none', border: '1px solid #b2b2b2' }}>
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="kerneltuner-content"
      >
        <h3 style={{ margin: '0 10px' }}>Kernel Tuner</h3>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails style={{ margin: '10px 20px' }}>
        <Grid container justify="flex-start" spacing={4}>
          <Grid item style={{ marginRight: '20px', width: '200px' }}>
            <KernelTunerControls
              numComponents={numComponents}
              lambda={lambda}
              sigma={sigma}
              windowSize={windowSize}
              types={types}
              onChange={updateKernelSettings}
             />
          </Grid>
          <Grid item style={{ width: 'calc(100% - 220px)' }}>
            <Array2DViewList imgArrs={props.kernels} scale={4} cols={8} />
          </Grid>
        </Grid>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
}

KernelTuner.propTypes = {
  kernelSettings: PropTypes.object.isRequired,
  updateKernelSettings: PropTypes.func.isRequired,
  kernels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
};

export default KernelTuner;

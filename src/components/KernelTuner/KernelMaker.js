import React, { useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Array2DViewList from '../UI/Array2DViewList';
import KernelMakerControls from './KernelMakerControls';
import { getKernels } from '../../js/kernel';

function KernelMaker(props) {
  const { defaultKernelSettings, updateKernelSettings } = props;
  // store the kernel settings as a local state for snappy updates
  const [ kernelSettings, setKernelSettings ] = useState(defaultKernelSettings);
  const { numComponents, lambda, sigma, windowSize, types } = kernelSettings;

  const timerRef = useRef(null);
  const updateKernelSettingsCallback = useCallback((field, value) => {
    const newKernelSettings = { ...kernelSettings, [field]: value }
    setKernelSettings(newKernelSettings);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    // delay global update to make the kernel tuner UI update smoothly
    timerRef.current = setTimeout(() => {
      updateKernelSettings(newKernelSettings);
    }, 100);
  }, [ setKernelSettings, kernelSettings, updateKernelSettings ]);

  const kernels = useMemo(() => {
    return getKernels(windowSize, 2 ** numComponents, lambda, sigma, types);
  }, [ numComponents, lambda, sigma, windowSize, types ]);

  return (
    <ExpansionPanel defaultExpanded={true} square={true} style={{ boxShadow: 'none', border: '1px solid #b2b2b2' }}>
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="kerneltuner-content"
      >
        <h3 style={{ margin: '0 10px' }}>Kernel Maker</h3>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails style={{ margin: '10px 20px' }}>
        <Grid container justify="flex-start" spacing={4}>
          <Grid item style={{ marginRight: '20px', width: '165px' }}>
            <KernelMakerControls
              numComponents={numComponents}
              lambda={lambda}
              sigma={sigma}
              windowSize={windowSize}
              types={types}
              onChange={updateKernelSettingsCallback}
             />
          </Grid>
          <Grid item style={{ width: 'calc(100% - 220px)' }}>
            <Array2DViewList imgArrs={kernels} scale={4} cols={10} />
          </Grid>
        </Grid>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
}

KernelMaker.propTypes = {
  defaultKernelSettings: PropTypes.object.isRequired,
  updateKernelSettings: PropTypes.func.isRequired,
};

export default KernelMaker;

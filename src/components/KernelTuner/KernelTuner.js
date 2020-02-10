import React from 'react';
import PropTypes from 'prop-types';
import KernelMaker from '../KernelTuner/KernelMaker';
import KernelInspector from '../KernelTuner/KernelInspector';
import Container from '@material-ui/core/Container';

function KernelTuner(props) {
  const { kernelSettings, updateKernelSettings } = props;
  return (
    <div>
      <h2>Kernel Tuner</h2>
      <Container maxWidth="md">
        <KernelMaker defaultKernelSettings={kernelSettings} updateKernelSettings={updateKernelSettings} />
      </Container>
      <Container maxWidth="lg" style={{ marginTop: '40px' }}>
        <KernelInspector kernelSettings={kernelSettings} />
      </Container>
    </div>
  );
}

KernelTuner.propTypes = {
  kernelSettings: PropTypes.object.isRequired,
  updateKernelSettings: PropTypes.func.isRequired,
};

export default KernelTuner;

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import KernelTuner from '../KernelTuner/KernelTuner';
import KernelInspector from '../KernelInspector/KernelInspector';
import { getKernels } from '../../js/kernel';
import Container from '@material-ui/core/Container';

function KernelsPage(props) {
  const { numComponents, lambda, sigma, windowSize, types } = props.kernelSettings;

  const kernels = useMemo(() => {
    const kernels = getKernels(windowSize, 2 ** numComponents, lambda, sigma, types);
    return kernels;
  }, [ numComponents, lambda, sigma, windowSize, types ]);

  return (
    <div>
      <Container maxWidth="md">
        <KernelTuner kernels={kernels} kernelSettings={props.kernelSettings} updateKernelSettings={props.updateKernelSettings} />
      </Container>
      <Container maxWidth="lg">
        <KernelInspector kernels={kernels} style={{ marginTop: '40px' }} />
      </Container>
    </div>
  );
}

KernelsPage.propTypes = {
  kernelSettings: PropTypes.object.isRequired,
  updateKernelSettings: PropTypes.func.isRequired
};

export default KernelsPage;

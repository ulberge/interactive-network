import React, { memo } from 'react';
import PropTypes from 'prop-types';
import Array2DViewList from '../UI/Array2DViewList';

const KernelsListView = memo(function KernelsListView(props) {
  const { kernels, scale } = props;

  let kernelScale = 1;
  if (kernels && kernels.length > 0 && scale) {
    // keep same absolute  size regardless of kernel size
    kernelScale = scale / kernels[0].length;
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <Array2DViewList imgArrs={kernels} scale={kernelScale} normalize={true} />
    </div>
  );
});

KernelsListView.propTypes = {
  kernels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
  scale: PropTypes.number
};

export default KernelsListView;

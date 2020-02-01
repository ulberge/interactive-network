import React from 'react';
import PropTypes from 'prop-types';
import Array2DViewList from '../UI/Array2DViewList';

const KernelInspectorKernelOverlays = props => {
  const { kernels, imgArr, scale } = props;
  return (
    <div style={{ position: 'relative', margin: '0 10px' }}>
      <Array2DViewList imgArrs={new Array(kernels.length).fill(imgArr)} scale={scale}/>
      <Array2DViewList
        imgArrs={kernels}
        scale={scale}
        style={{ position: 'absolute', top: '4px' }}
      />
    </div>
  );
}

KernelInspectorKernelOverlays.propTypes = {
  kernels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))),
  imgArr: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  scale: PropTypes.number,
};

export default KernelInspectorKernelOverlays;

import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import SmartCanvas from '../../js/smartCanvas';
import p5 from 'p5';
import { getSketch } from '../../js/sketches/smartCanvasSketch';

function KernelInspectorDrawingInput(props) {
  const imgRef = useRef(null);
  const pRef = useRef(null);
  const smartCanvasRef = useRef(null);

  useEffect(() => {
    // Only do this once
    if (!pRef.current) {
      pRef.current = new p5(getSketch(props.shape, smartCanvasRef), imgRef.current);
    }
  });

  useEffect(() => {
    setTimeout(() => {
      // only updates to kernels should actually retrigger this, and it should be async
      const layerInfos = [
        {
          filters: props.kernels.map(k => [k]),
          kernelSize: props.kernels[0].length,
          type: 'conv2d'
        }
      ];
      smartCanvasRef.current = new SmartCanvas(pRef.current, props.shape, layerInfos);
      smartCanvasRef.current.addListener(props.onUpdate);
      smartCanvasRef.current.init();
    }, 10);
  }, [props.kernels, props.shape, props.onUpdate]);

  return (
    <div ref={imgRef}></div>
  );
}

KernelInspectorDrawingInput.propTypes = {
  kernels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
  shape: PropTypes.arrayOf(PropTypes.number).isRequired,
  onUpdate: PropTypes.func,
};

export default KernelInspectorDrawingInput;

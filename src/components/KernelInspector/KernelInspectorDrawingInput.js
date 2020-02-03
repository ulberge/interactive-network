import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import SmartCanvas from '../../js/smartCanvas';
import p5 from 'p5';
import { getSketch } from '../../js/sketches/drawingInputSketch';

function KernelInspectorDrawingInput(props) {
  const { shape, kernels, onUpdate } = props;
  const imgRef = useRef(null);
  const pRef = useRef(null);
  const smartCanvasRef = useRef(null);

  useEffect(() => {
    if (!pRef.current) {
      // currently doesn't support updating sketch
      pRef.current = new p5(getSketch(shape, smartCanvasRef), imgRef.current);
    }
  });

  useEffect(() => {
    // only updates to kernels should actually retrigger this
    const layerInfos = [
      {
        filters: kernels.map(k => [k]),
        kernelSize: kernels[0].length,
        type: 'conv2d'
      }
    ];
    smartCanvasRef.current = new SmartCanvas(pRef.current, shape, layerInfos);
    smartCanvasRef.current.addListener(onUpdate);
    smartCanvasRef.current.init();
  }, [ kernels, shape, onUpdate ]);

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

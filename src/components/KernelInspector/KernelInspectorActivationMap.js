import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import p5 from 'p5';
import { getSketch } from '../../js/sketches/activationInspectorSketch';

const KernelInspectorActivationMap = props => {
  const imgRef = useRef(null);
  const pRef = useRef(null);

  useEffect(() => {
    if (imgRef.current) {
      console.log('new inspector sketch');
      imgRef.current.innerHTML = '';
      pRef.current = new p5(getSketch(), imgRef.current);
    }
  }, []);

  useEffect(() => {
    if (pRef.current) {
      pRef.current.setKernels(props.kernels);
    }
  }, [props.kernels]);

  useEffect(() => {
    if (pRef.current) {
      pRef.current._pt = props.pt;
    }
  }, [props.pt]);

  useEffect(() => {
    if (pRef.current && props.ids && props.max) {
      pRef.current.setData(props.ids, props.max, props.scale);
    }
  }, [props.ids, props.max, props.scale]);

  useEffect(() => {
    if (pRef.current) {
      pRef.current._onSelect = props.onSelect;
    }
  }, [props.onSelect]);

  return (
    <div ref={imgRef} style={{ cursor: 'none' }}></div>
  );
};

KernelInspectorActivationMap.propTypes = {
  ids: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  max: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  kernels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))),
  scale: PropTypes.number,
  pt: PropTypes.object,
  onSelect: PropTypes.func,
};

export default KernelInspectorActivationMap;

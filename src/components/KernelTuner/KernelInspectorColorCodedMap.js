import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import p5 from 'p5';
import { getSketch } from '../../js/sketches/colorCodedMapSketch';

const KernelInspectorColorCodedMap = props => {
  const { kernels, pt, ids, max, scale, onSelect } = props;
  const imgRef = useRef(null);
  const pRef = useRef(null);

  useEffect(() => {
    if (imgRef.current) {
      imgRef.current.innerHTML = '';
      pRef.current = new p5(getSketch(), imgRef.current);
    }
  }, []);

  useEffect(() => {
    if (pRef.current) {
      pRef.current.setKernels(kernels);
    }
  }, [ kernels ]);

  useEffect(() => {
    if (pRef.current) {
      pRef.current._pt = pt;
    }
  }, [ pt ]);

  useEffect(() => {
    if (pRef.current && ids && max) {
      pRef.current.setData(ids, max, scale);
    }
  }, [ ids, max, scale ]);

  useEffect(() => {
    if (pRef.current) {
      pRef.current._onSelect = onSelect;
    }
  }, [ onSelect ]);

  return (
    <div ref={imgRef} className="zoom300"></div>
  );
};

KernelInspectorColorCodedMap.propTypes = {
  ids: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  max: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  kernels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))),
  scale: PropTypes.number,
  pt: PropTypes.object,
  onSelect: PropTypes.func,
};

export default KernelInspectorColorCodedMap;

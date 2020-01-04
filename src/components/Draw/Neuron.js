import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import p5 from 'p5';
import { getEmptySketch, getArraySketch } from '../../js/sketches';
import { Drawer } from '../../js/draw';

const DrawNeuron = props => {
  // sketch at 1:1 scale
  const imgRef = useRef(null);
  // sketch scaled up for viewing and debug
  const imgDisplayRef = useRef(null);
  // class for managing drawing animation
  const drawer = useRef(null);

  useEffect(() => {
    // run once
    if (!drawer.current && imgRef.current && imgDisplayRef.current) {
      const pRef = new p5(getEmptySketch(props.shape), imgRef.current);
      const pDisplayRef = new p5(getArraySketch(), imgDisplayRef.current);
      drawer.current = new Drawer(pRef, pDisplayRef);
    }
    // run every time
    if (drawer.current) {
      const { layers, layerIndex, neuronIndex, displayScale, strokeWeight, speed } = props;
      // draw what maximizes the neuron at the given shape using the given stroke weight and speed
      drawer.current.configure(layers, layerIndex, neuronIndex, displayScale, strokeWeight, speed);
      drawer.current.start();
    }
  }, [props]);

  return (
    <div className="overlay-container">
      <div ref={imgDisplayRef}></div>
      <div ref={imgRef} style={{ display: 'block' }}></div>
    </div>
  );
};

DrawNeuron.propTypes = {
  layers: PropTypes.arrayOf(PropTypes.object).isRequired,
  layerIndex: PropTypes.number.isRequired,
  neuronIndex: PropTypes.number.isRequired,
  strokeWeight: PropTypes.number.isRequired,
  speed: PropTypes.number.isRequired,
  shape: PropTypes.arrayOf(PropTypes.number).isRequired,
  displayScale: PropTypes.number.isRequired,
};

export default DrawNeuron;

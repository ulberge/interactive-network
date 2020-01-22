import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import p5 from 'p5';
import SmartCanvas from '../../js/smartcanvas';
import Drawer from '../../js/draw';
import { getBoxNetwork0 } from '../../js/box';
import { getEmptySketch } from '../../js/sketches/empty';
import DrawDebugNextSegmentOptions from './DebugNextSegmentOptions';
import Network from '../../js/network';

const layers = getBoxNetwork0();

const DrawMachineInput = props => {
  const imgRef = useRef(null);
  const overlayRef = useRef(null);
  const pImgRef = useRef(null);
  const pOverlayRef = useRef(null);
  const smartCanvasRef = useRef(null);
  const drawerRef = useRef(null);

  // create a debugger that transmits debug info to element
  const [ nextSegmentOptions, setNextSegmentOptions ] = useState(null);
  const onFindNextSegment = useCallback(debugOptions => {
    console.log('render ' + debugOptions.length + ' debug options');
    setNextSegmentOptions(debugOptions);
  }, []);
  const debug = { onFindNextSegment };

  const network = useMemo(() => {
    const kernels = props.kernels;
    if (!kernels || kernels.length === 0 || !layers) {
      return null;
    }
    return new Network(kernels, layers);
  }, [props.kernels]);

  useEffect(() => {
    if (!pImgRef.current && !pOverlayRef.current) {
      pOverlayRef.current = new p5(getEmptySketch(props.shape), overlayRef.current);
      smartCanvasRef.current = new SmartCanvas(props.shape, props.firstLayer);
      pImgRef.current = new p5(smartCanvasRef.current.getSketch(), imgRef.current);
      drawerRef.current = new Drawer(smartCanvasRef.current, pOverlayRef.current, debug);

      drawerRef.current.draw(network, 2, 0, { x: 2, y: 2 }, () => {
        console.log('done');
      });
    }
  }, [props, network, debug]);

  useEffect(() => {
    if (smartCanvasRef.current) {
      smartCanvasRef.current.onChange = props.onChange;
    }
  }, [props.onChange]);

  useEffect(() => {
    if (smartCanvasRef.current) {
      smartCanvasRef.current.layer = props.firstLayer;
    }
  }, [props.firstLayer]);

  return (
    <div className="overlay-container bordered-canvas">
      <div ref={imgRef}></div>
      <div ref={overlayRef} className="overlay"></div>
      <DrawDebugNextSegmentOptions debugOptions={nextSegmentOptions} kernels={props.kernels} scale={5} />
    </div>
  );
};

DrawMachineInput.propTypes = {
  firstLayer: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  shape: PropTypes.arrayOf(PropTypes.number).isRequired,
  kernels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
};

export default DrawMachineInput;

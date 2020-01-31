import React, { useRef, useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import p5 from 'p5';
import SmartCanvas from '../../js/smartCanvas';
import Drawer from '../../js/draw';
// import { getBoxNetwork0 } from '../../js/box';
import { getNetwork } from '../../js/networks/house';
import { getEmptySketch } from '../../js/sketches/empty';
// import DrawDebugNextSegmentOptions from './DebugNextSegmentOptions';
import Array2DViewList from '../UI/Array2DViewList';
import Array2DView from '../UI/Array2DView';
import { normalize3DByMax } from '../../js/helpers';

const layers = getNetwork();
const Network = null;

const saveDrawing = p => {
  const copy = p.get();
  const newDrawing = document.createElement('span');
  document.getElementById('drawings').appendChild(newDrawing);
  const copyCanvas = new p5(getEmptySketch([copy.width, copy.height]), newDrawing);
  copyCanvas.image(copy, 0, 0);
}

const DrawMachineInput = props => {
  const imgRef = useRef(null);
  const overlayRef = useRef(null);
  const pOverlayRef = useRef(null);
  const smartCanvasRef = useRef(null);
  const drawerRef = useRef(null);
  const drawingCountRef = useRef(0);

  const [ shadow, setShadow ] = useState(null);

  // create a debugger that transmits debug info to element
  // const [ nextSegmentOptions, setNextSegmentOptions ] = useState(null);
  // const onGetNextSegment = useCallback(debugOptions => {
  //   setNextSegmentOptions(debugOptions);
  // }, []);
  // const debug = { onGetNextSegment };

  const network = useMemo(() => {
    const kernels = props.kernels;
    if (!kernels || kernels.length === 0 || !layers) {
      return null;
    }
    return new Network(kernels, layers);
  }, [props.kernels]);

  useEffect(() => {
    if (!pOverlayRef.current) {
      pOverlayRef.current = new p5(getEmptySketch(props.shape), overlayRef.current);
    }
    if (!drawerRef.current) {
      drawerRef.current = new Drawer(null, pOverlayRef.current);
    }

    if (!smartCanvasRef.current) {
      smartCanvasRef.current = new SmartCanvas(imgRef.current, props.kernels, props.shape);
      drawerRef.current.smartCanvas = smartCanvasRef.current;
      const draw = () => {
        drawerRef.current.draw(network, 3, 0, { x: 2, y: 2 }, () => {
          console.log('done');
          saveDrawing(smartCanvasRef.current.p);
          drawingCountRef.current += 1;
          if (drawingCountRef.current < 10) {
            smartCanvasRef.current.reset();
            draw();
          }
        });
        setShadow(drawerRef.current.shadow);
      }
      draw();
    }
  }, [props, network]);

  return (
    <div className="bordered-canvas draw-test">
      <div>
        <h3>Drawer:</h3>
        <div className="overlay-container">
          <div ref={imgRef}></div>
          <div ref={overlayRef} className="overlay"></div>
        </div>
      </div>
      <div>
        <h3>Network:</h3>
        {
          network && network.layersInfo ?
            network.layersInfo.map((info, i) => {
              let el;
              if (info.type === 'maxPool2d') {
                el = (<h4>Layer: MaxPool2D (Size: { info.poolSize })</h4>);
              } else if (info.type === 'conv2d') {
                let insideEl;
                if (i === 0) {
                  const kernels = normalize3DByMax(info.filters.map(channel => channel[0]));
                  insideEl = (<div className="network-kernels"><Array2DViewList imgArrs={kernels} normalize={true} scale={27 / kernels[0].length}/></div>);
                } else {
                  insideEl = info.filters.map(channel => {
                    const kernels = normalize3DByMax(channel);
                    return (<div className="network-kernels"><Array2DViewList imgArrs={kernels} scale={27 / kernels[0].length}/></div>);
                  });
                }
                el = (<div>
                        <h4>Layer: Conv2D</h4>
                        { insideEl }
                      </div>);
              }

              return (<div className="network-layer">{ el }</div>);
            }) :
            null
        }
        <div>
          <h4>Network Shadow:</h4>
          <Array2DView imgArr={shadow} normalize={true} scale={2} />
        </div>
      </div>
      <div>
        <h3>Drawings:</h3>
        <div id="drawings"></div>
      </div>
      {/*<DrawDebugNextSegmentOptions debugOptions={nextSegmentOptions} kernels={props.kernels} scale={5} />*/}
    </div>
  );
};

DrawMachineInput.propTypes = {
  shape: PropTypes.arrayOf(PropTypes.number).isRequired,
  kernels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
};

export default DrawMachineInput;

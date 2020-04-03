import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import SmartCanvas from '../../js/smartCanvas';
import p5 from 'p5';
import { getSketch } from '../../js/sketches/drawingInputSketch';
import { getSketch as getOverlaySketch } from '../../js/sketches/zoomOverlaySketch';
import Drawer from '../../js/draw';
import * as tf from '@tensorflow/tfjs';

import AttnFilterRenderer from './attnFilterRenderer';

function getEmptySketch(shape) {
  return (p) => {
    p.setup = () => {
      const [ w, h ] = shape;
      p.createCanvas(w, h);
    };
  };
}

let drawTimer;

const saveDrawing = (p, container) => {
  let dataURL = p.canvas.toDataURL();
  const img = new Image();
  if (!dataURL.includes('data:image/png;base64,')) {
    dataURL = 'data:image/png;base64,' + dataURL;
  }
  img.src = dataURL;
  const index = container.children.length;
  img.addEventListener('click', () => {
    if (!window.dataSet) {
      window.dataSet = [];
    }
    const stageData = window['stageData' + index];

    // assign activation based on percentage of total distance travelled at each point
    const totalDist = stageData.reduce((total, stage) => total += stage.dist, 0);
    let dist = 0;
    stageData.forEach(stage => {
      dist += stage.dist
      stage.act = dist / totalDist;
    });

    alert(stageData.map(stage => stage.act));
    window.dataSet.push(...stageData);
  });
  container.appendChild(img);
}

function NetworkBuilderDrawingInput(props) {
  const { shape, layerInfos, onUpdate, onSelect } = props;
  const imgRef = useRef(null);
  const pRef = useRef(null);
  const imgOverlayRef = useRef(null);
  const pOverlayRef = useRef(null);
  const smartCanvasRef = useRef(null);
  const drawerRef = useRef(null);

  const handleSelect = (rect) => {
    onSelect(rect);
  };

  useEffect(() => {
    if (!pRef.current) {
      // currently doesn't support updating sketch
      pRef.current = new p5(getSketch(shape, smartCanvasRef), imgRef.current);
    }
  });

  useEffect(() => {
    if (!pOverlayRef.current) {
      // currently doesn't support updating sketch
      pOverlayRef.current = new p5(getEmptySketch(shape), imgOverlayRef.current);
      // pOverlayRef.current = new p5(getOverlaySketch(shape, handleSelect), imgOverlayRef.current);
    }
  });

  useEffect(() => {
    console.log('update layer infos', layerInfos);
    smartCanvasRef.current = new SmartCanvas(pRef.current, pOverlayRef.current, shape, layerInfos);
    // turn off stats for speed
    smartCanvasRef.current.network.noStats();
    // smartCanvasRef.current.addListener(onUpdate);
    // smartCanvasRef.current.addListener((...args) => {
    //   if (!drawerRef.current || !drawerRef.current.drawingTimer) {
    //     onUpdate(...args);
    //   }
    // });
    smartCanvasRef.current.init();
  }, [ layerInfos ]);

  const clear = useCallback(() => smartCanvasRef.current.reset(), []);

  const zoom = () => {
    const isZoom = !pOverlayRef.current._isActive;
    pOverlayRef.current._isActive = isZoom;
    pRef.current._noDraw = isZoom;
    // add listener to pOverlayRef that gets position and draws itself?
  };

  const clearZoom = () => {
    onSelect();
    pOverlayRef.current.clear();
  };

  // Add event listeners
  useEffect(() => {
    const keyHandler = e => {
      if (e.key === 'z') {
        zoom();
      }
    };
    window.addEventListener('keydown', keyHandler);
    // Remove event listeners on cleanup
    return () => window.removeEventListener('keydown', keyHandler);
  }, []);

  const autoDraw = () => {
    // if (!drawerRef.current) {
    //   drawerRef.current = new Drawer(smartCanvasRef.current, pOverlayRef.current);
    // }
    const draw = () => {
      // smartCanvasRef.current.reset();
      // const arrs = smartCanvasRef.current.network.arrs;
      // const [ h, w ] = arrs[arrs.length - 1]._shape;
      // const drawLocation = { x: Math.floor(w / 2), y: Math.floor(h / 2) };
      // // const drawLocation = { x: Math.floor(w / 4), y: Math.floor(h / 4) };
      // // const drawLocation = { x: Math.floor(w * Math.random()), y: Math.floor(h * Math.random()) };
      // drawerRef.current.draw(layerInfos.length - 1, 0, drawLocation, () => {
      //   const container = document.getElementById('saved-drawings');
      //   window['stageData' + container.children.length] = drawerRef.current.stages;
      //   window.maxLocation = { x: Math.floor(w / 2), y: Math.floor(h / 2) };
      //   window.regularizerTerm = Math.max(drawerRef.current.prevScore, window.regularizerTerm || 0);
      //   saveDrawing(pRef.current, container);
      //   smartCanvasRef.current.reset();
      //   draw();
      // });

      // drawerRef.current.draw(layerInfos.length - 5, 0, null, () => {});
      // drawerRef.current.draw(layerInfos.length - 3, 1, null, () => {});
      // drawerRef.current.draw(layerInfos.length - 1, 0, null, () => {});

      pRef.current.strokeWeight(2);

      const renderers = [];

      const l0Settings = {
        goodThreshold: 0.1,
        newLineMinThreshold: 50, // minimum score for acceptance
        nextSegmentMinThreshold: 30, // minimum score for acceptance
        attnPadding: 10,
        newLineNum: 10,
        nextSegmentNum: 3,
        nextSegmentPatience: 1,
        newLinePatience: 1,
      };
      const l1Settings = {
        goodThreshold: 0.1,
        newLineMinThreshold: 50, // minimum score for acceptance
        nextSegmentMinThreshold: 30, // minimum score for acceptance
        attnPadding: 10,
        newLineNum: 10,
        nextSegmentNum: 8,
        nextSegmentPatience: 1,
        newLinePatience: 2,
      };
      const l2Settings = {
        goodThreshold: 100,
        newLineMinThreshold: 50, // minimum score for acceptance
        nextSegmentMinThreshold: 5, // minimum score for acceptance
        attnPadding: 6,
        newLineNum: 12,
        nextSegmentNum: 8,
        nextSegmentPatience: 2,
        newLinePatience: 3,
      };
      const l3Settings = {
        goodThreshold: 1000,
        newLineMinThreshold: 100, // minimum score for acceptance
        nextSegmentMinThreshold: 10, // minimum score for acceptance
        attnPadding: 2,
        newLineNum: 14,
        nextSegmentNum: 10,
        nextSegmentPatience: 2,
        newLinePatience: 10,
        numStepsPerStep: 1
      };

      setTimeout(() => {
        renderers.push({ r: new AttnFilterRenderer(smartCanvasRef.current, 1, 0, l0Settings), n: 3 });
        renderers.push({ r: new AttnFilterRenderer(smartCanvasRef.current, 1, 1, l0Settings), n: 3 });
      }, 10);

      setTimeout(() => {
        renderers.push({ r: new AttnFilterRenderer(smartCanvasRef.current, 1, 2, l1Settings), n: 3 });
        renderers.push({ r: new AttnFilterRenderer(smartCanvasRef.current, 1, 3, l1Settings), n: 3 });
        renderers.push({ r: new AttnFilterRenderer(smartCanvasRef.current, 1, 4, l1Settings), n: 3 });
        renderers.push({ r: new AttnFilterRenderer(smartCanvasRef.current, 1, 5, l1Settings), n: 3 });
      }, 5000);

      setTimeout(() => {
        renderers.push({ r: new AttnFilterRenderer(smartCanvasRef.current, 2, 0, l2Settings), n: 2 });
        renderers.push({ r: new AttnFilterRenderer(smartCanvasRef.current, 2, 1, l2Settings), n: 2 });
        renderers.push({ r: new AttnFilterRenderer(smartCanvasRef.current, 2, 2, l2Settings), n: 2 });
        renderers.push({ r: new AttnFilterRenderer(smartCanvasRef.current, 2, 3, l2Settings), n: 2 });
      }, 20000);

      setTimeout(() => {
        renderers.push({ r: new AttnFilterRenderer(smartCanvasRef.current, 4, 0, l3Settings), n: 1 });
      }, 30000);

      const run = () => {
        renderers.forEach(r => {
          for (let i = 0; i < r.n; i += 1) {
            r.r.step();
          }
        });
        // console.log(tf.memory());
        drawTimer = setTimeout(() => run(), 0);
      };
      run();
    };
    draw();
  };

  const stopAutoDraw = () => {
    if (drawTimer) {
      clearTimeout(drawTimer);
    }
    // if (drawerRef.current) {
    //   drawerRef.current.stop();
    //   pOverlayRef.current.clear();
    // }
  };

  return (
    <Grid container direction="column" spacing={1} style={{ position: 'relative' }}>
      <Grid item style={{ margin: '0 auto' }}>
        <div className="overlay-container">
          <div ref={imgRef} className="zoom600"></div>
          <div ref={imgOverlayRef} className="zoom600 overlay"></div>
        </div>
        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <Button style={{ marginLeft: '10px' }} variant="contained" size="small" color="primary" aria-label="autodraw" onClick={autoDraw}>
            AutoDraw()
          </Button>
          <Button style={{ marginLeft: '10px' }} variant="contained" size="small" color="primary" aria-label="stop" onClick={stopAutoDraw}>
            Stop
          </Button>
          <Button style={{ marginLeft: '10px' }} variant="contained" size="small" color="primary" aria-label="clear" onClick={clear}>
            Clear
          </Button>
        </div>
        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <Button style={{ marginLeft: '10px' }} variant="contained" size="small" color="primary" aria-label="zoom" onClick={zoom}>
            Zoom
          </Button>
          <Button style={{ marginLeft: '10px' }} variant="contained" size="small" color="primary" aria-label="clear zoom" onClick={clearZoom}>
            Clear Zoom
          </Button>
        </div>
      </Grid>
    </Grid>
  );
}

NetworkBuilderDrawingInput.propTypes = {
  layerInfos: PropTypes.arrayOf(PropTypes.object).isRequired,
  shape: PropTypes.arrayOf(PropTypes.number).isRequired,
  onUpdate: PropTypes.func,
  onSelect: PropTypes.func,
};

export default NetworkBuilderDrawingInput;

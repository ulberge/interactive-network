import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import SmartCanvas from '../../js/smartCanvas';
import p5 from 'p5';
import { getSketch } from '../../js/sketches/drawingInputSketch';
import { getSketch as getOverlaySketch } from '../../js/sketches/zoomOverlaySketch';
import Drawer from '../../js/draw';

function NetworkBuilderDrawingInput(props) {
  const { shape, layerInfos, onUpdate, onSelect } = props;
  const imgRef = useRef(null);
  const pRef = useRef(null);
  const imgOverlayRef = useRef(null);
  const pOverlayRef = useRef(null);
  const smartCanvasRef = useRef(null);

  useEffect(() => {
    if (!pRef.current) {
      // currently doesn't support updating sketch
      pRef.current = new p5(getSketch(shape, smartCanvasRef), imgRef.current);
    }
  });

  useEffect(() => {
    if (!pOverlayRef.current) {
      // currently doesn't support updating sketch
      pOverlayRef.current = new p5(getOverlaySketch(shape, onSelect), imgOverlayRef.current);
    }
  });

  useEffect(() => {
    smartCanvasRef.current = new SmartCanvas(pRef.current, shape, layerInfos);
    // turn off stats for speed
    smartCanvasRef.current.network.noStats();
    smartCanvasRef.current.addListener(onUpdate);
    smartCanvasRef.current.init();
  }, [ layerInfos ]);

  const clear = useCallback(() => smartCanvasRef.current.reset(), []);
  const zoom = () => {
    const isZoom = !pOverlayRef.current._isActive;
    pOverlayRef.current._isActive = isZoom;
    pRef.current._noDraw = isZoom;
    // add listener to pOverlayRef that gets position and draws itself?
  };

  const autoDraw = () => {
    const drawer = new Drawer(smartCanvasRef.current, pOverlayRef.current);
    drawer.draw(3, 0, { x: 10, y: 10 });
  };

  return (
    <Grid container direction="column" spacing={1} style={{ position: 'relative' }}>
      <Grid item style={{ margin: '0 auto' }}>
        <div className="overlay-container">
          <div ref={imgRef} className="zoom300"></div>
          <div ref={imgOverlayRef} className="zoom300 overlay"></div>
        </div>
        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <Button style={{ marginLeft: '10px' }} variant="contained" size="small" color="primary" aria-label="clear" onClick={autoDraw}>
            AutoDraw()
          </Button>
          <Button style={{ marginLeft: '10px' }} variant="contained" size="small" color="primary" aria-label="clear" onClick={zoom}>
            Zoom
          </Button>
          <Button style={{ marginLeft: '10px' }} variant="contained" size="small" color="primary" aria-label="clear" onClick={clear}>
            Clear
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

import React, { useRef, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import p5 from 'p5';
import { getSketch } from '../../js/sketches/collageSketch';
import { drawMaxPool } from './drawCollage';

const canvasSize = 300;
const shape = [canvasSize, canvasSize];

const saveDrawing = (p, container) => {
  let dataURL = p.canvas.toDataURL();
  const img = new Image();
  if (!dataURL.includes('data:image/png;base64,')) {
    dataURL = 'data:image/png;base64,' + dataURL;
  }
  img.src = dataURL;
  container.appendChild(img);
}

function Collage(props) {
  const imgRef = useRef(null);
  const pRef = useRef(null);
  const stopRef = useRef(null);

  // Get underlying sketch
  useEffect(() => {
    if (!pRef.current) {
      // currently doesn't support updating sketch
      pRef.current = new p5(getSketch(shape), imgRef.current);
    }
  });

  const autoDraw = () => {
    if (!pRef.current) {
      return;
    }

    const callback = () => {
      const container = document.getElementById('saved-drawings');
      saveDrawing(pRef.current, container);
    };
    stopRef.current = drawMaxPool(pRef.current, callback);
  };

  const stopAutoDraw = () => {
    if (stopRef.current) {
      stopRef.current();
    }
  };

  return (
    <div>
      <h2>
        <span>Network Builder</span>&nbsp;&nbsp;
      </h2>
      <Grid container>
        <Grid item xs={5}>
          <div className="overlay-container">
            <div ref={imgRef} className="zoom600"></div>
          </div>
          <Button style={{ marginLeft: '10px' }} variant="contained" size="small" color="primary" aria-label="autodraw" onClick={autoDraw}>
            AutoDraw()
          </Button>
          <Button style={{ marginLeft: '10px' }} variant="contained" size="small" color="primary" aria-label="stop" onClick={stopAutoDraw}>
            Stop
          </Button>
        </Grid>
        <Grid item xs={12}>
          <div id="saved-drawings" style={{ maxWidth: '1300px' }}></div>
        </Grid>
      </Grid>
    </div>
  );
}

export default Collage;

import React, { useRef, useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import p5 from 'p5';
import { getSketch } from '../../js/sketches/collageSketch';
import drawNetwork from './drawNetwork';
import NetworkBuilderWaterfall from '../NetworkBuilder/NetworkBuilderWaterfall';
import { saveElement } from './saveResults';

const canvasSize = 31;
const shape = [canvasSize, canvasSize];

const saveDrawing = (p, id) => {
  const container = document.getElementById('saved-drawings' + id);
  let dataURL = p.canvas.toDataURL();
  const img = new Image();
  if (!dataURL.includes('data:image/png;base64,')) {
    dataURL = 'data:image/png;base64,' + dataURL;
  }
  img.src = dataURL;
  container.appendChild(img);
}

function DrawTest(props) {
  const { kernels, rewards, numTests, testId } = props;

  const imgRef = useRef(null);
  const pRef = useRef(null);
  const imgTestRef = useRef(null);
  const pRefTest = useRef(null);
  const drawerRef = useRef(null);

  const [ networkData, setNetworkData ] = useState(null);

  const autoDraw = (count) => {
    if (!pRef.current || count >= numTests) {
      return;
    }
    const callback = smartCollage => {
      // setNetworkData({ network: smartCollage.networks[0] });
      // saveElement('to-save', 'C1', count);
      saveDrawing(smartCollage.p, testId);
      saveDrawing(pRefTest.current, testId + 'b');
      smartCollage.reset();
      autoDraw(count + 1);
    };
    // const onUpdate = network => {
    //   setNetworkData({ network });
    // };
    drawerRef.current = drawNetwork(kernels, rewards, pRef.current, callback, pRefTest.current);
  };

  useEffect(() => {
    if (!pRef.current) {
      pRef.current = new p5(getSketch(shape), imgRef.current);
      const testSize = 2;
      pRefTest.current = new p5(getSketch(shape.map(v => v * testSize)), imgTestRef.current);

      setTimeout(() => {
        pRefTest.current.strokeWeight(testSize);
        // pRefTest.current.pixelDensity(9);
        pRefTest.current._testSize = testSize;
        autoDraw(0);
      }, 500);
    }
  });

  const stopAutoDraw = () => {
    if (drawerRef.current) {
      drawerRef.current.stop();
    }
  };

  return (
    //<div id="to-save" style={{ minHeight: '1200px', padding: '100px' }}>
    <div id="to-save">
      <Grid container>
        <Grid item xs={6}>
          <div className="overlay-container" style={{ marginBottom: '30px' }}>
            <div ref={imgRef} className=""></div>
            <div ref={imgTestRef} className=""></div>
          </div>
          {/*<Button style={{ marginLeft: '10px' }} variant="contained" size="small" color="primary" aria-label="autodraw" onClick={() => autoDraw(0)}>
            AutoDraw()
          </Button>
          <Button style={{ marginLeft: '10px' }} variant="contained" size="small" color="primary" aria-label="stop" onClick={stopAutoDraw}>
            Stop
          </Button>
          <Button style={{ marginLeft: '10px' }} variant="contained" size="small" color="primary" aria-label="save" onClick={() => saveElement('to-save')}>
            Save
          </Button>*/}
        </Grid>
        <Grid item xs={6} className="composite compact">
          {
            networkData
            ? <NetworkBuilderWaterfall
                networkData={networkData}
                onSelectKernel={() => {}}
              />
            : null
          }
        </Grid>
      </Grid>
    </div>
  );
}

export default DrawTest;

import React, { useRef, useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import p5 from 'p5';
import { getSketch } from '../../js/sketches/collageSketch';
import { drawMaxPool, drawStoredPrototype } from './drawCollage';
// import Drawer from './drawPrototype';
import NetworkBuilderWaterfall from '../NetworkBuilder/NetworkBuilderWaterfall';
// import { storedPrototype } from './stored';

const canvasSize = 100;
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
  const drawerRef = useRef(null);
  const [ networkDatas, setNetworkDatas ] = useState([]);

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

    const onUpdate = ({ networks }) => {
      setNetworkDatas(networks.map(network => ({ network })));
    };
    const { drawer, networks } = drawStoredPrototype(pRef.current, callback, onUpdate);
    // const drawer = new Drawer(pRef.current);
    // drawer.draw(storedPrototype, callback);
    drawerRef.current = drawer;
  };

  const stopAutoDraw = () => {
    if (drawerRef.current) {
      drawerRef.current.stop();
    }
  };

  const save = () => {
    const container = document.getElementById('saved-drawings');
    saveDrawing(pRef.current, container);
  };

  return (
    <div>
      <h2>
        <span>Network Builder</span>&nbsp;&nbsp;
      </h2>
      <Grid container>
        <Grid item xs={6}>
          <div className="overlay-container">
            <div ref={imgRef} className="zoom600"></div>
          </div>
          <Button style={{ marginLeft: '10px' }} variant="contained" size="small" color="primary" aria-label="autodraw" onClick={autoDraw}>
            AutoDraw()
          </Button>
          <Button style={{ marginLeft: '10px' }} variant="contained" size="small" color="primary" aria-label="stop" onClick={stopAutoDraw}>
            Stop
          </Button>
          <Button style={{ marginLeft: '10px' }} variant="contained" size="small" color="primary" aria-label="save" onClick={save}>
            Save
          </Button>
        </Grid>
        <Grid item xs={6} className="composite compact">
         { networkDatas.map(networkData => (
          <NetworkBuilderWaterfall
            networkData={networkData}
            onSelectKernel={() => {}}
          />
          )) }
        </Grid>
        {/*<Grid item xs={7}>
          <img src="./prototype_stored.png" />
        </Grid>*/}
        <Grid item xs={12}>
          <div id="saved-drawings" style={{ maxWidth: '1300px' }}></div>
        </Grid>
      </Grid>
    </div>
  );
}

export default Collage;

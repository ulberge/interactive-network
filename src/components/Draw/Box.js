import React, { useRef, useEffect, useState } from 'react';
import p5 from 'p5';
import { getEmptySketch, getArraySketch } from '../../js/sketches';
import { Drawer } from '../../js/draw';
import SmartCanvas from '../../js/smartcanvas';
import { getTest3 } from '../../js/box';
import Array2DViewList from '../UI/Array2DViewList';
import ClearIcon from '@material-ui/icons/Clear';
import IconButton from '@material-ui/core/IconButton';

const w = 21;
const h = 21;
const canvasScale = 4;
// const scale = 8;

const filterSize = 9;
const drawLocation = [10, 10];
const getScore = getTest3();

const DrawBox = props => {
  // sketch at 1:1 scale
  const imgRef = useRef(null);
  // sketch scaled up for viewing and debug
  const imgDisplayRef = useRef(null);

  const pRef = useRef(null);
  const pDisplayRef = useRef(null);
  const pInitRef = useRef(false);
  const drawerInitRef = useRef(false);
  const drawerRef = useRef(null);

  const [ imgArrs, setImgArrs ] = useState([]);

  useEffect(() => {
    // run once
    if (!pInitRef.current && imgRef.current && imgDisplayRef.current) {
      pRef.current = new p5(getEmptySketch([w * canvasScale, h * canvasScale]), imgRef.current);
      pDisplayRef.current = new p5(getArraySketch(), imgDisplayRef.current);
      pInitRef.current = true;
    }

    // run every time
    if (!drawerInitRef.current && pRef.current && pDisplayRef.current) {
      console.log('make drawer!');
      const smartCanvas = new SmartCanvas(w, h);
      const center = [drawLocation[0] * canvasScale, drawLocation[1] * canvasScale];
      const padding = 4 * canvasScale;
      const halfBoundSize = (filterSize * canvasScale / 2) + padding;
      const bounds = {
        sx: center[0] - halfBoundSize,
        sy: center[1] - halfBoundSize,
        ex: center[0] + halfBoundSize,
        ey: center[1] + halfBoundSize,
      };
      drawerRef.current = new Drawer(smartCanvas, getScore, pRef.current, pDisplayRef.current, 3, 1, 0, canvasScale, bounds);
      drawerRef.current.start(() => {
        // record this.p
        const imgArr = drawerRef.current.getCurrentImage();
        setImgArrs([ ...imgArrs, imgArr ]);
        pRef.current.clear();
        drawerInitRef.current = false;
      });
      drawerInitRef.current = true;
    }
  }, [props, imgArrs]);

  return (
    <div className="overlay-container bordered-canvas">
      <div ref={imgDisplayRef}></div>
      <div ref={imgRef} style={{ display: 'block' }}></div>
      <IconButton aria-label="reset" onClick={() => drawerRef.current ? drawerRef.current.stop() : null}>
        <ClearIcon />
      </IconButton>
      <Array2DViewList imgArrs={imgArrs} scale={1.5} />
    </div>
  );
};

export default DrawBox;

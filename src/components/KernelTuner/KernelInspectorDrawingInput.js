import React, { useEffect, useRef, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Slider from '@material-ui/core/Slider';
import SmartCanvas from '../../js/smartCanvas';
import p5 from 'p5';
import { getSketch } from '../../js/sketches/drawingInputSketch';

function KernelInspectorDrawingInput(props) {
  const { shape, kernels, onUpdate } = props;

  const [ rotation, setRotation ] = useState(0);

  const imgRef = useRef(null);
  const pRef = useRef(null);
  const smartCanvasRef = useRef(null);

  useEffect(() => {
    if (!pRef.current) {
      // currently doesn't support updating sketch
      pRef.current = new p5(getSketch(shape, smartCanvasRef), imgRef.current);
    }
  });

  useEffect(() => {
    // only updates to kernels should actually retrigger this
    const layerInfos = [
      {
        filters: kernels.map(k => [k]),
        kernelSize: kernels[0].length,
        type: 'conv2d'
      }
    ];
    smartCanvasRef.current = new SmartCanvas(pRef.current, shape, layerInfos);
    smartCanvasRef.current.addListener(onUpdate);
    smartCanvasRef.current.init();
  }, [ kernels, shape, onUpdate ]);

  useEffect(() => {
    if (!pRef.current._setupDone) {
      return;
    }

    pRef.current.setRotation(rotation);
    // entire canvas is dirty
    smartCanvasRef.current.forceFullUpdate();
  }, [ rotation ]);

  const clear = useCallback(() => smartCanvasRef.current.reset(), []);

  return (
    <Grid container direction="column" spacing={1} style={{ position: 'relative' }}>
      <Grid item style={{ margin: '0 auto' }}>
        <div ref={imgRef} className="zoom300"></div>
        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <span>Make a drawing</span>
          <Button style={{ marginLeft: '10px' }} variant="contained" size="small" color="primary" aria-label="clear" onClick={clear}>
            Clear
          </Button>
        </div>
      </Grid>
      <Grid item style={{ margin: '20px auto', maxWidth: '200px', minWidth: '160px' }}>
        <div>
          <Slider
            defaultValue={rotation}
            track={false}
            aria-labelledby="drawing rotation"
            valueLabelDisplay="auto"
            marks={[{ value: -360, label: '-360'}, { value: 0, label: '0'}, { value: 360, label: '360'}]}
            step={1}
            min={-360}
            max={360}
            onChange={(event, value) => setRotation(value)}
          />
        </div>
        <div style={{ marginTop: '10px', textAlign: 'center' }}>Test rotation invariance</div>
      </Grid>
    </Grid>
  );
}

KernelInspectorDrawingInput.propTypes = {
  kernels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
  shape: PropTypes.arrayOf(PropTypes.number).isRequired,
  onUpdate: PropTypes.func,
};

export default KernelInspectorDrawingInput;

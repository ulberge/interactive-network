import React, { useState, useCallback, useRef, memo } from 'react';
import Grid from '@material-ui/core/Grid';
import EditableCanvas from '../UI/EditableCanvas';
import Array2DView from '../UI/Array2DView';
import Array2DViewList from '../UI/Array2DViewList';
import SmartCanvas from '../../js/smartcanvas';
import { getTest0 } from '../../js/box';

const w = 21;
const h = 21;
const canvasScale = 6;
const scale = 8;

const getScore = getTest0();

const DrawSmartCanvas = memo(function GaborDrawingInput(props) {
  const smartCanvasRef = useRef(new SmartCanvas(w, h));

  const [ state, setState ] = useState({
    marks: [],
    strokeWeight: 1,
    debug: {}
  });

  const onNewMark = useCallback(newMark => {
    const scaledMark = newMark.map(pt => [pt[0] / canvasScale, pt[1] / canvasScale]);
    smartCanvasRef.current.addStroke(scaledMark);
    const score = getScore(smartCanvasRef.current.lineInfo);
    console.log(score);

    const debug = {
      lines: smartCanvasRef.current.lineInfo.getAllLines(),
      lineIds: smartCanvasRef.current.lineInfo.getAllLineIds().map(row => row.map(v => v === null ? -1 : (v / smartCanvasRef.current.lineInfo.refs.lines.end))),
      lineEnds: smartCanvasRef.current.lineInfo.getAllLineEnds(),
      lineEndIds: smartCanvasRef.current.lineInfo.getAllLineEndIds().map(row => row.map(v => v === null ? -1 : (v / smartCanvasRef.current.lineInfo.refs.lineEnds.end))),
      corners: smartCanvasRef.current.lineInfo.getAllCorners(),
      cornerIds: smartCanvasRef.current.lineInfo.getAllCornerIds().map(row => row.map(v => v === null ? -1 : (v / smartCanvasRef.current.lineInfo.refs.corners.end))),
    };

    setState(state => ({ ...state, marks: [...state.marks, newMark], debug }));
  }, []);

  return (
    <Grid container spacing={1} style={{ position: 'relative' }}>
      <Grid item className="bordered-canvas" xs={6}>
        <EditableCanvas
          shape={[w * canvasScale, h * canvasScale]}
          marks={state.marks}
          strokeWeight={state.strokeWeight}
          scale={4}
          onNewMark={onNewMark}
        />
      </Grid>
      <Grid item className="bordered-canvas" xs={4}>
        <Grid container spacing={4}>
          <Grid item xs={6}>
            <Array2DView imgArr={state.debug.lines} scale={scale} />
          </Grid>
          <Grid item xs={6}>
            <Array2DView imgArr={state.debug.lineIds} scale={scale} withColor={true} />
          </Grid>
        </Grid>
        <Grid container spacing={4}>
          <Grid item xs={6}>
            <Array2DView imgArr={state.debug.lineEnds} scale={scale} />
          </Grid>
          <Grid item xs={6}>
            <Array2DView imgArr={state.debug.lineEndIds} scale={scale} withColor={true} />
          </Grid>
        </Grid>
        <Grid container spacing={4}>
          <Grid item xs={6}>
            <Array2DView imgArr={state.debug.corners} scale={scale} />
          </Grid>
          <Grid item xs={6}>
            <Array2DView imgArr={state.debug.cornerIds} scale={scale} withColor={true} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
});

export default DrawSmartCanvas;

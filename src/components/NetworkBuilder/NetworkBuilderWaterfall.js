import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Array2DView from '../UI/Array2DView';
import Array2DNumView from '../UI/Array2DNumView';

const size = 80;
const placeholderStyles = {
  fontSize: '16px',
  width: (size + 2) + 'px',
  height: (size + 2 + 4) + 'px',
  textAlign: 'center',
  lineHeight: (size + 2) + 'px',
};
const buttonStyles = {
  border: 0,
  margin: 0,
  padding: 0,
  cursor: 'pointer',
  background: 'transparent'
};

function scale3DArray(arr3D) {
  let maxPos = Math.max(...arr3D.flat().flat());
  const scale = maxPos || 1;

  // scale all values by this number
  const arr3DScaled = arr3D.map(arr2D => arr2D.map(arr => arr.map(val => val / scale)));
  return arr3DScaled;
}

function NetworkBuilderWaterfall(props) {
  const { networkData, onSelectKernel, zoomSelection } = props;
  // console.log('nd', networkData);

  const [ outputSelection, setOutputSelection ] = useState(null);

  if (!networkData) {
    return null;
  }

  let arrs;
  if (zoomSelection) {
    console.log(zoomSelection);
    arrs = networkData.network.getScopedOutput(zoomSelection).map(arr => arr.tolist());
  } else {
    arrs = networkData.network.arrs.slice(1).map(arr => arr.arr.tolist());
  }

  let debugData;
  if (outputSelection) {
    const { layerIndex, filterIndex } = outputSelection;
    if (layerIndex < arrs.length && filterIndex < arrs[layerIndex].length) {
      debugData = arrs[layerIndex][filterIndex];
    }
  }

  const { layerInfos, shadows } = networkData.network;
  // the image is inserted horizontally to start
  let dir = 'hor';
  let colIndex = -1;
  let table = [];
  let row = [];
  table.push(row);
  let inputs = null;
  for (let i = 0; i < layerInfos.length; i += 1) {
    const isFinalLayer = (i === (layerInfos.length - 1)) ? true : false;
    const layerInfo = layerInfos[i];
    const outputsRaw = arrs[i];
    let outputs = outputsRaw;
    if (i !== 0) {
      // normalize outputs across this layer, but skip for 0 because we do not show
      outputs = scale3DArray(outputs);
    }
    // const outputs = arrs[i + 1].arr.tolist();
    const kernelShadows = shadows[i];

    if (layerInfo.type === 'conv2d') {
      if (dir === 'hor') {
        // add new column to row
        colIndex += 1;
        // add filters as columns outputting vertically
        const el = (
          <Grid container spacing={1} className={ isFinalLayer ? 'final-layer' : '' }>
            <Grid item className="extra-space">
              <Grid container direction="column" spacing={1}>
                <Grid item>
                  <div style={placeholderStyles}></div>
                </Grid>
                { layerInfo.filters[0].map(() => (
                  <Grid item>
                    <div style={placeholderStyles}>→</div>
                  </Grid>
                )) }
              </Grid>
            </Grid>
            { layerInfo.filters.map((kernels, filterIndex) => (
              <Grid item>
                <Grid container direction="column" spacing={1}>
                  <Grid item className="output-arr shadow-arr">
                    <Array2DView imgArr={kernelShadows[filterIndex]} fixedWidth={size} />
                  </Grid>
                  { kernels.map((kernel, kernelIndex) => (
                    <Grid item>
                      {
                        (i === 0)
                        ? <Array2DView imgArr={kernel} fixedWidth={size} />
                        : (
                          <button style={buttonStyles} type="button" onClick={() => onSelectKernel(i, filterIndex, kernelIndex)}>
                            <Array2DView imgArr={kernel} fixedWidth={size} />
                          </button>
                        )
                      }
                    </Grid>
                  )) }
                  {
                    (i === 0)
                    ? null
                    : (
                      <Grid item className="output-arr">
                        <button style={buttonStyles} type="button" onClick={() => setOutputSelection({ layerIndex: i, filterIndex})}>
                          <Array2DView imgArr={outputs[filterIndex]} fixedWidth={size} normalize={false} />
                        </button>
                      </Grid>
                    )
                  }
                </Grid>
              </Grid>
            ))}
          </Grid>
        );
        row.push(el);

        // set input direction to vertical
        dir = 'vert';
      } else if (dir === 'vert') {
        // input comes from above
        // add new row and shift to current col
        row = new Array(colIndex).fill(null);
        table.push(row);

        // add filters as rows outputting horizontally
        const el = (
          <Grid container direction="column" spacing={1} className={ isFinalLayer ? 'final-layer' : '' }>
            <Grid item className="extra-space">
              <Grid container spacing={1}>
                <Grid item>
                  <div style={placeholderStyles}></div>
                </Grid>
                { layerInfo.filters[0].map(() => (
                  <Grid item>
                    <div style={placeholderStyles}>↓</div>
                  </Grid>
                )) }
                <Grid item>
                  <div style={placeholderStyles}></div>
                </Grid>
              </Grid>
            </Grid>
            { layerInfo.filters.map((kernels, filterIndex) => (
              <Grid item>
                <Grid container spacing={1}>
                  <Grid item className="output-arr shadow-arr">
                    <Array2DView imgArr={kernelShadows[filterIndex]} fixedWidth={size} />
                  </Grid>
                  { kernels.map((kernel, kernelIndex) => (
                    <Grid item>
                      <button style={buttonStyles} type="button" onClick={() => onSelectKernel(i, filterIndex, kernelIndex)}>
                        <Array2DView imgArr={kernel} fixedWidth={size} />
                      </button>
                    </Grid>
                  )) }
                  <Grid item className="output-arr">
                    <button style={buttonStyles} type="button" onClick={() => setOutputSelection({ layerIndex: i, filterIndex})}>
                      <Array2DView imgArr={outputs[filterIndex]} fixedWidth={size} normalize={false} />
                    </button>
                  </Grid>
                </Grid>
              </Grid>
            ))}
          </Grid>
        );
        row.push(el);

        // set input direction to horizontal
        dir = 'hor';
      }

      // record input length for any future pool layers
      inputs = layerInfo.filters;
    } else if (layerInfo.type === 'maxPool2d') {
      // always continue same direction with pool
      if (dir === 'hor') {
        // add new column to row
        colIndex += 1;
        // add filters as columns outputting horizontally
        const el = (
          <Grid container direction="column" spacing={1} className={ isFinalLayer ? 'final-layer' : '' }>
            <Grid item className="extra-space">
              <div style={placeholderStyles}></div>
            </Grid>
            { inputs.map((kernels, filterIndex) => (
              <Grid item>
                <Grid container spacing={1}>
                  <Grid item>
                    <div style={placeholderStyles}>▷</div>
                  </Grid>
                  <Grid item className="output-arr">
                    <button style={buttonStyles} type="button" onClick={() => setOutputSelection({ layerIndex: i, filterIndex})}>
                      <Array2DView imgArr={outputs[filterIndex]} fixedWidth={size} normalize={false} />
                    </button>
                  </Grid>
                </Grid>
              </Grid>
            ))}
          </Grid>
        );
        row.push(el);
      } else if (dir === 'vert') {
        // input comes from above
        // add new row and shift to current col
        row = new Array(colIndex).fill(null);
        table.push(row);

        // add filters as rows outputting vertically
        const el = (
          <Grid container spacing={1} className={ isFinalLayer ? 'final-layer' : '' }>
            <Grid item className="extra-space">
              <div style={placeholderStyles}></div>
            </Grid>
            { inputs.map((kernels, filterIndex) => (
              <Grid item>
                <Grid container direction="column" spacing={1}>
                  <Grid item>
                    <div style={placeholderStyles}>▽</div>
                  </Grid>
                  <Grid item className="output-arr">
                    <button style={buttonStyles} type="button" onClick={() => setOutputSelection({ layerIndex: i, filterIndex})}>
                      <Array2DView imgArr={outputs[filterIndex]} fixedWidth={size} normalize={false} />
                    </button>
                  </Grid>
                </Grid>
              </Grid>
            ))}
          </Grid>
        );
        row.push(el);
      }
    }
  }

  return (
    <div className="waterfall">
      {/*<table className="compact">*/}
      <table className="">
        <tbody>
          { table.map(row => (
            <tr>
              { row.map(el => (
                <td valign="top">{ el }</td>
              )) }
            </tr>
          )) }
        </tbody>
      </table>
      {
        debugData && zoomSelection
        ?
          <button style={buttonStyles} type="button" onClick={() => setOutputSelection(null)}>
            <Array2DNumView imgArr={debugData} style={{ position: 'absolute', zIndex: 2, top: 0, right: 0, margin: '8px' }} />
          </button>
        : null
      }

    </div>
  );
}

NetworkBuilderWaterfall.propTypes = {
  networkData: PropTypes.object,
  onSelectKernel: PropTypes.func.isRequired,
  zoomSelection: PropTypes.object,
};

export default NetworkBuilderWaterfall;

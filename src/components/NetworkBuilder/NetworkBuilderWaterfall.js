import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Array2DView from '../UI/Array2DView';

const size = 50;
const placeholderStyles = {
  fontSize: '16px',
  width: (size + 2) + 'px',
  height: (size + 2) + 'px',
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

function NetworkBuilderWaterfall(props) {
  const { networkData, onSelectKernel, zoomSelection } = props;

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
  const { layerInfos, shadows } = networkData.network;
  // the image is inserted horizontally to start
  let dir = 'hor';
  let colIndex = -1;
  let table = [];
  let row = [];
  table.push(row);
  let inputs = null;
  for (let i = 0; i < layerInfos.length; i += 1) {
    const layerInfo = layerInfos[i];
    const outputs = arrs[i];
    // const outputs = arrs[i + 1].arr.tolist();
    const kernelShadows = shadows[i];

    if (layerInfo.type === 'conv2d') {
      if (dir === 'hor') {
        // add new column to row
        colIndex += 1;
        // add filters as columns outputting vertically
        const el = (
          <Grid container spacing={1}>
            <Grid item>
              <Grid container direction="column" spacing={1}>
                <Grid item>
                  <div style={placeholderStyles}></div>
                </Grid>
                { layerInfo.filters[0].map(() => (
                  <Grid item>
                    <div style={placeholderStyles}>→</div>
                  </Grid>
                )) }
                <Grid item>
                  <div style={placeholderStyles}></div>
                </Grid>
              </Grid>
            </Grid>
            { layerInfo.filters.map((kernels, filterIndex) => (
              <Grid item>
                <Grid container direction="column" spacing={1}>
                  <Grid item className="output-arr">
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
                  <Grid item className="output-arr">
                    <Array2DView imgArr={outputs[filterIndex]} fixedWidth={size} />
                  </Grid>
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
          <Grid container direction="column" spacing={1}>
            <Grid item>
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
                  <Grid item className="output-arr">
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
                    <Array2DView imgArr={outputs[filterIndex]} fixedWidth={size} />
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
          <Grid container direction="column" spacing={1}>
            { layerInfo.filters.map((kernels, filterIndex) => (
              <Grid item>
                <Grid container spacing={1}>
                  <Grid item>
                    <div style={placeholderStyles}>▷</div>
                  </Grid>
                  <Grid item className="output-arr">
                    <Array2DView imgArr={outputs[filterIndex]} fixedWidth={size} />
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
          <Grid container spacing={1}>
            <Grid item>
              <div style={placeholderStyles}></div>
            </Grid>
            { inputs.map((kernels, filterIndex) => (
              <Grid item>
                <Grid container direction="column" spacing={1}>
                  <Grid item>
                    <div style={placeholderStyles}>▽</div>
                  </Grid>
                  <Grid item className="output-arr">
                    <Array2DView imgArr={outputs[filterIndex]} fixedWidth={size} />
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
    <table>
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
  );
}

NetworkBuilderWaterfall.propTypes = {
  networkData: PropTypes.object,
  onSelectKernel: PropTypes.func.isRequired,
  zoomSelection: PropTypes.object,
};

export default NetworkBuilderWaterfall;

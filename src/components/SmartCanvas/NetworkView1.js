import React, { useState } from 'react';
import PropTypes from 'prop-types';
import SmartCanvasColorCodedView from './ColorCodedView';
import Grid from '@material-ui/core/Grid';
import SmartCanvasActChart from './ActChart';
import { getShadows } from '../../js/networkShadow';

const LayerView = props => {
  console.log('render LayerView');
  const [ pt, setPt ] = useState(null);

  // const acts = useMemo(() => {
  //   const { lineInfo, pt } = state;
  //   if (lineInfo && pt) {
  //     return lineInfo.getChannelsAt(pt);
  //   }
  //   return null;
  // }, [state]);

  const { shadows, output } = props;
  const { _ids: ids, _max: max } = output;
  let acts;
  if (pt) {
    const { x, y } = pt;
    acts = output.arr.slice(null, [y, y + 1], [x, x + 1]).reshape(output.arr.shape[0]).tolist();
  }

  return (
    <Grid container spacing={1} className="bordered-canvas">
      <Grid item>
        <SmartCanvasColorCodedView kernels={shadows} scale={2} ids={ids.tolist()} max={max.tolist()} onSelect={setPt} />
      </Grid>
      <Grid item xs={3}>
        <SmartCanvasActChart kernels={shadows} acts={acts} numKernels={9} />
        {/*<SmartCanvasKernelOverlays kernels={shadows} imgArr={state.imgArr} acts={} pt={pt} numKernels={9} scale={8.5} />*/}
      </Grid>
    </Grid>
  );
}

LayerView.propTypes = {
  shadows: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
  output: PropTypes.object.isRequired,
};

const NetworkView1 = props => {
  console.log('render NetworkView1');
  const shadowsByLayer = getShadows(props.network.layerInfos);
  const layerViews = [];
  for (let i = 0; i < props.network.layerInfos.length; i += 1) {
    const layer = props.network.layers[i];
    let shadows = shadowsByLayer[i];
    if (i === 0) {
      shadows = layer._rawFilters.map(f => f[0]);
    }
    layerViews.push(<LayerView key={i} shadows={shadows} output={layer.output} />);
  }

  return layerViews;
};

NetworkView1.propTypes = {
  network: PropTypes.object.isRequired,
};

export default NetworkView1;

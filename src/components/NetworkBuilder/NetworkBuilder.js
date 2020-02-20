import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { getAllKernels } from '../../js/kernel';
import { getNetworkSettings } from './house';
import NetworkBuilderDrawingInput from './NetworkBuilderDrawingInput';
import NetworkBuilderWaterfall from './NetworkBuilderWaterfall';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import NetworkBuilderEditKernelDialog from './NetworkBuilderEditKernelDialog';
import NetworkLoader from './NetworkLoader';
import NetworkBuilderEditNetworkDialog from './NetworkBuilderEditNetworkDialog';

const last = localStorage.getItem('lastNetworkName');
const lastNetworkSettings = JSON.parse(localStorage.getItem(last));
const defaultNetworkSettings = getNetworkSettings();

function NetworkBuilder(props) {
  const { kernelSettings } = props;

  // store custom layer info
  const [ networkSettings, setNetworkSettings ] = useState(lastNetworkSettings || defaultNetworkSettings);
  // store network data (results of drawing)
  const [ networkData, setNetworkData ] = useState(null);
  // manage selecting an area in the drawing input
  const [ zoomSelection, setZoomSelection ] = useState(null);
  // manage edit overlay
  const [ editOpen, setEditOpen ] = useState(false);
  const [ editNetworkOpen, setEditNetworkOpen ] = useState(false);
  const [ editSelection, setEditSelection ] = useState(null);

  // Update the kernels on change to the kernel settings
  const { lambda, sigma, windowSize } = kernelSettings;
  const kernels = useMemo(() => {
    // get all kernels with proper adjustment, filtered to kernels used by this network
    return getAllKernels(windowSize, lambda, sigma, networkSettings.kernelFilter);
  }, [ lambda, sigma, windowSize, networkSettings.kernelFilter ]);

  // Update the network settings on change to the settings
  const layerInfos = useMemo(() => {
    const layerInfos = [
      {
        filters: kernels.map(k => [k]),
        kernelSize: kernels[0].length,
        type: 'conv2d'
      },
    ];
    layerInfos.push(...networkSettings.layerInfos);
    return layerInfos;
  }, [ networkSettings, kernels ]);

  const handleOpenEdit = (layerIndex, filterIndex, kernelIndex) => {
    console.log(layerIndex, filterIndex, kernelIndex);
    setEditOpen(true);
    setEditSelection({ layerIndex, filterIndex, kernelIndex });
  };

  const handleCloseEdit = update => {
    setEditOpen(false);
    if (update) {
      // update network settings async to make close window faster
      setTimeout(() => {
        const { layerIndex, filterIndex, kernelIndex } = editSelection;
        const filter = networkSettings.layerInfos[layerIndex - 1].filters[filterIndex];
        filter[kernelIndex] = update;
        setNetworkSettings({ ...networkSettings });
      }, 0);
    }
  };

  const handleCloseEditNetwork = update => {
    setEditNetworkOpen(false);
    if (update) {
      // update network settings async to make close window faster
      setTimeout(() => {
        setNetworkSettings(update);
      }, 0);
    }
  };

  const selectedKernel = useMemo(() => {
    if (!editSelection) {
      return null;
    }
    const { layerIndex, filterIndex, kernelIndex } = editSelection;
    const { filters } = networkSettings.layerInfos[layerIndex - 1];
    const kernel = filters[filterIndex][kernelIndex];
    return kernel;
  }, [editSelection, networkSettings]);

  const onLoad = networkSettings => {
    setNetworkSettings(networkSettings || defaultNetworkSettings);
  };

  const maxScore = useMemo(() => {
    if (networkData) {
      const finalArr = networkData.network.arrs[networkData.network.arrs.length - 1].arr.tolist();
      const max = Math.max(...(finalArr.flat().flat()));
      return max.toFixed(2);
    }
    return 0;
  }, [networkData]);

  return (
    <div>
      <h2>
        <span>Network Builder</span>&nbsp;&nbsp;
      </h2>
      <Grid container>
        <Grid item xs={5}>
          <NetworkBuilderDrawingInput
            shape={[150, 150]}
            layerInfos={layerInfos}
            onUpdate={setNetworkData}
            onSelect={setZoomSelection}
          />
          { maxScore }
          <div style={{ marginTop: '40px' }}>
            <NetworkLoader networkSettings={networkSettings} onLoad={onLoad} />
          </div>
          <div style={{ marginTop: '40px' }}>
            <Button onClick={() => setEditNetworkOpen(!editNetworkOpen)} color="primary" variant="contained">
              Set Network Shape
            </Button>
            <NetworkBuilderEditNetworkDialog open={editNetworkOpen} networkSettings={networkSettings} onClose={handleCloseEditNetwork} />
          </div>
        </Grid>
        <Grid item xs={7}>
          <NetworkBuilderWaterfall
            networkData={networkData}
            onSelectKernel={handleOpenEdit}
            zoomSelection={zoomSelection}
          />
        </Grid>
        <Grid item xs={12}>
          <div id="saved-drawings" style={{ maxWidth: '800px' }}></div>
        </Grid>
      </Grid>
      <NetworkBuilderEditKernelDialog open={editOpen} onClose={handleCloseEdit} kernel={selectedKernel} />
    </div>
  );
}

NetworkBuilder.propTypes = {
  kernelSettings: PropTypes.object.isRequired
};

export default NetworkBuilder;

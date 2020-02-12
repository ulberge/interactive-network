import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { getKernels } from '../../js/kernel';
import { getLayerInfos } from './box';
import NetworkBuilderDrawingInput from './NetworkBuilderDrawingInput';
import NetworkBuilderWaterfall from './NetworkBuilderWaterfall';
import Grid from '@material-ui/core/Grid';
import NetworkBuilderEditKernelDialog from './NetworkBuilderEditKernelDialog';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

const networkNamesKey = 'networkNames';
let networkNames = JSON.parse(localStorage.getItem(networkNamesKey));
console.log(networkNames);
let networkName;
if (networkNames && networkNames.length > 0) {
  networkName = networkNames[networkNames.length - 1];
}
const storedLayerInfos = JSON.parse(localStorage.getItem(networkName));
const defaultLayerInfos = storedLayerInfos ? storedLayerInfos : getLayerInfos();

function NetworkBuilder(props) {
  const { kernelSettings } = props;

  // store custom layer info
  const [ networkSettings, setNetworkSettings ] = useState({ layerInfos: defaultLayerInfos });
  // store network data (results of drawing)
  const [ networkData, setNetworkData ] = useState(null);
  // manage selecting an area in the drawing input
  const [ zoomSelection, setZoomSelection ] = useState(null);
  // manage edit overlay
  const [ editOpen, setEditOpen ] = useState(false);
  const [ editSelection, setEditSelection ] = useState(null);

  // Update the kernels on change to the kernel settings
  const { numComponents, lambda, sigma, windowSize, types } = kernelSettings;
  const kernels = useMemo(() => {
    return getKernels(windowSize, 2 ** numComponents, lambda, sigma, types);
  }, [ numComponents, lambda, sigma, windowSize, types ]);

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
        setNetworkSettings({
          layerInfos: networkSettings.layerInfos
        });
        if (networkName) {
          localStorage.setItem(networkName, JSON.stringify(networkSettings.layerInfos));
        }
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

  const saveNetwork = () => {
    networkName = document.getElementById('network-name').value;
    if (!networkNames) {
      networkNames = [];
    }
    if (!networkNames.includes(networkName)) {
      networkNames.push(networkName);
      localStorage.setItem(networkNamesKey, JSON.stringify(networkNames));
    }
    localStorage.setItem(networkName, JSON.stringify(networkSettings.layerInfos));
  };

  return (
    <div>
      <h2>
        <span>Network Builder</span>&nbsp;&nbsp;
      </h2>
      <Grid container>
        <Grid item>
          <NetworkBuilderDrawingInput
            shape={[150, 150]}
            layerInfos={layerInfos}
            onUpdate={setNetworkData}
            onSelect={setZoomSelection}
          />
          <div style={{ margin: '10px'}}>
            <TextField id="network-name" label="Network Name" defaultValue={networkName ? networkName : ''} />
            <Button onClick={saveNetwork} color="primary" aria-label="save network" variant="contained">Save</Button>
          </div>
        </Grid>
        <Grid item>
          <NetworkBuilderWaterfall
            networkData={networkData}
            onSelectKernel={handleOpenEdit}
            zoomSelection={zoomSelection}
          />
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

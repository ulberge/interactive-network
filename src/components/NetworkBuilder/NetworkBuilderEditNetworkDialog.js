import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Dialog from '@material-ui/core/Dialog';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import nj from 'numjs';

function getLayerInfos(networkShape, networkSettings) {
  const layerStrs = networkShape.split(',');

  // get current conv layer filters
  const convLayers = networkSettings.layerInfos.filter(info => info.type === 'conv2d');
  let convLayerIndex = 0;
  const layerInfos = layerStrs.map(str => {
    if (str[0] === 'p') {
      const poolSize = parseInt(str[1]);
      return {
        type: 'maxPool2d',
        poolSize: poolSize
      }
    } else {
      const layerInfo = {
        type: 'conv2d',
        kernelSize: 9
      };

      // get filters
      const [ numFilters, numKernels ] = str.split('x').map(v => parseInt(v));
      const filters = [];
      let oldFilters = [];
      if (convLayerIndex < convLayers.length) {
        oldFilters = convLayers[convLayerIndex].filters;
        convLayerIndex += 1;
      }
      for (let i = 0; i < numFilters; i += 1) {
        const filter = [];
        for (let j = 0; j < numKernels; j += 1) {
          let kernel;
          if (i < oldFilters.length && j < oldFilters[0].length) {
            // set kernel from old kernel
            kernel = oldFilters[i][j];
          } else {
            // make new kernel
            kernel = nj.zeros([9, 9]).tolist();
          }
          filter.push(kernel);
        }
        filters.push(filter);
      }
      layerInfo.filters = filters;
      return layerInfo;
    }
  });
  return layerInfos;
}

function getNetworkShape(networkSettings) {
  return networkSettings.layerInfos.map(info => {
    if (info.type === 'conv2d') {
      const numFilters = info.filters.length;
      const numKernels = numFilters ? info.filters[0].length : 0;
      return numFilters + 'x' + numKernels;
    } else {
      return 'p' + info.poolSize;
    }
  }).join(',');
}

function NetworkBuilderEditNetworkDialog(props) {
  const { onClose, networkSettings, open } = props;
  const [ networkShape, setNetworkShape ] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const networkShape = getNetworkShape(networkSettings);
    setNetworkShape(networkShape);
  }, [ networkSettings ]);

  const handleClose = () => {
    onClose();
  };

  const handleSave = () => {
    const layerInfos = getLayerInfos(networkShape, networkSettings);
    // const kernelInfos = [
    //   {
    //     type: 0,
    //     angles: [0, 0.5, 0.25, 0.75],
    //   },
    //   {
    //     type: 2,
    //     angles: [0, 0.25, 0.5, 1, 1.5],
    //   },
    //   {
    //     type: 3,
    //     angles: [0, 1],
    //   },
    //   {
    //     type: 7,
    //     angles: [0, 0.75, 1, 1.75],
    //   },
    // ];
    // const kernelInfos = [ // Salal
    //   {
    //     type: 0,
    //     angles: [0, 0.5, 0.25, 0.75],
    //   },
    //   {
    //     type: 1, // Tip
    //     angles: [0],
    //   },
    //   // {
    //   //   type: 3, // T
    //   //   angles: [1.5],
    //   // },
    //   {
    //     type: 4, // cross
    //     angles: [0],
    //   },
    //   {
    //     type: 5, // Y
    //     angles: [1],
    //   },
    //   {
    //     type: 7,
    //     angles: [0, 0.75, 1, 1.25, 1.5, 1.75],
    //   },
    // ];
    const kernelInfos = null;
    // const kernelInfos = [
    //   {
    //     type: 0,
    //     angles: [0, 0.5],
    //   },
    //   {
    //     type: 2,
    //     angles: [0, 0.5, 1, 1.5],
    //   },
    // ];
    // const kernelInfos = [
    //   {
    //     type: 0,
    //     angles: [0.5],
    //   },
    // ];
    // const kernelInfos = [ // HMAX
    //   {
    //     type: 0,
    //     angles: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1],
    //   },
    // ];
    let kernelFilter = null;
    if (kernelInfos) {
      kernelFilter = [];
      kernelInfos.forEach(d => d.angles.forEach(angle => kernelFilter.push(d.type + '_' + (angle * Math.PI).toFixed(2))));
    }
    const update = { kernelFilter, layerInfos };
    onClose(update);
  };

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="edit-kernel-dialog-title"
      open={open}
    >
      <DialogTitle id="edit-kernel-dialog-title">Edit Kernel</DialogTitle>
      <DialogContent>
        <TextField
          ref={textareaRef}
          id="outlined-multiline-static"
          label="Kernel"
          autoFocus
          margin="dense"
          fullWidth
          multiline
          rows="12"
          onChange={event => setNetworkShape(event.target.value)}
          value={networkShape}
          variant="outlined"
          style={{ minWidth: '400px' }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Set
        </Button>
      </DialogActions>
    </Dialog>
  );
}

NetworkBuilderEditNetworkDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  networkSettings: PropTypes.object.isRequired
};

export default NetworkBuilderEditNetworkDialog;

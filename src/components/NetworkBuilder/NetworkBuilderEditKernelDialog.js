import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Dialog from '@material-ui/core/Dialog';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import nj from 'numjs';

function format(kernelStr) {
  return kernelStr.replace(/],/g, '],\n').replace(/]]/g, ']\n]').replace(/\[\[/g, '[\n[').replace(/,(?!-)(?!\n)/g, ', ');
}

function rY(arr2d) {
  arr2d.forEach(row => row.reverse());
  return arr2d;
}

function rX(arr2d) {
  arr2d.reverse();
  return arr2d;
}

function rot(arr2d) {
  return nj.rot90(nj.array(arr2d)).tolist();
}

function sP(amt, arr2d) {
  return arr2d.map(row => row.map(v => v > 0 ? v * amt : v));
}

function sN(amt, arr2d) {
  return arr2d.map(row => row.map(v => v < 0 ? v * amt : v));
}

function dX(amt, arr2d) {
  const empty = nj.zeros([9, 9]);
  if (amt >= 0) {
    for (let y = 0; y < 9; y += 1) {
      for (let x = 0; x < (9 - amt); x += 1) {
        empty.set(y, x + amt, arr2d[y][x]);
      }
    }
  } else {
    for (let y = 0; y < 9; y += 1) {
      for (let x = -amt; x < 9; x += 1) {
        empty.set(y, x + amt, arr2d[y][x]);
      }
    }
  }
  return empty.tolist();
}

function dY(amt, arr2d) {
  const empty = nj.zeros([9, 9]);
  if (amt >= 0) {
    for (let y = 0; y < (9 - amt); y += 1) {
      for (let x = 0; x < 9; x += 1) {
        empty.set(y + amt, x, arr2d[y][x]);
      }
    }
  } else {
    for (let y = -amt; y < 9; y += 1) {
      for (let x = 0; x < 9; x += 1) {
        empty.set(y + amt, x, arr2d[y][x]);
      }
    }
  }
  return empty.tolist();
}

function NetworkBuilderEditKernelDialog(props) {
  const { onClose, kernel, open } = props;
  const [ kernelText, setKernelText ] = useState(null);
  const [ errorProps, setErrorProps ] = useState({});
  const textareaRef = useRef(null);

  useEffect(() => {
    setKernelText(format(JSON.stringify(kernel)));
  }, [kernel]);

  useEffect(() => {
    setErrorProps({});
  }, [open]);

  const handleClose = () => {
    onClose();
  };

  const handleSave = () => {
    // validate
    try {
      let update = eval(kernelText);

      if (!update) {
        update = nj.zeros([9, 9]).tolist();
      }

      if (update.flat().length !== 81) {
        setErrorProps({
          error: true,
          helperText: 'Invalid kernel: Length === ' + update.flat().length
        });
        return;
      }
      onClose(update);
    } catch (e) {
      setErrorProps({
        error: true,
        helperText: e.message
      });
    }
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
          {...errorProps}
          ref={textareaRef}
          id="outlined-multiline-static"
          label="Kernel"
          autoFocus
          margin="dense"
          fullWidth
          multiline
          rows="12"
          onChange={event => setKernelText(event.target.value)}
          value={kernelText}
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

NetworkBuilderEditKernelDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  kernel: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
};

export default NetworkBuilderEditKernelDialog;

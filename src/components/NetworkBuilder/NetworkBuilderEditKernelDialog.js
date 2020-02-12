import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Dialog from '@material-ui/core/Dialog';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

function NetworkBuilderEditKernelDialog(props) {
  const { onClose, kernel, open } = props;
  const [ kernelText, setKernelText ] = useState(null);
  const [ errorProps, setErrorProps ] = useState({});
  const textareaRef = useRef(null);

  useEffect(() => {
    setKernelText(JSON.stringify(kernel))
  }, [kernel]);

  const handleClose = () => {
    onClose();
  };

  const handleSave = () => {
    // validate
    try {
      const update = JSON.parse(kernelText);
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
          rows="9"
          onChange={event => setKernelText(event.target.value)}
          value={kernelText}
          variant="outlined"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
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

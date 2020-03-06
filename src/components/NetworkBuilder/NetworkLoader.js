import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';


const networkNamesKey = 'networkNames';
const lastNetworkNameKey = 'lastNetworkName';

function NetworkLoader(props) {
  const initNetworkName = localStorage.getItem(lastNetworkNameKey) || 'Default';
  const initNetworkNames = JSON.parse(localStorage.getItem(networkNamesKey)) || [];

  const [ networkName, setNetworkName ] = useState(initNetworkName);
  const [ networkNames, setNetworkNames ] = useState(initNetworkNames);
  const [ saveNetworkName, setSaveNetworkName ] = useState(networkName);

  // save network names on update
  useEffect(() => {
    localStorage.setItem(networkNamesKey, JSON.stringify(networkNames));
  }, [ networkNames ]);

  // save last network name on selection and update save network name
  useEffect(() => {
    localStorage.setItem(lastNetworkNameKey, networkName);
    setSaveNetworkName(networkName);
  }, [ networkName ]);

  // auto save
  useEffect(() => {
    localStorage.setItem('autosave4', localStorage.getItem('autosave3'));
    localStorage.setItem('autosave3', localStorage.getItem('autosave2'));
    localStorage.setItem('autosave2', localStorage.getItem('autosave'));
    localStorage.setItem('autosave', JSON.stringify(props.networkSettings));
  }, [ props.networkSettings ]);

  const load = newNetworkName => {
    setNetworkName(newNetworkName);
    const networkSettings = JSON.parse(localStorage.getItem(newNetworkName));
    props.onLoad(networkSettings);
  };

  const onClickSave = value => {
    // if no record, create
    const newNetworkName = document.getElementById('network-name').value;
    if (newNetworkName.length === 0) {
      // dont save on empty string
      return;
    }

    // if this name doesn't exist, add to records
    if (!networkNames.includes(newNetworkName)) {
      setNetworkNames([ newNetworkName, ...networkNames ]);
    }

    // save data
    localStorage.setItem(newNetworkName, JSON.stringify(props.networkSettings));

    // update to be this name
    load(newNetworkName);
  }

  return (
    <Grid container direction="column" spacing={1} alignItems="center">
      <Grid item style={{ width: '300px' }}>
        <FormControl>
          <InputLabel id="load-label">Load Network</InputLabel>
          <Select
            style={{ width: '200px' }}
            labelId="load-label"
            id="load-select"
            value={networkName}
            onChange={e => load(e.target.value)}
          >
            <MenuItem value={'Default'}>Default</MenuItem>
            <MenuItem value={'autosave'}>autosave</MenuItem>
            <MenuItem value={'autosave2'}>autosave2</MenuItem>
            <MenuItem value={'autosave3'}>autosave3</MenuItem>
            <MenuItem value={'autosave4'}>autosave4</MenuItem>
            { networkNames.map(name => <MenuItem key={name} value={name}>{ name }</MenuItem>) }
          </Select>
        </FormControl>
      </Grid>
      <Grid item style={{ width: '300px' }}>
        <Grid container alignItems="center" style={{ marginTop: '20px' }}>
          <Grid item>
            <TextField label="Save Network" id="network-name" value={saveNetworkName !== 'Default' ? saveNetworkName : ''} InputLabelProps={{ shrink: true }} onChange={e => setSaveNetworkName(e.target.value)} />
          </Grid>
          <Grid item>
            <Button onClick={onClickSave} color="primary" aria-label="save network" variant="contained" style={{ marginLeft: '20px' }}>Save</Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

NetworkLoader.propTypes = {
  onLoad: PropTypes.func.isRequired,
  networkSettings: PropTypes.object.isRequired
};

export default NetworkLoader;

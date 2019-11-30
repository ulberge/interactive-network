import React, { Component } from 'react';
import AddIcon from '@material-ui/icons/Add';
import IconButton from '@material-ui/core/IconButton';

export default class NewLayer extends Component {

  addNeuron() {
    console.log('add layer and neuron');
  }

  render() {
    return (
      <div className="layer">
        <IconButton aria-label="add" onClick={() => this.addNeuron()}>
          <AddIcon />
        </IconButton>
      </div>
    );
  }
}

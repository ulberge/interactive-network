import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import IconButton from '@material-ui/core/IconButton';
import GradientIcon from '@material-ui/icons/Gradient';

export default class Layer extends Component {
  selectNeuron(i) {
    const { selectNeuron } = this.props;
    console.log('select neuron ' + i);
    selectNeuron(i);
  }

  addNeuron() {
    console.log('add neuron');
  }

  render() {
    const { layer, selectedIndex } = this.props;
    const els = [];

    if (layer && layer.kernel) {
      const numNeurons = layer.kernel.shape[3];

      for (let i = 0; i < numNeurons; i += 1) {
        els.push((
                  <IconButton key={i} color={selectedIndex === i ? 'secondary' : 'default'} className={'neuron ' + (selectedIndex === i ? 'selected' : '')} onClick={() => this.selectNeuron(i)}>
                    <GradientIcon />
                  </IconButton>));
      }
    }

    return (
        <div className="layer">
          {els.length > 0 ? els : null}
          <IconButton aria-label="add" onClick={() => this.addNeuron()}>
            <AddIcon />
          </IconButton>
        </div>
    );
  }
}

import React, { Component } from 'react';

import Filters from './Filters';

export default class NeuronInfo extends Component {
  render() {
    const { layer, neuronIndex, layerIndex } = this.props;

    return (
        <div>
          <div>Layer: {layerIndex}, Neuron: {neuronIndex}</div>
          <Filters layer={layer} neuronIndex={neuronIndex} />
        </div>
    );
  }
}

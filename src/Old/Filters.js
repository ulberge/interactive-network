import React, { Component } from 'react';
import p5 from 'p5';
import * as tf from '@tensorflow/tfjs';

/* global nj */

// Render the filters for the given layer and neuron index
export default class Filters extends Component {
  componentDidMount() {
    const { layer, neuronIndex } = this.props;
    this._getFilters(layer, neuronIndex);
  }

  componentDidUpdate() {
    const { layer, neuronIndex } = this.props;
    this._getFilters(layer, neuronIndex);
  }

  tensorToArray(tensor) {
    let arr = nj.array(tensor);
    arr = arr.transpose(3, 2, 0, 1);
    return arr.tolist();
  }



  async _getFilters(layer, neuronIndex) {
    this.refs.filters.innerHTML = '';
    const layerWeights = await layer.getWeights();
    const weightsTensor = await layerWeights[0].array();
    const filterGroups = this.tensorToArray(weightsTensor);
    const filters = filterGroups[neuronIndex];

    console.log('filters', filters);
    // normalize across arrays
    let max = -Infinity;
    let min = Infinity;
    filters.forEach(filter => filter.flat().forEach(v => {
      if (v > max) {
        max = v;
      }
      if (v < min) {
        min = v;
      }
    }));

    const normalize = (v, max, min) => {
      return (v - min) / (max - min);
    };
    const filtersNorm = filters.map(filter => filter.map(row => row.map(v => normalize(v, max, min))));
    console.log('filtersNorm', filtersNorm);

    // Draw filters
    filtersNorm.forEach(filter => {
      new p5(this.getFilterSketch(filter), this.refs.filters);
    });
  }

  getFilterSketch(filter) {
    const scale = 10;
    const h = filter.length;
    const w = filter[0].length;

    return (p) => {
      p.setup = () => {
        p.pixelDensity(1);
        p.createCanvas(w * scale, h * scale);
        p.background(255);
        p.noLoop();
        p.noStroke();
      };

      p.draw = () => {
        // normalize array in 255
        const arr_flat = filter.flat();
        const arr_flat_norm = arr_flat;
        let i = 0;
        for (let y = 0; y < h; y += 1) {
          for (let x = 0; x < w; x += 1) {
            p.fill(arr_flat_norm[i] * 255);
            p.rect(x * scale, y * scale, scale, scale);
            i += 1;
          }
        }
      };
    };
  }

  render() {
    return (
      <div ref="filters" className="filters"></div>
    );
  }
}

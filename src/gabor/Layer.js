import React from 'react';
import Array2DView from '../common/Array2DView';
import { eval2DArray } from '../common/helpers';

const Layer = props => {
  const { imgArr, layer, scale } = props;

  let outputs = [];
  if (imgArr && imgArr.length > 0 && layer) {
    outputs = eval2DArray(layer, imgArr);
  }

  return (
    <span>
      { outputs.map((output, i) => <Array2DView key={i} imgArr={output} scale={scale} />) }
    </span>
  );
}

export default Layer;

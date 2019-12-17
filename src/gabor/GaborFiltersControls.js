import React from 'react';
import Slider from '@material-ui/core/Slider';

const GaborFiltersControls = props => {
  const { numComponents, lambda, gamma, sigma, windowSize, onChange } = props;

  return (
    <div>
      <div>Number of Components</div>
      <Slider
        value={numComponents}
        aria-labelledby="number of components"
        marks={[1, 2, 3, 4, 5].map(value => ({ value, label: (2 ** value) }))}
        step={null}
        min={1}
        max={5}
        onChange={(event, value) => onChange({ numComponents: value })}
      />
      <div>Lambda (width)</div>
      <Slider
        value={lambda}
        aria-labelledby="lambda"
        valueLabelDisplay="auto"
        marks={[1.1, 8].map(value => ({ value, label: value }))}
        step={0.1}
        min={1.1}
        max={8}
        onChange={(event, value) => onChange({ lambda: value })}
      />
      <div>Gamma (length)</div>
      <Slider
        value={gamma}
        aria-labelledby="gamma"
        valueLabelDisplay="auto"
        marks={[0.1, 4].map(value => ({ value, label: value }))}
        step={0.1}
        min={0.1}
        max={4}
        onChange={(event, value) => onChange({ gamma: value })}
      />
      <div>Sigma (size of Gaussian)</div>
      <Slider
        value={sigma}
        aria-labelledby="sigma"
        valueLabelDisplay="auto"
        marks={[0.1, 4].map(value => ({ value, label: value }))}
        step={0.1}
        min={0.1}
        max={4}
        onChange={(event, value) => onChange({ sigma: value })}
      />
      <div>Window Size</div>
      <Slider
        value={windowSize}
        aria-labelledby="window size"
        valueLabelDisplay="auto"
        marks={[1, 27].map(value => ({ value, label: value }))}
        step={2}
        min={1}
        max={27}
        onChange={(event, value) => onChange({ windowSize: value })}
      />
    </div>
  );
}

export default GaborFiltersControls;

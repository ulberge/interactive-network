import React from 'react';
import PropTypes from 'prop-types';
import Slider from '@material-ui/core/Slider';

const GaborFiltersControls = props => {
  return (
    <div>
      <div>Number of Components</div>
      <Slider
        value={props.filterConfig.numComponents}
        aria-labelledby="number of components"
        marks={[1, 2, 3, 4, 5].map(value => ({ value, label: (2 ** value) }))}
        step={null}
        min={1}
        max={5}
        onChange={(event, value) => props.onChange({ numComponents: value })}
      />
      <div>Lambda (width)</div>
      <Slider
        value={props.filterConfig.lambda}
        aria-labelledby="lambda"
        valueLabelDisplay="auto"
        marks={[1.1, 8].map(value => ({ value, label: value }))}
        step={0.1}
        min={1.1}
        max={8}
        onChange={(event, value) => props.onChange({ lambda: value })}
      />
      <div>Gamma (length)</div>
      <Slider
        value={props.filterConfig.gamma}
        aria-labelledby="gamma"
        valueLabelDisplay="auto"
        marks={[0.1, 4].map(value => ({ value, label: value }))}
        step={0.1}
        min={0.1}
        max={4}
        onChange={(event, value) => props.onChange({ gamma: value })}
      />
      <div>Sigma (size of Gaussian)</div>
      <Slider
        value={props.filterConfig.sigma}
        aria-labelledby="sigma"
        valueLabelDisplay="auto"
        marks={[0.1, 2].map(value => ({ value, label: value }))}
        step={0.1}
        min={0.1}
        max={2}
        onChange={(event, value) => props.onChange({ sigma: value })}
      />
      <div>Window Size</div>
      <Slider
        value={props.filterConfig.windowSize}
        aria-labelledby="window size"
        valueLabelDisplay="auto"
        marks={[1, 27].map(value => ({ value, label: value }))}
        step={2}
        min={1}
        max={27}
        onChange={(event, value) => props.onChange({ windowSize: value })}
      />
    </div>
  );
}

GaborFiltersControls.propTypes = {
  filterConfig: PropTypes.shape({
    numComponents: PropTypes.number,
    lambda: PropTypes.number,
    gamma: PropTypes.number,
    sigma: PropTypes.number,
    windowSize: PropTypes.number,
  }).isRequired,
  onChange: PropTypes.func.isRequired
};

export default GaborFiltersControls;

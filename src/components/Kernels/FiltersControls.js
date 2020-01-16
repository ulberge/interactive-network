import React, { memo } from 'react';
import PropTypes from 'prop-types';
import DebounceSlider from '../UI/DebounceSlider';

const GaborFiltersControls = memo(function GaborFiltersControls(props) {
  return (
    <div style={{ width: '180px' }}>
      <div>
        <div>Angles</div>
        <DebounceSlider
          defaultValue={props.numComponents}
          track={false}
          aria-labelledby="number of components"
          marks={[1, 2, 3, 4, 5].map(value => ({ value, label: (2 ** value) }))}
          step={1}
          min={1}
          max={5}
          onChange={value => props.onChange('numComponents', value)}
        />
      </div>
      <div>
        <div>Size</div>
        <DebounceSlider
          defaultValue={props.windowSize}
          track={false}
          aria-labelledby="window size"
          valueLabelDisplay="auto"
          marks={[{ value: 3, label: '3'}, { value: 19, label: '19'}]}
          step={2}
          min={3}
          max={19}
          onChange={value => props.onChange('windowSize', value)}
        />
      </div>
      <div>
        <div>Width</div>
        <DebounceSlider
          defaultValue={props.lambda}
          track={false}
          aria-labelledby="lambda"
          valueLabelDisplay="auto"
          marks={[{ value: 1.1, label: '1.1'}, { value: 16, label: '16'}]}
          step={0.1}
          min={1.1}
          max={16}
          onChange={value => props.onChange('lambda', value)}
        />
      </div>
      <div>
        <div>Spread</div>
        <DebounceSlider
          defaultValue={props.sigma}
          track={false}
          aria-labelledby="sigma"
          valueLabelDisplay="auto"
          marks={[{ value: 0.1, label: '0.1'}, { value: 8, label: '8'}]}
          step={0.1}
          min={0.1}
          max={8}
          onChange={value => props.onChange('sigma', value)}
        />
      </div>
      <div>
        <div>Bias</div>
        <DebounceSlider
          defaultValue={props.bias}
          track={false}
          aria-labelledby="bias"
          valueLabelDisplay="auto"
          marks={[{ value: -15, label: '-15'}, { value: 0, label: '0'}, { value: 15, label: '15'}]}
          step={0.1}
          min={-15}
          max={15}
          onChange={value => props.onChange('bias', value)}
        />
      </div>
    </div>
  );
});

GaborFiltersControls.propTypes = {
  numComponents: PropTypes.number.isRequired,
  lambda: PropTypes.number.isRequired,
  sigma: PropTypes.number.isRequired,
  windowSize: PropTypes.number.isRequired,
  bias: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
};

export default GaborFiltersControls;

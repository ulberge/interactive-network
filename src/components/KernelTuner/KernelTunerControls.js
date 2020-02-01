import React, { memo } from 'react';
import PropTypes from 'prop-types';
import DebounceSlider from '../UI/DebounceSlider';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

const KernelTunerControls = memo(function KernelTunerControls(props) {
  return (
    <div>
      <div>
        <div>Types</div>
        <ToggleButtonGroup
          value={props.types}
          onChange={(e, types) => props.onChange('types', types)}
          aria-label="types of kernels"
          style={{ borderRadius: 0, margin: '12px 0' }}
          className="toggle-types"
        >
          { ['l', 'i', 'L', 'T', 'X', 'Y'].map(type => (
            <ToggleButton
              key={type}
              value={type}
              style={{ borderRadius: 0, height: '28px', width: '28px', textTransform: 'none' }}
            >
              { type }
            </ToggleButton>
          )) }
        </ToggleButtonGroup>
      </div>
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
          marks={[3, 5, 7, 9, 11, 13, 15].map(value => ({ value, label: value }))}
          step={2}
          min={3}
          max={15}
          onChange={value => props.onChange('windowSize', value)}
        />
      </div>
      <div>
        <div>Width Factor</div>
        <DebounceSlider
          defaultValue={props.lambda}
          track={false}
          aria-labelledby="lambda"
          valueLabelDisplay="auto"
          step={0.1}
          min={1.1}
          max={10}
          onChange={value => props.onChange('lambda', value)}
          style={{ padding: '24px 0' }}
          timer={50}
        />
      </div>
      <div>
        <div>Gaussian Spread</div>
        <DebounceSlider
          defaultValue={props.sigma}
          track={false}
          aria-labelledby="sigma"
          valueLabelDisplay="auto"
          step={0.1}
          min={0.1}
          max={8}
          onChange={value => props.onChange('sigma', value)}
          style={{ padding: '24px 0' }}
          timer={50}
        />
      </div>
    </div>
  );
});

KernelTunerControls.propTypes = {
  numComponents: PropTypes.number.isRequired,
  lambda: PropTypes.number.isRequired,
  sigma: PropTypes.number.isRequired,
  windowSize: PropTypes.number.isRequired,
  // types: PropTypes.object.isRequired,
  types: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired
};

export default KernelTunerControls;

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import Slider from '@material-ui/core/Slider';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { kernelTypes } from '../../js/kernel';

const KernelMakerControls = memo(function KernelMakerControls(props) {
  return (
    <div>
      <div>
        <div>Types</div>
        <ToggleButtonGroup
          value={props.types}
          onChange={(event, types) => types.length > 0 ? props.onChange('types', types) : 0}
          aria-label="types of kernels"
          style={{ borderRadius: 0, margin: '12px 0 0 0' }}
          className="toggle-types"
        >
          { kernelTypes.slice(0, 5).map((type, i) => (
            <ToggleButton
              key={type}
              value={type}
              style={{ borderRadius: 0, height: '28px', width: '28px', textTransform: 'none', padding: '4px', textAlign: 'center' }}
            >
              { type }
            </ToggleButton>
          )) }
        </ToggleButtonGroup>
        <ToggleButtonGroup
          value={props.types}
          onChange={(event, types) => types.length > 0 ? props.onChange('types', types) : 0}
          aria-label="types of kernels"
          style={{ borderRadius: 0, margin: '2px 0 12px 0' }}
          className="toggle-types"
        >
          { kernelTypes.slice(5, 10).map((type, i) => (
            <ToggleButton
              key={type}
              value={type}
              style={{ borderRadius: 0, height: '28px', width: '28px', textTransform: 'none', padding: '4px', textAlign: 'center' }}
            >
              { type }
            </ToggleButton>
          )) }
        </ToggleButtonGroup>
      </div>
      <div>
        <div>Angles</div>
        <Slider
          defaultValue={props.numComponents}
          track={false}
          aria-labelledby="number of components"
          marks={[1, 2, 3, 4].map(value => ({ value, label: (2 ** value) }))}
          step={1}
          min={1}
          max={4}
          onChange={(event, value) => props.onChange('numComponents', value)}
        />
      </div>
      <div>
        <div>Size</div>
        <Slider
          defaultValue={props.windowSize}
          track={false}
          aria-labelledby="window size"
          valueLabelDisplay="auto"
          marks={[3, 5, 7, 9, 11, 13, 15].map(value => ({ value, label: value }))}
          step={2}
          min={3}
          max={15}
          onChange={(event, value) => props.onChange('windowSize', value)}
        />
      </div>
      <div>
        <div>Width Factor</div>
        <Slider
          defaultValue={props.lambda}
          track={false}
          aria-labelledby="lambda"
          valueLabelDisplay="auto"
          step={0.1}
          min={1.1}
          max={10}
          onChange={(event, value) => props.onChange('lambda', value)}
          style={{ padding: '24px 0' }}
        />
      </div>
      <div>
        <div>Gaussian Spread</div>
        <Slider
          defaultValue={props.sigma}
          track={false}
          aria-labelledby="sigma"
          valueLabelDisplay="auto"
          step={0.1}
          min={0.1}
          max={8}
          onChange={(event, value) => props.onChange('sigma', value)}
          style={{ padding: '24px 0' }}
        />
      </div>
    </div>
  );
});

KernelMakerControls.propTypes = {
  numComponents: PropTypes.number.isRequired,
  lambda: PropTypes.number.isRequired,
  sigma: PropTypes.number.isRequired,
  windowSize: PropTypes.number.isRequired,
  types: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired
};

export default KernelMakerControls;

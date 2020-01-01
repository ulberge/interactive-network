import React, { useState, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import Slider from '@material-ui/core/Slider';
import { debounce } from 'lodash';

// This slider manages its own state and notifies listeners to changes through onChange after debounce
const DebounceSlider = memo(function DebounceSlider(props) {
  const [value, setValue] = useState(props.defaultValue);
  const onChange = useCallback(debounce(props.onChange, props.timer || 0), []);

  return (
    <Slider
      value={value}
      {...props}
      onChange={(event, value) => {
        setValue(value);
        onChange(value);
      }}
    />
  )
});

DebounceSlider.propTypes = {
  defaultValue: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  timer: PropTypes.number,
};

export default DebounceSlider;

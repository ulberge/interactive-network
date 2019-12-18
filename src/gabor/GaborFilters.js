import React from 'react';
import PropTypes from 'prop-types';
import Array2DView from '../common/Array2DView';

const GaborFilters = props => {
  const { filters, scale, selectedIndex, onSelect } = props;

  let filterScale = 1;
  if (filters.length > 0 && scale) {
    // keep same absolute  size regardless of filter size
    filterScale = scale / filters[0].length;
  }

  return filters.map((filter, i) => (
    <div
      key={i}
      className={'selectable ' + (i === selectedIndex ? 'selected' : '')}
      style={{ margin: '4px', display: 'inline-block' }}
      onClick={() => onSelect(i)}
    >
      <Array2DView imgArr={filter} scale={filterScale} />
    </div>
  ));
}

GaborFilters.propTypes = {
  filters: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
  scale: PropTypes.number,
  selectedIndex: PropTypes.number
};

export default GaborFilters;

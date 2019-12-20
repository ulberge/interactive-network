import React from 'react';
import PropTypes from 'prop-types';
import GaborFilter from './GaborFilter';

const GaborFilters = props => {
  const { filters, scale, selectedIndex, onSelect } = props;

  return filters.map((filter, i) => (
    <div
      key={i}
      className={'selectable ' + (i === selectedIndex ? 'selected' : '')}
      style={{ margin: '4px', display: 'inline-block' }}
      onClick={() => onSelect(i)}
    >
      <GaborFilter filter={filter} scale={scale} />
    </div>
  ));
}

GaborFilters.propTypes = {
  filters: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
  scale: PropTypes.number,
  selectedIndex: PropTypes.number
};

export default GaborFilters;

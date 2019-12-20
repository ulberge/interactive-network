import React from 'react';
import PropTypes from 'prop-types';
import GaborFilter from './GaborFilter';

const GaborFilters = props => {
  const { filters, scale } = props;

  return filters.map((filter, i) => (
    <div
      key={i}
      style={{ margin: '4px', display: 'inline-block' }}
    >
      <GaborFilter filter={filter} scale={scale} />
    </div>
  ));
}

GaborFilters.propTypes = {
  filters: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
  scale: PropTypes.number
};

export default GaborFilters;

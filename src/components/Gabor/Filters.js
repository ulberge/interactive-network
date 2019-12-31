import React from 'react';
import PropTypes from 'prop-types';
import Array2DView from '../UI/Array2DView';

const GaborFilters = props => {
  const { filters, scale } = props;

  let filterScale = 1;
  if (filters && filters.length > 0 && scale) {
    // keep same absolute  size regardless of filter size
    filterScale = scale / filters[0].length;
  }

  return (
    <div style={{ textAlign: 'center' }}>
      {
        filters.map((filter, i) => (
          <div
            key={i}
            style={{ margin: '4px', display: 'inline-block' }}
          >
            <Array2DView imgArr={filter} scale={filterScale} />
          </div>
        ))
      }
    </div>
  );
}

GaborFilters.propTypes = {
  filters: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
  scale: PropTypes.number
};

export default GaborFilters;

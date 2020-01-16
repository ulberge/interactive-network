import React, { memo } from 'react';
import PropTypes from 'prop-types';
import Array2DViewList from '../UI/Array2DViewList';

const GaborFilters = memo(function GaborFilters(props) {
  const { filters, scale } = props;

  let filterScale = 1;
  if (filters && filters.length > 0 && scale) {
    // keep same absolute  size regardless of filter size
    filterScale = scale / filters[0].length;
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <Array2DViewList imgArrs={filters} scale={filterScale} normalize={true} />
    </div>
  );
});

GaborFilters.propTypes = {
  filters: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
  scale: PropTypes.number
};

export default GaborFilters;

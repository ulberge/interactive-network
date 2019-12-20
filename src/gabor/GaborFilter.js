import React from 'react';
import PropTypes from 'prop-types';
import Array2DView from '../common/Array2DView';

const GaborFilter = props => {
  const { filter, scale } = props;

  let filterScale = 1;
  if (filter && scale) {
    // keep same absolute  size regardless of filter size
    filterScale = scale / filter.length;
  }

  return <Array2DView imgArr={filter} scale={filterScale} />;
}

GaborFilter.propTypes = {
  filter: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
  scale: PropTypes.number
};

export default GaborFilter;

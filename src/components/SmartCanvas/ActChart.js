import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { renderChart } from '../../js/activationchart';

const SmartCanvasActChart = props => {
  const chartRef = useRef(null);

  useEffect(() => {
    chartRef.current.innerHTML = '';
    const { acts, kernels, numKernels } = props;
    if (acts) {
      renderChart(chartRef.current, acts, kernels, numKernels);
    }
  }, [props]);

  return (
    <div ref={chartRef} style={{ width: '400px' }}></div>
  );
};

SmartCanvasActChart.propTypes = {
  acts: PropTypes.arrayOf(PropTypes.number),
  numKernels: PropTypes.number.isRequired,
  kernels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
};

export default SmartCanvasActChart;

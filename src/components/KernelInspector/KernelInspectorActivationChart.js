import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { renderChart } from '../../js/charts/activationChart';

const KernelInspectorActivationChart = props => {
  const chartRef = useRef(null);

  const { kernels, acts } = props;
  useEffect(() => {
    // clear the previous chart
    chartRef.current.innerHTML = '';
    if (kernels && acts) {
      renderChart(chartRef.current, kernels, acts);
    }
  }, [ kernels, acts ]);

  return (
    <div ref={chartRef} style={{ width: '400px' }}></div>
  );
};

KernelInspectorActivationChart.propTypes = {
  kernels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
  acts: PropTypes.arrayOf(PropTypes.number),
};

export default KernelInspectorActivationChart;

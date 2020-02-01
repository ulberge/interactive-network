import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { renderChart } from '../../js/charts/activationInspectorChart';

const KernelInspectorActivationChart = props => {
  const chartRef = useRef(null);

  useEffect(() => {
    chartRef.current.innerHTML = '';
    if (props.kernels && props.acts) {
      renderChart(chartRef.current, props.kernels, props.acts);
    }
  }, [props.kernels, props.acts]);

  return (
    <div ref={chartRef} style={{ width: '400px' }}></div>
  );
};

KernelInspectorActivationChart.propTypes = {
  kernels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
  acts: PropTypes.arrayOf(PropTypes.number),
};

export default KernelInspectorActivationChart;

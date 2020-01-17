import * as d3 from 'd3';
import { getTopValues } from './helpers';

function getKernelImgs(kernels, kernelKeys) {
  const filteredKernels = kernels.map((kernel, i) => ({ kernel, i })).filter(d => kernelKeys.includes(d.i));
  const kernelsData = [];
  filteredKernels.forEach(d => {
    // normalization value
    let max = Math.max(...d.kernel.map(row => Math.max(...row.map(v => Math.abs(v)))));

    // flatten by adding each pixel to whole list
    d.kernel.forEach((row, rIndex) => row.forEach((v, colIndex) => {
      kernelsData.push({ ch: d.i, row: rIndex, col: colIndex, v: v / max });
    }));
  });
  return kernelsData;
}

// render chart of top activations (list of channel values at a given position) with their icon on top to the el
export function renderChart(el, activations, kernels, numKernels) {
  let data = getTopValues(activations, numKernels);
  data = data.map((d, i) => ({ name: d[0], value: d[1] }));

  const kernelKeys = data.map(d => d.name);
  const kernelImgs = getKernelImgs(kernels, kernelKeys);

  const margin = {top: 4, right: 4, bottom: 50, left: 50};
  const width = el.offsetWidth - margin.left - margin.right;
  const height = width * 0.5;

  const x = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([margin.left, width - margin.right])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, 1])
    .range([height - margin.bottom, margin.top]);

  const xAxis = g => g
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0));

  const yAxis = g => g
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).tickFormat(d3.format('.0%')))
    .call(g => g.select('.domain').remove());

  const svg = d3.select(el).append('svg')
    .attr('width', width)
    .attr('height', height);

  const bars = svg.append('g').selectAll('.bar').data(data).enter();

  bars.append('rect')
      .attr('fill', '#b2b2b2')
      .attr('x', d => x(d.name))
      .attr('y', d => y(d.value ? d.value : 0))
      .attr('height', d => y(0) - y(d.value ? d.value : 0))
      .attr('width', x.bandwidth());

  bars.exit().remove();

  if (kernels && kernels.length > 0) {
    const pixels = svg.append('g').selectAll('.pixel').data(kernelImgs).enter();
    const size = x.bandwidth() / kernels[0].length;
    pixels.append('rect')
        .attr('fill', d => {
          if (d.v >= 0) {
            return 'rgba(0, 0, 0, ' + (d.v) + ')';
          } else {
            return 'rgba(255, 0, 0, ' + (-d.v / 2) + ')';
          }
        })
        .attr('x', d => x(d.ch) + (size * d.col))
        .attr('y', d => (size * d.row))
        .attr('height', size)
        .attr('width', size);
  }

  svg.append('g')
    .style('font-size', '10px')
    .call(xAxis);

  svg.append('g')
    .style('font-size', '10px')
    .call(yAxis);

  return svg.node();
}

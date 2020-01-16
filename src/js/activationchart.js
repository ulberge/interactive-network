import * as d3 from 'd3';
import { getKernels } from './kernel';

// Return a list of { v: value, i: index } with the top N values
function getTopValues(arr, N) {
  const sorted = arr.map((s, i) => [i, s]).sort((a, b) => (a[1] > b[1]) ? -1 : 1);
  return sorted.slice(0, N);
}

const kernels = getKernels(11, 8, 4.3, 3.5);
const kernelsData = kernels.map((channel, chIndex) => {
  const kernelData = [];
  let max = Math.max(...channel.map(row => Math.max(...row.map(v => Math.abs(v)))));
  channel = channel.map(row => row.map(v => v / max));
  channel.forEach((row, rIndex) => row.forEach((v, colIndex) => {
    kernelData.push({ ch: chIndex, row: rIndex, col: colIndex, v });
  }));
  return kernelData;
});

// render chart of top activations (list of channel values at a given position) with their icon on top to the el
export function renderChart(el, activations) {
  let data = getTopValues(activations, 10);
  data = data.map((d, i) => ({ name: d[0], value: d[1] }));

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

  const kernelKeys = data.map(d => d.name);
  const filteredKernelsData = [];
  kernelsData.filter((kernel, i) => kernelKeys.includes(i)).forEach(dataList => filteredKernelsData.push(...dataList));
  const pixels = svg.append('g').selectAll('.pixel').data(filteredKernelsData).enter();
  const size = x.bandwidth() / 11;
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

  svg.append('g')
    .style('font-size', '10px')
    .call(xAxis);

  svg.append('g')
    .style('font-size', '10px')
    .call(yAxis);

  return svg.node();
}

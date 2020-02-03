import * as d3 from 'd3';

// render the kernels using d3 on top of the x bars
function renderKernelsOnBars(el, x, kernels) {
  // flatten kernels into a data set with each individual weight as an entry
  const flatKernelData = [];
  kernels.forEach((kernel, i) => {
    // normalize
    let max = Math.max(...kernel.map(row => Math.max(...row.map(v => Math.abs(v)))));
    kernel.forEach((row, rIndex) => row.forEach((v, colIndex) => {
      flatKernelData.push({ kIndex: i, row: rIndex, col: colIndex, v: v / max });
    }));
  });

  // render flat kernel data
  const weightPixels = el.append('g').selectAll('.pixel').data(flatKernelData).enter();
  const pixelSize = x.bandwidth() / kernels[0].length;
  weightPixels.append('rect')
    .attr('fill', d => {
      if (d.v >= 0) {
        return 'rgba(0, 0, 0, ' + (d.v) + ')';
      } else {
        return 'rgba(214, 30, 30, ' + (-d.v * 0.75) + ')';
      }
    })
    .attr('x', d => x(d.kIndex) + (pixelSize * d.col))
    .attr('y', d => (pixelSize * d.row))
    .attr('height', pixelSize)
    .attr('width', pixelSize);

  // render outlines of kernels
  const kernelOutlines = el.append('g').selectAll('.outline').data(kernels).enter();
  kernelOutlines.append('rect')
    .attr('x', (d, i) => x(i))
    .attr('y', 0)
    .attr('height', x.bandwidth())
    .attr('width', x.bandwidth())
    .style("stroke", '#b2b2b2')
    .style("fill", "none")
    .style("stroke-width", 1);
}

// render bar chart of activations with the kernel icon on top of each bar
export function renderChart(el, kernels, acts) {
  // format data for d3
  const data = acts.map((act, i) => ({ name: i, value: act / 255 }));

  // setup styles
  const margin = {top: 4, right: 4, bottom: 4, left: 4};
  const width = el.offsetWidth - margin.left - margin.right;
  const height = width * 0.5;

  // setup bands
  const x = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([margin.left, width - margin.right])
    .padding(0.1);
  const y = d3.scaleLinear()
    .domain([0, 1])
    .range([height - margin.bottom, margin.top + x.bandwidth()]);

  // create parent el
  const svg = d3.select(el).append('svg')
    .attr('width', width)
    .attr('height', height);

  // draw bars
  const bars = svg.append('g').selectAll('.bar').data(data).enter();
  bars.append('rect')
      .attr('fill', '#e0e0e0')
      .attr('stroke', '#b2b2b2')
      .style('stroke-width', 1)
      .attr('x', d => x(d.name))
      .attr('y', d => y(d.value ? d.value : 0))
      .attr('height', d => y(0) - y(d.value ? d.value : 0))
      .attr('width', x.bandwidth())
  bars.exit().remove();
  renderKernelsOnBars(svg, x, kernels);

  // draw x axis ticks
  const xAxis = g => g
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .attr('color', '#b2b2b2')
    .call(d3.axisBottom(x).tickSize(0));
  svg.append('g')
    .style('font-size', '0')
    .call(xAxis);

  // // draw y axis percent labels
  // const yAxis = g => g
  //   .attr('transform', `translate(${margin.left},0)`)
  //   .call(d3.axisLeft(y).tickFormat(d3.format('.0%')))
  //   .call(g => g.select('.domain').remove());
  // svg.append('g')
  //   .style('font-size', '10px')
  //   .call(yAxis);

  return svg.node();
}

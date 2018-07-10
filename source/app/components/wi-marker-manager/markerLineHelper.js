exports.sin = function ({ width, height, stepWidth }) {
  const svg = d3.select(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
  const lineFunction = d3.line()
    .x(d => d.x)
    .y(d => d.y)
    .curve(d3.curveBasis);
  const lineData = [];
  const loop = Math.ceil(width / (2 * stepWidth));
  for (let i = 0; i <= loop; i++) {
    lineData.push(
      { x: stepWidth / 2 * (4 * i), y: height / 2 },
      { x: stepWidth / 2 * (4 * i + 1), y: height },
      { x: stepWidth / 2 * (4 * i + 2), y: height / 2 },
      { x: stepWidth / 2 * (4 * i + 3), y: 0 },
    )
  }
  const lineGraph = svg.append('path')
    .attr('d', lineFunction(lineData))
    .attr('fill', 'none')
  return lineGraph;
}

exports.fault = function ({ width, height, stepWidth }) {
  const svg = d3.select(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
  const lineFunction = d3.line()
    .x(d => d.x)
    .y(d => d.y)
    .curve(d3.curveLinear);
  const lineData = [];
  const loop = Math.ceil(width / (2 * stepWidth));
  for (let i = 0; i <= loop; i++) {
    lineData.push(
      { x: stepWidth * (2 * i), y: 0 },
      { x: stepWidth * (2 * i) + stepWidth, y: height },
    )
  }
  const lineGraph = svg.append('path')
    .attr('d', lineFunction(lineData))
    .attr('fill', 'none')
  return lineGraph;
}

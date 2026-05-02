import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');
const title = document.querySelector('.projects-title');
title.textContent = `${projects.length} Projects`;

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let colors = d3.scaleOrdinal(d3.schemeTableau10);

let selectedIndex = -1;
let query = '';

function renderPieChart(projectsGiven) {
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );
  let newData = newRolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  // Clear previous
  let svg = d3.select('svg');
  svg.selectAll('path').remove();
  d3.select('.legend').selectAll('li').remove();

  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let newArcs = newArcData.map((d) => arcGenerator(d));

  // Draw wedges
  newArcs.forEach((arc, i) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(i))
      .attr('class', i === selectedIndex ? 'selected' : '')
      .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;

        // Update wedge classes
        svg.selectAll('path').attr('class', (_, idx) =>
          idx === selectedIndex ? 'selected' : ''
        );

        // Update legend classes
        d3.select('.legend').selectAll('li').attr('class', (_, idx) =>
          idx === selectedIndex
            ? 'legend-item selected'
            : 'legend-item'
        );

        // Filter projects by both year AND search query
        let yearFiltered =
          selectedIndex === -1
            ? projects
            : projects.filter((p) => p.year === newData[selectedIndex].label);

        let fullyFiltered = yearFiltered.filter((project) => {
          let values = Object.values(project).join('\n').toLowerCase();
          return values.includes(query.toLowerCase());
        });

        renderProjects(fullyFiltered, projectsContainer, 'h2');
      });
  });

  // Draw legend
  let legend = d3.select('.legend');
  newData.forEach((d, idx) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(idx)}`)
      .attr('class', idx === selectedIndex ? 'legend-item selected' : 'legend-item')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

// Initial render
renderPieChart(projects);
renderProjects(projects, projectsContainer, 'h2');

// Search bar
let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
  query = event.target.value;

  // Filter by search query first
  let searchFiltered = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });

  // Re-render pie chart based on search results (resets selectedIndex)
  selectedIndex = -1;
  renderPieChart(searchFiltered);
  renderProjects(searchFiltered, projectsContainer, 'h2');
});
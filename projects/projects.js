import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');
console.log(projects);
const projectsContainer = document.querySelector('.projects');
// NEW: update title with count
const title = document.querySelector('.projects-title');
title.textContent = `Projects (${projects.length})`;
renderProjects(projects, projectsContainer, 'h2');
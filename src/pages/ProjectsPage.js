import React from 'react';

const projects = [
  {
    title: 'FloodNet: Multi-Modal Disaster Prediction',
    date: 'Fall 2025',
    tags: ['PyTorch', 'CNN', 'Geospatial Data'],
    description:
      'A multi-modal deep learning model that fuses Sentinel-1 SAR and Sentinel-2 optical satellite imagery to detect flood events with 91.5% accuracy and 0.979 AUC.',
    image: '/floodnet.png',
    github: 'https://github.com/Avi161/AI4ALL-5A',
    demo: null,
  },
  {
    title: 'WriteLight',
    date: 'Summer 2025',
    tags: ['MongoDB', 'Node.js', 'REST API'],
    description:
      'A hackathon project where I built the backend for a coin-based writing reward system, including MongoDB schemas and RESTful auth routes, collaborating across a 10-person team.',
    image: '/writelight.png',
    github: 'https://github.com/freeCodeCamp-2025-Summer-Hackathon/purple-array',
    demo: 'https://imgur.com/a/Fuy2W5k',
  },
  {
    title: 'AI Summarizer & Translator',
    date: 'Winter 2024',
    tags: ['GPT-4o', 'Chrome Extension', 'Tailwind CSS'],
    description:
      'A Chrome extension powered by GPT-4o that summarizes and translates web content across 10 languages, with client-side rate limiting and a responsive Tailwind CSS interface.',
    image: '/ai-summarizer.png',
    github: 'https://github.com/Avi161/AI-Summariser-and-Translator',
    demo: 'https://imgur.com/a/VJN8MFo',
  },
];

const ProjectsPage = () => (
  <div className="projects-page">
    <h1 className="projects-heading">Projects</h1>
    <p className="projects-subheading">
      A selection of things I've built — research tools, hackathon entries, and browser utilities.
    </p>
    <div className="projects-list">
      {projects.map((project) => (
        <article key={project.title} className="project-card">
          <div className="project-image-wrap">
            <img src={project.image} alt={project.title} className="project-image" />
          </div>
          <div className="project-body">
            <div className="project-meta">
              <span className="project-date">{project.date}</span>
              <div className="project-tags">
                {project.tags.map((tag) => (
                  <span key={tag} className="project-tag">{tag}</span>
                ))}
              </div>
            </div>
            <h2 className="project-title">{project.title}</h2>
            <p className="project-description">{project.description}</p>
            <div className="project-links">
              {project.github && (
                <a href={project.github} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              )}
              {project.demo && (
                <a href={project.demo} target="_blank" rel="noopener noreferrer">
                  Live Demo
                </a>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  </div>
);

export default ProjectsPage;

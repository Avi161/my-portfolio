import React from 'react';
import profileImage from '../components/me.png';

const HomePage = () => (
  <div className="home-page">
    <img src={profileImage} alt="Avigya Paudel" className="profile-image" />
    <section className="intro">
      <p>
        I'm <strong>Avigya Paudel</strong>, a Computer Science and Mathematics
        student at{' '}
        <a href="https://www.union.edu/" target="_blank" rel="noopener noreferrer">
          Union College
        </a>
        . I'm interested in AI Safety — understanding how to make sure advanced
        AI systems remain safe and aligned with human values.
      </p>
      <p>
        Currently, I'm a researcher at{' '}
        <a href="https://aisafety.camp/" target="_blank" rel="noopener noreferrer">
          AI Safety Camp
        </a>
        , where I'm working on understanding how LLMs reason across different
        timescales — in particular, identifying when models shift into strategic,
        long-term planning modes.
      </p>
      <p className="intro-links">
        <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">Resume</a> &middot;{' '}
        <a href="https://github.com/Avi161" target="_blank" rel="noopener noreferrer">GitHub</a> &middot;{' '}
        <a href="https://www.linkedin.com/in/avigya-paudel-531119306/" target="_blank" rel="noopener noreferrer">LinkedIn</a> &middot;{' '}
        <a href="mailto:paudela@union.edu">paudela@union.edu</a>
      </p>
    </section>
  </div>
);

export default HomePage;

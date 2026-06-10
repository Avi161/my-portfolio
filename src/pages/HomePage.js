import React from 'react';
import profileImage from '../components/AviPic.jpg';

const HomePage = () => {
  return (
    <>
      {/* Hero Cover Section */}
      <div
        className="hero-cover"
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/background.jpg)` }}
      >
      </div>

      {/* Your existing content below */}
      <div className="home-page">
        <img src={profileImage} alt="Avigya Paudel" className="profile-image" />
        <section className="intro">
          <p>
            I'm <strong>Avi</strong>, a CS and Math major at{' '}
            <a href="https://www.union.edu/" target="_blank" rel="noopener noreferrer">
              Union College
            </a>
            . I'm passionate about AI Safety which is a field dedicated to ensuring current and future AI systems do not cause unintended harm.
          </p>
          <p>
            I'm currently a research intern at{' '}
            <a href="https://math-ai.caltech.edu/" target="_blank" rel="noopener noreferrer">
              Caltech's Math+AI Lab
            </a>
            , working under{' '}
            <a href="https://gukov.caltech.edu/" target="_blank" rel="noopener noreferrer">
              Dr. Sergei Gukov
            </a>
            . I am applying an AlphaZero-inspired value network and Monte Carlo Tree Search to find new solutions to the Andrews-Curtis Conjecture, and ultimately understand how AI can be used to solve research-level mathematics problems.
          </p>
          <p>
            Previously, I was a research fellow at{' '}
            <a href="https://sparai.org/" target="_blank" rel="noopener noreferrer">
              SPAR
            </a>
            , where I worked on understanding how LLMs reason across different timescales, specifically identifying when models shift into strategic, long-term planning modes. You can read more about the project{' '}
            <a href="https://www.justinshenk.com/projects/spar-research" target="_blank" rel="noopener noreferrer">
              here
            </a>{' '}
            and view the{' '}
            <a href="https://arxiv.org/pdf/2606.05194" target="_blank" rel="noopener noreferrer">
              paper
            </a>.
          </p>
        </section>
      </div>
    </>
  );
};

export default HomePage;

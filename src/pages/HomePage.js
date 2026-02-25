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
            I'm <strong>Avi</strong>, a Computer Science and Mathematics
            student at{' '}
            <a href="https://www.union.edu/" target="_blank" rel="noopener noreferrer">
              Union College
            </a>
            . I'm passionate about AI Safety which is a field dedicated to ensuring current and future AI systems remains aligned with human values and do not cause unintended harm.
          </p>
          <p>
            Currently, I'm a research fellow at{' '}
            <a href="https://sparai.org/" target="_blank" rel="noopener noreferrer">
              SPAR
            </a>
            , where I'm working on understanding how LLMs reason across different
            timescales. In particular, identifying when models shift into strategic,
            long-term planning modes. You can view our project repo at{' '}
            <a href="https://github.com/justinshenk/temporal-awareness" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>.
          </p>
        </section>
      </div>
    </>
  );
};

export default HomePage;

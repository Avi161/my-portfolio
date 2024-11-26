import React, { useState } from 'react';
import MyNavbar from './components/Navbar';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={darkMode ? 'dark-mode' : 'light-mode'}>
      <MyNavbar />
      {/* Theme Toggle Button */}
      <div className="theme-toggle">
        <button onClick={toggleTheme} className="toggle-button">
          {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
      </div>

      {/* Header Links Section */}
      <div className="header-links">
        <a href="mailto:paudela@union.edu" target="_blank" rel="noopener noreferrer" className="icon-link">
          <img src="https://cdn-icons-png.flaticon.com/512/732/732200.png" alt="Email" className="icon" />
        </a>
        <a href="https://www.linkedin.com/in/avigya-paudel-531119306/" target="_blank" rel="noopener noreferrer" className="icon-link">
          <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" className="icon" />
        </a>
        <a href="https://github.com/Avi161" target="_blank" rel="noopener noreferrer" className="icon-link">
          <img src="https://cdn-icons-png.flaticon.com/512/25/25231.png" alt="GitHub" className="icon" />
        </a>
      </div>


      {/* About Myself Section */}
      <section id="about-myself" className="about-section">
        <div className="about-container">
          <h1 className="section-title">About Myself</h1>
          <p>
            Hi, I’m Avi! I’m a freshman at Union College majoring in Computer Science
            and Mathematics. I have hands-on experience in programming, leadership,
            internships, teamwork, and teaching. My passion lies in solving complex
            problems and building impactful solutions through technology.
          </p>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="skills-section">
        <h1 className="section-title">Skills</h1>
        <div className="skills-container">
          <div className="skills-card">
            <h3>Programming Languages</h3>
            <p>Python, C, C++, Java, JavaScript</p>
          </div>
          <div className="skills-card">
            <h3>Technical Skills</h3>
            <p>HTML & CSS, GitHub, WordPress, Data Structures, Algorithms, SQL, Flask, Arduino</p>
          </div>
          <div className="skills-card">
            <h3>Soft Skills</h3>
            <p>Communication, Critical Thinking, Adaptability, Problem Solving, Attention to Detail</p>
          </div>
          <div className="skills-card">
            <h3>Languages</h3>
            <p>English (Highly Proficient), Nepali (Native), Hindi (Proficient), German (Basics)</p>
          </div>
        </div>
      </section>



      {/* Resume Section */}
      <section id="resume" className="resume-section">
        <div className="resume-container">
          <h1 className="section-title">My Resume</h1>
          <p>You can download my resume or view it directly using the button below.</p>
          <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="resume-button">
            Download Resume
          </a>
        </div>
      </section>


      {/* Projects Section */}
      <section id="projects" className="section">
        <div className="projects-container">
          <h1 className="section-title">Projects</h1>
          <div className="project-card">
            <h2>Automated Pill Dispenser</h2>
            <p>
              Built an Automatic Pill Dispenser (targeting blind people), which dispenses pills using a rotating disk
              mechanism with a team of 4 students. Used C++ to document and integrate two servos, two sound alarms,
              and a button for the dispenser in Arduino. Developed an integrated iOS app that notifies when the pills
              are dispensed using React Native and Firebase.
            </p>
            <div className="button-container">
              <a href="/automated-pill-dispenser-report.pdf" target="_blank" rel="noopener noreferrer" className="project-button">
                View Report
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Hobbies Section */}
      <section id="hobbies" className="hobbies-section">
        <h1 className="section-title">Hobbies</h1>
        <div className="hobbies-container">
          <div className="hobby-circle">Chess</div>
          <div className="hobby-circle">Badminton</div>
          <div className="hobby-circle">Meditation</div>
          <div className="hobby-circle">Running</div>
          <div className="hobby-circle">Coding</div>
          <div className="hobby-circle">Socializing</div>
          <div className="hobby-circle">Helping People</div>
        </div>
      </section>

      {/* Contact Me Section */}
      <section id="contact-me" className="contact-section">
        <h1 className="section-title">Contact Me</h1>
        <div className="contact-container">
          <p>
            Have questions or want to connect? Feel free to drop me an email at:
          </p>
          <a href="mailto:avi.email@example.com" className="email-link">
            avi.email@example.com
          </a>
        </div>
      </section>

    </div>
  );
}

export default App;

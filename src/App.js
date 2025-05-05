import React, { useState, useEffect, useRef } from 'react';
import MyNavbar from './components/Navbar';
import { FiMail } from 'react-icons/fi';
import { FaLinkedin, FaGithub, FaMoon, FaSun, FaDownload } from 'react-icons/fa';
import './App.css';
import profileImage from './components/me.png';
import emailjs from '@emailjs/browser';

// Component for animated section transitions
const AnimatedSection = ({ id, className, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );
    
    const section = document.getElementById(id);
    if (section) observer.observe(section);
    
    return () => {
      if (section) observer.unobserve(section);
    };
  }, [id]);
  
  return (
    <section 
      id={id} 
      className={`${className} ${isVisible ? 'fade-in' : 'hidden'}`}
    >
      {children}
    </section>
  );
};

// Skill tag component
const SkillTag = ({ skill }) => {
  return (
    <div className="skill-tag">{skill}</div>
  );
};

// Project card with hover effects
const ProjectCard = ({ title, description, image, technologies, link, report }) => {
  return (
    <div className="project-card">
      <div className="project-image">
        {image ? (
          <img src={image} alt={title} />
        ) : (
          <div className="project-image-placeholder">{title.charAt(0)}</div>
        )}
      </div>
      <div className="project-content">
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="technologies">
          {technologies.map((tech, index) => (
            <span key={index} className="tech-tag">{tech}</span>
          ))}
        </div>
        <div className="button-container">
          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer" className="project-button">
              View Project
            </a>
          )}
          {report && (
            <a href={report} target="_blank" rel="noopener noreferrer" className="project-button secondary">
              View Report
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

// Testimonial component
const Testimonial = ({ text, name, position }) => {
  return (
    <div className="testimonial-card">
      <div className="quote-icon">"</div>
      <p className="testimonial-text">{text}</p>
      <div className="testimonial-author">
        <p className="author-name">{name}</p>
        <p className="author-position">{position}</p>
      </div>
    </div>
  );
};

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState('about-myself');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState({
    submitting: false,
    submitted: false,
    error: null
  });

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    } else if (!savedTheme) {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  // Handle scroll to update active section
  useEffect(() => {
    const handleScroll = () => {
      // Remove testimonials from the sections array
      const sections = ['about-myself', 'skills', 'education', 'projects', 'experience', 'hobbies', 'contact-me'];
      const headerContainer = document.querySelector('.header-container');
      
      // Add scrolled class when user scrolls down past hero section
      if (window.scrollY > 100) {
        headerContainer?.classList.add('scrolled');
      } else {
        headerContainer?.classList.remove('scrolled');
      }
      
      for (const sectionId of sections) {
        const section = document.getElementById(sectionId);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus({ submitting: true, submitted: false, error: null });
    
    // Using fetch to submit to Formspree
    fetch('https://formspree.io/f/mnnddnvb', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        message: formData.message
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      setFormStatus({ 
        submitting: false, 
        submitted: true, 
        error: null 
      });
      setFormData({ name: '', email: '', message: '' });
      
      // Reset form status after 5 seconds
      setTimeout(() => {
        setFormStatus(prev => ({ ...prev, submitted: false }));
      }, 5000);
    })
    .catch(error => {
      setFormStatus({ 
        submitting: false, 
        submitted: false, 
        error: 'Failed to send message. Please try again.' 
      });
      console.error('Error:', error);
    });
  };

  return (
    <div className={darkMode ? 'dark-mode' : 'light-mode'}>
      <MyNavbar activeSection={activeSection} />
      
      {/* Header Container */}
      <div className="header-container">
        <div className="header-links">
          <a href="mailto:paudela@union.edu" target="_blank" rel="noopener noreferrer" className="icon-link" aria-label="Email">
            <FiMail size={20} className="icon" />
          </a>
          <a href="https://www.linkedin.com/in/avigya-paudel-531119306/" target="_blank" rel="noopener noreferrer" className="icon-link" aria-label="LinkedIn">
            <FaLinkedin size={20} className="icon" />
          </a>
          <a href="https://github.com/Avi161" target="_blank" rel="noopener noreferrer" className="icon-link" aria-label="GitHub">
            <FaGithub size={20} className="icon" />
          </a>
        </div>
        <div className="theme-toggle">
          <button onClick={toggleTheme} className="toggle-button" aria-label="Toggle theme">
            {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Hello I'm <span className="highlight">Avigya Paudel</span></h1>
          <h2 className="hero-subtitle">Computer Science & Mathematics Student</h2>
          <p className="hero-text">Building innovative solutions through code and creativity</p>
          <div className="hero-buttons">
          </div>
        </div>
      </section>

      {/* About Myself Section */}
      <AnimatedSection id="about-myself" className="about-section">
        <div className="about-container">
          <h1 className="section-title">About Myself</h1>
          <div className="about-content">
            <div className="about-image">
              <div className="profile-image-container">
                <img src={profileImage} alt="Avi Paudel" />
              </div>
            </div>
            <div className="about-text">
              <p>
                Hi, I'm Avi! I'm a freshman at Union College majoring in Computer Science
                and Mathematics. I have hands-on experience in programming, leadership,
                internships, teamwork, and teaching.
              </p>
              <p>
                My passion lies in solving complex problems and building impactful solutions 
                through technology. I believe in continuous learning and pushing boundaries
                to create innovative applications that make a difference.
              </p>
              <div className="about-stats">
                <div className="stat">
                  <span className="stat-number">1+</span>
                  <span className="stat-label">Years Experience</span>
                </div>
                <div className="stat">
                  <span className="stat-number">5+</span>
                  <span className="stat-label">Projects</span>
                </div>
                <div className="stat">
                  <span className="stat-number">4+</span>
                  <span className="stat-label">Programming Languages</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Skills Section - Updated from Resume */}
      <AnimatedSection id="skills" className="skills-section">
        <h1 className="section-title">Skills</h1>
        <div className="skills-container">
          <div className="skills-card">
            <h3>Programming Languages</h3>
            <div className="skills-list">
              <SkillTag skill="Python" />
              <SkillTag skill="C/C++" />
              <SkillTag skill="Java" />
              <SkillTag skill="JavaScript/TypeScript" />
              <SkillTag skill="SQL" />
            </div>
          </div>
          <div className="skills-card">
            <h3>Web Development</h3>
            <div className="skills-list">
              <SkillTag skill="HTML & CSS" />
              <SkillTag skill="React" />
              <SkillTag skill="Next.js" />
              <SkillTag skill="Node.js" />
              <SkillTag skill="RESTful APIs" />
              <SkillTag skill="Firebase" />
            </div>
          </div>
          <div className="skills-card">
            <h3>Tools & Technologies</h3>
            <div className="skills-list">
              <SkillTag skill="Git/GitHub" />
              <SkillTag skill="VS Code" />
              <SkillTag skill="Arduino" />
              <SkillTag skill="Linux" />
              <SkillTag skill="Docker" />
              <SkillTag skill="MongoDB" />
            </div>
          </div>
          <div className="skills-card">
            <h3>Languages</h3>
            <div className="skills-list">
              <SkillTag skill="English" />
              <SkillTag skill="Nepali" />
              <SkillTag skill="Hindi" />
              <SkillTag skill="German (Basic)" />
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Education Section - Updated from Resume */}
      <AnimatedSection id="education" className="education-section section">
        <h1 className="section-title">Education</h1>
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <div className="timeline-date">Sept 2024 - Present</div>
              <h3>Union College</h3>
              <p>Bachelor of Science in Computer Science and Mathematics</p>
              <ul>
                <li><strong>GPA:</strong> 4.0/4.0 | <strong>Honors:</strong> Union Scholar</li>
                <li><strong>Relevant Coursework:</strong> Object Oriented Programming, Data Structures and Algorithms, Linear Algebra, Discrete Mathematics, Multivariable Calculus, Integral Vector Calculus</li>
                <li><strong>Activities:</strong> Union College ICPC Team Member, ACM-W Member, CodePath Advanced Technical Interview Prep, Goldman Sachs Possibilities Summit, Harvard CS50x Introduction to Computer Science</li>
              </ul>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Experience Section - Updated from Resume */}
      <AnimatedSection id="experience" className="experience-section section">
        <h1 className="section-title">Experience</h1>
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <div className="timeline-date">Sept 2024 - Present</div>
              <h3>Undergraduate Research Assistant</h3>
              <p>Union College Department of Computer Science</p>
              <ul>
                <li>Researching algorithmic optimizations for matrix multiplication with a team of 6 student researchers</li>
                <li>Implementing and evaluating the Cohn-Umans group-theoretic framework in C++ to improve matrix multiplication complexity</li>
                <li>Analyzing Strong Uniquely Solvable Puzzles (SUSP) to reduce algorithmic complexity from O(n³) to O(n²·⁵⁰⁵)</li>
              </ul>
            </div>
          </div>
          
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <div className="timeline-date">Sept 2023 - Aug 2024</div>
              <h3>A-Levels Computer Science Tutor</h3>
              <p>Self-employed</p>
              <ul>
                <li>Developed and delivered personalized curriculum for A-Levels Computer Science to 3 students, resulting in average grade improvement of 15%</li>
                <li>Created hands-on programming exercises in Python focusing on Object-Oriented Programming, Data Structures, and Algorithms</li>
                <li>Designed bi-weekly assessment with targeted feedback loops, significantly increasing student concept retention</li>
              </ul>
            </div>
          </div>
          
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <div className="timeline-date">Aug 2023 - Nov 2023</div>
              <h3>Web Development Intern</h3>
              <p>Nobel Navigators</p>
              <ul>
                <li>Led development of two AI-themed interactive web projects for EXPO, engaging over 115 attendees and receiving 92% positive feedback</li>
                <li>Engineered responsive websites using WordPress, implementing modern UI/UX design practices and custom CSS</li>
                <li>Co-facilitated 5 training workshops for 20+ interns on leadership skills and WordPress development techniques</li>
              </ul>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Projects Section - Updated from Resume */}
      <AnimatedSection id="projects" className="section text-center">
        <h1 className="section-title">Projects</h1>
        <div className="projects-container">
          <ProjectCard 
            title="Smart Medication Management System"
            description="Engineered an Automatic Pill Dispenser system with Arduino microcontroller and servo mechanisms for medication adherence targeting elderly and visually impaired users. Developed embedded C++ firmware implementing scheduled dispensing algorithms, emergency override protocols, and user authentication. Created iOS companion app using React Native and Firebase."
            technologies={['C++', 'Arduino', 'React Native', 'Firebase', 'REST API']}
            link="https://github.com/Avi161/engineering-wizards"
          />
          
          <ProjectCard 
            title="NLP-Powered Content Assistant"
            description="Developed a Chrome extension that leverages GPT-4 API to summarize and translate web content across 5 languages. Implemented secure API integration with token management and rate limiting to optimize natural language processing workflows. Created intuitive UI with responsive design principles."
            technologies={['JavaScript', 'HTML', 'CSS', 'Chrome Extension API', 'OpenAI API']}
            link="https://github.com/Avi161/AI-Summariser-and-Translator"
          />
          
          <ProjectCard 
            title="Personal Portfolio Website"
            description="Designed and developed a responsive personal portfolio website using React.js. Features include dark mode, responsive design, and interactive elements to showcase projects and experience."
            technologies={['React.js', 'CSS', 'JavaScript', 'HTML']}
            link="https://github.com/Avi161"
          />
        </div>
      </AnimatedSection>

      {/* Resume Section - Centered with Form */}
      <AnimatedSection id="resume" className="resume-section text-center">
        <div className="resume-container">
          <h1 className="section-title">Contact Me</h1>
          <div className="contact-form-wrapper">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input 
                  type="text" 
                  id="name"
                  name="name" 
                  placeholder="Your Name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email"
                  name="email" 
                  placeholder="Your Email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea 
                  id="message"
                  name="message" 
                  rows="5" 
                  placeholder="Your Message" 
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
              <button 
                className="contact-button" 
                type="submit" 
                disabled={formStatus.submitting}
              >
                {formStatus.submitting ? 'Sending...' : 'Send Message'}
              </button>
              
              {formStatus.submitted && (
                <div className="form-success">
                  Message sent successfully! I'll get back to you soon.
                </div>
              )}
              
              {formStatus.error && (
                <div className="form-error">
                  {formStatus.error}
                </div>
              )}
            </form>
          </div>
        </div>
      </AnimatedSection>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>© {new Date().getFullYear()} Avi Paudel. All rights reserved.</p>
          <div className="footer-links">
            <a href="#about-myself">About</a>
            <a href="#skills">Skills</a>
            <a href="#projects">Projects</a>
            <a href="#contact-me">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
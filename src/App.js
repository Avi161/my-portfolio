import React, { useState, useEffect, useRef } from 'react';
import { 
  createBrowserRouter, 
  RouterProvider, 
  ScrollRestoration, 
  Outlet,
  useLocation,
  useOutletContext
} from 'react-router-dom';
import MyNavbar from './components/MyNavbar';
import BlogsPage from './pages/BlogsPage';
import { FiMail } from 'react-icons/fi';
import { FaLinkedin, FaGithub, FaMoon, FaSun, FaDownload } from 'react-icons/fa';
import './App.css';
import profileImage from './components/me.png';

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

// New RootLayout component for global theme and structure
const RootLayout = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });
  const location = useLocation();
  const isBlogPage = location.pathname.startsWith('/blogs');

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prevMode => !prevMode);
  };

  const effectiveDarkMode = isBlogPage ? false : darkMode;
  const themeClass = effectiveDarkMode ? 'dark-mode' : 'light-mode';

  // Pass down effectiveDarkMode and toggleTheme via context
  const contextValue = { darkMode: effectiveDarkMode, toggleTheme };

  return (
    <div className={themeClass}>
      <Outlet context={contextValue} />
      <ScrollRestoration />
    </div>
  );
};

function App() {
  // activeSection and setActiveSection are now managed by HomePage
  // darkMode and toggleTheme are managed by RootLayout

  const router = createBrowserRouter([
    {
      element: <RootLayout />, // RootLayout provides theme and Outlet
      children: [
        {
          path: "/",
          element: <HomePage />, // Props like activeSection, darkMode, toggleTheme are handled internally or via context
        },
        {
          path: "/blogs",
          element: <BlogsPage />, // Will get darkMode=false and toggleTheme from context
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

// Update HomePage to use context and manage its own activeSection
const HomePage = () => {
  const { darkMode, toggleTheme } = useOutletContext(); // Get theme from context
  const [activeSection, setActiveSection] = useState(''); // Manage activeSection locally
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    fetch("https://formspree.io/f/mnnddnvb", {
      method: "POST",
      body: formData,
      headers: { 'Accept': 'application/json' }
    })
    .then(response => {
      if (response.ok) {
        setFormSubmitted(true);
        form.reset();
      } else {
        throw new Error('Form submission failed');
      }
    })
    .catch(error => {
      console.error("Form error:", error);
      alert("Sorry, there was a problem submitting your form.");
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['about-myself', 'skills', 'education', 'experience', 'projects', 'contact-me', 'hobbies', 'resume'];
      let currentSection = ''; // Default to empty
      const offset = window.innerHeight * 0.3; // 30% from the top of the viewport

      for (const sectionId of sections) {
        const section = document.getElementById(sectionId);
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionBottom = sectionTop + section.offsetHeight;
          // Check if the top of the section is within the viewport (below the offset)
          // and the bottom of the section is also somewhat visible or has been passed
          if (window.scrollY >= sectionTop - offset && window.scrollY < sectionBottom - offset) {
             currentSection = sectionId;
             break; // Found the current section
          }
        }
      }
       // Fallback if no section is actively matched, e.g., for top of page or between sections
      if (!currentSection && window.scrollY < document.getElementById(sections[0])?.offsetTop - offset) {
        currentSection = ''; // Or specific ID like 'hero' if you have one
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // No dependency on setActiveSection as it's from the same scope


  return (
    <>
      <MyNavbar 
        activeSection={activeSection} // Use local activeSection
        darkMode={darkMode} // From context
        toggleTheme={toggleTheme} // From context
      />
      
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
            </div>
          </div>
          
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <div className="timeline-date">Sept 2023 - Aug 2024</div>
              <h3>A-Levels Computer Science Tutor</h3>
              <p>Self-employed</p>
            </div>
          </div>
          
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <div className="timeline-date">Aug 2023 - Nov 2023</div>
              <h3>Web Development Intern</h3>
              <p>Nobel Navigators</p>
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
            description="Engineered an Automatic Pill Dispenser system with Arduino microcontroller and servo mechanisms for medication adherence targeting elderly and visually impaired users. "
            technologies={['C++', 'Arduino', 'React Native', 'Firebase', 'REST API']}
            link="https://github.com/Avi161/engineering-wizards"
          />
          
          <ProjectCard 
            title="NLP-Powered Content Assistant"
            description="Developed a Chrome extension that leverages GPT-4 API to summarize and translate web content across 5 languages. "
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

      {/* Hobbies Section */}
      <AnimatedSection id="hobbies" className="hobbies-section section">
        <h1 className="section-title">Hobbies</h1>
        <div className="floating-hobbies">
          <div className="hobby-bubble" style={{animationDelay: '0s'}}>Chess</div>
          <div className="hobby-bubble" style={{animationDelay: '1s'}}>Badminton</div>
          <div className="hobby-bubble" style={{animationDelay: '2s'}}>Meditation</div>
          <div className="hobby-bubble" style={{animationDelay: '3s'}}>Running</div>
          <div className="hobby-bubble" style={{animationDelay: '4s'}}>Coding</div>
          <div className="hobby-bubble" style={{animationDelay: '5s'}}>Socializing</div>
        </div>
      </AnimatedSection>

      {/* Resume Section */}
      <AnimatedSection id="resume" className="resume-section section text-center">
        <h1 className="section-title">Resume</h1>
        <div className="resume-container">
          <div className="resume-content">
            <p>
              View my full resume to learn more about my experience, education, and skills.
            </p>
            <div className="resume-buttons">
              <a 
                href="/resume.pdf" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="resume-button"
              >
                <FaDownload style={{ marginRight: '8px' }} /> Download Resume
              </a>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Contact Me Section */}
      <AnimatedSection id="contact-me" className="resume-section text-center"> {/* Consider renaming id to "contact" if section title is "Contact Me" */}
        <div className="resume-container"> {/* Consider a more generic class like "content-container" or "form-container" */}
          <h1 className="section-title">Contact Me</h1>
          <div className="contact-form-wrapper">
            {!formSubmitted ? (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input 
                    type="text" 
                    id="name"
                    name="name" 
                    placeholder="Your Name" 
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
                    required
                  ></textarea>
                </div>
                <button 
                  className="contact-button" 
                  type="submit"
                >
                  Send Message
                </button>
              </form>
            ) : (
              <div className="form-success">
                Message sent successfully! I'll get back to you soon.
              </div>
            )}
          </div>
        </div>
      </AnimatedSection>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>© {new Date().getFullYear()} All rights reserved.</p>
          <div className="footer-links">
            <a href="#about-myself">About</a>
            <a href="#skills">Skills</a>
            <a href="#projects">Projects</a>
            <a href="#contact-me">Contact</a> {/* Ensure this matches an ID */}
          </div>
        </div>
      </footer>
    </>
  );
};

export default App;
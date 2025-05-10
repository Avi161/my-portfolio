import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMail, FiMenu, FiX } from 'react-icons/fi';
import { FaLinkedin, FaGithub, FaMoon, FaSun } from 'react-icons/fa';

const MyNavbar = ({ activeSection, darkMode, toggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  const linkPrefix = isHomePage ? '' : '/';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Handle hash navigation with scrolling
  const handleHashNavigation = (e, sectionId) => {
    e.preventDefault();
    
    if (isHomePage) {
      // If already on homepage, just scroll to the section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      // Update URL without page reload
      window.history.pushState(null, '', `#${sectionId}`);
    } else {
      // If on another page, navigate to homepage with hash
      navigate('/', { state: { scrollToSection: sectionId } });
    }
  };

  // Effect to handle scrolling when navigating from another page
  useEffect(() => {
    // Check if we have a section to scroll to in location state
    if (location.state?.scrollToSection) {
      const sectionId = location.state.scrollToSection;
      
      // Use setTimeout to ensure DOM is ready
      const timer = setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="nav-left">
          <Link to="/" className="logo">AP</Link>
        </div>

        <div className="nav-center desktop-nav">
          <a 
            href="#about-myself" 
            onClick={(e) => handleHashNavigation(e, 'about-myself')}
            className={activeSection === 'about-myself' ? 'active' : ''}
          >
            About
          </a>
          <a 
            href="#skills" 
            onClick={(e) => handleHashNavigation(e, 'skills')}
            className={activeSection === 'skills' ? 'active' : ''}
          >
            Skills
          </a>
          <a 
            href="#education" 
            onClick={(e) => handleHashNavigation(e, 'education')} 
            className={activeSection === 'education' ? 'active' : ''}
          >
            Education
          </a>
          <a 
            href="#projects" 
            onClick={(e) => handleHashNavigation(e, 'projects')}
            className={activeSection === 'projects' ? 'active' : ''}
          >
            Projects
          </a>
          <Link to="/blogs" className={activeSection === 'blogs' ? 'active' : ''}>
            Blog
          </Link>
          <a 
            href="#contact-me" 
            onClick={(e) => handleHashNavigation(e, 'contact-me')}
            className={activeSection === 'contact-me' ? 'active' : ''}
          >
            Contact
          </a>
        </div>

        <div className="nav-right">
          {/* Social icons remain unchanged */}
          <a
            href="mailto:paudela@union.edu"
            target="_blank"
            rel="noopener noreferrer"
            className="icon-button email-icon desktop-icon"
            aria-label="Email"
          >
            <FiMail size={20} />
          </a>
          <a
            href="https://www.linkedin.com/in/avigya-paudel-531119306/"
            target="_blank"
            rel="noopener noreferrer"
            className="icon-button linkedin-icon desktop-icon"
            aria-label="LinkedIn"
          >
            <FaLinkedin size={20} />
          </a>
          <a
            href="https://github.com/Avi161"
            target="_blank"
            rel="noopener noreferrer"
            className="icon-button github-icon desktop-icon"
            aria-label="GitHub"
          >
            <FaGithub size={20} />
          </a>
          <button
            onClick={toggleTheme}
            className="icon-button theme-toggle"
            aria-label="Toggle theme"
          >
            {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
          </button>

          <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu">
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          <a href="#about-myself" onClick={(e) => { handleHashNavigation(e, 'about-myself'); toggleMobileMenu(); }}>About</a>
          <a href="#skills" onClick={(e) => { handleHashNavigation(e, 'skills'); toggleMobileMenu(); }}>Skills</a>
          <a href="#education" onClick={(e) => { handleHashNavigation(e, 'education'); toggleMobileMenu(); }}>Education</a>
          <a href="#projects" onClick={(e) => { handleHashNavigation(e, 'projects'); toggleMobileMenu(); }}>Projects</a>
          <Link to="/blogs" onClick={toggleMobileMenu}>Blog</Link>
          <a href="#contact-me" onClick={(e) => { handleHashNavigation(e, 'contact-me'); toggleMobileMenu(); }}>Contact</a>
          <div className="mobile-menu-social-icons">
            <a href="mailto:paudela@union.edu" target="_blank" rel="noopener noreferrer" aria-label="Email"><FiMail size={22} /></a>
            <a href="https://www.linkedin.com/in/avigya-paudel-531119306/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin size={22} /></a>
            <a href="https://github.com/Avi161" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FaGithub size={22} /></a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default MyNavbar;


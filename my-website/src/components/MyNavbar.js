import React from 'react';
import { Link } from 'react-router-dom';

const MyNavbar = ({ activeSection }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo">
          <Link to="/">AP</Link>
        </div>
        <div className="nav-links">
          <a href="#about-myself" className={activeSection === 'about-myself' ? 'active' : ''}>About</a>
          <a href="#skills" className={activeSection === 'skills' ? 'active' : ''}>Skills</a>
          <a href="#projects" className={activeSection === 'projects' ? 'active' : ''}>Projects</a>
          <a href="#contact-me" className={activeSection === 'contact-me' ? 'active' : ''}>Contact</a>
          <Link to="/blogs" className={window.location.pathname === '/blogs' ? 'active' : ''}>Blog</Link>
        </div>
      </div>
    </nav>
  );
};

export default MyNavbar;
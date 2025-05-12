import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaMoon, FaSun } from 'react-icons/fa';
import './MyNavbar.css';

const MyNavbar = ({ activeSection, darkMode, toggleTheme }) => {
  const navbarClassName = darkMode ? 'navbar-dark' : 'navbar-light';
  const logoSrc = darkMode ? "/path/to/dark-mode-logo.png" : "/path/to/light-mode-logo.png";

  return (
    <nav className={`navbar ${navbarClassName} fixed-top navbar-expand-lg`}>
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          Your Name/Brand
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/#skills">Skills</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/blogs">Blog</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/#contact-me">Contact</NavLink>
            </li>
            {toggleTheme && (
              <li className="nav-item ms-lg-3">
                <button onClick={toggleTheme} className="btn theme-toggle-button" aria-label="Toggle theme">
                  {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default MyNavbar;
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => (
  <header className="site-header">
    <div className="header-inner">
      <Link to="/" className="site-title">Avigya Paudel</Link>
      <nav className="site-nav">
        <Link to="/blog">Blog</Link>
        <a href="https://github.com/Avi161" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="mailto:paudela@union.edu">Contact</a>
      </nav>
    </div>
  </header>
);

export default Header;

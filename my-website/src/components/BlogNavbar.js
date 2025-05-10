import React from 'react';
import { Link } from 'react-router-dom';
import './Blogs.css';

const BlogNavbar = () => {
  return (
    <nav className="blog-navbar">
      <ul className="blog-navbar-list">
        <li><Link to="/blogs">Home</Link></li>
        <li><Link to="/blogs/category1">Category 1</Link></li>
        <li><Link to="/blogs/category2">Category 2</Link></li>
        <li><Link to="/blogs/category3">Category 3</Link></li>
        <li><Link to="/blogs/about">About</Link></li>
      </ul>
    </nav>
  );
};

export default BlogNavbar;
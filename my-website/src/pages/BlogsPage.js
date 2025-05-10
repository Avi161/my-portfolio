import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Blogs.css';

const BlogsPage = () => {
  return (
    <div className="blog-page">
      {/* Fixed Navigation Bar */}
      <nav className="blog-navbar">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/blogs">All Blogs</Link></li>
          <li><a href="#tech">Tech</a></li>
          <li><a href="#personal">Personal</a></li>
        </ul>
      </nav>

      {/* Blog Content */}
      <div className="blog-content">
        <h1>My Blog Posts</h1>
        
        {/* Sample Blog Cards */}
        <div className="blog-card">
          <img src="/blog-placeholder.jpg" alt="Blog thumbnail" />
          <h2>Getting Started with React</h2>
          <p>Posted on May 9, 2025</p>
          <p>Learn the fundamentals of React and build your first component...</p>
          <Link to="/blogs/react-fundamentals">Read More</Link>
        </div>
        
        <div className="blog-card">
          <img src="/blog-placeholder.jpg" alt="Blog thumbnail" />
          <h2>My Journey as a CS Student</h2>
          <p>Posted on May 5, 2025</p>
          <p>Reflections on my experiences at Union College and what I've learned so far...</p>
          <Link to="/blogs/cs-journey">Read More</Link>
        </div>
      </div>
    </div>
  );
};

export default BlogsPage;
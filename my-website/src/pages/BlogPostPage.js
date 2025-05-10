import React from 'react';
import { useParams, Link } from 'react-router-dom';

const BlogPostPage = () => {
  const { slug } = useParams();
  
  // In a real app, you would fetch the blog post data based on the slug
  
  return (
    <div className="blog-page">
      <nav className="blog-navbar">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/blogs">All Blogs</Link></li>
        </ul>
      </nav>
      
      <div className="blog-content">
        <div className="blog-post">
          <h1>Sample Blog Post Title</h1>
          <p className="blog-date">May 9, 2025</p>
          
          <div className="blog-post-content">
            <p>This is a sample blog post content. In a real application, you would fetch this content from a database or CMS.</p>
            
            <p>You can style this page however you want with HTML and CSS.</p>
            
            <h2>A Subheading</h2>
            <p>More content goes here...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;

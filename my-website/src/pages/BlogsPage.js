import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Blogs.css';
import BlogCard from '../components/BlogCard'; // Import BlogCard
import { blogPosts } from '../data/blogPosts'; // Import blogPosts

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
        
        {/* Render BlogCards from data */}
        {blogPosts.map(post => (
          <BlogCard
            key={post.id}
            title={post.title}
            image={post.image}
            excerpt={post.content.substring(0, 100) + '...'} // Create an excerpt
          />
        ))}
      </div>
    </div>
  );
};

export default BlogsPage;
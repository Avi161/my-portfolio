import React from 'react';
import './Blogs.css';

const BlogCard = ({ title, image, excerpt }) => {
  return (
    <div className="blog-card">
      <img src={image} alt={title} className="blog-image" />
      <h2 className="blog-title">{title}</h2>
      <p className="blog-excerpt">{excerpt}</p>
    </div>
  );
};

export default BlogCard;
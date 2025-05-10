import React from 'react';
import { Link } from 'react-router-dom';
import './Blogs.css';

const BlogSidebar = () => {
  return (
    <aside className="blog-sidebar">
      <h2>Categories</h2>
      <ul>
        <li><Link to="/blogs/category1">Category 1</Link></li>
        <li><Link to="/blogs/category2">Category 2</Link></li>
        <li><Link to="/blogs/category3">Category 3</Link></li>
      </ul>
      <h2>Recent Posts</h2>
      <ul>
        <li><Link to="/blogs/post1">Post Title 1</Link></li>
        <li><Link to="/blogs/post2">Post Title 2</Link></li>
        <li><Link to="/blogs/post3">Post Title 3</Link></li>
      </ul>
    </aside>
  );
};

export default BlogSidebar;
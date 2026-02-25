import React from 'react';
import { Link } from 'react-router-dom';
import blogPosts from '../data/blogPosts';

const BlogListPage = () => (
  <div className="blog-list-page">
    <section className="blog-list">
      <h2>Writing</h2>
      {blogPosts.map((post) => (
        <article key={post.slug} className="blog-entry">
          <div className="blog-entry-header">
            <Link to={`/blog/${post.slug}`} className="blog-entry-title">
              {post.title}
            </Link>
            <span className="blog-entry-date">{post.date}</span>
          </div>
          <p className="blog-entry-summary">{post.summary}</p>
        </article>
      ))}
    </section>
  </div>
);

export default BlogListPage;

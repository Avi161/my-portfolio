import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { publicPosts } from '../data/blogPosts';

const sections = [...new Set(publicPosts.map((p) => p.category).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b));

const BlogsListPage = () => {
  const [searchParams] = useSearchParams();
  const active = searchParams.get('section');
  const shown = active ? publicPosts.filter((p) => p.category === active) : publicPosts;

  return (
    <div className="blog-list-page">
      <section className="blog-list">
        <h2>Writing</h2>
        {sections.length > 0 && (
          <nav className="blog-tabs">
            <Link to="/blog" className={!active ? 'is-active' : ''}>All</Link>
            {sections.map((s) => (
              <Link
                key={s}
                to={`/blog?section=${encodeURIComponent(s)}`}
                className={active === s ? 'is-active' : ''}
              >
                {s}
              </Link>
            ))}
          </nav>
        )}
        {shown.length === 0 && <p className="blog-empty">No posts in this section yet.</p>}
        {shown.map((post) => (
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
};

export default BlogsListPage;

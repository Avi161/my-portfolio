import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { publicPosts } from '../data/blogPosts';
import { getPrivatePosts, hasAdminSession } from './admin/api';

const BlogsListPage = () => {
  const [searchParams] = useSearchParams();
  const active = searchParams.get('section');

  // With an admin session, private posts (fetched at runtime — they're never
  // in the bundle) appear in the list too, marked Private. Visitors without a
  // session never make the request.
  const [privatePosts, setPrivatePosts] = useState([]);
  useEffect(() => {
    if (!hasAdminSession()) return undefined;
    let alive = true;
    getPrivatePosts()
      .then((data) => alive && setPrivatePosts(data.posts))
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const posts = useMemo(
    () => [...publicPosts, ...privatePosts].sort((a, b) => b.date.localeCompare(a.date)),
    [privatePosts]
  );
  const sections = useMemo(
    () => [...new Set(posts.map((p) => p.category).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b)),
    [posts]
  );
  const shown = active ? posts.filter((p) => p.category === active) : posts;

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
              {post.category && (
                <Link
                  to={`/blog?section=${encodeURIComponent(post.category)}`}
                  className="blog-entry-category"
                >
                  {post.category}
                </Link>
              )}
              {post.public === false && <span className="blog-post-private">Private</span>}
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

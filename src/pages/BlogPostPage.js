import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { allPosts } from '../data/blogPosts';
import { getPrivatePosts, hasAdminSession } from './admin/api';
import { splitPath } from '../lib/sections';

const BlogPostPage = () => {
  const { slug } = useParams();
  const bundled = allPosts.find((p) => p.slug === slug);

  // Private posts never ship in the bundle; with an admin session they're
  // fetched at runtime. null = resolved-and-absent, so visitors without a
  // session fall straight through to "Post not found".
  const [privatePost, setPrivatePost] = useState(bundled || !hasAdminSession() ? null : undefined);
  useEffect(() => {
    if (bundled || !hasAdminSession()) return undefined;
    let active = true;
    getPrivatePosts()
      .then((data) => active && setPrivatePost(data.posts.find((p) => p.slug === slug) || null))
      .catch(() => active && setPrivatePost(null));
    return () => { active = false; };
  }, [slug, bundled]);

  const post = bundled || privatePost;
  const loading = !bundled && privatePost === undefined;

  useEffect(() => {
    if (post) {
      document.title = `${post.title} — Avigya Paudel`;
    } else if (!loading) {
      document.title = 'Post Not Found — Avigya Paudel';
    }
    return () => {
      document.title = 'Avigya Paudel';
    };
  }, [post, loading]);

  if (loading) return null;

  if (!post) {
    return (
      <div className="blog-post">
        <h1>Post not found</h1>
        <p>
          <Link to="/">Back to home</Link>
        </p>
      </div>
    );
  }

  return (
    <article className="blog-post">
      <header className="blog-post-header">
        <h1>{post.title}</h1>
        <time className="blog-post-date">{post.date}</time>
        {post.category && (
          <>
            {' · '}
            {splitPath(post.category).map((seg, i, arr) => {
              // Private posts live under the Private tab, so their section
              // links carry the virtual "Private/" prefix.
              const base = post.public === false ? ['Private'] : [];
              const path = [...base, ...arr.slice(0, i + 1)].join('/');
              return (
                <React.Fragment key={path}>
                  {i > 0 && <span className="blog-post-category-sep"> / </span>}
                  <Link
                    className="blog-post-category"
                    to={`/blog?section=${encodeURIComponent(path)}`}
                  >
                    {seg}
                  </Link>
                </React.Fragment>
              );
            })}
          </>
        )}
        {post.public === false && (
          <>
            {' · '}
            <span className="blog-post-private">Private</span>
          </>
        )}
        {post.tags && post.tags.length > 0 && (
          <div className="blog-post-tags">
            {post.tags.map((t) => (
              <Link key={t} to={`/blog?tag=${encodeURIComponent(t)}`} className="blog-entry-tag">
                #{t}
              </Link>
            ))}
          </div>
        )}
      </header>
      <div
        className="blog-post-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      <div className="blog-post-back">
        <Link to="/">← Back to all posts</Link>
      </div>
    </article>
  );
};

export default BlogPostPage;

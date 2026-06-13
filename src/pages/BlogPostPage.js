import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { allPosts } from '../data/blogPosts';
import { getPrivatePosts, hasAdminSession } from './admin/api';

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
            <Link
              className="blog-post-category"
              to={`/blog?section=${encodeURIComponent(post.category)}`}
            >
              {post.category}
            </Link>
          </>
        )}
        {post.public === false && (
          <>
            {' · '}
            <span className="blog-post-private">Private</span>
          </>
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

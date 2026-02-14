import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import blogPosts from '../data/blogPosts';

const BlogPostPage = () => {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);

  useEffect(() => {
    if (post) {
      document.title = `${post.title} — Avigya Paudel`;
    } else {
      document.title = 'Post Not Found — Avigya Paudel';
    }
    return () => {
      document.title = 'Avigya Paudel';
    };
  }, [post]);

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

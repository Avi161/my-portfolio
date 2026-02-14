import React from 'react';
import { Link } from 'react-router-dom';
import blogPosts from '../data/blogPosts';

const HomePage = () => (
  <div className="home-page">
    <section className="intro">
      <p>
        I'm <strong>Avigya Paudel</strong>, a Computer Science and Mathematics
        student at <a href="https://www.union.edu/" target="_blank" rel="noopener noreferrer">Union College</a>.
        I'm interested in AI Safety — understanding how to build AI systems that
        are aligned with human values and remain safe as they become more capable.
      </p>
      <p>
        Currently, I'm an ML Researcher at{' '}
        <a href="https://www.algoverse.ai/" target="_blank" rel="noopener noreferrer">Algoverse</a>{' '}
        and an Undergraduate Research Assistant at Union College's Computer
        Science Department.
      </p>
      <p className="intro-links">
        <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">Resume</a> &middot;{' '}
        <a href="https://github.com/Avi161" target="_blank" rel="noopener noreferrer">GitHub</a> &middot;{' '}
        <a href="https://www.linkedin.com/in/avigya-paudel-531119306/" target="_blank" rel="noopener noreferrer">LinkedIn</a> &middot;{' '}
        <a href="mailto:paudela@union.edu">paudela@union.edu</a>
      </p>
    </section>

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

export default HomePage;

import React from 'react';
import { Link } from 'react-router-dom';
import { NAME, Bio } from './home/content';
import summitPhoto from './home/avi-summit.jpg';
import './home/home.css';

// Minimalist homepage: the owner's real summit photo beside the verbatim bio.
// Motion stays subtle — a staggered rise on load and a near-imperceptible
// breathe on the photo; everything stops under prefers-reduced-motion.
export default function HomePage() {
  return (
    <section className="home-hero">
      <div className="home-head">
        <h1 className="home-name">{NAME}</h1>
        <p className="home-role">CS &amp; Math | AI Safety</p>
      </div>
      <figure className="home-photo">
        <div className="home-photo-crop">
          <img
            src={summitPhoto}
            alt="Avigya Paudel sitting on granite boulders at a mountain summit, feeding a chipmunk"
          />
        </div>
      </figure>
      <Bio className="home-bio" />
      <div className="home-cta">
        <Link to="/blog" className="home-btn">Blog</Link>
        <Link to="/contact" className="home-btn home-btn-ghost">Contact</Link>
      </div>
    </section>
  );
}

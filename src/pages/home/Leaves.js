import React from 'react';
import { Link } from 'react-router-dom';
import { Bio } from './content';
import useReveal from './useReveal';

// Autumn road under orange trees (Unsplash, free license).
const PHOTO = 'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?q=80&w=2000&auto=format&fit=crop';

// Design — "Autumn": real autumn road with fog, breathing through a slow
// pull-back. No overlays — the photo carries the scene.
export default function Leaves() {
  const ref = useReveal();
  return (
    <div className="hv hv8" ref={ref}>
      <section className="hv-bleed hv8-hero">
        <div className="hv8-backdrop" style={{ backgroundImage: `url(${PHOTO})` }} aria-hidden="true" />
        <div className="hv8-shade" aria-hidden="true" />
        <div className="hv8-inner">
          <h1 className="hv8-name">Avigya Paudel</h1>
          <p className="hv8-tag">CS &amp; Math | AI Safety</p>
          <div className="hv8-cta">
            <Link to="/blog" className="hv-btn">Blog</Link>
            <Link to="/contact" className="hv-btn hv-btn-ghost">Contact</Link>
          </div>
        </div>
      </section>
      <section className="hv8-bio" data-reveal>
        <Bio className="hv-bio" />
      </section>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Bio } from './content';
import useReveal from './useReveal';

// Misty pine forest (Unsplash, free license). Swap for a local/own photo
// before shipping the winner.
const PHOTO = 'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?q=80&w=2000&auto=format&fit=crop';

// Just a handful of faint fireflies, low between the trees — dusk, not
// fairy lights. Each gets its own wander speed and flicker rhythm.
const FLIES = [
  { top: '62%', left: '14%', wander: 15, flicker: 4.2, delay: 0.8 },
  { top: '74%', left: '32%', wander: 18, flicker: 5.1, delay: 2.4 },
  { top: '58%', left: '78%', wander: 14, flicker: 4.6, delay: 0 },
  { top: '80%', left: '64%', wander: 17, flicker: 5.6, delay: 3.5 },
  { top: '68%', left: '48%', wander: 20, flicker: 4.9, delay: 1.6 },
];

// Design 6 — "Forest": real misty pine forest, slow push-in, fireflies
// drifting between the trees.
export default function Fireflies() {
  const ref = useReveal();
  return (
    <div className="hv hv6" ref={ref}>
      <section className="hv-bleed hv6-hero">
        <div className="hv6-backdrop" style={{ backgroundImage: `url(${PHOTO})` }} aria-hidden="true" />
        <div className="hv6-shade" aria-hidden="true" />
        <span className="hv6-mist hv6-mist-a" aria-hidden="true" />
        <span className="hv6-mist hv6-mist-b" aria-hidden="true" />
        {FLIES.map((f, i) => (
          <span
            key={i}
            className="hv6-fly"
            aria-hidden="true"
            style={{
              top: f.top,
              left: f.left,
              animationDuration: `${f.wander}s, ${f.flicker}s`,
              animationDelay: `${f.delay}s, ${f.delay}s`,
            }}
          />
        ))}
        <div className="hv6-inner">
          <h1 className="hv6-name">Avigya Paudel</h1>
          <p className="hv6-tag">CS &amp; Math | AI Safety</p>
          <div className="hv6-cta">
            <Link to="/blog" className="hv-btn">Blog</Link>
            <Link to="/contact" className="hv-btn hv-btn-ghost">Contact</Link>
          </div>
        </div>
      </section>
      <section className="hv6-bio" data-reveal>
        <Bio className="hv-bio" />
      </section>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Bio } from './content';
import useReveal from './useReveal';

// Misty green highlands at sunset (Unsplash, free license).
const PHOTO = 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2000&auto=format&fit=crop';

// Distant birds: vertical spot, seconds to cross, first-appearance delay, size.
const BIRDS = [
  { top: '16%', dur: 44, delay: 2, scale: 1 },
  { top: '23%', dur: 54, delay: 14, scale: 0.7 },
  { top: '11%', dur: 62, delay: 30, scale: 0.55 },
];

// Design — "Highlands": real green ridges under low cloud, slow sideways
// drift, mist sliding through the valley and birds gliding across the sky.
export default function Hills() {
  const ref = useReveal();
  return (
    <div className="hv hv9" ref={ref}>
      <section className="hv-bleed hv9-hero">
        <div className="hv9-backdrop" style={{ backgroundImage: `url(${PHOTO})` }} aria-hidden="true" />
        <div className="hv9-shade" aria-hidden="true" />
        <span className="hv9-mist hv9-mist-a" aria-hidden="true" />
        <span className="hv9-mist hv9-mist-b" aria-hidden="true" />
        {BIRDS.map((b, i) => (
          <span
            key={i}
            className="hv9-birdtrack"
            aria-hidden="true"
            style={{ top: b.top, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}
          >
            <svg viewBox="0 0 16 6" style={{ '--hv9-scale': b.scale }}>
              <path d="M0,5 Q4,0 8,4 Q12,0 16,5" fill="none" stroke="rgba(25, 35, 28, 0.6)" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </span>
        ))}
        <div className="hv9-inner">
          <h1 className="hv9-name">Avigya Paudel</h1>
          <p className="hv9-tag">CS &amp; Math | AI Safety</p>
          <div className="hv9-cta">
            <Link to="/blog" className="hv-btn">Blog</Link>
            <Link to="/contact" className="hv-btn hv-btn-ghost">Contact</Link>
          </div>
        </div>
      </section>
      <section className="hv9-bio" data-reveal>
        <Bio className="hv-bio" />
      </section>
    </div>
  );
}

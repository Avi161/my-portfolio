import React from 'react';
import { Link } from 'react-router-dom';
import { Bio } from './content';
import useReveal from './useReveal';

// Peaks above a sea of clouds at dusk (Unsplash, free license).
const PHOTO = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2000&auto=format&fit=crop';

// Star specks in the dusk sky above the summits.
const TWINKLES = [
  { top: '8%', left: '30%', d: 3.1, delay: 0.6 },
  { top: '14%', left: '68%', d: 2.5, delay: 1.9 },
  { top: '5%', left: '50%', d: 3.8, delay: 0 },
  { top: '11%', left: '12%', d: 2.9, delay: 2.4 },
];

// Design — "Alpenglow": real summits floating over a cloud sea, gentle
// rise-and-zoom, shooting stars, twinkles and haze drifting over the clouds;
// text low in the calm dark foreground.
export default function Grove() {
  const ref = useReveal();
  return (
    <div className="hv hv10" ref={ref}>
      <section className="hv-bleed hv10-hero">
        <div className="hv10-backdrop" style={{ backgroundImage: `url(${PHOTO})` }} aria-hidden="true" />
        <span className="hv10-star hv10-star-a" aria-hidden="true" />
        <span className="hv10-star hv10-star-b" aria-hidden="true" />
        {TWINKLES.map((t, i) => (
          <span
            key={i}
            className="hv-twinkle"
            aria-hidden="true"
            style={{ top: t.top, left: t.left, animationDuration: `${t.d}s`, animationDelay: `${t.delay}s` }}
          />
        ))}
        <span className="hv10-haze" aria-hidden="true" />
        <div className="hv10-shade" aria-hidden="true" />
        <div className="hv10-inner">
          <h1 className="hv10-name">Avigya Paudel</h1>
          <p className="hv10-tag">CS &amp; Math | AI Safety</p>
          <div className="hv10-cta">
            <Link to="/blog" className="hv-btn">Blog</Link>
            <Link to="/contact" className="hv-btn hv-btn-ghost">Contact</Link>
          </div>
        </div>
      </section>
      <section className="hv10-bio" data-reveal>
        <Bio className="hv-bio" />
      </section>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Bio } from './content';
import useReveal from './useReveal';

// Star specks that pulse at their own rhythms.
const TWINKLES = [
  { top: '12%', left: '22%', d: 2.8, delay: 0.4 },
  { top: '8%', left: '55%', d: 3.6, delay: 1.3 },
  { top: '22%', left: '44%', d: 2.4, delay: 2.1 },
  { top: '6%', left: '80%', d: 3.2, delay: 0 },
  { top: '30%', left: '12%', d: 4.0, delay: 1.8 },
  { top: '16%', left: '90%', d: 2.6, delay: 2.7 },
];

// Design — "Mountain": full-bleed night-sky hero (the Annapurna shot) with
// an extremely slow Ken Burns drift, twinkling stars and frequent shooting
// stars; text sits in the sky's dead space. Ambient-video look with zero
// video bytes; motion stops for reduced-motion users.
export default function Cinematic() {
  const ref = useReveal();
  return (
    <div className="hv hvc" ref={ref}>
      <section className="hv-bleed hvc-hero">
        <div
          className="hvc-backdrop"
          style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/background.jpg)` }}
          aria-hidden="true"
        />
        <span className="hvc-star hvc-star-a" aria-hidden="true" />
        <span className="hvc-star hvc-star-b" aria-hidden="true" />
        <span className="hvc-star hvc-star-c" aria-hidden="true" />
        {TWINKLES.map((t, i) => (
          <span
            key={i}
            className="hv-twinkle"
            aria-hidden="true"
            style={{ top: t.top, left: t.left, animationDuration: `${t.d}s`, animationDelay: `${t.delay}s` }}
          />
        ))}
        <div className="hvc-shade" aria-hidden="true" />
        <div className="hvc-inner">
          <h1 className="hvc-headline">Avigya Paudel</h1>
          <p className="hvc-sub">CS &amp; Math | AI Safety</p>
          <div className="hvc-cta">
            <Link to="/blog" className="hv-btn">Blog</Link>
            <Link to="/contact" className="hv-btn hv-btn-ghost">Contact</Link>
          </div>
        </div>
      </section>
      <section className="hvc-bio" data-reveal>
        <Bio className="hv-bio" />
      </section>
    </div>
  );
}

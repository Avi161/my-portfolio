import { useEffect, useRef } from 'react';

// Attach to a wrapper; every [data-reveal] descendant gets `is-visible` the
// first time it scrolls into view. Reduced-motion users see everything at once.
export default function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const targets = el.querySelectorAll('[data-reveal]');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach((n) => n.classList.add('is-visible'));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    targets.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
  return ref;
}

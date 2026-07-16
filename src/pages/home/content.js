import React from 'react';
import profileImage from '../../components/AviPic.jpg';

// Shared bio content for every homepage design candidate, so the copy only
// lives in one place while each variant lays it out its own way.

export { profileImage };

export const NAME = 'Avigya Paudel';

export const LINKS = {
  union: 'https://www.union.edu/',
  lab: 'https://math-ai.caltech.edu/',
  gukov: 'https://gukov.caltech.edu/',
  spar: 'https://sparai.org/',
  sparProject: 'https://www.justinshenk.com/projects/spar-research',
  paper: 'https://arxiv.org/pdf/2606.05194',
};

function Ext({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

// The owner's own words, verbatim from the original homepage — don't "improve" them.
export function Bio({ className }) {
  return (
    <div className={className}>
      <p>
        I'm <strong>Avi</strong>, a CS and Math major at{' '}
        <Ext href={LINKS.union}>Union College</Ext>. I'm passionate about AI Safety
        which is a field dedicated to ensuring current and future AI systems do not
        cause unintended harm.
      </p>
      <p>
        I'm currently a researcher at{' '}
        <Ext href={LINKS.lab}>Caltech's Math+AI Lab</Ext>, working under{' '}
        <Ext href={LINKS.gukov}>Dr. Sergei Gukov</Ext>. I am working on the
        Stable Andrews–Curtis conjecture, applying Reinforcement Learning
        techniques to efficiently solve difficult presentation instances of
        the conjecture.
      </p>
      <p>
        Previously, I was a research fellow at <Ext href={LINKS.spar}>SPAR</Ext>,
        where I worked on understanding how LLMs reason across different
        timescales, specifically identifying when models shift into strategic,
        long-term planning modes. You can read more about the project{' '}
        <Ext href={LINKS.sparProject}>here</Ext> and view the{' '}
        <Ext href={LINKS.paper}>paper</Ext>.
      </p>
    </div>
  );
}

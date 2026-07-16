import React, { useState } from 'react';
import Cinematic from './home/Cinematic';
import Fireflies from './home/Fireflies';
import Leaves from './home/Leaves';
import Hills from './home/Hills';
import Grove from './home/Grove';
import './home/home.css';

// Animated nature hero designs, cycled by the minimal ⇆ toggle at the top
// left (also direct-linkable via ?hv=<key>). Mountain is always the default.
const VARIANTS = [
  { key: '1', label: 'Mountain', component: Cinematic },
  { key: '2', label: 'Forest', component: Fireflies },
  { key: '3', label: 'Autumn', component: Leaves },
  { key: '4', label: 'Highlands', component: Hills },
  { key: '5', label: 'Alpenglow', component: Grove },
];

function isValid(key) {
  return VARIANTS.some((v) => v.key === key);
}

// Always open on Mountain; ?hv=<key> still allows direct-linking a design.
function initialChoice() {
  const forced = new URLSearchParams(window.location.search).get('hv');
  return forced && isValid(forced) ? forced : '1';
}

export default function HomePage() {
  const [choice, setChoice] = useState(initialChoice);
  const index = Math.max(0, VARIANTS.findIndex((v) => v.key === choice));
  const active = VARIANTS[index];
  const ActiveComponent = active.component;

  function cycle() {
    setChoice(VARIANTS[(index + 1) % VARIANTS.length].key);
  }

  return (
    <>
      <ActiveComponent />
      <button
        type="button"
        className="home-cycle-toggle"
        onClick={cycle}
        aria-label="Switch homepage design"
      >
        ⇆
      </button>
    </>
  );
}

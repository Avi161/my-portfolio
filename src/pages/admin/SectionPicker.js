import React, { useRef, useState } from 'react';
import { childrenOf, splitPath } from '../../lib/sections';

const NEW = '__new__';

// Cascading selects over slash-separated section paths ("Journal/2026/July"):
// one select per chosen level plus one for going deeper; "+ New…" swaps that
// level for a text input so new (sub)sections are created in place.
export default function SectionPicker({ value, onChange, categories }) {
  const segs = splitPath(value);
  const [addingAt, setAddingAt] = useState(null);
  const [text, setText] = useState('');
  // Enter/Escape already resolve the input; the unmount blur must not re-commit.
  const skipBlur = useRef(false);

  function setDepth(depth, seg) {
    onChange([...segs.slice(0, depth), ...(seg ? [seg] : [])].join('/'));
  }

  function commitNew(depth) {
    const seg = text.trim().replace(/\s+/g, ' ').replace(/\//g, '-');
    setAddingAt(null);
    setText('');
    if (seg) setDepth(depth, seg);
  }

  const controls = [];
  for (let depth = 0; depth <= segs.length; depth += 1) {
    const options = childrenOf(categories, segs.slice(0, depth));
    const current = segs[depth] || '';
    // A just-typed segment isn't in `categories` yet — keep it selectable.
    if (current && !options.includes(current)) options.unshift(current);

    if (addingAt === depth) {
      controls.push(
        <input
          key={`new-${depth}`}
          type="text"
          autoFocus
          maxLength={40}
          placeholder={depth === 0 ? 'New section…' : 'New subsection…'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => {
            if (skipBlur.current) { skipBlur.current = false; return; }
            commitNew(depth);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              skipBlur.current = true;
              commitNew(depth);
            } else if (e.key === 'Escape') {
              skipBlur.current = true;
              setAddingAt(null);
              setText('');
            }
          }}
        />
      );
    } else if (depth < segs.length || options.length > 0 || depth === 0) {
      controls.push(
        <select
          key={depth}
          value={current}
          onChange={(e) => {
            if (e.target.value === NEW) {
              setAddingAt(depth);
              setText('');
            } else {
              setDepth(depth, e.target.value);
            }
          }}
        >
          <option value="">{depth === 0 ? 'No section' : `All of ${segs[depth - 1]}`}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
          <option value={NEW}>{depth === 0 ? '+ New section…' : '+ New subsection…'}</option>
        </select>
      );
    } else {
      controls.push(
        <button
          key={`add-${depth}`}
          type="button"
          className="admin-link-btn admin-add-sub-btn"
          onClick={() => { setAddingAt(depth); setText(''); }}
        >
          + sub
        </button>
      );
    }
  }

  return <span className="admin-section-picker">{controls}</span>;
}

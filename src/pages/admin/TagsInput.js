import React, { useState } from 'react';

// Chip input: Enter/comma adds a tag, Backspace on an empty input removes the
// last one; tags already used across posts are offered as datalist suggestions.
export default function TagsInput({ tags, onChange, suggestions = [] }) {
  const [text, setText] = useState('');

  function add(raw) {
    const tag = raw.trim().replace(/\s+/g, ' ');
    setText('');
    if (!tag) return;
    if (tags.some((t) => t.toLowerCase() === tag.toLowerCase())) return;
    onChange([...tags, tag]);
  }

  return (
    <span className="admin-tags-input">
      {tags.map((tag) => (
        <span key={tag} className="admin-tag-chip">
          {tag}
          <button
            type="button"
            aria-label={`Remove tag ${tag}`}
            onClick={() => onChange(tags.filter((t) => t !== tag))}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        list="admin-tag-suggestions"
        maxLength={30}
        placeholder={tags.length ? 'Add…' : 'Add tags…'}
        value={text}
        onChange={(e) => {
          const v = e.target.value;
          if (v.endsWith(',')) add(v.slice(0, -1));
          else setText(v);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            add(text);
          } else if (e.key === 'Backspace' && !text && tags.length) {
            onChange(tags.slice(0, -1));
          }
        }}
        onBlur={() => add(text)}
      />
      <datalist id="admin-tag-suggestions">
        {suggestions
          .filter((s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase()))
          .map((s) => <option key={s} value={s} />)}
      </datalist>
    </span>
  );
}

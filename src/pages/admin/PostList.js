import React, { useState } from 'react';

function Row({ title, badge, meta, onEdit, onDelete, deleteLabel, extraAction }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="admin-row">
      <button type="button" className="admin-row-main" onClick={onEdit}>
        <span className="admin-row-title">{title || 'Untitled'}{badge}</span>
        <span className="admin-muted">{meta}</span>
      </button>
      {extraAction}
      <button
        type="button"
        className="admin-danger-btn"
        onClick={() => (confirm ? onDelete() : setConfirm(true))}
        onBlur={() => setConfirm(false)}
      >
        {confirm ? 'Really?' : deleteLabel}
      </button>
    </div>
  );
}

export default function PostList({ posts, drafts, loading, error, notice, togglingSlug, onToggleVisibility, onNew, onEditPost, onEditDraft, onDeletePost, onDeleteDraft, onLogout }) {
  return (
    <div className="admin-list">
      <div className="admin-list-header">
        <h1>Blog admin</h1>
        <div>
          <button type="button" className="admin-primary-btn" onClick={onNew}>New post</button>
          <button type="button" className="admin-link-btn" onClick={onLogout}>Log out</button>
        </div>
      </div>

      {drafts.length > 0 && (
        <section>
          <h2>Drafts <span className="admin-muted">(saved on this device)</span></h2>
          {drafts.map((d) => (
            <Row
              key={d.id}
              title={d.title}
              meta={`edited ${new Date(d.updatedAt).toLocaleString()}`}
              onEdit={() => onEditDraft(d)}
              onDelete={() => onDeleteDraft(d.id)}
              deleteLabel="Discard"
            />
          ))}
        </section>
      )}

      <section>
        <h2>Posts</h2>
        {loading && <p className="admin-muted">Loading posts from GitHub…</p>}
        {error && <p className="admin-status admin-status-error">{error}</p>}
        {notice && <p className="admin-status admin-status-info">{notice}</p>}
        {posts && posts.length === 0 && <p className="admin-muted">No posts yet.</p>}
        {posts && posts.map((p) => (
          <Row
            key={p.slug}
            title={p.title}
            badge={p.public === false && <span className="admin-badge admin-badge-private">Private</span>}
            meta={`${p.date} · /blog/${p.slug}${p.category ? ` · ${p.category}` : ''}${p.tags && p.tags.length ? ` · ${p.tags.map((t) => `#${t}`).join(' ')}` : ''}${p.listed === false && p.public !== false ? ' · hidden from main' : ''}`}
            onEdit={() => onEditPost(p)}
            onDelete={() => onDeletePost(p.slug)}
            deleteLabel="Delete"
            extraAction={(
              <button
                type="button"
                className="admin-secondary-btn"
                disabled={togglingSlug === p.slug}
                onClick={() => onToggleVisibility(p)}
              >
                {togglingSlug === p.slug ? '…' : (p.public === false ? 'Make public' : 'Make private')}
              </button>
            )}
          />
        ))}
      </section>
    </div>
  );
}

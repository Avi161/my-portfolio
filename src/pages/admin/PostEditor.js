import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { generateHTML, generateJSON } from '@tiptap/core';
import TipTapEditor, { EDITOR_EXTENSIONS } from './TipTapEditor';
import { publishPost, deletePost } from './api';
import { saveDraft, deleteDraft, newDraftId } from './drafts';
import { extractImages } from './images';
import { htmlToMarkdown, markdownToHtml } from './markdown';

// 3.5MB client-side guard; the server rejects at 4MB, Vercel at 4.5MB.
const MAX_PAYLOAD_BYTES = 3.5 * 1024 * 1024;
const DEPLOY_POLL_MS = 15000;
const DEPLOY_POLL_LIMIT = 24; // ~6 minutes

export function slugify(title) {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function localToday() {
  return new Date().toLocaleDateString('en-CA');
}

// Browsers collapse whitespace runs when rendering, so comparing with
// whitespace normalized away is what "renders the same" actually means.
function normalizeHtml(html) {
  return html.replace(/\s+/g, ' ').replace(/> /g, '>').replace(/ </g, '<').trim();
}

// True when TipTap's schema would alter this HTML (custom divs, classes,
// inputs — e.g. the legacy interactive risk-matrix post). Editing such a
// post in rich mode would silently destroy it.
function richModeWouldAlter(html) {
  if (!html.trim()) return false;
  try {
    const roundTripped = generateHTML(generateJSON(html, EDITOR_EXTENSIONS), EDITOR_EXTENSIONS);
    return normalizeHtml(roundTripped) !== normalizeHtml(html);
  } catch {
    return true;
  }
}

// Markdown image syntax has no width/height, so converting to markdown drops
// any drag-resize done in the rich editor and the image snaps back to full
// width on publish.
function markdownWouldDropImageSizes(html) {
  return /<img[^>]*\s(width|height)=/.test(html || '');
}

export default function PostEditor({ initial, draftId, onBack, onSaved }) {
  const isPublished = Boolean(initial && initial.published);
  const unsafeForRichMode = useMemo(
    () => richModeWouldAlter((initial && initial.content) || ''),
    [initial]
  );

  const [title, setTitle] = useState((initial && initial.title) || '');
  const [slug, setSlug] = useState((initial && initial.slug) || '');
  const [slugTouched, setSlugTouched] = useState(isPublished || Boolean(initial && initial.slug && initial.slug !== slugify(initial.title || '')));
  const [slugLocked, setSlugLocked] = useState(isPublished);
  const [date, setDate] = useState((initial && initial.date) || localToday());
  const [summary, setSummary] = useState((initial && initial.summary) || '');
  const [content, setContent] = useState((initial && initial.content) || '');
  // Markdown is the default writing mode (Obsidian-style source editing);
  // drafts remember their mode; custom-HTML posts fall back to HTML mode;
  // posts with resized images open in rich mode so the sizes aren't lost.
  const [mode, setMode] = useState(
    unsafeForRichMode
      ? 'html'
      : (initial && initial.mode)
        || (markdownWouldDropImageSizes(initial && initial.content) ? 'rich' : 'markdown')
  );
  const [markdownText, setMarkdownText] = useState(() => {
    if (initial && typeof initial.markdown === 'string') return initial.markdown;
    if (unsafeForRichMode) return '';
    try {
      return htmlToMarkdown((initial && initial.content) || '');
    } catch {
      return '';
    }
  });
  const [status, setStatus] = useState(null); // { kind: 'info'|'error'|'success', text, link? }
  const [busy, setBusy] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState(draftId || null);
  const [draftSavedAt, setDraftSavedAt] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // previousSlug: set when editing an already-published post, so the server
  // replaces that entry (and handles renames) instead of creating a new one.
  // Becomes the live slug after a successful publish, so republishing from
  // the same editor session updates rather than 409s.
  const [previousSlug, setPreviousSlug] = useState(
    (initial && initial.previousSlug) || (isPublished ? initial.slug : null)
  );

  const stateRef = useRef(null);
  stateRef.current = { title, slug, date, summary, content, previousSlug, mode, markdownText };

  // The post body as HTML regardless of which mode it was written in.
  function currentHtml() {
    const s = stateRef.current;
    return s.mode === 'markdown' ? markdownToHtml(s.markdownText) : s.content;
  }

  const pollTimer = useRef(null);
  useEffect(() => () => clearTimeout(pollTimer.current), []);

  const persistDraft = useCallback(() => {
    const s = stateRef.current;
    const id = currentDraftId || newDraftId();
    if (!currentDraftId) setCurrentDraftId(id);
    // content is always stored as HTML; markdown + mode are kept alongside so
    // reopening a markdown draft shows the exact source you typed.
    let html = s.content;
    if (s.mode === 'markdown') {
      try { html = markdownToHtml(s.markdownText); } catch { html = s.content; }
    }
    saveDraft({ id, ...s, content: html, markdown: s.markdownText });
    setDraftSavedAt(Date.now());
    return id;
  }, [currentDraftId]);

  // Debounced autosave to localStorage (2s after the last edit). Skips the
  // mount run (opening a post must not create a draft) and programmatic
  // content swaps (publish rewrites image srcs via setContent).
  const hasMounted = useRef(false);
  const suppressAutosave = useRef(false);
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return undefined;
    }
    if (suppressAutosave.current) {
      suppressAutosave.current = false;
      return undefined;
    }
    if (!title && !content && !markdownText) return undefined;
    const timer = setTimeout(persistDraft, 2000);
    return () => clearTimeout(timer);
  }, [title, slug, date, summary, content, markdownText, persistDraft]);

  function handleTitleChange(value) {
    setTitle(value);
    if (!slugTouched && !slugLocked) setSlug(slugify(value));
  }

  function switchMode(next) {
    if (next === mode) return;
    suppressAutosave.current = true;
    try {
      if (mode === 'markdown') {
        // Leaving markdown: materialize the source into HTML for rich/html views.
        setContent(markdownToHtml(markdownText));
      } else if (next === 'markdown') {
        if (
          markdownWouldDropImageSizes(content)
          && !window.confirm('This post has resized images. Markdown cannot keep image sizes — they will reset to full width. Switch anyway?')
        ) {
          suppressAutosave.current = false;
          return;
        }
        setMarkdownText(htmlToMarkdown(content));
      }
      setMode(next);
    } catch (err) {
      suppressAutosave.current = false;
      setStatus({ kind: 'error', text: `Could not convert content: ${err.message}` });
    }
  }

  async function waitForDeploy(liveSlug) {
    let initialMain = null;
    try {
      const res = await fetch('/asset-manifest.json', { cache: 'no-store' });
      initialMain = (await res.json()).files['main.js'];
    } catch {
      return; // dev server: no manifest, skip polling
    }
    let polls = 0;
    const poll = async () => {
      polls += 1;
      try {
        const res = await fetch('/asset-manifest.json', { cache: 'no-store' });
        const main = (await res.json()).files['main.js'];
        if (main !== initialMain) {
          setStatus({ kind: 'success', text: 'Live!', link: `/blog/${liveSlug}` });
          return;
        }
      } catch {
        // transient fetch failure mid-deploy; keep polling
      }
      if (polls < DEPLOY_POLL_LIMIT) {
        pollTimer.current = setTimeout(poll, DEPLOY_POLL_MS);
      } else {
        setStatus({
          kind: 'info',
          text: 'Commit made, but deploy confirmation timed out — check the Vercel dashboard.',
          link: `/blog/${liveSlug}`,
        });
      }
    };
    pollTimer.current = setTimeout(poll, DEPLOY_POLL_MS);
  }

  async function handlePublish() {
    const s = stateRef.current;
    if (!s.title.trim()) return setStatus({ kind: 'error', text: 'Title is required.' });
    if (!s.slug) return setStatus({ kind: 'error', text: 'Slug is required.' });
    let bodyHtml;
    try {
      bodyHtml = currentHtml();
    } catch (err) {
      return setStatus({ kind: 'error', text: `Markdown conversion failed: ${err.message}` });
    }
    if (!bodyHtml.trim()) return setStatus({ kind: 'error', text: 'Post body is empty.' });

    setBusy(true);
    setStatus({ kind: 'info', text: 'Preparing images…' });
    try {
      const { html, images } = await extractImages(bodyHtml, s.slug);
      const payload = {
        post: { slug: s.slug, title: s.title.trim(), date: s.date, summary: s.summary.trim(), content: html },
        previousSlug: s.previousSlug,
        images,
      };
      if (JSON.stringify(payload).length > MAX_PAYLOAD_BYTES) {
        setBusy(false);
        return setStatus({
          kind: 'error',
          text: 'Post is too large to publish in one go (>3.5MB). Remove or shrink some images.',
        });
      }
      setStatus({ kind: 'info', text: 'Publishing…' });
      const { commitSha } = await publishPost(payload);
      suppressAutosave.current = true;
      setContent(html); // data-URLs were rewritten to /images/... paths
      setPreviousSlug(s.slug);
      if (currentDraftId) {
        deleteDraft(currentDraftId);
        setCurrentDraftId(null);
      }
      setStatus({
        kind: 'info',
        text: `Committed ${commitSha.slice(0, 7)} — deploying, usually ~1–2 min…`,
      });
      waitForDeploy(s.slug);
      onSaved && onSaved();
    } catch (err) {
      const detail = err.body && err.body.error;
      setStatus({
        kind: 'error',
        text: detail === 'slug-exists'
          ? 'A post with this slug already exists. Pick a different slug.'
          : `Publish failed: ${detail || err.message}`,
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return setConfirmDelete(true);
    setBusy(true);
    setStatus({ kind: 'info', text: 'Deleting…' });
    try {
      await deletePost(previousSlug || slug);
      setStatus({ kind: 'success', text: 'Deleted. The site updates after the redeploy.' });
      onSaved && onSaved();
      onBack();
    } catch (err) {
      setStatus({ kind: 'error', text: `Delete failed: ${(err.body && err.body.error) || err.message}` });
      setConfirmDelete(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-editor">
      <div className="admin-editor-top">
        <button type="button" className="admin-link-btn" onClick={onBack}>← All posts</button>
        <div className="admin-mode-toggle">
          <button
            type="button"
            className={mode === 'markdown' ? 'is-active' : ''}
            onClick={() => switchMode('markdown')}
          >Markdown</button>
          <button
            type="button"
            className={mode === 'rich' ? 'is-active' : ''}
            onClick={() => switchMode('rich')}
          >Rich</button>
          <button
            type="button"
            className={mode === 'html' ? 'is-active' : ''}
            onClick={() => switchMode('html')}
          >HTML</button>
        </div>
      </div>

      {unsafeForRichMode && mode !== 'html' && (
        <p className="admin-warning">
          ⚠ This post contains custom HTML that Markdown/Rich editing will strip (e.g.
          interactive elements). Saving from this mode will lose it — use HTML mode instead.
        </p>
      )}
      {unsafeForRichMode && mode === 'html' && (
        <p className="admin-notice">
          Opened in HTML mode: this post contains custom HTML the rich editor would alter.
        </p>
      )}

      <input
        className="admin-title-input"
        type="text"
        placeholder="Post title…"
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
      />

      <div className="admin-meta-row">
        <label>
          Slug
          <span className="admin-slug-wrap">
            <input
              type="text"
              value={slug}
              disabled={slugLocked}
              onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value) || e.target.value); }}
            />
            {slugLocked && (
              <button type="button" className="admin-link-btn" onClick={() => setSlugLocked(false)}>
                change
              </button>
            )}
          </span>
        </label>
        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>

      <label className="admin-summary-label">
        Summary
        <textarea
          rows={2}
          placeholder="One or two sentences shown in the blog list…"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </label>

      {mode === 'rich' && (
        <TipTapEditor key={currentDraftId || previousSlug || 'new'} content={content} onChange={setContent} />
      )}
      {mode === 'markdown' && (
        <textarea
          className="admin-html-textarea admin-markdown-textarea"
          value={markdownText}
          onChange={(e) => setMarkdownText(e.target.value)}
          placeholder={'## Write markdown…\n\nJust like Obsidian. **Bold**, *italic*, [links](https://…), lists, > quotes, ``` code blocks.'}
          spellCheck={true}
        />
      )}
      {mode === 'html' && (
        <textarea
          className="admin-html-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="<p>Raw HTML…</p>"
          spellCheck={false}
        />
      )}

      <div className="admin-actions">
        <button type="button" disabled={busy} onClick={() => { persistDraft(); setStatus({ kind: 'info', text: 'Draft saved on this device.' }); }}>
          Save draft
        </button>
        <button type="button" className="admin-primary-btn" disabled={busy} onClick={handlePublish}>
          {previousSlug ? 'Republish' : 'Publish'}
        </button>
        {previousSlug && (
          <button type="button" className="admin-danger-btn" disabled={busy} onClick={handleDelete}>
            {confirmDelete ? 'Really delete?' : 'Delete post'}
          </button>
        )}
        {draftSavedAt && !status && <span className="admin-muted">Draft autosaved</span>}
      </div>

      {status && (
        <p className={`admin-status admin-status-${status.kind}`}>
          {status.text}{' '}
          {status.link && <a href={status.link}>View post →</a>}
        </p>
      )}
    </div>
  );
}

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { generateHTML, generateJSON } from '@tiptap/core';
import TipTapEditor, { EDITOR_EXTENSIONS } from './TipTapEditor';
import SectionPicker from './SectionPicker';
import TagsInput from './TagsInput';
import { publishPost, deletePost, uploadImageBlob } from './api';
import { saveDraft, deleteDraft, newDraftId } from './drafts';
import { extractImages, fileToDataUrl } from './images';
import { htmlToMarkdown, markdownToHtml } from './markdown';
import {
  makeImageStore,
  collapseImages,
  expandImages,
  addImage,
  hasUnresolvedImages,
} from './imageStore';

// Each image is uploaded in its own request now, so the per-image ceiling is
// what matters (Vercel caps a request near 4.5MB); the post JSON is tiny.
// fileToDataUrl compresses well under this, so it's only a final safety net.
const MAX_IMAGE_BYTES = 4.4 * 1024 * 1024;
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

// Markdown image syntax (`![alt](src)`) has no width/height/alignment, so
// converting to markdown drops any drag-resize or float done in the rich editor.
function markdownWouldDropImageSizes(html) {
  return /<img[^>]*\s(width|height|data-align)=/.test(html || '');
}

export default function PostEditor({ initial, draftId, onBack, onSaved, categories = [], allTags = [] }) {
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
  const [category, setCategory] = useState((initial && initial.category) || '');
  const [tags, setTags] = useState((initial && initial.tags) || []);
  // `public` is a reserved identifier; the post field stays `public`, the state
  // is isPublic. Missing field means public (legacy posts have no flag).
  const [isPublic, setIsPublic] = useState(!(initial && initial.public === false));
  // listed: false = hidden from the main /blog list, shown only under its
  // section tab. Missing field means listed.
  const [listed, setListed] = useState(!(initial && initial.listed === false));

  // Pasted/inserted images live here as data URLs; the editable content and
  // markdown carry only short cimg://<id> placeholders, so the source stays
  // readable and drafts/publish payloads stay small. The data URLs are restored
  // at the two boundaries that need them: the rich editor and publish.
  const imageStore = useRef(makeImageStore(initial && initial.images));

  const [content, setContent] = useState(() =>
    collapseImages((initial && initial.content) || '', imageStore.current)
  );
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
    if (initial && typeof initial.markdown === 'string') {
      return collapseImages(initial.markdown, imageStore.current);
    }
    if (unsafeForRichMode) return '';
    try {
      return collapseImages(htmlToMarkdown((initial && initial.content) || ''), imageStore.current);
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
  stateRef.current = { title, slug, date, summary, content, previousSlug, mode, markdownText, category, tags, listed, public: isPublic };

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
    // images holds the data URLs the cimg:// placeholders point at; persisting
    // it keeps a reopened draft's images intact on this device.
    saveDraft({ id, ...s, content: html, markdown: s.markdownText, images: imageStore.current });
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
  }, [title, slug, date, summary, content, markdownText, category, tags, listed, isPublic, persistDraft]);

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
          && !window.confirm('This post has resized or aligned images. Markdown cannot keep image size/alignment — they reset to full width. Switch anyway?')
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

  // Pasting an image into a source textarea: stash the bytes and drop a short
  // cimg://<id> placeholder at the cursor instead of a wall of base64.
  async function handleSourceImagePaste(event, setValue, makeRef) {
    const files = [...((event.clipboardData && event.clipboardData.files) || [])]
      .filter((f) => f.type.startsWith('image/'));
    if (!files.length) return; // plain text/markdown paste — let the textarea handle it
    event.preventDefault();
    const { selectionStart, selectionEnd, value } = event.target;
    try {
      const refs = [];
      for (const file of files) {
        const dataUrl = await fileToDataUrl(file);
        refs.push(makeRef(addImage(imageStore.current, dataUrl)));
      }
      setValue(value.slice(0, selectionStart) + refs.join('\n\n') + value.slice(selectionEnd));
    } catch (err) {
      setStatus({ kind: 'error', text: `Could not read pasted image: ${err.message}` });
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
    let tokenHtml;
    try {
      tokenHtml = currentHtml();
    } catch (err) {
      return setStatus({ kind: 'error', text: `Markdown conversion failed: ${err.message}` });
    }
    if (!tokenHtml.trim()) return setStatus({ kind: 'error', text: 'Post body is empty.' });
    if (s.public && !s.listed && !s.category.trim()) {
      return setStatus({
        kind: 'error',
        text: 'A post hidden from the main page needs a section — otherwise nothing on /blog links to it.',
      });
    }
    if (hasUnresolvedImages(tokenHtml, imageStore.current)) {
      return setStatus({
        kind: 'error',
        text: 'Some images aren’t available on this device (the draft was started elsewhere). Re-add them before publishing.',
      });
    }
    const bodyHtml = expandImages(tokenHtml, imageStore.current);

    setBusy(true);
    setStatus({ kind: 'info', text: 'Preparing images…' });
    try {
      const isPrivate = !s.public;
      const { html, images } = await extractImages(bodyHtml, s.slug, isPrivate);

      // The blob request body is the base64 string; the server rejects bodies
      // over MAX_BODY_BYTES, so check the encoded length to fail clearly here
      // rather than mid-upload.
      const oversized = images.find((img) => img.base64.length > MAX_IMAGE_BYTES);
      if (oversized) {
        setBusy(false);
        return setStatus({
          kind: 'error',
          text: 'One image is too large to upload on its own. Shrink it and try again.',
        });
      }

      // Upload each image as its own blob first so no single request approaches
      // Vercel's size limit; publish then carries only the returned shas.
      const uploaded = [];
      for (let i = 0; i < images.length; i += 1) {
        setStatus({ kind: 'info', text: `Uploading images (${i + 1}/${images.length})…` });
        const { sha } = await uploadImageBlob(images[i].base64, isPrivate);
        uploaded.push({ path: images[i].path, sha });
      }

      const payload = {
        post: {
          slug: s.slug,
          title: s.title.trim(),
          date: s.date,
          summary: s.summary.trim(),
          content: html,
          category: s.category.trim(),
          tags: s.tags,
          listed: s.listed,
          public: s.public,
        },
        previousSlug: s.previousSlug,
        images: uploaded,
      };
      setStatus({ kind: 'info', text: 'Publishing…' });
      let result;
      try {
        result = await publishPost(payload);
      } catch (err) {
        // The post we meant to update is gone (e.g. a draft pointing at a since-
        // deleted/renamed post). Fall back to publishing it as a new post — the
        // server still guards against clobbering a different post via slug-exists.
        if (err.body && err.body.error === 'not-found') {
          payload.previousSlug = null;
          result = await publishPost(payload);
          setPreviousSlug(null);
        } else {
          throw err;
        }
      }
      const { commitSha } = result;
      suppressAutosave.current = true;
      setContent(html); // placeholders/data-URLs were rewritten to their served paths
      setPreviousSlug(s.slug);
      if (currentDraftId) {
        deleteDraft(currentDraftId);
        setCurrentDraftId(null);
      }
      if (isPrivate) {
        // Private posts live in the private repo and are fetched at runtime —
        // no Vercel redeploy involved, so they're readable immediately.
        setStatus({
          kind: 'success',
          text: `Committed ${commitSha.slice(0, 7)} to the private repo — live now, visible only while logged in.`,
          link: `/blog/${s.slug}`,
        });
      } else {
        setStatus({
          kind: 'info',
          text: `Committed ${commitSha.slice(0, 7)} — deploying, usually ~1–2 min…`,
        });
        waitForDeploy(s.slug);
      }
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
        <label>
          Visibility
          <span className="admin-mode-toggle admin-visibility-toggle">
            <button
              type="button"
              className={isPublic ? 'is-active' : ''}
              onClick={() => setIsPublic(true)}
            >Public</button>
            <button
              type="button"
              className={!isPublic ? 'is-active' : ''}
              onClick={() => setIsPublic(false)}
            >Private</button>
          </span>
        </label>
        {isPublic && (
          <label>
            Main page
            <span className="admin-mode-toggle admin-visibility-toggle">
              <button
                type="button"
                className={listed ? 'is-active' : ''}
                onClick={() => setListed(true)}
              >Shown</button>
              <button
                type="button"
                className={!listed ? 'is-active' : ''}
                onClick={() => setListed(false)}
              >Hidden</button>
            </span>
          </label>
        )}
      </div>

      <div className="admin-meta-row">
        <label>
          Section
          <SectionPicker value={category} onChange={setCategory} categories={categories} />
        </label>
        <label className="admin-tags-label">
          Tags
          <TagsInput tags={tags} onChange={setTags} suggestions={allTags} />
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
        <TipTapEditor
          key={currentDraftId || previousSlug || 'new'}
          content={expandImages(content, imageStore.current)}
          onChange={(html) => setContent(collapseImages(html, imageStore.current))}
        />
      )}
      {mode === 'markdown' && (
        <textarea
          className="admin-html-textarea admin-markdown-textarea"
          value={markdownText}
          onChange={(e) => setMarkdownText(e.target.value)}
          onPaste={(e) => handleSourceImagePaste(e, setMarkdownText, (id) => `![](cimg://${id})`)}
          placeholder={'## Write markdown…\n\nJust like Obsidian. **Bold**, *italic*, [links](https://…), lists, > quotes, ``` code blocks. Paste an image and it becomes a short ![](cimg://…) placeholder.'}
          spellCheck={true}
        />
      )}
      {mode === 'html' && (
        <textarea
          className="admin-html-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onPaste={(e) => handleSourceImagePaste(e, setContent, (id) => `<img src="cimg://${id}" alt="" />`)}
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

      {!isPublic && (
        <p className="admin-muted admin-visibility-hint">
          This post will be private — stored in your private repo (never the public one)
          and readable on the site only after unlocking the Private tab (or logging in to /admin).
        </p>
      )}
      {isPublic && !listed && (
        <p className="admin-muted admin-visibility-hint">
          Hidden from the main /blog list — it appears only under its section tab
          {category.trim() ? ` (${category.trim()})` : ''}.
        </p>
      )}

      {status && (
        <p className={`admin-status admin-status-${status.kind}`}>
          {status.text}{' '}
          {status.link && <a href={status.link}>View post →</a>}
        </p>
      )}
    </div>
  );
}

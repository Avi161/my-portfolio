# Project CLAUDE.md — my-portfolio

Personal portfolio site (Create React App, react-router `createBrowserRouter`).
Deployed on **Vercel (Hobby plan)**. Domains: `avigya.vercel.app`, `www.avigyapaudel.com`.

## Blog posts
- Posts live in `src/data/posts.json` as an array of `{ slug, title, date, summary, content }`, newest first. `src/data/blogPosts.js` is a thin shim that imports it (sorted by date desc) — page imports go through the shim.
- `content` is an HTML string rendered via `dangerouslySetInnerHTML` in `src/pages/BlogPostPage.js`. No `<script>` execution — use pure HTML/CSS (e.g. `<details>` for collapsibles, the radio-`:checked` hack for toggles).
- Post-specific styling goes in `src/App.css` scoped under `.blog-post-content`.
- Routes (`src/App.js`): `/`, `/blog`, `/blog/:slug`, `/projects`, `/admin` (lazy-loaded). BrowserRouter, so URLs have **no `#`** (SPA fallback via `vercel.json` rewrite).

## Blog admin (/admin)
- Password-protected CMS at `/admin` (not linked in nav). Backend: `api/login.js` + `api/posts.js` (Vercel serverless, zero npm deps); helpers in `api/_lib/`. Frontend: `src/pages/admin/` (TipTap v3 editor).
- Three editing modes: **Markdown** (default — Obsidian-style source, converted via `@tiptap/markdown` headless editors in `src/pages/admin/markdown.js`), **Rich** (TipTap WYSIWYG; markdown input rules work while typing), **HTML** (raw source; forced for posts whose custom HTML the TipTap schema would strip). Content is always stored/published as HTML; drafts additionally keep the markdown source + mode for faithful reopening.
- Auth: `ADMIN_PASSWORD` env var (server-side only — NEVER `REACT_APP_`-prefix it, that bakes it into the public bundle). Stateless HMAC token, 12h, in sessionStorage. Changing the password instantly invalidates existing sessions.
- Publishing: each pasted/inserted image is first uploaded as its own git blob (`POST /api/posts {action:'blob'}` → `createBlob` → sha), one request per image so none approaches Vercel's ~4.5MB body limit. The publish call then commits `src/data/posts.json` (+ images under `public/images/blog/<slug>/`, referenced by blob sha) to `main` via the GitHub Git Data API in ONE atomic commit, authored `Avi161 <paudela@union.edu>` with no trailer (Vercel Hobby constraint). Vercel auto-deploys; post is live in ~1–2 min.
- Drafts are localStorage-only (private; repo is public). Pasted/inserted images are held as data-URLs in a per-draft image store (`src/pages/admin/imageStore.js`, persisted on the draft as `images`); the editable source carries only short `cimg://<id>` placeholders so Markdown/HTML source stays readable. Data-URLs are restored (`expandImages`) only at the rich-editor render boundary and at publish, where `extractImages` downscales + rewrites them to `/images/...` paths.
- Required env vars (Vercel dashboard, Production): `ADMIN_PASSWORD`, `GITHUB_TOKEN` (fine-grained PAT, Contents R/W on this repo only). Local `.env` is gitignored; CRA's `npm start` can't serve `/api` — use `vercel dev` or `.scratch/admin-test-server.js` (mock GitHub).

## Lessons Learned

### [2026-06-06] Vercel Hobby blocks commits with a second contributor [TRAP]
- **Symptom:** Vercel deployment fails with "Deployment was blocked" / "Hobby teams do not support collaboration. Please upgrade to Pro to add team members" / "the commit author did not have contributing access."
- **Root cause:** The deployed commit had a `Co-Authored-By:` trailer (e.g. `Claude Opus ... <noreply@anthropic.com>`). Vercel counts every author + co-author as a contributor; on the Hobby plan a deployment with >1 contributor is rejected. This is **independent of repo visibility** — making the repo public did NOT fix it; a clean single-author commit at the tip of `main` did.
- **Rule:** In this repo, **never add a `Co-Authored-By` trailer** to commits. Commit as sole author `Avi161 <paudela@union.edu>`. Vercel deploys the tip commit, so a clean tip = single contributor = deploys fine.
- **Red herrings ruled out:** author/committer email match was fine (all `paudela@union.edu`, attributed to `Avi161`); commit verification/signing irrelevant; private-vs-public irrelevant to this error.

### [2026-06-10] TipTap v3 packaging differs from v2 [WORKS]
- StarterKit already bundles Link/Underline/ListKeymap — no separate `@tiptap/extension-link`.
- `BubbleMenu` imports from `@tiptap/react/menus` and needs `@floating-ui/dom` (not tippy.js).
- v3 defaults `shouldRerenderOnTransaction: false`; set it `true` (or use `useEditorState`) or toolbar active-states never update.
- TipTap strips any HTML outside its schema on load (custom divs/classes/inputs). `PostEditor.js` round-trips content through `generateJSON`/`generateHTML` on open and falls back to HTML mode if they differ — this protects the interactive risk-matrix post. Don't remove that check.

### [2026-06-10] React autosave effect fires on mount and on programmatic setState [TRAP]
- A `useEffect`-debounced autosave keyed on form fields created phantom drafts twice: (1) on mount when opening an existing post, (2) after publish when `setContent()` rewrote image srcs. Found only via browser e2e, not unit tests.
- Rule: autosave effects need a `hasMounted` ref AND a `suppress` ref for programmatic updates (see `src/pages/admin/PostEditor.js`).

### [2026-06-10] Local e2e harness for the admin CMS [WORKS]
- `.scratch/admin-test-server.js` serves `build/` + mounts the real `api/` handlers with api.github.com mocked in-memory (inspect via `/__mock/state`). Reads `ADMIN_PASSWORD` from `.env` per request. Lets you test the full publish/edit/delete flow with zero risk to the real repo. Restart it after editing `api/` files (require cache).

### [2026-06-06] PR merge can use pre-force-push commits [TRAP]
- Force-pushed a cleaned-up branch, but PR #5 was merged using the **original** (co-authored) commits before/around the push. Result: `main` carried the co-authored commits anyway.
- **Rule:** If you rewrite a branch to fix something that matters for `main`, confirm the PR head matches the rewritten commits **before** merging, or fix it post-merge with a fresh clean commit on `main`.

### [2026-06-10] BubbleMenu props must be referentially stable [TRAP]
- **Symptom:** Switching to Rich mode crashed the whole admin with React error #185 (Maximum update depth exceeded), stack through `dispatchTransaction`.
- **Root cause:** `<BubbleMenu shouldShow={inline arrow}>` — BubbleMenu's update effect lists `shouldShow` in its deps and **dispatches a transaction** whenever it changes identity. With `shouldRerenderOnTransaction: true` each render creates a new arrow → transaction → re-render → infinite loop.
- **Rule:** Any function prop passed to `BubbleMenu`/`FloatingMenu` (`shouldShow`, `getReferencedVirtualElement`, …) must be module-level or memoized. See `bubbleMenuShouldShow` in `src/pages/admin/TipTapEditor.js`.

### [2026-06-10] TipTap v3 image drag-to-resize is built in [WORKS]
- `Image.configure({ resize: { enabled: true, alwaysPreserveAspectRatio: true, minWidth: 80 } })` gives corner drag-handles via a `ResizableNodeView`; commits plain `width`/`height` attributes on the `<img>`, which survive `editor.getHTML()`, `extractImages`, and publish.
- The handles are **unstyled** (invisible 0×0 divs) — they require CSS on `[data-resize-handle]` / `[data-resize-wrapper]` / `[data-resize-container]` (see admin.css).
- **[TRAP]** The node view inline-styles the container `visibility: hidden; pointer-events: none` until the img `onload` fires. After publishing, srcs are rewritten to `/images/...` which 404 until the Vercel deploy lands → images became invisible AND unselectable in the editor. Countered with `visibility: visible !important; pointer-events: auto !important` on `[data-resize-container]` in admin.css.
- **[TRAP]** Markdown serialization (`renderMarkdown`) emits only `![alt](src)` — width/height are silently dropped. Guarded in `PostEditor.js`: posts whose HTML has `<img ... width=` open in Rich mode by default, and switching to Markdown asks for confirmation (`markdownWouldDropImageSizes`).

### [2026-06-10] Simulating image paste in browser e2e [WORKS]
- A synthetic `new ClipboardEvent('paste', { clipboardData: dataTransferWithFile, bubbles: true, cancelable: true })` dispatched on `.ProseMirror` exercises the real `handlePaste` path (verify with `ev.defaultPrevented === true`). Build the `File` synchronously from `canvas.toDataURL` + `atob` — async IIFEs in the javascript_tool eval context get their promise GC'd ("Promise was collected").

### [2026-06-10] "Post is too large (>3.5MB)" + data-URL bloat in source — root cause was inline base64 [WORKS]
- **Symptom 1:** Publish rejected with "Post is too large to publish in one go (>3.5MB)." **Symptom 2:** Markdown/HTML source unreadable — each image was a multi-KB `data:image/...;base64,…` URL inline.
- **Root cause (shared):** images lived as base64 data-URLs in the post body until publish. The whole post + every image went in ONE Vercel request (hard cap ~4.5MB), and the same base64 flooded the source textareas.
- **Fix 1 (size):** upload each image as its own git blob first (`POST /api/posts {action:'blob'}` → `createBlob` → sha; client `uploadImageBlob` in a per-image loop), then publish carries only the tiny shas. Still ONE atomic commit (single-author invariant preserved) — `commitChanges` accepts image entries as `{path, sha}` or `{path, base64}`. The old `MAX_PAYLOAD_BYTES` whole-payload guard is gone; only a single `>4MB` image fails now.
- **Fix 2 (source bloat):** `src/pages/admin/imageStore.js` holds data-URLs keyed by id; the editable source uses short `cimg://<id>` placeholders. `expandImages` restores data-URLs only for the rich editor and at publish; `collapseImages` runs on load + on rich `onChange`; textarea `onPaste` handlers insert a placeholder instead of a data-URL. Store is persisted on the draft as `images`.
- **[TRAP]** Rich mode genuinely needs real data-URLs to render — placeholders are source-only. Feed the TipTap editor `expandImages(content)` and collapse its `onChange` back to tokens, or images vanish in Rich mode.
- **[TRAP]** `hasUnresolvedImages` guards publish: a draft reopened on another device has the tokens but not the bytes — fail loudly instead of committing a broken `cimg://` src.
- Verified e2e (`.scratch/test-blob-publish.js` for the API contract; browser paste→placeholder→publish through the built bundle).

### [2026-06-11] Quality-preserving image compression + per-image upload cap [WORKS]
- "Image is too large to upload on its own" came from large PNGs (esp. screenshots) — drag-resizing in the editor only changes display `width`/`height`, NOT the uploaded bytes, so "shrinking" never helped the upload.
- `fileToDataUrl` (`src/pages/admin/images.js`) now compresses to fit one request while keeping fidelity: non-transparent images → JPEG at `HIGH_QUALITY` 0.92, transparent PNGs stay PNG; it shrinks **resolution first** (preserves the encoder's quality) and only drops JPEG quality as a last resort, targeting `TARGET_CHARS` 4MB. Server `MAX_BODY_BYTES` and client `MAX_IMAGE_BYTES` raised to 4.4MB (under Vercel's 4.5). e2e: a 12.6MB noisy PNG committed as a 1.25MB JPEG at full 1600px, no quality step needed.
- **[TRAP]** Transparency detection via `getImageData` alpha scan — a PNG with no alpha is converted to JPEG (huge win for screenshots); only truly transparent PNGs stay PNG and shrink by dimension (canvas ignores PNG quality). Many camera/export PNGs are **RGBA but fully opaque** (alpha all 255) — the scan correctly treats them as JPEG candidates. Real case: a 1600×1260 opaque-RGBA sunflower PNG tripped "too large" on the OLD downscaler (kept all PNGs as PNG) but compresses to a 0.33MB JPEG with this one.

### [2026-06-11] Publish self-heals when updating a since-deleted/renamed post [WORKS]
- "Publish failed: not-found" = `savePost` got a `previousSlug` not present in `posts.json` (e.g. opening an old draft whose original post was deleted/renamed). The server returns 404 (unchanged, intentional safety check).
- `handlePublish` now catches that one error and retries with `previousSlug: null` (publish as new). Safe: if the slug were actually taken by a *different* post, the create path returns `slug-exists` and surfaces the normal "pick a different slug" message. Verified e2e (`.scratch/test-notfound-heal.js` + a seeded ghost draft through the built bundle).

### [2026-06-11] Image alignment / text-wrap with the resize node view [WORKS]
- `data-align` (`left`/`right`/null) added via `Image.extend({ addAttributes })` (`AlignableImage` in `TipTapEditor.js`); renders as a plain attribute so it survives `getHTML`/publish. Float CSS lives in BOTH `App.css` (`.blog-post-content img[data-align]`, published) and `admin.css` (`[data-resize-container]:has(img[data-align])`, editor). Headings `clear: both` + a `::after` clearfix contain floats.
- Set via a SECOND `BubbleMenu` (distinct `pluginKey="imageBubble"`, stable module-level `imageBubbleShouldShow` — the loop trap still applies) shown only when an image is selected.
- **[TRAP]** The TipTap resize `ResizableNodeView` applies node attributes **only when it's first built** — `updateAttributes('image', {align})` updates the stored attr (and `getHTML`/publish are correct) but does NOT repaint the editor DOM, so the float won't preview. `setImageAlign` imperatively sets `data-align` on `editor.view.nodeDOM(selection.from)`'s `<img>` after `updateAttributes` for live WYSIWYG. Posts loaded with `data-align` already render correctly because the node view picks it up at creation.
- Markdown can't represent size/alignment, so `markdownWouldDropImageSizes` now also matches `data-align` and posts with it open in Rich mode by default.

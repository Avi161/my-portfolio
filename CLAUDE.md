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
- Publishing commits `src/data/posts.json` (+ images under `public/images/blog/<slug>/`) to `main` via the GitHub Git Data API in ONE atomic commit, authored `Avi161 <paudela@union.edu>` with no trailer (Vercel Hobby constraint). Vercel auto-deploys; post is live in ~1–2 min.
- Drafts are localStorage-only (private; repo is public). Images become data-URLs in the editor, extracted + downscaled at publish.
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

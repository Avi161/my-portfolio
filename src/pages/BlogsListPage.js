import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { publicPosts } from '../data/blogPosts';
import { getPrivatePosts, hasAdminSession, login, clearToken } from './admin/api';
import { childrenOf, firstSeg, inPath, smartCompare, splitPath } from '../lib/sections';

// Reserved top-level name for the locked tab; the server rejects it as a
// section name so it can never collide with a real category.
const PRIVATE = 'Private';

function blogLink(section, tag) {
  const params = new URLSearchParams();
  if (section) params.set('section', section);
  if (tag) params.set('tag', tag);
  const query = params.toString();
  return query ? `/blog?${query}` : '/blog';
}

// Section badge as a per-segment breadcrumb; each segment filters to its level.
function CategoryPath({ category, tag }) {
  const segs = splitPath(category);
  return (
    <span className="blog-entry-category-path">
      {segs.map((seg, i) => (
        <Link
          key={seg}
          to={blogLink(segs.slice(0, i + 1).join('/'), tag)}
          className="blog-entry-category"
        >
          {seg}
        </Link>
      ))}
    </span>
  );
}

const BlogsListPage = () => {
  const [searchParams] = useSearchParams();
  const active = searchParams.get('section') || '';
  const activeTag = searchParams.get('tag') || '';
  const segs = useMemo(() => splitPath(active), [active]);
  const inPrivate = segs[0] === PRIVATE;

  // Private posts never ship in the bundle. They're fetched only while the
  // Private tab is open with a session, so visitors never make the request;
  // a stale cookie 401s and falls back to the lock screen.
  const [privatePosts, setPrivatePosts] = useState(null);
  const [unlocked, setUnlocked] = useState(hasAdminSession);
  const [password, setPassword] = useState('');
  const [unlockError, setUnlockError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!inPrivate || !unlocked) return undefined;
    let alive = true;
    getPrivatePosts()
      .then((data) => { if (alive) setPrivatePosts(data.posts); })
      .catch(() => {
        if (alive) {
          clearToken();
          setUnlocked(false);
          setPrivatePosts(null);
        }
      });
    return () => { alive = false; };
  }, [inPrivate, unlocked]);

  async function handleUnlock(e) {
    e.preventDefault();
    setBusy(true);
    setUnlockError(null);
    try {
      await login(password);
      setPassword('');
      setUnlocked(true);
    } catch (err) {
      setUnlockError(err.status === 401 ? 'Wrong password.' : `Unlock failed: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  function handleLock() {
    clearToken();
    setUnlocked(false);
    setPrivatePosts(null);
  }

  // Private posts are addressed under a virtual "Private/…" path so a single
  // set of section machinery drives both views.
  const viewPosts = useMemo(() => {
    if (!inPrivate) return publicPosts;
    return (privatePosts || [])
      .map((p) => ({ ...p, category: p.category ? `${PRIVATE}/${p.category}` : PRIVATE }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [inPrivate, privatePosts]);

  const topSections = useMemo(
    () => [...new Set(publicPosts.map((p) => firstSeg(p.category)).filter(Boolean))],
    []
  );
  // A section whose posts are all hidden from the main list lives off to the
  // side (dashed) — reachable, but not part of the default Writing tabs.
  const mainTabs = topSections
    .filter((s) => publicPosts.some((p) => firstSeg(p.category) === s && p.listed !== false))
    .sort(smartCompare);
  const asideTabs = topSections.filter((s) => !mainTabs.includes(s)).sort(smartCompare);

  // One chip row per level of the active path that has subsections.
  const subRows = [];
  for (let depth = 1; depth <= segs.length; depth += 1) {
    const prefixSegs = segs.slice(0, depth);
    const children = childrenOf(viewPosts.map((p) => p.category), prefixSegs);
    if (children.length) subRows.push({ prefix: prefixSegs.join('/'), depth, children });
  }

  let shown;
  if (inPrivate) {
    shown = viewPosts.filter((p) => inPath(p.category, active));
  } else if (active) {
    shown = publicPosts.filter((p) => inPath(p.category, active));
  } else {
    shown = publicPosts.filter((p) => p.listed !== false);
  }
  if (activeTag) {
    shown = shown.filter((p) => (p.tags || []).some((t) => t.toLowerCase() === activeTag.toLowerCase()));
  }

  const heading = inPrivate
    ? PRIVATE
    : (segs[0] && asideTabs.includes(segs[0]) ? segs[0] : 'Writing');
  const lockedOut = inPrivate && !unlocked;
  const loadingPrivate = inPrivate && unlocked && privatePosts === null;

  return (
    <div className="blog-list-page">
      <section className="blog-list">
        <h2>
          {heading}
          {inPrivate && unlocked && (
            <button type="button" className="blog-lock-toggle" onClick={handleLock}>
              Lock
            </button>
          )}
        </h2>
        <nav className="blog-tabs">
          <Link to={blogLink('', activeTag)} className={!active ? 'is-active' : ''}>All</Link>
          {mainTabs.map((s) => (
            <Link key={s} to={blogLink(s, activeTag)} className={segs[0] === s ? 'is-active' : ''}>
              {s}
            </Link>
          ))}
          {asideTabs.map((s) => (
            <Link
              key={s}
              to={blogLink(s, activeTag)}
              className={`blog-tab-aside${segs[0] === s ? ' is-active' : ''}`}
            >
              {s}
            </Link>
          ))}
          <Link
            to={blogLink(PRIVATE, activeTag)}
            className={`blog-tab-aside${inPrivate ? ' is-active' : ''}`}
          >
            {PRIVATE}
          </Link>
        </nav>
        {!lockedOut && subRows.map((row) => (
          <nav key={row.prefix} className="blog-tabs blog-subtabs">
            <Link
              to={blogLink(row.prefix, activeTag)}
              className={active === row.prefix ? 'is-active' : ''}
            >
              All
            </Link>
            {row.children.map((child) => (
              <Link
                key={child}
                to={blogLink(`${row.prefix}/${child}`, activeTag)}
                className={segs[row.depth] === child ? 'is-active' : ''}
              >
                {child}
              </Link>
            ))}
          </nav>
        ))}
        {activeTag && (
          <p className="blog-tag-filter">
            Tagged <span className="blog-entry-tag is-active">#{activeTag}</span>
            {' '}
            <Link to={blogLink(active, '')} className="blog-tag-clear">× clear</Link>
          </p>
        )}
        {lockedOut && (
          <div className="blog-lock">
            <p>This section is locked.</p>
            <form className="blog-lock-form" onSubmit={handleUnlock}>
              <input
                type="password"
                placeholder="Password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit" disabled={busy || !password}>
                {busy ? 'Checking…' : 'Unlock'}
              </button>
            </form>
            {unlockError && <p className="blog-lock-error">{unlockError}</p>}
          </div>
        )}
        {loadingPrivate && <p className="blog-empty">Unlocking…</p>}
        {!lockedOut && !loadingPrivate && shown.length === 0 && (
          <p className="blog-empty">No posts {activeTag ? 'with this tag' : 'in this section'} yet.</p>
        )}
        {!lockedOut && shown.map((post) => (
          <article key={post.slug} className="blog-entry">
            <div className="blog-entry-header">
              <Link to={`/blog/${post.slug}`} className="blog-entry-title">
                {post.title}
              </Link>
              {post.category && <CategoryPath category={post.category} tag={activeTag} />}
              {(post.tags || []).map((t) => (
                <Link key={t} to={blogLink(active, t)} className="blog-entry-tag">#{t}</Link>
              ))}
              <span className="blog-entry-date">{post.date}</span>
            </div>
            <p className="blog-entry-summary">{post.summary}</p>
          </article>
        ))}
      </section>
    </div>
  );
};

export default BlogsListPage;

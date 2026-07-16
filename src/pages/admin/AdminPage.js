import React, { useCallback, useEffect, useState } from 'react';
import LoginForm from './LoginForm';
import PostList from './PostList';
import PostEditor from './PostEditor';
import { getToken, clearToken, getPosts, publishPost, deletePost, ApiError } from './api';
import { listDrafts, deleteDraft } from './drafts';
import './admin.css';

export default function AdminPage() {
  const [view, setView] = useState(getToken() ? 'list' : 'login');
  const [posts, setPosts] = useState(null);
  const [drafts, setDrafts] = useState(listDrafts());
  const [loadError, setLoadError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [togglingSlug, setTogglingSlug] = useState(null);
  // editing: { initial, draftId } — initial is the PostEditor seed object
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    document.title = 'Admin · Avigya Paudel';
  }, []);

  const handleAuthError = useCallback((err) => {
    if (err instanceof ApiError && err.status === 401) {
      clearToken();
      setView('login');
      return true;
    }
    return false;
  }, []);

  const loadPosts = useCallback(async () => {
    setLoadError(null);
    try {
      const data = await getPosts();
      setPosts(data.posts);
    } catch (err) {
      if (!handleAuthError(err)) {
        setLoadError(`Could not load posts: ${(err.body && err.body.error) || err.message}`);
      }
    }
  }, [handleAuthError]);

  useEffect(() => {
    if (view === 'list') {
      setDrafts(listDrafts());
      loadPosts();
    }
  }, [view, loadPosts]);

  async function handleDeletePost(slug) {
    try {
      await deletePost(slug);
      setPosts((prev) => prev && prev.filter((p) => p.slug !== slug));
    } catch (err) {
      if (!handleAuthError(err)) {
        setLoadError(`Delete failed: ${(err.body && err.body.error) || err.message}`);
      }
    }
  }

  function handleDeleteDraft(id) {
    deleteDraft(id);
    setDrafts(listDrafts());
  }

  async function handleToggleVisibility(post) {
    setTogglingSlug(post.slug);
    setLoadError(null);
    setNotice(null);
    try {
      const nextPublic = post.public === false;
      await publishPost({ post: { ...post, public: nextPublic }, previousSlug: post.slug });
      // Mirror the server's stored shape: the field exists only when private.
      setPosts((prev) => prev && prev.map((p) => (
        p.slug === post.slug ? { ...p, public: nextPublic ? undefined : false } : p
      )));
      setNotice(nextPublic
        ? `"${post.title}" is now public — moved to the public repo, live after the redeploy (~1–2 min).`
        : `"${post.title}" is now private — moved to the private repo; the public site forgets it after the redeploy (~1–2 min).`);
    } catch (err) {
      if (!handleAuthError(err)) {
        setLoadError(`Visibility change failed: ${(err.body && err.body.error) || err.message}`);
      }
    } finally {
      setTogglingSlug(null);
    }
  }

  if (view === 'login') {
    return (
      <div className="admin-page">
        <LoginForm onSuccess={() => setView('list')} />
      </div>
    );
  }

  if (view === 'editor') {
    return (
      <div className="admin-page">
        <PostEditor
          key={(editing && (editing.draftId || (editing.initial && editing.initial.slug))) || 'new'}
          initial={editing && editing.initial}
          draftId={editing && editing.draftId}
          onBack={() => setView('list')}
          onSaved={loadPosts}
          categories={[...new Set((posts || []).map((p) => p.category).filter(Boolean))].sort()}
          allTags={[...new Set((posts || []).flatMap((p) => p.tags || []))].sort()}
        />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <PostList
        posts={posts}
        drafts={drafts}
        loading={posts === null && !loadError}
        error={loadError}
        notice={notice}
        togglingSlug={togglingSlug}
        onToggleVisibility={handleToggleVisibility}
        onNew={() => { setEditing(null); setView('editor'); }}
        onEditPost={(p) => { setEditing({ initial: { ...p, published: true } }); setView('editor'); }}
        onEditDraft={(d) => {
          setEditing({
            initial: { ...d, published: Boolean(d.previousSlug), previousSlug: d.previousSlug },
            draftId: d.id,
          });
          setView('editor');
        }}
        onDeletePost={handleDeletePost}
        onDeleteDraft={handleDeleteDraft}
        onLogout={() => { clearToken(); setView('login'); }}
      />
    </div>
  );
}

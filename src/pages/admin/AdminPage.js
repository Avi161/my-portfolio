import React, { useCallback, useEffect, useState } from 'react';
import LoginForm from './LoginForm';
import PostList from './PostList';
import PostEditor from './PostEditor';
import { getToken, clearToken, getPosts, deletePost, ApiError } from './api';
import { listDrafts, deleteDraft } from './drafts';
import './admin.css';

export default function AdminPage() {
  const [view, setView] = useState(getToken() ? 'list' : 'login');
  const [posts, setPosts] = useState(null);
  const [drafts, setDrafts] = useState(listDrafts());
  const [loadError, setLoadError] = useState(null);
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

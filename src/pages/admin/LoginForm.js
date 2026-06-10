import React, { useState } from 'react';
import { login } from './api';

export default function LoginForm({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(password);
      onSuccess();
    } catch (err) {
      setError(
        err.status === 401
          ? 'Wrong password.'
          : err.status === 500 && err.body && err.body.error === 'not-configured'
            ? 'ADMIN_PASSWORD is not set on the server.'
            : `Login failed: ${err.message}`
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="admin-login" onSubmit={handleSubmit}>
      <h1>Admin</h1>
      <input
        type="password"
        autoFocus
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" className="admin-primary-btn" disabled={busy || !password}>
        {busy ? 'Checking…' : 'Log in'}
      </button>
      {error && <p className="admin-status admin-status-error">{error}</p>}
    </form>
  );
}

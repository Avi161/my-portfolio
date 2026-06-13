const TOKEN_KEY = 'admin-token';
const COOKIE_NAME = 'admin_token';

export class ApiError extends Error {
  constructor(status, body) {
    super((body && body.error) || `HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

// The token also lives in a cookie: sessionStorage is per-tab, but private
// posts render on /blog in any tab, and their <img> tags can't send an
// Authorization header at all. SameSite=Lax keeps it off cross-site requests;
// the server only ever accepts it for read-only endpoints.
function setCookie(token, expiresAt) {
  const maxAge = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function hasAdminSession() {
  return document.cookie
    .split(';')
    .some((c) => c.trim().startsWith(`${COOKIE_NAME}=`));
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
  document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

async function request(method, path, body) {
  const token = getToken();
  const res = await fetch(path, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

// A ref-conflict means someone pushed between our read and write; the server
// re-reads posts.json on every request, so a single retry is safe.
async function withConflictRetry(fn) {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ApiError && err.status === 409 && err.body && err.body.error === 'ref-conflict') {
      return fn();
    }
    throw err;
  }
}

export async function login(password) {
  const data = await request('POST', '/api/login', { password });
  sessionStorage.setItem(TOKEN_KEY, data.token);
  setCookie(data.token, data.expiresAt);
  return data;
}

export function getPosts() {
  return request('GET', '/api/posts');
}

// Private posts are never in the bundle; the public pages fetch them at
// runtime, authenticated by the session cookie (works in any tab).
export function getPrivatePosts() {
  return request('GET', '/api/posts?private=1');
}

// Uploads one image as a git blob and returns its sha. Images go up one request
// at a time so no single request approaches Vercel's ~4.5MB body limit; publish
// then sends only the (tiny) shas.
export function uploadImageBlob(base64, isPrivate) {
  return request('POST', '/api/posts', { action: 'blob', base64, private: Boolean(isPrivate) });
}

export function publishPost(payload) {
  return withConflictRetry(() => request('POST', '/api/posts', payload));
}

export function deletePost(slug) {
  return withConflictRetry(() =>
    request('DELETE', `/api/posts?slug=${encodeURIComponent(slug)}`)
  );
}

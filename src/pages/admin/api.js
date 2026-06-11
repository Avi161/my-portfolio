const TOKEN_KEY = 'admin-token';

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

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
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
  return data;
}

export function getPosts() {
  return request('GET', '/api/posts');
}

// Uploads one image as a git blob and returns its sha. Images go up one request
// at a time so no single request approaches Vercel's ~4.5MB body limit; publish
// then sends only the (tiny) shas.
export function uploadImageBlob(base64) {
  return request('POST', '/api/posts', { action: 'blob', base64 });
}

export function publishPost(payload) {
  return withConflictRetry(() => request('POST', '/api/posts', payload));
}

export function deletePost(slug) {
  return withConflictRetry(() =>
    request('DELETE', `/api/posts?slug=${encodeURIComponent(slug)}`)
  );
}

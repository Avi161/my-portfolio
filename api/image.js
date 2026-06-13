const { verifyAuth } = require('./_lib/auth');
const { STORES, readFileRaw, GitHubError } = require('./_lib/github');

// slug/file, same characters the publish pipeline generates; no dots beyond
// the extension dot pattern, and the explicit check below rules out traversal.
const REL_RE = /^[a-z0-9-]+\/[a-z0-9][a-z0-9._-]*$/;
const MIME = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
};

// Serves a private post's image from the private repo. <img> tags can't send
// an Authorization header, so this endpoint (read-only) accepts the session
// cookie; without a valid session it 401s and the image simply doesn't load.
module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method-not-allowed' });
  }
  if (!verifyAuth(req, { allowCookie: true })) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const rel = (req.query && req.query.p) || '';
  if (!REL_RE.test(rel) || rel.includes('..')) {
    return res.status(400).json({ error: 'invalid-path' });
  }

  try {
    const buf = await readFileRaw(STORES.private, `${STORES.private.imageDir}/${rel}`);
    const ext = rel.slice(rel.lastIndexOf('.') + 1).toLowerCase();
    res.setHeader('content-type', MIME[ext] || 'application/octet-stream');
    // private: only the admin's own browser may cache, never the CDN.
    res.setHeader('cache-control', 'private, max-age=86400');
    return res.status(200).send(buf);
  } catch (err) {
    if (err instanceof GitHubError && err.status === 404) {
      return res.status(404).json({ error: 'not-found' });
    }
    const status = err instanceof GitHubError ? err.status : undefined;
    return res.status(502).json({ error: 'github', status, detail: err.message });
  }
};

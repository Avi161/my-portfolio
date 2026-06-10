const { verifyAuth } = require('./_lib/auth');
const { readPosts, commitChanges, GitHubError } = require('./_lib/github');

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const IMAGE_PATH_RE = /^public\/images\/blog\/[a-z0-9][a-z0-9./_-]*$/;
// Vercel's hard request limit is 4.5MB; reject a bit under it.
const MAX_BODY_BYTES = 4 * 1024 * 1024;

module.exports = async (req, res) => {
  if (!verifyAuth(req)) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  if (Number(req.headers['content-length'] || 0) > MAX_BODY_BYTES) {
    return res.status(413).json({ error: 'payload-too-large' });
  }

  try {
    if (req.method === 'GET') {
      const posts = await readPosts();
      return res.status(200).json({ posts });
    }
    if (req.method === 'POST') {
      return await savePost(req, res);
    }
    if (req.method === 'DELETE') {
      return await deletePost(req, res);
    }
    return res.status(405).json({ error: 'method-not-allowed' });
  } catch (err) {
    if (err instanceof GitHubError && err.status === 409) {
      return res.status(409).json({ error: 'ref-conflict' });
    }
    const status = err instanceof GitHubError ? err.status : undefined;
    return res.status(502).json({ error: 'github', status, detail: err.message });
  }
};

function validatePost(post, images) {
  if (!post || typeof post !== 'object') return { error: 'missing-post' };
  if (!SLUG_RE.test(post.slug || '')) return { error: 'invalid-slug', field: 'slug' };
  if (!DATE_RE.test(post.date || '')) return { error: 'invalid-date', field: 'date' };
  if (!post.title || typeof post.title !== 'string') {
    return { error: 'missing-title', field: 'title' };
  }
  if (!post.content || typeof post.content !== 'string') {
    return { error: 'missing-content', field: 'content' };
  }
  if (typeof post.summary !== 'string') {
    return { error: 'invalid-summary', field: 'summary' };
  }
  for (const image of images) {
    if (
      !image ||
      typeof image.path !== 'string' ||
      typeof image.base64 !== 'string' ||
      !image.base64 ||
      image.path.includes('..') ||
      !IMAGE_PATH_RE.test(image.path)
    ) {
      return { error: 'invalid-image-path', field: 'images' };
    }
  }
  return null;
}

async function savePost(req, res) {
  const body = req.body || {};
  const { post, previousSlug } = body;
  const images = Array.isArray(body.images) ? body.images : [];

  const invalid = validatePost(post, images);
  if (invalid) return res.status(400).json(invalid);

  const posts = await readPosts();
  const clean = {
    slug: post.slug,
    title: post.title,
    date: post.date,
    summary: post.summary,
    content: post.content,
  };

  let message;
  if (previousSlug) {
    const index = posts.findIndex((p) => p.slug === previousSlug);
    if (index === -1) return res.status(404).json({ error: 'not-found' });
    if (
      previousSlug !== clean.slug &&
      posts.some((p) => p.slug === clean.slug)
    ) {
      return res.status(409).json({ error: 'slug-exists' });
    }
    posts[index] = clean;
    message = `blog: update "${clean.title}"`;
  } else {
    if (posts.some((p) => p.slug === clean.slug)) {
      return res.status(409).json({ error: 'slug-exists' });
    }
    posts.unshift(clean);
    message = `blog: publish "${clean.title}"`;
  }

  const commitSha = await commitChanges({ message, posts, addImages: images });
  return res.status(200).json({ ok: true, commitSha });
}

function imagePathsIn(content) {
  const paths = new Set();
  const re = /\/images\/blog\/([a-z0-9-]+\/[^"'\s)]+)/g;
  let match;
  while ((match = re.exec(content)) !== null) {
    paths.add(`public/images/blog/${match[1]}`);
  }
  return paths;
}

async function deletePost(req, res) {
  const slug = req.query && req.query.slug;
  if (!slug) return res.status(400).json({ error: 'missing-slug' });

  const posts = await readPosts();
  const index = posts.findIndex((p) => p.slug === slug);
  if (index === -1) return res.status(404).json({ error: 'not-found' });

  const [removed] = posts.splice(index, 1);
  // Clean up the post's images (after a slug rename they can live under the
  // old slug's directory), but never one still referenced by another post.
  const stillReferenced = new Set(posts.flatMap((p) => [...imagePathsIn(p.content)]));
  const deletePaths = [...imagePathsIn(removed.content)].filter((p) => !stillReferenced.has(p));

  const commitSha = await commitChanges({
    message: `blog: delete "${slug}"`,
    posts,
    deletePaths,
  });
  return res.status(200).json({ ok: true, commitSha });
}

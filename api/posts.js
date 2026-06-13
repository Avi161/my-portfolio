const { verifyAuth } = require('./_lib/auth');
const {
  STORES,
  readPosts,
  createBlob,
  listDirShas,
  readBlobBase64,
  commitChanges,
  GitHubError,
} = require('./_lib/github');

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const IMAGE_PATH_RES = {
  public: /^public\/images\/blog\/[a-z0-9][a-z0-9./_-]*$/,
  private: /^images\/blog\/[a-z0-9][a-z0-9./_-]*$/,
};
// Vercel's hard request limit is 4.5MB; reject a bit under it.
const MAX_BODY_BYTES = 4.4 * 1024 * 1024;

module.exports = async (req, res) => {
  // Reads may authenticate via the session cookie so private posts render
  // outside the /admin tab; writes require the Bearer header.
  const isRead = req.method === 'GET';
  if (!verifyAuth(req, { allowCookie: isRead })) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  if (Number(req.headers['content-length'] || 0) > MAX_BODY_BYTES) {
    return res.status(413).json({ error: 'payload-too-large' });
  }

  try {
    if (req.method === 'GET') {
      if (req.query && req.query.private) {
        const posts = (await readPosts(STORES.private)).map((p) => ({ ...p, public: false }));
        return res.status(200).json({ posts });
      }
      const [publicPosts, privatePosts] = await Promise.all([
        readPosts(STORES.public),
        readPosts(STORES.private),
      ]);
      const posts = [
        ...publicPosts,
        ...privatePosts.map((p) => ({ ...p, public: false })),
      ].sort((a, b) => String(b.date).localeCompare(String(a.date)));
      return res.status(200).json({ posts });
    }
    if (req.method === 'POST') {
      if (req.body && req.body.action === 'blob') {
        return await uploadBlob(req, res);
      }
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

function validatePost(post, images, store) {
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
  if (post.public !== undefined && typeof post.public !== 'boolean') {
    return { error: 'invalid-public', field: 'public' };
  }
  if (post.category !== undefined && typeof post.category !== 'string') {
    return { error: 'invalid-category', field: 'category' };
  }
  if (typeof post.category === 'string' && post.category.trim().length > 40) {
    return { error: 'invalid-category', field: 'category' };
  }
  for (const image of images) {
    // Each image carries either a pre-uploaded blob sha (normal path) or inline
    // base64 (small single-request publishes); exactly one must be present.
    // The path must match the destination store's scheme — a private post must
    // never carry an image destined for the public repo.
    const hasSha = image && typeof image.sha === 'string' && image.sha;
    const hasBase64 = image && typeof image.base64 === 'string' && image.base64;
    if (
      !image ||
      typeof image.path !== 'string' ||
      (!hasSha && !hasBase64) ||
      image.path.includes('..') ||
      !IMAGE_PATH_RES[store.key].test(image.path)
    ) {
      return { error: 'invalid-image-path', field: 'images' };
    }
  }
  return null;
}

// slug/file image references this store's scheme makes inside post HTML.
function imageRelsIn(content, store) {
  const rels = new Set();
  const re = store.srcRe();
  let match;
  while ((match = re.exec(content)) !== null) {
    rels.add(match[1]);
  }
  return rels;
}

function imageRepoPathsIn(content, store) {
  return new Set([...imageRelsIn(content, store)].map((rel) => `${store.imageDir}/${rel}`));
}

// Copies a post's image blobs from one repo to the other and rewrites the
// content srcs to the destination scheme. Returns { content, addImages }.
async function migrateImages(content, source, target) {
  const rels = [...imageRelsIn(content, source)];
  const addImages = [];
  const dirShas = {}; // dir path -> { name: sha }, cached per directory
  for (const rel of rels) {
    const dir = `${source.imageDir}/${rel.slice(0, rel.lastIndexOf('/'))}`;
    const name = rel.slice(rel.lastIndexOf('/') + 1);
    if (!dirShas[dir]) dirShas[dir] = await listDirShas(source, dir);
    const sha = dirShas[dir][name];
    // A dangling src (image already gone from the source repo) is rewritten but
    // not copied — same fail-soft stance as deletePost's best-effort cleanup.
    if (sha) {
      const base64 = await readBlobBase64(source, sha);
      addImages.push({ path: `${target.imageDir}/${rel}`, sha: await createBlob(target, base64) });
    }
    content = content.split(source.imageSrc(rel)).join(target.imageSrc(rel));
  }
  return { content, addImages };
}

async function savePost(req, res) {
  const body = req.body || {};
  const { post, previousSlug } = body;
  const images = Array.isArray(body.images) ? body.images : [];

  const target = post && post.public === false ? STORES.private : STORES.public;
  const invalid = validatePost(post, images, target);
  if (invalid) return res.status(400).json(invalid);

  const [publicPosts, privatePosts] = await Promise.all([
    readPosts(STORES.public),
    readPosts(STORES.private),
  ]);
  const listFor = (store) => (store.key === 'public' ? publicPosts : privatePosts);

  // Optional fields are written only when meaningful so legacy posts (and
  // posts toggled back to public/uncategorized) keep the minimal 5-field shape.
  const category = typeof post.category === 'string'
    ? post.category.trim().replace(/\s+/g, ' ')
    : '';
  const clean = {
    slug: post.slug,
    title: post.title,
    date: post.date,
    summary: post.summary,
    content: post.content,
    ...(category ? { category } : {}),
    ...(post.public === false ? { public: false } : {}),
  };

  // Slugs are unique across BOTH repos so /blog/:slug is never ambiguous.
  const slugTakenElsewhere = [...publicPosts, ...privatePosts].some(
    (p) => p.slug === clean.slug && p.slug !== previousSlug
  );

  if (previousSlug) {
    const source = publicPosts.some((p) => p.slug === previousSlug)
      ? STORES.public
      : privatePosts.some((p) => p.slug === previousSlug)
        ? STORES.private
        : null;
    if (!source) return res.status(404).json({ error: 'not-found' });
    if (slugTakenElsewhere) return res.status(409).json({ error: 'slug-exists' });

    if (source === target) {
      const posts = listFor(target);
      const index = posts.findIndex((p) => p.slug === previousSlug);
      posts[index] = clean;
      const commitSha = await commitChanges(target, {
        message: `blog: update "${clean.title}"`,
        posts,
        addImages: images,
      });
      return res.status(200).json({ ok: true, commitSha, private: target.key === 'private' });
    }

    // Visibility changed: move the post (and its image binaries) across repos.
    // Two commits, target first — if the source cleanup fails the post is
    // briefly duplicated, never lost; a retried publish converges.
    const migrated = await migrateImages(clean.content, source, target);
    clean.content = migrated.content;

    const targetPosts = listFor(target);
    targetPosts.unshift(clean);
    const commitSha = await commitChanges(target, {
      message: `blog: ${target.key === 'private' ? 'make private' : 'make public'} "${clean.title}"`,
      posts: targetPosts,
      addImages: [...migrated.addImages, ...images],
    });

    const sourcePosts = listFor(source);
    const index = sourcePosts.findIndex((p) => p.slug === previousSlug);
    const [removed] = sourcePosts.splice(index, 1);
    const stillReferenced = new Set(
      sourcePosts.flatMap((p) => [...imageRepoPathsIn(p.content, source)])
    );
    const deletePaths = [...imageRepoPathsIn(removed.content, source)].filter(
      (p) => !stillReferenced.has(p)
    );
    await commitChanges(source, {
      message: `blog: moved "${clean.title}" to ${target.key} store`,
      posts: sourcePosts,
      deletePaths,
    });
    return res.status(200).json({ ok: true, commitSha, private: target.key === 'private' });
  }

  if (slugTakenElsewhere) return res.status(409).json({ error: 'slug-exists' });
  const posts = listFor(target);
  posts.unshift(clean);
  const commitSha = await commitChanges(target, {
    message: `blog: publish "${clean.title}"`,
    posts,
    addImages: images,
  });
  return res.status(200).json({ ok: true, commitSha, private: target.key === 'private' });
}

// Uploads one image as a git blob and returns its sha. Splitting images into
// their own requests keeps each one under the per-request size limit; the
// publish call then references the shas and commits everything atomically.
async function uploadBlob(req, res) {
  const base64 = req.body && req.body.base64;
  if (typeof base64 !== 'string' || !base64) {
    return res.status(400).json({ error: 'missing-base64' });
  }
  const store = req.body.private ? STORES.private : STORES.public;
  const sha = await createBlob(store, base64);
  return res.status(200).json({ ok: true, sha });
}

async function deletePost(req, res) {
  const slug = req.query && req.query.slug;
  if (!slug) return res.status(400).json({ error: 'missing-slug' });

  for (const store of [STORES.public, STORES.private]) {
    const posts = await readPosts(store);
    const index = posts.findIndex((p) => p.slug === slug);
    if (index === -1) continue;

    const [removed] = posts.splice(index, 1);
    // Clean up the post's images (after a slug rename they can live under the
    // old slug's directory), but never one still referenced by another post.
    const stillReferenced = new Set(
      posts.flatMap((p) => [...imageRepoPathsIn(p.content, store)])
    );
    const deletePaths = [...imageRepoPathsIn(removed.content, store)].filter(
      (p) => !stillReferenced.has(p)
    );

    const commitSha = await commitChanges(store, {
      message: `blog: delete "${slug}"`,
      posts,
      deletePaths,
    });
    return res.status(200).json({ ok: true, commitSha });
  }
  return res.status(404).json({ error: 'not-found' });
}

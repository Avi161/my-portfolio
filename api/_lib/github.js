// Posts live in two repos: public posts in the deployed portfolio repo (so
// Vercel rebuilds and they ship in the bundle), private posts in a separate
// private repo that is never deployed — their content is only ever served at
// runtime by the API to an authenticated admin session.
const STORES = {
  public: {
    key: 'public',
    repo: 'Avi161/my-portfolio',
    postsPath: 'src/data/posts.json',
    imageDir: 'public/images/blog',
    imageSrc: (rel) => `/images/blog/${rel}`,
    // Matches this store's image srcs inside post HTML, capturing slug/file.
    srcRe: () => /\/images\/blog\/([a-z0-9-]+\/[^"'\s)?]+)/g,
  },
  private: {
    key: 'private',
    repo: process.env.PRIVATE_REPO || 'Avi161/my-portfolio-private',
    postsPath: 'posts.json',
    imageDir: 'images/blog',
    imageSrc: (rel) => `/api/image?p=${rel}`,
    srcRe: () => /\/api\/image\?p=([a-z0-9-]+\/[^"'\s)&]+)/g,
  },
};

// Vercel Hobby rejects deploys whose tip commit has more than one author, so
// every API-created commit must be single-author with no Co-Authored-By trailer.
const AUTHOR = { name: 'Avi161', email: 'paudela@union.edu' };

class GitHubError extends Error {
  constructor(status, detail) {
    super(`GitHub API ${status}: ${detail}`);
    this.status = status;
    this.detail = detail;
  }
}

function branch() {
  return process.env.GITHUB_BRANCH || 'main';
}

function headers(accept) {
  return {
    authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    accept,
    'x-github-api-version': '2022-11-28',
  };
}

async function gh(method, path, body) {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      ...headers('application/vnd.github+json'),
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new GitHubError(res.status, text.slice(0, 500));
  }
  return res.json();
}

async function readPosts(store) {
  try {
    const file = await gh(
      'GET',
      `/repos/${store.repo}/contents/${store.postsPath}?ref=${branch()}`
    );
    return JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
  } catch (err) {
    // A freshly created private repo has no posts.json yet; the first publish
    // commits it. The public file must exist — failing loud there is correct.
    if (store.key === 'private' && err instanceof GitHubError && err.status === 404) {
      return [];
    }
    throw err;
  }
}

// Uploads one image as a git blob (no commit yet) and returns its sha. Called
// once per image at publish so each request stays well under the size limit;
// the shas are then bundled into a single commit by commitChanges.
async function createBlob(store, base64) {
  const blob = await gh('POST', `/repos/${store.repo}/git/blobs`, {
    content: base64,
    encoding: 'base64',
  });
  return blob.sha;
}

// Directory listing → { name: blobSha }. The Contents API includes shas for
// entries of any size (unlike file content, which caps at 1MB), so this is the
// reliable way to locate image blobs when moving a post between repos.
async function listDirShas(store, dirPath) {
  try {
    const entries = await gh(
      'GET',
      `/repos/${store.repo}/contents/${dirPath}?ref=${branch()}`
    );
    const shas = {};
    for (const entry of entries) {
      if (entry.type === 'file') shas[entry.name] = entry.sha;
    }
    return shas;
  } catch (err) {
    if (err instanceof GitHubError && err.status === 404) return {};
    throw err;
  }
}

async function readBlobBase64(store, sha) {
  const blob = await gh('GET', `/repos/${store.repo}/git/blobs/${sha}`);
  return blob.content;
}

// Raw file bytes (used to serve private images). The raw media type works for
// files up to 100MB, well past anything the publish pipeline lets through.
async function readFileRaw(store, filePath) {
  const res = await fetch(
    `https://api.github.com/repos/${store.repo}/contents/${filePath}?ref=${branch()}`,
    { headers: headers('application/vnd.github.raw+json') }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new GitHubError(res.status, text.slice(0, 500));
  }
  return Buffer.from(await res.arrayBuffer());
}

// Builds one atomic commit containing the updated posts.json plus any image
// additions/deletions, then fast-forwards the branch ref.
async function commitChanges(store, { message, posts, addImages = [], deletePaths = [] }) {
  const ref = await gh('GET', `/repos/${store.repo}/git/ref/heads/${branch()}`);
  const headSha = ref.object.sha;
  const headCommit = await gh('GET', `/repos/${store.repo}/git/commits/${headSha}`);

  const tree = [];
  const postsBlob = await gh('POST', `/repos/${store.repo}/git/blobs`, {
    content: JSON.stringify(posts, null, 2) + '\n',
    encoding: 'utf-8',
  });
  tree.push({ path: store.postsPath, mode: '100644', type: 'blob', sha: postsBlob.sha });

  for (const image of addImages) {
    // Images are normally uploaded ahead of time (one request each, to dodge
    // the per-request size limit) and arrive here as a blob sha; fall back to
    // inlining base64 for small single-request publishes.
    let sha = image.sha;
    if (!sha) {
      const blob = await gh('POST', `/repos/${store.repo}/git/blobs`, {
        content: image.base64,
        encoding: 'base64',
      });
      sha = blob.sha;
    }
    tree.push({ path: image.path, mode: '100644', type: 'blob', sha });
  }
  for (const path of deletePaths) {
    tree.push({ path, mode: '100644', type: 'blob', sha: null });
  }

  let newTree;
  try {
    newTree = await gh('POST', `/repos/${store.repo}/git/trees`, {
      base_tree: headCommit.tree.sha,
      tree,
    });
  } catch (err) {
    // Image cleanup is best-effort: deleting a path GitHub says doesn't exist
    // fails the whole tree, so retry without the deletions.
    if (err instanceof GitHubError && err.status === 422 && deletePaths.length) {
      newTree = await gh('POST', `/repos/${store.repo}/git/trees`, {
        base_tree: headCommit.tree.sha,
        tree: tree.filter((entry) => entry.sha !== null),
      });
    } else {
      throw err;
    }
  }

  const commit = await gh('POST', `/repos/${store.repo}/git/commits`, {
    message,
    tree: newTree.sha,
    parents: [headSha],
    author: AUTHOR,
    committer: AUTHOR,
  });

  try {
    await gh('PATCH', `/repos/${store.repo}/git/refs/heads/${branch()}`, {
      sha: commit.sha,
      force: false,
    });
  } catch (err) {
    // Non-fast-forward: someone pushed between our read and write.
    if (err instanceof GitHubError && err.status === 422) {
      throw new GitHubError(409, 'ref-conflict');
    }
    throw err;
  }

  return commit.sha;
}

module.exports = {
  STORES,
  readPosts,
  createBlob,
  listDirShas,
  readBlobBase64,
  readFileRaw,
  commitChanges,
  GitHubError,
};

const REPO = 'Avi161/my-portfolio';
const POSTS_PATH = 'src/data/posts.json';
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

async function gh(method, path, body) {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
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

async function readPosts() {
  const file = await gh(
    'GET',
    `/repos/${REPO}/contents/${POSTS_PATH}?ref=${branch()}`
  );
  return JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
}

// Builds one atomic commit containing the updated posts.json plus any image
// additions/deletions, then fast-forwards the branch ref.
async function commitChanges({ message, posts, addImages = [], deletePaths = [] }) {
  const ref = await gh('GET', `/repos/${REPO}/git/ref/heads/${branch()}`);
  const headSha = ref.object.sha;
  const headCommit = await gh('GET', `/repos/${REPO}/git/commits/${headSha}`);

  const tree = [];
  const postsBlob = await gh('POST', `/repos/${REPO}/git/blobs`, {
    content: JSON.stringify(posts, null, 2) + '\n',
    encoding: 'utf-8',
  });
  tree.push({ path: POSTS_PATH, mode: '100644', type: 'blob', sha: postsBlob.sha });

  for (const image of addImages) {
    const blob = await gh('POST', `/repos/${REPO}/git/blobs`, {
      content: image.base64,
      encoding: 'base64',
    });
    tree.push({ path: image.path, mode: '100644', type: 'blob', sha: blob.sha });
  }
  for (const path of deletePaths) {
    tree.push({ path, mode: '100644', type: 'blob', sha: null });
  }

  let newTree;
  try {
    newTree = await gh('POST', `/repos/${REPO}/git/trees`, {
      base_tree: headCommit.tree.sha,
      tree,
    });
  } catch (err) {
    // Image cleanup is best-effort: deleting a path GitHub says doesn't exist
    // fails the whole tree, so retry without the deletions.
    if (err instanceof GitHubError && err.status === 422 && deletePaths.length) {
      newTree = await gh('POST', `/repos/${REPO}/git/trees`, {
        base_tree: headCommit.tree.sha,
        tree: tree.filter((entry) => entry.sha !== null),
      });
    } else {
      throw err;
    }
  }

  const commit = await gh('POST', `/repos/${REPO}/git/commits`, {
    message,
    tree: newTree.sha,
    parents: [headSha],
    author: AUTHOR,
    committer: AUTHOR,
  });

  try {
    await gh('PATCH', `/repos/${REPO}/git/refs/heads/${branch()}`, {
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

module.exports = { readPosts, commitChanges, GitHubError };

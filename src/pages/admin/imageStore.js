// A per-draft store of pasted/inserted image data. Keeping the (multi-kilobyte)
// data: URLs out of the editable source is what lets Markdown/HTML mode show a
// short `cimg://<id>` placeholder instead of a wall of base64. The real data
// URLs are restored (expandImages) only where they're actually needed: feeding
// the rich editor so it can render, and publishing so the bytes get uploaded.

const DATA_URL_RE = /data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+/gi;
const TOKEN_RE = /cimg:\/\/([a-z0-9]+)/gi;

export function makeImageStore(initial) {
  return { ...(initial || {}) };
}

function findId(store, dataUrl) {
  for (const id of Object.keys(store)) {
    if (store[id] === dataUrl) return id;
  }
  return null;
}

function freshId(store) {
  let id;
  do {
    id = Math.random().toString(36).slice(2, 10);
  } while (store[id]);
  return id;
}

// Records a data URL and returns its placeholder id, reusing the existing id
// for an identical image so repeated pastes don't bloat the store.
export function addImage(store, dataUrl) {
  let id = findId(store, dataUrl);
  if (!id) {
    id = freshId(store);
    store[id] = dataUrl;
  }
  return id;
}

// data: URLs -> cimg://<id> placeholders (adds any new entries to store).
export function collapseImages(text, store) {
  if (!text) return text;
  return text.replace(DATA_URL_RE, (dataUrl) => `cimg://${addImage(store, dataUrl)}`);
}

// cimg://<id> placeholders -> the stored data: URL. Unknown ids are left intact
// so the caller can detect them via hasUnresolvedImages.
export function expandImages(text, store) {
  if (!text) return text;
  return text.replace(TOKEN_RE, (whole, id) => store[id] || whole);
}

// True if the text references a placeholder this store can't resolve — a sign a
// draft was reopened on a device that never had the image bytes.
export function hasUnresolvedImages(text, store) {
  if (!text) return false;
  const re = new RegExp(TOKEN_RE.source, 'gi');
  let match;
  while ((match = re.exec(text)) !== null) {
    if (!store[match[1]]) return true;
  }
  return false;
}

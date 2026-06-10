const KEY = 'admin-drafts-v1';

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

function writeAll(drafts) {
  localStorage.setItem(KEY, JSON.stringify(drafts));
}

export function listDrafts() {
  return Object.values(readAll()).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function saveDraft(draft) {
  const drafts = readAll();
  drafts[draft.id] = { ...draft, updatedAt: Date.now() };
  writeAll(drafts);
  return drafts[draft.id];
}

export function deleteDraft(id) {
  const drafts = readAll();
  delete drafts[id];
  writeAll(drafts);
}

export function newDraftId() {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

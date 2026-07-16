// Shared helpers for slash-separated section paths ("Journal/2026/July").
// Used by the public blog pages and the admin section picker alike.

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

export function splitPath(path) {
  return path ? path.split('/') : [];
}

// True when `category` is `path` itself or nested anywhere under it.
export function inPath(category, path) {
  return category === path || Boolean(category && category.startsWith(`${path}/`));
}

export function firstSeg(category) {
  return splitPath(category)[0] || '';
}

function monthIndex(name) {
  if (name.length < 3) return -1; // "j" alone shouldn't match january
  return MONTHS.findIndex((m) => m.startsWith(name.toLowerCase()));
}

// Alphabetical, except runs of years/months sort newest-first so a journal's
// subsections read chronologically without manual ordering.
export function smartCompare(a, b) {
  const na = Number(a);
  const nb = Number(b);
  if (Number.isFinite(na) && Number.isFinite(nb)) return nb - na;
  const ma = monthIndex(a);
  const mb = monthIndex(b);
  if (ma !== -1 && mb !== -1) return mb - ma;
  return a.localeCompare(b);
}

// Distinct next-level segments under `prefixSegs` among the given paths.
export function childrenOf(categories, prefixSegs) {
  const seen = new Set();
  for (const category of categories) {
    if (!category) continue;
    const parts = category.split('/');
    if (parts.length > prefixSegs.length && prefixSegs.every((seg, i) => parts[i] === seg)) {
      seen.add(parts[prefixSegs.length]);
    }
  }
  return [...seen].sort(smartCompare);
}

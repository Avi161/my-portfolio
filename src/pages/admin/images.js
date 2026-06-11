const MAX_WIDTH = 1600;
const MIN_WIDTH = 640;
// JPEG starts near-lossless; quality is only the last lever, so images keep
// their fidelity. Keep the encoded data URL (≈ the blob upload request body)
// under the server's cap so even large pastes upload without a "too large" error.
const HIGH_QUALITY = 0.92;
const FLOOR_QUALITY = 0.72;
const TARGET_CHARS = 4.0 * 1024 * 1024;

function drawScaled(img, width, ratio) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = Math.max(1, Math.round(width * ratio));
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return { canvas, ctx };
}

function hasAlpha(ctx, width, height) {
  const { data } = ctx.getImageData(0, 0, width, height);
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true;
  }
  return false;
}

// Re-encodes large images client-side so each fits in a single upload request —
// drag-resizing in the editor only changes display size, not the bytes, so the
// actual shrinking happens here. Strategy favours quality: a near-lossless JPEG
// (or PNG when transparency is present), shrinking *resolution* first to fit and
// only dropping JPEG quality as a last resort. Photos almost never trip either.
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const ratio = img.naturalHeight / img.naturalWidth;
      let width = Math.round(Math.min(img.naturalWidth, MAX_WIDTH));

      let { canvas, ctx } = drawScaled(img, width, ratio);
      const keepPng = file.type === 'image/png' && hasAlpha(ctx, canvas.width, canvas.height);
      const mime = keepPng ? 'image/png' : 'image/jpeg';
      let quality = HIGH_QUALITY;
      let out = canvas.toDataURL(mime, quality);

      // Shrink resolution first — keeps the encoder's fidelity intact.
      while (out.length > TARGET_CHARS && width > MIN_WIDTH) {
        width = Math.round(width * 0.85);
        ({ canvas, ctx } = drawScaled(img, width, ratio));
        out = canvas.toDataURL(mime, quality);
      }
      // Only if it still won't fit at MIN_WIDTH do we trade some JPEG quality.
      while (mime === 'image/jpeg' && out.length > TARGET_CHARS && quality > FLOOR_QUALITY) {
        quality = Math.round((quality - 0.07) * 100) / 100;
        out = canvas.toDataURL(mime, quality);
      }
      resolve(out);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image file'));
    };
    img.src = url;
  });
}

async function hash8(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)]
    .slice(0, 4)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Pulls data-URL images out of the post HTML and returns repo-relative file
// entries for them, with the HTML srcs rewritten to the deployed /images/...
// paths. Returns the input untouched when there's nothing to extract, so
// hand-written HTML never gets re-serialized needlessly.
export async function extractImages(html, slug) {
  if (!html.includes('src="data:')) return { html, images: [] };

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const imgs = [...doc.querySelectorAll('img[src^="data:"]')];
  if (!imgs.length) return { html, images: [] };

  const images = [];
  let n = 1;
  for (const img of imgs) {
    const match = img
      .getAttribute('src')
      .match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,(.+)$/);
    if (!match) continue;
    const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
    const base64 = match[2];
    const path = `public/images/blog/${slug}/${slug}-${n}-${await hash8(base64)}.${ext}`;
    images.push({ path, base64 });
    img.setAttribute('src', `/${path.slice('public/'.length)}`);
    n += 1;
  }
  return { html: doc.body.innerHTML, images };
}

const MAX_WIDTH = 1600;
const JPEG_QUALITY = 0.85;

// Downscales large images client-side so publish payloads stay well under
// Vercel's 4.5MB request limit. PNGs stay PNG (transparency); the rest
// become JPEG.
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_WIDTH / img.naturalWidth);
      const width = Math.round(img.naturalWidth * scale);
      const height = Math.round(img.naturalHeight * scale);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      const isPng = file.type === 'image/png';
      resolve(canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', JPEG_QUALITY));
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

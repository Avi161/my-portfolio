// Posts are managed via /admin (or by editing posts.json directly).
import posts from './posts.json';

const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));

// Includes unlisted (public: false) posts — only for direct-URL rendering.
export const allPosts = sorted;
export const publicPosts = sorted.filter((p) => p.public !== false);

// Default stays public-only so any importer fails closed.
export default publicPosts;

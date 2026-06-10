// Posts are managed via /admin (or by editing posts.json directly).
import posts from './posts.json';

const blogPosts = [...posts].sort((a, b) => b.date.localeCompare(a.date));

export default blogPosts;

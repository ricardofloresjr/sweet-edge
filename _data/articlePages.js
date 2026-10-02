import { readPosts, locales } from '../lib/posts.js';
export default () => readPosts().flatMap(post => locales.map(lang => ({ post, lang })));

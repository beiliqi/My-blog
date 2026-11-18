import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { SITE } from '../config';
import { getPosts, postPath } from '../lib/posts';

export const GET: APIRoute = async (context) => {
  const posts = await getPosts();
  const site = context.site ?? new URL('https://blog.example.com');

  return rss({
    title: SITE.title,
    description: SITE.description,
    site,
    trailingSlash: true,
    customData: `<language>${SITE.lang}</language>`,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: postPath(post),
      categories: post.data.tags,
      author: SITE.author,
    })),
  });
};

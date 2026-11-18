import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { SITE } from '../config';
import { getPosts, postPath } from '../lib/posts';
import { withBase } from '../lib/url';

export const GET: APIRoute = async (context) => {
  const posts = await getPosts();
  const origin = context.site ?? new URL('https://blog.example.com');
  // 频道地址要带上子路径前缀，否则订阅里的站点链接会指到根路径
  const site = new URL(withBase('/'), origin);

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

import type { APIRoute } from 'astro';
import { getPosts, postPath } from '../lib/posts';
import { extractHeadings, toSearchText } from '../lib/search';

export const GET: APIRoute = async () => {
  const posts = await getPosts();

  const payload = posts.map((post) => {
    const body = post.body ?? '';
    return {
      url: postPath(post),
      title: post.data.title,
      description: post.data.description,
      date: post.data.date.toISOString().slice(0, 10),
      tags: post.data.tags,
      headings: extractHeadings(body),
      text: toSearchText(body).slice(0, 6000),
    };
  });

  return new Response(JSON.stringify(payload), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
};

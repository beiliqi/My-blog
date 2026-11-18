import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL('https://blog.example.com')).href.replace(/\/$/, '');

  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /lab',
    'Disallow: /search',
    '',
    `Sitemap: ${base}/sitemap-index.xml`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};

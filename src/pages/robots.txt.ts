import type { APIRoute } from 'astro';
import { withBase } from '../lib/url';

export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? new URL('https://blog.example.com')).href.replace(/\/$/, '');

  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /lab',
    'Disallow: /search',
    '',
    `Sitemap: ${origin}${withBase('/sitemap-index.xml')}`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};

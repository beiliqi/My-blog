import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * 文章：content/posts 下的 .md / .mdx
 * 文件名即 URL slug（例如 asyncio-spider.md → /posts/asyncio-spider/）
 */
const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      description: z.string().default(''),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      category: z.string().optional(),
      series: z
        .object({
          name: z.string(),
          order: z.number().int().positive(),
        })
        .optional(),
      draft: z.boolean().default(false),
      cover: image().optional(),
      coverAlt: z.string().default(''),
      lang: z.enum(['zh', 'en']).default('zh'),
      toc: z.boolean().default(true),
    }),
});

/** 独立页面：关于、项目说明等 */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().default(''),
    updated: z.coerce.date().optional(),
  }),
});

export const collections = { posts, pages };

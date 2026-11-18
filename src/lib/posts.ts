import { getCollection, type CollectionEntry } from 'astro:content';
import { withBase } from './url';

export type Post = CollectionEntry<'posts'>;

/** 草稿只在 dev 环境可见 */
export function isPublished(post: Post): boolean {
  return import.meta.env.DEV || !post.data.draft;
}

/** 全部已发布文章，按日期倒序 */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', isPublished);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** 文章 URL：文件名即 slug */
export function postPath(post: Post): string {
  return withBase(`/posts/${post.id}/`);
}

export interface TagCount {
  name: string;
  count: number;
}

export function collectTags(posts: Post[]): TagCount[] {
  const counter = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      counter.set(tag, (counter.get(tag) ?? 0) + 1);
    }
  }
  return [...counter.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
}

export function collectCategories(posts: Post[]): TagCount[] {
  const counter = new Map<string, number>();
  for (const post of posts) {
    const category = post.data.category;
    if (!category) continue;
    counter.set(category, (counter.get(category) ?? 0) + 1);
  }
  return [...counter.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
}

export function groupByYear(posts: Post[]): Array<{ year: string; posts: Post[] }> {
  const groups: Array<{ year: string; posts: Post[] }> = [];
  for (const post of posts) {
    const year = String(post.data.date.getUTCFullYear());
    const last = groups[groups.length - 1];
    if (last && last.year === year) {
      last.posts.push(post);
    } else {
      groups.push({ year, posts: [post] });
    }
  }
  return groups;
}

export interface Neighbors {
  newer?: Post;
  older?: Post;
}

/** posts 为倒序列表：索引越小越新 */
export function neighborsOf(posts: Post[], id: string): Neighbors {
  const index = posts.findIndex((post) => post.id === id);
  if (index === -1) return {};
  return {
    newer: index > 0 ? posts[index - 1] : undefined,
    older: index < posts.length - 1 ? posts[index + 1] : undefined,
  };
}

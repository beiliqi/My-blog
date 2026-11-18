const FENCE = /```[^\n]*\n([\s\S]*?)```/g;

/** 把 Markdown 压成一行纯文本，供客户端检索用 */
export function toSearchText(markdown: string): string {
  return markdown
    .replace(FENCE, (_match, code: string) => ` ${code} `)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/`{1,3}/g, ' ')
    .replace(/[*_~>|]/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 二级到四级标题，作为检索时的加权字段 */
export function extractHeadings(markdown: string): string[] {
  return [...markdown.matchAll(/^#{2,4}\s+(.+)$/gm)]
    .map((match) => match[1]!.replace(/[#*`]/g, '').trim())
    .filter(Boolean);
}

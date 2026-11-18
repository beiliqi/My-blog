const pad = (value: number) => String(value).padStart(2, '0');

/** 统一用 UTC 取值：YAML 里的 2026-11-18 会被解析成 UTC 零点，避免时区偏移串日期 */
export function formatDate(value: Date): string {
  return `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())}`;
}

export function formatDateLong(value: Date): string {
  return `${value.getUTCFullYear()} 年 ${value.getUTCMonth() + 1} 月 ${value.getUTCDate()} 日`;
}

const CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g;

/**
 * 中文按字计、英文按词计的中位阅读速度。
 * 代码块里的符号会被算成词，属于可接受的误差。
 */
export function readingMinutes(markdown: string): number {
  const text = markdown.replace(/```[\s\S]*?```/g, ' ');
  const cjk = (text.match(CJK) ?? []).length;
  const words = (text.replace(CJK, ' ').match(/[A-Za-z0-9_]+/g) ?? []).length;
  return Math.max(1, Math.round(cjk / 350 + words / 200));
}

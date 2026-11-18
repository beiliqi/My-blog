/**
 * 站内链接统一走这里。
 *
 * 部署在子路径时（GitHub Pages 项目站，例如 https://user.github.io/blog/），
 * `base` 会被设成 `/blog`，所有绝对路径都必须带上这个前缀，否则 404。
 * 本地和 Docker 部署时 `base` 是 `/`，withBase 原样返回。
 */
const rawBase = import.meta.env.BASE_URL || '/';
const normalized = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

/** 带尾斜杠的部署前缀，例如 `/` 或 `/blog/` */
export const basePath = normalized;

export function withBase(path = '/'): string {
  // 外链、锚点、mailto 之类不处理
  if (/^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(path) || path.startsWith('#') || path.startsWith('mailto:')) {
    return path;
  }

  const clean = path.replace(/^\/+/, '');
  return clean ? `${normalized}${clean}` : normalized;
}

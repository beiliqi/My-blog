/**
 * 站点级配置：改这里就够了。
 * 部署域名不在这里配 —— 它是构建期环境变量 SITE_URL（见 README）。
 */
export const SITE = {
  title: 'Inkwell',
  /** 显示在页脚与文章署名 */
  author: 'Inkwell',
  tagline: '代码、系统与写作的笔记本',
  description: '一个记录编程、系统设计与阅读的技术博客。',
  lang: 'zh-CN',
  /** 每页文章数（首页分页预留） */
  pageSize: 20,
  nav: [
    { label: '文章', href: '/' },
    { label: '归档', href: '/archive' },
    { label: '标签', href: '/tags' },
    { label: '关于', href: '/about' },
  ],
  /** 留空则不渲染对应图标 */
  links: {
    github: 'https://github.com/beiliqi',
    email: '',
  },
} as const;

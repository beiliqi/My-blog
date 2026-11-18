import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import {
  transformerMetaHighlight,
  transformerMetaWordHighlight,
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from '@shikijs/transformers';
import { codeFrame } from './src/lib/code/frame.ts';

// 上线时用环境变量注入真实域名，例如：
//   SITE_URL=https://blog.your-domain.com npm run build
const site = process.env.SITE_URL ?? 'https://blog.example.com';

// 部署在子路径时用 BASE_PATH，例如 GitHub Pages 项目站：
//   SITE_URL=https://user.github.io BASE_PATH=/blog npm run build
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  image: {
    // Markdown 里的图片也走响应式：生成 srcset，按容器宽度取合适尺寸
    layout: 'constrained',
    responsiveStyles: true,
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !/\/(lab|search|edit|404)\/?$/.test(page),
    }),
  ],
  markdown: {
    shikiConfig: {
      // 双主题：明/暗各一套，靠 CSS 变量切换，构建期完成着色
      themes: { light: 'catppuccin-latte', dark: 'catppuccin-mocha' },
      defaultColor: false,
      wrap: false,
      transformers: [
        // 注释式标记：// [!code ++] / [!code --] / [!code focus] / [!code highlight]
        //             / [!code error] / [!code warning] / [!code word:xxx]
        transformerNotationDiff(),
        transformerNotationHighlight(),
        transformerNotationFocus(),
        transformerNotationWordHighlight(),
        transformerNotationErrorLevel(),
        // meta 式标记：{1,3-5} 高亮行、/关键词/ 高亮词
        transformerMetaHighlight(),
        transformerMetaWordHighlight(),
        // 最后再包一层，确保上面的 class 都已落到行上
        codeFrame(),
      ],
    },
  },
});

import type { ShikiTransformer } from 'shiki';

/**
 * 把 Shiki 输出的 <pre> 包装成带标题栏、行号、复制/换行/折叠按钮的代码卡片。
 *
 * 用法（写在代码围栏的 meta 里）：
 *   ```python title="spider.py" showLineNumbers {3,8-10} collapse
 *   ```python noLineNumbers start=10
 *
 * 设计取舍：
 * - 行号用 CSS counter 渲染，不进入 textContent —— 复制出来的代码天然干净。
 * - 复制/换行/折叠是渐进增强，禁用 JS 时高亮和代码依然完整可读。
 */

type HastNode =
  | { type: 'element'; tagName: string; properties: Record<string, unknown>; children: HastNode[] }
  | { type: 'text'; value: string };

const AUTO_NUMBER_THRESHOLD = 8;

interface CodeMeta {
  title?: string;
  numbers: 'on' | 'off' | 'auto';
  collapse: boolean;
  copy: boolean;
  wrap: boolean;
  start: number;
}

function element(tagName: string, properties: Record<string, unknown> = {}, children: HastNode[] = []): HastNode {
  return { type: 'element', tagName, properties, children };
}

function text(value: string): HastNode {
  return { type: 'text', value };
}

function classList(node: { properties?: Record<string, unknown> }): string[] {
  const value = node.properties?.className ?? node.properties?.class;
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
  if (typeof value === 'string') return value.split(/\s+/).filter(Boolean);
  return [];
}

function parseMeta(raw: string): CodeMeta {
  const titleMatch = raw.match(/\btitle\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s]+))/);
  const startMatch = raw.match(/\bstart\s*=\s*(\d+)/);

  let numbers: CodeMeta['numbers'] = 'auto';
  if (/\bshow-?line-?numbers\b/i.test(raw)) numbers = 'on';
  if (/\bno-?line-?numbers\b/i.test(raw)) numbers = 'off';

  return {
    title: titleMatch ? (titleMatch[1] ?? titleMatch[2] ?? titleMatch[3]) : undefined,
    numbers,
    collapse: /\bcollapse\b/.test(raw),
    copy: !/\bno-?copy\b/i.test(raw),
    wrap: /\bwrap\b/.test(raw),
    start: startMatch ? Math.max(1, Number.parseInt(startMatch[1]!, 10)) : 1,
  };
}

function actionButton(action: string, label: string, hint: string): HastNode {
  return element(
    'button',
    {
      type: 'button',
      className: ['code-action'],
      dataCodeAction: action,
      title: hint,
      ariaLabel: hint,
    },
    [text(label)],
  );
}

export interface CodeFrameOptions {
  /** 少于该行数不自动加行号，避免短片段太吵 */
  numberThreshold?: number;
}

export function codeFrame(options: CodeFrameOptions = {}): ShikiTransformer {
  const threshold = options.numberThreshold ?? AUTO_NUMBER_THRESHOLD;

  return {
    name: 'blog:code-frame',
    pre(node) {
      const meta = parseMeta(String(this.options.meta?.__raw ?? ''));
      const properties = (node.properties ?? {}) as Record<string, unknown>;
      const lang = String(properties.dataLanguage ?? properties['data-language'] ?? 'text');

      // Shiki 给 pre 写了内联 overflow 样式，交给 CSS 统一控制
      delete properties.style;

      const codeIndex = node.children.findIndex(
        (child) => child.type === 'element' && child.tagName === 'code',
      );
      const codeNode = codeIndex >= 0 ? node.children[codeIndex] : undefined;
      const lines =
        codeNode && codeNode.type === 'element'
          ? codeNode.children.filter(
              (child) => child.type === 'element' && child.tagName === 'span' && classList(child).includes('line'),
            )
          : [];
      const lineCount = lines.length;
      // diff 块用左侧槽位放 +/- 标记，行号会让位
      const hasDiff = classList(node).includes('has-diff');

      const showNumbers =
        !hasDiff && (meta.numbers === 'on' || (meta.numbers === 'auto' && lineCount >= threshold));
      const collapsible = meta.collapse && lineCount > 12;

      const head: HastNode[] = [
        element('span', { className: ['code-lang'] }, [text(lang)]),
      ];
      if (meta.title) {
        head.push(element('span', { className: ['code-title'] }, [text(meta.title)]));
      }

      const actions: HastNode[] = [];
      if (collapsible) actions.push(actionButton('collapse', '展开', '展开或收起代码'));
      actions.push(actionButton('wrap', '换行', '切换自动换行'));
      if (meta.copy) actions.push(actionButton('copy', '复制', '复制代码'));
      head.push(element('span', { className: ['code-actions'] }, actions));

      const figure: HastNode = element(
        'figure',
        {
          className: ['code-frame'],
          dataLang: lang,
          dataNumbers: showNumbers ? 'true' : undefined,
          dataCollapsed: collapsible ? 'true' : undefined,
          dataWrap: meta.wrap ? 'true' : undefined,
          // counter-reset 会先把计数器设成这个值，随后每行 +1，
          // 所以这里要存 start - 1，第一行才显示 start
          style: `--line-start:${Math.max(0, meta.start - 1)}`,
        },
        [
          element('figcaption', { className: ['code-head'] }, head),
          element('div', { className: ['code-body'] }, [node as HastNode]),
        ],
      );

      return figure as never;
    },
  };
}

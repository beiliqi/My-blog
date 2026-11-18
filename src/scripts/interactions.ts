/**
 * 站点交互：主题切换、代码块操作、图片放大、目录高亮。
 * 全部是渐进增强：脚本失效时正文与代码依然完整可读。
 */

const THEME_KEY = 'inkwell-theme';

/* ---------- 主题 ---------- */

function setupThemeToggle(): void {
  const root = document.documentElement;
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]');
  if (buttons.length === 0) return;

  const sync = () => {
    const dark = root.dataset.theme === 'dark';
    for (const button of buttons) {
      const label = dark ? '切换到浅色模式' : '切换到深色模式';
      button.setAttribute('aria-label', label);
      button.title = label;
    }
  };

  sync();

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* 忽略无痕模式下的写入失败 */
      }
      sync();
    });
  }
}

/* ---------- 代码块 ---------- */

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* 继续尝试降级方案 */
  }

  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '0';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

function codeText(frame: HTMLElement): string {
  const pre = frame.querySelector('pre');
  if (!pre) return '';
  const lines = Array.from(pre.querySelectorAll('.line'));
  // 行号由 CSS counter 生成，不在 DOM 里，所以这里拿到的就是纯代码
  if (lines.length > 0) {
    return lines.map((line) => line.textContent ?? '').join('\n');
  }
  return pre.textContent ?? '';
}

function setupCodeActions(): void {
  document.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const button = target.closest<HTMLButtonElement>('[data-code-action]');
    if (!button) return;

    const frame = button.closest<HTMLElement>('.code-frame');
    if (!frame) return;

    switch (button.dataset.codeAction) {
      case 'copy': {
        const ok = await copyText(codeText(frame));
        if (!ok) return;
        const original = button.textContent;
        button.textContent = '已复制';
        button.dataset.state = 'done';
        window.setTimeout(() => {
          button.textContent = original ?? '复制';
          delete button.dataset.state;
        }, 1600);
        break;
      }

      case 'wrap': {
        const next = frame.dataset.wrap === 'true' ? 'false' : 'true';
        frame.dataset.wrap = next;
        if (next === 'true') {
          button.dataset.state = 'active';
          button.title = '关闭自动换行';
        } else {
          delete button.dataset.state;
          button.title = '开启自动换行';
        }
        break;
      }

      case 'collapse': {
        const next = frame.dataset.collapsed === 'true' ? 'false' : 'true';
        frame.dataset.collapsed = next;
        button.textContent = next === 'true' ? '展开' : '收起';
        button.title = next === 'true' ? '展开代码' : '收起代码';
        break;
      }

      default:
        break;
    }
  });
}

/* ---------- 图片放大 ---------- */

function setupLightbox(): void {
  const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox]');
  if (!dialog) return;

  const image = dialog.querySelector('img');
  const closeButton = dialog.querySelector<HTMLButtonElement>('[data-lightbox-close]');
  if (!image) return;

  const close = () => {
    if (dialog.open) dialog.close();
  };

  document.querySelectorAll<HTMLImageElement>('.prose img').forEach((source) => {
    source.classList.add('zoomable');
    source.addEventListener('click', () => {
      image.src = source.currentSrc || source.src;
      image.alt = source.alt;
      dialog.showModal();
    });
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) close();
  });
  closeButton?.addEventListener('click', close);
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
}

/* ---------- 目录高亮 ---------- */

function setupTocHighlight(): void {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.toc a[href^="#"]'));
  if (links.length === 0) return;

  const anchors = new Map<Element, HTMLAnchorElement[]>();
  for (const link of links) {
    const id = decodeURIComponent(link.hash.slice(1));
    if (!id) continue;
    const heading = document.getElementById(id);
    if (!heading) continue;
    const bucket = anchors.get(heading) ?? [];
    bucket.push(link);
    anchors.set(heading, bucket);
  }
  if (anchors.size === 0) return;

  const activate = (heading: Element) => {
    for (const link of links) link.classList.remove('is-active');
    for (const link of anchors.get(heading) ?? []) link.classList.add('is-active');
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      const first = visible[0];
      if (first) activate(first.target);
    },
    { rootMargin: '-72px 0px -68% 0px', threshold: 0 },
  );

  for (const heading of anchors.keys()) observer.observe(heading);
}

/* ---------- 启动 ---------- */

function boot(): void {
  setupThemeToggle();
  setupCodeActions();
  setupLightbox();
  setupTocHighlight();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

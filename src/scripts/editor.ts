/**
 * 站内编辑器：用 GitHub Contents API 直接读写仓库里的 Markdown。
 *
 * 页面是纯静态的，没有后端；Token 只存在这台机器的 localStorage 里，
 * 建议用 fine-grained PAT，只给这一个仓库的 Contents 读写权限。
 */

interface EditorConfig {
  owner: string;
  repo: string;
  branch: string;
  path: string;
}

interface DirEntry {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: string;
}

interface FilePayload {
  content: string;
  sha: string;
}

const TOKEN_KEY = 'inkwell:github-token';

const el = <T extends HTMLElement>(selector: string): T => {
  const node = document.querySelector<T>(selector);
  if (!node) throw new Error(`缺少元素 ${selector}`);
  return node;
};

/* ---------- base64（浏览器 btoa 只吃 latin1，中文要转字节） ---------- */

function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function decodeBase64(value: string): string {
  const binary = atob(value.replace(/\s/g, ''));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/* ---------- 主流程 ---------- */

export function setupEditor(): void {
  const root = document.querySelector<HTMLElement>('[data-editor]');
  if (!root) return;

  const config: EditorConfig = {
    owner: root.dataset.owner ?? '',
    repo: root.dataset.repo ?? '',
    branch: root.dataset.branch ?? 'main',
    path: root.dataset.path ?? 'src/content/posts',
  };

  const gate = el<HTMLElement>('[data-gate]');
  const body = el<HTMLElement>('[data-body]');
  const tokenInput = el<HTMLInputElement>('[data-token]');
  const tokenSave = el<HTMLButtonElement>('[data-token-save]');
  const tokenClear = el<HTMLButtonElement>('[data-token-clear]');
  const gateStatus = el<HTMLElement>('[data-gate-status]');

  const fileList = el<HTMLUListElement>('[data-files]');
  const filter = el<HTMLInputElement>('[data-filter]');
  const newButton = el<HTMLButtonElement>('[data-new]');
  const importButton = el<HTMLButtonElement>('[data-import]');
  const importInput = el<HTMLInputElement>('[data-import-file]');
  const saveButton = el<HTMLButtonElement>('[data-save]');
  const currentLabel = el<HTMLElement>('[data-current]');
  const status = el<HTMLElement>('[data-status]');
  const textarea = el<HTMLTextAreaElement>('[data-text]');
  const meta = el<HTMLElement>('[data-meta]');
  const pane = el<HTMLElement>('.editor__pane');
  const previewToggle = el<HTMLButtonElement>('[data-preview-toggle]');
  const previewBox = el<HTMLElement>('[data-preview]');
  const previewFrame = el<HTMLIFrameElement>('[data-preview-frame]');

  let token = '';
  let files: DirEntry[] = [];
  // 从文章页「编辑此页」过来时，自动打开对应文件
  let pendingFile: string | null = new URLSearchParams(location.search).get('file');
  let current: DirEntry | null = null;
  let loadedText = '';
  let sha = '';
  let previewOn = false;
  let previewTimer = 0;
  let cachedCss = '';

  const setStatus = (value: string, kind: '' | 'ok' | 'warn' | 'error' = '') => {
    status.textContent = value;
    status.dataset.state = kind;
  };

  const dirty = () => current !== null && textarea.value !== loadedText;

  /* ---- 预览 ---- */

  function collectCss(): string {
    if (cachedCss) return cachedCss;
    let css = '';
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        for (const rule of Array.from(sheet.cssRules)) css += `${rule.cssText}\n`;
      } catch {
        /* 跨域样式表读不到，跳过 */
      }
    }
    cachedCss = css;
    return css;
  }

  function stripFrontmatter(text: string): string {
    const match = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
    return match ? text.slice(match[0].length) : text;
  }

  async function renderPreview(): Promise<void> {
    if (!previewOn || !current) return;
    const { marked } = await import('marked');
    const theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    const html = marked.parse(stripFrontmatter(textarea.value), { async: false, gfm: true }) as string;

    // 文章里的 ./assets/xx.png 在构建时才存在，预览里从仓库原图地址加载
    const rawBase = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${config.path}/assets/`;
    const withImages = html.replace(/src="\.\/assets\//g, `src="${rawBase}`);

    const doc = [
      '<!doctype html><html lang="zh-CN" data-theme="' + theme + '"><head><meta charset="utf-8">',
      '<style>' + collectCss() + '</style>',
      '<style>html,body{margin:0;padding:0;background:var(--bg);}',
      'body.preview{padding:1.25rem 1.5rem 3rem;}',
      '.prose{max-width:none;}',
      // 真实站点里代码块都由 Shiki 包成 .code-frame，预览里只有裸 pre，补一套样式
      '.prose pre{background:var(--code-bg);border:1px solid var(--line);border-radius:10px;',
      'padding:.8rem 1rem;overflow-x:auto;margin-block:1.2em;font-family:var(--font-mono);',
      'font-size:.84rem;line-height:1.65;tab-size:4;}',
      '.prose pre code{background:none;border:0;padding:0;font-size:inherit;white-space:pre;}',
      '.prose img{border:1px solid var(--line);border-radius:10px;}',
      '</style></head>',
      '<body class="preview"><div class="prose">' + withImages + '</div></body></html>',
    ].join('');

    previewFrame.srcdoc = doc;
  }

  function schedulePreview(): void {
    if (!previewOn) return;
    window.clearTimeout(previewTimer);
    previewTimer = window.setTimeout(() => void renderPreview(), 180);
  }

  previewToggle.addEventListener('click', () => {
    previewOn = !previewOn;
    previewToggle.setAttribute('aria-pressed', String(previewOn));
    pane.dataset.preview = String(previewOn);
    previewBox.hidden = !previewOn;
    if (previewOn) void renderPreview();
  });

  // 切主题时重建预览，颜色跟着变
  new MutationObserver(() => {
    if (previewOn) void renderPreview();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  /* ---- API ---- */

  async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`https://api.github.com${path}`, {
      ...init,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(init.headers ?? {}),
      },
    });

    if (!response.ok) {
      const text = await response.text();
      let message = `${response.status}`;
      try {
        message = (JSON.parse(text) as { message?: string }).message ?? message;
      } catch {
        message = text.slice(0, 120) || message;
      }
      if (response.status === 401) message = 'Token 无效或已过期';
      if (response.status === 404) message = '仓库或文件不存在（检查 Token 权限）';
      throw new Error(message);
    }

    return (await response.json()) as T;
  }

  const contents = (path: string) => `/repos/${config.owner}/${config.repo}/contents/${path}`;

  /* ---- 列表 ---- */

  async function loadFiles(): Promise<void> {
    setStatus('读取文件列表…');
    const entries = await api<DirEntry[]>(`${contents(config.path)}?ref=${config.branch}`);
    files = entries
      .filter((entry) => entry.type === 'file' && /\.(md|mdx)$/i.test(entry.name))
      .sort((a, b) => a.name.localeCompare(b.name));
    renderFiles();
    setStatus(`共 ${files.length} 篇`);

    if (pendingFile) {
      const wanted = pendingFile.replace(/\.(md|mdx)$/i, '');
      pendingFile = null;
      const target = files.find((file) => file.name.replace(/\.(md|mdx)$/i, '') === wanted);
      if (target) await openFile(target);
    }
  }

  function renderFiles(): void {
    const keyword = filter.value.trim().toLowerCase();
    fileList.replaceChildren();

    const visible = files.filter((file) => file.name.toLowerCase().includes(keyword));
    if (visible.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'editor__empty';
      empty.textContent = '没有匹配的文件';
      fileList.append(empty);
      return;
    }

    for (const file of visible) {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = file.name.replace(/\.(md|mdx)$/i, '');
      button.className = file.path === current?.path ? 'is-active' : '';
      button.addEventListener('click', () => {
        if (dirty() && !window.confirm('当前修改还没保存，确定切换？')) return;
        void openFile(file);
      });
      item.append(button);
      fileList.append(item);
    }
  }

  /* ---- 打开 / 保存 ---- */

  async function openFile(file: DirEntry): Promise<void> {
    setStatus('读取中…');
    try {
      const payload = await api<FilePayload>(`${contents(file.path)}?ref=${config.branch}`);
      current = file;
      sha = payload.sha;
      loadedText = decodeBase64(payload.content);
      textarea.value = loadedText;
      textarea.disabled = false;
      saveButton.disabled = false;
      currentLabel.textContent = file.path.replace(`${config.path}/`, '');
      meta.textContent = `${loadedText.length} 字符 · ${(file.size / 1024).toFixed(1)} KB`;
      setStatus('已载入');
      renderFiles();
      schedulePreview();
    } catch (error) {
      setStatus(`打开失败：${(error as Error).message}`, 'error');
    }
  }

  async function saveFile(): Promise<void> {
    if (!current) return;
    saveButton.disabled = true;
    setStatus('保存中…');

    try {
      // 先取最新 sha，避免覆盖别人刚做的修改
      const latest = await api<FilePayload>(`${contents(current.path)}?ref=${config.branch}`);
      const response = await api<{ commit: { sha: string } }>(contents(current.path), {
        method: 'PUT',
        body: JSON.stringify({
          message: `edit: ${current.name.replace(/\.(md|mdx)$/i, '')}`,
          content: encodeBase64(textarea.value),
          sha: latest.sha,
          branch: config.branch,
        }),
      });

      sha = response.commit.sha;
      loadedText = textarea.value;
      meta.textContent = `${loadedText.length} 字符`;
      setStatus('已提交，约 1 分钟后生效', 'ok');
    } catch (error) {
      setStatus(`保存失败：${(error as Error).message}`, 'error');
    } finally {
      saveButton.disabled = false;
    }
  }

  /* ---- 新建 ---- */

  const TEMPLATE = (title: string, slug: string) => `---
title: "${title}"
description: ""
date: ${new Date().toISOString().slice(0, 10)}
tags: []
draft: true
---

## 小节标题

正文从这个开始写。

\`\`\`python
print("hello")
\`\`\`
`;

  async function createFile(): Promise<void> {
    const raw = window.prompt('文件名（英文、小写、用连字符，不要 .md）：', 'new-post');
    if (!raw) return;
    const slug = raw.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
    if (!slug) {
      setStatus('文件名不合法', 'error');
      return;
    }

    const path = `${config.path}/${slug}.md`;
    if (files.some((file) => file.path === path)) {
      setStatus('同名文件已存在', 'error');
      return;
    }

    setStatus('创建中…');
    try {
      await api(contents(path), {
        method: 'PUT',
        body: JSON.stringify({
          message: `post: 新建 ${slug}`,
          content: encodeBase64(TEMPLATE(slug, slug)),
          branch: config.branch,
        }),
      });
      await loadFiles();
      const created = files.find((file) => file.path === path);
      if (created) await openFile(created);
      setStatus('已创建（草稿状态）', 'ok');
    } catch (error) {
      setStatus(`创建失败：${(error as Error).message}`, 'error');
    }
  }

  /* ---- 导入文件 ---- */

  const today = () => new Date().toISOString().slice(0, 10);

  const yamlString = (value: string) => `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

  function titleFrom(text: string, fallback: string): string {
    const heading = text.match(/^#\s+(.+)$/m);
    return (heading?.[1] ?? fallback).trim();
  }

  async function importFiles(list: File[]): Promise<void> {
    const accepted = list.filter((file) => /\.(md|mdx|markdown|txt)$/i.test(file.name));
    if (accepted.length === 0) {
      setStatus('只支持 .md / .mdx / .txt', 'error');
      return;
    }

    const imported: DirEntry[] = [];

    for (const file of accepted) {
      let text = (await file.text()).replace(/^\uFEFF/, '');

      const base = file.name.replace(/\.(md|mdx|markdown|txt)$/i, '');
      let slug = base
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      if (!slug) {
        const answer = window.prompt(
          `「${file.name}」需要英文文件名，给个 slug（小写、连字符）：`,
          `import-${today()}`,
        );
        if (answer === null) continue;
        slug = answer.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
      }
      if (!slug) {
        setStatus(`跳过 ${file.name}：文件名不合法`, 'error');
        continue;
      }

      if (file.name.toLowerCase().endsWith('.txt')) {
        text = `# ${base}\n\n${text}`;
      }

      if (!/^---\r?\n/.test(text)) {
        text =
          [
            '---',
            `title: ${yamlString(titleFrom(text, base))}`,
            'description: ""',
            `date: ${today()}`,
            'tags: []',
            'draft: true',
            '---',
            '',
            '',
          ].join('\n') + text;
      }

      setStatus(`导入 ${file.name}…`);
      try {
        await api(contents(`${config.path}/${slug}.md`), {
          method: 'PUT',
          body: JSON.stringify({
            message: `post: 导入 ${slug}`,
            content: encodeBase64(text),
            branch: config.branch,
          }),
        });
        imported.push({ name: `${slug}.md`, path: `${config.path}/${slug}.md`, sha: '', size: text.length, type: 'file' });
      } catch (error) {
        setStatus(`导入 ${file.name} 失败：${(error as Error).message}`, 'error');
        return;
      }
    }

    if (imported.length === 0) return;

    await loadFiles();
    const first = files.find((file) => file.path === imported[0]!.path);
    if (first) await openFile(first);
    setStatus(`已导入 ${imported.length} 篇（草稿状态）`, 'ok');
  }

  importButton.addEventListener('click', () => importInput.click());
  importInput.addEventListener('change', async () => {
    if (importInput.files?.length) await importFiles([...importInput.files]);
    importInput.value = '';
  });

  // 拖拽导入
  const paneElement = el<HTMLElement>('.editor__pane');
  for (const eventName of ['dragenter', 'dragover']) {
    paneElement.addEventListener(eventName, (event) => {
      event.preventDefault();
      paneElement.classList.add('is-dragover');
    });
  }
  for (const eventName of ['dragleave', 'drop']) {
    paneElement.addEventListener(eventName, (event) => {
      event.preventDefault();
      paneElement.classList.remove('is-dragover');
    });
  }
  paneElement.addEventListener('drop', (event) => {
    const dropped = (event as DragEvent).dataTransfer?.files;
    if (dropped?.length) void importFiles([...dropped]);
  });

  /* ---- Token ---- */

  async function useToken(candidate: string): Promise<boolean> {
    token = candidate.trim();
    if (!token) return false;

    try {
      const user = await api<{ login: string }>('/user');
      const repo = await api<{ full_name: string }>(`/repos/${config.owner}/${config.repo}`);
      localStorage.setItem(TOKEN_KEY, token);
      gate.hidden = true;
      body.hidden = false;
      setStatus(`已连接 ${user.login} · ${repo.full_name}`, 'ok');
      return true;
    } catch (error) {
      token = '';
      gateStatus.textContent = `连接失败：${(error as Error).message}`;
      gateStatus.dataset.state = 'error';
      return false;
    }
  }

  function showGate(): void {
    gate.hidden = false;
    body.hidden = true;
    tokenInput.value = '';
  }

  /* ---- 初始化 ---- */

  tokenSave.addEventListener('click', async () => {
    tokenSave.disabled = true;
    gateStatus.textContent = '验证中…';
    gateStatus.dataset.state = '';
    const ok = await useToken(tokenInput.value);
    tokenSave.disabled = false;
    if (ok) {
      try {
        await loadFiles();
      } catch (error) {
        setStatus(`读取失败：${(error as Error).message}`, 'error');
      }
    }
  });

  tokenInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') tokenSave.click();
  });

  tokenClear.addEventListener('click', () => {
    localStorage.removeItem(TOKEN_KEY);
    token = '';
    showGate();
  });

  filter.addEventListener('input', renderFiles);
  newButton.addEventListener('click', () => void createFile());
  saveButton.addEventListener('click', () => void saveFile());

  textarea.addEventListener('input', () => {
    if (dirty()) setStatus('有未保存的修改', 'warn');
    schedulePreview();
  });

  window.addEventListener('beforeunload', (event) => {
    if (!dirty()) return;
    event.preventDefault();
    event.returnValue = '';
  });

  const stored = localStorage.getItem(TOKEN_KEY);
  if (stored) {
    void (async () => {
      const ok = await useToken(stored);
      if (ok) {
        try {
          await loadFiles();
        } catch (error) {
          setStatus(`读取失败：${(error as Error).message}`, 'error');
        }
      }
    })();
  } else {
    showGate();
  }
}

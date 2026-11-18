interface SearchItem {
  url: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  headings: string[];
  text: string;
}

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function highlighted(text: string, terms: string[]): string {
  if (terms.length === 0) return escapeHtml(text);
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi');
  // split 带捕获组时，奇数下标就是命中的片段
  return text
    .split(pattern)
    .map((part, index) => (index % 2 === 1 ? `<mark>${escapeHtml(part)}</mark>` : escapeHtml(part)))
    .join('');
}

function score(item: SearchItem, terms: string[]): number {
  const title = item.title.toLowerCase();
  const tags = item.tags.join(' ').toLowerCase();
  const headings = item.headings.join(' ').toLowerCase();
  const description = item.description.toLowerCase();
  const text = item.text.toLowerCase();

  let total = 0;
  for (const term of terms) {
    let hit = false;
    if (title.includes(term)) {
      total += 40;
      hit = true;
    }
    if (tags.includes(term)) {
      total += 24;
      hit = true;
    }
    if (headings.includes(term)) {
      total += 14;
      hit = true;
    }
    if (description.includes(term)) {
      total += 10;
      hit = true;
    }
    if (text.includes(term)) {
      total += 5;
      hit = true;
    }
    // 所有关键词都要出现（AND 语义），否则不算命中
    if (!hit) return 0;
  }
  return total;
}

function excerpt(item: SearchItem, terms: string[]): string {
  const text = item.text;
  const lower = text.toLowerCase();
  let position = -1;
  for (const term of terms) {
    const index = lower.indexOf(term);
    if (index !== -1 && (position === -1 || index < position)) position = index;
  }
  if (position === -1) {
    return highlighted(item.description || text.slice(0, 140), terms);
  }
  const start = Math.max(0, position - 40);
  const end = Math.min(text.length, position + 110);
  const slice =
    (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
  return highlighted(slice, terms);
}

export function setupSearch(): void {
  const input = document.querySelector<HTMLInputElement>('#search-input');
  const results = document.querySelector<HTMLOListElement>('#search-results');
  const hint = document.querySelector<HTMLElement>('#search-hint');
  if (!input || !results || !hint) return;

  let items: SearchItem[] = [];
  let ready = false;

  const setHint = (value: string) => {
    hint.textContent = value;
  };

  const render = () => {
    if (!ready) return;
    const query = input.value.trim().toLowerCase();
    results.innerHTML = '';

    if (!query) {
      setHint(`已索引 ${items.length} 篇文章，输入关键词开始搜索`);
      return;
    }

    const terms = query.split(/\s+/).filter(Boolean);
    const ranked = items
      .map((item) => ({ item, score: score(item, terms) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    if (ranked.length === 0) {
      setHint('没有找到匹配的文章，换个关键词试试');
      return;
    }

    setHint(`找到 ${ranked.length} 篇`);

    for (const { item } of ranked.slice(0, 20)) {
      const li = document.createElement('li');
      li.className = 'search-result';
      const meta = [item.date, ...item.tags.slice(0, 3)].map(escapeHtml).join(' · ');
      li.innerHTML =
        `<h2><a href="${item.url}">${highlighted(item.title, terms)}</a></h2>` +
        `<p>${excerpt(item, terms)}</p>` +
        `<p class="search-result__meta">${meta}</p>`;
      results.append(li);
    }
  };

  const load = async () => {
    try {
      const response = await fetch('/search-index.json');
      if (!response.ok) throw new Error(String(response.status));
      items = (await response.json()) as SearchItem[];
      ready = true;
      const initial = new URLSearchParams(window.location.search).get('q');
      if (initial) input.value = initial;
      render();
    } catch {
      setHint('索引加载失败，请刷新重试');
    }
  };

  let timer = 0;
  input.addEventListener('input', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(render, 120);
  });

  void load();
}

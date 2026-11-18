#!/usr/bin/env python3
"""把语雀导出的 .lakebook 转成博客用的 Markdown。

.lakebook 实际是 tar 包，结构大致是：

    <hash>/$meta.json          # 知识库信息 + 目录
    <hash>/<doc_slug>.json     # 每篇文档：{ doc: { title, body(HTML), ... } }

用法：
    python3 tools/yuque-import.py import/联东.lakebook
    python3 tools/yuque-import.py import/*.lakebook --draft false
    python3 tools/yuque-import.py import/联东.lakebook --dry-run

产物：
    src/content/posts/<slug>.md
    src/content/posts/assets/<slug>/img-01.png ...
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
import tarfile
import tempfile
import urllib.parse
from dataclasses import dataclass, field
from pathlib import Path

from bs4 import BeautifulSoup, Comment, Doctype, NavigableString, Tag

ROOT = Path(__file__).resolve().parent.parent
POSTS_DIR = ROOT / "src" / "content" / "posts"
ASSETS_DIR = POSTS_DIR / "assets"

IMAGE_TIMEOUT = 30
IMAGE_MAX_BYTES = 20 * 1024 * 1024


@dataclass
class Doc:
    title: str
    slug: str
    description: str
    created_at: str
    updated_at: str
    body: str
    source_id: str


@dataclass
class Image:
    url: str
    local: Path
    markdown_path: str


@dataclass
class Stats:
    docs: int = 0
    images: int = 0
    images_failed: list[str] = field(default_factory=list)
    skipped: list[tuple[str, str]] = field(default_factory=list)


# ---------------------------------------------------------------- lakebook ---

def load_docs(archive: Path) -> list[Doc]:
    """解开 .lakebook，读出所有文档。"""
    docs: list[Doc] = []

    with tempfile.TemporaryDirectory() as tmp:
        with tarfile.open(archive) as tar:
            # 防止路径穿越
            for member in tar.getmembers():
                if member.name.startswith("/") or ".." in Path(member.name).parts:
                    raise RuntimeError(f"可疑的归档路径：{member.name}")
            tar.extractall(tmp)

        for path in sorted(Path(tmp).rglob("*.json")):
            if path.name == "$meta.json":
                continue
            try:
                payload = json.loads(path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                print(f"  跳过（不是 JSON）：{path.name}", file=sys.stderr)
                continue

            doc = payload.get("doc") or {}
            if not doc.get("title"):
                continue

            docs.append(
                Doc(
                    title=doc.get("title", "").strip(),
                    slug=doc.get("slug", path.stem),
                    description=(doc.get("description") or "").strip(),
                    created_at=doc.get("created_at") or "",
                    updated_at=doc.get("updated_at") or "",
                    body=doc.get("body") or "",
                    source_id=str(doc.get("id") or path.stem),
                )
            )

    # 保持知识库里的顺序（按创建时间）
    docs.sort(key=lambda d: d.created_at or "")
    return docs


# ------------------------------------------------------------------- slug ---

def slugify(title: str) -> str:
    try:
        from pypinyin import lazy_pinyin
    except ImportError:  # 没装就退回哈希
        return f"yuque-{hashlib.sha1(title.encode()).hexdigest()[:8]}"

    parts = lazy_pinyin(title)
    raw = "-".join(parts).lower()
    raw = re.sub(r"[^a-z0-9]+", "-", raw)
    raw = re.sub(r"-{2,}", "-", raw).strip("-")
    return raw or f"yuque-{hashlib.sha1(title.encode()).hexdigest()[:8]}"


# ------------------------------------------------------------------ images ---

class ImageStore:
    """下载图片到 posts/assets/<slug>/，同一 URL 只下一次。"""

    def __init__(self, slug: str, dry_run: bool) -> None:
        self.slug = slug
        self.dry_run = dry_run
        self.target = ASSETS_DIR / slug
        self.cache: dict[str, Image] = {}
        self.count = 0
        self.failed: list[str] = []

    def fetch(self, url: str) -> Image | None:
        if url in self.cache:
            return self.cache[url]

        # 已经是本地路径的直接放过
        if not url.startswith("http"):
            return None

        self.count += 1
        ext = Path(urllib.parse.urlparse(url).path).suffix.lower()
        if ext not in {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"}:
            ext = ".png"
        name = f"img-{self.count:02d}{ext}"
        local = self.target / name
        rel = f"./assets/{self.slug}/{name}"

        image = Image(url=url, local=local, markdown_path=rel)
        self.cache[url] = image

        if self.dry_run:
            return image

        self.target.mkdir(parents=True, exist_ok=True)
        if not local.exists():
            # 用 curl 下载：macOS 自带 Python 常常没有根证书，urllib 会 SSL 失败
            try:
                result = subprocess.run(
                    [
                        "curl", "-fsSL", "--max-time", str(IMAGE_TIMEOUT),
                        "-A", "Mozilla/5.0", "-o", str(local), url,
                    ],
                    capture_output=True,
                    timeout=IMAGE_TIMEOUT + 5,
                )
                if result.returncode != 0:
                    raise RuntimeError(result.stderr.decode(errors="replace").strip()[:120] or "curl 失败")
                if local.stat().st_size == 0:
                    raise RuntimeError("空文件")
                if local.stat().st_size > IMAGE_MAX_BYTES:
                    raise RuntimeError("图片超过 20MB")
            except Exception as exc:  # noqa: BLE001 - 单张失败不影响整篇
                self.failed.append(f"{url} ({exc})")
                local.unlink(missing_ok=True)
                self.cache.pop(url, None)
                return None

        return image


# ---------------------------------------------------------------- markdown ---

class Converter:
    def __init__(self, images: ImageStore) -> None:
        self.images = images

    # -- inline --
    def inline(self, node) -> str:
        if isinstance(node, (Comment, Doctype)):
            return ""
        if isinstance(node, NavigableString):
            return self.escape(str(node))

        if not isinstance(node, Tag):
            return ""

        name = node.name.lower()

        if name == "br":
            return "<br>"
        if name in {"strong", "b"}:
            inner = self.inline_children(node).strip()
            return f"**{inner}**" if inner else ""
        if name in {"em", "i"}:
            inner = self.inline_children(node).strip()
            return f"*{inner}*" if inner else ""
        if name == "u":
            inner = self.inline_children(node).strip()
            return f"__{inner}__" if inner else ""
        if name in {"del", "s", "strike"}:
            inner = self.inline_children(node).strip()
            return f"~~{inner}~~" if inner else ""
        if name == "code":
            text = node.get_text()
            return f"`{text}`" if text else ""
        if name == "a":
            text = self.inline_children(node).strip() or node.get("href", "")
            href = node.get("href", "")
            return f"[{text}]({href})" if href else text
        if name == "img":
            return self.image(node)
        if name in {"span", "font", "sub", "sup", "mark"}:
            return self.inline_children(node)

        return self.inline_children(node)

    def inline_children(self, node: Tag) -> str:
        return "".join(self.inline(child) for child in node.children)

    def image(self, node: Tag) -> str:
        src = node.get("src") or ""
        if not src:
            return ""
        alt = (node.get("alt") or node.get("title") or "").strip()
        image = self.images.fetch(src)
        if image is None:
            return f"![{alt}]({src})" if src.startswith("http") else ""
        return f"![{alt}]({image.markdown_path})"

    @staticmethod
    def escape(text: str) -> str:
        # 只处理会破坏 Markdown 的字符，中文标点保持原样
        text = text.replace("&nbsp;", " ")
        text = re.sub(r"[ \t\u00a0]+", " ", text)
        return text

    @staticmethod
    def escape_cell(text: str) -> str:
        text = text.replace("|", "\\|").replace("\n", "<br>").strip()
        return "" if text == "<br>" else text

    # -- blocks --
    def blocks(self, node: Tag) -> str:
        chunks: list[str] = []

        for child in node.children:
            if isinstance(child, (Comment, Doctype)):
                continue
            if isinstance(child, NavigableString):
                text = self.escape(str(child)).strip()
                if text:
                    chunks.append(text)
                continue

            if not isinstance(child, Tag):
                continue

            name = child.name.lower()

            if re.fullmatch(r"h[1-6]", name):
                level = int(name[1])
                text = self.inline_children(child).strip().replace("<br>", " ")
                text = re.sub(r"\s+", " ", text)
                if text:
                    chunks.append(f"{'#' * level} {self.strip_bold(text)}")

            elif name == "p":
                text = self.inline_children(child).strip()
                # 语雀常在段落末尾塞 <br>，转成 markdown 后是多余的空行标记
                text = re.sub(r"^(?:<br>\s*)+|(?:\s*<br>)+$", "", text).strip()
                if text:
                    chunks.append(text)

            elif name in {"ul", "ol"}:
                chunks.append(self.list_block(child))

            elif name == "blockquote":
                inner = self.blocks(child).strip()
                if inner:
                    quoted = "\n".join(f"> {line}" if line else ">" for line in inner.splitlines())
                    chunks.append(quoted)

            elif name == "table":
                chunks.append(self.table(child))

            elif name == "hr":
                chunks.append("---")

            elif name == "pre":
                chunks.append(self.code_block(child))

            elif name == "div" and "ne-codeblock" in (child.get("class") or []):
                chunks.append(self.code_block(child))

            elif name in {"div", "section", "article", "figure", "figcaption"}:
                inner = self.blocks(child).strip()
                if inner:
                    chunks.append(inner)

            else:
                inner = self.inline_children(child).strip()
                if inner:
                    chunks.append(inner)

        return "\n\n".join(chunks)

    @staticmethod
    def strip_bold(text: str) -> str:
        # 标题里不需要再加粗
        return text.replace("**", "")

    def list_block(self, node: Tag, depth: int = 0) -> str:
        ordered = node.name.lower() == "ol"
        lines: list[str] = []

        index = 0
        for item in node.find_all("li", recursive=False):
            index += 1
            marker = f"{index}." if ordered else "-"
            inner_parts: list[str] = []

            for child in item.children:
                if isinstance(child, Tag) and child.name.lower() in {"ul", "ol"}:
                    nested = self.list_block(child, depth + 1)
                    inner_parts.append("\n" + nested)
                elif isinstance(child, Tag) and child.name.lower() == "p":
                    inner_parts.append(self.inline_children(child).strip())
                elif isinstance(child, NavigableString):
                    text = self.escape(str(child)).strip()
                    if text:
                        inner_parts.append(text)
                elif isinstance(child, Tag):
                    inner_parts.append(self.inline(child).strip())

            content = " ".join(part for part in inner_parts if part and not part.startswith("\n"))
            nested = "".join(part for part in inner_parts if part.startswith("\n"))
            lines.append(f"{'  ' * depth}{marker} {content}{nested}")

        return "\n".join(lines)

    def code_block(self, node: Tag) -> str:
        language = (
            node.get("data-language")
            or node.get("lang")
            or self._language_from_class(node)
            or "text"
        )
        pre = node if node.name.lower() == "pre" else node.find("pre")
        text = (pre or node).get_text()
        text = text.rstrip("\n")
        return f"```{language}\n{text}\n```"

    @staticmethod
    def _language_from_class(node: Tag) -> str:
        for candidate in [node, *node.parents]:
            if not isinstance(candidate, Tag):
                continue
            for cls in candidate.get("class") or []:
                match = re.fullmatch(r"(?:language|lang)-(\w+)", cls)
                if match:
                    return match.group(1)
        return ""

    def table(self, node: Tag) -> str:
        rows = node.find_all("tr")
        if not rows:
            return ""

        matrix: list[list[str]] = []
        for row in rows:
            cells = row.find_all(["td", "th"], recursive=False)
            if not cells:
                continue
            matrix.append([self.escape_cell(self.inline_children(cell)) for cell in cells])

        if not matrix:
            return ""

        width = max(len(row) for row in matrix)
        matrix = [row + [""] * (width - len(row)) for row in matrix]

        # 语雀表格常常全是 <td>，没有 <th>；把首行当表头渲染（内容不丢，只是样式不同）
        header, body = matrix[0], matrix[1:]

        lines = [
            "| " + " | ".join(header) + " |",
            "| " + " | ".join(["---"] * width) + " |",
        ]
        for row in body:
            lines.append("| " + " | ".join(row) + " |")

        return "\n".join(lines)

    def document(self, html: str) -> str:
        soup = BeautifulSoup(html, "html.parser")
        for junk in soup.find_all(["script", "style"]):
            junk.decompose()
        root = soup.body or soup
        return re.sub(r"\n{3,}", "\n\n", self.blocks(root)).strip()


# ------------------------------------------------------------------ output ---

def yaml_string(value: str) -> str:
    escaped = value.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{escaped}"'


def short_description(text: str, limit: int = 120) -> str:
    text = re.sub(r"\s+", " ", text or "").strip()
    if len(text) <= limit:
        return text
    return text[:limit].rstrip() + "…"


def derive_description(doc: Doc, markdown: str) -> str:
    """语雀的 description 常常是正文首段拼接出来的，质量很差。
    优先用正文里第一个像样的段落，实在没有就退回 doc.description。"""
    source = (doc.description or "").strip()
    if source and len(source) <= 80 and "http" not in source:
        return source

    for line in markdown.splitlines():
        text = line.strip()
        if not text or text.startswith(("|", "#", "!", "-", "*", ">", "`", "---")):
            continue
        text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", text)
        text = re.sub(r"[*_`]", "", text).strip()
        if len(text) >= 12:
            return short_description(text, 100)

    return ""


def write_post(doc: Doc, markdown: str, draft: bool) -> Path:
    slug = slugify(doc.title)
    date = (doc.created_at or doc.updated_at or "")[:10]
    frontmatter = [
        "---",
        f"title: {yaml_string(doc.title)}",
        # 语雀的 description 是自动截取的正文片段，往往是拼接的噪声；
        # 导入后自己写一句更清楚
        f"description: {yaml_string('')}",
        f"date: {date}",
    ]
    if doc.updated_at[:10] and doc.updated_at[:10] != date:
        frontmatter.append(f"updated: {doc.updated_at[:10]}")
    frontmatter += ["tags: []", f"draft: {'true' if draft else 'false'}", "---", ""]

    path = POSTS_DIR / f"{slug}.md"
    path.write_text("\n".join(frontmatter) + markdown + "\n", encoding="utf-8")
    return path


def main() -> int:
    parser = argparse.ArgumentParser(description="语雀 .lakebook → Markdown")
    parser.add_argument("archives", nargs="+", help=".lakebook 文件或目录")
    parser.add_argument("--draft", default="true", choices=["true", "false"], help="是否写成草稿")
    parser.add_argument("--dry-run", action="store_true", help="只转换，不写文件、不下载图片")
    args = parser.parse_args()

    archives: list[Path] = []
    for raw in args.archives:
        path = Path(raw)
        if path.is_dir():
            archives.extend(sorted(path.glob("*.lakebook")))
        else:
            archives.append(path)

    if not archives:
        print("没有找到 .lakebook 文件", file=sys.stderr)
        return 1

    stats = Stats()
    draft = args.draft == "true"

    for archive in archives:
        print(f"\n▶ {archive.name}")
        docs = load_docs(archive)
        print(f"  文档 {len(docs)} 篇")

        for doc in docs:
            if not doc.body.strip():
                stats.skipped.append((doc.title, "正文为空（可能是加密文档）"))
                print(f"  - 跳过《{doc.title}》：正文为空")
                continue

            store = ImageStore(slugify(doc.title), args.dry_run)
            converter = Converter(store)
            markdown = converter.document(doc.body)

            if not markdown.strip():
                stats.skipped.append((doc.title, "转换后为空"))
                print(f"  - 跳过《{doc.title}》：转换后为空")
                continue

            if len(markdown) > 60_000:
                print(f"  ! 《{doc.title}》正文 {len(markdown) // 1024} KB，页面会很重，发布前建议拆分")

            if args.dry_run:
                print(f"  - 《{doc.title}》→ {slugify(doc.title)}.md（{len(markdown)} 字符，图片 {store.count} 张）")
            else:
                path = write_post(doc, markdown, draft)
                print(f"  - 《{doc.title}》→ {path.relative_to(ROOT)}（{len(markdown)} 字符，图片 {store.count} 张）")

            stats.docs += 1
            stats.images += store.count
            stats.images_failed.extend(store.failed)

    print(f"\n完成：{stats.docs} 篇，图片 {stats.images} 张")
    if stats.images_failed:
        print(f"图片下载失败 {len(stats.images_failed)} 张：")
        for item in stats.images_failed[:10]:
            print(f"  - {item}")
    if stats.skipped:
        print(f"跳过 {len(stats.skipped)} 篇：")
        for title, reason in stats.skipped:
            print(f"  - 《{title}》{reason}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

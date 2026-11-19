#!/usr/bin/env python3
"""生成演示用插图与站点图标（一次性脚本，产物已提交到仓库）。

用法：python3 tools/make-images.py
"""

from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
POST_ASSETS = ROOT / "src" / "content" / "posts" / "assets"
PUBLIC = ROOT / "public"

BG = (251, 248, 241)
INK = (27, 27, 25)
MUTED = (128, 128, 118)
LINE = (226, 224, 214)
ACCENT = (156, 59, 46)
ACCENT_SOFT = (245, 232, 227)

ARIAL = "/System/Library/Fonts/Supplemental/Arial.ttf"
ARIAL_UNICODE = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"
MONO = "/System/Library/Fonts/Menlo.ttc"
GEORGIA = "/System/Library/Fonts/Supplemental/Georgia.ttf"


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def rounded_box(draw: ImageDraw.ImageDraw, box, radius, fill, outline, width=2):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def arrow(draw: ImageDraw.ImageDraw, start, end, color, width=4, head=16):
    draw.line([start, end], fill=color, width=width)
    angle = math.atan2(end[1] - start[1], end[0] - start[0])
    left = (
        end[0] - head * math.cos(angle - math.pi / 7),
        end[1] - head * math.sin(angle - math.pi / 7),
    )
    right = (
        end[0] - head * math.cos(angle + math.pi / 7),
        end[1] - head * math.sin(angle + math.pi / 7),
    )
    draw.polygon([end, left, right], fill=color)


def draw_mark(draw: ImageDraw.ImageDraw, x: float, y: float, size: float, color, width: int | None = None) -> None:
    """把 <•> 标按 32×32 坐标系缩放画出来"""
    scale = size / 32.0

    def point(px: float, py: float) -> tuple[float, float]:
        return (x + px * scale, y + py * scale)

    stroke = width or max(2, int(round(2.8 * scale)))
    draw.line([point(12, 7), point(5, 16), point(12, 25)], fill=color, width=stroke, joint="curve")
    draw.line([point(20, 7), point(27, 16), point(20, 25)], fill=color, width=stroke, joint="curve")
    radius = 2.6 * scale
    cx, cy = point(16, 16)
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=color)


def make_build_flow() -> Path:
    """构建流水线示意图：Markdown → Astro → dist → nginx"""
    scale = 2
    width, height = 1200 * scale, 420 * scale
    image = Image.new("RGB", (width, height), BG)
    draw = ImageDraw.Draw(image)

    # 顶部标题
    draw.text((150, 70), "从 Markdown 到静态页面", font=font(ARIAL_UNICODE, 44), fill=INK)
    draw.text(
        (150, 132),
        "构建期完成渲染与高亮，运行时只有 HTML 和 CSS",
        font=font(ARIAL_UNICODE, 26),
        fill=MUTED,
    )
    draw.line([(150, 200), (width - 150, 200)], fill=LINE, width=2)

    labels = [
        ("content/*.md", "写作 / Git"),
        ("astro build", "渲染 + Shiki"),
        ("dist/", "静态 HTML"),
        ("nginx", "自托管"),
    ]

    box_width, box_height = 200 * scale, 150 * scale
    gap = 60 * scale
    total = len(labels) * box_width + (len(labels) - 1) * gap
    left = (width - total) // 2
    top = 250

    for index, (title, caption) in enumerate(labels):
        x = left + index * (box_width + gap)
        rounded_box(
            draw,
            (x, top, x + box_width, top + box_height),
            14 * scale,
            "#ffffff",
            LINE,
            width=2 * scale,
        )
        draw.text(
            (x + 22 * scale, top + 40 * scale),
            title,
            font=font(MONO, 22 * scale),
            fill=ACCENT,
        )
        draw.text(
            (x + 22 * scale, top + 94 * scale),
            caption,
            font=font(ARIAL_UNICODE, 22 * scale),
            fill=MUTED,
        )

        if index < len(labels) - 1:
            ax = x + box_width + 12 * scale
            ay = top + box_height // 2
            arrow(draw, (ax, ay), (ax + gap - 24 * scale, ay), MUTED, width=3 * scale, head=12 * scale)

    target = POST_ASSETS / "build-flow.png"
    target.parent.mkdir(parents=True, exist_ok=True)
    image.save(target, optimize=True)
    return target


def make_cover() -> Path:
    """文章封面：深色渐变 + 网格 + 光点"""
    width, height = 1600, 900
    image = Image.new("RGB", (width, height), (10, 24, 21))
    draw = ImageDraw.Draw(image)

    top_color = (12, 46, 39)
    bottom_color = (9, 14, 13)
    for y in range(height):
        t = y / height
        color = tuple(int(top_color[i] + (bottom_color[i] - top_color[i]) * t) for i in range(3))
        draw.line([(0, y), (width, y)], fill=color)

    grid = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    grid_draw = ImageDraw.Draw(grid)
    for x in range(0, width, 80):
        grid_draw.line([(x, 0), (x, height)], fill=(255, 255, 255, 8), width=1)
    for y in range(0, height, 80):
        grid_draw.line([(0, y), (width, y)], fill=(255, 255, 255, 8), width=1)

    random.seed(7)
    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    for cx, cy, radius, color in [
        (1180, 250, 220, (99, 211, 178)),
        (420, 640, 180, (14, 111, 91)),
        (860, 520, 120, (214, 190, 120)),
    ]:
        for step in range(radius, 0, -6):
            alpha = int(30 * (1 - step / radius) ** 2)
            if alpha <= 0:
                continue
            glow_draw.ellipse(
                (cx - step, cy - step, cx + step, cy + step),
                fill=(*color, alpha),
            )
    glow_draw.ellipse((1170, 240, 1190, 260), fill=(220, 255, 240, 220))

    image = Image.alpha_composite(image.convert("RGBA"), grid)
    image = Image.alpha_composite(image, glow)
    draw = ImageDraw.Draw(image)

    draw.text((110, 700), "asyncio", font=font(MONO, 92), fill=(214, 240, 230, 235))
    draw.text(
        (114, 812),
        "concurrency · retry · backpressure",
        font=font(MONO, 26),
        fill=(150, 190, 178, 200),
    )
    draw.line([(110, 660), (330, 660)], fill=(99, 211, 178, 200), width=3)

    target = POST_ASSETS / "cover-asyncio.png"
    image.convert("RGB").save(target, optimize=True)
    return target


def make_og() -> Path:
    width, height = 1200, 630
    image = Image.new("RGB", (width, height), BG)
    draw = ImageDraw.Draw(image)

    draw.rectangle((0, 0, 12, height), fill=ACCENT)

    # 标 + 字标
    draw_mark(draw, 92, 146, 84, ACCENT)
    draw.text((200, 132), "beiliqi", font=font(GEORGIA, 104), fill=INK)

    draw.text((94, 300), "代码、系统与写作的笔记本", font=font(ARIAL_UNICODE, 40), fill=(79, 79, 73))
    draw.line([(94, 400), (560, 400)], fill=LINE, width=3)
    draw.text((94, 440), "Python · 逆向 · 爬虫 · 系统", font=font(ARIAL_UNICODE, 26), fill=MUTED)
    draw.text((94, 496), "beiliqi.github.io", font=font(MONO, 22), fill=MUTED)

    # 右下角放一个淡的标
    draw_mark(draw, 930, 380, 210, ACCENT_SOFT)

    target = PUBLIC / "og.png"
    target.parent.mkdir(parents=True, exist_ok=True)
    image.save(target, optimize=True)
    return target


def make_touch_icon() -> Path:
    size = 180
    image = Image.new("RGB", (size, size), ACCENT)
    draw = ImageDraw.Draw(image)
    draw_mark(draw, 36, 36, 108, BG)
    target = PUBLIC / "apple-touch-icon.png"
    image.save(target, optimize=True)
    return target


if __name__ == "__main__":
    for path in (make_build_flow(), make_cover(), make_og(), make_touch_icon()):
        print(f"wrote {path.relative_to(ROOT)} ({path.stat().st_size // 1024} KB)")

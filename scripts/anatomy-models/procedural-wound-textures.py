#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Procedural wound texture generator for ParaMedic Studio.

Outputs PNG textures that match the Canvas 2D rendering in `woundSprites.ts`.
Used to generate pre-baked wound decals for consistent rendering across deployments.

Usage:
    python procedural-wound-textures.py kind=abrasion count=10
    python procedural-wound-textures.py make-atlas output=wounds-atlas.png

Author: Elias Thomas (TW Recruitment) / ParaMedic Studio — CC BY-NC-SA 2026
License: CC-BY-NC-SA 4.0 for educational/academic paramedicine training use.
"""

import sys
import math
from datetime import datetime
from io import BytesIO
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFilter
except ImportError:
    print("Please install Pillow: pip install Pillow", flush=True)
    exit(1)


class DeterministicRandom:
    """Deterministic random using LCG seeded by string/int."""
    
    def __init__(self, seed):
        self.s = seed
    
    def next(self):
        """Returns value in [0, 1)."""
        self.s = ((self.s * 1664525) + 1013904223) & 0xFFFFFFFF
        return self.s / 0xFFFFFFFF
    
    def integer(self, low, high):
        """Integer in [low,high)."""
        return int(self.next() * (high - low)) + low


def create_wound(kind: str, wound_num: int = None) -> Image.Image:
    """Create a single wound texture PNG."""
    
    W, H = 512, 512
    
    if wound_num is None:
        wound_num = datetime.now().timestamp() * 1000
    seed = wound_num + (ord(kind[0]) if kind else 0)
    rng = DeterministicRandom(seed)
    
    # Create base skin image (medium skin tone with dark background for transparency)
    img = Image.new('RGBA', (W, H), (38, 32, 30))
    drw = ImageDraw.Draw(img)
    
    size = 96
    
    if kind == 'abrasion':
        draw_abrasion(drw, W//2, H//2, rng, size)
    elif kind == 'surgical-incision':
        draw_surgical_incision(drw, W//2, H//2, rng, size)
    elif kind == 'infected-incision':
        draw_infected_incision(drw, W//2, H//2, rng, size)
    elif kind == 'laceration':
        draw_laceration(drw, W//2, H//2, rng, size)
    elif kind == 'active-bleeding':
        draw_active_bleeding(drw, W//2, H//2, rng, size)
    else:
        drw.text((W//3 - 50, H//2), f"Unknown kind: {kind}", (255, 255, 255))
    
    return img


def draw_abrasion(draw: ImageDraw.ImageDraw, cx, cy, rng, size):
    """Road rash abrasion (brown elliptical scrape)."""
    
    for _ in range(40):
        angle = rng.next() * 2 * math.pi
        dist = rng.next() * size * 0.85
        
        px = int(math.cos(angle) * dist + cx - size)
        py = int((1 - rng.next()) * dist * 0.6 + cy - size)
        
        r = rng.integer(46, 92)    # rust brown
        g = rng.integer(39, 78)
        
        drw.ellipse((px-2, py-2, px+2, py+2), fill=(r, g, 100 + rng.integer(45, 70)))


def draw_surgical_incision(draw: ImageDraw.ImageDraw, cx, cy, rng, size):
    """Straight surgical incision with stitch marks."""
    
    # Red center line
    drw.line([(cx - size, cy), (cx + size, cy)], fill=(139, 0, 0))
    
    # Stitch marks every 12% of wound length
    for i in range(-6, 7, 1):
        stitch_pos = cx + i * (size * 0.12)
        drw.line([(stitch_pos, cy - 3), (stitch_pos, cy + 3)], fill=(75, 0, 0))


def draw_infected_incision(draw: ImageDraw.ImageDraw, cx, cy, rng, size):
    """Infected incision with wider halo and yellow pus spots."""
    
    # Draw similar to surgical but with larger infection halo
    drw.line([(cx - size, cy), (cx + size, cy)], fill=(255, 99, 71))
    
    for i in range(-size, size+1, size//8):
        drw.line([(i, cy - 4), (i, cy + 4)], fill=(130, 60, 60))
    
    # Infection halo
    drw.ellipse((cx - size*1.4, cy - size*1.4, cx + size*1.4, cy + size*1.4),
                fill=(rgba(255, 99, 71, 60)))
    
    # Pus spots (yellowish centers around wound)
    for _ in range(3):
        angle = rng.next() * 2 * math.pi
        dist = rng.next() * size // 2
        drw.circle((int(math.cos(angle) * dist + cx), int(math.sin(angle) * dist + cy)), 
                   radius=size//10, fill=(rgba(255, 255, 153)))


def draw_laceration(draw: ImageDraw.ImageDraw, cx, cy, rng, size):
    """Jagged laceration (tear-shaped wound)."""
    
    points = [(cx - size, cy)]
    for i in range(size * 10):
        x_step = size // 6
        jitter = rng.integer(-5, 5)
        y_offset = math.sin((i / size) * math.pi) * (size // 5) + jitter
        points.append((cx - size + x_step * (i+1), cy + y_offset))
    
    drw.polygon([(cx - size, cy)] + points + [(cx - size, cy)], fill=(120, 20, 20))


def draw_active_bleeding(draw: ImageDraw.ImageDraw, cx, cy, rng, size):
    """Active bleeding wound with dark core and dripping effect."""
    
    # Dark red core
    drw.ellipse((cx - size*0.55, cy - size*0.5, cx + size*0.55, cy + size*0.5),
                fill=rgba(120, 8, 12))
    
    # Fresnel shine on wound face
    drw.ellipse((cx - size*0.22, cy - size*0.16, cx + size*0.22, cy + size*0.16),
                fill=(rgba(255, 140, 120, 50)))
    
    # Drip droplets down the body (negative Y = up in UV space)
    for _ in range(6):
        dx = rng.integer(-int(size*0.9), int(size*0.9))
        len_val = size * (0.3 + rng.next() * 0.75)
        dy = size * (0.2 + len_val)
        
        drw.line([(dx, size*0.2), (dx + rng.integer(-2, 2), dy)], fill=rgba(110, 8, 12))


def rgba(r, g, b):
    """Create RGBA tuple for fill."""
    return (r, g, b, 255)


if __name__ == '__main__':
    
    # Parse arguments
    args = ' '.join(sys.argv[1:]) or ''
    kind_filter = None
    output_atlas = "wounds-atlas.png"
    
    for arg in args.split():
        if arg.startswith("kind="): kind_filter = arg.split("=", 1)[1]
        if arg.startswith("--") and len(arg) > 3 and "=" not in arg:
            if arg == "--make-atlas":
                output_atlas = "wounds-atlas.png"
    
    OUTPUT_DIR = Path("assets/medical-3d/wound-textures-procedural")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    print(f"Wound texture generator: kind={kind_filter}, atlas={output_atlas}")

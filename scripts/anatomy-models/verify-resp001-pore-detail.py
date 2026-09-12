"""Validate the resp-001 pore normal without third-party Python packages.

Run with Blender:

  Blender --background --python scripts/anatomy-models/verify-resp001-pore-detail.py -- \
    public/models/patient-male-skin-resp001-pore-detail-normal.png
"""

from __future__ import annotations

import math
import os
import statistics
import sys

import bpy


argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
if len(argv) != 1:
    raise SystemExit("usage: verify-resp001-pore-detail.py <normal.png>")

PATH = os.path.abspath(argv[0])
EXPECTED_SIZE = 512
MAX_SEAM_RMSE = 0.005
MIN_XY_STD = 0.018
MAX_XY_STD = 0.11
MIN_ACTIVE_FRACTION = 0.45
MAX_STRONG_FRACTION = 0.10
RECOMMENDED_TILES = 28
RECOMMENDED_SCALE = 0.8


def main() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    image = bpy.data.images.load(PATH, check_existing=False)
    try:
        image.colorspace_settings.name = "Non-Color"
    except TypeError:
        pass
    width, height = image.size
    if (width, height) != (EXPECTED_SIZE, EXPECTED_SIZE):
        raise RuntimeError(f"expected {EXPECTED_SIZE}x{EXPECTED_SIZE}, got {width}x{height}")

    raw = list(image.pixels)
    rgb = [(raw[i], raw[i + 1], raw[i + 2]) for i in range(0, len(raw), 4)]
    red = [pixel[0] for pixel in rgb]
    green = [pixel[1] for pixel in rgb]
    blue = [pixel[2] for pixel in rgb]
    red_mean = statistics.fmean(red)
    green_mean = statistics.fmean(green)
    red_std = statistics.pstdev(red)
    green_std = statistics.pstdev(green)
    blue_mean = statistics.fmean(blue)

    if abs(red_mean - 0.5) > 0.025 or abs(green_mean - 0.5) > 0.025:
        raise RuntimeError(f"normal is not neutral-centred: R={red_mean:.4f} G={green_mean:.4f}")
    if not (MIN_XY_STD <= red_std <= MAX_XY_STD and MIN_XY_STD <= green_std <= MAX_XY_STD):
        raise RuntimeError(
            f"XY signal outside useful range: Rstd={red_std:.4f} Gstd={green_std:.4f}"
        )
    if blue_mean < 0.93:
        raise RuntimeError(f"normal points too far from tangent +Z: Bmean={blue_mean:.4f}")

    active = statistics.fmean(
        1.0 if max(abs(r - 0.5), abs(g - 0.5)) > (2.0 / 255.0) else 0.0
        for r, g, _ in rgb
    )
    strong = statistics.fmean(
        1.0 if max(abs(r - 0.5), abs(g - 0.5)) > 0.10 else 0.0
        for r, g, _ in rgb
    )
    if active < MIN_ACTIVE_FRACTION:
        raise RuntimeError(f"too much neutral/empty area: active={active:.3f}")
    if strong > MAX_STRONG_FRACTION:
        raise RuntimeError(f"coarse orange-peel risk: strong={strong:.3f}")

    def pixel(x: int, y: int) -> tuple[float, float, float]:
        return rgb[y * width + x]

    def seam_rmse(first, second) -> float:
        squared = []
        for a, b in zip(first, second):
            squared.extend((a[channel] - b[channel]) ** 2 for channel in range(3))
        return math.sqrt(statistics.fmean(squared))

    left_right = seam_rmse(
        [pixel(0, y) for y in range(height)],
        [pixel(width - 1, y) for y in range(height)],
    )
    top_bottom = seam_rmse(
        [pixel(x, 0) for x in range(width)],
        [pixel(x, height - 1) for x in range(width)],
    )
    if left_right > MAX_SEAM_RMSE or top_bottom > MAX_SEAM_RMSE:
        raise RuntimeError(
            f"wrap seam too large: left-right={left_right:.5f} top-bottom={top_bottom:.5f}"
        )

    vector_length_error = statistics.fmean(
        abs(math.sqrt((2 * r - 1) ** 2 + (2 * g - 1) ** 2 + (2 * b - 1) ** 2) - 1.0)
        for r, g, b in rgb
    )
    if vector_length_error > 0.025:
        raise RuntimeError(f"decoded normals are not unit length: mean-error={vector_length_error:.5f}")

    angles = sorted(
        math.degrees(math.acos(max(-1.0, min(1.0, 2 * b - 1))))
        for _, _, b in rgb
    )
    mean_angle = statistics.fmean(angles)
    p95_angle = angles[int(len(angles) * 0.95)]

    print(
        "[verify-resp001-pore-detail] "
        f"size={width}x{height} Rmean={red_mean:.4f} Gmean={green_mean:.4f} "
        f"Rstd={red_std:.4f} Gstd={green_std:.4f} Bmean={blue_mean:.4f} "
        f"active={active:.3f} strong={strong:.3f} "
        f"seam-lr={left_right:.5f} seam-tb={top_bottom:.5f} "
        f"unit-error={vector_length_error:.5f} angle-mean={mean_angle:.2f}deg "
        f"angle-p95={p95_angle:.2f}deg recommended-tiles={RECOMMENDED_TILES} "
        f"recommended-scale={RECOMMENDED_SCALE:.2f}"
    )


main()

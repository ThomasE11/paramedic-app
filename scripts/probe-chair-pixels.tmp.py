from pathlib import Path
from PIL import Image

for p in ['probe-out/chair-y1-013.png', 'probe-out/nonchair-trauma-001.png']:
    im = Image.open(p)
    print(p, im.size, im.mode)
    w, h = im.size
    for x_frac in (0.42, 0.5, 0.58):
        x = int(w * x_frac)
        colours = []
        for y_frac in (0.4, 0.5, 0.6, 0.7, 0.8, 0.88):
            y = int(h * y_frac)
            colours.append((y_frac, im.getpixel((x, y))[:3]))
        print(f'  x={x_frac}', colours)

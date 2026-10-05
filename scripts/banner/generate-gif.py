"""Regenerate the noscript banner: python3 scripts/banner/generate-gif.py."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
# macOS system font, with Linux alternative for repeatable generation.
fonts = ['/System/Library/Fonts/Supplemental/Arial Bold.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf']
font = ImageFont.truetype(next(p for p in fonts if Path(p).exists()), 28)
phrases = [('Создано ', 'PaulIsLava', '#a5b4fc'), ('Заказать ', 'автоматизацию', '#67e8f9'), ('Заказать ', 'сайт', '#86efac'), ('Заказать ', 'чат-бот', '#fcd34d'), ('Заказать ', 'разработку', '#f9a8d4')]
frames, durations = [], []
elapsed = 0
def add(prefix, word, color, duration):
    global elapsed
    im = Image.new('RGBA', (600, 88), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    width = d.textlength(prefix + word, font=font) + 12
    x = (600 - width) / 2
    d.text((x, 44), prefix, font=font, fill='#f1f5f9', anchor='lm')
    x += d.textlength(prefix, font=font)
    d.text((x, 44), word, font=font, fill=color, anchor='lm')
    x += d.textlength(word, font=font)
    while duration > 0:
        interval = min(duration, 550 - elapsed % 550)
        frame = im.copy()
        if (elapsed // 550) % 2 == 0:
            ImageDraw.Draw(frame).line((x + 5, 29, x + 5, 57), fill='#94a3b8', width=2)
        pal = frame.convert("RGB").quantize(colors=255)
        pal = pal.point(lambda n: n + 1)
        palette = [0, 0, 0] + frame.convert("RGB").quantize(colors=255).getpalette()[:765]
        pal.putpalette(palette)
        alpha = frame.getchannel("A")
        pal.paste(0, mask=alpha.point(lambda a: 255 if a < 128 else 0))
        frames.append(pal); durations.append(interval)
        elapsed += interval
        duration -= interval
for i, (prefix, word, color) in enumerate(phrases):
    add(prefix, word, color, 2000 if i == 0 else 2600)
    np, nw, nc = phrases[(i + 1) % len(phrases)]
    same = prefix == np
    old = word if same else prefix + word
    for n in range(len(old) - 1, -1, -1):
        add(prefix if same else old[:n][:len(prefix)], old[:n] if same else old[:n][len(prefix):], color, 50)
    new = nw if same else np + nw
    for n in range(1, len(new) + 1):
        # The fixed prefix retains its neutral color while typing services.
        add(np if same else new[:n][:len(np)], new[:n] if same else new[:n][len(np):], nc, 90)
frames[0].save(ROOT / 'packages/web/public/banner.gif', save_all=True, append_images=frames[1:], duration=durations, loop=0, optimize=False, transparency=0, disposal=2)
print(f'GIF: {len(frames)} frames')

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import opentype from 'opentype.js';
import sharp from 'sharp';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';

// Convert text to paths: the Alpine production image needs no system fonts.
const fontPromise = readFile(path.join(process.cwd(), 'public/fonts/NotoSans-Bold.ttf'))
  .then(data => opentype.parse(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer));
const cache = new Map<string, Promise<Buffer>>();
let renderQueue: Promise<unknown> = Promise.resolve();
const defaults = {
  brandText: 'PaulIsLava', brandColor: '#a5b4fc', automationColor: '#67e8f9',
  siteColor: '#86efac', chatbotColor: '#fcd34d', developmentColor: '#f9a8d4',
  textColor: '#f1f5f9',
};
type Settings = typeof defaults;
export function getBannerGif(config: Record<string, unknown>): Promise<Buffer> {
  const settings = { ...defaults };
  for (const field of Object.keys(defaults) as (keyof Settings)[]) {
    const value = config[field];
    if (typeof value === 'string' && (field === 'brandText' ? value.trim() : /^#[a-f0-9]{6}$/i.test(value))) {
      settings[field] = field === 'brandText' ? value.slice(0, 40) : value;
    }
  }
  const signature = JSON.stringify(settings);
  const existing = cache.get(signature);
  if (existing) return existing;
  // Serial rendering bounds CPU/memory; concurrent requests share one result.
  const pending = renderQueue.then(() => render(settings));
  renderQueue = pending.catch(() => undefined);
  cache.set(signature, pending);
  if (cache.size > 16) cache.delete(cache.keys().next().value!);
  pending.catch(() => { if (cache.get(signature) === pending) cache.delete(signature); });
  return pending;
}

async function render(settings: Settings): Promise<Buffer> {
  const font = await fontPromise;
  const gif = GIFEncoder();
  const phrases = [
    ['Создано ', settings.brandText, settings.brandColor],
    ['Заказать ', 'автоматизацию', settings.automationColor],
    ['Заказать ', 'сайт', settings.siteColor],
    ['Заказать ', 'чат-бот', settings.chatbotColor],
    ['Заказать ', 'разработку', settings.developmentColor],
  ];
  let elapsed = 0;
  const width = 600, height = 88;
  const wordPaths = new Map<string, { path: string; width: number }>();
  const textPath = (text: string, x: number, size: number) => {
    const key = `${text}:${x}:${size}`;
    if (!wordPaths.has(key)) wordPaths.set(key, {
      path: font.getPath(text, x, 54, size).toPathData(2),
      width: font.getAdvanceWidth(text, size),
    });
    return wordPaths.get(key)!;
  };
  async function add(prefix: string, word: string, color: string, duration: number) {
    const natural = font.getAdvanceWidth(prefix + word, 28);
    const size = Math.min(28, 28 * 560 / Math.max(natural, 1));
    const total = font.getAdvanceWidth(prefix + word, size);
    const x = (width - total - 12) / 2;
    const first = textPath(prefix, x, size);
    const second = textPath(word, x + first.width, size);
    const base = `<path d="${first.path}" fill="${settings.textColor}"/><path d="${second.path}" fill="${color}"/>`;
    const rendered = new Map<boolean, { index: Uint8Array; palette: number[][] }>();
    while (duration > 0) {
      const interval = Math.min(duration, 550 - elapsed % 550);
      const cursor = Math.floor(elapsed / 550) % 2 === 0;
      let frame = rendered.get(cursor);
      if (!frame) {
        const line = cursor ? `<path d="M${x + total + 5} 29v28" stroke="#94a3b8" stroke-width="2"/>` : '';
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="88">${base}${line}</svg>`;
        const rgba = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer();
        const opaquePalette = quantize(rgba, 63);
        const palette = [[0, 0, 0], ...opaquePalette];
        const index = applyPalette(rgba, opaquePalette);
        for (let pixel = 0; pixel < index.length; pixel++) {
          index[pixel] = rgba[pixel * 4 + 3] < 128 ? 0 : index[pixel] + 1;
        }
        frame = { index, palette };
        rendered.set(cursor, frame);
      }
      gif.writeFrame(frame.index, width, height, {palette:frame.palette,delay:interval,repeat:0,transparent:true,transparentIndex:0,dispose:2});
      duration -= interval;
      elapsed += interval;
    }
  }
  for (let i = 0; i < phrases.length; i++) {
    const [prefix, word, color] = phrases[i];
    await add(prefix, word, color, i === 0 ? 2000 : 2600);
    const [nextPrefix, nextWord, nextColor] = phrases[(i + 1) % phrases.length];
    const same = prefix === nextPrefix;
    const oldText = same ? word : prefix + word;
    for (let length = oldText.length - 1; length >= 0; length--) {
      const text = oldText.slice(0,length);
      await add(same ? prefix : text.slice(0,prefix.length), same ? text : text.slice(prefix.length), color, 50);
    }
    const nextText = same ? nextWord : nextPrefix + nextWord;
    for (let length = 1; length <= nextText.length; length++) {
      const text = nextText.slice(0,length);
      await add(same ? nextPrefix : text.slice(0,nextPrefix.length), same ? text : text.slice(nextPrefix.length), nextColor, 90);
    }
  }
  gif.finish();
  return Buffer.from(gif.bytes());
}

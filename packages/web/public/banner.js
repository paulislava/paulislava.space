/* PaulIsLava footer banner. No dependencies; styles isolated with Shadow DOM. */
(() => {
  'use strict';
  const script = document.currentScript;
  if (!script) return;
  const previous = script.previousElementSibling;
  const host = previous && previous.hasAttribute('data-paulislava-banner') ? previous : document.createElement('span');
  host.style.cssText = 'display:inline-block;width:300px;max-width:100%;height:44px;vertical-align:middle';
  if (host !== previous) script.before(host);
  const source = new URL(script.src);
  const key = source.searchParams.get('banner');
  const site = source.searchParams.get('site');
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `<style>
    :host{color-scheme:dark}
    a{box-sizing:border-box;display:flex;align-items:center;justify-content:flex-start;width:100%;height:44px;padding:0;border:0;background:transparent;color:#f1f5f9;text-decoration:none;font:600 14px/1.2 system-ui,-apple-system,sans-serif;white-space:nowrap;transition:border-color .2s}
    a:hover{opacity:.85}a:focus-visible{outline:2px solid #a5b4fc;outline-offset:3px}
    .word{color:#a5b4fc}.cursor{color:#94a3b8;margin-left:2px}
  </style><a href="https://paulislava.space/zakazat-sait-avtomatizaciyu" aria-label="Создано PaulIsLava — заказать автоматизацию, сайт, чат-бот или разработку"><span aria-hidden="true"><span class="prefix">Создано </span><span class="word">PaulIsLava</span><span class="cursor">▏</span></span></a>`;
  const link = root.querySelector('a');
  function track(website) {
    try {
      const url = new URL(website);
      if (!['http:', 'https:'].includes(url.protocol)) return;
      const target = new URL('https://paulislava.space/zakazat-sait-avtomatizaciyu');
      target.search = new URLSearchParams({utm_source:url.hostname,utm_medium:'footer_banner',utm_campaign:'made_by_paulislava',utm_content:key || 'default'}).toString();
      link.href = target.href;
    } catch { /* Keep the default destination. */ }
  }
  track(site || location.origin);
  const prefix = root.querySelector('.prefix');
  const word = root.querySelector('.word');
  const cursor = root.querySelector('.cursor');
  const phrases = [
    ['Создано ', 'PaulIsLava', '#a5b4fc'],
    ['Заказать ', 'автоматизацию', '#67e8f9'],
    ['Заказать ', 'сайт', '#86efac'],
    ['Заказать ', 'чат-бот', '#fcd34d'],
    ['Заказать ', 'разработку', '#f9a8d4'],
  ];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false, frame = 0, last = 0, elapsed = 0;
  let index = 0, phase = 'hold', delay = 2000, started = false;
  let text = phrases[0][1], changingPrefix = false;
  function render(value, leading) {
    prefix.textContent = value.slice(0, leading.length);
    word.textContent = value.slice(leading.length);
  }
  function tick(now) {
    frame = 0;
    if (!host.isConnected || !visible || document.hidden || motion.matches) { last = 0; return; }
    const delta = last ? Math.min(now - last, 100) : 0;
    last = now;
    elapsed += delta;
    cursor.style.opacity = Math.floor(now / 550) % 2 ? '0' : '1';
    if (elapsed >= delay) {
      elapsed = 0;
      if (phase === 'hold') {
        started = true;
        const next = phrases[(index + 1) % phrases.length];
        changingPrefix = next[0] !== phrases[index][0];
        text = changingPrefix ? phrases[index][0] + word.textContent : word.textContent;
        phase = 'erase'; delay = 45;
      } else if (phase === 'erase') {
        text = text.slice(0, -1);
        if (changingPrefix) render(text, phrases[index][0]);
        else word.textContent = text;
        if (!text) {
          index = (index + 1) % phrases.length;
          word.style.color = phrases[index][2];
          phase = 'type'; delay = 90;
        }
      } else {
        const target = changingPrefix ? phrases[index][0] + phrases[index][1] : phrases[index][1];
        text = target.slice(0, text.length + 1);
        if (changingPrefix) render(text, phrases[index][0]);
        else word.textContent = text;
        if (text === target) {
          prefix.textContent = phrases[index][0];
          word.textContent = phrases[index][1];
          phase = 'hold'; delay = 2600;
        }
      }
    }
    frame = requestAnimationFrame(tick);
  }
  function resume() {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    if (!started) elapsed = 0;
    if (!motion.matches && visible && !document.hidden && host.isConnected) frame = requestAnimationFrame(tick);
    if (motion.matches) cursor.style.opacity = '0';
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting && entries[0].intersectionRatio >= 1;
      resume();
    }, { threshold: [0, 1] });
    observer.observe(host);
  } else { visible = true; resume(); }
  if (key && /^[a-f0-9-]{36}$/.test(key)) {
    fetch(new URL('/api/banners/' + key, source), {credentials:'omit', signal:AbortSignal.timeout(5000)})
      .then(response => response.ok ? response.json() : null)
      .then(config => {
        if (!config || !host.isConnected) return;
        if (config.enabled === false) { host.remove(); resume(); return; }
        track(config.websiteUrl);
        const fields = ['brandColor','automationColor','siteColor','chatbotColor','developmentColor'];
        fields.forEach((field, i) => { if (/^#[a-f0-9]{6}$/i.test(config[field])) phrases[i][2] = config[field]; });
        if (typeof config.brandText === 'string' && config.brandText.trim()) phrases[0][1] = config.brandText.slice(0,40);
        for (const [field, property] of [['textColor','color']]) {
          if (/^#[a-f0-9]{6}$/i.test(config[field])) link.style[property] = config[field];
        }
        if (phase === 'hold') { word.textContent = phrases[index][1]; word.style.color = phrases[index][2]; }
      }).catch(() => { /* Offline CMS: default banner remains usable. */ });
  }
  document.addEventListener('visibilitychange', resume);
  motion.addEventListener('change', resume);
})();

const vm = require('node:vm');
const fs = require('node:fs');
const assert = require('node:assert/strict');
let callback, observerCallback, now = 0;
const nodes = Object.fromEntries(['.prefix','.word','.cursor','a'].map(k => [k, {textContent:k === '.prefix' ? 'Создано ' : k === '.word' ? 'PaulIsLava' : '▏',style:{}}]));
const root = {innerHTML:'',querySelector:k=>nodes[k]};
const host = {style:{},isConnected:true,attachShadow:()=>root};
const context = {URL, URLSearchParams, location:{origin:'https://example.com'}, document:{currentScript:{src:'https://paulislava.space/banner.js',before(){}},createElement:()=>host,hidden:false,addEventListener(){}},window:{IntersectionObserver:true},IntersectionObserver:class{constructor(cb){observerCallback=cb}observe(){}},matchMedia:()=>({matches:false,addEventListener(){}}),requestAnimationFrame:cb=>(callback=cb,1),cancelAnimationFrame:()=>{callback=null}};
vm.runInNewContext(fs.readFileSync('packages/web/public/banner.js','utf8'),context);
assert.equal(callback,undefined);
observerCallback([{isIntersecting:true,intersectionRatio:0.5}]);
assert.equal(callback,null);
observerCallback([{isIntersecting:true,intersectionRatio:1}]);
function advance(ms){
 for(let i=0;i<ms/10;i++){
  now+=10;const cb=callback;if(cb)cb(now);
  const prefix=nodes['.prefix'].textContent;
  assert.ok(['Создано ','Заказать '].some(value=>value.startsWith(prefix)), 'neutral text contains only the prefix');
  if(prefix!=='Создано '&&prefix!=='Заказать ') assert.equal(nodes['.word'].textContent,'', 'a partially typed prefix never leaks into the colored word');
 }
}
advance(1900); assert.equal(nodes['.word'].textContent,'PaulIsLava');
observerCallback([{isIntersecting:false,intersectionRatio:0}]);advance(3000);
assert.equal(nodes['.word'].textContent,'PaulIsLava');
observerCallback([{isIntersecting:true,intersectionRatio:1}]);advance(1900);
assert.equal(nodes['.word'].textContent,'PaulIsLava');advance(5000);
assert.equal(nodes['.prefix'].textContent,'Заказать ');
let seenSite=false, seenBot=false, seenBrand=false;
for(let i=0;i<2300;i++){
 advance(10);
 const word=nodes['.word'].textContent;
 if(word==='сайт'){seenSite=true;assert.equal(nodes['.prefix'].textContent,'Заказать ');assert.equal(nodes['.word'].style.color,'#86efac')}
 if(word==='чат-бот'){seenBot=true;assert.equal(nodes['.prefix'].textContent,'Заказать ')}
 if(seenBot&&word==='PaulIsLava')seenBrand=true;
}
assert.ok(seenSite&&seenBot&&seenBrand);
assert.ok(nodes.a.href.includes('utm_source=example.com'));
console.log('PASS: visibility delay, hidden pause, fixed prefix, service colors, full loop');

// Check the actual analytics snippet with mocked Metrika, without sending visits.
const analyticsSource = fs.readFileSync('packages/web/src/components/analytics/YandexMetrika.tsx','utf8');
const inline = analyticsSource.match(/\{`([\s\S]*?)`\}/)[1].replaceAll('${YANDEX_METRIKA_ID}', '110323550');
function analytics(search) {
  const calls = [];
  const win = {location:{search},ym:(...args)=>calls.push(args)};
  const document = {scripts:[],createElement:()=>({}),getElementsByTagName:()=>[{parentNode:{insertBefore(){}}}]};
  vm.runInNewContext(inline, {window:win,document,URLSearchParams,ym:win.ym});
  return calls.filter(call=>call[1]==='reachGoal');
}
assert.equal(analytics('').length,0);
assert.equal(analytics('?utm_source=partner.example&utm_medium=email').length,0);
assert.equal(analytics('?utm_medium=footer_banner').length,0);
const [goal]=analytics('?utm_source=partner.example&utm_medium=footer_banner&utm_content=test-banner');
assert.equal(goal[2],'partner_banner_visit');
assert.equal(goal[3].partner_site,'partner.example');
assert.equal(goal[3].banner,'test-banner');
console.log('PASS: Metrika partner goal fires only on banner arrivals and includes partner/banner parameters');

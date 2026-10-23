import assert from 'node:assert/strict';
import test from 'node:test';
import * as seo from '../src/lib/seo.ts';

const media = { documentId: 'img', url: '/uploads/real-cover.jpg', alternativeText: null, width: 1200, height: 800 };
const article = {
  documentId: 'article', title: 'Тестовая статья', slug: 'test', excerpt: 'Описание',
  content: [], mainContent: [], cover: media, pageCover: null, showCoverOnPage: true,
  tags: [{ documentId: 'tag', name: 'Архитектура', slug: 'architecture', color: '#fff', category: 'article' }],
  technologies: [], publishedAt: '2026-10-01T12:00:00.000Z', createdAt: '2026-09-29T12:00:00.000Z',
  updatedAt: '2026-10-23T12:00:00.000Z', relatedArticles: [], series: null, orderInSeries: null,
};

test('CMS text cannot close the JSON-LD script and remains valid JSON', () => {
  const input = { name: '</script><script>alert("x")</script>', description: 'A & B\u2028C' };
  const output = seo.serializeJsonLd(input);
  assert.equal(output.includes('<'), false);
  assert.deepEqual(JSON.parse(output), input);
});

test('article uses actual update time and does not invent missing update dates', () => {
  assert.equal(seo.articleJsonLd(article).dateModified, '2026-10-23T12:00:00.000Z');
  for (const updatedAt of [undefined, null, '', 'invalid-date']) {
    assert.equal(seo.articleJsonLd({ ...article, updatedAt }).dateModified, undefined);
  }
});

test('article omits generic cover placeholders and describes real media', () => {
  assert.equal(seo.articleJsonLd({ ...article, cover: null, pageCover: null }).image, undefined);
  assert.equal(seo.articleJsonLd(article).image.url, 'https://paulislava.space/uploads/real-cover.jpg');
  assert.equal(seo.articleJsonLd(article).image.width, 1200);
});

test('publication page connects author, page, article, series and breadcrumbs', () => {
  const graph = seo.articlePageJsonLd({ ...article, series: { documentId: 's', title: 'Цикл', slug: 'cycle', description: null, articles: [] } })['@graph'];
  const post = graph.find(n => n['@type'] === 'BlogPosting');
  const page = graph.find(n => n['@type'] === 'WebPage');
  assert.equal(page.mainEntity['@id'], post['@id']);
  assert.equal(post.mainEntityOfPage['@id'], page['@id']);
  assert.equal(post.author.name, 'Павел Кондратов');
  assert.equal(post.isPartOf['@id'], 'https://paulislava.space/series/cycle#series');
  assert.deepEqual(graph.find(n => n['@type'] === 'BreadcrumbList').itemListElement.map(n => n.name), ['Главная', 'Статьи', 'Тестовая статья']);
});

test('FAQ comes only from complete rendered CMS FAQ entries, never from MDX', () => {
  const mainContent = [
    { __typename: 'ComponentSectionsMdxSection', anchorId: null, Content: 'Как? Ответ.' },
    { __typename: 'ComponentSectionsFaqSection', title: 'FAQ', items: [null, { question: 'Почему?', answer: 'Потому что.' }, { question: '', answer: 'Нет вопроса' }, { question: 'Пусто?', answer: ' ' }] },
  ];
  const graph = seo.articlePageJsonLd({ ...article, mainContent })['@graph'];
  const faq = graph.find(n => n['@type'] === 'FAQPage');
  assert.deepEqual(faq.mainEntity.map(n => [n.name, n.acceptedAnswer.text]), [['Почему?', 'Потому что.']]);
  assert.equal(seo.articlePageJsonLd(article)['@graph'].some(n => n['@type'] === 'FAQPage'), false);
});

test('catalog list contains exactly filtered visible cards in display order', () => {
  const rows = [article, { ...article, slug: 'second', technologies: [{ slug: 'nextjs' }] }, { ...article, slug: 'third', tags: [] }];
  const filtered = seo.filterContent(rows, 'architecture', 'nextjs');
  const graph = seo.collectionPageJsonLd('/articles', 'Все статьи', filtered.map(a => ({ name: a.title, url: `/articles/${a.slug}` })))['@graph'];
  const list = graph.find(n => n['@type'] === 'ItemList');
  assert.equal(list.numberOfItems, 1);
  assert.deepEqual(list.itemListElement.map(n => [n.position, n.url]), [[1, 'https://paulislava.space/articles/second']]);
  const empty = seo.collectionPageJsonLd('/projects', 'Проекты', [])['@graph'].find(n => n['@type'] === 'ItemList');
  assert.equal(empty.numberOfItems, 0);
  assert.deepEqual(empty.itemListElement, []);
});

test('series has ordered articles linked to the same entities as article pages', () => {
  const graph = seo.seriesPageJsonLd({ documentId: 's', title: 'Цикл', slug: 'cycle', description: null, articles: [{ ...article, slug: 'part-2' }, { ...article, slug: 'part-1' }] })['@graph'];
  const series = graph.find(n => n['@type'] === 'CreativeWorkSeries');
  assert.equal(series['@id'], 'https://paulislava.space/series/cycle#series');
  assert.deepEqual(series.hasPart.map(n => n['@id']), ['https://paulislava.space/articles/part-2#article', 'https://paulislava.space/articles/part-1#article']);
  assert.deepEqual(graph.find(n => n['@type'] === 'ItemList').itemListElement.map(n => n.position), [1, 2]);
});

test('home identifies the person, business identifies real services without prices or ratings', () => {
  assert.equal(seo.homePageJsonLd([])['@graph'].find(n => n['@type'] === 'ProfilePage').mainEntity['@id'], 'https://paulislava.space/#person');
  const graph = seo.businessPageJsonLd()['@graph'];
  const services = graph.filter(n => n['@type'] === 'Service');
  assert.deepEqual(services.map(n => n.name), ['Сайты и лендинги', 'Сервисы и платформы', 'Автоматизация и интеграции']);
  assert.ok(services.every(n => n.provider['@id'] === 'https://paulislava.space/#person'));
  assert.equal(JSON.stringify(graph).includes('aggregateRating'), false);
  assert.equal(JSON.stringify(graph).includes('price'), false);
});

test('news dates match the visible publication date and project screenshots keep real URLs', () => {
  const news = seo.newsJsonLd({ ...article, projects: [] });
  assert.equal(news.datePublished, '2026-09-29T12:00:00.000Z');
  assert.equal(news.dateModified, '2026-10-23T12:00:00.000Z');
  const project = seo.projectJsonLd({ ...article, shortDescription: 'Кейс', url: 'https://example.com', githubUrl: null, screenshots: [media], featured: false });
  assert.equal(project['@id'], 'https://paulislava.space/projects/test#project');
  assert.equal(project.image[0].url, 'https://paulislava.space/uploads/real-cover.jpg');
});

test('home connects its ItemList using a relationship accepting Thing values', () => {
  const graph = seo.homePageJsonLd([{ title: 'Кейс', slug: 'case' }])['@graph'];
  const profile = graph.find(n => n['@type'] === 'ProfilePage');
  assert.equal(profile.mentions?.['@id'], 'https://paulislava.space/#projects');
  assert.equal(graph.find(n => n['@type'] === 'ItemList').itemListElement[0].item['@id'], 'https://paulislava.space/projects/case#project');
});

test('hidden card covers are not presented as the main image displayed on a detail page', () => {
  const hidden = seo.articlePageJsonLd({ ...article, showCoverOnPage: false, pageCover: null })['@graph'].find(n => n['@type'] === 'WebPage');
  assert.equal(hidden.primaryImageOfPage, undefined);
  const shown = seo.articlePageJsonLd({ ...article, showCoverOnPage: false, pageCover: { ...media, url: '/uploads/page-cover.jpg' } })['@graph'].find(n => n['@type'] === 'WebPage');
  assert.equal(shown.primaryImageOfPage.url, 'https://paulislava.space/uploads/page-cover.jpg');
});

test('Strapi pre-publication edits are not emitted as updates older than publication', () => {
  assert.equal(seo.articleJsonLd({ ...article, updatedAt: '2026-09-30T12:00:00.000Z' }).dateModified, undefined);
  assert.equal(seo.articleJsonLd({ ...article, updatedAt: article.publishedAt }).dateModified, '2026-10-01T12:00:00.000Z');
});

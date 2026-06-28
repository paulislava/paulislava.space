export interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
  category?: string;
}

export interface RssFeedMeta {
  title: string;
  link: string;
  description: string;
}

export function buildRssFeed(items: RssItem[], meta: RssFeedMeta): string {
  const itemsXml = items
    .map(
      (item) => `
  <item>
    <title><![CDATA[${item.title}]]></title>
    <link>${item.link}</link>
    <description><![CDATA[${item.description}]]></description>
    <pubDate>${item.pubDate}</pubDate>
    <guid isPermaLink="true">${item.guid}</guid>
    ${item.category ? `<category>${item.category}</category>` : ''}
  </item>`,
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${meta.title}]]></title>
    <link>${meta.link}</link>
    <description><![CDATA[${meta.description}]]></description>
    <language>ru</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${meta.link}" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`;
}

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getArticles, getArticleBySlug, mediaUrl } from '@/lib/strapi';
import RichText from '@/components/ui/RichText';
import Tag from '@/components/ui/Tag';
import ArticleSections from '@/components/ui/ArticleSections';
import RelatedArticles from '@/components/ui/RelatedArticles';
import SeriesNavigation from '@/components/ui/SeriesNavigation';
import { formatDate } from '@/lib/utils';
import { absoluteUrl, articleJsonLd } from '@/lib/seo';

interface PageProps { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  try {
    const articles = await getArticles(100);
    return articles.map((a) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    alternates: { canonical: absoluteUrl(`/articles/${article.slug}`) },
    openGraph: {
      type: 'article',
      url: absoluteUrl(`/articles/${article.slug}`),
      title: article.title,
      description: article.excerpt ?? undefined,
      images: article.cover ? [{ url: article.cover.url }] : [],
      publishedTime: article.publishedAt,
      authors: ['Павел Кондратов'],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const cover = mediaUrl(article.cover, 'large') ?? mediaUrl(article.cover);
  const relatedArticles = article.relatedArticles ?? [];
  const series = article.series ?? null;
  const orderInSeries = article.orderInSeries ?? null;

  return (
    <main className="pt-20">
      {cover && (
        <div className="relative h-64">
          <Image src={cover} alt={article.title} fill className="object-cover opacity-40" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
        </div>
      )}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/articles" className="text-sm text-[#6366f1] hover:text-[#06b6d4] transition-colors mb-8 flex items-center gap-1.5 font-mono w-fit">
          ← Назад к статьям
        </Link>
        <p className="text-[#94a3b8] text-sm mb-3 font-mono">{formatDate(article.publishedAt ?? article.createdAt)}</p>
        <h1 className="text-4xl md:text-5xl font-bold text-[#f1f5f9] mb-5 leading-tight">{article.title}</h1>
        {article.excerpt && (
          <p className="text-[#94a3b8] text-xl mb-8 leading-relaxed max-w-2xl">{article.excerpt}</p>
        )}
        <div className="mb-12 pb-8 border-b border-white/5 space-y-3">
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Link key={tag.documentId} href={`/articles?tag=${tag.slug}`}>
                  <Tag tag={tag} size="md" />
                </Link>
              ))}
            </div>
          )}
          {article.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {article.technologies.map((tech) => (
                <Link
                  key={tech.documentId}
                  href={`/articles?tech=${tech.slug}`}
                  className="text-xs text-[#6366f1] bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-lg px-2.5 py-1 hover:bg-[#6366f1]/20 transition-colors"
                >
                  {tech.name}
                </Link>
              ))}
            </div>
          )}
        </div>
        <RichText blocks={article.content} />
        {article.mainContent && article.mainContent.length > 0 && (
          <ArticleSections sections={article.mainContent} />
        )}
        {series && (
          <SeriesNavigation series={series} currentSlug={slug} orderInSeries={orderInSeries} />
        )}
        <RelatedArticles articles={relatedArticles} />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(article)) }}
      />
    </main>
  );
}

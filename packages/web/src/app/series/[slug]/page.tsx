import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAllArticleSeries, getArticleSeriesBySlug, mediaUrl } from '@/lib/strapi';
import { formatDate } from '@/lib/utils';

interface PageProps { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  try {
    const seriesList = await getAllArticleSeries();
    return seriesList.map((s) => ({ slug: s.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const series = await getArticleSeriesBySlug(slug);
  if (!series) return {};
  return {
    title: series.title,
    description: series.description ?? `Цикл статей: ${series.title}`,
  };
}

export const revalidate = 1800;

export default async function SeriesPage({ params }: PageProps) {
  const { slug } = await params;
  const series = await getArticleSeriesBySlug(slug);
  if (!series) notFound();

  return (
    <main className="pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <Link
          href="/series"
          className="text-sm text-[#6366f1] hover:text-[#06b6d4] transition-colors mb-8 flex items-center gap-1.5 font-mono w-fit"
        >
          ← Все циклы
        </Link>

        <div className="mb-12">
          <p className="text-xs text-[#6366f1] font-mono uppercase tracking-wider mb-2">Цикл статей</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#f1f5f9] mb-4">{series.title}</h1>
          {series.description && (
            <p className="text-[#94a3b8] text-lg max-w-2xl">{series.description}</p>
          )}
          <p className="text-sm text-[#475569] font-mono mt-3">
            {series.articles.length} {series.articles.length === 1 ? 'статья' : series.articles.length < 5 ? 'статьи' : 'статей'}
          </p>
        </div>

        <ol className="space-y-4">
          {series.articles.map((article, idx) => {
            const cover = mediaUrl(article.cover, 'medium') ?? mediaUrl(article.cover);
            return (
              <li key={article.documentId}>
                <Link
                  href={`/articles/${article.slug}`}
                  className="group flex items-center gap-5 glass rounded-2xl overflow-hidden hover:border-[#06b6d4]/40 transition-all duration-300 hover:-translate-y-0.5 p-4"
                >
                  <span className="text-3xl font-bold text-[#6366f1]/30 font-mono w-10 text-center shrink-0 group-hover:text-[#6366f1]/60 transition-colors">
                    {idx + 1}
                  </span>
                  {cover && (
                    <div className="relative w-20 h-14 shrink-0 rounded-lg overflow-hidden bg-[#12121a] hidden sm:block">
                      <Image
                        src={cover}
                        alt={article.title}
                        fill
                        className="object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-[#f1f5f9] group-hover:text-[#06b6d4] transition-colors line-clamp-1">
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="text-[#94a3b8] text-sm mt-1 line-clamp-2">{article.excerpt}</p>
                    )}
                    {article.publishedAt && (
                      <p className="text-xs text-[#475569] font-mono mt-1">{formatDate(article.publishedAt)}</p>
                    )}
                  </div>
                  <span className="text-[#6366f1] shrink-0 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </main>
  );
}

import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAllArticleSeries, mediaUrl } from '@/lib/strapi';
import { DEFAULT_ARTICLE_COVER } from '@/lib/default-covers';

export const metadata: Metadata = {
  title: 'Циклы статей',
  description: 'Серии статей, объединённые по темам',
};

export const revalidate = 1800;

export default async function SeriesListPage() {
  const seriesList = await getAllArticleSeries();

  return (
    <main className="pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-[#f1f5f9] mb-4">
          <span className="text-[#6366f1]">#</span> Циклы статей
        </h1>
        <p className="text-[#94a3b8] text-lg mb-12">Серии статей, объединённые одной темой</p>

        {seriesList.length === 0 ? (
          <p className="text-[#94a3b8]">Пока нет ни одного цикла.</p>
        ) : (
          <div className="space-y-8">
            {seriesList.map((series) => {
              const firstCover = series.articles.find((a) => a.cover)?.cover;
              const cover = mediaUrl(firstCover, 'medium') ?? mediaUrl(firstCover) ?? DEFAULT_ARTICLE_COVER;
              return (
                <Link
                  key={series.documentId}
                  href={`/series/${series.slug}`}
                  className="group block glass rounded-2xl overflow-hidden hover:border-[#6366f1]/40 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="flex items-stretch">
                    <div className="relative w-48 shrink-0 hidden sm:block bg-[#12121a]">
                      <Image
                        src={cover}
                        alt={series.title}
                        fill
                        className="object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0f]/60" />
                    </div>
                    <div className="p-6 flex-1">
                      <p className="text-xs text-[#6366f1] font-mono uppercase tracking-wider mb-1">
                        {series.articles.length} {series.articles.length === 1 ? 'статья' : series.articles.length < 5 ? 'статьи' : 'статей'}
                      </p>
                      <h2 className="text-xl font-bold text-[#f1f5f9] mb-2 group-hover:text-[#06b6d4] transition-colors">
                        {series.title}
                      </h2>
                      {series.description && (
                        <p className="text-[#94a3b8] text-sm mb-4 line-clamp-2">{series.description}</p>
                      )}
                      <ol className="space-y-1">
                        {series.articles.slice(0, 3).map((article, idx) => (
                          <li key={article.documentId} className="flex items-center gap-2 text-sm text-[#64748b]">
                            <span className="font-mono text-xs">{idx + 1}.</span>
                            <span className="line-clamp-1">{article.title}</span>
                          </li>
                        ))}
                        {series.articles.length > 3 && (
                          <li className="text-xs text-[#475569] font-mono pl-5">
                            + ещё {series.articles.length - 3}
                          </li>
                        )}
                      </ol>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

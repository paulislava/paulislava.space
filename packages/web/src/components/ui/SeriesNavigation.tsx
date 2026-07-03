import Link from 'next/link';
import { ArticleSeries } from '@/lib/strapi-types';

interface SeriesNavigationProps {
  series: ArticleSeries;
  currentSlug: string;
  orderInSeries: number | null;
}

export default function SeriesNavigation({ series, currentSlug, orderInSeries }: SeriesNavigationProps) {
  const articles = series.articles ?? [];
  const currentIndex = orderInSeries != null
    ? articles.findIndex((a) => a.slug === currentSlug) !== -1
      ? orderInSeries - 1
      : articles.findIndex((a) => a.slug === currentSlug)
    : articles.findIndex((a) => a.slug === currentSlug);

  const prev = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const next = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;

  return (
    <section className="mt-12 rounded-2xl border border-[#6366f1]/20 bg-[#6366f1]/5 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[#6366f1] text-lg">◎</span>
        <div>
          <p className="text-xs text-[#6366f1] font-mono uppercase tracking-wider">Цикл статей</p>
          <Link
            href={`/series/${series.slug}`}
            className="text-lg font-bold text-[#f1f5f9] hover:text-[#06b6d4] transition-colors"
          >
            {series.title}
          </Link>
        </div>
        <span className="ml-auto text-xs text-[#94a3b8] font-mono">
          {currentIndex + 1} / {articles.length}
        </span>
      </div>

      {series.description && (
        <p className="text-[#94a3b8] text-sm mb-5">{series.description}</p>
      )}

      <ol className="space-y-1.5 mb-6">
        {articles.map((article, idx) => {
          const isCurrent = article.slug === currentSlug;
          return (
            <li key={article.documentId}>
              <Link
                href={`/articles/${article.slug}`}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  isCurrent
                    ? 'bg-[#6366f1]/20 text-[#f1f5f9] font-medium cursor-default pointer-events-none'
                    : 'text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-white/5'
                }`}
              >
                <span className={`font-mono text-xs w-5 text-right shrink-0 ${isCurrent ? 'text-[#6366f1]' : 'text-[#475569]'}`}>
                  {idx + 1}.
                </span>
                <span className="line-clamp-1">{article.title}</span>
                {isCurrent && <span className="ml-auto text-[#6366f1] text-xs">← вы здесь</span>}
              </Link>
            </li>
          );
        })}
      </ol>

      <div className="flex gap-3">
        {prev ? (
          <Link
            href={`/articles/${prev.slug}`}
            className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-[#94a3b8] hover:text-[#f1f5f9] hover:border-[#6366f1]/40 transition-all text-sm"
          >
            <span className="text-[#6366f1]">←</span>
            <span className="line-clamp-1">{prev.title}</span>
          </Link>
        ) : <div className="flex-1" />}
        {next ? (
          <Link
            href={`/articles/${next.slug}`}
            className="flex-1 flex items-center justify-end gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-[#94a3b8] hover:text-[#f1f5f9] hover:border-[#6366f1]/40 transition-all text-sm"
          >
            <span className="line-clamp-1 text-right">{next.title}</span>
            <span className="text-[#6366f1]">→</span>
          </Link>
        ) : <div className="flex-1" />}
      </div>
    </section>
  );
}

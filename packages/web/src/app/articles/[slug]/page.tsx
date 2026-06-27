import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getArticles, getArticleBySlug, mediaUrl } from '@/lib/strapi';
import RichText from '@/components/ui/RichText';
import Tag from '@/components/ui/Tag';
import { formatDate } from '@/lib/utils';

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
    openGraph: { images: article.cover ? [{ url: article.cover.url }] : [] },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const cover = mediaUrl(article.cover, 'large') ?? mediaUrl(article.cover);

  return (
    <main className="min-h-screen pt-20">
      {cover && (
        <div className="relative h-64">
          <Image src={cover} alt={article.title} fill className="object-cover opacity-40" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
        </div>
      )}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/#articles" className="text-sm text-[#6366f1] hover:text-[#06b6d4] transition-colors mb-6 block font-mono">
          ← Назад к статьям
        </Link>
        <p className="text-[#94a3b8] text-sm mb-2">{formatDate(article.createdAt)}</p>
        <h1 className="text-3xl md:text-4xl font-bold text-[#f1f5f9] mb-4">{article.title}</h1>
        {article.excerpt && (
          <p className="text-[#94a3b8] text-lg mb-6 leading-relaxed">{article.excerpt}</p>
        )}
        <div className="flex flex-wrap gap-2 mb-8">
          {article.tags.map((tag) => <Tag key={tag.documentId} tag={tag} size="md" />)}
          {article.technologies.map((tech) => (
            <span key={tech.documentId} className="text-xs text-[#6366f1] bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-lg px-2.5 py-1">
              {tech.name}
            </span>
          ))}
        </div>
        <div className="glass rounded-2xl p-8">
          <RichText blocks={article.content} />
        </div>
      </div>
    </main>
  );
}

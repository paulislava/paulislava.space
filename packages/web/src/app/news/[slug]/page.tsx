import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getNewsItems, getNewsBySlug, mediaUrl } from '@/lib/strapi';
import RichText from '@/components/ui/RichText';
import Tag from '@/components/ui/Tag';
import { formatDate } from '@/lib/utils';

interface PageProps { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  try {
    const news = await getNewsItems(100);
    return news.map((n) => ({ slug: n.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.excerpt ?? undefined,
    openGraph: { images: item.cover ? [{ url: item.cover.url }] : [] },
  };
}

export default async function NewsPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) notFound();

  const cover = mediaUrl(item.cover, 'large') ?? mediaUrl(item.cover);

  return (
    <main className="min-h-screen pt-20">
      {cover && (
        <div className="relative h-64">
          <Image src={cover} alt={item.title} fill className="object-cover opacity-40" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
        </div>
      )}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/#articles" className="text-sm text-[#6366f1] hover:text-[#06b6d4] transition-colors mb-6 block font-mono">
          ← Назад к новостям
        </Link>
        <p className="text-[#94a3b8] text-sm mb-2">{formatDate(item.createdAt)}</p>
        <h1 className="text-3xl md:text-4xl font-bold text-[#f1f5f9] mb-4">{item.title}</h1>
        {item.excerpt && (
          <p className="text-[#94a3b8] text-lg mb-6 leading-relaxed">{item.excerpt}</p>
        )}
        <div className="flex flex-wrap gap-2 mb-4">
          {item.tags.map((tag) => <Tag key={tag.id} tag={tag} size="md" />)}
        </div>
        {item.projects.length > 0 && (
          <div className="mb-8">
            <p className="text-xs text-[#94a3b8] font-mono uppercase tracking-wide mb-2">Проекты</p>
            <div className="flex flex-wrap gap-2">
              {item.projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.slug}`}
                  className="text-sm text-[#6366f1] hover:text-[#06b6d4] transition-colors underline"
                >
                  {p.title}
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className="glass rounded-2xl p-8">
          <RichText blocks={item.content} />
        </div>
      </div>
    </main>
  );
}

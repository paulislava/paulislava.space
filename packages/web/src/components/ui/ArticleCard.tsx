import Image from 'next/image';
import Link from 'next/link';
import { Article, NewsItem, mediaUrl } from '@/lib/strapi-types';
import Tag from './Tag';
import { formatDate } from '@/lib/utils';

interface ArticleCardProps {
  item: Article | NewsItem;
  type: 'article' | 'news';
}

export default function ArticleCard({ item, type }: ArticleCardProps) {
  const href = type === 'article' ? `/articles/${item.slug}` : `/news/${item.slug}`;
  const cover = mediaUrl(item.cover, 'medium') ?? mediaUrl(item.cover);
  return (
    <Link href={href} className="group block break-inside-avoid mb-5">
      <div className="glass rounded-2xl overflow-hidden hover:border-[#06b6d4]/40 transition-all duration-300 hover:-translate-y-1">
        <div className="relative h-36 bg-[#12121a]">
          {cover ? (
            <Image
              src={cover}
              alt={item.title}
              fill
              className="object-cover opacity-70 group-hover:opacity-90 transition-opacity"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#06b6d4]/20 to-[#6366f1]/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/80 to-transparent" />
        </div>
        <div className="p-4">
          <p className="text-xs text-[#94a3b8] mb-1">{formatDate(item.createdAt)}</p>
          <h3 className="font-semibold text-[#f1f5f9] text-sm mb-2 line-clamp-2 group-hover:text-[#06b6d4] transition-colors">
            {item.title}
          </h3>
          {item.excerpt && (
            <p className="text-[#94a3b8] text-xs line-clamp-2 mb-2">{item.excerpt}</p>
          )}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 2).map((tag) => <Tag key={tag.documentId} tag={tag} />)}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

import { Tag as TagType } from '@/lib/strapi-types';

interface TagProps {
  tag: Pick<TagType, 'name' | 'color'>;
  size?: 'sm' | 'md';
}

export default function Tag({ tag, size = 'sm' }: TagProps) {
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span
      className={`inline-block rounded-full font-medium ${padding}`}
      style={{
        color: tag.color,
        background: `${tag.color}20`,
        border: `1px solid ${tag.color}40`,
      }}
    >
      {tag.name}
    </span>
  );
}

import Image from 'next/image';
import { RichTextBlock } from '@/lib/strapi-types';

interface RichTextProps {
  blocks: RichTextBlock[];
  className?: string;
}

function renderChildren(children: RichTextBlock['children']): React.ReactNode {
  return children.map((child, i) => {
    if (child.type === 'text') {
      let node: React.ReactNode = child.text ?? '';
      if (child.code) node = <code key={i} className="bg-[#0f172a] text-[#06b6d4] px-1.5 py-0.5 rounded text-sm font-mono">{node}</code>;
      if (child.bold) node = <strong key={i}>{node}</strong>;
      if (child.italic) node = <em key={i}>{node}</em>;
      if (child.underline) node = <u key={i}>{node}</u>;
      if (child.strikethrough) node = <s key={i}>{node}</s>;
      return node;
    }
    if (child.type === 'link') {
      return (
        <a
          key={i}
          href={child.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#6366f1] hover:text-[#06b6d4] underline transition-colors"
        >
          {renderChildren(child.children ?? [])}
        </a>
      );
    }
    return null;
  });
}

export default function RichText({ blocks, className = '' }: RichTextProps) {
  return (
    <div className={`max-w-none ${className}`}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <p key={i} className="text-[#b0bec5] text-[1.05rem] leading-[1.85] mb-6">
                {renderChildren(block.children)}
              </p>
            );
          case 'heading': {
            const level = block.level ?? 2;
            const HTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
            const styles: Record<number, string> = {
              1: 'text-3xl md:text-4xl font-bold text-[#f1f5f9] mb-4 mt-12',
              2: 'text-2xl md:text-3xl font-bold text-[#f1f5f9] mb-3 mt-10',
              3: 'text-xl font-semibold text-[#e2e8f0] mb-3 mt-8',
              4: 'text-lg font-semibold text-[#e2e8f0] mb-2 mt-6',
              5: 'text-base font-semibold text-[#cbd5e1] mb-2 mt-4',
              6: 'text-sm font-semibold text-[#94a3b8] mb-2 mt-4',
            };
            return (
              <HTag key={i} className={styles[level] ?? styles[2]}>
                {renderChildren(block.children)}
              </HTag>
            );
          }
          case 'list': {
            const isOrdered = block.format === 'ordered';
            const ListTag = isOrdered ? 'ol' : 'ul';
            return (
              <ListTag
                key={i}
                className={`${isOrdered ? 'list-decimal' : 'list-disc'} pl-6 text-[#b0bec5] text-[1.05rem] mb-6 space-y-2 leading-relaxed`}
              >
                {block.children.map((item, j) => (
                  <li key={j}>{renderChildren(item.children ?? [])}</li>
                ))}
              </ListTag>
            );
          }
          case 'code':
            return (
              <pre key={i} className="bg-[#0d1117] border border-white/5 rounded-xl p-5 font-mono text-sm text-[#7dd3fc] overflow-x-auto mb-6 leading-relaxed">
                <code>{renderChildren(block.children)}</code>
              </pre>
            );
          case 'quote':
            return (
              <blockquote
                key={i}
                className="border-l-2 border-[#6366f1] pl-6 my-8 text-[#94a3b8] italic text-lg leading-relaxed"
              >
                {renderChildren(block.children)}
              </blockquote>
            );
          case 'image': {
            const img = block.image;
            if (!img?.url) return null;
            return (
              <div key={i} className="my-8 rounded-xl overflow-hidden">
                <Image
                  src={img.url}
                  alt={img.alternativeText ?? ''}
                  width={img.width ?? 800}
                  height={img.height ?? 450}
                  className="w-full object-cover"
                />
              </div>
            );
          }
          case 'divider':
            return <hr key={i} className="border-white/5 my-10" />;
          default:
            return null;
        }
      })}
    </div>
  );
}

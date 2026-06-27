import { RichTextBlock } from '@/lib/strapi-types';

interface RichTextProps {
  blocks: RichTextBlock[];
  className?: string;
}

function renderChildren(children: RichTextBlock['children']): React.ReactNode {
  return children.map((child, i) => {
    if (child.type === 'text') {
      let node: React.ReactNode = child.text ?? '';
      if (child.bold) node = <strong key={i}>{node}</strong>;
      if (child.italic) node = <em key={i}>{node}</em>;
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
    <div className={`prose prose-invert max-w-none ${className}`}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <p key={i} className="text-[#94a3b8] leading-relaxed mb-4">
                {renderChildren(block.children)}
              </p>
            );
          case 'heading': {
            const level = block.level ?? 2;
            const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
            const sizes: Record<number, string> = {
              1: 'text-3xl', 2: 'text-2xl', 3: 'text-xl', 4: 'text-lg', 5: 'text-base', 6: 'text-sm',
            };
            return (
              <Tag key={i} className={`${sizes[level] ?? 'text-xl'} font-bold text-[#f1f5f9] mb-3 mt-6`}>
                {renderChildren(block.children)}
              </Tag>
            );
          }
          case 'list':
            return (
              <ul key={i} className="list-disc list-inside text-[#94a3b8] mb-4 space-y-1">
                {block.children.map((item, j) => (
                  <li key={j}>{renderChildren(item.children ?? [])}</li>
                ))}
              </ul>
            );
          case 'code':
            return (
              <pre key={i} className="glass rounded-lg p-4 font-mono text-sm text-[#06b6d4] overflow-x-auto mb-4">
                {renderChildren(block.children)}
              </pre>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

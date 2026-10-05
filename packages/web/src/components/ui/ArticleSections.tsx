import type { ArticleSection, MdxSection, FaqSection } from '@/lib/strapi-types';

function MdxSectionView({ section }: { section: MdxSection }) {
  return (
    <div className="my-8">
      {section.title && (
        <h2 className="text-2xl font-bold text-[#f1f5f9] mb-4">{section.title}</h2>
      )}
      <pre className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 text-[#94a3b8] text-sm font-mono whitespace-pre-wrap overflow-x-auto">
        {section.content}
      </pre>
    </div>
  );
}

function FaqSectionView({ section }: { section: FaqSection }) {
  return (
    <div className="my-8">
      {section.title && (
        <h2 className="text-2xl font-bold text-[#f1f5f9] mb-6">{section.title}</h2>
      )}
      <div className="space-y-3">
        {(section.items ?? []).filter((item): item is NonNullable<typeof item> => item !== null).map((item, i) => (
          <details
            key={i}
            className="group glass rounded-xl border border-[#1e293b] open:border-[#6366f1]/30"
          >
            <summary className="cursor-pointer px-6 py-4 text-[#e2e8f0] font-medium list-none flex justify-between items-center gap-4">
              {item.question}
              <span className="text-[#6366f1] text-lg shrink-0 group-open:rotate-45 transition-transform duration-200">+</span>
            </summary>
            <p className="px-6 pb-4 text-[#94a3b8] leading-relaxed">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

export default function ArticleSections({ sections }: { sections: ArticleSection[] }) {
  if (!sections.length) return null;
  return (
    <div className="mt-8 border-t border-[#1e293b] pt-8">
      {sections.map((section, i) => {
        switch (section.__typename) {
          case 'ComponentSectionsMdxSection':
            return <MdxSectionView key={i} section={section} />;
          case 'ComponentSectionsFaqSection':
            return <FaqSectionView key={i} section={section} />;
        }
      })}
    </div>
  );
}

import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Project } from '@/lib/strapi-types';
import RichText from '@/components/ui/RichText';
import Tag from '@/components/ui/Tag';
import ProjectScreenshots from '@/app/projects/[slug]/ProjectScreenshots';

interface ProjectCaseStudyProps {
  project: Project;
}

function buildFaqItems(project: Project) {
  const technologyAnswer = project.technologies.length > 0
    ? project.technologies.map((technology) => technology.name).join(', ')
    : 'Стек на этой странице будет дополнен по мере публикации материалов проекта.';

  const shortDescription = project.shortDescription?.trim();
  const taskAnswer = shortDescription
    ?? 'Подробная постановка задачи ещё не вынесена в CMS, но кейс будет пополняться по мере обновления проекта.';

  const roleAnswer = project.description?.length > 0
    ? 'На странице уже собраны описание решения, стек и итоговые материалы, чтобы показать вклад Павла через результат проекта.'
    : 'Роль Павла будет уточняться по мере пополнения CMS, а пока кейс фиксирует общий контекст и использованный стек.';

  return [
    {
      question: 'Какие технологии использовались?',
      answer: technologyAnswer,
    },
    {
      question: 'Какую задачу решал проект?',
      answer: taskAnswer,
    },
    {
      question: 'Какая была роль Павла?',
      answer: roleAnswer,
    },
  ];
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-white/10 pt-8">
      <h2 className="text-2xl font-bold text-[#f1f5f9] mb-4">{title}</h2>
      {children}
    </section>
  );
}

export default function ProjectCaseStudy({ project }: ProjectCaseStudyProps) {
  const faqItems = buildFaqItems(project);
  const shortDescription = project.shortDescription?.trim();
  const hasNarrative = project.description?.length > 0;
  const hasMeta = project.tags.length > 0 || project.technologies.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-6 pt-6 pb-12">
      {hasMeta && (
        <div className="flex flex-wrap gap-2 max-w-3xl mb-4">
          {project.tags.map((tag) => (
            <Link key={tag.documentId} href={`/projects?tag=${tag.slug}`}>
              <Tag tag={tag} size="md" />
            </Link>
          ))}
          {project.technologies.map((technology) => (
            <Link
              key={technology.documentId}
              href={`/projects?tech=${technology.slug}`}
              className="text-xs text-[#f1f5f9] bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 hover:border-[#6366f1]/40 hover:bg-[#6366f1]/10 transition-colors"
            >
              {technology.name}
            </Link>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-4 items-center mb-10">
        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-[#6366f1] text-white text-sm font-semibold hover:bg-[#4f46e5] transition-colors"
          >
            Открыть сайт →
          </a>
        )}
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl glass text-[#f1f5f9] text-sm font-semibold hover:border-[#6366f1]/40 transition-colors"
          >
            GitHub →
          </a>
        )}
      </div>

      <div className="max-w-4xl space-y-8">
        <Section title="Контекст и задача">
          <p className="text-[#cbd5e1] text-base leading-7">
            {shortDescription ?? 'Кейс будет дополнен подробным контекстом по мере публикации материалов проекта.'}
          </p>
        </Section>

        <Section title="Решение">
          {hasNarrative ? (
            <RichText blocks={project.description} />
          ) : (
            <p className="text-[#94a3b8] text-base leading-7">
              Подробное описание решения ещё не опубликовано в CMS. Сейчас страница фиксирует ключевой контекст,
              стек и материалы проекта, чтобы кейс уже можно было использовать как точку входа.
            </p>
          )}
        </Section>

        <Section title="Технологический стек">
          {project.technologies.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((technology) => (
                <Link
                  key={technology.documentId}
                  href={`/projects?tech=${technology.slug}`}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#e2e8f0] hover:border-[#6366f1]/40 hover:bg-[#6366f1]/10 transition-colors"
                >
                  {technology.name}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-[#94a3b8] text-base leading-7">
              Стек проекта будет уточняться по мере пополнения материалов в CMS.
            </p>
          )}

          {project.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <Link key={tag.documentId} href={`/projects?tag=${tag.slug}`}>
                  <Tag tag={tag} />
                </Link>
              ))}
            </div>
          )}
        </Section>

        {project.screenshots?.length > 0 && (
          <Section title="Скриншоты">
            <ProjectScreenshots screenshots={project.screenshots} />
          </Section>
        )}

        {!hasNarrative && (
          <Section title="FAQ">
            <div className="space-y-4">
              {faqItems.map((item) => (
                <div key={item.question} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-base font-semibold text-[#f1f5f9]">{item.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#94a3b8]">{item.answer}</p>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

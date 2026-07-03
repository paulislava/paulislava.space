import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Project } from '@/lib/strapi-types';
import RichText from '@/components/ui/RichText';
import Tag from '@/components/ui/Tag';
import ProjectScreenshots from '@/app/projects/[slug]/ProjectScreenshots';

interface ProjectCaseStudyProps {
  project: Project;
}

function buildRelatedTopics(project: Project) {
  return [
    ...project.technologies.map((technology) => technology.name),
    ...project.tags.map((tag) => tag.name),
  ].slice(0, 6);
}

function buildFaqItems(project: Project) {
  const technologyAnswer = project.technologies.length > 0
    ? project.technologies.map((technology) => technology.name).join(', ')
    : 'Стек на этой странице будет дополнен по мере публикации материалов проекта.';

  const taskAnswer = project.shortDescription
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
  const relatedTopics = buildRelatedTopics(project);
  const faqItems = buildFaqItems(project);
  const hasNarrative = project.description?.length > 0;
  const hasMeta = project.tags.length > 0 || project.technologies.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-6 pt-6 pb-12">
      {hasMeta && (
        <div className="flex flex-wrap gap-2 max-w-3xl mb-4">
          {project.tags.map((tag) => <Tag key={tag.documentId} tag={tag} size="md" />)}
          {project.technologies.map((technology) => (
            <span
              key={technology.documentId}
              className="text-xs text-[#f1f5f9] bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5"
            >
              {technology.name}
            </span>
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

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">
        <div className="space-y-8">
          <Section title="Контекст и задача">
            <p className="text-[#cbd5e1] text-base leading-7">
              {project.shortDescription ?? 'Кейс будет дополнен подробным контекстом по мере публикации материалов проекта.'}
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
                  <span
                    key={technology.documentId}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#e2e8f0]"
                  >
                    {technology.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[#94a3b8] text-base leading-7">
                Стек проекта будет уточняться по мере пополнения материалов в CMS.
              </p>
            )}

            {project.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {project.tags.map((tag) => <Tag key={tag.documentId} tag={tag} />)}
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

        <aside className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[#6366f1] mb-3">Case Study</p>
            <h2 className="text-xl font-bold text-[#f1f5f9] mb-3">Связанные статьи</h2>
            <p className="text-sm leading-6 text-[#94a3b8]">
              На этой странице будут отображаться статьи по тем же темам и технологиям.
              {relatedTopics.length > 0 ? ` В первую очередь сюда подтянутся материалы по ${relatedTopics.join(', ')}.` : ''}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {relatedTopics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-lg border border-white/10 bg-[#0f172a]/60 px-2.5 py-1.5 text-xs text-[#cbd5e1]"
                >
                  {topic}
                </span>
              ))}
            </div>
            <Link
              href="/articles"
              className="mt-5 inline-flex text-sm font-semibold text-[#06b6d4] transition-colors hover:text-[#67e8f9]"
            >
              Перейти к статьям →
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}

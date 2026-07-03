import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Experience from '@/components/sections/Experience';
import Skills from '@/components/sections/Skills';
import Projects from '@/components/sections/Projects';
import ArticlesNews from '@/components/sections/ArticlesNews';
import {
  getWorkExperiences,
  getTechnologies,
  getFeaturedProjects,
  getArticles,
  getNewsItems,
  getProjectTags,
} from '@/lib/strapi';

export default async function HomePage() {
  const [workExperiences, technologies, featuredProjects, articles, news, projectTags] = await Promise.all([
    getWorkExperiences(),
    getTechnologies(),
    getFeaturedProjects(),
    getArticles(6),
    getNewsItems(6),
    getProjectTags(),
  ]);

  return (
    <main>
      <Hero />
      <Projects projects={featuredProjects} />
      <ArticlesNews articles={articles} news={news} />
      <About />
      <Experience workExperiences={workExperiences} />
      <Skills technologies={technologies} tags={projectTags} />
    </main>
  );
}

import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Experience from '@/components/sections/Experience';
import Skills from '@/components/sections/Skills';
import Projects from '@/components/sections/Projects';
import ArticlesNews from '@/components/sections/ArticlesNews';
import Contact from '@/components/sections/Contact';
import {
  getWorkExperiences,
  getTechnologies,
  getFeaturedProjects,
  getArticles,
  getNewsItems,
} from '@/lib/strapi';

export const dynamic = 'force-dynamic';

export default async function HomePage() {

  const [workExperiences, technologies, featuredProjects, articles, news] = await Promise.all([
    getWorkExperiences(),
    getTechnologies(),
    getFeaturedProjects(),
    getArticles(6),
    getNewsItems(6),
  ]);

  return (
    <main>
      <Hero />
      <About />
      <Experience workExperiences={workExperiences} />
      <Skills technologies={technologies} />
      <Projects projects={featuredProjects} />
      <ArticlesNews articles={articles} news={news} />
      <Contact />
    </main>
  );
}

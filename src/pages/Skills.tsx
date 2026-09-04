import { useEffect, useState } from 'react';
import { Code2, Layers, Wrench, Server, Loader2 } from 'lucide-react';
import { supabase, type PortfolioContent, type SkillCategory } from '@/lib/supabase';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const ICONS: Record<string, typeof Code2> = {
  Languages: Code2,
  Frameworks: Layers,
  'Databases & Cloud': Server,
  Tools: Wrench,
};

function pickIcon(title: string): typeof Code2 {
  return ICONS[title] ?? Code2;
}

export function Skills() {
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('portfolio_content')
      .select('*')
      .eq('id', 'main')
      .maybeSingle()
      .then(({ data }) => {
        setContent(data as PortfolioContent | null);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section id="skills" className="section-padding bg-gray-50 dark:bg-gray-900/30">
        <div className="container-max flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      </section>
    );
  }

  const categories: SkillCategory[] = content?.skill_categories ?? [];

  return (
    <section id="skills" className="section-padding bg-gray-50 dark:bg-gray-900/30">
      <div className="container-max">
        <div className="text-center">
          <h2 className="section-title">
            My <span className="gradient-text">Skills</span>
          </h2>
          <p className="section-subtitle">Technologies I work with every day</p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:gap-8">
          {categories.map((category, idx) => (
            <SkillCard key={category.title} category={category} delay={idx * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SkillCard({ category, delay }: { category: SkillCategory; delay: number }) {
  const [ref, visible] = useScrollReveal<HTMLDivElement>();
  const Icon = pickIcon(category.title);

  return (
    <div
      ref={ref}
      className={`glass-card reveal p-6 ${visible ? 'visible' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-xl font-bold">{category.title}</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {category.skills.map((skill, i) => (
          <span
            key={skill}
            className="rounded-lg border border-gray-200/80 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 transition-all hover:border-primary-400 hover:bg-primary-50 hover:text-primary-600 dark:border-gray-700/80 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:border-primary-400 dark:hover:bg-primary-900/20 dark:hover:text-primary-400"
            style={{
              transitionDelay: `${delay + i * 50}ms`,
            }}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

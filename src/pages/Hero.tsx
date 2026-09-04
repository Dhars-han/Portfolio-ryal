import { useEffect, useState } from 'react';
import { ArrowRight, Mail, FolderOpen, Sparkles, Loader2 } from 'lucide-react';
import { supabase, type PortfolioContent, type HeroStat } from '@/lib/supabase';

type HeroProps = {
  onNavigate: (page: string) => void;
};

export function Hero({ onNavigate }: HeroProps) {
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
      <section id="home" className="flex min-h-screen items-center justify-center pt-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </section>
    );
  }

  const stats: HeroStat[] = content?.hero_stats ?? [];

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16"
    >
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="container-max relative z-10 px-6 text-center md:px-12">
        {content?.hero_availability_badge && (
          <div className="animate-fade-in-down inline-flex items-center gap-2 rounded-full border border-gray-200/60 bg-white/60 px-4 py-2 text-sm font-medium text-gray-600 backdrop-blur-sm dark:border-gray-800/60 dark:bg-gray-900/60 dark:text-gray-300">
            <Sparkles className="h-4 w-4 text-accent-500" />
            {content.hero_availability_badge}
          </div>
        )}

        <h1 className="animate-fade-in-up mt-8 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
          Hi, I'm <span className="gradient-text">{content?.hero_name ?? 'Alex Carter'}</span>
        </h1>

        <p className="animate-fade-in-up mt-4 text-xl font-medium text-gray-600 dark:text-gray-300 md:text-2xl">
          {content?.hero_tagline ?? 'Full-Stack Developer & UI Engineer'}
        </p>

        <p className="animate-fade-in-up mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-500 dark:text-gray-400 md:text-lg">
          {content?.hero_intro ?? ''}
        </p>

        <div className="animate-fade-in-up mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button onClick={() => onNavigate('projects')} className="btn-primary group">
            <FolderOpen className="h-4 w-4" />
            View Projects
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
          <button onClick={() => onNavigate('contact')} className="btn-secondary group">
            <Mail className="h-4 w-4" />
            Contact Me
          </button>
        </div>

        {/* Stats */}
        {stats.length > 0 && (
          <div className="animate-fade-in-up mt-16 grid grid-cols-3 gap-4 md:gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 md:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 md:text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-gray-300 p-1.5 dark:border-gray-700">
          <div className="h-2 w-1 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500" />
        </div>
      </div>
    </section>
  );
}

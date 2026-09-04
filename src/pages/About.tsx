import { useEffect, useState } from 'react';
import { Download, GraduationCap, Briefcase, MapPin, Loader2 } from 'lucide-react';
import { supabase, type PortfolioContent } from '@/lib/supabase';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export function About() {
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [ref1, visible1] = useScrollReveal<HTMLDivElement>();
  const [ref2, visible2] = useScrollReveal<HTMLDivElement>();

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
      <section id="about" className="section-padding">
        <div className="container-max flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      </section>
    );
  }

  const bio = content?.about_bio ?? [];

  return (
    <section id="about" className="section-padding">
      <div className="container-max">
        <div className="text-center">
          <h2 className="section-title">
            About <span className="gradient-text">Me</span>
          </h2>
          <p className="section-subtitle">Get to know the person behind the code</p>
        </div>

        <div className="mt-16 grid items-center gap-12 md:grid-cols-2 lg:gap-16">
          {/* Photo */}
          <div
            ref={ref1}
            className={`reveal ${visible1 ? 'visible' : ''} relative mx-auto w-full max-w-sm`}
          >
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-gray-200/60 shadow-xl dark:border-gray-800/60">
              <img
                src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Alex Carter"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-5 -right-3 flex items-center gap-2 rounded-2xl border border-gray-200/60 bg-white px-4 py-3 shadow-lg dark:border-gray-800/60 dark:bg-gray-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600 dark:text-accent-400">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold">{content?.experience_label ?? '5+ Years'}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Experience</div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div ref={ref2} className={`reveal ${visible2 ? 'visible' : ''}`}>
            <h3 className="text-2xl font-bold">
              {content?.about_intro ?? "Hello! I'm Alex, a software engineer based in San Francisco."}
            </h3>
            <div className="mt-4 space-y-4 text-gray-600 dark:text-gray-400">
              {bio.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Quick facts */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border border-gray-200/60 px-4 py-3 dark:border-gray-800/60">
                <MapPin className="h-5 w-5 text-primary-500" />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Location</div>
                  <div className="text-sm font-semibold">{content?.location ?? 'San Francisco, CA'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-gray-200/60 px-4 py-3 dark:border-gray-800/60">
                <GraduationCap className="h-5 w-5 text-primary-500" />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Education</div>
                  <div className="text-sm font-semibold">{content?.education ?? 'B.S. Computer Science'}</div>
                </div>
              </div>
            </div>

            {/* Resume download */}
            <a
              href="/resume.pdf"
              download
              className="btn-primary mt-8 group"
              onClick={(e) => {
                e.preventDefault();
                const intro = content?.about_intro ?? '';
                const loc = content?.location ?? '';
                const edu = content?.education ?? '';
                const exp = content?.experience_label ?? '';
                const skillsText = (content?.skill_categories ?? [])
                  .map((c) => `${c.title}: ${c.skills.join(', ')}`)
                  .join('\n');
                const content2 = `Alex Carter\n${intro}\n${loc}\n\nhello@example.com | github.com/example | linkedin.com/in/example\n\nEXPERIENCE\n----------\n${exp} of professional experience\n\nSKILLS\n------\n${skillsText}\n\nEDUCATION\n---------\n${edu}`;
                const blob = new Blob([content2], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Alex_Carter_Resume.txt';
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              Download Resume
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

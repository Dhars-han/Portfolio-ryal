import { useEffect, useState } from 'react';
import { ExternalLink, Github, X, Loader2, AlertCircle, Search, Star } from 'lucide-react';
import { supabase, type Project } from '@/lib/supabase';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Project | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const [headerRef, headerVisible] = useScrollReveal<HTMLDivElement>();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (err) {
      setError('Failed to load projects. Please try again later.');
      setLoading(false);
      return;
    }
    setProjects(data ?? []);
    setLoading(false);
  };

  const allTechs = ['All', ...new Set(projects.flatMap((p) => p.tech_stack))].slice(0, 10);
  const filtered = filter === 'All' ? projects : projects.filter((p) => p.tech_stack.includes(filter));

  return (
    <section id="projects" className="section-padding">
      <div className="container-max">
        <div ref={headerRef} className={`reveal ${headerVisible ? 'visible' : ''} text-center`}>
          <h2 className="section-title">
            My <span className="gradient-text">Projects</span>
          </h2>
          <p className="section-subtitle">A selection of things I've built</p>
        </div>

        {/* Filter pills */}
        {!loading && !error && projects.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {allTechs.map((tech) => (
              <button
                key={tech}
                onClick={() => setFilter(tech)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  filter === tech
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-600/25'
                    : 'border border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-500 dark:border-gray-800 dark:text-gray-400'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="mt-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary-500" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading projects...</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="mt-20 flex flex-col items-center justify-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error-500/10 text-error-500">
              <AlertCircle className="h-7 w-7" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
            <button onClick={fetchProjects} className="btn-secondary">
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="mt-20 flex flex-col items-center justify-center gap-3">
            <Search className="h-10 w-10 text-gray-300 dark:text-gray-700" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No projects match this filter.</p>
          </div>
        )}

        {/* Projects grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project, idx) => (
              <ProjectCard
                key={project.id}
                project={project}
                delay={idx * 80}
                onClick={() => setSelected(project)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}

function ProjectCard({
  project,
  delay,
  onClick,
}: {
  project: Project;
  delay: number;
  onClick: () => void;
}) {
  const [ref, visible] = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'visible' : ''} group glass-card cursor-pointer overflow-hidden hover:shadow-xl hover:shadow-primary-500/10`}
      style={{ transitionDelay: `${delay}ms` }}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden">
        {project.image_url ? (
          <img
            src={project.image_url}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-500/20 to-accent-500/20">
            <span className="text-2xl font-bold text-gray-400">{project.title[0]}</span>
          </div>
        )}
        {project.featured && (
          <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-accent-500 px-2.5 py-1 text-xs font-semibold text-white shadow-md">
            <Star className="h-3 w-3 fill-white" />
            Featured
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="text-lg font-bold transition-colors group-hover:text-primary-600 dark:group-hover:text-primary-400">
          {project.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
          {project.description}
        </p>

        {/* Tech tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tech_stack.slice(0, 4).map((tech) => (
            <span key={tech} className="tag">
              {tech}
            </span>
          ))}
          {project.tech_stack.length > 4 && (
            <span className="tag">+{project.tech_stack.length - 4}</span>
          )}
        </div>

        {/* Links */}
        <div className="mt-5 flex items-center gap-3 border-t border-gray-200/60 pt-4 dark:border-gray-800/60">
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              <ExternalLink className="h-4 w-4" />
              Live Demo
            </a>
          )}
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <Github className="h-4 w-4" />
              Code
            </a>
          )}
          <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">Click for details</span>
        </div>
      </div>
    </div>
  );
}

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="animate-scale-in max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200/60 bg-white shadow-2xl dark:border-gray-800/60 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        {project.image_url && (
          <div className="relative h-56 overflow-hidden rounded-t-2xl sm:h-64">
            <img src={project.image_url} alt={project.title} className="h-full w-full object-cover" />
          </div>
        )}

        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              {project.featured && (
                <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-accent-500/10 px-2.5 py-1 text-xs font-semibold text-accent-600 dark:text-accent-400">
                  <Star className="h-3 w-3 fill-current" />
                  Featured
                </div>
              )}
              <h3 className="text-2xl font-bold">{project.title}</h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {project.description}
          </p>

          {project.long_description && (
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {project.long_description.split('\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}

          {/* Tech stack */}
          <div className="mt-6">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Tech Stack
            </h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {project.tech_stack.map((tech) => (
                <span key={tech} className="tag">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <ExternalLink className="h-4 w-4" />
                Live Demo
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <Github className="h-4 w-4" />
                View Source
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

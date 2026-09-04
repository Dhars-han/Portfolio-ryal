import { useEffect, useState } from 'react';
import { ThemeProvider } from '@/lib/theme';
import { AuthProvider, useAuth } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Hero } from '@/pages/Hero';
import { About } from '@/pages/About';
import { Skills } from '@/pages/Skills';
import { Projects } from '@/pages/Projects';
import { Contact } from '@/pages/Contact';
import { AdminLogin } from '@/pages/AdminLogin';
import { AdminDashboard } from '@/pages/AdminDashboard';

type Page = 'home' | 'about' | 'skills' | 'projects' | 'contact' | 'admin';

function getPageFromHash(): Page {
  const hash = window.location.hash.replace('#', '');
  const valid: Page[] = ['home', 'about', 'skills', 'projects', 'contact', 'admin'];
  return (valid.includes(hash as Page) ? hash : 'home') as Page;
}

function AppContent() {
  const [page, setPage] = useState<Page>(getPageFromHash());
  const { session, loading: authLoading } = useAuth();

  useEffect(() => {
    const onHashChange = () => setPage(getPageFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (target: string) => {
    window.location.hash = target;
    setPage(target as Page);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Admin route: show login or dashboard
  if (page === 'admin') {
    if (authLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      );
    }
    if (!session) {
      return <AdminLogin onBack={() => navigate('home')} />;
    }
    return <AdminDashboard onBack={() => navigate('home')} />;
  }

  // Public pages
  return (
    <div className="min-h-screen">
      <Navbar currentPage={page} onNavigate={navigate} />
      <main>
        {page === 'home' && (
          <>
            <Hero onNavigate={navigate} />
            <About />
            <Skills />
            <Projects />
            <Contact />
          </>
        )}
        {page === 'about' && (
          <div className="pt-16">
            <About />
            <Skills />
          </div>
        )}
        {page === 'skills' && (
          <div className="pt-16">
            <Skills />
          </div>
        )}
        {page === 'projects' && (
          <div className="pt-16">
            <Projects />
          </div>
        )}
        {page === 'contact' && (
          <div className="pt-16">
            <Contact />
          </div>
        )}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

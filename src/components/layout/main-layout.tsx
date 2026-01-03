'use client';

import { Header } from '@/components/navigation/header';
import { Footer } from '@/components/layout/footer';
import { ErrorBoundary } from '@/components/ui/error-boundary';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Global Background Ambience */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-3xl opacity-50" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/5 blur-3xl opacity-50" />
      </div>

      <Header />
      <main className="flex-1 relative z-10">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}

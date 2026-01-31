'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import { Navigation } from './Navigation';
import { SplashScreen } from './SplashScreen';
import { DemoTour, useDemoTour } from './DemoTour';

interface DemoContextType {
  openDemo: () => void;
}

const DemoContext = createContext<DemoContextType>({ openDemo: () => {} });

export const useDemo = () => useContext(DemoContext);

export function AppShell({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { isOpen, openDemo, closeDemo, completeDemo } = useDemoTour();
  const pathname = usePathname();

  // Hide shell UI on landing page
  const isLandingPage = pathname === '/landing';

  useEffect(() => {
    setMounted(true);
    // Check if already seen (persists forever, not just session)
    const hasSeenSplash = localStorage.getItem('hasSeenSplash');
    if (hasSeenSplash) {
      setShowSplash(false);
    }
  }, []);

  // Landing page gets clean slate - no app shell
  if (isLandingPage) {
    return <>{children}</>;
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <DemoContext.Provider value={{ openDemo }}>
        <div className="min-h-screen mesh-bg">
          <Navigation />
          <main className="pt-20 pb-12">{children}</main>
        </div>
      </DemoContext.Provider>
    );
  }

  return (
    <DemoContext.Provider value={{ openDemo }}>
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}
      <div
        className={`min-h-screen mesh-bg transition-opacity duration-500 ${
          showSplash ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <Navigation />
        <main className="pt-20 pb-12">{children}</main>
      </div>

      {/* Demo Tour Modal */}
      <DemoTour
        isOpen={isOpen}
        onClose={closeDemo}
        onComplete={completeDemo}
      />
    </DemoContext.Provider>
  );
}

'use client';

import { useState, useEffect, createContext, useContext } from 'react';
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

  useEffect(() => {
    setMounted(true);
    // Check if already seen in session
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (hasSeenSplash) {
      setShowSplash(false);
    }
  }, []);

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

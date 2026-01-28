'use client';

import { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { SplashScreen } from './SplashScreen';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [mounted, setMounted] = useState(false);

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
      <div className="min-h-screen mesh-bg">
        <Navigation />
        <main className="pt-20 pb-12">{children}</main>
      </div>
    );
  }

  return (
    <>
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
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Check if user has seen splash before (persists forever)
    const hasSeenSplash = localStorage.getItem('hasSeenSplash');
    if (hasSeenSplash) {
      onComplete();
      return;
    }

    const timers = [
      setTimeout(() => setPhase(1), 300),   // Logo appears
      setTimeout(() => setPhase(2), 800),   // Text appears
      setTimeout(() => setPhase(3), 1500),  // Stats animate
      setTimeout(() => setPhase(4), 2800),  // Fade out begins
      setTimeout(() => {
        localStorage.setItem('hasSeenSplash', 'true');
        onComplete();
      }, 3500),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase < 5 && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === 4 ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0a0f1a 0%, #111827 50%, #0d1520 100%)',
          }}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(38, 245, 218, 0.5) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(38, 245, 218, 0.5) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px',
              }}
            />

            {/* Floating particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-[var(--color-turquoise-400)]"
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                  y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                  opacity: 0,
                  scale: 0,
                }}
                animate={{
                  y: [null, Math.random() * -200 - 100],
                  opacity: [0, 0.6, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            ))}

            {/* Radial glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: phase >= 1 ? 0.4 : 0, scale: 1.2 }}
              transition={{ duration: 1.5 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(38, 245, 218, 0.15) 0%, transparent 70%)',
              }}
            />

            {/* Scanning line effect */}
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: '200%' }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute left-0 right-0 h-[2px] opacity-20"
              style={{
                background: 'linear-gradient(90deg, transparent, var(--color-turquoise-400), transparent)',
                boxShadow: '0 0 20px 10px rgba(38, 245, 218, 0.3)',
              }}
            />
          </div>

          {/* Main content */}
          <div className="relative z-10 text-center px-6">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{
                scale: phase >= 1 ? 1 : 0,
                rotate: phase >= 1 ? 0 : -180
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                duration: 0.8
              }}
              className="mx-auto mb-8"
            >
              <div className="relative w-24 h-24 mx-auto">
                {/* Outer ring */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: phase >= 1 ? 1 : 0, rotate: 360 }}
                  transition={{ rotate: { duration: 20, repeat: Infinity, ease: 'linear' } }}
                  className="absolute inset-0 rounded-full border-2 border-[var(--color-turquoise-500)]/30"
                />

                {/* Pulsing ring */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border border-[var(--color-turquoise-400)]"
                />

                {/* Main logo */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[var(--color-turquoise-400)] to-[var(--color-turquoise-600)] flex items-center justify-center shadow-lg shadow-[var(--color-turquoise-500)]/30">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-12 h-12 text-white"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    {/* Crosshair/Target icon */}
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                    <line x1="12" y1="2" x2="12" y2="6" />
                    <line x1="12" y1="18" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="6" y2="12" />
                    <line x1="18" y1="12" x2="22" y2="12" />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Brand name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: phase >= 2 ? 1 : 0,
                y: phase >= 2 ? 0 : 20
              }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl md:text-6xl font-[family-name:var(--font-display)] font-bold text-white mb-2 tracking-tight">
                <span className="text-[var(--color-turquoise-400)]">Hospice</span>
                <span className="text-white">Tracker</span>
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: phase >= 2 ? 1 : 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-lg text-gray-400 font-medium tracking-wide"
              >
                M&A Intelligence Platform
              </motion.p>
            </motion.div>

            {/* Stats ticker */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{
                opacity: phase >= 3 ? 1 : 0,
                y: phase >= 3 ? 0 : 30
              }}
              transition={{ duration: 0.6 }}
              className="mt-12 flex items-center justify-center gap-8 md:gap-12"
            >
              {[
                { value: '6,970', label: 'Providers Tracked' },
                { value: '360', label: 'GREEN Targets' },
                { value: '55', label: 'Markets' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: phase >= 3 ? 1 : 0,
                    scale: phase >= 3 ? 1 : 0.8
                  }}
                  transition={{ delay: index * 0.15, duration: 0.4 }}
                  className="text-center"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-2xl md:text-3xl font-bold text-[var(--color-turquoise-400)]"
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-xs md:text-sm text-gray-500 uppercase tracking-wider mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Loading bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 2 ? 1 : 0 }}
              className="mt-12 w-48 mx-auto"
            >
              <div className="h-0.5 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: phase >= 4 ? '100%' : `${Math.min(phase * 30, 90)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-[var(--color-turquoise-500)] to-[var(--color-turquoise-400)] rounded-full"
                  style={{
                    boxShadow: '0 0 10px rgba(38, 245, 218, 0.5)',
                  }}
                />
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: phase >= 2 ? 0.5 : 0 }}
                className="text-xs text-gray-600 mt-3 uppercase tracking-widest"
              >
                {phase < 4 ? 'Initializing...' : 'Ready'}
              </motion.p>
            </motion.div>
          </div>

          {/* Corner decorations */}
          <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-[var(--color-turquoise-500)]/20 rounded-tl-lg" />
          <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-[var(--color-turquoise-500)]/20 rounded-tr-lg" />
          <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-[var(--color-turquoise-500)]/20 rounded-bl-lg" />
          <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-[var(--color-turquoise-500)]/20 rounded-br-lg" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

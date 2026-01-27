'use client';

import { useState, useEffect } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface WatchlistButtonProps {
  ccn: string;
  providerName: string;
  size?: 'sm' | 'md' | 'lg';
}

export function WatchlistButton({ ccn, providerName, size = 'md' }: WatchlistButtonProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const checkWatchlist = async () => {
      try {
        const res = await fetch('/api/watchlist');
        const data = await res.json();
        const inList = data.watchlist?.some((item: any) => item.ccn === ccn);
        setIsInWatchlist(inList);
      } catch (error) {
        console.error('Failed to check watchlist:', error);
      } finally {
        setLoading(false);
      }
    };
    checkWatchlist();
  }, [ccn]);

  const handleToggle = async () => {
    setToggling(true);
    try {
      if (isInWatchlist) {
        await fetch(`/api/watchlist?ccn=${ccn}`, { method: 'DELETE' });
        setIsInWatchlist(false);
      } else {
        await fetch('/api/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ccn, notes: null, priority: 'medium' }),
        });
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error('Failed to toggle watchlist:', error);
    } finally {
      setToggling(false);
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-sm gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (loading) {
    return (
      <button
        disabled
        className={`flex items-center rounded-lg bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] ${sizeClasses[size]}`}
      >
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      </button>
    );
  }

  return (
    <motion.button
      onClick={handleToggle}
      disabled={toggling}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center rounded-lg font-medium transition-colors ${sizeClasses[size]} ${
        isInWatchlist
          ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
          : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] hover:text-amber-400 hover:bg-amber-500/10'
      }`}
      title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      {toggling ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      ) : (
        <Star className={`${iconSizes[size]} ${isInWatchlist ? 'fill-current' : ''}`} />
      )}
      {size !== 'sm' && (isInWatchlist ? 'In Watchlist' : 'Add to Watchlist')}
    </motion.button>
  );
}

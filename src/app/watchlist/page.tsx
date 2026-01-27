'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Trash2,
  Loader2,
  Phone,
  MapPin,
  ExternalLink,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { ClassificationBadge } from '@/components/ClassificationBadge';

interface WatchlistItem {
  id: number;
  ccn: string;
  added_at: string;
  notes: string | null;
  priority: 'high' | 'medium' | 'low';
  provider_name: string;
  city: string;
  state: string;
  classification: 'GREEN' | 'YELLOW' | 'RED';
  overall_score: number | null;
  estimated_adc: number | null;
  con_state: boolean;
  phone_number: string | null;
}

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editPriority, setEditPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const fetchWatchlist = async () => {
    try {
      const res = await fetch('/api/watchlist');
      const data = await res.json();
      setWatchlist(data.watchlist || []);
    } catch (error) {
      console.error('Failed to fetch watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleRemove = async (ccn: string) => {
    try {
      await fetch(`/api/watchlist?ccn=${ccn}`, { method: 'DELETE' });
      setWatchlist(watchlist.filter(item => item.ccn !== ccn));
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
    }
  };

  const handleEdit = (item: WatchlistItem) => {
    setEditingId(item.id);
    setEditNotes(item.notes || '');
    setEditPriority(item.priority);
  };

  const handleSaveEdit = async (ccn: string) => {
    try {
      await fetch('/api/watchlist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ccn, notes: editNotes, priority: editPriority }),
      });
      setWatchlist(watchlist.map(item =>
        item.ccn === ccn ? { ...item, notes: editNotes, priority: editPriority } : item
      ));
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update watchlist item:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10';
      case 'medium': return 'text-amber-400 bg-amber-500/10';
      case 'low': return 'text-blue-400 bg-blue-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const formatScore = (score: number | null) => {
    if (score === null) return '—';
    const num = typeof score === 'string' ? parseFloat(score) : score;
    return isNaN(num) ? '—' : num.toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[var(--color-turquoise-400)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-[family-name:var(--font-display)] mb-2">
          <span className="gradient-text">Watchlist</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] text-lg">
          Track and manage your priority acquisition targets
        </p>
      </div>

      {watchlist.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Star className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No targets in watchlist</h2>
          <p className="text-[var(--color-text-muted)] mb-6">
            Add providers to your watchlist from the targets page or provider details
          </p>
          <Link
            href="/targets?classification=GREEN"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--color-turquoise-500)] text-white font-medium hover:bg-[var(--color-turquoise-600)] transition-colors"
          >
            Browse GREEN Targets
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-[var(--color-text-muted)]">
              {watchlist.length} provider{watchlist.length !== 1 ? 's' : ''} in watchlist
            </span>
          </div>

          <AnimatePresence>
            {watchlist.map((item) => (
              <motion.div
                key={item.ccn}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="glass-card rounded-xl p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        href={`/provider/${item.ccn}`}
                        className="text-lg font-semibold hover:text-[var(--color-turquoise-400)] transition-colors"
                      >
                        {item.provider_name}
                      </Link>
                      <ClassificationBadge classification={item.classification} size="sm" />
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority.toUpperCase()}
                      </span>
                      {item.con_state && (
                        <span className="text-xs text-[var(--color-turquoise-400)]">CON</span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)] mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {item.city}, {item.state}
                      </span>
                      <span className="font-mono">CCN: {item.ccn}</span>
                      <span>Score: {formatScore(item.overall_score)}</span>
                      <span>ADC: {item.estimated_adc || '—'}</span>
                      {item.phone_number && (
                        <a
                          href={`tel:${item.phone_number}`}
                          className="flex items-center gap-1 text-[var(--color-turquoise-400)] hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {item.phone_number}
                        </a>
                      )}
                    </div>

                    {editingId === item.id ? (
                      <div className="space-y-3 mt-4 p-4 rounded-lg bg-[var(--color-bg-tertiary)]">
                        <div>
                          <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Priority</label>
                          <select
                            value={editPriority}
                            onChange={(e) => setEditPriority(e.target.value as 'high' | 'medium' | 'low')}
                            className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm"
                          >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Notes</label>
                          <textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="Add notes about this target..."
                            className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm resize-none"
                            rows={3}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSaveEdit(item.ccn)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm hover:bg-emerald-500/20 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] text-sm hover:text-[var(--color-text-primary)] transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : item.notes ? (
                      <p className="text-sm text-[var(--color-text-secondary)] italic mt-2">
                        "{item.notes}"
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/provider/${item.ccn}`}
                      className="p-2 rounded-lg hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-turquoise-400)] transition-colors"
                      title="View details"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 rounded-lg hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                      title="Edit notes"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemove(item.ccn)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

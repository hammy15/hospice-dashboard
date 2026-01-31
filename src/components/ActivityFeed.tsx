'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Briefcase, Users, Star, Mail, TrendingUp,
  Building2, ChevronRight, RefreshCw
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'deal' | 'contact' | 'watchlist' | 'outreach';
  action: string;
  title: string;
  subtitle: string;
  link?: string;
  timestamp: string;
}

const ACTIVITY_ICONS = {
  deal: Briefcase,
  contact: Users,
  watchlist: Star,
  outreach: Mail,
};

const ACTIVITY_COLORS = {
  deal: 'bg-blue-500/20 text-blue-400',
  contact: 'bg-purple-500/20 text-purple-400',
  watchlist: 'bg-amber-500/20 text-amber-400',
  outreach: 'bg-emerald-500/20 text-emerald-400',
};

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  async function fetchActivities() {
    setLoading(true);
    try {
      // Fetch recent deals, contacts, and watchlist items
      const [dealsRes, contactsRes, watchlistRes] = await Promise.all([
        fetch('/api/deals').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/contacts').then(r => r.json()).catch(() => ({ contacts: [] })),
        fetch('/api/watchlist').then(r => r.json()).catch(() => ({ watchlist: [] })),
      ]);

      const allActivities: Activity[] = [];

      // Add deals
      (dealsRes.data || []).slice(0, 5).forEach((deal: any) => {
        allActivities.push({
          id: `deal-${deal.id}`,
          type: 'deal',
          action: deal.stage === 'prospect' ? 'New deal added' : `Moved to ${deal.stage}`,
          title: deal.deal_name || deal.provider_name,
          subtitle: `${deal.city}, ${deal.state}`,
          link: `/provider/${deal.ccn}`,
          timestamp: deal.updated_at || deal.created_at,
        });
      });

      // Add contacts
      (contactsRes.contacts || []).slice(0, 5).forEach((contact: any) => {
        allActivities.push({
          id: `contact-${contact.id}`,
          type: 'contact',
          action: 'Contact updated',
          title: contact.contact_name,
          subtitle: contact.provider_name || 'Provider',
          link: contact.ccn ? `/provider/${contact.ccn}` : undefined,
          timestamp: contact.updated_at || contact.created_at,
        });
      });

      // Add watchlist
      (watchlistRes.watchlist || []).slice(0, 5).forEach((item: any) => {
        allActivities.push({
          id: `watchlist-${item.id}`,
          type: 'watchlist',
          action: 'Added to watchlist',
          title: item.provider_name,
          subtitle: `${item.city}, ${item.state}`,
          link: `/provider/${item.ccn}`,
          timestamp: item.added_at,
        });
      });

      // Sort by timestamp
      allActivities.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(allActivities.slice(0, 8));
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--color-turquoise-500)]" />
            Recent Activity
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-5 h-5 animate-spin text-[var(--color-text-muted)]" />
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--color-turquoise-500)]" />
            Recent Activity
          </h3>
        </div>
        <div className="text-center py-6 text-[var(--color-text-muted)]">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-[var(--color-turquoise-500)]" />
          Recent Activity
        </h3>
        <button
          onClick={fetchActivities}
          className="p-1 rounded hover:bg-[var(--color-bg-hover)] transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
        </button>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {activities.map((activity, i) => {
            const Icon = ACTIVITY_ICONS[activity.type];
            const colorClass = ACTIVITY_COLORS[activity.type];

            const content = (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors group cursor-pointer"
              >
                <div className={`p-1.5 rounded-lg ${colorClass} flex-shrink-0`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--color-text-muted)]">{activity.action}</p>
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">{activity.subtitle}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)] flex-shrink-0">
                  <span>{formatTimeAgo(activity.timestamp)}</span>
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            );

            return activity.link ? (
              <Link key={activity.id} href={activity.link}>
                {content}
              </Link>
            ) : (
              <div key={activity.id}>{content}</div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

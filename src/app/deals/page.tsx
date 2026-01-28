'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Plus, ChevronRight, DollarSign, Calendar, User,
  Building2, TrendingUp, ArrowRight, MoreVertical, Edit2, Trash2,
  CheckCircle, Clock, AlertCircle, X, Loader2, Target, Phone,
  MapPin, Filter, BarChart3
} from 'lucide-react';

interface Deal {
  id: number;
  ccn: string;
  deal_name: string;
  stage: string;
  status: string;
  priority: string;
  assigned_to: string | null;
  deal_value: number | null;
  purchase_price: number | null;
  expected_close_date: string | null;
  provider_name?: string;
  state?: string;
  city?: string;
  classification?: string;
  estimated_adc?: number;
  overall_score?: number;
  total_revenue?: number;
  created_at: string;
  updated_at: string;
}

interface PipelineStage {
  id: string;
  label: string;
  color: string;
  icon: typeof Briefcase;
}

const PIPELINE_STAGES: PipelineStage[] = [
  { id: 'prospect', label: 'Prospect', color: 'bg-slate-500', icon: Target },
  { id: 'outreach', label: 'Outreach', color: 'bg-blue-500', icon: Phone },
  { id: 'meeting', label: 'Meeting', color: 'bg-purple-500', icon: User },
  { id: 'loi', label: 'LOI', color: 'bg-amber-500', icon: Briefcase },
  { id: 'due_diligence', label: 'Due Diligence', color: 'bg-orange-500', icon: BarChart3 },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-rose-500', icon: TrendingUp },
  { id: 'closing', label: 'Closing', color: 'bg-emerald-500', icon: CheckCircle },
];

const formatCurrency = (value: number | null) => {
  if (!value) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
};

const formatDate = (date: string | null) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline');
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [filterStage, setFilterStage] = useState<string>('all');

  useEffect(() => {
    fetchDeals();
  }, []);

  async function fetchDeals() {
    try {
      const response = await fetch('/api/deals');
      const data = await response.json();
      if (data.success) {
        setDeals(data.data);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateDealStage(dealId: number, newStage: string) {
    try {
      const response = await fetch(`/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });
      if (response.ok) {
        fetchDeals();
      }
    } catch (error) {
      console.error('Error updating deal:', error);
    }
  }

  async function deleteDeal(dealId: number) {
    if (!confirm('Are you sure you want to delete this deal?')) return;
    try {
      const response = await fetch(`/api/deals/${dealId}`, { method: 'DELETE' });
      if (response.ok) {
        fetchDeals();
      }
    } catch (error) {
      console.error('Error deleting deal:', error);
    }
  }

  const dealsByStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.id] = deals.filter(d => d.stage === stage.id && d.status === 'active');
    return acc;
  }, {} as Record<string, Deal[]>);

  const totalPipelineValue = deals
    .filter(d => d.status === 'active')
    .reduce((sum, d) => sum + (d.deal_value || 0), 0);

  const filteredDeals = filterStage === 'all'
    ? deals.filter(d => d.status === 'active')
    : deals.filter(d => d.stage === filterStage && d.status === 'active');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-turquoise-500)]" />
      </div>
    );
  }

  return (
    <div className="max-w-[1800px] mx-auto px-4 lg:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)]">
            <span className="gradient-text">Deal Pipeline</span>
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            {deals.filter(d => d.status === 'active').length} active deals • {formatCurrency(totalPipelineValue)} total value
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--color-bg-secondary)]">
            <button
              onClick={() => setViewMode('pipeline')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'pipeline'
                  ? 'bg-[var(--color-turquoise-500)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              Pipeline
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-[var(--color-turquoise-500)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              List
            </button>
          </div>

          <button
            onClick={() => setShowNewDealModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-turquoise-500)] text-white font-medium hover:bg-[var(--color-turquoise-600)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Deal
          </button>
        </div>
      </div>

      {/* Pipeline Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {PIPELINE_STAGES.map(stage => {
          const stageDeals = dealsByStage[stage.id] || [];
          const stageValue = stageDeals.reduce((sum, d) => sum + (d.deal_value || 0), 0);
          const Icon = stage.icon;

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg ${stage.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">{stage.label}</span>
              </div>
              <div className="text-2xl font-bold font-mono">{stageDeals.length}</div>
              <div className="text-xs text-[var(--color-text-muted)]">{formatCurrency(stageValue)}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Pipeline View */}
      {viewMode === 'pipeline' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {PIPELINE_STAGES.map(stage => (
              <div key={stage.id} className="w-72 flex-shrink-0">
                <div className={`h-1 ${stage.color} rounded-t-lg`} />
                <div className="glass-card rounded-t-none rounded-b-xl p-3 min-h-[400px]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">{stage.label}</h3>
                    <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] px-2 py-0.5 rounded-full">
                      {(dealsByStage[stage.id] || []).length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {(dealsByStage[stage.id] || []).map(deal => (
                      <motion.div
                        key={deal.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[var(--color-bg-secondary)] rounded-lg p-3 cursor-pointer hover:bg-[var(--color-bg-hover)] transition-colors group"
                        onClick={() => setSelectedDeal(deal)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {deal.deal_name || deal.provider_name}
                            </h4>
                            <p className="text-xs text-[var(--color-text-muted)] truncate">
                              {deal.provider_name} • {deal.state}
                            </p>
                          </div>
                          {deal.classification && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              deal.classification === 'GREEN' ? 'bg-emerald-500/20 text-emerald-400' :
                              deal.classification === 'YELLOW' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {deal.classification}
                            </span>
                          )}
                        </div>

                        {deal.deal_value && (
                          <div className="mt-2 flex items-center gap-1 text-[var(--color-turquoise-500)]">
                            <DollarSign className="w-3 h-3" />
                            <span className="text-xs font-medium">{formatCurrency(deal.deal_value)}</span>
                          </div>
                        )}

                        <div className="mt-2 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                          {deal.expected_close_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(deal.expected_close_date)}
                            </span>
                          )}
                          {deal.assigned_to && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {deal.assigned_to}
                            </span>
                          )}
                        </div>

                        {/* Stage navigation */}
                        <div className="mt-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {PIPELINE_STAGES.map((s, idx) => {
                            const currentIdx = PIPELINE_STAGES.findIndex(ps => ps.id === deal.stage);
                            if (idx === currentIdx) return null;
                            return (
                              <button
                                key={s.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateDealStage(deal.id, s.id);
                                }}
                                className={`w-2 h-2 rounded-full ${s.color} opacity-50 hover:opacity-100 transition-opacity`}
                                title={`Move to ${s.label}`}
                              />
                            );
                          })}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-4">
            <Filter className="w-4 h-4 text-[var(--color-text-muted)]" />
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="all">All Stages</option>
              {PIPELINE_STAGES.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg-tertiary)]">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider">Deal</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider">Provider</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider">Stage</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider">Value</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider">ADC</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider">Close Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider">Assigned</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredDeals.map(deal => {
                  const stage = PIPELINE_STAGES.find(s => s.id === deal.stage);
                  return (
                    <tr key={deal.id} className="hover:bg-[var(--color-bg-hover)] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium">{deal.deal_name || deal.provider_name}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">#{deal.id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/provider/${deal.ccn}`} className="hover:text-[var(--color-turquoise-500)]">
                          {deal.provider_name}
                        </Link>
                        <div className="text-xs text-[var(--color-text-muted)]">{deal.city}, {deal.state}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${stage?.color} text-white`}>
                          {stage?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{formatCurrency(deal.deal_value)}</td>
                      <td className="px-4 py-3">{deal.estimated_adc || '-'}</td>
                      <td className="px-4 py-3">{formatDate(deal.expected_close_date)}</td>
                      <td className="px-4 py-3">{deal.assigned_to || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedDeal(deal)}
                            className="p-1.5 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteDeal(deal.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Deal Modal */}
      <AnimatePresence>
        {showNewDealModal && (
          <NewDealModal
            onClose={() => setShowNewDealModal(false)}
            onSuccess={() => {
              setShowNewDealModal(false);
              fetchDeals();
            }}
          />
        )}
      </AnimatePresence>

      {/* Deal Detail Modal */}
      <AnimatePresence>
        {selectedDeal && (
          <DealDetailModal
            deal={selectedDeal}
            onClose={() => setSelectedDeal(null)}
            onUpdate={() => {
              setSelectedDeal(null);
              fetchDeals();
            }}
            onDelete={() => {
              deleteDeal(selectedDeal.id);
              setSelectedDeal(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function NewDealModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [ccn, setCcn] = useState('');
  const [dealName, setDealName] = useState('');
  const [dealValue, setDealValue] = useState('');
  const [stage, setStage] = useState('prospect');
  const [assignedTo, setAssignedTo] = useState('');
  const [expectedClose, setExpectedClose] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ccn,
          deal_name: dealName,
          deal_value: dealValue ? parseFloat(dealValue) : null,
          stage,
          assigned_to: assignedTo || null,
          expected_close_date: expectedClose || null,
          notes: notes || null,
        }),
      });
      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating deal:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-card rounded-xl p-6 w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">New Deal</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--color-bg-tertiary)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Provider CCN *</label>
            <input
              type="text"
              value={ccn}
              onChange={e => setCcn(e.target.value)}
              required
              placeholder="e.g., 501234"
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:border-[var(--color-turquoise-500)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Deal Name</label>
            <input
              type="text"
              value={dealName}
              onChange={e => setDealName(e.target.value)}
              placeholder="Optional custom name"
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:border-[var(--color-turquoise-500)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Deal Value</label>
              <input
                type="number"
                value={dealValue}
                onChange={e => setDealValue(e.target.value)}
                placeholder="$0"
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:border-[var(--color-turquoise-500)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stage</label>
              <select
                value={stage}
                onChange={e => setStage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:border-[var(--color-turquoise-500)] focus:outline-none"
              >
                {PIPELINE_STAGES.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Assigned To</label>
              <input
                type="text"
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                placeholder="Team member"
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:border-[var(--color-turquoise-500)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expected Close</label>
              <input
                type="date"
                value={expectedClose}
                onChange={e => setExpectedClose(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:border-[var(--color-turquoise-500)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Deal notes..."
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:border-[var(--color-turquoise-500)] focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !ccn}
              className="px-4 py-2 rounded-lg bg-[var(--color-turquoise-500)] text-white font-medium hover:bg-[var(--color-turquoise-600)] transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Deal'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function DealDetailModal({ deal, onClose, onUpdate, onDelete }: {
  deal: Deal;
  onClose: () => void;
  onUpdate: () => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(deal);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      const response = await fetch(`/api/deals/${deal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating deal:', error);
    } finally {
      setLoading(false);
    }
  }

  const stage = PIPELINE_STAGES.find(s => s.id === deal.stage);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-card rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">{deal.deal_name || deal.provider_name}</h2>
            <p className="text-sm text-[var(--color-text-muted)]">Deal #{deal.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditing(!editing)}
              className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)]">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!editing ? (
          <div className="space-y-6">
            {/* Provider Info */}
            <div className="flex items-center gap-4 p-4 bg-[var(--color-bg-secondary)] rounded-lg">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                deal.classification === 'GREEN' ? 'bg-emerald-500/20' :
                deal.classification === 'YELLOW' ? 'bg-amber-500/20' : 'bg-red-500/20'
              }`}>
                <Building2 className={`w-6 h-6 ${
                  deal.classification === 'GREEN' ? 'text-emerald-400' :
                  deal.classification === 'YELLOW' ? 'text-amber-400' : 'text-red-400'
                }`} />
              </div>
              <div className="flex-1">
                <Link href={`/provider/${deal.ccn}`} className="font-semibold hover:text-[var(--color-turquoise-500)]">
                  {deal.provider_name}
                </Link>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {deal.city}, {deal.state} • ADC: {deal.estimated_adc || '-'} • Score: {deal.overall_score || '-'}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${stage?.color} text-white`}>
                {stage?.label}
              </span>
            </div>

            {/* Deal Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-[var(--color-bg-secondary)] rounded-lg">
                <div className="text-xs text-[var(--color-text-muted)] mb-1">Deal Value</div>
                <div className="font-semibold text-[var(--color-turquoise-500)]">{formatCurrency(deal.deal_value)}</div>
              </div>
              <div className="p-3 bg-[var(--color-bg-secondary)] rounded-lg">
                <div className="text-xs text-[var(--color-text-muted)] mb-1">Expected Close</div>
                <div className="font-semibold">{formatDate(deal.expected_close_date)}</div>
              </div>
              <div className="p-3 bg-[var(--color-bg-secondary)] rounded-lg">
                <div className="text-xs text-[var(--color-text-muted)] mb-1">Assigned To</div>
                <div className="font-semibold">{deal.assigned_to || '-'}</div>
              </div>
              <div className="p-3 bg-[var(--color-bg-secondary)] rounded-lg">
                <div className="text-xs text-[var(--color-text-muted)] mb-1">Priority</div>
                <div className="font-semibold capitalize">{deal.priority}</div>
              </div>
            </div>

            {/* Stage Progression */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Move to Stage</h3>
              <div className="flex flex-wrap gap-2">
                {PIPELINE_STAGES.map(s => (
                  <button
                    key={s.id}
                    onClick={async () => {
                      await fetch(`/api/deals/${deal.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ stage: s.id }),
                      });
                      onUpdate();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      s.id === deal.stage
                        ? `${s.color} text-white`
                        : 'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t border-[var(--color-border)]">
              <button
                onClick={onDelete}
                className="px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
              >
                Delete Deal
              </button>
              <Link
                href={`/provider/${deal.ccn}`}
                className="px-4 py-2 rounded-lg bg-[var(--color-turquoise-500)] text-white font-medium hover:bg-[var(--color-turquoise-600)] transition-colors"
              >
                View Provider
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Deal Name</label>
                <input
                  type="text"
                  value={formData.deal_name || ''}
                  onChange={e => setFormData({ ...formData, deal_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deal Value</label>
                <input
                  type="number"
                  value={formData.deal_value || ''}
                  onChange={e => setFormData({ ...formData, deal_value: parseFloat(e.target.value) || null })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Assigned To</label>
                <input
                  type="text"
                  value={formData.assigned_to || ''}
                  onChange={e => setFormData({ ...formData, assigned_to: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expected Close</label>
                <input
                  type="date"
                  value={formData.expected_close_date || ''}
                  onChange={e => setFormData({ ...formData, expected_close_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg border border-[var(--color-border)]">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-[var(--color-turquoise-500)] text-white font-medium">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

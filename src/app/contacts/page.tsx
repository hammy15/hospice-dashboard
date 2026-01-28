'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Phone, Mail, Linkedin, Building2, Calendar,
  Clock, AlertCircle, CheckCircle, X, Loader2, Search,
  Edit2, Trash2, UserCheck, MessageSquare, ChevronRight
} from 'lucide-react';

interface Contact {
  id: number;
  ccn: string;
  contact_name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  contact_type: string;
  is_decision_maker: boolean;
  is_primary: boolean;
  notes: string | null;
  last_contact_date: string | null;
  next_follow_up: string | null;
  provider_name?: string;
  state?: string;
  city?: string;
  classification?: string;
  created_at: string;
}

const formatDate = (date: string | null) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const isOverdue = (date: string | null) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

const isDueSoon = (date: string | null) => {
  if (!date) return false;
  const followUp = new Date(date);
  const today = new Date();
  const diffDays = Math.ceil((followUp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 3;
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [followUps, setFollowUps] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewContactModal, setShowNewContactModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchContacts();
    fetchFollowUps();
  }, []);

  async function fetchContacts() {
    try {
      const response = await fetch('/api/contacts');
      const data = await response.json();
      if (data.success) {
        setContacts(data.data);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchFollowUps() {
    try {
      const response = await fetch('/api/contacts?followups=true');
      const data = await response.json();
      if (data.success) {
        setFollowUps(data.data);
      }
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
    }
  }

  async function deleteContact(id: number) {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      const response = await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchContacts();
        fetchFollowUps();
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  }

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = searchQuery === '' ||
      c.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.provider_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterType === 'all' ||
      (filterType === 'decision_maker' && c.is_decision_maker) ||
      (filterType === 'primary' && c.is_primary) ||
      c.contact_type === filterType;

    return matchesSearch && matchesFilter;
  });

  const overdueFollowUps = followUps.filter(c => isOverdue(c.next_follow_up));
  const upcomingFollowUps = followUps.filter(c => !isOverdue(c.next_follow_up));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-turquoise-500)]" />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)]">
            <span className="gradient-text">Contact CRM</span>
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            {contacts.length} contacts • {followUps.length} follow-ups due
          </p>
        </div>

        <button
          onClick={() => setShowNewContactModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-turquoise-500)] text-white font-medium hover:bg-[var(--color-turquoise-600)] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      {/* Follow-ups Alert */}
      {overdueFollowUps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-400">Overdue Follow-ups</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                You have {overdueFollowUps.length} contact{overdueFollowUps.length > 1 ? 's' : ''} that need follow-up
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {overdueFollowUps.slice(0, 5).map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedContact(c)}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 text-sm hover:bg-red-500/30 transition-colors"
              >
                {c.contact_name}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Contacts List */}
        <div className="lg:col-span-3">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:border-[var(--color-turquoise-500)] focus:outline-none"
              />
            </div>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-4 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
            >
              <option value="all">All Contacts</option>
              <option value="decision_maker">Decision Makers</option>
              <option value="primary">Primary Contacts</option>
              <option value="owner">Owners</option>
              <option value="administrator">Administrators</option>
              <option value="financial">Financial</option>
            </select>
          </div>

          {/* Contact Cards */}
          <div className="space-y-3">
            {filteredContacts.map(contact => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-xl p-4 hover:border-[var(--color-turquoise-500)]/30 transition-colors cursor-pointer"
                onClick={() => setSelectedContact(contact)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    contact.is_decision_maker ? 'bg-amber-500/20' : 'bg-[var(--color-bg-tertiary)]'
                  }`}>
                    <Users className={`w-6 h-6 ${contact.is_decision_maker ? 'text-amber-400' : ''}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{contact.contact_name}</h3>
                      {contact.is_decision_maker && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                          Decision Maker
                        </span>
                      )}
                      {contact.is_primary && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                          Primary
                        </span>
                      )}
                    </div>
                    {contact.title && (
                      <p className="text-sm text-[var(--color-text-muted)]">{contact.title}</p>
                    )}
                    <Link
                      href={`/provider/${contact.ccn}`}
                      onClick={e => e.stopPropagation()}
                      className="text-sm text-[var(--color-turquoise-500)] hover:underline"
                    >
                      {contact.provider_name} • {contact.city}, {contact.state}
                    </Link>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone}`}
                          onClick={e => e.stopPropagation()}
                          className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          onClick={e => e.stopPropagation()}
                          className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                      {contact.linkedin_url && (
                        <a
                          href={contact.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors"
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    {contact.next_follow_up && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isOverdue(contact.next_follow_up)
                          ? 'bg-red-500/20 text-red-400'
                          : isDueSoon(contact.next_follow_up)
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]'
                      }`}>
                        Follow-up: {formatDate(contact.next_follow_up)}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredContacts.length === 0 && (
              <div className="text-center py-12 text-[var(--color-text-muted)]">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No contacts found</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Upcoming Follow-ups */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-xl p-4 sticky top-24">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--color-turquoise-500)]" />
              Upcoming Follow-ups
            </h2>

            {upcomingFollowUps.length > 0 ? (
              <div className="space-y-3">
                {upcomingFollowUps.slice(0, 8).map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className="w-full text-left p-3 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors"
                  >
                    <div className="font-medium text-sm truncate">{contact.contact_name}</div>
                    <div className="text-xs text-[var(--color-text-muted)] truncate">{contact.provider_name}</div>
                    <div className={`text-xs mt-1 ${
                      isDueSoon(contact.next_follow_up) ? 'text-amber-400' : 'text-[var(--color-text-muted)]'
                    }`}>
                      {formatDate(contact.next_follow_up)}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">No upcoming follow-ups</p>
            )}
          </div>
        </div>
      </div>

      {/* New Contact Modal */}
      <AnimatePresence>
        {showNewContactModal && (
          <NewContactModal
            onClose={() => setShowNewContactModal(false)}
            onSuccess={() => {
              setShowNewContactModal(false);
              fetchContacts();
            }}
          />
        )}
      </AnimatePresence>

      {/* Contact Detail Modal */}
      <AnimatePresence>
        {selectedContact && (
          <ContactDetailModal
            contact={selectedContact}
            onClose={() => setSelectedContact(null)}
            onUpdate={() => {
              setSelectedContact(null);
              fetchContacts();
              fetchFollowUps();
            }}
            onDelete={() => {
              deleteContact(selectedContact.id);
              setSelectedContact(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function NewContactModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    ccn: '',
    contact_name: '',
    title: '',
    email: '',
    phone: '',
    linkedin_url: '',
    contact_type: 'general',
    is_decision_maker: false,
    is_primary: false,
    notes: '',
    next_follow_up: '',
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating contact:', error);
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
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="glass-card rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Add Contact</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--color-bg-tertiary)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Provider CCN *</label>
              <input
                type="text"
                value={formData.ccn}
                onChange={e => setFormData({ ...formData, ccn: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                value={formData.contact_name}
                onChange={e => setFormData({ ...formData, contact_name: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={formData.contact_type}
                onChange={e => setFormData({ ...formData, contact_type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
              >
                <option value="general">General</option>
                <option value="owner">Owner</option>
                <option value="administrator">Administrator</option>
                <option value="financial">Financial</option>
                <option value="clinical">Clinical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
              <input
                type="url"
                value={formData.linkedin_url}
                onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Follow-up Date</label>
              <input
                type="date"
                value={formData.next_follow_up}
                onChange={e => setFormData({ ...formData, next_follow_up: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
              />
            </div>
            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_decision_maker}
                  onChange={e => setFormData({ ...formData, is_decision_maker: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Decision Maker</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_primary}
                  onChange={e => setFormData({ ...formData, is_primary: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Primary</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-[var(--color-border)]">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.ccn || !formData.contact_name}
              className="px-4 py-2 rounded-lg bg-[var(--color-turquoise-500)] text-white font-medium disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Contact'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function ContactDetailModal({ contact, onClose, onUpdate, onDelete }: {
  contact: Contact;
  onClose: () => void;
  onUpdate: () => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(contact);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating contact:', error);
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
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="glass-card rounded-xl p-6 w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">{contact.contact_name}</h2>
            <p className="text-sm text-[var(--color-text-muted)]">{contact.title || 'Contact'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setEditing(!editing)} className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)]">
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)]">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!editing ? (
          <div className="space-y-4">
            <Link
              href={`/provider/${contact.ccn}`}
              className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors"
            >
              <Building2 className="w-5 h-5 text-[var(--color-turquoise-500)]" />
              <div>
                <div className="font-medium">{contact.provider_name}</div>
                <div className="text-sm text-[var(--color-text-muted)]">{contact.city}, {contact.state}</div>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Link>

            <div className="grid grid-cols-2 gap-3">
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="flex items-center gap-2 p-3 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)]">
                  <Phone className="w-4 h-4 text-[var(--color-turquoise-500)]" />
                  <span className="text-sm">{contact.phone}</span>
                </a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-2 p-3 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)]">
                  <Mail className="w-4 h-4 text-[var(--color-turquoise-500)]" />
                  <span className="text-sm truncate">{contact.email}</span>
                </a>
              )}
            </div>

            {contact.linkedin_url && (
              <a
                href={contact.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)]"
              >
                <Linkedin className="w-4 h-4 text-blue-400" />
                <span className="text-sm">View LinkedIn Profile</span>
              </a>
            )}

            {contact.notes && (
              <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                <h4 className="text-sm font-medium mb-1">Notes</h4>
                <p className="text-sm text-[var(--color-text-muted)]">{contact.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-secondary)]">
              <div>
                <div className="text-sm font-medium">Next Follow-up</div>
                <div className={`text-sm ${
                  isOverdue(contact.next_follow_up) ? 'text-red-400' :
                  isDueSoon(contact.next_follow_up) ? 'text-amber-400' : 'text-[var(--color-text-muted)]'
                }`}>
                  {formatDate(contact.next_follow_up)}
                </div>
              </div>
              <Calendar className="w-5 h-5 text-[var(--color-text-muted)]" />
            </div>

            <div className="flex justify-between pt-4 border-t border-[var(--color-border)]">
              <button onClick={onDelete} className="px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/20">
                Delete
              </button>
              <button onClick={() => setEditing(true)} className="px-4 py-2 rounded-lg bg-[var(--color-turquoise-500)] text-white font-medium">
                Edit Contact
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.contact_name}
                onChange={e => setFormData({ ...formData, contact_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Follow-up Date</label>
              <input
                type="date"
                value={formData.next_follow_up || ''}
                onChange={e => setFormData({ ...formData, next_follow_up: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg border border-[var(--color-border)]">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-[var(--color-turquoise-500)] text-white font-medium">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

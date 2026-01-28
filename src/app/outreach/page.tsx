'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Mail,
  FileText,
  Send,
  Copy,
  Check,
  Plus,
  Clock,
  User,
  Building2,
  ChevronDown,
  Loader2,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

interface OutreachHistory {
  id: string;
  ccn: string;
  template_name: string;
  sent_at: string;
  provider_name: string;
  notes: string | null;
}

export default function OutreachPage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [history, setHistory] = useState<OutreachHistory[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create form state
  const [newName, setNewName] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newBody, setNewBody] = useState('');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/outreach');
      const data = await res.json();
      setTemplates(data.templates || []);
      setHistory(data.history || []);
      if (data.templates?.length > 0 && !selectedTemplate) {
        setSelectedTemplate(data.templates[0]);
      }
    } catch (err) {
      console.error('Failed to fetch outreach data:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const createTemplate = async () => {
    if (!user || !newName || !newBody) return;

    try {
      const res = await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          subject: newSubject,
          body: newBody,
          variables: extractVariables(newBody + ' ' + newSubject),
        }),
      });

      if (res.ok) {
        setShowCreateForm(false);
        setNewName('');
        setNewSubject('');
        setNewBody('');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to create template:', err);
    }
  };

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{(\w+)\}\}/g) || [];
    return [...new Set(matches.map(m => m.replace(/[{}]/g, '')))];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[var(--color-turquoise-400)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-[family-name:var(--font-display)] mb-2">
          <span className="gradient-text">Outreach</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] text-lg">
          Personalized templates for reaching acquisition targets
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Templates List */}
        <div className="col-span-4">
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
              <span className="font-semibold">Templates</span>
              {user && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)] text-[var(--color-turquoise-400)]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="divide-y divide-[var(--color-border)]">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`w-full px-4 py-3 text-left hover:bg-[var(--color-bg-hover)] transition-colors ${
                    selectedTemplate?.id === template.id ? 'bg-[var(--color-turquoise-500)]/10 border-l-2 border-[var(--color-turquoise-400)]' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <span className="font-medium truncate">{template.name}</span>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)] truncate">
                    {template.subject}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Outreach */}
          {history.length > 0 && (
            <div className="glass-card rounded-xl mt-6 overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--color-border)]">
                <span className="font-semibold text-sm">Recent Outreach</span>
              </div>
              <div className="divide-y divide-[var(--color-border)] max-h-64 overflow-y-auto">
                {history.slice(0, 10).map((item) => (
                  <div key={item.id} className="px-4 py-3">
                    <Link href={`/provider/${item.ccn}`} className="font-medium text-sm hover:text-[var(--color-turquoise-400)]">
                      {item.provider_name}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mt-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.sent_at).toLocaleDateString()}
                      {item.template_name && <span>• {item.template_name}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Template Preview/Editor */}
        <div className="col-span-8">
          {showCreateForm ? (
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Create New Template</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Template Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., First Contact"
                    className="w-full px-4 py-2 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]"
                  />
                </div>

                <div>
                  <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Subject Line</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g., Partnership Opportunity for {{provider_name}}"
                    className="w-full px-4 py-2 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]"
                  />
                </div>

                <div>
                  <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Message Body</label>
                  <textarea
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    placeholder="Use {{variable_name}} for dynamic content..."
                    rows={12}
                    className="w-full px-4 py-2 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] resize-none font-mono text-sm"
                  />
                </div>

                <div className="p-3 rounded-lg bg-[var(--color-bg-tertiary)] text-sm">
                  <span className="text-[var(--color-text-muted)]">Available variables: </span>
                  <span className="text-[var(--color-turquoise-400)]">
                    {`{{provider_name}}, {{owner_name}}, {{city}}, {{state}}, {{county}}, {{sender_name}}, {{company_name}}`}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createTemplate}
                    disabled={!newName || !newBody}
                    className="px-4 py-2 rounded-lg bg-[var(--color-turquoise-500)] text-white hover:bg-[var(--color-turquoise-600)] disabled:opacity-50"
                  >
                    Create Template
                  </button>
                </div>
              </div>
            </div>
          ) : selectedTemplate ? (
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{selectedTemplate.name}</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Variables: {selectedTemplate.variables?.join(', ') || 'None'}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(selectedTemplate.body)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] flex items-center gap-2 text-sm"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Subject</label>
                  <p className="mt-1 font-medium">{selectedTemplate.subject}</p>
                </div>

                <div>
                  <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Body</label>
                  <pre className="mt-2 p-4 rounded-lg bg-[var(--color-bg-tertiary)] whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {selectedTemplate.body}
                  </pre>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                <p className="text-sm text-[var(--color-text-muted)]">
                  <span className="font-medium">Tip:</span> Variables like {`{{provider_name}}`} will be automatically replaced when you generate a message for a specific provider.
                </p>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-xl p-12 text-center">
              <Mail className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a Template</h3>
              <p className="text-[var(--color-text-muted)]">
                Choose a template from the list to preview and customize
              </p>
            </div>
          )}

          {/* How to Use */}
          <div className="glass-card rounded-xl p-6 mt-6">
            <h3 className="font-semibold mb-4">How to Use Outreach Templates</h3>
            <ol className="space-y-3 text-sm text-[var(--color-text-secondary)]">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-turquoise-500)]/20 text-[var(--color-turquoise-400)] flex items-center justify-center text-xs font-bold">1</span>
                <span>Browse acquisition targets and find a provider you want to contact</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-turquoise-500)]/20 text-[var(--color-turquoise-400)] flex items-center justify-center text-xs font-bold">2</span>
                <span>Click "Generate Outreach" on the provider detail page</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-turquoise-500)]/20 text-[var(--color-turquoise-400)] flex items-center justify-center text-xs font-bold">3</span>
                <span>Select a template and the system will auto-fill provider details</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-turquoise-500)]/20 text-[var(--color-turquoise-400)] flex items-center justify-center text-xs font-bold">4</span>
                <span>Copy the personalized message and send via your preferred channel</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Key,
  Mail,
  Building2,
  Copy,
  Check,
  Trash2,
  Plus,
  Shield,
  Bell,
  Loader2,
  LogOut,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

interface ApiKey {
  id: string;
  name: string;
  created_at: string;
  last_used: string | null;
  requests_today: number;
  rate_limit: number;
  active: boolean;
}

export default function AccountPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Login form state
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  useEffect(() => {
    if (user) {
      fetchApiKeys();
    }
  }, [user]);

  const fetchApiKeys = async () => {
    try {
      const res = await fetch('/api/api-keys');
      const data = await res.json();
      setApiKeys(data.keys || []);
    } catch (err) {
      console.error('Failed to fetch API keys:', err);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });
      const data = await res.json();

      if (data.success) {
        setNewKey(data.key);
        setNewKeyName('');
        fetchApiKeys();
      }
    } catch (err) {
      console.error('Failed to create API key:', err);
    } finally {
      setLoading(false);
    }
  };

  const revokeApiKey = async (keyId: string) => {
    try {
      await fetch(`/api/api-keys?id=${keyId}`, { method: 'DELETE' });
      fetchApiKeys();
    } catch (err) {
      console.error('Failed to revoke API key:', err);
    }
  };

  const copyKey = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = isLogin
        ? await login(email, password)
        : await register(email, password, name, company);

      if (!result.success) {
        setError(result.error || 'Authentication failed');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[var(--color-turquoise-400)] animate-spin" />
      </div>
    );
  }

  // Login/Register Form
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="glass-card rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-turquoise-400)] to-[var(--color-turquoise-600)] flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
            <p className="text-[var(--color-text-muted)] mt-2">
              {isLogin ? 'Sign in to access your account' : 'Start tracking acquisition targets'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] focus:border-[var(--color-turquoise-400)] focus:outline-none transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] focus:border-[var(--color-turquoise-400)] focus:outline-none transition-colors"
                    placeholder="Acme Capital"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] focus:border-[var(--color-turquoise-400)] focus:outline-none transition-colors"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] focus:border-[var(--color-turquoise-400)] focus:outline-none transition-colors"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[var(--color-turquoise-500)] text-white font-medium hover:bg-[var(--color-turquoise-600)] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[var(--color-turquoise-400)] hover:underline text-sm"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Account Dashboard
  return (
    <div className="max-w-4xl mx-auto px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-[family-name:var(--font-display)] mb-2">
            <span className="gradient-text">Account</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-lg">
            Manage your profile and API access
          </p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 rounded-lg border border-[var(--color-border)] hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      {/* Profile Card */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-turquoise-400)] to-[var(--color-turquoise-600)] flex items-center justify-center text-white text-2xl font-bold">
            {user.name?.[0] || user.email[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user.name || 'User'}</h2>
            <p className="text-[var(--color-text-muted)]">{user.email}</p>
            {user.company && (
              <div className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] mt-1">
                <Building2 className="w-3.5 h-3.5" />
                {user.company}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* API Keys Section */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-[var(--color-turquoise-400)]" />
          <h2 className="text-xl font-semibold">API Keys</h2>
        </div>

        <p className="text-[var(--color-text-muted)] text-sm mb-6">
          Use API keys to integrate Hospice Tracker data with your tools and workflows.
        </p>

        {/* New Key Alert */}
        <AnimatePresence>
          {newKey && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 mb-6"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-400 font-medium">New API Key Created</span>
                <button onClick={() => setNewKey(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">×</button>
              </div>
              <p className="text-sm text-[var(--color-text-muted)] mb-3">
                Copy this key now — it won't be shown again.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded bg-[var(--color-bg-tertiary)] font-mono text-sm break-all">
                  {newKey}
                </code>
                <button
                  onClick={copyKey}
                  className="p-2 rounded-lg bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-hover)]"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Key Form */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Key name (e.g., Production CRM)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] focus:border-[var(--color-turquoise-400)] focus:outline-none transition-colors"
          />
          <button
            onClick={createApiKey}
            disabled={loading || !newKeyName.trim()}
            className="px-4 py-2 rounded-lg bg-[var(--color-turquoise-500)] text-white hover:bg-[var(--color-turquoise-600)] disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Key
          </button>
        </div>

        {/* Keys List */}
        {apiKeys.length === 0 ? (
          <div className="text-center py-8 text-[var(--color-text-muted)]">
            <Key className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No API keys yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className={`p-4 rounded-lg border ${key.active ? 'bg-[var(--color-bg-tertiary)] border-[var(--color-border)]' : 'bg-red-500/5 border-red-500/20'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{key.name}</span>
                      {!key.active && (
                        <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">Revoked</span>
                      )}
                    </div>
                    <div className="text-sm text-[var(--color-text-muted)] mt-1">
                      Created {new Date(key.created_at).toLocaleDateString()} •
                      {key.last_used ? ` Last used ${new Date(key.last_used).toLocaleDateString()}` : ' Never used'} •
                      {key.requests_today}/{key.rate_limit} requests today
                    </div>
                  </div>
                  {key.active && (
                    <button
                      onClick={() => revokeApiKey(key.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* API Documentation Link */}
        <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
          <h3 className="font-medium mb-2">Quick Start</h3>
          <pre className="p-4 rounded-lg bg-[var(--color-bg-tertiary)] overflow-x-auto text-sm">
{`curl -X GET "https://hospicetracker.com/api/v1/providers?state=WA&classification=GREEN" \\
  -H "X-API-Key: YOUR_API_KEY"`}
          </pre>
        </div>
      </div>
    </div>
  );
}

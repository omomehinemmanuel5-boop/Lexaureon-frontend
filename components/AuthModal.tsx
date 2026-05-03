'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register(email, password, company);
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">
          {tab === 'login' ? 'Sign In to Lex Aureon' : 'Create Your Account'}
        </h2>

        {/* Tabs */}
        <div className="flex border border-slate-700 rounded-lg p-1 mb-5">
          {(['login', 'register'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 text-sm py-1.5 rounded-md transition-colors ${
                tab === t ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Password{tab === 'register' && ' (min 10 chars)'}
            </label>
            <input
              type="password"
              required
              minLength={tab === 'register' ? 10 : 1}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
          {tab === 'register' && (
            <div>
              <label className="block text-xs text-slate-400 mb-1">Company Name</label>
              <input
                type="text"
                required
                minLength={2}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {error && (
            <div className="text-sm text-red-400 bg-red-900/20 border border-red-700 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-sm border border-slate-600 text-slate-300 rounded-lg py-2 hover:border-slate-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 disabled:opacity-50 transition-colors"
            >
              {loading ? '...' : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, Eye, EyeOff, Flag, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onSuccess?: () => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      onSuccess?.();
    } catch (err: any) {
      const msg =
        err.code === 'auth/invalid-credential'
          ? 'Email o password non validi'
          : err.code === 'auth/too-many-requests'
          ? 'Troppi tentativi. Riprova tra qualche minuto.'
          : 'Errore di autenticazione. Riprova.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(163,230,53,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(163,230,53,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-lime-400/10 border border-lime-400/30 rounded-xl flex items-center justify-center mx-auto mb-3 glow-lime">
            <Lock className="w-6 h-6 text-lime-400" />
          </div>
          <h1 className="font-rajdhani font-bold text-3xl text-white uppercase tracking-widest">
            Admin Login
          </h1>
          <p className="text-zinc-500 font-rajdhani text-sm mt-1 tracking-wider">
            K<span className="text-lime-400">-GP</span> — Area Riservata
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="racing-card rounded-2xl p-6 space-y-4"
          id="admin-login-form"
        >
          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm font-rajdhani">{error}</p>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-zinc-400 text-xs font-rajdhani tracking-widest uppercase mb-1.5">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@kartgp.it"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white font-rajdhani text-sm placeholder-zinc-600 focus:outline-none focus:border-lime-400/60 focus:ring-1 focus:ring-lime-400/30 transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-zinc-400 text-xs font-rajdhani tracking-widest uppercase mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 pr-10 text-white font-rajdhani text-sm placeholder-zinc-600 focus:outline-none focus:border-lime-400/60 focus:ring-1 focus:ring-lime-400/30 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                aria-label={showPwd ? 'Nascondi password' : 'Mostra password'}
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            id="admin-login-submit"
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-zinc-900/40 border-t-zinc-900 rounded-full animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            {loading ? 'Accesso...' : 'Accedi'}
          </button>
        </form>
      </div>
    </div>
  );
}

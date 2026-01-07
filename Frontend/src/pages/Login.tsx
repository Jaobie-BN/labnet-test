import { useState } from 'react';
import { login } from '../services/auth.service';
import { Server, Lock, User as UserIcon, ArrowRight, Network, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-app relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-indigo-900/40 via-bg-app to-bg-app" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-secondary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-brand-primary/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-bg-surface backdrop-blur-xl rounded-2xl border border-border-subtle shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-br from-brand-secondary to-red-600 mb-6 shadow-lg shadow-orange-900/20">
              <Server className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">
              Network<span className="text-brand-secondary">Lab</span> Access
            </h1>
            <div className="flex items-center justify-center gap-2 text-text-secondary text-sm">
              <Network className="w-4 h-4" />
              <span>Department of Computer Engineering</span>
            </div>
          </div>

          {error && (
            <div className="bg-status-error/10 border border-status-error/20 rounded-lg p-3 mb-6 text-status-error text-sm text-center animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary ml-1" htmlFor="email">
                Institute Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-text-muted group-focus-within:text-brand-secondary transition-colors" />
                </div>
                <input
                  type="email"
                  id="email"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-app border border-border-subtle text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary/50 transition duration-200"
                  placeholder="student@kmitl.ac.th"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary ml-1" htmlFor="password">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-muted group-focus-within:text-brand-secondary transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-bg-app border border-border-subtle text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary/50 transition duration-200"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-primary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full group bg-linear-to-r from-brand-secondary to-red-600 hover:from-brand-secondary hover:to-red-500 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-orange-900/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-text-muted">
              Authorized access only. All activities are monitored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

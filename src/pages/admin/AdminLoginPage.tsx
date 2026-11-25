import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, AlertCircle, Clock, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Logo } from '../../components/common/Logo';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error, isLocked, lockoutRemainingSeconds, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    const success = await login({ email, password });
    if (success) {
      navigate(from, { replace: true });
    }
  };

  const formatLockoutTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-[#1A0917] flex flex-col justify-between text-white selection:bg-[#F5B2E2] selection:text-[#1E0B1A]">
      {/* Top Header */}
      <header className="p-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Logo />
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-[#FFD7F1]/70 hover:text-[#F5B2E2] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>До магазину</span>
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-[#250E20] border border-[#481A3F] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle glow accent */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#F5B2E2]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Title & Badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#391533] border border-[#5A2251] text-[#F5B2E2] text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Службовий вхід</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-white tracking-wide">
              Вхід до адмін-панелі
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mt-1 font-sans">
              Введіть облікові дані працівника магазину
            </p>
          </div>

          {/* Lockout Warning (US-7.1 Scenario 3) */}
          {isLocked && (
            <div className="mb-6 p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs sm:text-sm flex items-start gap-3 animate-fade-in">
              <Clock className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Вхід тимчасово заблоковано</p>
                <p className="mt-0.5 text-white/80 leading-relaxed">
                  5 невдалих спроб поспіль. Повторна спроба буде доступна через{' '}
                  <span className="font-mono font-bold text-[#F5B2E2]">
                    {formatLockoutTime(lockoutRemainingSeconds)}
                  </span>.
                </p>
              </div>
            </div>
          )}

          {/* Generic Error Warning (US-7.1 Scenario 2) */}
          {error && !isLocked && (
            <div className="mb-6 p-3.5 rounded-2xl bg-red-950/50 border border-red-500/30 text-red-200 text-xs sm:text-sm flex items-center gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#FFD7F1]/80 mb-1.5">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  autoComplete="username"
                  required
                  disabled={isLocked || isLoading}
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (error) clearError();
                  }}
                  placeholder="name@fiore.ua"
                  className="w-full bg-[#1A0917] border border-[#481A3F] focus:border-[#F5B2E2] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#F5B2E2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#FFD7F1]/80 mb-1.5">
                Пароль
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLocked || isLoading}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (error) clearError();
                  }}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-[#1A0917] border border-[#481A3F] focus:border-[#F5B2E2] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#F5B2E2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/40 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Сховати пароль' : 'Показати пароль'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLocked || isLoading || !email || !password}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#F5B2E2] hover:bg-[#FDBDE9] text-[#1E0B1A] font-semibold text-sm transition-all shadow-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Перевірка даних...</span>
                </>
              ) : (
                <span>Увійти до панелі</span>
              )}
            </button>
          </form>

        </div>
      </main>

      {/* Footer Note */}
      <footer className="p-6 text-center text-xs text-white/40">
        Fiore Luxury Flowers © 2026. Захищена зона для персоналу.
      </footer>
    </div>
  );
};

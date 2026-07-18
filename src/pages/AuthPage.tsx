import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { classNames } from '../lib/utils';

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') ?? '/account';

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result =
      mode === 'signin'
        ? await signIn(form.email, form.password)
        : await signUp(form.email, form.password, form.firstName, form.lastName);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      toast(result.error, 'error');
    } else {
      toast(mode === 'signin' ? 'Welcome back' : 'Account created — welcome to LuxeLayer');
      navigate(redirect);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-luxury-gradient lg:grid lg:grid-cols-2">
      {/* Editorial side */}
      <div className="relative hidden lg:block">
        <img
          src="https://images.pexels.com/photos/3373738/pexels-photo-3373738.jpeg?auto=compress&cs=tinysrgb&w=1400"
          alt="Luxury beauty"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-ink-900/70 via-ink-900/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <Link to="/" className="font-display text-3xl font-semibold text-warmwhite">
            Luxe<span className="text-gradient-gold">Layer</span>
          </Link>
          <div>
            <Sparkles className="h-6 w-6 text-champagne-300" />
            <h2 className="mt-4 max-w-md font-display text-4xl font-medium text-warmwhite">
              The world's finest beauty, in one edit.
            </h2>
            <p className="mt-3 max-w-md font-serif text-lg font-light text-warmwhite/85">
              Sign in to track orders, save your wishlist, and unlock members-only offers.
            </p>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex min-h-screen items-center justify-center p-6 lg:min-h-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center lg:hidden">
            <Link to="/" className="font-display text-3xl font-semibold">
              Luxe<span className="text-gradient-gold">Layer</span>
            </Link>
          </div>

          <h1 className="font-display text-display-md font-medium text-ink-900">
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="mt-2 text-sm text-ink-600">
            {mode === 'signin' ? 'Sign in to your LuxeLayer account' : 'Join the LuxeLayer inner circle'}
          </p>

          {/* Toggle */}
          <div className="mt-6 flex rounded-full bg-cream p-1">
            <button
              onClick={() => setMode('signin')}
              className={classNames('flex-1 rounded-full py-2.5 text-sm font-medium transition', mode === 'signin' ? 'bg-ink-900 text-warmwhite' : 'text-ink-600')}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={classNames('flex-1 rounded-full py-2.5 text-sm font-medium transition', mode === 'signup' ? 'bg-ink-900 text-warmwhite' : 'text-ink-600')}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <AnimatePresence mode="popLayout">
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid gap-4 sm:grid-cols-2"
                >
                  <div>
                    <label className="label-luxe">First Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                      <input
                        required
                        value={form.firstName}
                        onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                        className="input-luxe pl-10"
                        placeholder="First name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label-luxe">Last Name</label>
                    <input
                      required
                      value={form.lastName}
                      onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                      className="input-luxe"
                      placeholder="Last name"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="label-luxe">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="input-luxe pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="label-luxe">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  required
                  type="password"
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="input-luxe pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {mode === 'signin' && (
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs text-ink-600 link-underline hover:text-ink-900">
                  Forgot password?
                </Link>
              </div>
            )}

            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-ink-500">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="text-ink-800 link-underline">Terms</Link> and{' '}
            <Link to="/privacy" className="text-ink-800 link-underline">Privacy Policy</Link>.
          </p>

          <div className="mt-6 rounded-2xl bg-champagne-50 p-4 text-center text-xs text-ink-600">
            <p className="font-medium text-champagne-700">Demo Admin Access</p>
            <p className="mt-1">After signing up, an admin can promote your account in the database to access the admin dashboard.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

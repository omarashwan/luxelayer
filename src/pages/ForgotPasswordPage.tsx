import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

type Status = 'form' | 'sent';

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('form');

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const redirectTo = `${window.location.origin}/reset-password`;
    const result = await resetPassword(email.trim(), redirectTo);
    setLoading(false);

    if (result.error) {
      const msg = result.error.toLowerCase();
      if (msg.includes('rate limit')) {
        setError('Too many requests. Please wait a moment and try again.');
      } else if (msg.includes('network') || msg.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(result.error);
      }
      toast(result.error, 'error');
      return;
    }

    // Supabase does not reveal whether the email exists — always show success.
    setStatus('sent');
    toast('Reset link sent — check your inbox', 'success');
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
              Recover access to your account and continue your beauty journey.
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

          {status === 'form' ? (
            <>
              <h1 className="font-display text-display-md font-medium text-ink-900">
                Forgot Password
              </h1>
              <p className="mt-2 text-sm text-ink-600">
                Enter your email and we'll send you a secure link to reset your password.
              </p>

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="label-luxe">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-luxe pl-10"
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-champagne-300 border-t-warmwhite" />
                      Sending link…
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <Link
                to="/auth"
                className="mt-6 flex items-center justify-center gap-1.5 text-sm text-ink-600 link-underline"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Sign In
              </Link>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-champagne-50">
                <CheckCircle2 className="h-8 w-8 text-champagne-600" />
              </div>
              <h1 className="font-display text-display-md font-medium text-ink-900">Check Your Inbox</h1>
              <p className="mt-3 text-sm text-ink-600">
                If an account exists for <span className="font-medium text-ink-900">{email}</span>, a password
                reset link is on its way. The link expires in one hour.
              </p>
              <p className="mt-2 text-xs text-ink-500">
                Didn't receive an email? Check your spam folder, or{' '}
                <button
                  type="button"
                  onClick={() => { setStatus('form'); setEmail(''); }}
                  className="text-ink-800 link-underline"
                >
                  try a different address
                </button>
                .
              </p>

              <Link to="/auth" className="btn-outline mt-6 w-full">
                <ArrowLeft className="h-4 w-4" /> Back to Sign In
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

type Stage = 'checking' | 'valid' | 'invalid' | 'success';
type Strength = { score: number; label: string; color: string };

function passwordStrength(pw: string): Strength {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  score = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
  const idx = score as 0 | 1 | 2 | 3 | 4;
  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['bg-rose-400', 'bg-rose-400', 'bg-amber-400', 'bg-champagne-400', 'bg-emerald-500'];
  return { score, label: labels[idx], color: colors[idx] };
}

export function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [stage, setStage] = useState<Stage>('checking');
  const [invalidReason, setInvalidReason] = useState<string>('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = passwordStrength(password);

  // Detect the recovery session from the URL hash. Supabase delivers the
  // access_token & refresh_token in the hash fragment as a type=recovery flow.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // detectSessionInUrl is on, but calling getSession explicitly guarantees
      // we have the recovery session before allowing a password update.
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) {
        setStage('valid');
      } else {
        // If getSession returns nothing, the link may be expired/invalid.
        const hash = window.location.hash;
        if (hash.includes('type=recovery') || hash.includes('error')) {
          const params = new URLSearchParams(hash.replace(/^#/, ''));
          const errDesc = params.get('error_description') || params.get('error_code');
          setInvalidReason(
            errDesc
              ? decodeURIComponent(errDesc).replace(/\+/g, ' ')
              : 'This password reset link is invalid or has expired. Please request a new one.',
          );
        } else {
          setInvalidReason(
            'This password reset link is invalid or has expired. Please request a new one.',
          );
        }
        setStage('invalid');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const passwordsMatch = confirm.length > 0 && password === confirm;
  const meetsMin = password.length >= 8;
  const canSubmit = stage === 'valid' && meetsMin && passwordsMatch && strength.score >= 2 && !loading;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!meetsMin) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (strength.score < 2) {
      setError('Please choose a stronger password (mix of letters, numbers, and symbols).');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await updatePassword(password);
    setLoading(false);

    if (result.error) {
      const msg = result.error.toLowerCase();
      if (msg.includes('same') || msg.includes('identical')) {
        setError('Your new password must be different from your current password.');
      } else if (msg.includes('weak') || msg.includes('common')) {
        setError('That password is too common. Please choose a stronger one.');
      } else if (msg.includes('session') || msg.includes('token') || msg.includes('expired')) {
        setStage('invalid');
        setInvalidReason('Your recovery session has expired. Please request a new reset link.');
      } else if (msg.includes('network') || msg.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(result.error);
      }
      toast(result.error, 'error');
      return;
    }

    setStage('success');
    toast('Password updated successfully', 'success');
    // Sign out the recovery session so the user re-authenticates cleanly.
    await supabase.auth.signOut();
    setTimeout(() => navigate('/auth'), 2600);
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
            <ShieldCheck className="h-6 w-6 text-champagne-300" />
            <h2 className="mt-4 max-w-md font-display text-4xl font-medium text-warmwhite">
              Secure your account.
            </h2>
            <p className="mt-3 max-w-md font-serif text-lg font-light text-warmwhite/85">
              Choose a new password to regain access to your LuxeLayer account.
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

          {stage === 'checking' && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-champagne-300 border-t-champagne-500" />
              <p className="mt-4 text-sm text-ink-600">Verifying your reset link…</p>
            </div>
          )}

          {stage === 'invalid' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
                <AlertCircle className="h-8 w-8 text-rose-600" />
              </div>
              <h1 className="font-display text-display-md font-medium text-ink-900">Link Invalid</h1>
              <p className="mt-3 text-sm text-ink-600">{invalidReason}</p>
              <Link to="/forgot-password" className="btn-primary mt-6 w-full">
                Request New Link <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/auth" className="mt-4 block text-sm text-ink-600 link-underline">
                Back to Sign In
              </Link>
            </motion.div>
          )}

          {stage === 'valid' && (
            <>
              <h1 className="font-display text-display-md font-medium text-ink-900">Reset Password</h1>
              <p className="mt-2 text-sm text-ink-600">Choose a strong new password for your account.</p>

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="label-luxe">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                    <input
                      required
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-luxe pl-10 pr-10"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Strength meter */}
                  {password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1.5">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                              i < strength.score ? strength.color : 'bg-ink-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="mt-1 text-xs text-ink-500">Strength: <span className="font-medium text-ink-700">{strength.label}</span></p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="label-luxe">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                    <input
                      required
                      type={showConfirm ? 'text' : 'password'}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="input-luxe pl-10 pr-10"
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirm.length > 0 && !passwordsMatch && (
                    <p className="mt-1.5 text-xs text-rose-600">Passwords do not match.</p>
                  )}
                  {confirm.length > 0 && passwordsMatch && (
                    <p className="mt-1.5 text-xs text-emerald-600">Passwords match.</p>
                  )}
                </div>

                <div className="rounded-xl bg-cream p-3 text-xs text-ink-600">
                  <p className="font-medium text-ink-700">Password requirements:</p>
                  <ul className="mt-1.5 space-y-0.5">
                    <li className={meetsMin ? 'text-emerald-700' : ''}>• At least 8 characters</li>
                    <li className={strength.score >= 2 ? 'text-emerald-700' : ''}>• Mix of uppercase, lowercase, numbers & symbols</li>
                  </ul>
                </div>

                {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

                <button type="submit" disabled={!canSubmit} className="btn-primary w-full">
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-champagne-300 border-t-warmwhite" />
                      Updating…
                    </>
                  ) : (
                    <>
                      Update Password
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {stage === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-champagne-50">
                <CheckCircle2 className="h-8 w-8 text-champagne-600" />
              </div>
              <h1 className="font-display text-display-md font-medium text-ink-900">Password Updated</h1>
              <p className="mt-3 text-sm text-ink-600">
                Your password has been changed successfully. Redirecting you to sign in…
              </p>
              <div className="mx-auto mt-5 h-1 w-32 overflow-hidden rounded-full bg-ink-100">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.4, ease: 'linear' }}
                  className="h-full bg-gradient-to-r from-champagne-400 to-gold-500"
                />
              </div>
              <Link to="/auth" className="mt-6 block text-sm text-ink-600 link-underline">
                Go to Sign In now
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import shieldLogo from '@/assets/unbreakable-shield.png';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isRecoverySession, setIsRecoverySession] = useState(false);

  // Supabase fires PASSWORD_RECOVERY event when the user clicks the email link
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoverySession(true);
      }
    });

    // Also check if we already have a session (user might already be on recovery)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsRecoverySession(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setFormError(error.message || 'Failed to reset password.');
        toast.error(error.message || 'Failed to reset password.');
      } else {
        setSuccess(true);
        toast.success('Password updated! Redirecting…');
        setTimeout(() => navigate('/', { replace: true }), 2000);
      }
    } catch (err: any) {
      setFormError(err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,85,0,0.08) 0%, #080808 60%)' }}
    >
      {/* Subtle top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(255,85,0,0.25) 0%, transparent 70%)' }}
      />

      {/* Back */}
      <button
        onClick={() => navigate('/signin')}
        className="absolute top-5 left-5 flex items-center gap-1.5 text-[#666] hover:text-white transition-colors text-sm"
      >
        <ArrowLeft size={16} /> Back to sign in
      </button>

      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <img src={shieldLogo} alt="UNBREAKABLE" className="h-20 w-20 object-contain mb-3" />
        <h1 className="font-heading font-black text-2xl tracking-[0.15em] text-white uppercase">
          UNBREAKABLE
        </h1>
        <p className="text-[#666] text-xs tracking-[0.2em] uppercase mt-1">Live Without Limits</p>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm"
        style={{
          background: 'rgba(14,14,14,0.9)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          boxShadow: '0 0 40px rgba(0,0,0,0.5)',
        }}
      >
        <div className="p-6">
          {success ? (
            /* ── Success state ── */
            <div className="text-center space-y-4">
              <div
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,85,0,0.1)', border: '1px solid rgba(255,85,0,0.2)' }}
              >
                <CheckCircle className="w-8 h-8 text-[#FF5500]" />
              </div>
              <h2 className="font-heading font-bold text-xl tracking-wide text-white">Password Updated</h2>
              <p className="text-[#888] text-sm leading-relaxed">
                Your password has been reset. Taking you to the app…
              </p>
              <div className="w-5 h-5 border-2 border-[#FF5500]/30 border-t-[#FF5500] rounded-full animate-spin mx-auto" />
            </div>
          ) : !isRecoverySession ? (
            /* ── No valid recovery session ── */
            <div className="text-center space-y-4">
              <h2 className="font-heading font-bold text-xl tracking-wide text-white">Invalid or Expired Link</h2>
              <p className="text-[#888] text-sm leading-relaxed">
                This password reset link may have expired or already been used.
                Request a new one below.
              </p>
              <button
                onClick={() => navigate('/forgot-password')}
                className="w-full py-3.5 rounded-xl font-heading font-bold text-sm uppercase tracking-wider text-white transition-all active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #FF5500 0%, #CC4400 100%)',
                  boxShadow: '0 0 20px rgba(255,85,0,0.35)',
                }}
              >
                Request New Reset Link
              </button>
            </div>
          ) : (
            /* ── Reset form ── */
            <>
              <h2 className="font-heading font-bold text-xl tracking-wide text-white text-center mb-2">
                Choose New Password
              </h2>
              <p className="text-[#888] text-sm text-center mb-6">
                Enter your new password below. Make it at least 6 characters.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-[#666] font-semibold">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-white placeholder-[#444] outline-none transition-all focus:ring-1 focus:ring-[#FF5500]/50"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                      required
                      minLength={6}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888] transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-[#666] font-semibold">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-[#444] outline-none transition-all focus:ring-1 focus:ring-[#FF5500]/50"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {/* Password strength indicator */}
                {password.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className="h-1 flex-1 rounded-full transition-all"
                          style={{
                            background:
                              password.length >= level * 3
                                ? level <= 1
                                  ? '#ef4444'
                                  : level <= 2
                                  ? '#f59e0b'
                                  : level <= 3
                                  ? '#FF5500'
                                  : '#22c55e'
                                : 'rgba(255,255,255,0.06)',
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-[#666]">
                      {password.length < 6
                        ? 'Too short'
                        : password.length < 8
                        ? 'Weak'
                        : password.length < 10
                        ? 'Good'
                        : 'Strong'}
                    </p>
                  </div>
                )}

                {formError && (
                  <div className="text-sm text-[#FF5500] bg-[#FF5500]/10 border border-[#FF5500]/20 rounded-xl px-4 py-3">
                    {formError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || password.length < 6 || password !== confirmPassword}
                  className="w-full py-3.5 rounded-xl font-heading font-bold text-base uppercase tracking-wider text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #FF5500 0%, #CC4400 100%)',
                    boxShadow: loading
                      ? 'none'
                      : '0 0 20px rgba(255,85,0,0.35), 0 0 60px rgba(255,85,0,0.12)',
                  }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Updating…</span>
                    </div>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

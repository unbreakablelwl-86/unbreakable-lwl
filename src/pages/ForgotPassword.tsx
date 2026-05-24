import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import shieldLogo from '@/assets/unbreakable-shield.png';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message || 'Failed to send reset link.');
      } else {
        setSent(true);
        toast.success('Reset link sent! Check your inbox.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, hsl(var(--primary) / 0.08) 0%, hsl(var(--background)) 60%)' }}
    >
      {/* Subtle top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, hsl(var(--primary) / 0.25) 0%, transparent 70%)' }}
      />

      {/* Back */}
      <button
        onClick={() => navigate('/signin')}
        className="absolute top-5 left-5 flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
      >
        <ArrowLeft size={16} /> Back to sign in
      </button>

      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <img src={shieldLogo} alt="UNBREAKABLE" className="h-20 w-20 object-contain mb-3" />
        <h1 className="font-heading font-black text-2xl tracking-[0.15em] text-foreground uppercase">
          UNBREAKABLE
        </h1>
        <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase mt-1">Live Without Limits</p>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm"
        style={{
          
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          boxShadow: '0 0 40px rgba(0,0,0,0.5)',
        }}
      >
        <div className="p-6">
          {sent ? (
            /* ── Success state ── */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                className="bg-primary/10 border border-primary/20">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-heading font-bold text-xl tracking-wide text-foreground">Check Your Email</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We've sent a password reset link to <strong className="text-foreground">{email}</strong>.
                Click the link in the email to choose a new password.
              </p>
              <p className="text-muted-foreground text-xs">
                Didn't get it? Check your spam folder, or{' '}
                <button onClick={() => setSent(false)} className="text-primary hover:underline">
                  try again
                </button>.
              </p>
              <button
                onClick={() => navigate('/signin')}
                className="w-full py-3 rounded-xl font-heading font-bold text-sm uppercase tracking-wider text-foreground transition-all active:scale-[0.98]"
                style={{
                  
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <h2 className="font-heading font-bold text-xl tracking-wide text-foreground text-center mb-2">
                Reset Password
              </h2>
              <p className="text-muted-foreground text-sm text-center mb-6">
                Enter your email and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-foreground placeholder-[#444] outline-none transition-all focus:ring-1 focus:ring-primary/50"
                      className="bg-background/50 border border-border"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-3.5 rounded-xl font-heading font-bold text-base uppercase tracking-wider text-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                  style={{
                    
                    boxShadow: loading ? 'none' : '0 0 20px rgba(255,85,0,0.35), 0 0 60px rgba(255,85,0,0.12)',
                  }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending…</span>
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-4">
                Remember your password?{' '}
                <Link to="/signin" className="text-primary hover:underline font-semibold">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

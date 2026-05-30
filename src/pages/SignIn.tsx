import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Lock, User, Cake, ArrowLeft, Eye, EyeOff, Tag, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import shieldLogo from '@/assets/unbreakable-shield.png';


/* ═══ OTP Code Input — 6 individual digits ═══ */
function OtpInput({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, '').slice(0, 6).split('');

  const handleChange = (index: number, char: string) => {
    // Only allow digits
    const digit = char.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    onChange(newDigits.join(''));
    // Auto-focus next
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {[0, 1, 2, 3, 4, 5].map(i => (
        <input
          key={i}
          ref={el => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          disabled={disabled}
          className="w-11 h-14 text-center text-xl font-bold rounded-xl bg-background/50 border border-border text-foreground outline-none transition-all focus:ring-2 focus:ring-primary/50 focus:border-primary/50 disabled:opacity-40"
        />
      ))}
    </div>
  );
}


export default function SignIn() {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Default to signup mode if ?mode=signup in URL (e.g. from "JOIN FREE" on landing)
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // OTP verification state
  const [verifyStep, setVerifyStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    try {
      if (mode === 'signin') {
        // Clear any stale session data before signing in
        try {
          await supabase.auth.signOut();
        } catch {}
        const { error } = await signIn(email, password);
        if (error) {
          setFormError(error.message || 'Failed to sign in.');
          toast.error(error.message || 'Failed to sign in.');
        } else {
          toast.success('Welcome back! 💪');
          navigate('/');
        }
      } else {
        if (!fullName.trim()) { setFormError('Enter your full name.'); setLoading(false); return; }
        if (!dateOfBirth) { setFormError('Enter your date of birth.'); setLoading(false); return; }
        if (password.length < 6) { setFormError('Password must be at least 6 characters.'); setLoading(false); return; }
        if (!acceptedTerms) { setFormError('Please accept the terms.'); setLoading(false); return; }

        const { error } = await signUp(email, password, fullName);
        if (error) {
          let msg = error.message || 'Failed to create account.';
          if (error.message?.includes('already registered')) msg = 'This email is already registered. Try signing in.';
          setFormError(msg);
          toast.error(msg);
        } else {
          // Move to OTP verification step
          setVerifyStep(true);
          setResendCooldown(60);
          toast.success('Verification code sent to your email! 📧');
        }
      }
    } catch (err: any) {
      setFormError(err?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      setFormError('Enter the 6-digit code from your email.');
      return;
    }
    setVerifying(true);
    setFormError(null);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'email',
      });

      if (error) {
        setFormError(error.message || 'Invalid code. Please try again.');
        toast.error('Invalid code. Please try again.');
      } else if (data?.user) {
        // Email confirmed — now save profile extras (DOB, promo code)
        try {
          if (dateOfBirth) {
            await supabase.from('profiles').update({ date_of_birth: dateOfBirth }).eq('user_id', data.user.id);
          }
          if (promoCode.trim()) {
            try {
              const { data: promoResult, error: promoError } = await supabase.functions.invoke('redeem-promo-code', {
                body: { code: promoCode.trim() },
              });
              if (promoError) {
                console.error('Promo code error:', promoError);
              } else if (promoResult?.success) {
                toast.success(`🎉 Promo code applied! ${promoResult.tokens_credited} coins credited — ${promoResult.tier} tier for ${promoResult.duration_months} months`);
              } else {
                toast.error(promoResult?.error || 'Invalid promo code');
              }
            } catch (promoErr) {
              console.error('Failed to redeem promo code:', promoErr);
            }
          }
        } catch {}
        toast.success('Email verified! Welcome to the movement. 🔥');
        navigate('/');
      }
    } catch (err: any) {
      setFormError(err?.message || 'Verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setFormError(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) {
        setFormError(error.message || 'Failed to resend code.');
      } else {
        setResendCooldown(60);
        toast.success('New verification code sent! 📧');
      }
    } catch (err: any) {
      setFormError(err?.message || 'Failed to resend code.');
    }
  };

  // ─── OTP Verification Screen ───
  if (verifyStep) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10 relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, hsl(var(--primary) / 0.08) 0%, hsl(var(--background)) 60%)' }}>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, hsl(var(--primary) / 0.25) 0%, transparent 70%)' }} />

        <button
          onClick={() => { setVerifyStep(false); setOtpCode(''); setFormError(null); }}
          className="absolute top-5 left-5 flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-heading font-black text-2xl tracking-[0.1em] text-foreground uppercase">
            VERIFY YOUR EMAIL
          </h1>
          <p className="text-muted-foreground text-sm mt-2 text-center max-w-xs">
            We sent a 6-digit code to<br />
            <span className="text-foreground font-medium">{email}</span>
          </p>
        </div>

        <div className="w-full max-w-sm" style={{
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          boxShadow: '0 0 40px rgba(0,0,0,0.5)',
        }}>
          <div className="p-6 space-y-5">
            <OtpInput value={otpCode} onChange={setOtpCode} disabled={verifying} />

            {formError && (
              <div className="text-sm text-primary bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 text-center">
                {formError}
              </div>
            )}

            <button
              onClick={handleVerifyOtp}
              disabled={verifying || otpCode.length !== 6}
              className="w-full py-3.5 rounded-xl font-heading font-bold text-base uppercase tracking-wider text-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              style={{
                boxShadow: verifying ? 'none' : '0 0 20px rgba(255,85,0,0.35), 0 0 60px rgba(255,85,0,0.12)',
              }}
            >
              {verifying ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying…</span>
                </div>
              ) : (
                'VERIFY'
              )}
            </button>

            <div className="text-center">
              <button
                onClick={handleResendCode}
                disabled={resendCooldown > 0}
                className="text-sm text-muted-foreground hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : "Didn't receive the code? Resend"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10" />
      </div>
    );
  }

  // ─── Main Sign In / Sign Up Form ───
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, hsl(var(--primary) / 0.08) 0%, hsl(var(--background)) 60%)' }}>

      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, hsl(var(--primary) / 0.25) 0%, transparent 70%)' }} />

      {/* Back to home */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-5 left-5 flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <img src={shieldLogo} alt="UNBREAKABLE" className="h-24 w-24 object-contain shield-pulse mb-4" />
        <h1 className="font-heading font-black text-3xl tracking-[0.15em] text-foreground uppercase">
          UNBREAKABLE
        </h1>
        <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase mt-1">Live Without Limits</p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-sm" style={{
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        boxShadow: '0 0 40px rgba(0,0,0,0.5)',
      }}>
        {/* Tab Toggle */}
        <div className="flex border-b border-border">
          <button
            onClick={() => { setMode('signin'); setFormError(null); }}
            className={`flex-1 py-3.5 text-sm font-bold uppercase tracking-wider transition-all relative ${
              mode === 'signin' ? 'text-primary' : 'text-muted-foreground hover:text-muted-foreground'
            }`}
          >
            Sign In
            {mode === 'signin' && (
              <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-primary rounded-full"
                style={{ boxShadow: '0 0 10px rgba(255,85,0,0.5)' }} />
            )}
          </button>
          <button
            onClick={() => { setMode('signup'); setFormError(null); }}
            className={`flex-1 py-3.5 text-sm font-bold uppercase tracking-wider transition-all relative ${
              mode === 'signup' ? 'text-primary' : 'text-muted-foreground hover:text-muted-foreground'
            }`}
          >
            Sign Up
            {mode === 'signup' && (
              <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-primary rounded-full"
                style={{ boxShadow: '0 0 10px rgba(255,85,0,0.5)' }} />
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {mode === 'signup' && (
            <>
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Your name"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-foreground placeholder-[#444] outline-none transition-all focus:ring-1 focus:ring-primary/50 bg-background/50 border border-border"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Date of Birth</label>
                <div className="relative">
                  <Cake className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={e => setDateOfBirth(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-foreground outline-none transition-all focus:ring-1 focus:ring-primary/50 bg-background/50 border border-border"
                    required
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-foreground placeholder-[#444] outline-none transition-all focus:ring-1 focus:ring-primary/50 bg-background/50 border border-border"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Password</label>
              {mode === 'signin' && (
                <Link to="/forgot-password" className="text-[11px] text-primary hover:underline font-medium">
                  Forgot password?
                </Link>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-foreground placeholder-[#444] outline-none transition-all focus:ring-1 focus:ring-primary/50 bg-background/50 border border-border"
                required
                minLength={6}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Promo code — signup only */}
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Promo Code <span className="normal-case opacity-70">(optional)</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Enter code"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-foreground placeholder-[#444] outline-none transition-all focus:ring-1 focus:ring-primary/50 bg-background/50 border border-border uppercase tracking-wider"
                />
              </div>
            </div>
          )}

          {formError && (
            <div className="text-sm text-primary bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
              {formError}
            </div>
          )}

          {mode === 'signup' && (
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={e => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-[#FF5500]"
              />
              <span className="text-[11px] text-muted-foreground leading-relaxed">
                I agree to the{' '}
                <Link to="/terms" className="text-primary hover:underline">Terms</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </span>
            </label>
          )}

          <button
            type="submit"
            disabled={loading || (mode === 'signup' && !acceptedTerms)}
            className="w-full py-3.5 rounded-xl font-heading font-bold text-base uppercase tracking-wider text-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            style={{
              boxShadow: loading ? 'none' : '0 0 20px rgba(255,85,0,0.35), 0 0 60px rgba(255,85,0,0.12)',
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{mode === 'signin' ? 'Signing in…' : 'Creating account…'}</span>
              </div>
            ) : (
              mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'
            )}
          </button>
        </form>
      </div>

      {/* Footer spacer */}
      <div className="mt-10" />
    </div>
  );
}

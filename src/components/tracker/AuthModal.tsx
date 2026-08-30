import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Lock, User, Cake, Gift, ShieldCheck, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
}

/* ═══ OTP Code Input — 6 individual digits ═══ */
function OtpInput({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, '').slice(0, 6).split('');

  const handleChange = (index: number, char: string) => {
    const digit = char.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    onChange(newDigits.join(''));
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
          className="w-11 h-14 text-center text-xl font-bold rounded-xl bg-input border border-border text-foreground outline-none transition-all focus:ring-2 focus:ring-primary/50 focus:border-primary/50 disabled:opacity-40"
        />
      ))}
    </div>
  );
}

export function AuthModal({ isOpen, onClose, defaultMode = 'signin' }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // OTP verification state
  const [verifyStep, setVerifyStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Reset all local state whenever the modal is closed, so re-opening starts fresh
  useEffect(() => {
    if (!isOpen) {
      setVerifyStep(false);
      setOtpCode('');
      setFormError(null);
    }
  }, [isOpen]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Sync mode when defaultMode changes
  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    try {
      if (mode === 'signin') {
        // Clear any stale session before sign-in
        try { await supabase.auth.signOut(); } catch {}
        const { error } = await signIn(email, password);
        if (error) {
          console.error('Sign in error:', error);
          const msg = error.message || 'Failed to sign in. Please try again.';
          setFormError(msg);
          toast.error(msg);
        } else {
          toast.success('Welcome back!');
          onClose();
        }
      } else {
        if (!fullName.trim()) {
          setFormError('Please enter your full name.');
          toast.error('Please enter your full name');
          setLoading(false);
          return;
        }

        if (!dateOfBirth) {
          setFormError('Please enter your date of birth.');
          toast.error('Please enter your date of birth');
          setLoading(false);
          return;
        }
        
        if (password.length < 6) {
          setFormError('Password must be at least 6 characters.');
          toast.error('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        
        // Signup attempt
        const { error } = await signUp(email, password, fullName);
        if (error) console.error('Signup error:', error.message);
        if (error) {
          console.error('Sign up error details:', error.message, error);
          let msg: string;
          if (error.message?.includes('already registered')) {
            msg = 'This email is already registered. Try signing in instead.';
          } else if (error.message?.toLowerCase().includes('password') || error.message?.toLowerCase().includes('weak')) {
            msg = 'Please choose a stronger password (mix letters, numbers, symbols).';
          } else if (error.message?.includes('Signups not allowed') || error.message?.includes('422')) {
            msg = 'Signups are temporarily unavailable. Please try again in a moment.';
          } else {
            msg = error.message || 'Failed to create account. Please try again.';
          }
          setFormError(msg);
          toast.error(msg);
        } else {
          // Account created but not yet confirmed — move to the code-entry step.
          // DOB, promo code, and the conversion pixel all fire after the code
          // is verified (see handleVerifyOtp), once there's an actual session.
          setVerifyStep(true);
          setResendCooldown(60);
          toast.success('Verification code sent to your email!');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const msg = err?.message || 'An unexpected error occurred. Please try again.';
      setFormError(msg);
      toast.error(msg);
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
        } catch (dobErr) {
          console.error('Failed to save DOB:', dobErr);
        }
        // Meta Pixel — track signup conversion
        if (typeof window !== 'undefined' && (window as any).fbq) {
          (window as any).fbq('track', 'CompleteRegistration');
        }
        toast.success('Email verified! Welcome to the movement.');
        onClose();
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
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) {
        setFormError(error.message || 'Failed to resend code.');
      } else {
        setResendCooldown(60);
        toast.success('New verification code sent!');
      }
    } catch (err: any) {
      setFormError(err?.message || 'Failed to resend code.');
    }
  };

  // ─── OTP Verification Step ───
  if (verifyStep) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-card border-border bg-background border-border">
          <DialogHeader>
            <button
              type="button"
              onClick={() => { setVerifyStep(false); setOtpCode(''); setFormError(null); }}
              className="absolute left-4 top-4 flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="flex flex-col items-center pt-2">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-3">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <DialogTitle className="font-display text-xl tracking-wide text-center">
                VERIFY YOUR EMAIL
              </DialogTitle>
              <DialogDescription className="text-center text-muted-foreground text-sm mt-1">
                We sent a 6-digit code to<br />
                <span className="text-foreground font-medium">{email}</span>
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <OtpInput value={otpCode} onChange={setOtpCode} disabled={verifying} />

            {formError && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 text-sm text-destructive text-center">
                {formError}
              </div>
            )}

            <Button
              type="button"
              className="w-full font-display tracking-wide"
              onClick={handleVerifyOtp}
              disabled={verifying || otpCode.length !== 6}
            >
              {verifying ? 'Verifying…' : 'Verify'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0}
                className="text-sm text-muted-foreground hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Didn't receive the code? Resend"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border bg-background border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-wide text-center">
            {mode === 'signin' ? 'WELCOME BACK' : 'JOIN THE MOVEMENT'}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {mode === 'signin' ? 'Sign in to your account' : 'Create your account to get started'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-muted-foreground">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Your name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10 bg-input border-border"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob" className="text-muted-foreground">
                    Date of Birth <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Cake className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="dob"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="pl-10 bg-input border-border"
                      required
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Required for age-group features & leaderboards</p>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground">
                Email <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-input border-border"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-muted-foreground">
                Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-input border-border"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="promoCode" className="text-muted-foreground">
                  Promo Code <span className="text-xs text-muted-foreground/60">(optional)</span>
                </Label>
                <div className="relative">
                  <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="promoCode"
                    type="text"
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="pl-10 bg-input border-border"
                  />
                </div>
              </div>
            )}

            {formError && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 text-sm text-destructive">
                {formError}
              </div>
            )}

            {mode === 'signup' && (
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary hover:underline" onClick={() => onClose()}>
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary hover:underline" onClick={() => onClose()}>
                    Privacy Policy
                  </Link>
                </Label>
              </div>
            )}

            <Button
              type="submit"
              className="w-full font-display tracking-wide"
              disabled={loading || (mode === 'signup' && !acceptedTerms)}
            >
              {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-primary hover:underline font-semibold"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

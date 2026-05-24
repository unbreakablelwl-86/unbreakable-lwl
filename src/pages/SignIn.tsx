import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Lock, User, Cake, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import shieldLogo from '@/assets/unbreakable-shield.png';
import lwlFilmstrip from '@/assets/lwl-filmstrip-web.png';

export default function SignIn() {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    try {
      if (mode === 'signin') {
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
          try {
            const { data: { user: newUser } } = await supabase.auth.getUser();
            if (newUser && dateOfBirth) {
              await supabase.from('profiles').update({ date_of_birth: dateOfBirth }).eq('user_id', newUser.id);
            }
          } catch {}
          toast.success('Account created! Welcome to the movement. 🔥');
          navigate('/');
        }
      }
    } catch (err: any) {
      setFormError(err?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

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

      {/* LWL filmstrip footer */}
      <div className="mt-10 opacity-30">
        <img src={lwlFilmstrip} alt="Live Without Limits" className="h-8 object-contain" />
      </div>
    </div>
  );
}

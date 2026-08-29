import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useCoachPublicProfile } from '@/hooks/useCoachPublicProfile';
import { useCoachAvailability } from '@/hooks/useCoachAvailability';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CoachBookingFlow } from '@/components/coaching/CoachBookingFlow';
import {
  Loader2, Award, Clock, PoundSterling,
  Instagram, Globe, MessageSquare, UserCheck,
  Dumbbell, Target, Heart,
} from 'lucide-react';

export default function CoachProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { profile, loading } = useCoachPublicProfile(userId);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockLoading, setUnlockLoading] = useState(true);
  const [availSlots, setAvailSlots] = useState<any[]>([]);

  // Check if user has unlocked this coach
  useEffect(() => {
    if (!user || !userId) { setUnlockLoading(false); return; }
    // Coach always unlocked to themselves
    if (user.id === userId) { setIsUnlocked(true); setUnlockLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from('coach_unlocks')
        .select('id')
        .eq('user_id', user.id)
        .eq('coach_id', userId)
        .maybeSingle();
      setIsUnlocked(!!data);
      setUnlockLoading(false);
    })();
  }, [user, userId]);

  // Fetch coach availability slots
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await supabase
        .from('coach_availability_slots')
        .select('*')
        .eq('coach_id', userId);
      setAvailSlots(data || []);
    })();
  }, [userId]);

  const handleUnlock = useCallback(async () => {
    if (!user || !userId) return;
    try {
      // Deduct tokens
      const { data: bal } = await supabase.rpc('get_token_balance', { p_user_id: user.id });
      if ((bal || 0) < 5) {
        toast.error('Not enough tokens. You need 5 tokens to unlock this coach.');
        return;
      }
      // Deduct and create unlock
      await supabase.rpc('deduct_tokens', { p_user_id: user.id, p_amount: 5, p_reason: `Unlock coach: ${userId}` });
      await supabase.from('coach_unlocks').insert({ user_id: user.id, coach_id: userId, tokens_spent: 5 });
      setIsUnlocked(true);
      toast.success('Coach unlocked! You can now book sessions.');
    } catch (err) {
      toast.error('Failed to unlock coach. Please try again.');
    }
  }, [user, userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen pb-24" >
        <div className="px-4 py-24 max-w-2xl mx-auto text-center">
          <UserCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl tracking-wide text-foreground mb-2">COACH NOT FOUND</h1>
          <p className="text-muted-foreground text-sm">This coach profile doesn't exist or isn't published yet.</p>
          <Link to="/coaches">
            <button className="mt-4 px-5 py-2.5 rounded-xl border border-primary/30 text-primary font-display text-xs tracking-wider hover:bg-primary/10 transition-colors">
              BROWSE COACHES
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const freqLabel = {
    weekly: 'Weekly',
    biweekly: 'Bi-weekly',
    monthly: 'Monthly',
  }[profile.check_in_frequency] || profile.check_in_frequency;

  return (
    <div className="min-h-screen pb-24" >
      <div className="px-4 pt-4 max-w-2xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="text-center space-y-4">
          <Avatar className="h-24 w-24 mx-auto border-4 border-primary/20">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="font-display text-2xl bg-primary/10 text-primary">
              {(profile.display_name || '?')[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-display text-2xl tracking-wide text-foreground">
              {profile.display_name || 'Coach'}
            </h1>
            {profile.headline && (
              <p className="text-sm text-primary font-display tracking-wide mt-1">{profile.headline}</p>
            )}
            {profile.username && (
              <p className="text-xs text-muted-foreground mt-0.5">@{profile.username}</p>
            )}
          </div>
          {profile.accepting_clients ? (
            <span className="inline-block text-[10px] font-display tracking-wider px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              ACCEPTING CLIENTS
            </span>
          ) : (
            <span className="inline-block text-[10px] font-display tracking-wider px-3 py-1 rounded-full bg-card text-muted-foreground border border-border">
              FULLY BOOKED
            </span>
          )}

          {/* Availability fuel meter */}
          {(() => {
            const taken = profile.current_clients || 0;
            const max = profile.max_clients || 20;
            const remaining = Math.max(max - taken, 0);
            const pct = max > 0 ? Math.min((taken / max) * 100, 100) : 0;
            return (
              <div className="w-full max-w-xs mx-auto space-y-1">
                <div className="flex items-center justify-between text-[10px] font-display tracking-wider">
                  <span className="text-muted-foreground">AVAILABILITY</span>
                  <span className="text-foreground">
                    <span className="text-primary">{remaining}</span> / {max} spots
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-muted/50 border border-border overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: pct >= 90 ? 'hsl(0 70% 50%)' : pct >= 70 ? 'hsl(30 90% 50%)' : 'hsl(var(--primary))',
                      boxShadow: `0 0 6px ${pct >= 90 ? 'hsl(0 70% 50% / 0.4)' : 'hsl(var(--primary) / 0.3)'}`,
                    }}
                  />
                </div>
                <p className="text-[9px] text-muted-foreground text-center">
                  {pct >= 100 ? 'Fully booked — join the waitlist' : pct >= 80 ? 'Almost full — limited spots remaining!' : `${remaining} coaching spots available`}
                </p>
              </div>
            );
          })()}
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {/* Quick Stats */}
        {(() => {
          const sessionStart = Math.min(
            ...[profile.session_rate_30min, profile.session_rate_60min].filter(Boolean).map(Number),
            Infinity
          );
          return (
            <div className="grid grid-cols-3 gap-2">
              {profile.years_experience && (
                <div className="rounded-xl border border-primary/15 bg-card p-3 text-center">
                  <Award className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="font-display text-lg text-foreground">{profile.years_experience}</p>
                  <p className="text-[9px] font-display tracking-wider text-muted-foreground">YEARS</p>
                </div>
              )}
              {sessionStart !== Infinity ? (
                <div className="rounded-xl border border-primary/15 bg-card p-3 text-center">
                  <PoundSterling className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="font-display text-lg text-foreground">£{sessionStart}</p>
                  <p className="text-[9px] font-display tracking-wider text-muted-foreground">1-2-1 FROM</p>
                </div>
              ) : (
                <div className="rounded-xl border border-primary/15 bg-card p-3 text-center">
                  <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="font-display text-sm text-foreground">{freqLabel}</p>
                  <p className="text-[9px] font-display tracking-wider text-muted-foreground">CHECK-INS</p>
                </div>
              )}
              {profile.online_monthly_rate && (
                <div className="rounded-xl border border-primary/15 bg-card p-3 text-center">
                  <PoundSterling className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="font-display text-lg text-foreground">£{profile.online_monthly_rate}</p>
                  <p className="text-[9px] font-display tracking-wider text-muted-foreground">ONLINE /MO</p>
                </div>
              )}
            </div>
          );
        })()}

        {/* Specializations */}
        {profile.specializations.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <p className="font-display text-xs tracking-wider text-muted-foreground flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-primary" /> SPECIALIZATIONS
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.specializations.map(s => (
                <Badge key={s} variant="outline" className="font-display text-[10px] tracking-wide border-border text-muted-foreground">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {profile.certifications.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <p className="font-display text-xs tracking-wider text-muted-foreground flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" /> CERTIFICATIONS
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.certifications.map(c => (
                <Badge key={c} variant="outline" className="font-display text-[10px] tracking-wide border-primary/20 text-primary">
                  {c}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Coaching Style & Ideal Client */}
        {(profile.coaching_style || profile.ideal_client) && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-4">
            {profile.coaching_style && (
              <div>
                <p className="font-display text-xs tracking-wider text-muted-foreground flex items-center gap-2 mb-1">
                  <Heart className="w-4 h-4 text-primary" /> COACHING STYLE
                </p>
                <p className="text-sm text-muted-foreground">{profile.coaching_style}</p>
              </div>
            )}
            {profile.ideal_client && (
              <div>
                <p className="font-display text-xs tracking-wider text-muted-foreground flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-primary" /> IDEAL CLIENT
                </p>
                <p className="text-sm text-muted-foreground">{profile.ideal_client}</p>
              </div>
            )}
          </div>
        )}

        {/* Social Links */}
        {(profile.instagram_handle || profile.website_url) && (
          <div className="flex gap-4 justify-center">
            {profile.instagram_handle && (
              <a href={`https://instagram.com/${profile.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-4 h-4" /> {profile.instagram_handle}
              </a>
            )}
            {profile.website_url && (
              <a href={profile.website_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                <Globe className="w-4 h-4" /> Website
              </a>
            )}
          </div>
        )}

        {/* Booking Flow */}
        {profile.accepting_clients && user && !unlockLoading && (
          <div className="rounded-xl border border-primary/20 bg-card p-5">
            <h2 className="font-display tracking-wider text-sm text-primary text-center mb-4">BOOK A SESSION</h2>
            <CoachBookingFlow
              coach={profile}
              isUnlocked={isUnlocked}
              onUnlock={handleUnlock}
              availableSlots={availSlots}
            />
          </div>
        )}

        {/* CTA for non-logged-in */}
        {profile.accepting_clients && !user && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-3">
            <h2 className="font-display tracking-wide text-lg text-foreground">READY TO START?</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to unlock this coach and book your first session.
            </p>
            <Link to="/my-coaching">
              <button className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl bg-primary text-white font-display text-xs tracking-wider hover:bg-primary/80 transition-colors">
                <UserCheck className="w-4 h-4" /> SIGN IN TO BOOK
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

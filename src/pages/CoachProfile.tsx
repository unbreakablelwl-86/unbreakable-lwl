import { useParams, Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useCoachPublicProfile } from '@/hooks/useCoachPublicProfile';
import { useAuth } from '@/hooks/useAuth';
import {
  Loader2, Award, Clock, PoundSterling,
  Instagram, Globe, MessageSquare, UserCheck,
  Dumbbell, Target, Heart, ArrowLeft,
} from 'lucide-react';

export default function CoachProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { profile, loading } = useCoachPublicProfile(userId);
  const { user } = useAuth();
  const navigate = useNavigate();

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
        <div className="px-4 pt-4">
          <button onClick={() => navigate('/coaches')} className="flex items-center gap-1 text-muted-foreground text-sm hover:text-muted-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Coaches
          </button>
        </div>
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
      {/* Back nav */}
      <div className="px-4 pt-4">
        <button onClick={() => navigate('/coaches')} className="flex items-center gap-1 text-muted-foreground text-sm hover:text-muted-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Coaches
        </button>
      </div>

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
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          {profile.years_experience && (
            <div className="rounded-xl border border-primary/15 bg-card p-3 text-center">
              <Award className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="font-display text-lg text-foreground">{profile.years_experience}</p>
              <p className="text-[9px] font-display tracking-wider text-muted-foreground">YEARS</p>
            </div>
          )}
          <div className="rounded-xl border border-primary/15 bg-card p-3 text-center">
            <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="font-display text-sm text-foreground">{freqLabel}</p>
            <p className="text-[9px] font-display tracking-wider text-muted-foreground">CHECK-INS</p>
          </div>
          {profile.monthly_price_gbp && (
            <div className="rounded-xl border border-primary/15 bg-card p-3 text-center">
              <PoundSterling className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="font-display text-lg text-foreground">£{profile.monthly_price_gbp}</p>
              <p className="text-[9px] font-display tracking-wider text-muted-foreground">/MONTH</p>
            </div>
          )}
        </div>

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

        {/* CTA */}
        {profile.accepting_clients && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-3">
            <h2 className="font-display tracking-wide text-lg text-foreground">READY TO START?</h2>
            <p className="text-sm text-muted-foreground">
              {profile.monthly_price_gbp
                ? `From £${profile.monthly_price_gbp}/month with ${freqLabel.toLowerCase()} check-ins.`
                : `${freqLabel} check-ins included.`}
            </p>
            <Link to="/my-coaching">
              <button className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl bg-primary text-white font-display text-xs tracking-wider hover:bg-primary/80 transition-colors">
                {user ? <><MessageSquare className="w-4 h-4" /> REQUEST COACHING</> : <><UserCheck className="w-4 h-4" /> SIGN IN TO REQUEST</>}
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

import { useParams, Link } from 'react-router-dom';
import { MainNavigation } from '@/components/MainNavigation';
import { UnifiedFooter } from '@/components/UnifiedFooter';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCoachPublicProfile } from '@/hooks/useCoachPublicProfile';
import { useAuth } from '@/hooks/useAuth';
import {
  Loader2, Award, Clock, Users, PoundSterling,
  Instagram, Globe, MessageSquare, UserCheck,
  Dumbbell, Target, Heart,
} from 'lucide-react';

export default function CoachProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { profile, loading } = useCoachPublicProfile(userId);
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavigation />
        <main className="container mx-auto px-4 py-24 max-w-2xl text-center">
          <UserCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl tracking-wide text-foreground mb-2">COACH NOT FOUND</h1>
          <p className="text-muted-foreground text-sm">This coach profile doesn't exist or isn't published yet.</p>
          <Link to="/coaches">
            <Button variant="outline" className="mt-4 font-display tracking-wide">BROWSE COACHES</Button>
          </Link>
        </main>
        <UnifiedFooter />
      </div>
    );
  }

  const freqLabel = {
    weekly: 'Weekly',
    biweekly: 'Bi-weekly',
    monthly: 'Monthly',
  }[profile.check_in_frequency] || profile.check_in_frequency;

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <main className="container mx-auto px-4 py-24 max-w-2xl space-y-6">
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
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20 font-display text-[10px] tracking-wider">
              ACCEPTING CLIENTS
            </Badge>
          ) : (
            <Badge className="bg-muted text-muted-foreground border-border font-display text-[10px] tracking-wider">
              FULLY BOOKED
            </Badge>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          {profile.years_experience && (
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 text-center">
              <Award className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="font-display text-lg text-foreground">{profile.years_experience}</p>
              <p className="text-[9px] font-display tracking-wider text-muted-foreground">YEARS</p>
            </div>
          )}
          <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 text-center">
            <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="font-display text-sm text-foreground">{freqLabel}</p>
            <p className="text-[9px] font-display tracking-wider text-muted-foreground">CHECK-INS</p>
          </div>
          {profile.monthly_price_gbp && (
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 text-center">
              <PoundSterling className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="font-display text-lg text-foreground">£{profile.monthly_price_gbp}</p>
              <p className="text-[9px] font-display tracking-wider text-muted-foreground">/MONTH</p>
            </div>
          )}
        </div>

        {/* Specializations */}
        {profile.specializations.length > 0 && (
          <Card className="border-border">
            <CardContent className="p-4 space-y-2">
              <p className="font-display text-xs tracking-wider flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-primary" /> SPECIALIZATIONS
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.specializations.map(s => (
                  <Badge key={s} variant="outline" className="font-display text-[10px] tracking-wide">
                    {s}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Certifications */}
        {profile.certifications.length > 0 && (
          <Card className="border-border">
            <CardContent className="p-4 space-y-2">
              <p className="font-display text-xs tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" /> CERTIFICATIONS
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.certifications.map(c => (
                  <Badge key={c} variant="outline" className="font-display text-[10px] tracking-wide border-primary/20 text-primary">
                    {c}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Coaching Style & Ideal Client */}
        {(profile.coaching_style || profile.ideal_client) && (
          <Card className="border-border">
            <CardContent className="p-4 space-y-4">
              {profile.coaching_style && (
                <div>
                  <p className="font-display text-xs tracking-wider flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4 text-primary" /> COACHING STYLE
                  </p>
                  <p className="text-sm text-foreground">{profile.coaching_style}</p>
                </div>
              )}
              {profile.ideal_client && (
                <div>
                  <p className="font-display text-xs tracking-wider flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-primary" /> IDEAL CLIENT
                  </p>
                  <p className="text-sm text-foreground">{profile.ideal_client}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Social Links */}
        {(profile.instagram_handle || profile.website_url) && (
          <div className="flex gap-3 justify-center">
            {profile.instagram_handle && (
              <a
                href={`https://instagram.com/${profile.instagram_handle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="w-4 h-4" /> {profile.instagram_handle}
              </a>
            )}
            {profile.website_url && (
              <a
                href={profile.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Globe className="w-4 h-4" /> Website
              </a>
            )}
          </div>
        )}

        {/* CTA */}
        {profile.accepting_clients && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 text-center space-y-3">
              <h2 className="font-display tracking-wide text-lg">READY TO START?</h2>
              <p className="text-sm text-muted-foreground">
                {profile.monthly_price_gbp
                  ? `From £${profile.monthly_price_gbp}/month with ${freqLabel.toLowerCase()} check-ins.`
                  : `${freqLabel} check-ins included.`}
              </p>
              {user ? (
                <Link to="/my-coaching">
                  <Button className="font-display tracking-wide gap-2">
                    <MessageSquare className="w-4 h-4" /> REQUEST COACHING
                  </Button>
                </Link>
              ) : (
                <Link to="/my-coaching">
                  <Button className="font-display tracking-wide gap-2">
                    <UserCheck className="w-4 h-4" /> SIGN IN TO REQUEST
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </main>
      <UnifiedFooter />
    </div>
  );
}

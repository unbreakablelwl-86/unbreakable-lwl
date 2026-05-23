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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#FF5500]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen pb-24" style={{ background: '#080808' }}>
        <div className="px-4 pt-4">
          <button onClick={() => navigate('/coaches')} className="flex items-center gap-1 text-gray-500 text-sm hover:text-gray-300 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Coaches
          </button>
        </div>
        <div className="px-4 py-24 max-w-2xl mx-auto text-center">
          <UserCheck className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h1 className="font-display text-2xl tracking-wide text-white mb-2">COACH NOT FOUND</h1>
          <p className="text-gray-400 text-sm">This coach profile doesn't exist or isn't published yet.</p>
          <Link to="/coaches">
            <button className="mt-4 px-5 py-2.5 rounded-xl border border-[#FF5500]/30 text-[#FF5500] font-display text-xs tracking-wider hover:bg-[#FF5500]/10 transition-colors">
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
    <div className="min-h-screen pb-24" style={{ background: '#080808' }}>
      {/* Back nav */}
      <div className="px-4 pt-4">
        <button onClick={() => navigate('/coaches')} className="flex items-center gap-1 text-gray-500 text-sm hover:text-gray-300 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Coaches
        </button>
      </div>

      <div className="px-4 pt-4 max-w-2xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="text-center space-y-4">
          <Avatar className="h-24 w-24 mx-auto border-4 border-[#FF5500]/20">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="font-display text-2xl bg-[#FF5500]/10 text-[#FF5500]">
              {(profile.display_name || '?')[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-display text-2xl tracking-wide text-white">
              {profile.display_name || 'Coach'}
            </h1>
            {profile.headline && (
              <p className="text-sm text-[#FF5500] font-display tracking-wide mt-1">{profile.headline}</p>
            )}
            {profile.username && (
              <p className="text-xs text-gray-500 mt-0.5">@{profile.username}</p>
            )}
          </div>
          {profile.accepting_clients ? (
            <span className="inline-block text-[10px] font-display tracking-wider px-3 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
              ACCEPTING CLIENTS
            </span>
          ) : (
            <span className="inline-block text-[10px] font-display tracking-wider px-3 py-1 rounded-full bg-gray-800 text-gray-500 border border-gray-700">
              FULLY BOOKED
            </span>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="rounded-xl border border-gray-800 bg-[#111] p-4">
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          {profile.years_experience && (
            <div className="rounded-xl border border-[#FF5500]/15 bg-[#111] p-3 text-center">
              <Award className="w-5 h-5 text-[#FF5500] mx-auto mb-1" />
              <p className="font-display text-lg text-white">{profile.years_experience}</p>
              <p className="text-[9px] font-display tracking-wider text-gray-500">YEARS</p>
            </div>
          )}
          <div className="rounded-xl border border-[#FF5500]/15 bg-[#111] p-3 text-center">
            <Clock className="w-5 h-5 text-[#FF5500] mx-auto mb-1" />
            <p className="font-display text-sm text-white">{freqLabel}</p>
            <p className="text-[9px] font-display tracking-wider text-gray-500">CHECK-INS</p>
          </div>
          {profile.monthly_price_gbp && (
            <div className="rounded-xl border border-[#FF5500]/15 bg-[#111] p-3 text-center">
              <PoundSterling className="w-5 h-5 text-[#FF5500] mx-auto mb-1" />
              <p className="font-display text-lg text-white">£{profile.monthly_price_gbp}</p>
              <p className="text-[9px] font-display tracking-wider text-gray-500">/MONTH</p>
            </div>
          )}
        </div>

        {/* Specializations */}
        {profile.specializations.length > 0 && (
          <div className="rounded-xl border border-gray-800 bg-[#111] p-4 space-y-2">
            <p className="font-display text-xs tracking-wider text-gray-400 flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-[#FF5500]" /> SPECIALIZATIONS
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.specializations.map(s => (
                <Badge key={s} variant="outline" className="font-display text-[10px] tracking-wide border-gray-700 text-gray-300">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {profile.certifications.length > 0 && (
          <div className="rounded-xl border border-gray-800 bg-[#111] p-4 space-y-2">
            <p className="font-display text-xs tracking-wider text-gray-400 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#FF5500]" /> CERTIFICATIONS
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.certifications.map(c => (
                <Badge key={c} variant="outline" className="font-display text-[10px] tracking-wide border-[#FF5500]/20 text-[#FF5500]">
                  {c}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Coaching Style & Ideal Client */}
        {(profile.coaching_style || profile.ideal_client) && (
          <div className="rounded-xl border border-gray-800 bg-[#111] p-4 space-y-4">
            {profile.coaching_style && (
              <div>
                <p className="font-display text-xs tracking-wider text-gray-400 flex items-center gap-2 mb-1">
                  <Heart className="w-4 h-4 text-[#FF5500]" /> COACHING STYLE
                </p>
                <p className="text-sm text-gray-300">{profile.coaching_style}</p>
              </div>
            )}
            {profile.ideal_client && (
              <div>
                <p className="font-display text-xs tracking-wider text-gray-400 flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-[#FF5500]" /> IDEAL CLIENT
                </p>
                <p className="text-sm text-gray-300">{profile.ideal_client}</p>
              </div>
            )}
          </div>
        )}

        {/* Social Links */}
        {(profile.instagram_handle || profile.website_url) && (
          <div className="flex gap-4 justify-center">
            {profile.instagram_handle && (
              <a href={`https://instagram.com/${profile.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#FF5500] transition-colors">
                <Instagram className="w-4 h-4" /> {profile.instagram_handle}
              </a>
            )}
            {profile.website_url && (
              <a href={profile.website_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#FF5500] transition-colors">
                <Globe className="w-4 h-4" /> Website
              </a>
            )}
          </div>
        )}

        {/* CTA */}
        {profile.accepting_clients && (
          <div className="rounded-xl border border-[#FF5500]/20 bg-[#FF5500]/5 p-6 text-center space-y-3">
            <h2 className="font-display tracking-wide text-lg text-white">READY TO START?</h2>
            <p className="text-sm text-gray-400">
              {profile.monthly_price_gbp
                ? `From £${profile.monthly_price_gbp}/month with ${freqLabel.toLowerCase()} check-ins.`
                : `${freqLabel} check-ins included.`}
            </p>
            <Link to="/my-coaching">
              <button className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl bg-[#FF5500] text-white font-display text-xs tracking-wider hover:bg-[#FF5500]/80 transition-colors">
                {user ? <><MessageSquare className="w-4 h-4" /> REQUEST COACHING</> : <><UserCheck className="w-4 h-4" /> SIGN IN TO REQUEST</>}
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

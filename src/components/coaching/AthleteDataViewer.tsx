/**
 * AthleteDataViewer — Coach view of an athlete's full data.
 * Shows profile, training history, PBs, check-ins, and coaching tools.
 */
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  ArrowLeft, Dumbbell, Flame, Footprints, Trophy,
  Calendar, TrendingUp, ChevronDown, ChevronRight,
  User, Activity, Target,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { format } from 'date-fns';

interface AthleteDataViewerProps {
  athleteId: string;
  onBack: () => void;
}

interface AthleteProfile {
  user_id: string;
  display_name: string;
  gender?: string;
  weight_kg?: number;
  height_cm?: number;
  date_of_birth?: string;
  avatar_url?: string;
}

export function AthleteDataViewer({ athleteId, onBack }: AthleteDataViewerProps) {
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [pbs, setPbs] = useState<any[]>([]);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [profileRes, sessionsRes, pbsRes, checkInsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', athleteId).single(),
        supabase.from('workout_sessions').select('*').eq('user_id', athleteId)
          .order('started_at', { ascending: false }).limit(50),
        supabase.from('achievement_cards').select('*').eq('user_id', athleteId)
          .eq('card_type', 'pb_personal').order('earned_at', { ascending: false }),
        supabase.from('coaching_check_ins').select('*').eq('athlete_id', athleteId)
          .order('created_at', { ascending: false }).limit(20),
      ]);
      setProfile(profileRes.data as AthleteProfile | null);
      setSessions(sessionsRes.data || []);
      setPbs(pbsRes.data || []);
      setCheckIns(checkInsRes.data || []);
      setLoading(false);
    }
    fetchData();
  }, [athleteId]);

  const stats = useMemo(() => {
    const totalSessions = sessions.length;
    const thisMonth = sessions.filter(s => {
      const d = new Date(s.started_at);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const totalPBs = pbs.length;
    const latestPB = pbs[0];
    return { totalSessions, thisMonth, totalPBs, latestPB };
  }, [sessions, pbs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 py-6">
        <button onClick={onBack} className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const age = profile?.date_of_birth
    ? Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / (365.25 * 86400000))
    : null;

  return (
    <div className="min-h-screen bg-background px-4 py-6 pb-24">
      {/* Header */}
      <button onClick={onBack} className="flex items-center gap-1 text-muted-foreground text-sm mb-4 hover:text-foreground transition-colors">
        <ArrowLeft size={16} /> Back to Athletes
      </button>

      {/* Profile card */}
      <Card className="p-4 border-border bg-card mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            {profile?.avatar_url ? (
              <img loading="lazy" src={profile.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <User size={24} className="text-primary" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-display tracking-wider text-foreground">
              {profile?.display_name || 'Unknown Athlete'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {[
                age ? `${age}y` : null,
                profile?.gender,
                profile?.weight_kg ? `${profile.weight_kg}kg` : null,
                profile?.height_cm ? `${profile.height_cm}cm` : null,
              ].filter(Boolean).join(' · ') || 'No profile data'}
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Dumbbell, label: 'Sessions', value: stats.totalSessions, sub: `${stats.thisMonth} this month` },
            { icon: Trophy, label: 'PBs', value: stats.totalPBs, sub: stats.latestPB?.exercise_name || '—' },
            { icon: Calendar, label: 'Check-ins', value: checkIns.length, sub: checkIns[0] ? format(new Date(checkIns[0].created_at), 'dd MMM') : '—' },
          ].map(({ icon: Icon, label, value, sub }) => (
            <div key={label} className="bg-background/50 rounded-lg p-2.5 text-center">
              <Icon size={16} className="text-primary mx-auto mb-1" />
              <p className="text-lg font-display text-foreground">{value}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</p>
              <p className="text-[8px] text-muted-foreground">{sub}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Personal Bests */}
      <Collapsible defaultOpen={false}>
        <CollapsibleTrigger className="w-full">
          <Card className="p-3 border-border bg-card flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-primary" />
              <span className="text-sm font-display tracking-wider">PERSONAL BESTS ({pbs.length})</span>
            </div>
            <ChevronDown size={16} className="text-muted-foreground" />
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-1.5 mb-4">
            {pbs.length === 0 ? (
              <p className="text-xs text-muted-foreground px-2 py-3">No PBs recorded yet.</p>
            ) : pbs.map(pb => (
              <Card key={pb.id} className="p-3 border-border/50 bg-card/50 flex items-center justify-between">
                <div>
                  <p className="text-sm font-display tracking-wider text-foreground">{pb.exercise_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {pb.record_value}{pb.record_unit === 'kg' ? 'kg' : pb.record_unit === 'reps' ? ' reps' : pb.record_unit === 'seconds' ? ` (${Math.floor(pb.record_value / 60)}:${String(pb.record_value % 60).padStart(2, '0')})` : ` ${pb.record_unit}`}
                    {' · '}{format(new Date(pb.earned_at), 'dd MMM yyyy')}
                  </p>
                </div>
                <span className={`text-[10px] font-display tracking-wider uppercase px-2 py-0.5 rounded-full ${
                  pb.rarity === 'platinum' ? 'bg-slate-200/20 text-slate-200' :
                  pb.rarity === 'diamond' ? 'bg-violet-400/20 text-violet-400' :
                  pb.rarity === 'gold' ? 'bg-yellow-400/20 text-yellow-400' :
                  pb.rarity === 'silver' ? 'bg-gray-300/20 text-gray-300' :
                  'bg-amber-500/20 text-amber-500'
                }`}>
                  {pb.rarity}
                </span>
              </Card>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Recent Sessions */}
      <Collapsible defaultOpen={false}>
        <CollapsibleTrigger className="w-full">
          <Card className="p-3 border-border bg-card flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-primary" />
              <span className="text-sm font-display tracking-wider">RECENT SESSIONS ({sessions.length})</span>
            </div>
            <ChevronDown size={16} className="text-muted-foreground" />
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-1.5 mb-4">
            {sessions.length === 0 ? (
              <p className="text-xs text-muted-foreground px-2 py-3">No sessions recorded yet.</p>
            ) : sessions.slice(0, 20).map(s => (
              <Card key={s.id} className="p-3 border-border/50 bg-card/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-display tracking-wider text-foreground">
                      {s.programme_name || s.session_type || 'Session'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(s.started_at), 'dd MMM yyyy · HH:mm')}
                      {s.duration_minutes ? ` · ${s.duration_minutes} min` : ''}
                    </p>
                  </div>
                  {s.exercises_completed && (
                    <span className="text-xs text-primary font-display">{s.exercises_completed} exercises</span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Check-ins */}
      <Collapsible defaultOpen={false}>
        <CollapsibleTrigger className="w-full">
          <Card className="p-3 border-border bg-card flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-primary" />
              <span className="text-sm font-display tracking-wider">CHECK-INS ({checkIns.length})</span>
            </div>
            <ChevronDown size={16} className="text-muted-foreground" />
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-1.5 mb-4">
            {checkIns.length === 0 ? (
              <p className="text-xs text-muted-foreground px-2 py-3">No check-ins yet.</p>
            ) : checkIns.map(ci => (
              <Card key={ci.id} className="p-3 border-border/50 bg-card/50">
                <p className="text-xs text-muted-foreground">
                  {format(new Date(ci.created_at), 'dd MMM yyyy · HH:mm')}
                </p>
                {ci.notes && <p className="text-sm text-foreground mt-1">{ci.notes}</p>}
                {ci.mood && <p className="text-xs text-primary mt-1">Mood: {ci.mood}/10</p>}
              </Card>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckIn } from '@/hooks/useCheckIns';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowLeft, Scale, Heart, Check, MessageSquare,
  Trophy, AlertTriangle, Zap, Moon, Brain, Activity,
  Droplets, Footprints, Send, Eye, ChevronDown, ChevronUp,
} from 'lucide-react';

interface CheckInReviewProps {
  checkIn: CheckIn;
  onReview: (id: string, response: string) => void;
  onBack: () => void;
}

function MetricRow({ label, value, unit, icon: Icon }: { label: string; value: number | null; unit?: string; icon: React.ElementType }) {
  if (value === null) return null;
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="flex items-center gap-2 text-xs text-muted-foreground font-display tracking-wide">
        <Icon className="w-3.5 h-3.5" /> {label}
      </span>
      <span className="font-display text-sm text-foreground">{value}{unit || ''}</span>
    </div>
  );
}

function ScoreBar({ label, value, max = 10, icon: Icon }: { label: string; value: number | null; max?: number; icon: React.ElementType }) {
  if (value === null) return null;
  const pct = (value / max) * 100;
  const color = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs text-muted-foreground font-display tracking-wide">
          <Icon className="w-3.5 h-3.5" /> {label}
        </span>
        <span className="font-display text-xs text-foreground">{value}/{max}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function CheckInReview({ checkIn, onReview, onBack }: CheckInReviewProps) {
  const [coachResponse, setCoachResponse] = useState(checkIn.coach_response || '');
  const [submitting, setSubmitting] = useState(false);
  const [showBody, setShowBody] = useState(true);
  const [showWellness, setShowWellness] = useState(true);
  const [showCompliance, setShowCompliance] = useState(true);

  const handleReview = async () => {
    if (!coachResponse.trim()) return;
    setSubmitting(true);
    await onReview(checkIn.id, coachResponse);
    setSubmitting(false);
  };

  const statusColor = {
    pending: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    submitted: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    reviewed: 'text-green-500 bg-green-500/10 border-green-500/20',
    skipped: 'text-muted-foreground bg-muted border-border',
  }[checkIn.status];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={checkIn.athlete_profile?.avatar_url || undefined} />
              <AvatarFallback className="font-display text-xs">
                {(checkIn.athlete_profile?.display_name || '?')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-display text-sm tracking-wide">
                {checkIn.athlete_profile?.display_name || 'Athlete'}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Check-in #{checkIn.check_in_number} · {checkIn.submitted_at
                  ? formatDistanceToNow(new Date(checkIn.submitted_at), { addSuffix: true })
                  : 'Not yet submitted'}
              </p>
            </div>
          </div>
        </div>
        <Badge className={`font-display text-[9px] tracking-wider border ${statusColor}`}>
          {checkIn.status.toUpperCase()}
        </Badge>
      </div>

      {checkIn.status === 'pending' ? (
        <Card className="border-border border-gray-800 bg-[#111]">
          <CardContent className="py-10 text-center">
            <Eye className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Waiting for athlete to submit</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Body Measurements */}
          <Card className="border-border border-gray-800 bg-[#111]">
            <button
              onClick={() => setShowBody(!showBody)}
              className="w-full p-3 flex items-center justify-between"
            >
              <span className="font-display text-xs tracking-wider flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary" /> BODY
              </span>
              {showBody ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showBody && (
              <CardContent className="pt-0 pb-3 px-3">
                <MetricRow label="WEIGHT" value={checkIn.weight_kg} unit=" kg" icon={Scale} />
                <MetricRow label="BODY FAT" value={checkIn.body_fat_pct} unit="%" icon={Activity} />
                <MetricRow label="WAIST" value={checkIn.waist_cm} unit=" cm" icon={Footprints} />
                <MetricRow label="CHEST" value={checkIn.chest_cm} unit=" cm" icon={Footprints} />
                <MetricRow label="HIPS" value={checkIn.hips_cm} unit=" cm" icon={Footprints} />
                <MetricRow label="ARM" value={checkIn.arm_cm} unit=" cm" icon={Footprints} />
                <MetricRow label="THIGH" value={checkIn.thigh_cm} unit=" cm" icon={Footprints} />
              </CardContent>
            )}
          </Card>

          {/* Wellness */}
          <Card className="border-border border-gray-800 bg-[#111]">
            <button
              onClick={() => setShowWellness(!showWellness)}
              className="w-full p-3 flex items-center justify-between"
            >
              <span className="font-display text-xs tracking-wider flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" /> WELLNESS
              </span>
              {showWellness ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showWellness && (
              <CardContent className="pt-0 pb-3 px-3 space-y-3">
                <ScoreBar label="ENERGY" value={checkIn.energy_level} icon={Zap} />
                <ScoreBar label="SLEEP" value={checkIn.sleep_quality} icon={Moon} />
                <ScoreBar label="STRESS" value={checkIn.stress_level} icon={Brain} />
                <ScoreBar label="MOOD" value={checkIn.mood} icon={Heart} />
                <ScoreBar label="SORENESS" value={checkIn.soreness} icon={Activity} />
              </CardContent>
            )}
          </Card>

          {/* Compliance */}
          <Card className="border-border border-gray-800 bg-[#111]">
            <button
              onClick={() => setShowCompliance(!showCompliance)}
              className="w-full p-3 flex items-center justify-between"
            >
              <span className="font-display text-xs tracking-wider flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" /> COMPLIANCE
              </span>
              {showCompliance ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showCompliance && (
              <CardContent className="pt-0 pb-3 px-3 space-y-3">
                <ScoreBar label="TRAINING" value={checkIn.training_compliance} max={100} icon={Activity} />
                <ScoreBar label="NUTRITION" value={checkIn.nutrition_compliance} max={100} icon={Droplets} />
                <MetricRow label="AVG STEPS" value={checkIn.steps_avg} icon={Footprints} />
                <MetricRow label="WATER" value={checkIn.water_litres} unit=" L" icon={Droplets} />
              </CardContent>
            )}
          </Card>

          {/* Reflections */}
          {(checkIn.wins || checkIn.challenges || checkIn.athlete_notes) && (
            <Card className="border-border border-gray-800 bg-[#111]">
              <CardContent className="p-3 space-y-3">
                <p className="font-display text-xs tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" /> REFLECTIONS
                </p>
                {checkIn.wins && (
                  <div className="bg-green-500/5 border border-green-500/10 rounded-lg p-3">
                    <p className="text-[10px] font-display tracking-wider text-green-500 mb-1 flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> WINS
                    </p>
                    <p className="text-sm text-foreground">{checkIn.wins}</p>
                  </div>
                )}
                {checkIn.challenges && (
                  <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-lg p-3">
                    <p className="text-[10px] font-display tracking-wider text-yellow-500 mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> CHALLENGES
                    </p>
                    <p className="text-sm text-foreground">{checkIn.challenges}</p>
                  </div>
                )}
                {checkIn.athlete_notes && (
                  <div className="bg-muted/50 border border-border rounded-lg p-3">
                    <p className="text-[10px] font-display tracking-wider text-muted-foreground mb-1">NOTES</p>
                    <p className="text-sm text-foreground">{checkIn.athlete_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Coach Response */}
          {checkIn.status === 'reviewed' && checkIn.coach_response ? (
            <Card className="border-primary/20 bg-primary/5 border-gray-800 bg-[#111]">
              <CardContent className="p-3">
                <p className="text-[10px] font-display tracking-wider text-primary mb-2">COACH RESPONSE</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{checkIn.coach_response}</p>
              </CardContent>
            </Card>
          ) : checkIn.status === 'submitted' ? (
            <Card className="border-border border-gray-800 bg-[#111]">
              <CardContent className="p-3 space-y-3">
                <p className="font-display text-xs tracking-wider flex items-center gap-2">
                  <Send className="w-4 h-4 text-primary" /> YOUR RESPONSE
                </p>
                <Textarea
                  value={coachResponse}
                  onChange={e => setCoachResponse(e.target.value)}
                  placeholder="Review the check-in and leave your feedback, adjustments, encouragement..."
                  rows={5}
                />
                <Button
                  onClick={handleReview}
                  disabled={submitting || !coachResponse.trim()}
                  className="w-full font-display text-xs tracking-wide gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'REVIEWING...' : 'SUBMIT REVIEW'}
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}

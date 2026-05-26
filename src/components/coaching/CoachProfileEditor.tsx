import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCoachPublicProfile } from '@/hooks/useCoachPublicProfile';
import { useCoachAvailability, DAY_NAMES, DAY_NAMES_SHORT } from '@/hooks/useCoachAvailability';
import { Save, Loader2, Eye, EyeOff, Plus, X, Clock, Calendar, Trash2, PoundSterling, Users, CalendarOff } from 'lucide-react';

const TIME_OPTIONS = Array.from({ length: 28 }, (_, i) => {
  const hour = Math.floor(i / 2) + 6; // 06:00 – 19:30
  const min = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${min}:00`;
});

function formatTime(t: string) {
  const [h, m] = t.split(':');
  return `${h}:${m}`;
}

export function CoachProfileEditor() {
  const { profile, loading, upsertProfile } = useCoachPublicProfile();
  const { slots, blockedDates, loading: slotsLoading, addSlot, removeSlot, toggleSlot, addBlockedDate, removeBlockedDate } = useCoachAvailability();
  const [saving, setSaving] = useState(false);

  // Bio fields
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [yearsExperience, setYearsExperience] = useState('');
  const [coachingStyle, setCoachingStyle] = useState('');
  const [idealClient, setIdealClient] = useState('');
  const [newSpec, setNewSpec] = useState('');
  const [newCert, setNewCert] = useState('');

  // Settings
  const [checkInFrequency, setCheckInFrequency] = useState('weekly');
  const [maxClients, setMaxClients] = useState('20');
  const [acceptingClients, setAcceptingClients] = useState(true);
  const [isPublished, setIsPublished] = useState(false);

  // Pricing
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [onlineMonthlyRate, setOnlineMonthlyRate] = useState('');
  const [sessionRate30, setSessionRate30] = useState('');
  const [sessionRate60, setSessionRate60] = useState('');
  const [block4Price, setBlock4Price] = useState('');
  const [block8Price, setBlock8Price] = useState('');
  const [block12Price, setBlock12Price] = useState('');
  const [blockSessionLength, setBlockSessionLength] = useState('60min');
  const [freeConsultation, setFreeConsultation] = useState(false);
  const [consultationLength, setConsultationLength] = useState('15min');

  // Social
  const [instagramHandle, setInstagramHandle] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // Availability form
  const [newSlotDay, setNewSlotDay] = useState('1');
  const [newSlotStart, setNewSlotStart] = useState('09:00:00');
  const [newSlotEnd, setNewSlotEnd] = useState('10:00:00');
  const [newSlotLength, setNewSlotLength] = useState<'30min' | '60min'>('60min');
  const [newBlockDate, setNewBlockDate] = useState('');

  useEffect(() => {
    if (profile) {
      setHeadline(profile.headline || '');
      setBio(profile.bio || '');
      setSpecializations(profile.specializations || []);
      setCertifications(profile.certifications || []);
      setYearsExperience(profile.years_experience?.toString() || '');
      setCoachingStyle(profile.coaching_style || '');
      setIdealClient(profile.ideal_client || '');
      setCheckInFrequency(profile.check_in_frequency || 'weekly');
      setMaxClients(profile.max_clients?.toString() || '20');
      setAcceptingClients(profile.accepting_clients ?? true);
      setMonthlyPrice(profile.monthly_price_gbp?.toString() || '');
      setOnlineMonthlyRate(profile.online_monthly_rate?.toString() || '');
      setSessionRate30(profile.session_rate_30min?.toString() || '');
      setSessionRate60(profile.session_rate_60min?.toString() || '');
      setBlock4Price(profile.block_4_price?.toString() || '');
      setBlock8Price(profile.block_8_price?.toString() || '');
      setBlock12Price(profile.block_12_price?.toString() || '');
      setBlockSessionLength(profile.block_session_length || '60min');
      setFreeConsultation(profile.free_consultation ?? false);
      setConsultationLength(profile.consultation_length || '15min');
      setInstagramHandle(profile.instagram_handle || '');
      setWebsiteUrl(profile.website_url || '');
      setIsPublished(profile.is_published ?? false);
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    await upsertProfile({
      headline: headline || null,
      bio: bio || null,
      specializations,
      certifications,
      years_experience: yearsExperience ? parseInt(yearsExperience) : null,
      coaching_style: coachingStyle || null,
      ideal_client: idealClient || null,
      check_in_frequency: checkInFrequency,
      max_clients: parseInt(maxClients) || 20,
      accepting_clients: acceptingClients,
      monthly_price_gbp: monthlyPrice ? parseFloat(monthlyPrice) : null,
      online_monthly_rate: onlineMonthlyRate ? parseFloat(onlineMonthlyRate) : null,
      session_rate_30min: sessionRate30 ? parseFloat(sessionRate30) : null,
      session_rate_60min: sessionRate60 ? parseFloat(sessionRate60) : null,
      block_4_price: block4Price ? parseFloat(block4Price) : null,
      block_8_price: block8Price ? parseFloat(block8Price) : null,
      block_12_price: block12Price ? parseFloat(block12Price) : null,
      block_session_length: blockSessionLength,
      free_consultation: freeConsultation,
      consultation_length: consultationLength,
      instagram_handle: instagramHandle || null,
      website_url: websiteUrl || null,
      is_published: isPublished,
    } as any);
    setSaving(false);
  };

  const addSpecialization = () => {
    if (newSpec.trim() && !specializations.includes(newSpec.trim())) {
      setSpecializations([...specializations, newSpec.trim()]);
      setNewSpec('');
    }
  };

  const addCertification = () => {
    if (newCert.trim() && !certifications.includes(newCert.trim())) {
      setCertifications([...certifications, newCert.trim()]);
      setNewCert('');
    }
  };

  const handleAddSlot = () => {
    addSlot({
      day_of_week: parseInt(newSlotDay),
      start_time: newSlotStart,
      end_time: newSlotEnd,
      session_length: newSlotLength,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // Group slots by day
  const slotsByDay = slots.reduce((acc, slot) => {
    const day = slot.day_of_week;
    if (!acc[day]) acc[day] = [];
    acc[day].push(slot);
    return acc;
  }, {} as Record<number, typeof slots>);

  return (
    <div className="space-y-4">
      {/* Publish toggle */}
      <Card className={`border-border ${isPublished ? 'border-primary/30 bg-primary/5' : ''}`}>
        <CardContent className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPublished ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
            <div>
              <p className="font-display text-xs tracking-wider">{isPublished ? 'PUBLISHED' : 'DRAFT'}</p>
              <p className="text-[10px] text-muted-foreground">
                {isPublished ? 'Visible to potential clients' : 'Only you can see this'}
              </p>
            </div>
          </div>
          <Switch checked={isPublished} onCheckedChange={setIsPublished} />
        </CardContent>
      </Card>

      {/* Bio */}
      <Card className="border-border bg-card">
        <CardContent className="p-3 space-y-3">
          <p className="font-display text-xs tracking-wider">ABOUT YOU</p>
          <div>
            <Label className="text-[10px] font-display tracking-wide text-muted-foreground">HEADLINE</Label>
            <Input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g. Strength & Conditioning Coach" className="mt-1" />
          </div>
          <div>
            <Label className="text-[10px] font-display tracking-wide text-muted-foreground">BIO</Label>
            <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell potential clients about yourself..." rows={4} className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[10px] font-display tracking-wide text-muted-foreground">YEARS EXPERIENCE</Label>
              <Input type="number" value={yearsExperience} onChange={e => setYearsExperience(e.target.value)} placeholder="5" className="mt-1" />
            </div>
            <div>
              <Label className="text-[10px] font-display tracking-wide text-muted-foreground">COACHING STYLE</Label>
              <Input value={coachingStyle} onChange={e => setCoachingStyle(e.target.value)} placeholder="e.g. Supportive & structured" className="mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-[10px] font-display tracking-wide text-muted-foreground">IDEAL CLIENT</Label>
            <Input value={idealClient} onChange={e => setIdealClient(e.target.value)} placeholder="e.g. Beginners looking to build strength" className="mt-1" />
          </div>
        </CardContent>
      </Card>

      {/* Specializations */}
      <Card className="border-border bg-card">
        <CardContent className="p-3 space-y-3">
          <p className="font-display text-xs tracking-wider">SPECIALIZATIONS</p>
          <div className="flex flex-wrap gap-1.5">
            {specializations.map(s => (
              <Badge key={s} variant="outline" className="font-display text-[10px] tracking-wide gap-1 pr-1">
                {s}
                <button onClick={() => setSpecializations(specializations.filter(x => x !== s))}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newSpec} onChange={e => setNewSpec(e.target.value)} placeholder="Add specialization..." className="text-xs" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSpecialization())} />
            <Button variant="outline" size="sm" onClick={addSpecialization} className="shrink-0">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card className="border-border bg-card">
        <CardContent className="p-3 space-y-3">
          <p className="font-display text-xs tracking-wider">CERTIFICATIONS</p>
          <div className="flex flex-wrap gap-1.5">
            {certifications.map(c => (
              <Badge key={c} variant="outline" className="font-display text-[10px] tracking-wide gap-1 pr-1">
                {c}
                <button onClick={() => setCertifications(certifications.filter(x => x !== c))}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newCert} onChange={e => setNewCert(e.target.value)} placeholder="Add certification..." className="text-xs" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCertification())} />
            <Button variant="outline" size="sm" onClick={addCertification} className="shrink-0">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════ 1-TO-1 SESSION PRICING ═══════════ */}
      <Card className="border-border bg-card overflow-hidden">
        <div className="bg-primary/10 border-b border-primary/20 px-3 py-2">
          <p className="font-display text-xs tracking-wider text-primary flex items-center gap-2">
            <PoundSterling className="w-3.5 h-3.5" /> 1-TO-1 SESSION PRICING
          </p>
        </div>
        <CardContent className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[10px] font-display tracking-wide text-muted-foreground">30 MIN SESSION (£)</Label>
              <Input type="number" step="0.01" value={sessionRate30} onChange={e => setSessionRate30(e.target.value)} placeholder="35.00" className="mt-1" />
            </div>
            <div>
              <Label className="text-[10px] font-display tracking-wide text-muted-foreground">60 MIN SESSION (£)</Label>
              <Input type="number" step="0.01" value={sessionRate60} onChange={e => setSessionRate60(e.target.value)} placeholder="55.00" className="mt-1" />
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <p className="font-display text-[10px] tracking-wider text-muted-foreground mb-2">SESSION BLOCK PACKAGES</p>
            <div className="mb-2">
              <Label className="text-[10px] font-display tracking-wide text-muted-foreground">BLOCK SESSION LENGTH</Label>
              <Select value={blockSessionLength} onValueChange={setBlockSessionLength}>
                <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30min">30 minutes</SelectItem>
                  <SelectItem value="60min">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-[10px] font-display tracking-wide text-muted-foreground">4 SESSIONS (£)</Label>
                <Input type="number" step="0.01" value={block4Price} onChange={e => setBlock4Price(e.target.value)} placeholder="200" className="mt-1 text-xs" />
                {block4Price && (
                  <p className="text-[9px] text-primary mt-0.5">
                    £{(parseFloat(block4Price) / 4).toFixed(2)}/session
                  </p>
                )}
              </div>
              <div>
                <Label className="text-[10px] font-display tracking-wide text-muted-foreground">8 SESSIONS (£)</Label>
                <Input type="number" step="0.01" value={block8Price} onChange={e => setBlock8Price(e.target.value)} placeholder="380" className="mt-1 text-xs" />
                {block8Price && (
                  <p className="text-[9px] text-primary mt-0.5">
                    £{(parseFloat(block8Price) / 8).toFixed(2)}/session
                  </p>
                )}
              </div>
              <div>
                <Label className="text-[10px] font-display tracking-wide text-muted-foreground">12 SESSIONS (£)</Label>
                <Input type="number" step="0.01" value={block12Price} onChange={e => setBlock12Price(e.target.value)} placeholder="540" className="mt-1 text-xs" />
                {block12Price && (
                  <p className="text-[9px] text-primary mt-0.5">
                    £{(parseFloat(block12Price) / 12).toFixed(2)}/session
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-3 grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[10px] font-display tracking-wide text-muted-foreground">ONLINE COACHING /MONTH (£)</Label>
              <Input type="number" step="0.01" value={onlineMonthlyRate} onChange={e => setOnlineMonthlyRate(e.target.value)} placeholder="99.00" className="mt-1" />
            </div>
            <div>
              <Label className="text-[10px] font-display tracking-wide text-muted-foreground">WEEKLY CHECK-INS /MONTH (£)</Label>
              <Input type="number" step="0.01" value={monthlyPrice} onChange={e => setMonthlyPrice(e.target.value)} placeholder="149.00" className="mt-1" />
            </div>
          </div>

          <div className="border-t border-border pt-3 flex items-center justify-between">
            <div>
              <p className="font-display text-[10px] tracking-wider text-muted-foreground">FREE CONSULTATION</p>
              <p className="text-[9px] text-muted-foreground">Offer a free intro call</p>
            </div>
            <div className="flex items-center gap-2">
              {freeConsultation && (
                <Select value={consultationLength} onValueChange={setConsultationLength}>
                  <SelectTrigger className="w-20 text-[10px] h-7"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15min">15 min</SelectItem>
                    <SelectItem value="30min">30 min</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Switch checked={freeConsultation} onCheckedChange={setFreeConsultation} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════ AVAILABILITY CALENDAR ═══════════ */}
      <Card className="border-border bg-card overflow-hidden">
        <div className="bg-primary/10 border-b border-primary/20 px-3 py-2">
          <p className="font-display text-xs tracking-wider text-primary flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" /> AVAILABILITY
          </p>
        </div>
        <CardContent className="p-3 space-y-3">
          {/* Weekly schedule visual */}
          <div className="grid grid-cols-7 gap-1">
            {[1, 2, 3, 4, 5, 6, 0].map(day => {
              const daySlots = slotsByDay[day] || [];
              const activeCount = daySlots.filter(s => s.is_active).length;
              return (
                <div
                  key={day}
                  className={`text-center rounded-lg p-1.5 border transition-all ${
                    activeCount > 0
                      ? 'border-primary/40 bg-primary/10'
                      : 'border-border bg-card'
                  }`}
                >
                  <p className={`font-display text-[9px] tracking-wider ${
                    activeCount > 0 ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {DAY_NAMES_SHORT[day]}
                  </p>
                  {activeCount > 0 && (
                    <div
                      className="mt-1 mx-auto rounded-full flex items-center justify-center"
                      style={{
                        width: 20,
                        height: 20,
                        background: `linear-gradient(135deg, hsl(20 100% 50% / 0.8), hsl(20 100% 50% / 0.4))`,
                        boxShadow: '0 0 8px hsl(20 100% 50% / 0.3)',
                      }}
                    >
                      <span className="text-[9px] font-bold text-white">{activeCount}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Slots list */}
          {Object.entries(slotsByDay)
            .sort(([a], [b]) => {
              const order = [1, 2, 3, 4, 5, 6, 0];
              return order.indexOf(Number(a)) - order.indexOf(Number(b));
            })
            .map(([day, daySlots]) => (
            <div key={day} className="space-y-1">
              <p className="font-display text-[10px] tracking-wider text-muted-foreground">{DAY_NAMES[Number(day)]}</p>
              {daySlots.map(slot => (
                <div key={slot.id} className={`flex items-center justify-between px-2 py-1.5 rounded-lg border text-xs ${
                  slot.is_active
                    ? 'border-primary/20 bg-primary/5'
                    : 'border-border bg-muted/30 opacity-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-primary" />
                    <span className="font-display tracking-wide">
                      {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                    </span>
                    <Badge variant="outline" className="text-[8px] px-1 py-0 font-display">
                      {slot.session_length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Switch
                      checked={slot.is_active}
                      onCheckedChange={v => toggleSlot(slot.id, v)}
                      className="scale-75"
                    />
                    <button onClick={() => removeSlot(slot.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Add new slot */}
          <div className="border-t border-border pt-3 space-y-2">
            <p className="font-display text-[10px] tracking-wider text-muted-foreground">ADD TIME SLOT</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[9px] font-display text-muted-foreground">DAY</Label>
                <Select value={newSlotDay} onValueChange={setNewSlotDay}>
                  <SelectTrigger className="text-xs h-8 mt-0.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 0].map(d => (
                      <SelectItem key={d} value={d.toString()}>{DAY_NAMES[d]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[9px] font-display text-muted-foreground">SESSION LENGTH</Label>
                <Select value={newSlotLength} onValueChange={v => setNewSlotLength(v as '30min' | '60min')}>
                  <SelectTrigger className="text-xs h-8 mt-0.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30min">30 min</SelectItem>
                    <SelectItem value="60min">60 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[9px] font-display text-muted-foreground">START</Label>
                <Select value={newSlotStart} onValueChange={setNewSlotStart}>
                  <SelectTrigger className="text-xs h-8 mt-0.5"><SelectValue>{formatTime(newSlotStart)}</SelectValue></SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map(t => (
                      <SelectItem key={t} value={t}>{formatTime(t)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[9px] font-display text-muted-foreground">END</Label>
                <Select value={newSlotEnd} onValueChange={setNewSlotEnd}>
                  <SelectTrigger className="text-xs h-8 mt-0.5"><SelectValue>{formatTime(newSlotEnd)}</SelectValue></SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map(t => (
                      <SelectItem key={t} value={t}>{formatTime(t)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleAddSlot} className="w-full font-display tracking-wide text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10">
              <Plus className="w-3 h-3" /> ADD SLOT
            </Button>
          </div>

          {/* Blocked dates */}
          <div className="border-t border-border pt-3 space-y-2">
            <p className="font-display text-[10px] tracking-wider text-muted-foreground flex items-center gap-1">
              <CalendarOff className="w-3 h-3" /> BLOCKED DATES
            </p>
            {blockedDates.map(bd => (
              <div key={bd.id} className="flex items-center justify-between px-2 py-1.5 rounded-lg border border-destructive/20 bg-destructive/5 text-xs">
                <span className="font-display tracking-wide">{new Date(bd.blocked_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                {bd.reason && <span className="text-muted-foreground text-[10px]">{bd.reason}</span>}
                <button onClick={() => removeBlockedDate(bd.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input type="date" value={newBlockDate} onChange={e => setNewBlockDate(e.target.value)} className="text-xs flex-1" />
              <Button variant="outline" size="sm" onClick={() => { if (newBlockDate) { addBlockedDate(newBlockDate); setNewBlockDate(''); } }} className="shrink-0 text-xs font-display">
                BLOCK
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coaching Settings */}
      <Card className="border-border bg-card">
        <CardContent className="p-3 space-y-3">
          <p className="font-display text-xs tracking-wider flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-primary" /> COACHING SETTINGS
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[10px] font-display tracking-wide text-muted-foreground">CHECK-IN FREQUENCY</Label>
              <Select value={checkInFrequency} onValueChange={setCheckInFrequency}>
                <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] font-display tracking-wide text-muted-foreground">MAX CLIENTS</Label>
              <Input type="number" value={maxClients} onChange={e => setMaxClients(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Switch checked={acceptingClients} onCheckedChange={setAcceptingClients} />
            <Label className="text-xs font-display tracking-wide">ACCEPTING CLIENTS</Label>
          </div>
        </CardContent>
      </Card>

      {/* Social */}
      <Card className="border-border bg-card">
        <CardContent className="p-3 space-y-3">
          <p className="font-display text-xs tracking-wider">SOCIAL</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[10px] font-display tracking-wide text-muted-foreground">INSTAGRAM</Label>
              <Input value={instagramHandle} onChange={e => setInstagramHandle(e.target.value)} placeholder="@yourhandle" className="mt-1" />
            </div>
            <div>
              <Label className="text-[10px] font-display tracking-wide text-muted-foreground">WEBSITE</Label>
              <Input value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://" className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <Button onClick={handleSave} disabled={saving} className="w-full font-display tracking-wide gap-2"
        style={{ boxShadow: '0 0 20px rgba(255,85,0,0.15)' }}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? 'SAVING...' : 'SAVE PROFILE'}
      </Button>
    </div>
  );
}

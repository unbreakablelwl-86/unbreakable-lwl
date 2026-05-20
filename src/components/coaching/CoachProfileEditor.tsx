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
import { Save, Loader2, Eye, EyeOff, Plus, X } from 'lucide-react';

export function CoachProfileEditor() {
  const { profile, loading, upsertProfile } = useCoachPublicProfile();
  const [saving, setSaving] = useState(false);

  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [yearsExperience, setYearsExperience] = useState('');
  const [coachingStyle, setCoachingStyle] = useState('');
  const [idealClient, setIdealClient] = useState('');
  const [checkInFrequency, setCheckInFrequency] = useState('weekly');
  const [maxClients, setMaxClients] = useState('20');
  const [acceptingClients, setAcceptingClients] = useState(true);
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [newSpec, setNewSpec] = useState('');
  const [newCert, setNewCert] = useState('');

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
      instagram_handle: instagramHandle || null,
      website_url: websiteUrl || null,
      is_published: isPublished,
    });
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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Publish toggle */}
      <Card className={`border-border ${isPublished ? 'border-green-500/30 bg-green-500/5' : ''}`}>
        <CardContent className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPublished ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
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
      <Card className="border-border">
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
      <Card className="border-border">
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
      <Card className="border-border">
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

      {/* Coaching Settings */}
      <Card className="border-border">
        <CardContent className="p-3 space-y-3">
          <p className="font-display text-xs tracking-wider">COACHING SETTINGS</p>
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
            <div>
              <Label className="text-[10px] font-display tracking-wide text-muted-foreground">MONTHLY PRICE (£)</Label>
              <Input type="number" step="0.01" value={monthlyPrice} onChange={e => setMonthlyPrice(e.target.value)} placeholder="99.00" className="mt-1" />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <Switch checked={acceptingClients} onCheckedChange={setAcceptingClients} />
              <Label className="text-xs font-display tracking-wide">ACCEPTING CLIENTS</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social */}
      <Card className="border-border">
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
      <Button onClick={handleSave} disabled={saving} className="w-full font-display tracking-wide gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? 'SAVING...' : 'SAVE PROFILE'}
      </Button>
    </div>
  );
}

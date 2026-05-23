import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Share2, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Profile } from '@/hooks/useProfile';

/* ── Platform config ─────────────────────────────────────────── */
const PLATFORMS = [
  { key: 'social_instagram' as const, label: 'Instagram',  placeholder: 'your_handle', prefix: '@' },
  { key: 'social_tiktok'    as const, label: 'TikTok',     placeholder: 'your_handle', prefix: '@' },
  { key: 'social_twitter'   as const, label: 'X / Twitter', placeholder: 'your_handle', prefix: '@' },
  { key: 'social_facebook'  as const, label: 'Facebook',   placeholder: 'username or profile URL', prefix: '' },
  { key: 'social_youtube'   as const, label: 'YouTube',    placeholder: '@channel or URL', prefix: '' },
  { key: 'social_snapchat'  as const, label: 'Snapchat',   placeholder: 'your_username', prefix: '' },
] as const;

type SocialKey = (typeof PLATFORMS)[number]['key'];

interface SocialLinksCardProps {
  profile: Profile | null;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

export function SocialLinksCard({ profile, updateProfile }: SocialLinksCardProps) {
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<Record<SocialKey, string>>(() => {
    const init = {} as Record<SocialKey, string>;
    for (const p of PLATFORMS) {
      init[p.key] = (profile as any)?.[p.key] ?? '';
    }
    return init;
  });

  // Detect if anything actually changed
  const hasChanges = PLATFORMS.some(
    (p) => (values[p.key] || '') !== ((profile as any)?.[p.key] ?? '')
  );

  const handleSave = async () => {
    setSaving(true);
    const updates: Partial<Profile> = {};
    for (const p of PLATFORMS) {
      const v = values[p.key].trim();
      // Strip leading @ if user typed it
      const clean = v.startsWith('@') ? v.slice(1) : v;
      (updates as any)[p.key] = clean || null;
    }
    const { error } = await updateProfile(updates);
    setSaving(false);
    if (error) {
      toast.error('Failed to save social links');
    } else {
      toast.success('Social links updated');
    }
  };

  return (
    <Card className=" border-border border-gray-800 bg-[#111]">
      <CardHeader>
        <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
          <Share2 className="w-5 h-5 text-primary" />
          SOCIAL LINKS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Add your socials so the community can find you. These show on your profile.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {PLATFORMS.map((p) => (
            <div key={p.key} className="space-y-1.5">
              <Label className="text-foreground font-medium text-sm">{p.label}</Label>
              <div className="relative">
                {p.prefix && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
                    {p.prefix}
                  </span>
                )}
                <Input
                  value={values[p.key]}
                  onChange={(e) => setValues({ ...values, [p.key]: e.target.value })}
                  placeholder={p.placeholder}
                  className={p.prefix ? 'pl-7' : ''}
                />
              </div>
            </div>
          ))}
        </div>

        {hasChanges && (
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full font-display tracking-wide mt-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            SAVE SOCIAL LINKS
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

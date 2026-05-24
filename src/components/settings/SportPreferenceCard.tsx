import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCoachingProfile } from '@/hooks/useCoachingProfile';
import { toast } from 'sonner';

const SPORT_OPTIONS = [
  'Football', 'Boxing', 'Rugby', 'Running', 'Swimming',
  'MMA', 'Cycling', 'Tennis', 'Basketball', 'Cricket',
  'None / General Fitness',
];

export function SportPreferenceCard() {
  const { profile, updateProfile } = useCoachingProfile();
  const current = (profile as any)?.sport_preference || '';

  const handleChange = async (value: string) => {
    const val = value === 'None / General Fitness' ? null : value;
    const { error } = await updateProfile({ sport_preference: val } as any);
    if (error) {
      toast.error('Failed to update sport preference');
    } else {
      toast.success(val ? `Sport set to ${val}` : 'Sport preference cleared');
    }
  };

  const handleClear = async () => {
    const { error } = await updateProfile({ sport_preference: null } as any);
    if (error) {
      toast.error('Failed to clear sport preference');
    } else {
      toast.success('Sport preference cleared');
    }
  };

  return (
    <Card className=" border-border border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg tracking-wide flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          SPORT PREFERENCE
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Your Unbreakable Coach will tailor programmes to your sport. Change or remove any time.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <RadioGroup
          value={current || ''}
          onValueChange={handleChange}
          className="flex flex-wrap gap-2"
        >
          {SPORT_OPTIONS.map(s => (
            <Label
              key={s}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm ${
                current === s || (!current && s === 'None / General Fitness')
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card hover:border-muted-foreground'
              }`}
            >
              <RadioGroupItem value={s} className="sr-only" />
              {s}
            </Label>
          ))}
        </RadioGroup>
        {current && current !== 'None / General Fitness' && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground text-xs gap-1"
            onClick={handleClear}
          >
            <X className="w-3 h-3" /> Clear preference
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Volume2, VolumeX, MessageSquare, Brain, Activity, Bell, GraduationCap } from 'lucide-react';
import { useJJVoice, VoiceFeature } from '@/hooks/useJJVoice';

interface VoiceSettingsSheetProps {
  children?: React.ReactNode;
}

const FEATURES: { key: VoiceFeature; icon: React.ElementType; label: string; description: string }[] = [
  { key: 'chat', icon: MessageSquare, label: 'Chat with your coach', description: 'Voice replies when chatting with your coach' },
  { key: 'mindset', icon: Brain, label: 'Mindset & Breathing', description: 'Voice guidance during meditation and exercises' },
  { key: 'cardio', icon: Activity, label: 'Cardio Updates', description: 'Voice prompts during live cardio tracking' },
  { key: 'university', icon: GraduationCap, label: 'University Read-Aloud', description: 'Your coach reads course chapters aloud' },
  { key: 'notifications', icon: Bell, label: 'Notifications', description: 'Read notifications and alerts aloud' },
];

export function VoiceSettingsSheet({ children }: VoiceSettingsSheetProps) {
  const { settings, setSetting, unlockAudio } = useJJVoice();

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon" className="relative">
            {settings.master ? (
              <Volume2 className="w-5 h-5 text-primary" />
            ) : (
              <VolumeX className="w-5 h-5 text-muted-foreground" />
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="font-display tracking-wide">COACH VOICE</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Master toggle */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="space-y-0.5">
              <Label className="text-foreground font-bold text-base flex items-center gap-2">
                {settings.master ? <Volume2 className="w-5 h-5 text-primary" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
                Voice On/Off
              </Label>
              <p className="text-sm text-muted-foreground">
                Master switch for all coach voice features
              </p>
            </div>
            <Switch
              checked={settings.master}
              onCheckedChange={(checked) => {
                if (checked) unlockAudio();
                setSetting('master', checked);
              }}
            />
          </div>

          {/* Feature toggles */}
          {FEATURES.map(({ key, icon: Icon, label, description }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className={`font-medium flex items-center gap-2 ${settings.master ? 'text-foreground' : 'text-muted-foreground'}`}>
                  <Icon className="w-4 h-4 text-primary" />
                  {label}
                </Label>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <Switch
                checked={settings[key]}
                onCheckedChange={(checked) => setSetting(key, checked)}
                disabled={!settings.master}
              />
            </div>
          ))}

          <p className="text-xs text-muted-foreground pt-4 border-t border-border">
            Your coach's voice — powered by ElevenLabs. All voice features use the same male coach voice.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

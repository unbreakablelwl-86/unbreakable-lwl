import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Volume2, VolumeX } from 'lucide-react';
import { useAIPreferences } from '@/hooks/useAIPreferences';

interface VoiceSettingsSheetProps {
  children?: React.ReactNode;
}

export function VoiceSettingsSheet({ children }: VoiceSettingsSheetProps) {
  const { preferences, isLoading, updatePreferences } = useAIPreferences();

  if (isLoading || !preferences) {
    return children || (
      <Button variant="ghost" size="icon" disabled>
        <Volume2 className="w-5 h-5 text-primary" />
      </Button>
    );
  }

  const handleVoiceToggle = (enabled: boolean) => {
    updatePreferences.mutate({ voice_feedback_enabled: enabled });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children || (
          <Button 
            variant="ghost" 
            size="icon"
            className="relative"
          >
            {preferences.voice_feedback_enabled ? (
              <Volume2 className="w-5 h-5 text-primary" />
            ) : (
              <VolumeX className="w-5 h-5 text-muted-foreground" />
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="font-display tracking-wide">VOICE SETTINGS</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Voice Feedback Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium">Voice Feedback</Label>
              <p className="text-sm text-muted-foreground">
                Enable audio responses from your coach
              </p>
            </div>
            <Switch
              checked={preferences.voice_feedback_enabled}
              onCheckedChange={handleVoiceToggle}
            />
          </div>

          <p className="text-xs text-muted-foreground pt-4 border-t border-border">
            JJ's voice is used across the app — coaching, breathing, and chat.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

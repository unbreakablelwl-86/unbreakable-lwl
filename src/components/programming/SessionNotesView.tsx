import { useState } from 'react';
import { FullScreenToolView } from './FullScreenToolView';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StickyNote, Save, Globe, Users, Lock } from 'lucide-react';

interface SessionNotesViewProps {
  initialNotes?: string;
  initialVisibility?: 'public' | 'friends' | 'private';
  onSave: (notes: string, visibility: 'public' | 'friends' | 'private') => void;
  onClose: () => void;
}

export function SessionNotesView({
  initialNotes = '',
  initialVisibility = 'private',
  onSave,
  onClose,
}: SessionNotesViewProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>(initialVisibility);

  const handleSave = () => {
    onSave(notes, visibility);
    onClose();
  };

  const visibilityOptions = [
    { value: 'public', label: 'Everyone', icon: <Globe className="w-4 h-4" /> },
    { value: 'friends', label: 'Friends Only', icon: <Users className="w-4 h-4" /> },
    { value: 'private', label: 'Only Me', icon: <Lock className="w-4 h-4" /> },
  ];

  return (
    <FullScreenToolView
      title="SESSION NOTES"
      subtitle="Add notes about your workout"
      icon={<StickyNote className="w-5 h-5" />}
      onClose={onClose}
      footer={
        <Button onClick={handleSave} className="w-full gap-2">
          <Save className="w-4 h-4" />
          Save Notes
        </Button>
      }
    >
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Notes Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            How did your workout go?
          </label>
          <Textarea
            placeholder="Record your thoughts, energy levels, achievements, or anything noteworthy..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={8}
            className="resize-none"
          />
        </div>

        {/* Visibility Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Who can see this?
          </label>
          <Select value={visibility} onValueChange={(v) => setVisibility(v as typeof visibility)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {visibilityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    {option.icon}
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Prompt Suggestions */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Quick prompts:</p>
          <div className="flex flex-wrap gap-2">
            {[
              'Felt strong today 💪',
              'Good progress on form',
              'Need more rest next time',
              'Hit a new PR!',
              'Energy was low',
            ].map((prompt) => (
              <Button
                key={prompt}
                variant="outline"
                size="sm"
                onClick={() => setNotes((prev) => prev ? `${prev}\n${prompt}` : prompt)}
                className="text-xs"
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </FullScreenToolView>
  );
}

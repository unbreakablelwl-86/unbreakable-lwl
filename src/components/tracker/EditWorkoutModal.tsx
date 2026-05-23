import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe, Users, Lock, Loader2 } from 'lucide-react';

interface EditWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { notes: string; visibility: string }) => Promise<void>;
  initialNotes: string | null;
  initialVisibility: string;
}

export function EditWorkoutModal({
  isOpen,
  onClose,
  onSave,
  initialNotes,
  initialVisibility,
}: EditWorkoutModalProps) {
  const [notes, setNotes] = useState(initialNotes || '');
  const [visibility, setVisibility] = useState(initialVisibility);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNotes(initialNotes || '');
      setVisibility(initialVisibility);
    }
  }, [isOpen, initialNotes, initialVisibility]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ notes, visibility });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-[#0a0a0a] border-gray-800">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wide">Edit Workout</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How was your workout?"
              className="min-h-[120px] resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Visibility:</span>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Public
                  </div>
                </SelectItem>
                <SelectItem value="friends">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Friends
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Only Me
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

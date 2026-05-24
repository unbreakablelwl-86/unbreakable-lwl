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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe, Users, Lock, Loader2 } from 'lucide-react';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { content: string; visibility: string }) => Promise<void>;
  initialContent: string | null;
  initialVisibility: string;
}

export function EditPostModal({
  isOpen,
  onClose,
  onSave,
  initialContent,
  initialVisibility,
}: EditPostModalProps) {
  const [content, setContent] = useState(initialContent || '');
  const [visibility, setVisibility] = useState(initialVisibility);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setContent(initialContent || '');
      setVisibility(initialVisibility);
    }
  }, [isOpen, initialContent, initialVisibility]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ content, visibility });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const getVisibilityIcon = (value: string) => {
    switch (value) {
      case 'friends':
        return <Users className="w-4 h-4" />;
      case 'private':
        return <Lock className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wide">Edit Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="min-h-[150px] resize-none"
          />

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

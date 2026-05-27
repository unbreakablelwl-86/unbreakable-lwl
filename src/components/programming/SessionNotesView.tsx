import { useState, useRef } from 'react';
import { FullScreenToolView } from './FullScreenToolView';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StickyNote, Save, Globe, Users, Lock, Image, Video, X, Loader2 } from 'lucide-react';
import { uploadMediaFile } from '@/lib/mediaUpload';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface SessionMedia {
  url: string;
  type: 'image' | 'video';
  thumbnailUrl?: string;
}

interface SessionNotesViewProps {
  initialNotes?: string;
  initialVisibility?: 'public' | 'friends' | 'private';
  initialMedia?: SessionMedia[];
  onSave: (notes: string, visibility: 'public' | 'friends' | 'private', media?: SessionMedia[]) => void;
  onClose: () => void;
}

export function SessionNotesView({
  initialNotes = '',
  initialVisibility = 'private',
  initialMedia = [],
  onSave,
  onClose,
}: SessionNotesViewProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>(initialVisibility);
  const [media, setMedia] = useState<SessionMedia[]>(initialMedia);
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const MAX_MEDIA = 5;

  const handleSave = () => {
    onSave(notes, visibility, media.length > 0 ? media : undefined);
    onClose();
  };

  const handleFileUpload = async (file: File, type: 'image' | 'video') => {
    if (!user) { toast.error('Please sign in'); return; }
    
    if (media.length >= MAX_MEDIA) {
      toast.error(`Maximum ${MAX_MEDIA} attachments per session`); return;
    }

    const maxSize = type === 'video' ? 500 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File too large. Max ${type === 'video' ? '500MB' : '10MB'}`); return;
    }

    setIsUploading(true);
    try {
      const result = await uploadMediaFile(user.id, file, type);
      if (result.error) throw result.error;
      setMedia(prev => [...prev, { url: result.url, type, thumbnailUrl: result.thumbnailUrl || undefined }]);
      toast.success(`${type === 'video' ? 'Video' : 'Image'} attached`);
    } catch {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
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

        {/* Media Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Attach up to 5 photos or videos
          </label>

          {/* Hidden inputs */}
          <input ref={imageInputRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, 'image'); e.target.value = ''; }} />
          <input ref={videoInputRef} type="file" accept="video/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, 'video'); e.target.value = ''; }} />

          {/* Previews */}
          {media.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {media.map((m, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                  {m.type === 'image' ? (
                    <img src={m.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Video className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <button onClick={() => removeMedia(i)}
                    className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload buttons */}
          <div className="flex gap-2">
            {!isUploading && media.length < MAX_MEDIA && (
              <>
                <Button variant="outline" size="sm" onClick={() => imageInputRef.current?.click()} className="gap-1 text-xs">
                  <Image className="w-4 h-4" /> Add Photo
                </Button>
                <Button variant="outline" size="sm" onClick={() => videoInputRef.current?.click()} className="gap-1 text-xs">
                  <Video className="w-4 h-4" /> Add Video
                </Button>
              </>
            )}
            {isUploading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
              </div>
            )}
          </div>
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

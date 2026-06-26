import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Music, Send, Loader2 } from 'lucide-react';
import type { Track } from '@/hooks/useUnTunes';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ShareTrackSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  track: Track;
}

const DEFAULT_HASHTAGS = '\n\n#Unbreakable #LiveWithoutLimits #KeepShowingUp';

export function ShareTrackSheet({ open, onOpenChange, track }: ShareTrackSheetProps) {
  const { user } = useAuth();
  const { createPost } = usePosts();
  const [caption, setCaption] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!user) return;
    setIsPosting(true);

    try {
      const trackLine = `🎵 Now listening to "${track.title}" by ${track.artist_name || 'Unknown Artist'} on Un-Tunes`;
      const content = caption.trim()
        ? `${caption.trim()}\n\n${trackLine}${DEFAULT_HASHTAGS}`
        : `${trackLine}${DEFAULT_HASHTAGS}`;

      const { error } = await createPost({
        content,
        image_url: track.cover_url || undefined,
        visibility: 'public',
      });

      if (error) {
        toast.error('Failed to share track');
      } else {
        toast.success('Track shared to your timeline!');
        setCaption('');
        onOpenChange(false);
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl border-border bg-card">
        <SheetHeader className="text-left pb-2">
          <SheetTitle className="font-display tracking-wide text-base">Share to Timeline</SheetTitle>
        </SheetHeader>

        {/* Track preview */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 mb-4">
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-primary/10 shrink-0 shadow-[0_0_8px_rgba(255,85,0,0.2)]">
            {track.cover_url ? (
              <img loading="lazy" src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music className="w-6 h-6 text-primary/40" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm text-foreground truncate">{track.title}</p>
            <p className="text-xs text-muted-foreground truncate">{track.artist_name || 'Unknown Artist'}</p>
            <p className="text-[10px] text-primary font-display tracking-wider mt-0.5">UN-TUNES</p>
          </div>
        </div>

        {/* Caption input */}
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Add a caption... (optional)"
          className="w-full min-h-[80px] rounded-xl bg-muted/30 border border-border/50 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none outline-none focus:border-primary/40 transition-colors"
        />

        {/* Post button */}
        <Button
          onClick={handlePost}
          disabled={isPosting}
          className="w-full mt-3 font-display tracking-wide"
        >
          {isPosting ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          Share to Timeline
        </Button>
      </SheetContent>
    </Sheet>
  );
}

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MediaItem {
  id: string;
  media_type: 'image' | 'video' | 'audio';
  media_url: string;
  thumbnail_url?: string | null;
  sort_order: number;
}

interface MediaCarouselProps {
  items: MediaItem[];
}

export function MediaCarousel({ items }: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showExpanded, setShowExpanded] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);
  const current = sorted[currentIndex];
  const total = sorted.length;

  useEffect(() => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [currentIndex]);

  if (!current) return null;

  const goTo = (idx: number) => {
    if (idx >= 0 && idx < total) setCurrentIndex(idx);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const openExpanded = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    setShowExpanded(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < total - 1) goTo(currentIndex + 1);
      else if (diff < 0 && currentIndex > 0) goTo(currentIndex - 1);
    }
    setTouchStart(null);
  };

  const renderExpandedMedia = () => {
    if (current.media_type === 'image') {
      return (
        <img
          src={current.media_url}
          alt={`Media ${currentIndex + 1} of ${total}`}
          className="max-h-[78vh] w-full rounded-lg object-contain"
          loading="lazy"
        />
      );
    }

    return (
      <video
        src={current.media_url}
        className="max-h-[78vh] w-full rounded-lg object-contain"
        controls
        playsInline
        preload="metadata"
        poster={current.thumbnail_url || undefined}
      />
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="relative overflow-hidden rounded-lg"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {current.media_type === 'image' ? (
          <img
            src={current.media_url}
            alt={`Media ${currentIndex + 1}`}
            className="w-full max-h-[500px] cursor-zoom-in object-cover"
            loading="lazy"
            onClick={openExpanded}
          />
        ) : (
          <div className="relative group flex justify-center bg-muted/40">
            <video
              ref={videoRef}
              src={current.media_url}
              className="max-w-full max-h-[600px] cursor-pointer"
              loop
              muted={isMuted}
              playsInline
              preload="auto"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onClick={togglePlay}
              poster={current.thumbnail_url || undefined}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <Button
                variant="secondary"
                size="icon"
                className="h-14 w-14 rounded-full pointer-events-auto bg-background/80 text-foreground hover:bg-background"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
              </Button>
            </div>
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/80 text-foreground hover:bg-background" onClick={openExpanded}>
                <Maximize className="w-4 h-4" />
              </Button>
              <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/80 text-foreground hover:bg-background" onClick={toggleMute}>
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}

        {total > 1 && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute left-2 top-2 h-8 rounded-full bg-background/80 px-3 text-xs font-medium text-foreground hover:bg-background"
            onClick={openExpanded}
          >
            View all {total}
          </Button>
        )}

        {/* Navigation Arrows */}
        {total > 1 && currentIndex > 0 && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background/80 text-foreground hover:bg-background"
            onClick={() => goTo(currentIndex - 1)}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        {total > 1 && currentIndex < total - 1 && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background/80 text-foreground hover:bg-background"
            onClick={() => goTo(currentIndex + 1)}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Dots */}
      {total > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {sorted.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                i === currentIndex ? 'bg-primary w-4' : 'bg-muted-foreground/30'
              )}
            />
          ))}
        </div>
      )}

      <Dialog open={showExpanded} onOpenChange={setShowExpanded}>
        <DialogContent className="max-w-[96vw] border-border bg-background p-4 sm:max-w-5xl bg-background border-border">
          <div
            className="relative overflow-hidden rounded-xl"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {renderExpandedMedia()}

            <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-foreground">
              {currentIndex + 1} / {total}
            </div>

            {total > 1 && currentIndex > 0 && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-background/80 text-foreground hover:bg-background"
                onClick={() => goTo(currentIndex - 1)}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}

            {total > 1 && currentIndex < total - 1 && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-background/80 text-foreground hover:bg-background"
                onClick={() => goTo(currentIndex + 1)}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            )}
          </div>

          {total > 1 && (
            <div className="mt-3 flex justify-center gap-2">
              {sorted.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => goTo(i)}
                  className={cn(
                    'h-2 rounded-full transition-all',
                    i === currentIndex ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'
                  )}
                  aria-label={`Go to media item ${i + 1}`}
                />
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

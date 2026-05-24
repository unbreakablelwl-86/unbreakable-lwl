import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, Check } from 'lucide-react';

export type VideoQuality = 'auto' | '1080p' | '720p' | '480p';

interface VideoQualitySelectorProps {
  currentQuality: VideoQuality;
  onQualityChange: (quality: VideoQuality) => void;
  availableQualities?: VideoQuality[];
}

const QUALITY_LABELS: Record<VideoQuality, string> = {
  'auto': 'Auto',
  '1080p': '1080p HD',
  '720p': '720p',
  '480p': '480p',
};

const QUALITY_BITRATES: Record<VideoQuality, number> = {
  'auto': 0,
  '1080p': 5000000,
  '720p': 2500000,
  '480p': 1000000,
};

export function VideoQualitySelector({
  currentQuality,
  onQualityChange,
  availableQualities = ['auto', '1080p', '720p', '480p'],
}: VideoQualitySelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 bg-background/50 hover:bg-background/70 text-foreground"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border-border">
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          Quality
        </div>
        {availableQualities.map((quality) => (
          <DropdownMenuItem
            key={quality}
            onClick={() => onQualityChange(quality)}
            className="flex items-center justify-between gap-2"
          >
            <span>{QUALITY_LABELS[quality]}</span>
            {currentQuality === quality && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Hook for managing video quality with network detection
export function useVideoQuality() {
  const [quality, setQuality] = useState<VideoQuality>('auto');
  const [detectedQuality, setDetectedQuality] = useState<VideoQuality>('720p');

  // Detect network conditions and suggest quality
  const detectOptimalQuality = async (): Promise<VideoQuality> => {
    const connection = (navigator as any).connection;
    
    if (connection) {
      const effectiveType = connection.effectiveType;
      const downlink = connection.downlink; // Mbps
      
      if (effectiveType === '4g' && downlink > 5) {
        return '1080p';
      } else if (effectiveType === '4g' || downlink > 2) {
        return '720p';
      } else {
        return '480p';
      }
    }
    
    // Fallback: measure download speed
    try {
      const startTime = performance.now();
      const response = await fetch('/placeholder.svg', { cache: 'no-cache' });
      const blob = await response.blob();
      const endTime = performance.now();
      
      const duration = (endTime - startTime) / 1000; // seconds
      const sizeInBits = blob.size * 8;
      const speedMbps = (sizeInBits / duration) / 1000000;
      
      if (speedMbps > 5) return '1080p';
      if (speedMbps > 2) return '720p';
      return '480p';
    } catch {
      return '720p';
    }
  };

  const getEffectiveQuality = (): VideoQuality => {
    return quality === 'auto' ? detectedQuality : quality;
  };

  const initializeQuality = async () => {
    const optimal = await detectOptimalQuality();
    setDetectedQuality(optimal);
  };

  return {
    quality,
    setQuality,
    effectiveQuality: getEffectiveQuality(),
    initializeQuality,
    detectOptimalQuality,
  };
}

import { Users, Play } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { Artist } from '@/hooks/useUnTunes';

interface ArtistCardProps {
  artist: Artist;
}

export function UnTunesArtistCard({ artist }: ArtistCardProps) {
  return (
    <Card className="p-4 border-border/50 bg-card/30 hover:bg-card/50 cursor-pointer transition-all group hover:border-primary/30 hover:shadow-[0_0_16px_rgba(255,85,0,0.15)]">
      <div className="flex flex-col items-center text-center gap-3">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(255,85,0,0.3)] transition-shadow">
          {artist.avatar_url ? (
            <img loading="lazy" src={artist.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-xl font-display text-primary drop-shadow-[0_0_6px_rgba(255,85,0,0.5)]">
              {artist.artist_name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="font-display text-sm tracking-wider text-foreground truncate max-w-full">{artist.artist_name}</p>
          <div className="flex items-center justify-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Users className="w-3 h-3 text-primary/60" /> {artist.follower_count ?? 0}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Play className="w-3 h-3 text-primary/60" /> {artist.total_plays ?? 0}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

import { motion } from 'framer-motion';
import { Mic2, Users, Play, BadgeCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { Artist } from '@/hooks/useUnTunes';

interface ArtistCardProps {
  artist: Artist;
}

export function UnTunesArtistCard({ artist }: ArtistCardProps) {
  return (
    <Card className="group overflow-hidden border-border/50 bg-card/30 hover:bg-card/50 hover:border-primary/20 transition-all cursor-pointer">
      {/* Avatar */}
      <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
        {artist.avatar_url ? (
          <img
            src={artist.avatar_url}
            alt={artist.artist_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Mic2 className="w-10 h-10 text-primary/30" />
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-center gap-1.5">
          <p className="font-display text-sm tracking-wider text-foreground truncate">
            {artist.artist_name}
          </p>
          {artist.is_verified && (
            <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" />
            {artist.follower_count.toLocaleString()}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Play className="w-3 h-3" />
            {artist.total_plays.toLocaleString()}
          </span>
        </div>
        {artist.genre_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {artist.genre_tags.slice(0, 2).map(tag => (
              <span
                key={tag}
                className="text-[9px] font-display tracking-wider text-primary/70 bg-primary/10 px-1.5 py-0.5 rounded"
              >
                {tag.toUpperCase()}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

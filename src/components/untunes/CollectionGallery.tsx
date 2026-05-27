/**
 * CollectionGallery — Displays user's collected Un-Tunes cards.
 * Cards grouped by rarity, with diamond editions highlighted.
 * Tap any card to view full size with download PDF option.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Diamond, Crown, Music, Disc3, X, Download, Filter, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface CollectionCard {
  id: string;
  track_id: string | null;
  album_id: string | null;
  rarity: 'standard' | 'gold' | 'diamond';
  edition_number: number;
  is_opened: boolean;
  created_at: string;
  un_tunes_tracks?: { title: string; cover_url: string; audio_url: string } | null;
  un_tunes_albums?: { title: string; cover_url: string } | null;
}

interface CollectionGalleryProps {
  onBack?: () => void;
}

const RARITY_CONFIG = {
  standard: {
    label: 'Standard', icon: Music, gradient: 'from-zinc-400 to-zinc-600',
    border: 'border-zinc-500/30', text: 'text-zinc-400', bg: 'bg-zinc-500/10',
    glow: '',
  },
  gold: {
    label: 'Gold', icon: Crown, gradient: 'from-yellow-400 to-amber-500',
    border: 'border-yellow-500/40', text: 'text-yellow-400', bg: 'bg-yellow-500/10',
    glow: 'shadow-[0_0_20px_rgba(251,191,36,0.3)]',
  },
  diamond: {
    label: 'Diamond', icon: Diamond, gradient: 'from-cyan-400 via-violet-400 to-pink-400',
    border: 'border-violet-500/40', text: 'text-violet-400', bg: 'bg-violet-500/10',
    glow: 'shadow-[0_0_30px_rgba(139,92,246,0.4)]',
  },
};

export function CollectionGallery({ onBack }: CollectionGalleryProps) {
  const { user } = useAuth();
  const [cards, setCards] = useState<CollectionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'standard' | 'gold' | 'diamond'>('all');
  const [selectedCard, setSelectedCard] = useState<CollectionCard | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from('un_tunes_user_cards')
        .select('*, un_tunes_tracks(title, cover_url, audio_url), un_tunes_albums(title, cover_url)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) setCards(data as any);
      setLoading(false);
    })();
  }, [user]);

  const filtered = filter === 'all' ? cards : cards.filter(c => c.rarity === filter);
  const diamondCount = cards.filter(c => c.rarity === 'diamond').length;
  const goldCount = cards.filter(c => c.rarity === 'gold').length;
  const standardCount = cards.filter(c => c.rarity === 'standard').length;

  const handleDownloadPDF = async (card: CollectionCard) => {
    // Generate PDF postcard on-the-fly
    const title = card.track_id ? card.un_tunes_tracks?.title : card.un_tunes_albums?.title;
    const coverUrl = card.track_id ? card.un_tunes_tracks?.cover_url : card.un_tunes_albums?.cover_url;
    
    // Create a downloadable canvas-based postcard
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1800;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 1200, 1800);

    // Rarity border
    const colors = {
      standard: '#a1a1aa',
      gold: '#fbbf24',
      diamond: '#8b5cf6',
    };
    ctx.strokeStyle = colors[card.rarity];
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, 1120, 1720);

    // Inner border
    ctx.strokeStyle = colors[card.rarity] + '40';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 60, 1080, 1680);

    // Load cover image
    if (coverUrl) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = coverUrl;
        });
        // Draw centered square cover
        const size = 900;
        ctx.drawImage(img, (1200 - size) / 2, 120, size, size);
      } catch {
        // Fallback — draw placeholder
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(150, 120, 900, 900);
        ctx.fillStyle = '#333';
        ctx.font = '120px serif';
        ctx.textAlign = 'center';
        ctx.fillText('♫', 600, 620);
      }
    }

    // UN-TUNES header
    ctx.fillStyle = '#FF5500';
    ctx.font = '600 28px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('UN-TUNES COLLECTIBLE', 600, 1100);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 48px system-ui';
    ctx.fillText(title || 'Unknown', 600, 1180);

    // Rarity badge
    ctx.fillStyle = colors[card.rarity];
    ctx.font = '600 32px system-ui';
    ctx.fillText(`${card.rarity.toUpperCase()} EDITION`, 600, 1260);

    // Edition number for diamonds
    if (card.rarity === 'diamond' && card.edition_number > 0) {
      ctx.fillStyle = '#c4b5fd';
      ctx.font = '400 36px monospace';
      ctx.fillText(`#${String(card.edition_number).padStart(3, '0')} / 100`, 600, 1320);
    }

    // Type label
    ctx.fillStyle = '#71717a';
    ctx.font = '400 24px system-ui';
    ctx.fillText(card.track_id ? 'Track Card' : 'Album Card', 600, 1400);

    // Unbreakable branding
    ctx.fillStyle = '#52525b';
    ctx.font = '300 20px system-ui';
    ctx.fillText('UNBREAKABLE • UN-TUNES', 600, 1680);

    // Sequential number bottom-right
    ctx.textAlign = 'right';
    ctx.fillStyle = '#3f3f46';
    ctx.font = '300 16px monospace';
    const dateStr = new Date(card.created_at).toLocaleDateString('en-GB');
    ctx.fillText(`Collected ${dateStr}`, 1140, 1720);

    // Download
    const link = document.createElement('a');
    link.download = `untunes-${card.rarity}-${(title || 'card').replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div className="flex-1">
          <h2 className="font-display text-lg tracking-wider">MY COLLECTION</h2>
          <p className="text-xs text-muted-foreground">{cards.length} card{cards.length !== 1 ? 's' : ''} collected</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { rarity: 'diamond' as const, count: diamondCount },
          { rarity: 'gold' as const, count: goldCount },
          { rarity: 'standard' as const, count: standardCount },
        ].map(({ rarity, count }) => {
          const config = RARITY_CONFIG[rarity];
          const Icon = config.icon;
          return (
            <motion.div
              key={rarity}
              className={cn('rounded-xl border p-3 text-center', config.border, config.bg)}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(filter === rarity ? 'all' : rarity)}
            >
              <Icon className={cn('w-4 h-4 mx-auto mb-1', config.text)} />
              <p className={cn('text-lg font-display', config.text)}>{count}</p>
              <p className="text-[10px] text-muted-foreground tracking-wider">{config.label.toUpperCase()}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all', 'diamond', 'gold', 'standard'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-display tracking-wider border whitespace-nowrap transition-all',
              filter === f
                ? 'bg-primary/20 border-primary/40 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/20',
            )}
          >
            {f === 'all' ? 'ALL' : f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Card grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading collection…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Music className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {cards.length === 0 ? 'No cards yet — purchase tracks to start collecting!' : 'No cards match this filter'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {filtered.map((card, i) => {
            const config = RARITY_CONFIG[card.rarity];
            const isTrack = !!card.track_id;
            const title = isTrack ? card.un_tunes_tracks?.title : card.un_tunes_albums?.title;
            const coverUrl = isTrack ? card.un_tunes_tracks?.cover_url : card.un_tunes_albums?.cover_url;

            return (
              <motion.div
                key={card.id}
                className={cn(
                  'relative rounded-lg border overflow-hidden cursor-pointer',
                  config.border,
                  card.rarity !== 'standard' && config.glow,
                )}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCard(card)}
              >
                {coverUrl ? (
                  <img src={coverUrl} alt={title || ''} className="w-full aspect-square object-cover" />
                ) : (
                  <div className="w-full aspect-square bg-zinc-900 flex items-center justify-center">
                    <Music className="w-6 h-6 text-zinc-700" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                {/* Rarity indicator */}
                {card.rarity !== 'standard' && (
                  <div className={cn('absolute top-1 right-1 p-0.5 rounded-full', config.bg)}>
                    {card.rarity === 'diamond' ? (
                      <Diamond className="w-3 h-3 text-violet-400" />
                    ) : (
                      <Crown className="w-3 h-3 text-yellow-400" />
                    )}
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-1.5">
                  <p className="text-white text-[10px] font-display tracking-wider truncate">{title}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full-size card viewer */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              className="max-w-sm w-full"
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const config = RARITY_CONFIG[selectedCard.rarity];
                const isTrack = !!selectedCard.track_id;
                const title = isTrack ? selectedCard.un_tunes_tracks?.title : selectedCard.un_tunes_albums?.title;
                const coverUrl = isTrack ? selectedCard.un_tunes_tracks?.cover_url : selectedCard.un_tunes_albums?.cover_url;

                return (
                  <div className={cn('rounded-2xl border-2 overflow-hidden', config.border, config.glow)}>
                    {coverUrl ? (
                      <img src={coverUrl} alt={title || ''} className="w-full aspect-square object-cover" />
                    ) : (
                      <div className="w-full aspect-square bg-zinc-900 flex items-center justify-center">
                        <Music className="w-16 h-16 text-zinc-700" />
                      </div>
                    )}
                    <div className="bg-zinc-900 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-white tracking-wider">{title}</h3>
                        <Badge variant="outline" className={cn('text-[10px] font-display tracking-widest', config.text, config.border)}>
                          {config.label.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isTrack ? 'Track Card' : 'Album Card'}
                      </p>
                      {selectedCard.rarity === 'diamond' && selectedCard.edition_number > 0 && (
                        <p className="text-sm text-violet-300 font-mono">
                          Edition #{String(selectedCard.edition_number).padStart(3, '0')} / 100
                        </p>
                      )}
                      <p className="text-[10px] text-zinc-600">
                        Collected {new Date(selectedCard.created_at).toLocaleDateString('en-GB')}
                      </p>
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs font-display tracking-wider"
                          onClick={() => setSelectedCard(null)}
                        >
                          CLOSE
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-primary to-orange-600 text-white text-xs font-display tracking-wider"
                          onClick={() => handleDownloadPDF(selectedCard)}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          DOWNLOAD
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

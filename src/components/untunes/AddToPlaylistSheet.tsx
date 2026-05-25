/**
 * AddToPlaylistSheet — bottom sheet that shows user's playlists
 * and lets them pick one (or create a new one) to add a track to.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check, Music, ListPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Track, Playlist } from '@/hooks/useUnTunes';

interface AddToPlaylistSheetProps {
  track: Track | null;
  playlists: Playlist[];
  open: boolean;
  onClose: () => void;
  onSelect: (playlistId: string) => Promise<boolean>;
  onCreate: (name: string) => Promise<Playlist | null>;
}

export function AddToPlaylistSheet({
  track,
  playlists,
  open,
  onClose,
  onSelect,
  onCreate,
}: AddToPlaylistSheetProps) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [addedTo, setAddedTo] = useState<string | null>(null);

  if (!open || !track) return null;

  const handleSelect = async (playlistId: string) => {
    setAddingTo(playlistId);
    const ok = await onSelect(playlistId);
    setAddingTo(null);
    if (ok) {
      setAddedTo(playlistId);
      setTimeout(() => {
        setAddedTo(null);
        onClose();
      }, 800);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const pl = await onCreate(newName.trim());
    setCreating(false);
    if (pl) {
      setNewName('');
      // Immediately add to the new playlist
      await handleSelect(pl.id);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[81] max-h-[75vh] rounded-t-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(20,20,20,0.99) 0%, rgba(10,10,10,1) 100%)',
              border: '1px solid rgba(255,85,0,0.15)',
              borderBottom: 'none',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center py-2">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3">
              <div className="flex items-center gap-3">
                <ListPlus className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-display text-sm tracking-wider text-foreground">ADD TO PLAYLIST</h3>
                  <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                    {track.title} — {track.artist_name || 'Unknown'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/50 transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Create New Playlist */}
            <div className="px-5 pb-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder="New playlist name..."
                  className="flex-1 bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
                />
                <Button
                  size="sm"
                  onClick={handleCreate}
                  disabled={!newName.trim() || creating}
                  className="font-display tracking-wider gap-1.5 h-9"
                >
                  {creating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  CREATE
                </Button>
              </div>
            </div>

            {/* Playlist list */}
            <div className="px-5 pb-6 overflow-y-auto max-h-[50vh]">
              {playlists.length === 0 ? (
                <div className="py-8 text-center">
                  <Music className="w-8 h-8 text-primary/20 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No playlists yet — create one above</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {playlists.map((pl) => {
                    const isAdding = addingTo === pl.id;
                    const isAdded = addedTo === pl.id;

                    return (
                      <button
                        key={pl.id}
                        onClick={() => handleSelect(pl.id)}
                        disabled={isAdding || isAdded}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                          isAdded
                            ? 'bg-green-500/10 border border-green-500/30'
                            : 'bg-card/30 border border-border/50 hover:bg-card/60 hover:border-primary/20'
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${
                          isAdded ? 'bg-green-500/20' : 'bg-primary/10'
                        }`}>
                          {isAdded ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : isAdding ? (
                            <Loader2 className="w-5 h-5 text-primary animate-spin" />
                          ) : (
                            <Music className="w-5 h-5 text-primary/60" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isAdded ? 'text-green-400' : 'text-foreground'}`}>
                            {pl.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {pl.track_count} track{pl.track_count !== 1 ? 's' : ''}
                          </p>
                        </div>
                        {isAdded && (
                          <span className="text-[10px] font-display tracking-wider text-green-400">ADDED</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

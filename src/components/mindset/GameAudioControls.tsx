import { Volume2, VolumeX, Music, MusicIcon } from "lucide-react";

interface GameAudioControlsProps {
  sfxMuted: boolean;
  musicMuted: boolean;
  toggleSfx: () => void;
  toggleMusic: () => void;
}

export function GameAudioControls({ sfxMuted, musicMuted, toggleSfx, toggleMusic }: GameAudioControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleSfx}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-display tracking-wider transition-all ${
          sfxMuted
            ? 'border-border/30 bg-muted/10 text-muted-foreground'
            : 'border-primary/30 bg-primary/10 text-primary'
        }`}
        title={sfxMuted ? "Enable SFX" : "Mute SFX"}
      >
        {sfxMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        SFX
      </button>
      <button
        onClick={toggleMusic}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-display tracking-wider transition-all ${
          musicMuted
            ? 'border-border/30 bg-muted/10 text-muted-foreground'
            : 'border-primary/30 bg-primary/10 text-primary'
        }`}
        title={musicMuted ? "Enable Music" : "Mute Music"}
      >
        {musicMuted ? <MusicIcon className="w-3.5 h-3.5 opacity-40" /> : <Music className="w-3.5 h-3.5" />}
        MUSIC
      </button>
    </div>
  );
}

import { Sparkles, Wrench, ChevronRight, MessageSquare } from 'lucide-react';

interface BuilderModeSelectorProps {
  onSelectMode: (mode: 'auto' | 'manual') => void;
}

export function BuilderModeSelector({ onSelectMode }: BuilderModeSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-display tracking-wider text-gray-400 mb-3">CHOOSE YOUR PATH</p>

      <button
        onClick={() => onSelectMode('auto')}
        className="w-full p-3.5 rounded-xl border border-gray-800 bg-[#111] flex items-center gap-3 hover:border-[#FF5500]/30 transition-all group"
      >
        <div className="w-10 h-10 rounded-lg border border-[#FF5500]/20 flex items-center justify-center" style={{ background: 'rgba(255,85,0,0.1)' }}>
          <MessageSquare className="w-5 h-5 text-[#FF5500]" style={{ filter: 'drop-shadow(0 0 6px rgba(255,85,0,0.5))' }} />
        </div>
        <div className="flex-1 text-left">
          <p className="font-display text-sm tracking-wider text-white">AI COACH BUILDER</p>
          <p className="text-gray-500 text-xs mt-0.5">Chat with your coach — auto-builds your programme</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[#FF5500] transition-colors" />
      </button>

      <button
        onClick={() => onSelectMode('manual')}
        className="w-full p-3.5 rounded-xl border border-gray-800 bg-[#111] flex items-center gap-3 hover:border-[#FF5500]/30 transition-all group"
      >
        <div className="w-10 h-10 rounded-lg border border-[#FF5500]/20 flex items-center justify-center" style={{ background: 'rgba(255,85,0,0.1)' }}>
          <Wrench className="w-5 h-5 text-[#FF5500]" style={{ filter: 'drop-shadow(0 0 6px rgba(255,85,0,0.5))' }} />
        </div>
        <div className="flex-1 text-left">
          <p className="font-display text-sm tracking-wider text-white">MANUAL BUILDER</p>
          <p className="text-gray-500 text-xs mt-0.5">Full customisation — build it yourself</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[#FF5500] transition-colors" />
      </button>
    </div>
  );
}

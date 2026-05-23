import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Sparkles, ArrowRight, Footprints, Zap, Bike, Wrench, Edit3 } from 'lucide-react';

interface CardioModeSelectorProps {
  onSelectMode: (mode: 'auto' | 'manual') => void;
}

export function CardioModeSelector({ onSelectMode }: CardioModeSelectorProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Auto Builder */}
      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
        <button
          onClick={() => onSelectMode('auto')}
          className="w-full text-left relative overflow-hidden rounded-xl p-5 
            border border-[#FF5500]/20 bg-[#111] hover:border-[#FF5500]/40 
            hover:bg-[#FF5500]/5 transition-all"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5500]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#111] border border-[#FF5500]/20 flex items-center justify-center shrink-0"
              style={{ boxShadow: '0 0 15px rgba(255,85,0,0.15)' }}>
              <Sparkles className="w-6 h-6 text-[#FF5500]" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.5))' }} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-lg text-white mb-1">
                AI <span className="text-[#FF5500]" style={{ textShadow: '0 0 10px rgba(255,85,0,0.3)' }}>AUTO PROGRAMME</span>
              </h3>
              <p className="text-gray-500 text-sm mb-3">
                Build a personalised 12-week cardio plan. Choose your activity, set goals, 
                and let AI generate a progressive training programme.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[Footprints, Zap, Bike].map((Icon, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-[#111] border border-gray-700 flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  ))}
                </div>
                <span className="text-[11px] text-gray-500">Walk • Run • Cycle • Row • Swim</span>
              </div>
            </div>
            
            <ArrowRight className="w-5 h-5 text-[#FF5500] mt-1 shrink-0" />
          </div>
        </button>
      </motion.div>

      {/* Manual Builder */}
      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
        <button
          onClick={() => onSelectMode('manual')}
          className="w-full text-left relative overflow-hidden rounded-xl p-5 
            border border-gray-800 bg-[#111] hover:border-gray-600 
            hover:bg-[#0F0F0F] transition-all"
        >
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#111] border border-gray-700 flex items-center justify-center shrink-0">
              <Edit3 className="w-6 h-6 text-gray-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-lg text-white mb-1">
                MANUAL <span className="text-gray-400">PROGRAMME</span>
              </h3>
              <p className="text-gray-500 text-sm mb-2">
                Build your own programme from scratch. Set weekly sessions, rest days, 
                distances, and interval structures manually.
              </p>
              <span className="text-[11px] text-gray-600">Full control over every session</span>
            </div>
            
            <ArrowRight className="w-5 h-5 text-gray-600 mt-1 shrink-0" />
          </div>
        </button>
      </motion.div>
    </div>
  );
}

/**
 * UserProfileCard — Dual profile cards with 3 view modes:
 *   1. Strength (full-width, orange/fire theme, swipe right → cardio)
 *   2. Cardio (full-width, teal/ice theme, swipe left → strength)
 *   3. Both (side-by-side compact)
 * Each card shows up to 7 tracked exercises.
 */
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import {
  Zap, Camera, Upload, X, Plus, Minus, Edit3, Check, Search,
  Activity, Heart, Columns, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useCoachingProfile, cmToFeetInches } from '@/hooks/useCoachingProfile';
import { useAchievementCards } from '@/hooks/useAchievementCards';
import { useToast } from '@/hooks/use-toast';

/* ═══ Types ═══ */
interface CustomPB {
  exerciseName: string;
  value: number;
  unit: string;
}

interface CardConfig {
  customPBs: CustomPB[];
  customCardioPBs: CustomPB[];
  cardImageUrl?: string;
  viewMode: 'strength' | 'cardio' | 'both';
}

/* ═══ Storage ═══ */
const CARD_CONFIG_KEY = 'ub-profile-card-config';

function loadCardConfig(): CardConfig {
  try {
    const saved = localStorage.getItem(CARD_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        customPBs: parsed.customPBs || [],
        customCardioPBs: parsed.customCardioPBs || [],
        cardImageUrl: parsed.cardImageUrl,
        viewMode: parsed.viewMode || 'strength',
      };
    }
  } catch {}
  return { customPBs: [], customCardioPBs: [], viewMode: 'strength' };
}

function saveCardConfig(config: CardConfig) {
  localStorage.setItem(CARD_CONFIG_KEY, JSON.stringify(config));
}

/* ═══ View mode toggle ═══ */
type ViewMode = 'strength' | 'cardio' | 'both';

/* ═══ Main component ═══ */
export default function UserProfileCard() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { profile: coachingProfile } = useCoachingProfile();
  const { cards, getCounts } = useAchievementCards();
  const { toast } = useToast();

  const [cardConfig, setCardConfig] = useState<CardConfig>(loadCardConfig);
  const [viewMode, setViewMode] = useState<ViewMode>(cardConfig.viewMode);
  const [cardImageUrl, setCardImageUrl] = useState<string | null>(null);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [showStrEditMenu, setShowStrEditMenu] = useState(false);
  const [showCardioEditMenu, setShowCardioEditMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showStrDropdown, setShowStrDropdown] = useState(true);
  const [showCardioDropdown, setShowCardioDropdown] = useState(true);

  // Persist view mode
  const changeViewMode = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    setCardConfig(prev => {
      const next = { ...prev, viewMode: mode };
      saveCardConfig(next);
      return next;
    });
  }, []);

  // Load custom card image
  useEffect(() => {
    if (!user) return;
    const loadImage = async () => {
      const { data } = await supabase.storage
        .from('avatars')
        .createSignedUrl(`${user.id}/card-image`, 3600);
      if (data?.signedUrl) setCardImageUrl(data.signedUrl);
    };
    loadImage();
  }, [user]);

  // Build available exercises from PB cards
  const availableExercises = useMemo(() => {
    const pbCards = cards.filter(c => c.card_type === 'pb_personal' && c.pb_rank === 1);
    return pbCards.map(c => ({
      name: c.exercise_name || 'Unknown',
      value: c.pb_value || 0,
      unit: c.pb_unit || 'kg',
      category: c.activity_category || 'lift',
    })).sort((a, b) => b.value - a.value);
  }, [cards]);

  // Strength PBs (up to 7)
  const strengthPBs = useMemo(() => {
    if (cardConfig.customPBs.length > 0) {
      return cardConfig.customPBs.map(pb => {
        const match = availableExercises.find(e =>
          e.name.toLowerCase() === pb.exerciseName.toLowerCase()
        );
        return {
          exerciseName: pb.exerciseName,
          value: match ? match.value : pb.value,
          unit: match ? match.unit : pb.unit,
        };
      }).slice(0, 7);
    }

    const sbd = ['squat', 'bench', 'deadlift'];
    const sbdPBs: CustomPB[] = [];
    const otherPBs: CustomPB[] = [];

    if (coachingProfile?.squat_max_kg) {
      const card = availableExercises.find(e => e.name.toLowerCase().includes('squat'));
      sbdPBs.push({ exerciseName: card?.name || 'Squat', value: Math.max(coachingProfile.squat_max_kg, card?.value || 0), unit: 'kg' });
    }
    if (coachingProfile?.bench_max_kg) {
      const card = availableExercises.find(e => e.name.toLowerCase().includes('bench'));
      sbdPBs.push({ exerciseName: card?.name || 'Bench Press', value: Math.max(coachingProfile.bench_max_kg, card?.value || 0), unit: 'kg' });
    }
    if (coachingProfile?.deadlift_max_kg) {
      const card = availableExercises.find(e => e.name.toLowerCase().includes('deadlift') || e.name.toLowerCase().includes('sumo'));
      sbdPBs.push({ exerciseName: card?.name || 'Deadlift', value: Math.max(coachingProfile.deadlift_max_kg, card?.value || 0), unit: 'kg' });
    }

    for (const ex of availableExercises) {
      const n = ex.name.toLowerCase();
      if (ex.category !== 'lift') continue;
      if (sbd.some(s => n.includes(s)) || n.includes('sumo')) {
        if (!sbdPBs.find(p => p.exerciseName.toLowerCase() === n)) {
          sbdPBs.push({ exerciseName: ex.name, value: ex.value, unit: ex.unit });
        }
      } else {
        otherPBs.push({ exerciseName: ex.name, value: ex.value, unit: ex.unit });
      }
    }

    return [...sbdPBs.slice(0, 3), ...otherPBs.slice(0, 4)].slice(0, 7);
  }, [cardConfig.customPBs, availableExercises, coachingProfile]);

  // Cardio PBs (up to 7)
  const cardioPBs = useMemo(() => {
    if (cardConfig.customCardioPBs.length > 0) {
      return cardConfig.customCardioPBs.slice(0, 7);
    }
    const cardioCards = cards.filter(c =>
      c.card_type === 'pb_personal' &&
      c.pb_rank === 1 &&
      ['run', 'cycle', 'row', 'swim'].includes(c.activity_category || '')
    );
    return cardioCards.map(c => ({
      exerciseName: c.exercise_name || 'Run',
      value: c.pb_value || 0,
      unit: c.pb_unit || c.record_unit || 'seconds',
    })).sort((a, b) => a.exerciseName.localeCompare(b.exerciseName)).slice(0, 7);
  }, [cardConfig.customCardioPBs, cards]);

  const allStrengthExercises = useMemo(() =>
    availableExercises.filter(e => e.category === 'lift').map(e => ({
      exerciseName: e.name, value: e.value, unit: e.unit,
    })),
  [availableExercises]);

  const allCardioExercises = useMemo(() =>
    availableExercises.filter(e => ['run', 'cycle', 'row', 'swim'].includes(e.category)).map(e => ({
      exerciseName: e.name, value: e.value, unit: e.unit,
    })),
  [availableExercises]);

  // Body stats
  const weight = coachingProfile?.weight_kg;
  const heightCm = coachingProfile?.height_cm;
  const heightUnit = coachingProfile?.preferred_height_unit || 'cm';
  const weightUnit = coachingProfile?.preferred_weight_unit || 'kg';

  const heightDisplay = heightCm
    ? heightUnit === 'ft_in'
      ? (() => { const { feet, inches } = cmToFeetInches(heightCm); return `${feet}'${inches}"`; })()
      : `${heightCm}cm`
    : null;

  const weightDisplay = weight
    ? weightUnit === 'lb' ? `${Math.round(weight * 2.205)}lbs` : `${weight}kg`
    : null;

  const dob = profile?.date_of_birth;
  const ageDisplay = coachingProfile?.age_years || (dob ? Math.floor((Date.now() - new Date(dob).getTime()) / 31557600000) : null);

  const strCount = cards.filter(c => c.activity_category === 'lift').length;
  const cardioCount = cards.filter(c => ['run', 'cycle', 'row', 'swim'].includes(c.activity_category || '')).length;
  const totalCards = getCounts().total;

  const sbdTotal = strengthPBs
    .filter(pb => {
      const n = pb.exerciseName.toLowerCase();
      return n.includes('squat') || n.includes('bench') || n.includes('deadlift') || n.includes('sumo');
    })
    .reduce((sum, pb) => sum + pb.value, 0);

  // Image handlers
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) { toast({ title: 'Invalid file', description: 'Please select an image.' }); return; }
    if (file.size > 5 * 1024 * 1024) { toast({ title: 'File too large', description: 'Max 5MB.' }); return; }
    setUploading(true);
    try {
      const path = `${user.id}/card-image`;
      const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = await supabase.storage.from('avatars').createSignedUrl(path, 3600);
      if (data?.signedUrl) { setCardImageUrl(data.signedUrl); toast({ title: 'Card image updated!' }); }
    } catch { toast({ title: 'Upload failed' }); }
    finally { setUploading(false); setShowImageMenu(false); }
  };

  const removeCardImage = async () => {
    if (!user) return;
    await supabase.storage.from('avatars').remove([`${user.id}/card-image`]);
    setCardImageUrl(null);
    setShowImageMenu(false);
    toast({ title: 'Card image removed' });
  };

  // PB edit handlers
  const addStrPB = useCallback((name: string, val: number, unit: string) => {
    setCardConfig(prev => {
      if (prev.customPBs.length >= 7) return prev;
      if (prev.customPBs.find(p => p.exerciseName === name)) return prev;
      const next = { ...prev, customPBs: [...prev.customPBs, { exerciseName: name, value: val, unit }] };
      saveCardConfig(next);
      return next;
    });
  }, []);

  const removeStrPB = useCallback((name: string) => {
    setCardConfig(prev => {
      const next = { ...prev, customPBs: prev.customPBs.filter(p => p.exerciseName !== name) };
      saveCardConfig(next);
      return next;
    });
  }, []);

  const resetStrPBs = useCallback(() => {
    setCardConfig(prev => { const next = { ...prev, customPBs: [] }; saveCardConfig(next); return next; });
  }, []);

  const addCardioPB = useCallback((name: string, val: number, unit: string) => {
    setCardConfig(prev => {
      if (prev.customCardioPBs.length >= 7) return prev;
      if (prev.customCardioPBs.find(p => p.exerciseName === name)) return prev;
      const next = { ...prev, customCardioPBs: [...prev.customCardioPBs, { exerciseName: name, value: val, unit }] };
      saveCardConfig(next);
      return next;
    });
  }, []);

  const removeCardioPB = useCallback((name: string) => {
    setCardConfig(prev => {
      const next = { ...prev, customCardioPBs: prev.customCardioPBs.filter(p => p.exerciseName !== name) };
      saveCardConfig(next);
      return next;
    });
  }, []);

  const resetCardioPBs = useCallback(() => {
    setCardConfig(prev => { const next = { ...prev, customCardioPBs: [] }; saveCardConfig(next); return next; });
  }, []);

  // Swipe handler — left/right between strength ↔ cardio in single view
  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const threshold = 50;
    if (viewMode === 'strength' && info.offset.x < -threshold) {
      changeViewMode('cardio');
    } else if (viewMode === 'cardio' && info.offset.x > threshold) {
      changeViewMode('strength');
    }
  }, [viewMode, changeViewMode]);

  if (!user || !profile) return null;

  const displayName = profile.display_name || profile.username || 'TRAINER';

  // Shared data for card panels
  const sharedProps = {
    displayName,
    cardImageUrl,
    profile,
    ageDisplay,
    heightDisplay,
    weightDisplay,
    user,
  };

  return (
    <div className="relative">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

      {/* ═══ VIEW MODE TOGGLE ═══ */}
      <div className="flex items-center justify-center gap-1 mb-2">
        <button
          onClick={() => changeViewMode('strength')}
          className={`px-2.5 py-1 rounded-lg text-[8px] font-display tracking-[0.12em] uppercase transition-all ${
            viewMode === 'strength'
              ? 'bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30'
              : 'bg-white/[0.02] text-white/30 border border-white/5 hover:bg-white/[0.04]'
          }`}
        >
          <Zap className="w-2.5 h-2.5 inline mr-0.5" />STRENGTH
        </button>
        <button
          onClick={() => changeViewMode('both')}
          className={`px-2.5 py-1 rounded-lg text-[8px] font-display tracking-[0.12em] uppercase transition-all ${
            viewMode === 'both'
              ? 'bg-white/10 text-white/80 border border-white/20'
              : 'bg-white/[0.02] text-white/30 border border-white/5 hover:bg-white/[0.04]'
          }`}
        >
          <Columns className="w-2.5 h-2.5 inline mr-0.5" />BOTH
        </button>
        <button
          onClick={() => changeViewMode('cardio')}
          className={`px-2.5 py-1 rounded-lg text-[8px] font-display tracking-[0.12em] uppercase transition-all ${
            viewMode === 'cardio'
              ? 'bg-[#00CCFF]/15 text-[#00CCFF] border border-[#00CCFF]/30'
              : 'bg-white/[0.02] text-white/30 border border-white/5 hover:bg-white/[0.04]'
          }`}
        >
          <Activity className="w-2.5 h-2.5 inline mr-0.5" />CARDIO
        </button>
      </div>

      {/* ═══ CARD DISPLAY ═══ */}
      <AnimatePresence mode="wait">
        {viewMode === 'both' ? (
          /* ═══ BOTH — side by side ═══ */
          <motion.div
            key="both"
            className="grid grid-cols-2 gap-2"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25 }}
          >
            <StrengthCardPanel
              {...sharedProps}
              compact
              strCount={strCount}
              strengthPBs={strengthPBs}
              sbdTotal={sbdTotal}
              totalCards={totalCards}
              showStrDropdown={showStrDropdown}
              setShowStrDropdown={setShowStrDropdown}
              onEditPBs={() => setShowStrEditMenu(true)}
              onImageMenu={() => setShowImageMenu(!showImageMenu)}
            />
            <CardioCardPanel
              {...sharedProps}
              compact
              cardioCount={cardioCount}
              cardioPBs={cardioPBs}
              showCardioDropdown={showCardioDropdown}
              setShowCardioDropdown={setShowCardioDropdown}
              onEditPBs={() => setShowCardioEditMenu(true)}
            />
          </motion.div>
        ) : viewMode === 'strength' ? (
          /* ═══ STRENGTH — full width, swipeable → cardio ═══ */
          <motion.div
            key="strength"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="cursor-grab active:cursor-grabbing"
          >
            <StrengthCardPanel
              {...sharedProps}
              compact={false}
              strCount={strCount}
              strengthPBs={strengthPBs}
              sbdTotal={sbdTotal}
              totalCards={totalCards}
              showStrDropdown={showStrDropdown}
              setShowStrDropdown={setShowStrDropdown}
              onEditPBs={() => setShowStrEditMenu(true)}
              onImageMenu={() => setShowImageMenu(!showImageMenu)}
            />
            {/* Swipe hint */}
            <div className="flex items-center justify-center gap-1 mt-1.5 opacity-30">
              <span className="text-[7px] font-mono text-white/50 tracking-wider">SWIPE FOR CARDIO</span>
              <ChevronRight className="w-3 h-3 text-[#00CCFF]" />
            </div>
          </motion.div>
        ) : (
          /* ═══ CARDIO — full width, swipeable → strength ═══ */
          <motion.div
            key="cardio"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.25 }}
            className="cursor-grab active:cursor-grabbing"
          >
            <CardioCardPanel
              {...sharedProps}
              compact={false}
              cardioCount={cardioCount}
              cardioPBs={cardioPBs}
              showCardioDropdown={showCardioDropdown}
              setShowCardioDropdown={setShowCardioDropdown}
              onEditPBs={() => setShowCardioEditMenu(true)}
            />
            {/* Swipe hint */}
            <div className="flex items-center justify-center gap-1 mt-1.5 opacity-30">
              <ChevronLeft className="w-3 h-3 text-[#FF5500]" />
              <span className="text-[7px] font-mono text-white/50 tracking-wider">SWIPE FOR STRENGTH</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page dots indicator */}
      {viewMode !== 'both' && (
        <div className="flex items-center justify-center gap-1.5 mt-1">
          <div className={`rounded-full transition-all ${viewMode === 'strength' ? 'w-4 h-1 bg-[#FF5500]' : 'w-1 h-1 bg-white/20'}`} />
          <div className={`rounded-full transition-all ${viewMode === 'cardio' ? 'w-4 h-1 bg-[#00CCFF]' : 'w-1 h-1 bg-white/20'}`} />
        </div>
      )}

      {/* Total cards count */}
      <div className="flex items-center justify-center mt-1">
        <span className="text-[7px] font-mono text-white/20 tracking-wider">{totalCards} EXERCISES TRACKED</span>
      </div>

      {/* Image menu */}
      <AnimatePresence>
        {showImageMenu && (
          <motion.div className="absolute top-16 right-4 bg-black/90 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden z-30"
            initial={{ opacity: 0, y: -5, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.95 }}>
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 w-full text-left">
              <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload card image'}
            </button>
            {cardImageUrl && (
              <button onClick={removeCardImage}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-400/80 hover:bg-white/5 w-full text-left border-t border-white/5">
                <X className="w-4 h-4" /> Remove image
              </button>
            )}
            <button onClick={() => setShowImageMenu(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/40 hover:bg-white/5 w-full text-left border-t border-white/5">
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit menus */}
      <AnimatePresence>
        {showStrEditMenu && (
          <PBEditMenu title="Strength PBs" accentColor="#FF5500" maxItems={7}
            customPBs={cardConfig.customPBs} availableExercises={allStrengthExercises}
            onAdd={addStrPB} onRemove={removeStrPB} onReset={resetStrPBs} onClose={() => setShowStrEditMenu(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showCardioEditMenu && (
          <PBEditMenu title="Cardio PBs" accentColor="#00CCFF" maxItems={7}
            customPBs={cardConfig.customCardioPBs} availableExercises={allCardioExercises}
            onAdd={addCardioPB} onRemove={removeCardioPB} onReset={resetCardioPBs} onClose={() => setShowCardioEditMenu(false)} />
        )}
      </AnimatePresence>

      {/* Shimmer keyframes */}
      <style>{`
        @keyframes strShimmer {
          0%, 100% { transform: translateX(-200%); }
          50% { transform: translateX(calc(100vw + 200%)); }
        }
        @keyframes cardioShimmer {
          0%, 100% { transform: translateX(calc(100vw + 200%)); }
          50% { transform: translateX(-200%); }
        }
      `}</style>
    </div>
  );
}


/* ═══════════════════════════════════════════════
   STRENGTH CARD PANEL
   ═══════════════════════════════════════════════ */
interface SharedCardProps {
  displayName: string;
  cardImageUrl: string | null;
  profile: any;
  ageDisplay: number | null;
  heightDisplay: string | null;
  weightDisplay: string | null;
  user: any;
}

interface StrengthPanelProps extends SharedCardProps {
  compact: boolean;
  strCount: number;
  strengthPBs: CustomPB[];
  sbdTotal: number;
  totalCards: number;
  showStrDropdown: boolean;
  setShowStrDropdown: (v: boolean) => void;
  onEditPBs: () => void;
  onImageMenu: () => void;
}

function StrengthCardPanel({
  compact, displayName, cardImageUrl, profile, ageDisplay, heightDisplay, weightDisplay,
  user, strCount, strengthPBs, sbdTotal, totalCards, showStrDropdown, setShowStrDropdown,
  onEditPBs, onImageMenu,
}: StrengthPanelProps) {
  const heroH = compact ? 70 : 100;

  return (
    <div
      className="relative overflow-hidden rounded-xl"
      style={{
        border: '2px solid rgba(255,85,0,0.5)',
        boxShadow: '0 0 20px rgba(255,85,0,0.15), 0 0 40px rgba(255,85,0,0.06), inset 0 0 20px rgba(0,0,0,0.5)',
      }}
    >
      {/* BG */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #080200 0%, #0A0400 40%, #050505 100%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 20%, rgba(255,85,0,0.08) 0%, transparent 60%)' }} />
      {/* Shimmer */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.15, zIndex: 1 }}>
        <div className="absolute -inset-y-4 w-20" style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,85,0,0.25) 40%, rgba(255,255,255,0.15) 50%, rgba(255,85,0,0.25) 60%, transparent)',
          animation: 'strShimmer 4s ease-in-out infinite',
        }} />
      </div>
      {/* Sparkle particles */}
      {!compact && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[2]">
          {[...Array(6)].map((_, i) => (
            <motion.div key={i} className="absolute w-[2px] h-[2px] rounded-full bg-[#FF5500]"
              style={{ left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 25}%`, opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0], scale: [0.5, 1.5, 0.5] }}
              transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className={`relative z-10 ${compact ? 'p-2.5' : 'p-3.5'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1">
            <Zap className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-[#FF5500]`} />
            <span className={`${compact ? 'text-[8px]' : 'text-[9px]'} font-display tracking-[0.15em] uppercase font-bold`}
              style={{ color: '#FF5500', textShadow: '0 0 8px rgba(255,85,0,0.5)' }}>
              STRENGTH
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[7px] font-mono text-white/30">{strCount} cards</span>
          </div>
        </div>

        {/* Hero image */}
        <div className="relative rounded-lg overflow-hidden mb-2" style={{ height: heroH }}>
          {cardImageUrl ? (
            <img src={cardImageUrl} alt="Card" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: 'center 20%' }} />
          ) : profile.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: 'center 20%' }} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-orange-500/5 to-transparent">
              <span className="text-3xl font-display text-primary opacity-40">{displayName[0]?.toUpperCase()}</span>
            </div>
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(5,5,5,0.9) 100%)' }} />
          {/* Camera */}
          <button onClick={onImageMenu}
            className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center border border-white/10 z-10">
            <Camera className="w-2.5 h-2.5 text-white/50" />
          </button>
          {/* Card count badge */}
          {!compact && (
            <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm border border-[#FF5500]/20">
              <Zap className="w-2 h-2 text-[#FF5500]" />
              <span className="text-[7px] font-mono text-[#FF5500] font-bold">{totalCards} CARDS</span>
            </div>
          )}
          {/* Name overlay */}
          <div className="absolute bottom-1.5 left-2">
            <p className={`${compact ? 'text-[10px]' : 'text-[13px]'} font-display tracking-wider uppercase text-white font-bold`}
              style={{ textShadow: '0 0 10px rgba(255,85,0,0.4)' }}>
              {displayName}
            </p>
            {!compact && profile.username && (
              <p className="text-[8px] font-mono tracking-wider uppercase" style={{ color: '#FF5500' }}>
                @{profile.username}
              </p>
            )}
          </div>
        </div>

        {/* Bio stats */}
        {(ageDisplay || heightDisplay || weightDisplay) && (
          <div className={`flex items-center gap-3 mb-2 ${compact ? '' : 'px-1'}`}>
            {ageDisplay && (
              <span className={`${compact ? 'text-[7px]' : 'text-[8px]'} font-mono text-white/60`}>
                <span style={{ color: 'rgba(255,85,0,0.5)', fontSize: compact ? 6 : 7 }}>AGE </span>
                <span className="font-bold text-white">{ageDisplay}</span>
              </span>
            )}
            {heightDisplay && (
              <span className={`${compact ? 'text-[7px]' : 'text-[8px]'} font-mono text-white/60`}>
                <span style={{ color: 'rgba(255,85,0,0.5)', fontSize: compact ? 6 : 7 }}>HT </span>
                <span className="font-bold text-white">{heightDisplay}</span>
              </span>
            )}
            {weightDisplay && (
              <span className={`${compact ? 'text-[7px]' : 'text-[8px]'} font-mono text-white/60`}>
                <span style={{ color: 'rgba(255,85,0,0.5)', fontSize: compact ? 6 : 7 }}>WT </span>
                <span className="font-bold text-white">{weightDisplay}</span>
              </span>
            )}
          </div>
        )}

        {/* Strength PBs */}
        <div className="rounded-lg overflow-hidden" style={{ background: 'rgba(255,85,0,0.04)', border: '1px solid rgba(255,85,0,0.12)' }}>
          <button onClick={() => setShowStrDropdown(!showStrDropdown)}
            className="w-full flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-1">
              <Zap className="w-2.5 h-2.5" style={{ color: '#FF5500' }} />
              <span className={`${compact ? 'text-[6px]' : 'text-[7px]'} font-mono tracking-[0.15em] uppercase`}
                style={{ color: '#FF5500' }}>STRENGTH PBs ({strengthPBs.length})</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={(e) => { e.stopPropagation(); onEditPBs(); }}
                className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center">
                <Edit3 className="w-2 h-2 text-white/40" />
              </button>
              <motion.span animate={{ rotate: showStrDropdown ? 180 : 0 }}
                className="text-[7px]" style={{ color: '#FF5500' }}>▼</motion.span>
            </div>
          </button>

          <AnimatePresence initial={false}>
            {showStrDropdown && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className={`px-2 pb-1.5 ${compact ? 'space-y-[2px]' : 'space-y-[3px]'}`}>
                  {strengthPBs.length > 0 ? strengthPBs.map((pb, i) => (
                    <StatBar key={pb.exerciseName} label={pb.exerciseName} value={pb.value} unit={pb.unit}
                      maxValue={getMaxForExercise(pb.exerciseName, pb.unit)} color="#FF5500" delay={i * 0.04}
                      compact={compact} />
                  )) : (
                    <p className="text-[8px] text-white/20 font-mono text-center py-2">No strength PBs yet</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SBD Total */}
        {sbdTotal > 0 && (
          <div className="flex items-center justify-between mt-2 pt-1.5" style={{ borderTop: '1px solid rgba(255,85,0,0.08)' }}>
            <span className={`${compact ? 'text-[7px]' : 'text-[8px]'} font-mono tracking-wider`} style={{ color: '#FF5500' }}>SBD TOTAL</span>
            <span className={`${compact ? 'text-xs' : 'text-sm'} font-display font-black tracking-wider`}
              style={{ color: '#FF5500', textShadow: '0 0 12px rgba(255,85,0,0.5)' }}>
              {sbdTotal}KG
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-1.5 pt-1" style={{ borderTop: '1px solid rgba(255,85,0,0.06)' }}>
          <span className="text-[5px] font-mono tracking-wider uppercase" style={{ color: 'rgba(255,85,0,0.35)' }}>
            UNBREAKABLE · EST 2026
          </span>
          <span className="text-[5px] font-mono" style={{ color: 'rgba(255,85,0,0.2)' }}>
            #{user.id.slice(0, 6).toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════
   CARDIO CARD PANEL
   ═══════════════════════════════════════════════ */
interface CardioPanelProps extends SharedCardProps {
  compact: boolean;
  cardioCount: number;
  cardioPBs: CustomPB[];
  showCardioDropdown: boolean;
  setShowCardioDropdown: (v: boolean) => void;
  onEditPBs: () => void;
}

function CardioCardPanel({
  compact, displayName, cardImageUrl, profile, ageDisplay, heightDisplay, weightDisplay,
  user, cardioCount, cardioPBs, showCardioDropdown, setShowCardioDropdown, onEditPBs,
}: CardioPanelProps) {
  const heroH = compact ? 70 : 100;

  return (
    <div
      className="relative overflow-hidden rounded-xl"
      style={{
        border: '2px solid rgba(0,204,255,0.4)',
        boxShadow: '0 0 20px rgba(0,204,255,0.12), 0 0 40px rgba(0,204,255,0.05), inset 0 0 20px rgba(0,0,0,0.5)',
      }}
    >
      {/* BG — dark with teal neon */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #000508 0%, #000A0F 40%, #050505 100%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 20%, rgba(0,204,255,0.06) 0%, transparent 60%)' }} />
      {/* Shimmer — opposite direction */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.15, zIndex: 1 }}>
        <div className="absolute -inset-y-4 w-20" style={{
          background: 'linear-gradient(90deg, transparent, rgba(0,204,255,0.25) 40%, rgba(255,255,255,0.12) 50%, rgba(0,204,255,0.25) 60%, transparent)',
          animation: 'cardioShimmer 4.5s ease-in-out infinite',
        }} />
      </div>
      {/* Sparkle particles */}
      {!compact && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[2]">
          {[...Array(6)].map((_, i) => (
            <motion.div key={i} className="absolute w-[2px] h-[2px] rounded-full bg-[#00CCFF]"
              style={{ left: `${10 + i * 15}%`, top: `${25 + (i % 3) * 22}%`, opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0], scale: [0.5, 1.5, 0.5] }}
              transition={{ duration: 2.2 + i * 0.3, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className={`relative z-10 ${compact ? 'p-2.5' : 'p-3.5'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1">
            <Activity className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-[#00CCFF]`} />
            <span className={`${compact ? 'text-[8px]' : 'text-[9px]'} font-display tracking-[0.15em] uppercase font-bold`}
              style={{ color: '#00CCFF', textShadow: '0 0 8px rgba(0,204,255,0.5)' }}>
              CARDIO
            </span>
          </div>
          <span className="text-[7px] font-mono text-white/30">{cardioCount} cards</span>
        </div>

        {/* Hero image */}
        <div className="relative rounded-lg overflow-hidden mb-2" style={{ height: heroH }}>
          {cardImageUrl ? (
            <img src={cardImageUrl} alt="Card" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: 'center 20%' }} />
          ) : profile.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: 'center 20%' }} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-cyan-500/5 to-transparent">
              <span className="text-3xl font-display text-[#00CCFF] opacity-40">{displayName[0]?.toUpperCase()}</span>
            </div>
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(5,5,5,0.9) 100%)' }} />
          {/* Name overlay */}
          <div className="absolute bottom-1.5 left-2">
            <p className={`${compact ? 'text-[10px]' : 'text-[13px]'} font-display tracking-wider uppercase text-white font-bold`}
              style={{ textShadow: '0 0 10px rgba(0,204,255,0.4)' }}>
              {displayName}
            </p>
            {!compact && profile.username && (
              <p className="text-[8px] font-mono tracking-wider uppercase" style={{ color: '#00CCFF' }}>
                @{profile.username}
              </p>
            )}
          </div>
        </div>

        {/* Bio stats */}
        {(ageDisplay || heightDisplay || weightDisplay) && (
          <div className={`flex items-center gap-3 mb-2 ${compact ? '' : 'px-1'}`}>
            {ageDisplay && (
              <span className={`${compact ? 'text-[7px]' : 'text-[8px]'} font-mono text-white/60`}>
                <span style={{ color: 'rgba(0,204,255,0.5)', fontSize: compact ? 6 : 7 }}>AGE </span>
                <span className="font-bold text-white">{ageDisplay}</span>
              </span>
            )}
            {heightDisplay && (
              <span className={`${compact ? 'text-[7px]' : 'text-[8px]'} font-mono text-white/60`}>
                <span style={{ color: 'rgba(0,204,255,0.5)', fontSize: compact ? 6 : 7 }}>HT </span>
                <span className="font-bold text-white">{heightDisplay}</span>
              </span>
            )}
            {weightDisplay && (
              <span className={`${compact ? 'text-[7px]' : 'text-[8px]'} font-mono text-white/60`}>
                <span style={{ color: 'rgba(0,204,255,0.5)', fontSize: compact ? 6 : 7 }}>WT </span>
                <span className="font-bold text-white">{weightDisplay}</span>
              </span>
            )}
          </div>
        )}

        {/* Cardio PBs */}
        <div className="rounded-lg overflow-hidden" style={{ background: 'rgba(0,204,255,0.04)', border: '1px solid rgba(0,204,255,0.12)' }}>
          <button onClick={() => setShowCardioDropdown(!showCardioDropdown)}
            className="w-full flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-1">
              <Heart className="w-2.5 h-2.5" style={{ color: '#00CCFF' }} />
              <span className={`${compact ? 'text-[6px]' : 'text-[7px]'} font-mono tracking-[0.15em] uppercase`}
                style={{ color: '#00CCFF' }}>CARDIO PBs ({cardioPBs.length})</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={(e) => { e.stopPropagation(); onEditPBs(); }}
                className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center">
                <Edit3 className="w-2 h-2 text-white/40" />
              </button>
              <motion.span animate={{ rotate: showCardioDropdown ? 180 : 0 }}
                className="text-[7px]" style={{ color: '#00CCFF' }}>▼</motion.span>
            </div>
          </button>

          <AnimatePresence initial={false}>
            {showCardioDropdown && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className={`px-2 pb-1.5 ${compact ? 'space-y-[2px]' : 'space-y-[3px]'}`}>
                  {cardioPBs.length > 0 ? cardioPBs.map((pb, i) => (
                    <StatBar key={pb.exerciseName} label={pb.exerciseName} value={pb.value} unit={pb.unit}
                      maxValue={getMaxForExercise(pb.exerciseName, pb.unit)} color="#00CCFF" delay={i * 0.04}
                      compact={compact} />
                  )) : (
                    <p className="text-[8px] text-white/20 font-mono text-center py-2">No cardio PBs yet — log a 5K!</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Events count */}
        {cardioPBs.length > 0 && (
          <div className="flex items-center justify-between mt-2 pt-1.5" style={{ borderTop: '1px solid rgba(0,204,255,0.08)' }}>
            <span className={`${compact ? 'text-[7px]' : 'text-[8px]'} font-mono tracking-wider`} style={{ color: '#00CCFF' }}>EVENTS</span>
            <span className={`${compact ? 'text-xs' : 'text-sm'} font-display font-black tracking-wider`}
              style={{ color: '#00CCFF', textShadow: '0 0 12px rgba(0,204,255,0.5)' }}>
              {cardioPBs.length}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-1.5 pt-1" style={{ borderTop: '1px solid rgba(0,204,255,0.06)' }}>
          <span className="text-[5px] font-mono tracking-wider uppercase" style={{ color: 'rgba(0,204,255,0.35)' }}>
            LIVE WITHOUT LIMITS™
          </span>
          <span className="text-[5px] font-mono" style={{ color: 'rgba(0,204,255,0.2)' }}>
            #{user.id.slice(0, 6).toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════
   PB EDIT MENU
   ═══════════════════════════════════════════════ */
function PBEditMenu({
  title, accentColor, maxItems, customPBs, availableExercises,
  onAdd, onRemove, onReset, onClose,
}: {
  title: string;
  accentColor: string;
  maxItems: number;
  customPBs: CustomPB[];
  availableExercises: { exerciseName: string; value: number; unit: string }[];
  onAdd: (name: string, value: number, unit: string) => void;
  onRemove: (name: string) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualValue, setManualValue] = useState('');
  const [manualUnit, setManualUnit] = useState('kg');
  const [showManual, setShowManual] = useState(false);

  const filtered = search
    ? availableExercises.filter(e =>
        e.exerciseName.toLowerCase().includes(search.toLowerCase()) &&
        !customPBs.find(p => p.exerciseName === e.exerciseName)
      )
    : availableExercises.filter(e => !customPBs.find(p => p.exerciseName === e.exerciseName));

  const handleManualAdd = () => {
    if (!manualName.trim() || !manualValue) return;
    onAdd(manualName.trim(), parseFloat(manualValue), manualUnit);
    setManualName('');
    setManualValue('');
    setShowManual(false);
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative w-full max-w-md bg-background rounded-t-2xl border-t border-border flex flex-col"
        style={{ maxHeight: '85vh' }}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <h3 className="font-display tracking-wider text-sm uppercase" style={{ color: accentColor }}>
            {title} ({customPBs.length}/{maxItems})
          </h3>
          <div className="flex items-center gap-2">
            {customPBs.length > 0 && (
              <button onClick={onReset} className="text-[10px] text-muted-foreground hover:text-foreground font-display tracking-wider uppercase">
                RESET
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 min-h-0">
          {/* Current selections */}
          {customPBs.length > 0 && (
            <div className="px-4 py-3 border-b border-border">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Selected ({customPBs.length}/{maxItems})
              </p>
              <div className="space-y-1">
                {customPBs.map(pb => (
                  <div key={pb.exerciseName} className="flex items-center justify-between p-2 rounded-lg border"
                    style={{ background: `${accentColor}08`, borderColor: `${accentColor}20` }}>
                    <div>
                      <p className="text-[12px] font-semibold text-foreground">{pb.exerciseName}</p>
                      <p className="text-[10px]" style={{ color: accentColor }}>{pb.value}{pb.unit}</p>
                    </div>
                    <button onClick={() => onRemove(pb.exerciseName)}
                      className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center hover:bg-red-500/20">
                      <Minus className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <div className="px-4 pt-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search exercises..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
            </div>
          </div>

          {/* Available */}
          <div className="px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">From your PB cards</p>
            <div className="space-y-1">
              {filtered.map(ex => (
                <button key={ex.exerciseName}
                  onClick={() => onAdd(ex.exerciseName, ex.value, ex.unit)}
                  disabled={customPBs.length >= maxItems}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-30">
                  <div className="text-left">
                    <p className="text-[12px] font-semibold text-foreground">{ex.exerciseName}</p>
                    <p className="text-[10px]" style={{ color: accentColor }}>{formatStatValue(ex.value, ex.unit)}</p>
                  </div>
                  <Plus className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-[11px] text-muted-foreground text-center py-4">
                  {search ? 'No matching exercises' : 'All exercises added'}
                </p>
              )}
            </div>
          </div>

          {/* Manual add */}
          <div className="px-4 pb-4">
            {!showManual ? (
              <button onClick={() => setShowManual(true)}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border border-dashed border-white/10 text-muted-foreground hover:bg-white/[0.02] transition-colors">
                <Plus className="w-4 h-4" />
                <span className="text-[12px] font-semibold">Add custom exercise</span>
              </button>
            ) : (
              <div className="space-y-2 p-3 rounded-lg border border-border bg-card">
                <input type="text" placeholder="Exercise name" value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white/[0.03] rounded-lg border border-white/10 text-foreground outline-none" />
                <div className="flex gap-2">
                  <input type="number" placeholder="Value" value={manualValue}
                    onChange={(e) => setManualValue(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm bg-white/[0.03] rounded-lg border border-white/10 text-foreground outline-none" />
                  <select value={manualUnit} onChange={(e) => setManualUnit(e.target.value)}
                    className="px-3 py-2 text-sm bg-white/[0.03] rounded-lg border border-white/10 text-foreground outline-none">
                    <option value="kg">KG</option>
                    <option value="reps">Reps</option>
                    <option value="seconds">Time</option>
                    <option value="km">KM</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleManualAdd}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: accentColor }}>
                    <Check className="w-4 h-4 inline mr-1" /> Add
                  </button>
                  <button onClick={() => setShowManual(false)}
                    className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-white/5">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}


/* ═══════════════════════════════════════════════
   STAT BAR
   ═══════════════════════════════════════════════ */
function StatBar({ label, value, unit, maxValue, color, delay = 0, compact = false }: {
  label: string;
  value: number | null;
  unit: string;
  maxValue: number;
  color: string;
  delay?: number;
  compact?: boolean;
}) {
  const fillWidth = value ? Math.min(100, Math.max(8, (value / maxValue) * 100)) : 0;

  return (
    <div className="flex items-center gap-1">
      <span className={`${compact ? 'text-[5.5px] w-10' : 'text-[6.5px] w-16'} font-mono tracking-wider truncate font-bold shrink-0`}
        style={{ color: 'rgba(255,255,255,0.7)' }}>{label.toUpperCase()}</span>
      <div className={`flex-1 ${compact ? 'h-[3px]' : 'h-[5px]'} rounded-full overflow-hidden`} style={{ background: `${color}15` }}>
        {value ? (
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${fillWidth}%` }}
            transition={{ duration: 0.8, delay, ease: 'easeOut' }}
            style={{
              background: `linear-gradient(90deg, ${color}70, ${color})`,
              boxShadow: `0 0 6px ${color}30`,
            }}
          />
        ) : null}
      </div>
      <span className={`${compact ? 'text-[6px] w-8' : 'text-[8px] w-14'} font-display tracking-wide text-right font-bold shrink-0`}
        style={{
          color: value ? '#FFFFFF' : 'rgba(255,255,255,0.15)',
          textShadow: value ? '0 0 4px rgba(255,255,255,0.2)' : 'none',
        }}>
        {value ? formatStatValue(value, unit) : '—'}
      </span>
    </div>
  );
}


/* ═══════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════ */
function formatStatValue(value: number, unit: string): string {
  if (unit === 'seconds') {
    const hours = Math.floor(value / 3600);
    const mins = Math.floor((value % 3600) / 60);
    const secs = Math.round(value % 60);
    if (hours > 0) return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }
  if (unit === 'pace_per_km') {
    const mins = Math.floor(value / 60);
    const secs = Math.round(value % 60);
    return `${mins}:${String(secs).padStart(2, '0')}/km`;
  }
  if (unit === 'kg') return `${value}KG`;
  if (unit === 'reps') return `×${value}`;
  if (unit === 'km') return `${value}KM`;
  if (unit === 'm') return `${value}M`;
  return `${value}${unit.toUpperCase()}`;
}

function getMaxForExercise(name: string, unit: string): number {
  if (unit === 'seconds') {
    const n = name.toLowerCase();
    if (n.includes('5k') || n.includes('5 k')) return 30 * 60;
    if (n.includes('10k') || n.includes('10 k')) return 60 * 60;
    if (n.includes('half') || n.includes('21k')) return 120 * 60;
    if (n.includes('marathon') || n.includes('42k')) return 300 * 60;
    if (n.includes('1k') || n.includes('1 k') || n.includes('mile')) return 10 * 60;
    return 60 * 60;
  }
  if (unit === 'pace_per_km') return 600;
  if (unit === 'km') return 42;
  if (unit === 'mi') return 26;
  if (unit === 'min') return 120;
  if (unit === 'reps') {
    const n = name.toLowerCase();
    if (n.includes('pull') || n.includes('chin')) return 30;
    if (n.includes('dip')) return 60;
    if (n.includes('push') || n.includes('press up')) return 60;
    return 50;
  }
  const n = name.toLowerCase();
  if (n.includes('deadlift') || n.includes('sumo')) return 350;
  if (n.includes('squat')) return 300;
  if (n.includes('bench')) return 200;
  if (n.includes('leg press')) return 400;
  if (n.includes('row')) return 150;
  if (n.includes('curl')) return 80;
  if (n.includes('shoulder') || n.includes('ohp') || n.includes('overhead')) return 120;
  return 200;
}

/**
 * UserProfileCard — Pokémon Trainer-style main profile card
 * Shows: profile pic / custom image, up to 5 user-chosen exercise PBs,
 * top cardio stat, bodyweight/height/age from coaching profile.
 * Users can customise which lifts appear via the card creation menu.
 */
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell, Trophy, Camera, Upload, X, Plus, Minus, Edit3, Check, Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useCoachingProfile, cmToFeetInches } from '@/hooks/useCoachingProfile';
import { useAchievementCards, type AchievementCard } from '@/hooks/useAchievementCards';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

/* ═══ Types ═══ */
interface CustomPB {
  exerciseName: string;
  value: number;
  unit: string;
}

interface CardConfig {
  customPBs: CustomPB[];
  cardImageUrl?: string;
}

/* ═══ Storage keys ═══ */
const CARD_CONFIG_KEY = 'ub-profile-card-config';

function loadCardConfig(): CardConfig {
  try {
    const saved = localStorage.getItem(CARD_CONFIG_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { customPBs: [] };
}

function saveCardConfig(config: CardConfig) {
  localStorage.setItem(CARD_CONFIG_KEY, JSON.stringify(config));
}

/* ═══ Main component ═══ */
export default function UserProfileCard() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { profile: coachingProfile } = useCoachingProfile();
  const { cards, getCounts } = useAchievementCards();
  const { toast } = useToast();

  const [cardConfig, setCardConfig] = useState<CardConfig>(loadCardConfig);
  const [cardImageUrl, setCardImageUrl] = useState<string | null>(null);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load custom card image from storage
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

  // The PBs to display — either custom picks or auto top 5
  const displayPBs = useMemo(() => {
    if (cardConfig.customPBs.length > 0) {
      // Use custom picks, fill values from latest cards where possible
      return cardConfig.customPBs.map(pb => {
        const match = availableExercises.find(e =>
          e.name.toLowerCase() === pb.exerciseName.toLowerCase()
        );
        return {
          exerciseName: pb.exerciseName,
          value: match ? match.value : pb.value,
          unit: match ? match.unit : pb.unit,
        };
      });
    }

    // Auto mode — SBD + top 2 others
    const sbd = ['squat', 'bench', 'deadlift'];
    const sbdPBs: CustomPB[] = [];
    const otherPBs: CustomPB[] = [];

    // Try coaching profile maxes first
    if (coachingProfile?.squat_max_kg) {
      const card = availableExercises.find(e => e.name.toLowerCase().includes('squat'));
      sbdPBs.push({
        exerciseName: card?.name || 'Back Squat',
        value: Math.max(coachingProfile.squat_max_kg, card?.value || 0),
        unit: 'kg',
      });
    }
    if (coachingProfile?.bench_max_kg) {
      const card = availableExercises.find(e => e.name.toLowerCase().includes('bench'));
      sbdPBs.push({
        exerciseName: card?.name || 'Bench Press',
        value: Math.max(coachingProfile.bench_max_kg, card?.value || 0),
        unit: 'kg',
      });
    }
    if (coachingProfile?.deadlift_max_kg) {
      const card = availableExercises.find(e => e.name.toLowerCase().includes('deadlift') || e.name.toLowerCase().includes('sumo'));
      sbdPBs.push({
        exerciseName: card?.name || 'Deadlift',
        value: Math.max(coachingProfile.deadlift_max_kg, card?.value || 0),
        unit: 'kg',
      });
    }

    // Fill from card data if coaching profile doesn't have them
    for (const ex of availableExercises) {
      const n = ex.name.toLowerCase();
      if (sbd.some(s => n.includes(s)) || n.includes('sumo')) {
        if (!sbdPBs.find(p => p.exerciseName.toLowerCase() === n)) {
          sbdPBs.push({ exerciseName: ex.name, value: ex.value, unit: ex.unit });
        }
      } else if (ex.category === 'lift') {
        otherPBs.push({ exerciseName: ex.name, value: ex.value, unit: ex.unit });
      }
    }

    return [...sbdPBs.slice(0, 3), ...otherPBs.slice(0, 5 - Math.min(sbdPBs.length, 3))].slice(0, 5);
  }, [cardConfig.customPBs, availableExercises, coachingProfile]);

  // Best cardio
  const bestCardio = useMemo(() => {
    const cardioCards = cards.filter(c =>
      c.card_type === 'pb_personal' &&
      c.pb_rank === 1 &&
      ['run', 'cycle', 'row', 'swim'].includes(c.activity_category || '')
    );
    if (cardioCards.length === 0) return null;
    const best = cardioCards.sort((a, b) => (b.pb_value || 0) - (a.pb_value || 0))[0];
    return { name: best.exercise_name || 'Run', value: best.pb_value || 0, unit: best.pb_unit || 'km' };
  }, [cards]);

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 5MB.' });
      return;
    }
    setUploading(true);
    try {
      const path = `${user.id}/card-image`;
      const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = await supabase.storage.from('avatars').createSignedUrl(path, 3600);
      if (data?.signedUrl) {
        setCardImageUrl(data.signedUrl);
        toast({ title: 'Card image updated!' });
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast({ title: 'Upload failed', description: 'Try again.' });
    } finally {
      setUploading(false);
      setShowImageMenu(false);
    }
  };

  const removeCardImage = async () => {
    if (!user) return;
    await supabase.storage.from('avatars').remove([`${user.id}/card-image`]);
    setCardImageUrl(null);
    setShowImageMenu(false);
    toast({ title: 'Card image removed' });
  };

  // PB edit handlers
  const addCustomPB = useCallback((exerciseName: string, value: number, unit: string) => {
    setCardConfig(prev => {
      if (prev.customPBs.length >= 5) return prev;
      if (prev.customPBs.find(p => p.exerciseName === exerciseName)) return prev;
      const next = { ...prev, customPBs: [...prev.customPBs, { exerciseName, value, unit }] };
      saveCardConfig(next);
      return next;
    });
  }, []);

  const removeCustomPB = useCallback((exerciseName: string) => {
    setCardConfig(prev => {
      const next = { ...prev, customPBs: prev.customPBs.filter(p => p.exerciseName !== exerciseName) };
      saveCardConfig(next);
      return next;
    });
  }, []);

  const resetCustomPBs = useCallback(() => {
    setCardConfig(prev => {
      const next = { ...prev, customPBs: [] };
      saveCardConfig(next);
      return next;
    });
  }, []);

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

  const totalCards = getCounts().total;
  const sbdTotal = displayPBs
    .filter(pb => {
      const n = pb.exerciseName.toLowerCase();
      return n.includes('squat') || n.includes('bench') || n.includes('deadlift') || n.includes('sumo');
    })
    .reduce((sum, pb) => sum + pb.value, 0);

  if (!user || !profile) return null;

  return (
    <div className="relative">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

      <motion.div
        className="relative overflow-hidden rounded-2xl"
        style={{
          aspectRatio: '3 / 4.5',
          maxWidth: '100%',
          border: '2px solid rgba(255,85,0,0.45)',
          boxShadow: '0 0 20px rgba(255,85,0,0.15), 0 0 40px rgba(255,85,0,0.06), inset 0 0 30px rgba(0,0,0,0.5)',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Background — premium dark with orange warmth */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0800 30%, #120600 60%, #0d0d0d 100%)',
        }} />
        {/* Subtle metallic sheen */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 20%, rgba(255,85,0,0.06) 0%, transparent 60%), radial-gradient(ellipse at 30% 80%, rgba(255,85,0,0.03) 0%, transparent 40%)',
        }} />

        {/* Tech grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 300 450">
          <line x1="0" y1="0" x2="300" y2="450" stroke="#FF5500" strokeWidth="0.3" />
          <line x1="300" y1="0" x2="0" y2="450" stroke="#FF5500" strokeWidth="0.3" />
          <path d="M10 10 L10 35 M10 10 L35 10" fill="none" stroke="#FF5500" strokeWidth="1" />
          <path d="M290 10 L290 35 M290 10 L265 10" fill="none" stroke="#FF5500" strokeWidth="1" />
          <path d="M10 440 L10 415 M10 440 L35 440" fill="none" stroke="#FF5500" strokeWidth="1" />
          <path d="M290 440 L290 415 M290 440 L265 440" fill="none" stroke="#FF5500" strokeWidth="1" />
        </svg>

        {/* ═══ TOP — Profile image (40%) ═══ */}
        <div className="relative" style={{ height: '38%' }}>
          {cardImageUrl ? (
            <img src={cardImageUrl} alt="Card" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: 'center 20%' }} />
          ) : profile.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: 'center 20%' }} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-orange-500/5 to-transparent">
              <div className="w-20 h-20 rounded-full border-2 border-primary/30 flex items-center justify-center bg-primary/5">
                <span className="text-3xl font-display text-primary opacity-60">
                  {(profile.display_name || profile.username || '?')[0]?.toUpperCase()}
                </span>
              </div>
            </div>
          )}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to bottom, transparent 30%, rgba(10,10,10,0.8) 75%, rgba(10,10,10,1) 100%)',
          }} />

          {/* Camera button */}
          <button onClick={() => setShowImageMenu(!showImageMenu)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/15 hover:border-primary/40 transition-all z-10">
            <Camera className="w-4 h-4 text-white/60" />
          </button>

          {/* Edit PBs button */}
          <button onClick={() => setShowEditMenu(!showEditMenu)}
            className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/15 hover:border-primary/40 transition-all z-10">
            <Edit3 className="w-4 h-4 text-white/60" />
          </button>

          {/* Image menu */}
          <AnimatePresence>
            {showImageMenu && (
              <motion.div className="absolute top-12 right-3 bg-black/90 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden z-20"
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

          {/* Card count badge */}
          <div className="absolute bottom-2 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm border border-primary/15">
            <Trophy className="w-3 h-3 text-primary" />
            <span className="text-[9px] font-display tracking-wider text-primary">{totalCards} CARDS</span>
          </div>
        </div>

        {/* ═══ STATS SECTION (62%) ═══ */}
        <div className="relative px-3 pt-0.5" style={{ height: '62%' }}>
          {/* Name */}
          <div className="mb-1.5">
            <h2 className="font-display text-lg tracking-wider uppercase text-white truncate"
              style={{ textShadow: '0 0 12px rgba(255,85,0,0.3)' }}>
              {profile.display_name || profile.username || 'TRAINER'}
            </h2>
            {profile.username && (
              <p className="text-[9px] font-mono tracking-wider uppercase"
                style={{ color: '#FF5500', textShadow: '0 0 8px rgba(255,85,0,0.4)' }}>@{profile.username}</p>
            )}
          </div>

          {/* ═══ PB Stats Block ═══ */}
          <div className="rounded-lg p-2 mb-1.5" style={{
            background: 'rgba(255,85,0,0.04)',
            border: '1px solid rgba(255,85,0,0.12)',
          }}>
            <p className="text-[7px] font-mono tracking-[0.2em] uppercase mb-1"
              style={{ color: '#FF5500', textShadow: '0 0 6px rgba(255,85,0,0.3)' }}>
              ⚡ PERSONAL BESTS {cardConfig.customPBs.length > 0 ? '(CUSTOM)' : ''}
            </p>

            {displayPBs.length > 0 ? (
              <div className="space-y-[3px]">
                {displayPBs.map((pb, i) => (
                  <StatBar
                    key={pb.exerciseName}
                    label={getShortLabel(pb.exerciseName)}
                    value={pb.value}
                    unit={pb.unit}
                    maxValue={getMaxForExercise(pb.exerciseName, pb.unit)}
                    color="#FF5500"
                    delay={i * 0.1}
                  />
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-white/20 font-mono text-center py-2">
                No PBs yet — start lifting!
              </p>
            )}

            {/* SBD Total */}
            {sbdTotal > 0 && (
              <div className="flex items-center justify-between mt-1 pt-1" style={{ borderTop: '1px solid rgba(255,85,0,0.08)' }}>
                <span className="text-[8px] font-mono tracking-wider"
                  style={{ color: '#FF5500', textShadow: '0 0 6px rgba(255,85,0,0.4)' }}>SBD TOTAL</span>
                <span className="text-sm font-display tracking-wider font-black"
                  style={{ color: '#FF5500', textShadow: '0 0 12px rgba(255,85,0,0.5), 0 0 24px rgba(255,85,0,0.2)' }}>
                  {sbdTotal}KG
                </span>
              </div>
            )}
          </div>

          {/* ═══ Cardio stat ═══ */}
          {bestCardio && (
            <div className="rounded-lg p-1.5 mb-1.5" style={{
              background: 'rgba(255,85,0,0.03)',
              border: '1px solid rgba(255,85,0,0.08)',
            }}>
              <div className="flex items-center justify-between">
                <span className="text-[7px] font-mono tracking-[0.2em] uppercase"
                  style={{ color: '#FF5500', textShadow: '0 0 6px rgba(255,85,0,0.3)' }}>🏃 CARDIO</span>
                <span className="text-[11px] font-display tracking-wide font-bold"
                  style={{ color: '#FF5500', textShadow: '0 0 8px rgba(255,85,0,0.4)' }}>
                  {bestCardio.value}{bestCardio.unit}
                </span>
              </div>
              <p className="text-[8px] text-white/60 font-mono truncate">{bestCardio.name}</p>
            </div>
          )}

          {/* ═══ Body stats ═══ */}
          {(weightDisplay || heightDisplay || ageDisplay) && (
            <div className="flex items-center justify-center gap-5 py-1.5 rounded-lg" style={{
              background: 'rgba(255,85,0,0.04)',
              border: '1px solid rgba(255,85,0,0.12)',
            }}>
              {ageDisplay && (
                <div className="text-center">
                  <p className="text-[7px] font-mono tracking-wider" style={{ color: 'rgba(255,85,0,0.6)' }}>AGE</p>
                  <p className="text-[12px] font-display text-white font-bold">{ageDisplay}</p>
                </div>
              )}
              {heightDisplay && (
                <div className="text-center">
                  <p className="text-[7px] font-mono tracking-wider" style={{ color: 'rgba(255,85,0,0.6)' }}>HT</p>
                  <p className="text-[12px] font-display text-white font-bold">{heightDisplay}</p>
                </div>
              )}
              {weightDisplay && (
                <div className="text-center">
                  <p className="text-[7px] font-mono tracking-wider" style={{ color: 'rgba(255,85,0,0.6)' }}>WT</p>
                  <p className="text-[12px] font-display text-white font-bold">{weightDisplay}</p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="absolute bottom-1.5 left-3 right-3 flex items-center justify-between">
            <span className="text-[6px] font-mono tracking-wider uppercase"
              style={{ color: 'rgba(255,85,0,0.35)' }}>
              UNBREAKABLE • EST {new Date(profile.created_at).getFullYear()}
            </span>
            <span className="text-[6px] font-mono tracking-wider"
              style={{ color: 'rgba(255,85,0,0.25)' }}>
              #{user.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Border glow */}
        <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{
          boxShadow: 'inset 0 0 15px rgba(255,85,0,0.05)',
        }} />
      </motion.div>

      {/* ═══ EDIT PBs MENU ═══ */}
      <AnimatePresence>
        {showEditMenu && (
          <PBEditMenu
            customPBs={cardConfig.customPBs}
            availableExercises={availableExercises}
            onAdd={addCustomPB}
            onRemove={removeCustomPB}
            onReset={resetCustomPBs}
            onClose={() => setShowEditMenu(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══ PB Edit Menu — choose up to 5 exercises ═══ */
function PBEditMenu({
  customPBs,
  availableExercises,
  onAdd,
  onRemove,
  onReset,
  onClose,
}: {
  customPBs: CustomPB[];
  availableExercises: { name: string; value: number; unit: string; category: string }[];
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
        e.name.toLowerCase().includes(search.toLowerCase()) &&
        !customPBs.find(p => p.exerciseName === e.name)
      )
    : availableExercises.filter(e => !customPBs.find(p => p.exerciseName === e.name));

  const handleManualAdd = () => {
    if (!manualName.trim() || !manualValue) return;
    onAdd(manualName.trim(), parseFloat(manualValue), manualUnit);
    setManualName('');
    setManualValue('');
    setShowManual(false);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <motion.div
        className="relative w-full max-w-md bg-background rounded-t-2xl border-t border-border overflow-hidden"
        style={{ maxHeight: '75vh' }}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-display tracking-wider text-sm uppercase text-foreground">
            Card PBs ({customPBs.length}/5)
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

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(75vh - 56px)' }}>
          {/* Current selections */}
          {customPBs.length > 0 && (
            <div className="px-4 py-3 border-b border-border">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Selected ({customPBs.length}/5)
              </p>
              <div className="space-y-1">
                {customPBs.map(pb => (
                  <div key={pb.exerciseName} className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/10">
                    <div>
                      <p className="text-[12px] font-semibold text-foreground">{pb.exerciseName}</p>
                      <p className="text-[10px] text-primary">{pb.value}{pb.unit}</p>
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
              <input
                type="text"
                placeholder="Search exercises..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
          </div>

          {/* Available from PB cards */}
          <div className="px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
              From your PB cards
            </p>
            {filtered.length > 0 ? (
              <div className="space-y-1">
                {filtered.slice(0, 15).map(ex => (
                  <div key={ex.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                    <div>
                      <p className="text-[12px] font-semibold text-foreground">{ex.name}</p>
                      <p className="text-[10px] text-muted-foreground">{ex.value}{ex.unit} • {ex.category}</p>
                    </div>
                    <button
                      onClick={() => onAdd(ex.name, ex.value, ex.unit)}
                      disabled={customPBs.length >= 5}
                      className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 disabled:opacity-20"
                    >
                      <Plus className="w-3.5 h-3.5 text-primary" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground text-center py-3">
                {search ? 'No matching exercises' : 'No PB cards yet'}
              </p>
            )}
          </div>

          {/* Manual entry */}
          <div className="px-4 pb-4">
            {!showManual ? (
              <button onClick={() => setShowManual(true)}
                className="w-full py-2.5 rounded-xl text-[11px] text-muted-foreground hover:text-foreground uppercase tracking-wider font-semibold transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                + Add custom exercise
              </button>
            ) : (
              <div className="p-3 rounded-xl border border-white/10 space-y-2">
                <input
                  type="text"
                  placeholder="Exercise name"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full bg-white/[0.03] rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-white/5"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Value"
                    value={manualValue}
                    onChange={(e) => setManualValue(e.target.value)}
                    className="flex-1 bg-white/[0.03] rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-white/5"
                  />
                  <select
                    value={manualUnit}
                    onChange={(e) => setManualUnit(e.target.value)}
                    className="bg-white/[0.03] rounded-lg px-3 py-2 text-sm text-foreground outline-none border border-white/5"
                  >
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                    <option value="km">km</option>
                    <option value="mi">mi</option>
                    <option value="min">min</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowManual(false)} className="flex-1">Cancel</Button>
                  <Button size="sm" onClick={handleManualAdd} disabled={!manualName.trim() || !manualValue || customPBs.length >= 5}
                    className="flex-1 font-display tracking-wider">
                    <Check className="w-3 h-3 mr-1" /> ADD
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══ Stat bar component ═══ */
function StatBar({ label, value, unit, maxValue, color, delay = 0 }: {
  label: string;
  value: number | null;
  unit: string;
  maxValue: number;
  color: string;
  delay?: number;
}) {
  const fillWidth = value ? Math.min(100, Math.max(8, (value / maxValue) * 100)) : 0;

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[8px] font-mono w-7 tracking-wider truncate font-bold"
        style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</span>
      <div className="flex-1 h-[5px] rounded-full overflow-hidden" style={{ background: `${color}15` }}>
        {value ? (
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${fillWidth}%` }}
            transition={{ duration: 0.8, delay, ease: 'easeOut' }}
            style={{
              background: `linear-gradient(90deg, ${color}70, ${color})`,
              boxShadow: `0 0 8px ${color}40, 0 0 16px ${color}15`,
            }}
          />
        ) : null}
      </div>
      <span className="text-[9px] font-display tracking-wide w-14 text-right font-bold"
        style={{
          color: value ? '#FFFFFF' : 'rgba(255,255,255,0.15)',
          textShadow: value ? '0 0 4px rgba(255,255,255,0.2)' : 'none',
        }}>
        {value ? `${value}${unit.toUpperCase()}` : '—'}
      </span>
    </div>
  );
}

/* ═══ Helpers ═══ */
function getShortLabel(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('squat')) return 'SQT';
  if (n.includes('bench')) return 'BNC';
  if (n.includes('deadlift') || n.includes('sumo')) return 'DL';
  if (n.includes('overhead') || n.includes('shoulder') || n.includes('ohp')) return 'OHP';
  if (n.includes('press up') || n.includes('push up') || n.includes('pushup') || n.includes('press-up')) return 'PU';
  if (n.includes('pull-up') || n.includes('pull up') || n.includes('pullup')) return 'PU';
  if (n.includes('curl')) return 'CRL';
  if (n.includes('row')) return 'ROW';
  if (n.includes('pull')) return 'PLU';
  if (n.includes('leg press')) return 'LP';
  if (n.includes('lunge')) return 'LNG';
  if (n.includes('dip')) return 'DIP';
  // First 3 chars uppercase
  return name.slice(0, 3).toUpperCase();
}

function getMaxForExercise(name: string, unit: string): number {
  if (unit === 'km') return 42;
  if (unit === 'mi') return 26;
  if (unit === 'min') return 120;
  const n = name.toLowerCase();
  if (n.includes('deadlift') || n.includes('sumo')) return 350;
  if (n.includes('squat')) return 300;
  if (n.includes('bench')) return 200;
  if (n.includes('leg press')) return 400;
  if (n.includes('row')) return 150;
  if (n.includes('curl')) return 80;
  if (n.includes('shoulder') || n.includes('ohp')) return 120;
  return 200;
}

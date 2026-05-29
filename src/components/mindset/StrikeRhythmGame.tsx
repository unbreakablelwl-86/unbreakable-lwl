import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trophy, Music, Volume2, VolumeX, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useReactionScores } from "@/hooks/useReactionScores";
import GameCountdown from "./GameCountdown";
import { GameLeaderboard } from "./GameLeaderboard";
import { GameAudioControls } from "./GameAudioControls";
import { usePlayer, Track } from "@/hooks/useUnTunes";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

// ═══════════════════════════════════════════════════════════════
// STRIKE — GUITAR HERO · UNBREAKABLE EDITION
// Notes fall in 4 lanes. Tap/press the right lane as the note
// hits the strike zone. Score multiplier for streaks.
// Powered by the Un-Tunes library.
// ═══════════════════════════════════════════════════════════════

const LANES = 5;
const LANE_COLORS = ["#FF5500", "#CCFF00", "#00FF88", "#AA44FF", "#FF3366"];
const LANE_KEYS = ["a", "s", "d", "j", "k"];
const LANE_LABELS = ["A", "S", "D", "J", "K"];

const CANVAS_W = 360;
const CANVAS_H = 560;
const LANE_W = CANVAS_W / LANES;
const STRIKE_Y = CANVAS_H - 80;
const NOTE_SIZE = 32;
const NOTE_SPEED_BASE = 1.2;       // very gentle start
const NOTE_SPEED_INC = 0.0006;     // slow ramp — takes ~60s to feel fast

// Timing windows (px from perfect)
const PERFECT_WINDOW = 18;
const GOOD_WINDOW = 40;
const MISS_WINDOW = 65;

// Note generation config
const BASE_BPM = 120;
const BEAT_INTERVAL_MS = (60 / BASE_BPM) * 1000;

interface Note {
  id: number;
  lane: number;
  y: number;
  hit: boolean;
  missed: boolean;
  spawnFrame: number;
}

interface HitEffect {
  id: number;
  lane: number;
  type: "perfect" | "good" | "miss";
  frame: number;
}

type GameView = "ready" | "countdown" | "playing" | "gameover" | "leaderboard";

const StrikeRhythmGame = () => {
  const { user } = useAuth();
  const { topScores, userBest, saveScore, refetch } = useReactionScores();

  const [view, setView] = useState<GameView>("ready");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [perfects, setPerfects] = useState(0);
  const [goods, setGoods] = useState(0);
  const [misses, setMisses] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const currentTrackRef = useRef<Track | null>(null);
  const [hitEffects, setHitEffects] = useState<HitEffect[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [availableTracks, setAvailableTracks] = useState<Track[]>([]);
  const [lanePressed, setLanePressed] = useState<boolean[]>([false, false, false, false, false]);
  const [lastHitType, setLastHitType] = useState<string>("");

  // Audio
  const [sfxMuted, setSfxMuted] = useState(false);
  const [musicMuted, setMusicMuted] = useState(false);

  // Elapsed timer
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const timerStartRef = useRef<number>(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval>>();

  // Live elapsed timer
  useEffect(() => {
    if (view === "playing") {
      timerStartRef.current = Date.now();
      setElapsedSecs(0);
      timerIntervalRef.current = setInterval(() => {
        setElapsedSecs(Math.floor((Date.now() - timerStartRef.current) / 1000));
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [view]);

  const { state: playerState, playTrack, togglePlay, stop: playerStop } = usePlayer();
  const playTrackRef = useRef(playTrack);
  const playerStopRef = useRef(playerStop);
  const playerStateRef = useRef(playerState);
  playTrackRef.current = playTrack;
  playerStopRef.current = playerStop;
  playerStateRef.current = playerState;

  // SFX via Web Audio
  const audioCtxRef = useRef<AudioContext | null>(null);
  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback((freq: number, dur: number, vol = 0.1) => {
    if (sfxMuted) return;
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(vol, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.connect(g).connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + dur);
    } catch {}
  }, [sfxMuted, getAudioCtx]);

  const playHitSfx = useCallback(() => {
    playTone(800, 0.06, 0.08);
    setTimeout(() => playTone(1200, 0.04, 0.06), 20);
  }, [playTone]);

  const playPerfectSfx = useCallback(() => {
    playTone(1047, 0.08, 0.1);
    setTimeout(() => playTone(1319, 0.06, 0.08), 30);
    setTimeout(() => playTone(1568, 0.05, 0.06), 60);
  }, [playTone]);

  const playMissSfx = useCallback(() => {
    playTone(200, 0.15, 0.06);
  }, [playTone]);

  // Canvas + game loop refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const notesRef = useRef<Note[]>([]);
  const frameRef = useRef(0);
  const noteIdRef = useRef(0);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const perfectsRef = useRef(0);
  const goodsRef = useRef(0);
  const missesRef = useRef(0);
  const multiplierRef = useRef(1);
  const effectsRef = useRef<HitEffect[]>([]);
  const effectIdRef = useRef(0);
  const lastSpawnFrameRef = useRef(0);
  const speedRef = useRef(NOTE_SPEED_BASE);
  const lanePressedRef = useRef([false, false, false, false, false]);
  const gameActiveRef = useRef(false);
  const tracksRef = useRef<Track[]>([]);
  const startTimeRef = useRef(0);

  // Generate note spawn pattern — synced to ~BPM timing with progressive difficulty
  const spawnNote = useCallback((frame: number) => {
    // Difficulty ramps over ~90 seconds (5400 frames at 60fps)
    const diff = Math.min(frame / 5400, 1);
    const roll = Math.random();
    // Start: mostly single notes. Ramp: doubles common, occasional triples
    const numNotes = diff < 0.2 ? 1 :
      roll < 0.05 + diff * 0.12 ? 3 :
      roll < 0.15 + diff * 0.30 ? 2 : 1;
    const lanes = new Set<number>();
    while (lanes.size < numNotes) {
      lanes.add(Math.floor(Math.random() * LANES));
    }
    lanes.forEach(lane => {
      notesRef.current.push({
        id: noteIdRef.current++,
        lane,
        y: -NOTE_SIZE,
        hit: false,
        missed: false,
        spawnFrame: frame,
      });
    });
  }, []);

  // Load a random track
  const loadTrack = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("un_tunes_tracks")
        .select("*, un_tunes_artists!inner(artist_name, avatar_url)")
        .not("audio_url", "is", null)
        .order("title");
      if (!data || data.length === 0) return null;
      const tracks: Track[] = data.map((t: any) => ({
        ...t,
        artist_name: t.un_tunes_artists?.artist_name,
        artist_avatar: t.un_tunes_artists?.avatar_url,
      }));
      tracksRef.current = tracks;
      setAvailableTracks(tracks);
      // If user selected a specific track, use it; otherwise pick random
      if (selectedTrackId) {
        const chosen = tracks.find(t => t.id === selectedTrackId);
        if (chosen) return chosen;
      }
      const track = tracks[Math.floor(Math.random() * tracks.length)];
      return track;
    } catch { return null; }
  }, [selectedTrackId]);

  // ─── Game loop ───
  const gameLoop = useCallback(() => {
    if (!gameActiveRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    frameRef.current++;
    const frame = frameRef.current;
    speedRef.current = NOTE_SPEED_BASE + frame * NOTE_SPEED_INC;

    // Spawn notes on beat intervals
    // Progressive: start with wide gaps between notes, gradually tighten
    // Start with wide gaps (90 frames ~1.5s), gradually tighten to 28 frames
    const spawnInterval = Math.max(28, Math.round(90 - frame * 0.004));
    if (frame - lastSpawnFrameRef.current >= spawnInterval) {
      spawnNote(frame);
      lastSpawnFrameRef.current = frame;
    }

    // Move notes
    for (const note of notesRef.current) {
      if (!note.hit && !note.missed) {
        note.y += speedRef.current;
        // Auto-miss if past strike zone
        if (note.y > STRIKE_Y + MISS_WINDOW) {
          note.missed = true;
          missesRef.current++;
          comboRef.current = 0;
          multiplierRef.current = 1;
          setMisses(missesRef.current);
          setCombo(0);
          setMultiplier(1);
          setLastHitType("MISS");
        }
      }
    }

    // Remove old notes
    notesRef.current = notesRef.current.filter(n => n.y < CANVAS_H + 50 || (!n.hit && !n.missed));

    // Clean old effects
    effectsRef.current = effectsRef.current.filter(e => frame - e.frame < 30);

    // ─── DRAW ───
    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    grad.addColorStop(0, "#050505");
    grad.addColorStop(1, "#0a0a0a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Lane dividers
    ctx.strokeStyle = "rgba(255,85,0,0.08)";
    ctx.lineWidth = 1;
    for (let i = 1; i < LANES; i++) {
      ctx.beginPath();
      ctx.moveTo(i * LANE_W, 0);
      ctx.lineTo(i * LANE_W, CANVAS_H);
      ctx.stroke();
    }

    // Strike zone
    ctx.fillStyle = "rgba(255,85,0,0.06)";
    ctx.fillRect(0, STRIKE_Y - 4, CANVAS_W, 8);
    ctx.strokeStyle = "rgba(255,85,0,0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, STRIKE_Y);
    ctx.lineTo(CANVAS_W, STRIKE_Y);
    ctx.stroke();

    // Lane buttons at bottom
    for (let i = 0; i < LANES; i++) {
      const cx = i * LANE_W + LANE_W / 2;
      const pressed = lanePressedRef.current[i];
      
      // Button glow
      if (pressed) {
        ctx.fillStyle = LANE_COLORS[i] + "30";
        ctx.fillRect(i * LANE_W, STRIKE_Y - 30, LANE_W, 60);
      }

      // Button circle — big & bright
      ctx.beginPath();
      ctx.arc(cx, STRIKE_Y, 28, 0, Math.PI * 2);
      ctx.fillStyle = pressed ? LANE_COLORS[i] + "90" : LANE_COLORS[i] + "25";
      ctx.fill();
      ctx.strokeStyle = pressed ? LANE_COLORS[i] : LANE_COLORS[i] + "60";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Key label
      ctx.fillStyle = pressed ? "#FFFFFF" : LANE_COLORS[i] + "90";
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(LANE_LABELS[i], cx, STRIKE_Y);
    }

    // Draw notes
    for (const note of notesRef.current) {
      if (note.hit || note.missed) continue;
      const cx = note.lane * LANE_W + LANE_W / 2;
      const color = LANE_COLORS[note.lane];

      // Note glow
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;

      // Note body
      ctx.beginPath();
      ctx.arc(cx, note.y, NOTE_SIZE / 2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Inner highlight
      ctx.beginPath();
      ctx.arc(cx - 3, note.y - 3, NOTE_SIZE / 5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fill();

      ctx.shadowBlur = 0;
    }

    // Draw hit effects
    for (const eff of effectsRef.current) {
      const age = frame - eff.frame;
      const alpha = 1 - age / 30;
      const cx = eff.lane * LANE_W + LANE_W / 2;
      const color = eff.type === "perfect" ? "#FFD700" : eff.type === "good" ? "#00FF88" : "#FF3333";
      const radius = 20 + age * 1.5;

      ctx.beginPath();
      ctx.arc(cx, STRIKE_Y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = color + Math.round(alpha * 255).toString(16).padStart(2, "0");
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "center";
      ctx.fillText(eff.type.toUpperCase(), cx, STRIKE_Y - 30 - age);
      ctx.globalAlpha = 1;
    }

    // HUD — Score top left
    ctx.fillStyle = "#FF5500";
    ctx.font = "bold 28px monospace";
    ctx.textAlign = "left";
    ctx.shadowColor = "rgba(255,85,0,0.5)";
    ctx.shadowBlur = 15;
    ctx.fillText(String(scoreRef.current), 12, 36);
    ctx.shadowBlur = 0;

    // HUD — Timer top center
    const mins = Math.floor(elapsedSecs / 60);
    const secs = elapsedSecs % 60;
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "bold 14px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${mins}:${String(secs).padStart(2, "0")}`, CANVAS_W / 2, 24);

    // HUD — Combo top right
    if (comboRef.current > 1) {
      ctx.fillStyle = "#FFD700";
      ctx.font = "bold 18px monospace";
      ctx.textAlign = "right";
      ctx.shadowColor = "rgba(255,215,0,0.5)";
      ctx.shadowBlur = 10;
      ctx.fillText(`${comboRef.current}x`, CANVAS_W - 12, 32);
      ctx.shadowBlur = 0;
      
      if (multiplierRef.current > 1) {
        ctx.fillStyle = "rgba(255,215,0,0.6)";
        ctx.font = "10px monospace";
        ctx.fillText(`×${multiplierRef.current}`, CANVAS_W - 12, 48);
      }
    }

    // CRT scanlines
    ctx.fillStyle = "rgba(255,85,0,0.012)";
    for (let y = 0; y < CANVAS_H; y += 3) {
      ctx.fillRect(0, y, CANVAS_W, 1);
    }

    rafRef.current = requestAnimationFrame(gameLoop);
  }, [spawnNote]);

  // ─── Hit detection for a lane ───
  const hitLane = useCallback((lane: number) => {
    if (!gameActiveRef.current) return;

    // Find closest unhit note in this lane near strike zone
    let closest: Note | null = null;
    let closestDist = Infinity;
    for (const note of notesRef.current) {
      if (note.lane !== lane || note.hit || note.missed) continue;
      const dist = Math.abs(note.y - STRIKE_Y);
      if (dist < closestDist && dist < MISS_WINDOW) {
        closest = note;
        closestDist = dist;
      }
    }

    if (!closest) return; // No note to hit

    closest.hit = true;

    if (closestDist <= PERFECT_WINDOW) {
      // Perfect
      const pts = 100 * multiplierRef.current;
      scoreRef.current += pts;
      perfectsRef.current++;
      comboRef.current++;
      if (comboRef.current > maxComboRef.current) maxComboRef.current = comboRef.current;
      if (comboRef.current >= 30) multiplierRef.current = 4;
      else if (comboRef.current >= 15) multiplierRef.current = 3;
      else if (comboRef.current >= 5) multiplierRef.current = 2;
      setLastHitType("PERFECT");
      playPerfectSfx();
      setPerfects(perfectsRef.current);
    } else if (closestDist <= GOOD_WINDOW) {
      // Good
      const pts = 50 * multiplierRef.current;
      scoreRef.current += pts;
      goodsRef.current++;
      comboRef.current++;
      if (comboRef.current > maxComboRef.current) maxComboRef.current = comboRef.current;
      if (comboRef.current >= 30) multiplierRef.current = 4;
      else if (comboRef.current >= 15) multiplierRef.current = 3;
      else if (comboRef.current >= 5) multiplierRef.current = 2;
      setLastHitType("GOOD");
      playHitSfx();
      setGoods(goodsRef.current);
    } else {
      // Too far — miss
      closest.hit = false;
      closest.missed = true;
      missesRef.current++;
      comboRef.current = 0;
      multiplierRef.current = 1;
      setLastHitType("MISS");
      playMissSfx();
      setMisses(missesRef.current);
    }

    // Update state
    setScore(scoreRef.current);
    setCombo(comboRef.current);
    setMaxCombo(maxComboRef.current);
    setMultiplier(multiplierRef.current);

    // Visual effect
    effectsRef.current.push({
      id: effectIdRef.current++,
      lane,
      type: closestDist <= PERFECT_WINDOW ? "perfect" : closestDist <= GOOD_WINDOW ? "good" : "miss",
      frame: frameRef.current,
    });
  }, [playHitSfx, playPerfectSfx, playMissSfx]);

  // ─── Start Game ───
  const startGame = useCallback(async () => {
    // Reset state
    notesRef.current = [];
    frameRef.current = 0;
    noteIdRef.current = 0;
    scoreRef.current = 0;
    comboRef.current = 0;
    maxComboRef.current = 0;
    perfectsRef.current = 0;
    goodsRef.current = 0;
    missesRef.current = 0;
    multiplierRef.current = 1;
    effectsRef.current = [];
    lastSpawnFrameRef.current = 0;
    speedRef.current = NOTE_SPEED_BASE;
    startTimeRef.current = Date.now();

    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setPerfects(0);
    setGoods(0);
    setMisses(0);
    setMultiplier(1);
    setLastHitType("");
    setHitEffects([]);

    // Load and play a track
    const track = await loadTrack();
    if (track) {
      setCurrentTrack(track);
      currentTrackRef.current = track;
      if (!musicMuted) {
        playTrackRef.current(track, tracksRef.current);
      }
    }

    setView("countdown");
  }, [loadTrack, musicMuted]);

  const onCountdownComplete = useCallback(() => {
    gameActiveRef.current = true;
    setView("playing");

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(gameLoop);

    // End game after track duration or ~90 seconds
    const duration = (currentTrackRef.current?.duration_seconds || 90) * 1000;
    setTimeout(() => {
      if (!gameActiveRef.current) return;
      gameActiveRef.current = false;

      // Stop music
      if (playerStopRef.current) playerStopRef.current();

      setView("gameover");
      const finalScore = scoreRef.current;
      if (user && finalScore > 0) {
        saveScore(finalScore, {
          best_combo: maxComboRef.current,
          total_hits: perfectsRef.current + goodsRef.current,
          total_misses: missesRef.current,
          best_reaction_ms: 0,
          avg_reaction_ms: 0,
          track_id: currentTrackRef.current?.id,
          track_name: currentTrackRef.current?.title,
        });
      }
    }, duration);
  }, [gameLoop, user, saveScore]);

  // ─── Keyboard input ───
  useEffect(() => {
    if (view !== "playing") return;
    const down = (e: KeyboardEvent) => {
      const idx = LANE_KEYS.indexOf(e.key.toLowerCase());
      if (idx >= 0) {
        e.preventDefault();
        lanePressedRef.current[idx] = true;
        setLanePressed([...lanePressedRef.current]);
        hitLane(idx);
      }
    };
    const up = (e: KeyboardEvent) => {
      const idx = LANE_KEYS.indexOf(e.key.toLowerCase());
      if (idx >= 0) {
        lanePressedRef.current[idx] = false;
        setLanePressed([...lanePressedRef.current]);
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [view, hitLane]);

  // Touch handler for mobile — 4 zones
  const handleTouch = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const x = (touch.clientX - rect.left) * scaleX;
      const lane = Math.min(LANES - 1, Math.max(0, Math.floor(x / LANE_W)));
      hitLane(lane);

      // Visual press
      lanePressedRef.current[lane] = true;
      setLanePressed([...lanePressedRef.current]);
      setTimeout(() => {
        lanePressedRef.current[lane] = false;
        setLanePressed([...lanePressedRef.current]);
      }, 100);
    }
  }, [hitLane]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      gameActiveRef.current = false;
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, []);

  // Draw idle
  useEffect(() => {
    if (view !== "ready") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    grad.addColorStop(0, "#050505");
    grad.addColorStop(1, "#0a0a0a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Lane dividers
    ctx.strokeStyle = "rgba(255,85,0,0.08)";
    for (let i = 1; i < LANES; i++) {
      ctx.beginPath();
      ctx.moveTo(i * LANE_W, 0);
      ctx.lineTo(i * LANE_W, CANVAS_H);
      ctx.stroke();
    }

    // Strike zone
    ctx.strokeStyle = "rgba(255,85,0,0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, STRIKE_Y);
    ctx.lineTo(CANVAS_W, STRIKE_Y);
    ctx.stroke();

    // Demo notes
    LANE_COLORS.forEach((color, i) => {
      const cx = i * LANE_W + LANE_W / 2;
      ctx.beginPath();
      ctx.arc(cx, 200 + i * 60, NOTE_SIZE / 2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Title
    ctx.font = "bold 32px monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "#FF5500";
    ctx.shadowColor = "rgba(255,85,0,0.6)";
    ctx.shadowBlur = 25;
    ctx.fillText("STRIKE", CANVAS_W / 2, 80);
    ctx.shadowBlur = 0;
    ctx.font = "11px monospace";
    ctx.fillStyle = "rgba(255,85,0,0.5)";
    ctx.fillText("TAP THE BEAT · RIDE THE MUSIC", CANVAS_W / 2, 105);
  }, [view]);

  const accuracy = perfects + goods + misses > 0
    ? Math.round(((perfects + goods) / (perfects + goods + misses)) * 100)
    : 0;

  const isNewBest = view === "gameover" && userBest !== null && score >= userBest && score > 0;

  // ─── LEADERBOARD ──────────────────────────────────────────
  if (view === "leaderboard") {
    return (
      <GameLeaderboard
        scores={topScores}
        userBest={userBest}
        currentUserId={user?.id}
        gameName="STRIKE"
        onClose={() => setView("gameover")}
        onRefetch={refetch}
        getSubLabel={(e) => e.best_combo ? `${e.best_combo}x combo` : ""}
      />
    );
  }

  // Load available tracks on mount
  useEffect(() => {
    loadTrack().then(t => {
      if (t && availableTracks.length === 0) {
        setAvailableTracks(tracksRef.current);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── READY ────────────────────────────────────────────────
  if (view === "ready") {
    return (
      <div className="relative rounded-2xl border border-primary/20 bg-card overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-30 rounded-2xl"
          style={{ background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.04) 0px, transparent 1px, transparent 2px)" }} />
        <div className="relative z-10 flex flex-col items-center justify-center py-8 px-6 gap-5">
          <div className="w-16 h-16 rounded-xl border border-primary/30 flex items-center justify-center" style={{ background: "rgba(255,85,0,0.1)" }}>
            <Zap className="w-8 h-8 text-primary" style={{ filter: "drop-shadow(0 0 8px rgba(255,85,0,0.6))" }} />
          </div>
          <div className="text-center">
            <h2 className="font-display text-2xl tracking-wider text-primary" style={{ textShadow: "0 0 20px rgba(255,85,0,0.4)" }}>STRIKE</h2>
            <p className="text-muted-foreground text-sm mt-2 max-w-xs">
              Tap the right lane as notes hit the strike zone. A random Un-Tunes track plays — ride the rhythm.
            </p>
          </div>
          <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H}
            className="rounded-xl border border-primary/10 max-w-full"
            style={{ maxHeight: "280px", objectFit: "contain" }} />
          <div className="space-y-2 text-left max-w-xs">
            <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> 5 lanes — tap or press A S D J K</p>
            <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> Perfect hit = 100pts · Good = 50pts</p>
            <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> Build combos for 2x → 3x → 4x multiplier</p>
            <p className="text-muted-foreground text-sm"><span className="text-primary font-bold">▸</span> Miss breaks your streak</p>
          </div>
          {/* Song selector */}
          {availableTracks.length > 0 && (
            <div className="w-full max-w-xs">
              <p className="font-display text-[10px] tracking-wider text-muted-foreground mb-1">SONG</p>
              <select
                value={selectedTrackId || ""}
                onChange={(e) => setSelectedTrackId(e.target.value || null)}
                className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground font-display tracking-wide appearance-none cursor-pointer focus:border-primary/50 focus:outline-none"
              >
                <option value="">🎲 Random track</option>
                {availableTracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} — {(t as any).artist_name || "Unknown"}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-3 mt-2">
            <Button onClick={startGame} className="font-display tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground px-8">
              <Music className="w-4 h-4 mr-2" /> PLAY
            </Button>
            <Button onClick={() => { refetch(); setView("leaderboard"); }} variant="outline" className="font-display tracking-wider border-primary/30">
              <Trophy className="w-4 h-4 mr-2" /> RANKS
            </Button>
          </div>
          {userBest !== null && (
            <p className="text-xs text-muted-foreground font-display tracking-wider">YOUR BEST: <span className="text-primary">{userBest}</span></p>
          )}
        </div>
      </div>
    );
  }

  // ─── GAME OVER ────────────────────────────────────────────
  if (view === "gameover") {
    return (
      <div className="relative rounded-2xl border border-primary/20 bg-card overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-30 rounded-2xl"
          style={{ background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.04) 0px, transparent 1px, transparent 2px)" }} />
        <div className="relative z-10 flex flex-col items-center py-8 px-6 gap-4">
          <h2 className="font-display text-xl tracking-wider text-primary" style={{ textShadow: "0 0 12px rgba(255,85,0,0.4)" }}>
            TRACK COMPLETE
          </h2>
          {currentTrack && (
            <p className="text-xs text-muted-foreground font-display tracking-wider">
              {currentTrack.title} — {(currentTrack as any).artist_name || "Unknown"}
            </p>
          )}
          <div className="font-display text-5xl text-primary" style={{ textShadow: "0 0 30px rgba(255,85,0,0.5)" }}>{score}</div>
          <p className="text-sm text-muted-foreground">points</p>
          {isNewBest && (
            <p className="text-sm text-yellow-400 font-display tracking-wider animate-pulse">🏆 NEW PERSONAL BEST!</p>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-xs mt-2">
            <div className="text-center">
              <p className="font-display text-lg text-yellow-400">{perfects}</p>
              <p className="text-[9px] text-muted-foreground font-display tracking-wider">PERFECT</p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg text-green-400">{goods}</p>
              <p className="text-[9px] text-muted-foreground font-display tracking-wider">GOOD</p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg text-red-400">{misses}</p>
              <p className="text-[9px] text-muted-foreground font-display tracking-wider">MISS</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span>MAX COMBO: <span className="text-primary">{maxCombo}x</span></span>
            <span>ACCURACY: <span className="text-primary">{accuracy}%</span></span>
          </div>

          <div className="flex gap-3 mt-3">
            <Button onClick={startGame} className="font-display tracking-wider bg-primary hover:bg-primary/90 px-6">
              <RotateCcw className="w-4 h-4 mr-2" /> AGAIN
            </Button>
            <Button onClick={() => { refetch(); setView("leaderboard"); }} variant="outline" className="font-display tracking-wider border-primary/30">
              <Trophy className="w-4 h-4 mr-2" /> RANKS
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── PLAYING ──────────────────────────────────────────────
  return (
    <div className="relative rounded-2xl border border-primary/20 bg-card overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-30 rounded-2xl"
        style={{ background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.04) 0px, transparent 1px, transparent 2px)", mixBlendMode: "multiply" }} />
      <div className="relative z-10 p-2 flex flex-col items-center">
        <div className="flex items-center justify-between w-full px-2 mb-1">
          <span className="font-display text-xs tracking-wider text-muted-foreground">STRIKE</span>
          <div className="flex items-center gap-2">
            {currentTrack && (
              <span className="text-[10px] text-muted-foreground/60 truncate max-w-[120px]">
                ♪ {currentTrack.title}
              </span>
            )}
            <button onClick={() => setSfxMuted(!sfxMuted)} className="text-muted-foreground hover:text-foreground">
              {sfxMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="rounded-xl border border-primary/10 max-w-full touch-none"
          style={{ maxHeight: "70vh" }}
          onTouchStart={handleTouch}
          onClick={(e) => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;
            const scaleX = CANVAS_W / rect.width;
            const x = (e.clientX - rect.left) * scaleX;
            const lane = Math.min(LANES - 1, Math.max(0, Math.floor(x / LANE_W)));
            hitLane(lane);
            lanePressedRef.current[lane] = true;
            setLanePressed([...lanePressedRef.current]);
            setTimeout(() => {
              lanePressedRef.current[lane] = false;
              setLanePressed([...lanePressedRef.current]);
            }, 100);
          }}
        />
        {/* Mobile lane buttons */}
        <div className="flex w-full mt-2 gap-1 sm:hidden">
          {LANE_COLORS.map((color, i) => (
            <button
              key={i}
              className="flex-1 py-6 rounded-xl font-display text-base tracking-wider transition-all active:scale-95"
              style={{
                background: lanePressed[i] ? color + "70" : color + "20",
                border: `2px solid ${lanePressed[i] ? color : color + "80"}`,
                color: color,
                textShadow: `0 0 12px ${color}`,
                boxShadow: lanePressed[i] ? `0 0 20px ${color}60, inset 0 0 15px ${color}30` : `0 0 8px ${color}30`,
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                hitLane(i);
                lanePressedRef.current[i] = true;
                setLanePressed([...lanePressedRef.current]);
              }}
              onTouchEnd={() => {
                lanePressedRef.current[i] = false;
                setLanePressed([...lanePressedRef.current]);
              }}
            >
              {LANE_LABELS[i]}
            </button>
          ))}
        </div>
      </div>

      {/* 3-2-1 Countdown */}
      {view === "countdown" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 rounded-2xl">
          <GameCountdown onComplete={onCountdownComplete} gameName="STRIKE" />
        </div>
      )}
    </div>
  );
};

export default StrikeRhythmGame;

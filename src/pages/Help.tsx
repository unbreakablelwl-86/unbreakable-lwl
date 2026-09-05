import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Send, MessageSquarePlus, Trash2, Loader2, Flame, Sparkles, UtensilsCrossed,
  PanelLeftClose, PanelLeftOpen, Dumbbell, TrendingUp, Brain, Zap, MessageCircle,
  ArrowRight, Check, X, Eye, BookOpen, Target, Activity, Mic, MicOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

import { PageNavigation, SwipeNavigationWrapper } from '@/components/PageNavigation';
import { AuthModal } from '@/components/tracker/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { useHelpChat, Message } from '@/hooks/useHelpChat';
import { ThemedLogo } from '@/components/ThemedLogo';
import { ProfileButton } from '@/components/coaching/ProfileButton';
import { PlanDisplayCard } from '@/components/coaching/PlanDisplayCard';
import { VoiceSettingsSheet } from '@/components/coaching/VoiceSettingsSheet';
import { useAIPreferences } from '@/hooks/useAIPreferences';
import { useJJVoice } from '@/hooks/useJJVoice';
import { useCoachName } from '@/hooks/useCoachName';
import { CoachNameEditor } from '@/components/coaching/CoachNameEditor';
import { AIPlanReviewModal } from '@/components/ai/AIPlanReviewModal';
import { useAIProgramme } from '@/hooks/useAIProgramme';
import { useAIMealPlan } from '@/hooks/useAIMealPlan';
import { useTrainingPrograms } from '@/hooks/useTrainingPrograms';
import { PaywallGate } from '@/components/paywall';
import { useMindsetProgrammes } from '@/hooks/useMindsetProgrammes';
import { useCardioPrograms } from '@/hooks/useCardioPrograms';
import { useMealPlans } from '@/hooks/useMealPlans';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/hooks/use-toast';
import { GeneratedProgram } from '@/lib/programTypes';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

type MessageWithMedia = Message;

interface GeneratedPlanInfo {
  type: 'programme' | 'meal_plan' | 'mindset' | 'cardio';
  planData: any;
  planId: string;
  savedToHub: boolean;
  messageId?: string;
}

/* ═══════════════════════════════════════════════════════════════════
   Neon Message Bubble
   ═══════════════════════════════════════════════════════════════════ */
function MessageBubble({ message }: { message: MessageWithMedia }) {
  const isUser = message.role === 'user';

  const formatContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/);
      return (
        <p key={i} className={i > 0 ? 'mt-2' : ''}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j} className="text-primary">{part}</strong> : part
          )}
        </p>
      );
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="flex-shrink-0 mr-3 mt-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center border border-primary/30 bg-primary/10"
            style={{ boxShadow: '0 0 12px rgba(255,85,0,0.15)' }}>
            <Flame className="w-4 h-4 text-primary" />
          </div>
        </div>
      )}
      <div className={`max-w-[80%]`}>
        <div className={`rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-primary/15 border border-primary/25 rounded-br-md'
            : 'bg-card border border-border rounded-bl-md'
        }`}>
          <div className={`text-sm leading-relaxed ${isUser ? 'text-foreground' : 'text-muted-foreground'}`}>
            {isUser ? message.content : formatContent(message.content)}
          </div>
        </div>
        <div className={`flex items-center gap-2 mt-1 px-1 ${isUser ? 'justify-end' : ''}`}>
          <p className="text-[10px] text-muted-foreground">
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Smart Prompt Chips — context-aware suggestions
   ═══════════════════════════════════════════════════════════════════ */
const SMART_PROMPTS = [
  { icon: '💪', label: 'Build me a programme', prompt: "Build me a bespoke training programme. Pull my saved profile info and ask me anything that's missing before you start." },
  { icon: '🍽️', label: 'Create a meal plan', prompt: "Create a personalised meal plan for me. Use my saved profile data and ask me about any preferences that are missing." },
  { icon: '🧠', label: 'Mindset coaching', prompt: "Build me a mindset programme. Pull my profile info and ask me what I want to focus on." },
  { icon: '🏃', label: 'Cardio plan', prompt: "Help me build a cardio training plan. What are my current fitness levels and what am I training towards?" },
  { icon: '📊', label: 'Check my progress', prompt: "Analyse my training progress and suggest improvements." },
  { icon: '💬', label: 'Just chat', prompt: "Hey coach, what's on the agenda today?" },
];

function SmartPromptChips({ onSelect, disabled }: { onSelect: (prompt: string) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
      {SMART_PROMPTS.map(sp => (
        <button
          key={sp.label}
          onClick={() => onSelect(sp.prompt)}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-display tracking-wide
            bg-card border border-border text-muted-foreground
            hover:border-primary/30 hover:text-primary hover:bg-primary/5
            active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>{sp.icon}</span>
          <span>{sp.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Build Confirmation Dialog
   ═══════════════════════════════════════════════════════════════════ */
function BuildConfirmDialog({
  type,
  onConfirm,
  onCancel,
}: {
  type: 'programme' | 'meal_plan' | 'mindset' | 'cardio';
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const labels = {
    programme: { title: 'BUILD TRAINING PROGRAMME', desc: 'Your coach is ready to build a bespoke training programme based on your conversation.', icon: Dumbbell },
    meal_plan: { title: 'BUILD MEAL PLAN', desc: 'Your coach is ready to create a personalised meal plan based on your conversation.', icon: UtensilsCrossed },
    mindset: { title: 'BUILD MINDSET PROGRAMME', desc: 'Your coach is ready to build a mindset programme based on your conversation.', icon: Brain },
    cardio: { title: 'BUILD MOVEMENT PROGRAMME', desc: 'Your coach is ready to build a movement/cardio programme based on your conversation.', icon: Activity },
  };
  const config = labels[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/70 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-2xl border border-primary/20 bg-card p-6 text-center"
        style={{ boxShadow: '0 0 40px rgba(255,85,0,0.1)' }}>
        <div className="w-14 h-14 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-4"
          style={{ boxShadow: '0 0 20px rgba(255,85,0,0.2)' }}>
          <Icon className="w-7 h-7 text-primary" />
        </div>
        <h3 className="font-display text-lg text-foreground tracking-wide mb-2">{config.title}</h3>
        <p className="text-muted-foreground text-sm mb-6">{config.desc}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground text-sm font-display transition-all"
          >
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/80 text-white text-sm font-display transition-all"
            style={{ boxShadow: '0 0 15px rgba(255,85,0,0.3)' }}
          >
            BUILD IT
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Conversation Sidebar (neon themed)
   ═══════════════════════════════════════════════════════════════════ */
function ConversationSidebar({
  conversations, currentConversationId, onSelect, onDelete, onNewConversation, isOpen, onToggle,
}: {
  conversations: any[];
  currentConversationId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewConversation: () => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const isMobile = useIsMobile();

  return (
    <>
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40" onClick={onToggle} />
      )}
      <aside className={`
        ${isMobile ? 'fixed left-0 top-0 bottom-0 z-50' : 'relative'}
        ${isOpen ? 'w-72' : 'w-0'}
        bg-background border-r border-border
        transition-all duration-300 overflow-hidden flex flex-col
        ${isMobile && !isOpen ? 'pointer-events-none' : ''}
      `}>
        <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
          <h2 className="font-display text-xs tracking-wider text-primary">CONVERSATIONS</h2>
          <button onClick={onToggle} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 flex-shrink-0">
          <button
            onClick={onNewConversation}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl
              border border-primary/30 text-primary text-xs font-display tracking-wider
              hover:bg-primary/10 transition-all"
          >
            <MessageSquarePlus className="w-4 h-4" />
            NEW CONVERSATION
          </button>
        </div>

        <ScrollArea className="flex-1 px-2 pb-4">
          {conversations.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6 px-3">No conversations yet.</p>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all border ${
                    currentConversationId === conv.id
                      ? 'bg-primary/10 border-primary/25'
                      : 'border-transparent hover:border-border hover:bg-card'
                  }`}
                  onClick={() => onSelect(conv.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{conv.title || 'Untitled'}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-primary/50 hover:text-primary hover:bg-primary/10 transition-all flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete this conversation?')) onDelete(conv.id); }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </aside>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Main Unbreakable Coach Page
   ═══════════════════════════════════════════════════════════════════ */
export default function Help() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  /* ── Voice Chat State ── */
  const [isListening, setIsListening] = useState(false);
  const jjVoice = useJJVoice();
  const recognitionRef = useRef<any>(null);

  const [programmeGenerating, setProgrammeGenerating] = useState(false);
  const [mealPlanGenerating, setMealPlanGenerating] = useState(false);
  const [mindsetGenerating, setMindsetGenerating] = useState(false);
  const [cardioGenerating, setCardioGenerating] = useState(false);
  const [generatedPlans, setGeneratedPlans] = useState<GeneratedPlanInfo[]>([]);
  const [editingPlan, setEditingPlan] = useState<GeneratedPlanInfo | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Build confirmation
  const [pendingBuild, setPendingBuild] = useState<{ type: 'programme' | 'meal_plan' | 'mindset' | 'cardio'; chatContext: string; cardioParams?: any } | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { preferences: aiPrefs } = useAIPreferences();
  const { coachName, setCoachName } = useCoachName();

  const { user } = useAuth();
  const {
    messages, conversations, currentConversationId, isLoading,
    conversationsLoading, tokenBalance, sendMessage, loadConversation,
    deleteConversation, startNewConversation,
  } = useHelpChat();

  const { generateProgramme, detectProgrammeRequest, isGenerating } = useAIProgramme();
  const { generateMealPlan, detectMealPlanRequest, isGenerating: isMealPlanGenerating } = useAIMealPlan();
  const { updateProgram, saveProgram } = useTrainingPrograms();
  const { updateMealPlan, createMealPlan } = useMealPlans();
  const { saveProgramme: saveMindsetProgramme, generateProgramme: generateMindsetProgramme } = useMindsetProgrammes();
  const { saveProgram: saveCardioProgram, generateProgramme: generateCardioProgramme } = useCardioPrograms();
  const { isDev, isCoach, role } = useUserRole();
  const callerRole = (isDev ? 'dev' : isCoach ? 'coach' : 'user') as 'dev' | 'coach' | 'user';
  const queryClient = useQueryClient();

  const lastProcessedMsgRef = useRef<string | null>(null);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Detect build tags in assistant messages — now with confirmation
  useEffect(() => {
    if (isLoading || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== 'assistant' || lastMsg.id === lastProcessedMsgRef.current) return;
    lastProcessedMsgRef.current = lastMsg.id;

    const content = lastMsg.content;
    const chatContext = messages.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n');

    if (content.match(/\[BUILD_PROGRAMME\](\{.*\})?/)) {
      // A confirmed strength programme can carry a [BUILD_MOVEMENT] tag
      // right after it when the client also agreed to cardio in the same
      // intake — build both, but keep them as separate programmes/hubs.
      const programmeMovementMatch = content.match(/\[BUILD_MOVEMENT\](\{.*\})?/);
      let programmeCardioParams: any = undefined;
      if (programmeMovementMatch) {
        programmeCardioParams = {};
        if (programmeMovementMatch[1]) {
          try { programmeCardioParams = JSON.parse(programmeMovementMatch[1]); } catch { /* fall back to defaults on execute */ }
        }
      }
      setPendingBuild({ type: 'programme', chatContext, cardioParams: programmeCardioParams });
    } else if (content.match(/\[BUILD_MEAL_PLAN\](\{.*\})?/)) {
      setPendingBuild({ type: 'meal_plan', chatContext });
    } else if (content.match(/\[BUILD_MINDSET_PROGRAMME\](\{.*\})?/) || content.match(/\[BUILD_MINDSET\](\{.*\})?/)) {
      setPendingBuild({ type: 'mindset', chatContext });
    } else {
      const movementMatch = content.match(/\[BUILD_MOVEMENT\](\{.*\})?/);
      if (movementMatch) {
        let cardioParams: any = {};
        if (movementMatch[1]) {
          try { cardioParams = JSON.parse(movementMatch[1]); } catch { /* fall back to defaults on execute */ }
        }
        setPendingBuild({ type: 'cardio', chatContext, cardioParams });
      }
    }
  }, [messages, isLoading]);

  // Execute confirmed build
  const executeBuild = useCallback(async (type: 'programme' | 'meal_plan' | 'mindset' | 'cardio', chatContext: string, cardioParams?: any) => {
    if (type === 'programme') {
      setProgrammeGenerating(true);
      try {
        const result = await generateProgramme('Build a programme based on our conversation', { chatContext });
        if (result?.program) {
          const planInfo: GeneratedPlanInfo = { type: 'programme', planData: result.program, planId: '', savedToHub: false };
          setGeneratedPlans(prev => [...prev, planInfo]);
          toast({ title: '✅ Programme Ready', description: 'Review your plan below, then save it to your library.' });
        }
      } finally { setProgrammeGenerating(false); }

      // Cardio agreed in the same intake — build it as its own Movement
      // programme, delivered separately, never merged into the strength
      // programme above.
      if (cardioParams && Object.keys(cardioParams).length > 0) {
        setCardioGenerating(true);
        try {
          const defaults = { activityType: 'run', goal: 'fitness', currentLevel: 'beginner', sessionsPerWeek: 3, sessionLength: 30 };
          const params = { ...defaults, ...cardioParams };
          const result = await generateCardioProgramme(params);
          if (result?.program) {
            const planInfo: GeneratedPlanInfo = { type: 'cardio', planData: result.program, planId: '', savedToHub: false };
            setGeneratedPlans(prev => [...prev, planInfo]);
            toast({ title: '✅ Movement Programme Ready', description: 'Review your plan below, then save it to your library.' });
          }
        } catch {
          toast({ title: 'Error', description: 'Failed to generate movement programme', variant: 'destructive' });
        } finally { setCardioGenerating(false); }
      }
    } else if (type === 'meal_plan') {
      setMealPlanGenerating(true);
      try {
        const result = await generateMealPlan('Build a meal plan based on our conversation', 'full_plan', { chatContext });
        if (result?.plan) {
          const planInfo: GeneratedPlanInfo = { type: 'meal_plan', planData: result.plan, planId: '', savedToHub: false };
          setGeneratedPlans(prev => [...prev, planInfo]);
          toast({ title: '✅ Meal Plan Ready', description: 'Review your plan below, then save it to your library.' });
        }
      } finally { setMealPlanGenerating(false); }
    } else if (type === 'mindset') {
      setMindsetGenerating(true);
      try {
        const result = await generateMindsetProgramme('Build a mindset programme based on our conversation', chatContext);
        if (result?.programme) {
          const planInfo: GeneratedPlanInfo = { type: 'mindset', planData: result.programme, planId: '', savedToHub: false };
          setGeneratedPlans(prev => [...prev, planInfo]);
          toast({ title: '✅ Mindset Programme Ready', description: 'Review below, then save it.' });
        }
      } catch {
        toast({ title: 'Error', description: 'Failed to generate mindset programme', variant: 'destructive' });
      } finally { setMindsetGenerating(false); }
    } else if (type === 'cardio') {
      setCardioGenerating(true);
      try {
        const defaults = { activityType: 'run', goal: 'fitness', currentLevel: 'beginner', sessionsPerWeek: 3, sessionLength: 30 };
        const params = { ...defaults, ...cardioParams };
        const result = await generateCardioProgramme(params);
        if (result?.program) {
          const planInfo: GeneratedPlanInfo = { type: 'cardio', planData: result.program, planId: '', savedToHub: false };
          setGeneratedPlans(prev => [...prev, planInfo]);
          toast({ title: '✅ Movement Programme Ready', description: 'Review your plan below, then save it to your library.' });
        }
      } catch {
        toast({ title: 'Error', description: 'Failed to generate movement programme', variant: 'destructive' });
      } finally { setCardioGenerating(false); }
    }
  }, [generateProgramme, generateMealPlan, generateMindsetProgramme, generateCardioProgramme]);

  // Context from URL params or sessionStorage
  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'programme') {
      setInput('Build me a bespoke training programme. Pull my saved profile info and ask me anything that\'s missing before you start.');
      setSearchParams({});
      return;
    }
    if (modeParam === 'meal') {
      setInput('Create a personalised meal plan for me. Use my saved profile data and ask me about any preferences or info that\'s missing.');
      setSearchParams({});
      return;
    }
    if (modeParam === 'mindset') {
      setInput('Build me a mindset programme. Pull my profile info and ask me what I want to focus on.');
      setSearchParams({});
      return;
    }
    if (modeParam === 'cardio') {
      setInput('Build me a movement/cardio programme. Pull my profile info and ask me what I want to focus on.');
      setSearchParams({});
      return;
    }
    const contextParam = searchParams.get('context');
    if (contextParam) {
      setInput(contextParam);
      setSearchParams({});
      return;
    }
    const storedContext = sessionStorage.getItem('coach_context');
    if (storedContext) {
      try {
        const context = JSON.parse(storedContext);
        let prompt = '';
        switch (context.type) {
          case 'session': prompt = `I just finished a workout session${context.name ? ` (${context.name})` : ''}. Can you give me feedback on my performance?`; break;
          case 'programme': prompt = `I'd like to discuss my training programme${context.name ? ` "${context.name}"` : ''}. `; break;
          case 'programme_request': prompt = `Build me a bespoke training programme. `; break;
          case 'meal_plan_request': prompt = `Create a meal plan for me. `; break;
          case 'exercise': prompt = `Can you review my technique for ${context.name || 'this exercise'}?`; break;
          case 'progress': prompt = `I'd like you to analyse my training progress and suggest improvements.`; break;
          case 'food_log': prompt = `Can you give me feedback on my nutrition today?`; break;
        }
        if (prompt) setInput(prompt);
      } catch (e) { console.error('Failed to parse coach context:', e); }
      finally { sessionStorage.removeItem('coach_context'); }
    }
  }, [searchParams, setSearchParams]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isGenerating || isMealPlanGenerating) return;
    if (!user) { setShowAuthModal(true); return; }
    // Mic stays on through pauses in speech (see startListening/onend) —
    // it should only stop once the user actually sends the message.
    if (isListening) stopListening();
    // Unlock audio playback on this user gesture — the coach's spoken reply
    // plays later, after the streamed response finishes, and by then it's
    // too late on iOS/mobile browsers to count as a user-initiated gesture.
    jjVoice.unlockAudio();
    sendMessage(input, { callerRole });
    setInput('');
  };

  const handleQuickAction = (prompt: string) => {
    if (!user) { setShowAuthModal(true); return; }
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleEditPlan = (plan: GeneratedPlanInfo) => { setEditingPlan(plan); setShowEditModal(true); };

  const handleSavePlanToLibrary = async (plan: GeneratedPlanInfo) => {
    const saveUserId = user!.id;
    try {
      if (plan.type === 'programme') {
        const result = await saveProgram.mutateAsync({ program: plan.planData as GeneratedProgram });
        setGeneratedPlans(prev => prev.map(p => p === plan ? { ...p, planId: result.id, savedToHub: true } : p));
        toast({
          title: '✅ Programme Saved!',
          description: 'Your programme is ready in Power → My Programmes',
          action: (
            <button
              onClick={() => navigate('/programming')}
              className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-display"
            >
              VIEW IN LIBRARY
            </button>
          ),
        });
      } else if (plan.type === 'mindset') {
        const result = await saveMindsetProgramme.mutateAsync({
          programme: {
            name: plan.planData.name || 'Unbreakable Mindset Programme',
            description: plan.planData.description,
            goal: plan.planData.goal,
            duration_weeks: plan.planData.durationWeeks || 4,
            daily_minutes: plan.planData.dailyMinutes || 15,
            focus_areas: plan.planData.focusAreas || [],
            programme_data: plan.planData,
          },
        });
        setGeneratedPlans(prev => prev.map(p => p === plan ? { ...p, planId: result.id, savedToHub: true } : p));
        toast({
          title: '✅ Mindset Programme Saved!',
          description: 'View it in Mindset → Programmes',
          action: (
            <button
              onClick={() => navigate('/mindset')}
              className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-display"
            >
              VIEW IN LIBRARY
            </button>
          ),
        });
      } else if (plan.type === 'cardio') {
        const result = await saveCardioProgram.mutateAsync({ program: plan.planData });
        setGeneratedPlans(prev => prev.map(p => p === plan ? { ...p, planId: result.id, savedToHub: true } : p));
        toast({
          title: '✅ Movement Programme Saved!',
          description: 'View it in Movement → My Programmes',
          action: (
            <button
              onClick={() => navigate('/tracker/my-programmes')}
              className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-display"
            >
              VIEW IN LIBRARY
            </button>
          ),
        });
      } else {
        const { data: savedPlan, error } = await supabase
          .from('meal_plans')
          .insert({ user_id: saveUserId, name: plan.planData.planName || 'Unbreakable Meal Plan', description: plan.planData.overview, is_active: false })
          .select()
          .single();
        if (error) throw error;

        const planItems: any[] = [];
        for (const day of plan.planData.days || []) {
          const addMeal = (meal: any, mealType: string) => {
            if (!meal) return;
            planItems.push({ user_id: saveUserId, meal_plan_id: savedPlan.id, day_of_week: (day.dayNumber || 1) - 1, meal_type: mealType, food_name: meal.name, recipe_id: meal.recipeId || null, calories: meal.calories, protein_g: meal.protein, carbs_g: meal.carbs, fat_g: meal.fat, notes: meal.prepNotes || null });
          };
          addMeal(day.meals?.breakfast, 'breakfast');
          addMeal(day.meals?.lunch, 'lunch');
          addMeal(day.meals?.dinner, 'dinner');
          for (const snack of day.meals?.snacks || []) addMeal(snack, 'snack');
        }
        if (planItems.length > 0) await supabase.from('meal_plan_items').insert(planItems);

        queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
        setGeneratedPlans(prev => prev.map(p => p === plan ? { ...p, planId: savedPlan.id, savedToHub: true } : p));
        toast({
          title: '✅ Meal Plan Saved!',
          description: 'View it in Fuel → My Meal Plans',
          action: (
            <button
              onClick={() => navigate('/fuel')}
              className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-display"
            >
              VIEW IN LIBRARY
            </button>
          ),
        });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save plan. Please try again.', variant: 'destructive' });
    }
  };

  const handleSaveEditedPlan = async (editedPlanData: any) => {
    if (!editingPlan) return;
    try {
      if (editingPlan.savedToHub && editingPlan.planId) {
        if (editingPlan.type === 'programme') {
          await updateProgram.mutateAsync({ programId: editingPlan.planId, programData: editedPlanData as GeneratedProgram });
        } else if (editingPlan.type === 'mindset') {
          await supabase
            .from('mindset_programmes')
            .update({
              name: editedPlanData.name || editedPlanData.planName,
              description: editedPlanData.description || editedPlanData.overview,
              goal: editedPlanData.goal,
              duration_weeks: editedPlanData.durationWeeks || editedPlanData.weeks?.length || 4,
              daily_minutes: editedPlanData.dailyMinutes || 15,
              focus_areas: editedPlanData.focusAreas || [],
              programme_data: editedPlanData,
              updated_at: new Date().toISOString(),
            })
            .eq('id', editingPlan.planId)
            .eq('user_id', user!.id);
          queryClient.invalidateQueries({ queryKey: ['mindset-programmes'] });
        } else if (editingPlan.type === 'cardio') {
          await supabase
            .from('cardio_programs')
            .update({
              name: editedPlanData.programName || editedPlanData.name,
              overview: editedPlanData.overview,
              program_data: JSON.parse(JSON.stringify(editedPlanData)),
              updated_at: new Date().toISOString(),
            })
            .eq('id', editingPlan.planId)
            .eq('user_id', user!.id);
          queryClient.invalidateQueries({ queryKey: ['cardio-programs'] });
        } else {
          await updateMealPlan.mutateAsync({ id: editingPlan.planId, name: editedPlanData.planName, description: editedPlanData.overview });
        }
      } else {
        // Plan was never persisted (generation didn't save it to the hub).
        // Create it now instead of silently discarding the user's edits.
        if (editingPlan.type === 'programme') {
          const saved = await saveProgram.mutateAsync({ program: editedPlanData as GeneratedProgram });
          editingPlan.planId = saved?.id;
          editingPlan.savedToHub = true;
        } else if (editingPlan.type === 'mindset') {
          const { data, error } = await supabase
            .from('mindset_programmes')
            .insert({
              user_id: user!.id,
              name: editedPlanData.name || editedPlanData.planName,
              description: editedPlanData.description || editedPlanData.overview,
              goal: editedPlanData.goal,
              duration_weeks: editedPlanData.durationWeeks || editedPlanData.weeks?.length || 4,
              daily_minutes: editedPlanData.dailyMinutes || 15,
              focus_areas: editedPlanData.focusAreas || [],
              programme_data: editedPlanData,
            })
            .select()
            .single();
          if (error) throw error;
          editingPlan.planId = data?.id;
          editingPlan.savedToHub = true;
          queryClient.invalidateQueries({ queryKey: ['mindset-programmes'] });
        } else if (editingPlan.type === 'cardio') {
          const saved = await saveCardioProgram.mutateAsync({ program: editedPlanData });
          editingPlan.planId = saved?.id;
          editingPlan.savedToHub = true;
        } else {
          const saved = await createMealPlan.mutateAsync({
            plan: {
              name: editedPlanData.planName || 'AI Meal Plan',
              description: editedPlanData.overview,
              is_active: false,
            } as any,
          });
          editingPlan.planId = saved?.id;
          editingPlan.savedToHub = true;
        }
      }
      setGeneratedPlans(prev => prev.map(p => p.planId === editingPlan.planId || p === editingPlan ? { ...p, planData: editedPlanData } : p));
      setShowEditModal(false); setEditingPlan(null);
      toast({ title: '✅ Plan Updated!', description: 'Your changes have been applied.' });
    } catch (error) {
      console.error('Failed to save plan:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save changes. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleViewInHub = (plan: GeneratedPlanInfo) => {
    navigate(
      plan.type === 'programme' ? '/programming'
      : plan.type === 'mindset' ? '/mindset'
      : plan.type === 'cardio' ? '/tracker/my-programmes'
      : '/fuel'
    );
  };

  const isAnyGenerating = isGenerating || isMealPlanGenerating || mindsetGenerating || cardioGenerating;
  const enrichedMessages: MessageWithMedia[] = messages.map((msg) => {
    if (msg.role === 'assistant') {
      const cleanContent = msg.content
        .replace(/\[BUILD_PROGRAMME\](\{.*\})?/g, '')
        .replace(/\[BUILD_MEAL_PLAN\](\{.*\})?/g, '')
        .replace(/\[BUILD_MOVEMENT\](\{.*\})?/g, '')
        .replace(/\[BUILD_MINDSET\](\{.*\})?/g, '')
        .replace(/\[BUILD_MINDSET_PROGRAMME\](\{.*\})?/g, '')
        .trim();
      return { ...msg, content: cleanContent };
    }
    return msg;
  });

  const hasMessages = enrichedMessages.length > 0;

  /* ── Voice Input (Speech-to-Text) ──
   * `continuous = true` still gets auto-ended by the browser after a short
   * pause in speech (varies by browser/OS) — that's not the user asking to
   * stop, so we track the user's actual intent separately (shouldListenRef)
   * and, if the engine ends on its own while the user still wants to be
   * listening, transparently start a fresh recognition session. The mic
   * only truly turns off when the user presses the mic button again or
   * hits send. */
  const shouldListenRef = useRef(false);
  const voiceBaseTextRef = useRef('');
  voiceBaseTextRef.current = input;

  const createRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: 'Voice not supported', description: 'Your browser doesn\'t support speech recognition. Try Chrome or Safari.', variant: 'destructive' });
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    const baseText = voiceBaseTextRef.current;

    // Rebuild the final + interim transcript from scratch on every event,
    // reading the whole event.results list rather than incrementally
    // appending from event.resultIndex (some browsers don't advance
    // resultIndex reliably in continuous mode).
    //
    // That alone isn't enough: some browsers (notably mobile Safari) mark
    // several GROWING RESTATEMENTS of the same utterance as isFinal — e.g.
    // "there" / "there is" / "there is still" can each arrive as their own
    // isFinal:true result. Blindly concatenating every isFinal entry turns
    // that into "there there is there is still ..." — the snowballing echo.
    // Instead, when the next final entry is just a longer version of the
    // one we're already holding, REPLACE it rather than appending; when
    // it's a shorter/stale restatement of what we already have, ignore it;
    // only a genuinely distinct segment gets appended.
    recognition.onresult = (event: any) => {
      let finalText = '';
      let interimText = '';
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.trim();
        if (event.results[i].isFinal) {
          if (!transcript) continue;
          const finalLower = finalText.toLowerCase();
          const transcriptLower = transcript.toLowerCase();
          if (!finalText) {
            finalText = transcript;
          } else if (transcriptLower.startsWith(finalLower)) {
            finalText = transcript; // longer restatement of the same segment
          } else if (finalLower.startsWith(transcriptLower)) {
            // shorter/stale restatement of what we already have — ignore
          } else {
            finalText += ' ' + transcript; // genuinely new, distinct segment
          }
        } else {
          interimText += (interimText ? ' ' : '') + transcript;
        }
      }
      const combined = [baseText, finalText, interimText].filter(Boolean).join(' ');
      setInput(combined);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      if (shouldListenRef.current) {
        // The engine stopped on its own (silence timeout) but the user
        // hasn't pressed stop or send — seamlessly restart so the mic
        // effectively stays on until they do.
        const next = createRecognition();
        if (next) {
          recognitionRef.current = next;
          next.start();
          return;
        }
      }
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      // 'aborted' fires on a deliberate stop; 'no-speech' fires constantly
      // any time the mic goes quiet for a beat — neither is a real error.
      // Both are followed by onend, which restarts us if the user still
      // wants to be listening, so don't tear down intent here for those.
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        shouldListenRef.current = false;
        recognitionRef.current = null;
        setIsListening(false);
        toast({ title: 'Voice error', description: `Mic error: ${event.error}. Try again.`, variant: 'destructive' });
      }
    };

    return recognition;
  }, [toast]);

  const startListening = useCallback(() => {
    const recognition = createRecognition();
    if (!recognition) return;
    shouldListenRef.current = true;
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [createRecognition]);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  /* Coach chat is text-out only — mic input stays, spoken replies removed. */

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <PaywallGate feature="ai_coach_basic">
    <SwipeNavigationWrapper>
      <div className="min-h-screen flex flex-col" >
        {/* ─── Header ─── */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2">
                <ThemedLogo />
                <span className="font-display text-sm tracking-wider text-foreground hidden sm:block">UNBREAKABLE</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
            </div>
          </div>
        </header>

        <div className="pt-[60px]">
          <PageNavigation />
        </div>

        {/* ─── Main area: sidebar + chat ─── */}
        <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 108px)' }}>
          {user && (
            <ConversationSidebar
              conversations={conversations}
              currentConversationId={currentConversationId}
              onSelect={loadConversation}
              onDelete={deleteConversation}
              onNewConversation={() => { startNewConversation(); setGeneratedPlans([]); }}
              isOpen={sidebarOpen}
              onToggle={() => setSidebarOpen(!sidebarOpen)}
            />
          )}

          {/* ─── Chat Panel ─── */}
          <div className="flex-1 flex flex-col min-w-0 relative">
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0"
              style={{ background: 'rgba(15,15,15,0.8)' }}>
              {user && !sidebarOpen && (
                <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground">
                  <PanelLeftOpen className="w-4 h-4" />
                </button>
              )}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center"
                  style={{ boxShadow: '0 0 10px rgba(255,85,0,0.15)' }}>
                  <Flame className="w-3.5 h-3.5 text-primary" />
                </div>
                {currentConversationId ? (
                  <h2 className="font-display text-xs tracking-wider text-foreground truncate">
                    {conversations.find(c => c.id === currentConversationId)?.title || 'CONVERSATION'}
                  </h2>
                ) : (
                  <CoachNameEditor coachName={coachName} onSave={setCoachName} variant="inline" />
                )}
              </div>
              {currentConversationId && (
                <button
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all text-[10px] font-display tracking-wider"
                  onClick={() => { if (window.confirm('Delete this conversation?')) deleteConversation(currentConversationId); }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">DELETE</span>
                </button>
              )}
              <VoiceSettingsSheet />
              <ProfileButton />
            </div>

            {/* ─── Messages area ─── */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
              {!hasMessages ? (
                /* ─── Welcome / Empty State ─── */
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center mx-auto mb-5"
                      style={{ boxShadow: '0 0 35px rgba(255,85,0,0.15)' }}>
                      <Flame className="w-8 h-8 text-primary" style={{ filter: 'drop-shadow(0 0 8px rgba(255,85,0,0.5))' }} />
                    </div>
                    <CoachNameEditor coachName={coachName} onSave={setCoachName} variant="hero" />
                    <p className="text-muted-foreground max-w-sm mx-auto text-sm leading-relaxed mt-3">
                      Your personal coach for training, nutrition, mindset, and beyond.
                      Ask anything — become{' '}
                      <span className="text-primary font-semibold">UNBREAKABLE</span>.
                    </p>
                  </div>

                  {/* Smart Prompt Chips */}
                  <SmartPromptChips onSelect={handleQuickAction} disabled={isLoading || isAnyGenerating} />
                </div>
              ) : (
                /* ─── Chat Messages ─── */
                <div className="max-w-3xl mx-auto">
                  {enrichedMessages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}

                  {/* Loading states */}
                  {isLoading && enrichedMessages[enrichedMessages.length - 1]?.role === 'user' && !isGenerating && (
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                        <Flame className="w-4 h-4 text-primary" />
                      </div>
                      <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-card border border-border">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">{coachName} is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Programme generating */}
                  {(isGenerating || programmeGenerating) && (
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                      </div>
                      <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-primary/5 border border-primary/20"
                        style={{ boxShadow: '0 0 20px rgba(255,85,0,0.05)' }}>
                        <span className="text-sm font-display text-primary">Building your programme...</span>
                        <p className="text-xs text-muted-foreground mt-0.5">Won't be a min 💪</p>
                        <p className="text-[11px] text-muted-foreground/80 mt-1.5 leading-relaxed">
                          Don't refresh — your coach will update here when it's ready. You can read it
                          through and edit it before it saves to your library.
                        </p>
                      </div>
                    </div>
                  )}

                  {mealPlanGenerating && (
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
                        <UtensilsCrossed className="w-4 h-4 text-primary animate-pulse" />
                      </div>
                      <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-primary/5 border border-primary/20">
                        <span className="text-sm font-display text-primary">Building your meal plan...</span>
                        <p className="text-xs text-muted-foreground mt-0.5">Won't be a min 💪</p>
                        <p className="text-[11px] text-muted-foreground/80 mt-1.5 leading-relaxed">
                          Don't refresh — your coach will update here when it's ready. You can read it
                          through and edit it before it saves to your library.
                        </p>
                      </div>
                    </div>
                  )}

                  {mindsetGenerating && (
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
                        <Brain className="w-4 h-4 text-primary animate-pulse" />
                      </div>
                      <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-primary/5 border border-primary/20">
                        <span className="text-sm font-display text-primary">Building your mindset programme...</span>
                        <p className="text-xs text-muted-foreground mt-0.5">Won't be a min 💪</p>
                        <p className="text-[11px] text-muted-foreground/80 mt-1.5 leading-relaxed">
                          Don't refresh — your coach will update here when it's ready. You can read it
                          through and edit it before it saves to your library.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Generated Plan Cards */}
                  {generatedPlans.length > 0 && (
                    <div className="space-y-4 mt-4 pt-4 border-t border-border">
                      {generatedPlans.map((plan, idx) => (
                        <PlanDisplayCard
                          key={plan.planId || `pending-${idx}`}
                          planType={plan.type}
                          planData={plan.planData}
                          planId={plan.planId}
                          savedToHub={plan.savedToHub}
                          onEdit={() => handleEditPlan(plan)}
                          onViewInHub={() => handleViewInHub(plan)}
                          onSaveToLibrary={() => handleSavePlanToLibrary(plan)}
                        />
                      ))}
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            {/* ─── Token Warning ─── */}
            {tokenBalance !== null && tokenBalance <= 2 && (
              <div className={`flex-shrink-0 px-4 py-2 text-center text-xs font-display ${
                tokenBalance <= 0
                  ? 'bg-primary/10 text-primary border-t border-primary/20'
                  : 'bg-primary/10 text-primary border-t border-primary/20'
              }`}>
                {tokenBalance <= 0 ? (
                  <>No tokens remaining — <Link to="/ai-tokens" className="underline font-bold">upgrade for more</Link></>
                ) : (
                  <>{tokenBalance.toFixed(1)} token{tokenBalance !== 1 ? 's' : ''} remaining</>
                )}
              </div>
            )}

            {/* ─── Input ─── */}
            <div className="flex-shrink-0 border-t border-border p-4" style={{ background: 'rgba(15,15,15,0.8)' }}>
              <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder={isListening ? '🎙️ Listening... speak now' : 'Ask your coach anything...'}
                      rows={1}
                      disabled={isLoading || isAnyGenerating}
                      className={`w-full resize-none rounded-xl border bg-card
                        px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground
                        focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20
                        disabled:opacity-40 transition-all ${
                          isListening ? 'border-primary/60 ring-1 ring-primary/30' : 'border-border'
                        }`}
                    />
                  </div>

                  {/* Mic button */}
                  <button
                    type="button"
                    onClick={toggleListening}
                    disabled={isLoading || isAnyGenerating}
                    className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all ${
                      isListening
                        ? 'bg-red-500/20 border border-red-500 text-red-400 animate-pulse'
                        : 'border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground disabled:opacity-30'
                    }`}
                    title={isListening ? 'Stop listening' : 'Voice input'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {/* Send button */}
                  <button
                    type="submit"
                    disabled={isLoading || isAnyGenerating || !input.trim()}
                    className="h-11 w-11 rounded-xl bg-primary hover:bg-primary/80 text-white
                      flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ boxShadow: input.trim() ? '0 0 15px rgba(255,85,0,0.3)' : 'none' }}
                  >
                    {isLoading || isAnyGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* ─── Build Confirmation Dialog ─── */}
        <AnimatePresence>
          {pendingBuild && (
            <BuildConfirmDialog
              type={pendingBuild.type}
              onConfirm={() => {
                const { type, chatContext, cardioParams } = pendingBuild;
                setPendingBuild(null);
                executeBuild(type, chatContext, cardioParams);
              }}
              onCancel={() => setPendingBuild(null)}
            />
          )}
        </AnimatePresence>

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        {editingPlan && (
          <AIPlanReviewModal
            isOpen={showEditModal}
            onClose={() => { setShowEditModal(false); setEditingPlan(null); }}
            planType={editingPlan.type}
            planData={editingPlan.planData}
            onSave={handleSaveEditedPlan}
            isSaving={updateProgram.isPending || updateMealPlan.isPending || saveCardioProgram.isPending}
          />
        )}
      </div>
    </SwipeNavigationWrapper>
    </PaywallGate>
  );
}

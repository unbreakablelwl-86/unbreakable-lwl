import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Send, MessageSquarePlus, Trash2, Loader2, Flame, Sparkles, Video, UtensilsCrossed, PanelLeftClose, PanelLeftOpen, Dumbbell, TrendingUp, BarChart3, Brain, Zap, Heart, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NavigationDrawer } from '@/components/NavigationDrawer';
import { ThemeToggle } from '@/components/hub/ThemeToggle';
import { UnifiedFooter } from '@/components/UnifiedFooter';
import { PageNavigation, SwipeNavigationWrapper } from '@/components/PageNavigation';
import { AuthModal } from '@/components/tracker/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { useHelpChat, Message } from '@/hooks/useHelpChat';
import { ThemedLogo } from '@/components/ThemedLogo';
import { ChatMediaUpload, ChatMedia } from '@/components/coaching/ChatMediaUpload';
import { ProfileButton } from '@/components/coaching/ProfileButton';
import { PlanDisplayCard } from '@/components/coaching/PlanDisplayCard';

import { useAIPreferences } from '@/hooks/useAIPreferences';
import { useCoachName } from '@/hooks/useCoachName';
import { CoachNameEditor } from '@/components/coaching/CoachNameEditor';
import { AIPlanReviewModal } from '@/components/ai/AIPlanReviewModal';
import { useAIProgramme } from '@/hooks/useAIProgramme';
import { useAIMealPlan } from '@/hooks/useAIMealPlan';
import { useTrainingPrograms } from '@/hooks/useTrainingPrograms';
import { useMindsetProgrammes } from '@/hooks/useMindsetProgrammes';
import { useMealPlans } from '@/hooks/useMealPlans';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/hooks/use-toast';
import { GeneratedProgram } from '@/lib/programTypes';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface MessageWithMedia extends Message {
  media?: ChatMedia;
}

interface GeneratedPlanInfo {
  type: 'programme' | 'meal_plan' | 'mindset';
  planData: any;
  planId: string;
  savedToHub: boolean;
  messageId?: string;
}

// ─── Neon Glass Message Bubble ───────────────────────────────────────────────
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
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-5 animate-fade-in`}>
      {/* Coach avatar */}
      {!isUser && (
        <div className="flex-shrink-0 mr-3 mt-1">
          <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center neon-border-subtle">
            <Flame className="w-4 h-4 text-primary" />
          </div>
        </div>
      )}
      <div className={`max-w-[80%]`}>
        <div className={`rounded-2xl px-5 py-4 backdrop-blur-md ${
          isUser
            ? 'bg-primary/15 border border-primary/30 rounded-br-md'
            : 'bg-card/60 border border-primary/20 rounded-bl-md shadow-[0_0_15px_hsl(24_100%_50%/0.08)]'
        }`}>
          {message.media && (
            <div className="mb-3">
              {message.media.type === 'image' ? (
                <img src={message.media.url} alt="Attached" className="rounded-xl max-h-52 object-cover" />
              ) : (
                <video src={message.media.url} controls className="rounded-xl max-h-52 w-full" />
              )}
            </div>
          )}
          <div className={`text-sm leading-relaxed ${isUser ? 'text-foreground' : 'text-foreground/90'}`}>
            {isUser ? message.content : formatContent(message.content)}
          </div>
        </div>
        <div className={`flex items-center gap-2 mt-1.5 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <p className="text-[11px] text-muted-foreground">
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Quick Action Tiles ──────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { 
    icon: Dumbbell, label: 'POWER', 
    description: 'Build a training programme',
    greeting: "Let's build your training programme. Tell me about your goals, experience level, and how many days per week you can train.",
  },
  { 
    icon: TrendingUp, label: 'MOVEMENT', 
    description: 'Build a cardio & mobility plan',
    greeting: "Let's build your movement plan. What's your current cardio fitness like, and what are you training towards — a race, general fitness, or fat loss?",
  },
  { 
    icon: UtensilsCrossed, label: 'FUEL', 
    description: 'Create a nutrition plan',
    greeting: "Let's create your nutrition plan. What's your current goal — fat loss, muscle gain, or maintenance? How many meals per day works for you?",
  },
  { 
    icon: Brain, label: 'MINDSET', 
    description: 'Build a mindset & recovery routine',
    greeting: "Let's build your mindset programme. What areas are you looking to improve — focus, stress management, sleep, or mental resilience?",
  },
  { 
    icon: MessageCircle, label: 'GENERAL', 
    description: 'Just chat & catch up',
    greeting: "Hey! I'm here whenever you need me. What's on your mind today?",
  },
];

function QuickActionTiles({ onSelect, selectedTab, onTabSelect, disabled }: { 
  onSelect: (prompt: string) => void; 
  selectedTab: string | null;
  onTabSelect: (label: string) => void;
  disabled?: boolean; 
}) {
  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* Tab Row */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {QUICK_ACTIONS.map(({ icon: Icon, label }) => {
          const isSelected = selectedTab === label;
          return (
            <button
              key={label}
              onClick={() => onTabSelect(label)}
              disabled={disabled}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-display text-xs tracking-wider
                transition-all duration-300 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed
                ${isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_20px_hsl(24_100%_50%/0.4)]'
                  : 'bg-card/50 text-muted-foreground border-primary/20 hover:border-primary/50 hover:text-foreground hover:bg-primary/10'
                }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-primary-foreground' : 'text-primary'}`} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Selected Tab Content */}
      {selectedTab && (
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="p-6 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent
            shadow-[0_0_25px_hsl(24_100%_50%/0.08)]"
        >
          {(() => {
            const action = QUICK_ACTIONS.find(a => a.label === selectedTab)!;
            const ActionIcon = action.icon;
            return (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto
                  shadow-[0_0_20px_hsl(24_100%_50%/0.25)]">
                  <ActionIcon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-lg tracking-wider text-foreground mb-1">{action.label}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed italic">"{action.greeting}"</p>
                <button
                  onClick={() => onSelect(action.greeting)}
                  disabled={disabled}
                  className="mt-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-display text-sm tracking-wider
                    hover:shadow-[0_0_20px_hsl(24_100%_50%/0.4)] transition-all duration-300
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  START CONVERSATION
                </button>
              </div>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}

// ─── Conversation Sidebar ────────────────────────────────────────────────────
function ConversationSidebar({
  conversations,
  currentConversationId,
  onSelect,
  onDelete,
  onNewConversation,
  isOpen,
  onToggle,
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
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40" onClick={onToggle} />
      )}
      <aside className={`
        ${isMobile ? 'fixed left-0 top-0 bottom-0 z-50' : 'relative'}
        ${isOpen ? (isMobile ? 'w-72' : 'w-72') : 'w-0'}
        bg-card/95 backdrop-blur-md border-r border-primary/15
        transition-all duration-300 overflow-hidden flex flex-col
        ${isMobile && !isOpen ? 'pointer-events-none' : ''}
      `}>
        {/* Sidebar header */}
        <div className="p-4 border-b border-primary/20 flex items-center justify-between flex-shrink-0">
          <h2 className="font-display text-sm tracking-wider text-primary whitespace-nowrap">CONVERSATIONS</h2>
          <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8 flex-shrink-0">
            <PanelLeftClose className="w-4 h-4" />
          </Button>
        </div>

        {/* New conversation */}
        <div className="p-3 flex-shrink-0">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-primary/30 hover:bg-primary/10 text-sm"
            onClick={onNewConversation}
          >
            <MessageSquarePlus className="w-4 h-4 text-primary" />
            <span className="whitespace-nowrap">New Conversation</span>
          </Button>
        </div>

        {/* Conversation list */}
        <ScrollArea className="flex-1 px-2 pb-4">
          {conversations.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6 px-3">No conversations yet. Start one below.</p>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                    currentConversationId === conv.id
                      ? 'bg-primary/15 border-primary/40 shadow-[0_0_12px_hsl(24_100%_50%/0.15)]'
                      : 'border-primary/10 hover:border-primary/30 hover:bg-primary/5'
                  }`}
                  onClick={() => onSelect(conv.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conv.title || 'Untitled'}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-all flex-shrink-0"
                    onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </aside>
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Help() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [selectedMedia, setSelectedMedia] = useState<ChatMedia | null>(null);
  const [messagesWithMedia, setMessagesWithMedia] = useState<Map<string, ChatMedia>>(new Map());
  const [programmeGenerating, setProgrammeGenerating] = useState(false);
  const [mealPlanGenerating, setMealPlanGenerating] = useState(false);
  const [mindsetGenerating, setMindsetGenerating] = useState(false);
  const [generatedPlans, setGeneratedPlans] = useState<GeneratedPlanInfo[]>([]);
  const [editingPlan, setEditingPlan] = useState<GeneratedPlanInfo | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedChatTab, setSelectedChatTab] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { preferences: aiPrefs } = useAIPreferences();
  const { coachName, setCoachName } = useCoachName();

  const { user } = useAuth();
  const {
    messages, conversations, currentConversationId, isLoading,
    conversationsLoading, sendMessage, loadConversation,
    deleteConversation, startNewConversation,
  } = useHelpChat();

  const { generateProgramme, detectProgrammeRequest, isGenerating } = useAIProgramme();
  const { generateMealPlan, detectMealPlanRequest, isGenerating: isMealPlanGenerating } = useAIMealPlan();
  const { updateProgram, saveProgram } = useTrainingPrograms();
  const { updateMealPlan } = useMealPlans();
  const { saveProgramme: saveMindsetProgramme, generateProgramme: generateMindsetProgramme } = useMindsetProgrammes();
  const { isDev, isCoach, role } = useUserRole();
  const callerRole = (isDev ? 'dev' : isCoach ? 'coach' : 'user') as 'dev' | 'coach' | 'user';
  const queryClient = useQueryClient();

  const lastProcessedMsgRef = useRef<string | null>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Detect build tags in completed assistant messages
  useEffect(() => {
    if (isLoading || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== 'assistant' || lastMsg.id === lastProcessedMsgRef.current) return;
    lastProcessedMsgRef.current = lastMsg.id;

    const content = lastMsg.content;
    const programmeMatch = content.match(/\[BUILD_PROGRAMME\](\{.*\})?/);
    const mealPlanMatch = content.match(/\[BUILD_MEAL_PLAN\](\{.*\})?/);
    const mindsetMatch = content.match(/\[BUILD_MINDSET_PROGRAMME\](\{.*\})?/);

    if (programmeMatch) {
      const chatContext = messages.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n');
      setProgrammeGenerating(true);
      generateProgramme('Build a programme based on our conversation', { chatContext }).then(result => {
        setProgrammeGenerating(false);
        if (result?.program) {
          const planInfo: GeneratedPlanInfo = { type: 'programme', planData: result.program, planId: '', savedToHub: false };
          setGeneratedPlans(prev => [...prev, planInfo]);
          toast({ title: 'Programme Ready for Review', description: 'Review your plan below, then save it to your library.' });
        }
      });
    } else if (mealPlanMatch) {
      const chatContext = messages.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n');
      setMealPlanGenerating(true);
      generateMealPlan('Build a meal plan based on our conversation', 'full_plan', { chatContext }).then(result => {
        setMealPlanGenerating(false);
        if (result?.plan) {
          const planInfo: GeneratedPlanInfo = { type: 'meal_plan', planData: result.plan, planId: '', savedToHub: false };
          setGeneratedPlans(prev => [...prev, planInfo]);
          toast({ title: 'Meal Plan Ready for Review', description: 'Review your plan below, then save it to your library.' });
        }
      });
    } else if (mindsetMatch) {
      const chatContext = messages.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n');
      setMindsetGenerating(true);
      generateMindsetProgramme('Build a mindset programme based on our conversation', chatContext).then(result => {
        setMindsetGenerating(false);
        if (result?.programme) {
          const planInfo: GeneratedPlanInfo = { type: 'mindset', planData: result.programme, planId: '', savedToHub: false };
          setGeneratedPlans(prev => [...prev, planInfo]);
          toast({ title: 'Mindset Programme Ready', description: 'Review your programme below, then save it.' });
        }
      }).catch(() => {
        setMindsetGenerating(false);
        toast({ title: 'Error', description: 'Failed to generate mindset programme', variant: 'destructive' });
      });
    }
  }, [messages, isLoading]);

  // Context from URL params or sessionStorage
  useEffect(() => {
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
          case 'programme': prompt = `I'd like to discuss my training programme${context.name ? ` \"${context.name}\"` : ''}. `; break;
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

  // ─── Handlers (unchanged business logic) ─────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedMedia) || isLoading || isGenerating || isMealPlanGenerating) return;
    if (!user) { setShowAuthModal(true); return; }

    let messageContent = input;

    if (selectedMedia) {
      const mediaContext = selectedMedia.type === 'video'
        ? `[Attached video: ${selectedMedia.name}]`
        : `[Attached image: ${selectedMedia.name}]`;
      messageContent = messageContent ? `${messageContent}\n\n${mediaContext}` : `Please review this ${selectedMedia.type}: ${selectedMedia.name}`;
    }
    const mediaAttachments = selectedMedia ? [{ type: selectedMedia.type, url: selectedMedia.url, name: selectedMedia.name }] : undefined;

    if (selectedMedia) {
      setMessagesWithMedia(prev => new Map(prev).set(`content:${messageContent}`, selectedMedia));
    }
    sendMessage(messageContent, {
      mediaAttachments,
      callerRole,
    });
    setInput(''); setSelectedMedia(null);
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
      } else if (plan.type === 'mindset') {
        const result = await saveMindsetProgramme.mutateAsync({
          programme: {
            name: plan.planData.name || 'AI Mindset Programme',
            description: plan.planData.description,
            goal: plan.planData.goal,
            duration_weeks: plan.planData.durationWeeks || 4,
            daily_minutes: plan.planData.dailyMinutes || 15,
            focus_areas: plan.planData.focusAreas || [],
            programme_data: plan.planData,
          },
        });
        setGeneratedPlans(prev => prev.map(p => p === plan ? { ...p, planId: result.id, savedToHub: true } : p));
        toast({ title: 'Mindset Programme Saved!', description: 'View it in Mindset → My Programmes' });
      } else {
        // Save meal plan via supabase directly — use athlete's ID if building for client
        const { data: savedPlan, error } = await supabase
          .from('meal_plans')
          .insert({ user_id: saveUserId, name: plan.planData.planName || 'AI Meal Plan', description: plan.planData.overview, is_active: false })
          .select()
          .single();
        if (error) throw error;
        
        // Save items
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
        toast({ title: 'Meal Plan Saved!', description: 'View it in Fuel → My Meal Plans' });
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
          // For mindset, update the programme_data in the database
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
        } else {
          await updateMealPlan.mutateAsync({ id: editingPlan.planId, name: editedPlanData.planName, description: editedPlanData.overview });
        }
      }
      setGeneratedPlans(prev => prev.map(p => p.planId === editingPlan.planId || p === editingPlan ? { ...p, planData: editedPlanData } : p));
      setShowEditModal(false); setEditingPlan(null);
      toast({ title: 'Plan Updated!', description: 'Your changes have been applied.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save changes. Please try again.', variant: 'destructive' });
    }
  };
  const handleViewInHub = (plan: GeneratedPlanInfo) => { navigate(plan.type === 'programme' ? '/programming' : plan.type === 'mindset' ? '/mindset' : '/fuel'); };

  const isAnyGenerating = isGenerating || isMealPlanGenerating || mindsetGenerating;
  const enrichedMessages: MessageWithMedia[] = messages.map((msg) => {
    // Strip build tags from assistant messages
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
    const mediaEntry = messagesWithMedia.get(`content:${msg.content}`);
    return { ...msg, media: mediaEntry };
  });

  const hasMessages = enrichedMessages.length > 0;

  // Handle textarea auto-resize and Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <SwipeNavigationWrapper>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-primary/15">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link to="/" className="flex items-center gap-3">
                <ThemedLogo />
                <span className="font-display text-lg tracking-wide text-foreground hidden sm:block">UNBREAKABLE</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <NavigationDrawer />
            </div>
          </div>
        </header>

        <div className="pt-[72px]">
          <PageNavigation />
        </div>

        {/* Main content area: sidebar + chat */}
        <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
          {/* Conversation Sidebar */}
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

          {/* Chat Panel */}
          <div className="flex-1 flex flex-col min-w-0 relative">
            {/* Chat panel header bar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-primary/15 bg-card/30 backdrop-blur-sm flex-shrink-0">
              {user && !sidebarOpen && (
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="h-8 w-8">
                  <PanelLeftOpen className="w-4 h-4" />
                </Button>
              )}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Flame className="w-5 h-5 text-primary flex-shrink-0" />
                {currentConversationId ? (
                  <h2 className="font-display text-sm tracking-wider text-foreground truncate">
                    {conversations.find(c => c.id === currentConversationId)?.title || 'CONVERSATION'}
                  </h2>
                ) : (
                  <CoachNameEditor coachName={coachName} onSave={setCoachName} variant="inline" />
                )}
              </div>
              {currentConversationId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    if (currentConversationId) {
                      deleteConversation(currentConversationId);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <ProfileButton />
            </div>




            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
              {!hasMessages ? (
                /* ─── Welcome / Empty State ─── */
                <div className="flex flex-col items-center justify-center h-full animate-fade-in">
                  {/* Hero */}
                  <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-6
                      shadow-[0_0_30px_hsl(24_100%_50%/0.2)] neon-pulse">
                      <Flame className="w-8 h-8 text-primary" />
                    </div>
                    <CoachNameEditor coachName={coachName} onSave={setCoachName} variant="hero" />
                    <p className="text-muted-foreground max-w-md mx-auto text-sm md:text-base leading-relaxed mt-3">
                      Your personal coach for training, nutrition, mindset, and beyond.
                      Ask anything — become{' '}
                      <span className="text-primary font-semibold">UNBREAKABLE</span>.
                    </p>
                    <p className="text-primary font-display text-lg tracking-wider mt-4 neon-glow-subtle">
                      #UNBREAKABLECOACHING
                    </p>
                  </div>

                  {/* Quick Action Tiles */}
                  <QuickActionTiles onSelect={handleQuickAction} selectedTab={selectedChatTab} onTabSelect={setSelectedChatTab} disabled={isLoading || isAnyGenerating} />
                </div>
              ) : (
                /* ─── Chat Messages ─── */
                <div className="max-w-3xl mx-auto">
                  {enrichedMessages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                  {isLoading && enrichedMessages[enrichedMessages.length - 1]?.role === 'user' && !isGenerating && (
                    <div className="flex items-center gap-3 mb-5 animate-fade-in">
                      <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center neon-border-subtle">
                        <Flame className="w-4 h-4 text-primary" />
                      </div>
                      <div className="rounded-2xl rounded-bl-md px-5 py-4 bg-card/60 border border-primary/20 backdrop-blur-md">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">{coachName} is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {isGenerating && (
                    <div className="flex items-center gap-3 mb-5 animate-fade-in">
                      <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center neon-border-subtle">
                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                      </div>
                      <div className="rounded-2xl rounded-bl-md px-5 py-4 bg-primary/10 border border-primary/30 backdrop-blur-md shadow-[0_0_20px_hsl(24_100%_50%/0.1)]">
                        <span className="text-sm font-medium text-primary">Building your bespoke programme...</span>
                        <p className="text-xs text-muted-foreground mt-1">This takes about 15-20 seconds</p>
                      </div>
                    </div>
                  )}
                  {isMealPlanGenerating && (
                    <div className="flex items-center gap-3 mb-5 animate-fade-in">
                      <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center neon-border-subtle">
                        <UtensilsCrossed className="w-4 h-4 text-primary animate-pulse" />
                      </div>
                      <div className="rounded-2xl rounded-bl-md px-5 py-4 bg-primary/10 border border-primary/30 backdrop-blur-md shadow-[0_0_20px_hsl(24_100%_50%/0.1)]">
                        <span className="text-sm font-medium text-primary">Building your bespoke meal plan...</span>
                        <p className="text-xs text-muted-foreground mt-1">This takes about 15-20 seconds</p>
                      </div>
                    </div>
                  )}
                  {mindsetGenerating && (
                    <div className="flex items-center gap-3 mb-5 animate-fade-in">
                      <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center neon-border-subtle">
                        <Brain className="w-4 h-4 text-primary animate-pulse" />
                      </div>
                      <div className="rounded-2xl rounded-bl-md px-5 py-4 bg-primary/10 border border-primary/30 backdrop-blur-md shadow-[0_0_20px_hsl(24_100%_50%/0.1)]">
                        <span className="text-sm font-medium text-primary">Building your mindset programme...</span>
                        <p className="text-xs text-muted-foreground mt-1">This takes about 15-20 seconds</p>
                      </div>
                    </div>
                  )}
                  {/* Generated Plan Display Cards */}
                  {generatedPlans.length > 0 && (
                    <div className="space-y-4 mt-4 pt-4 border-t border-border/50">
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

            {/* ─── Input Area (pinned bottom) ─── */}
            <div className="flex-shrink-0 border-t border-border/50 bg-card/40 backdrop-blur-md p-4">
              <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                {/* Media preview */}
                {selectedMedia && (
                  <div className="mb-3 p-3 bg-muted/20 rounded-xl border border-border/50">
                    <div className="flex items-center gap-3">
                      {selectedMedia.type === 'image' ? (
                        <img src={selectedMedia.url} alt="Preview" className="w-14 h-14 object-cover rounded-lg" />
                      ) : (
                        <div className="w-14 h-14 bg-muted rounded-lg flex items-center justify-center">
                          <Video className="w-5 h-5 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{selectedMedia.name}</p>
                        <p className="text-xs text-muted-foreground">{selectedMedia.type === 'video' ? 'Video attached' : 'Image attached'}</p>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedMedia(null)}>Remove</Button>
                    </div>
                  </div>
                )}

                <div className="flex items-end gap-2">
                  {/* Media upload temporarily disabled - will rework later */}
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        // Auto-resize
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask your coach anything..."
                      rows={1}
                      disabled={isLoading || isAnyGenerating}
                      className="w-full resize-none rounded-xl border border-primary/20 bg-background/80 
                        px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground 
                        focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 
                        focus:shadow-[0_0_15px_hsl(24_100%_50%/0.1)]
                        disabled:opacity-50 transition-all"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading || isAnyGenerating || (!input.trim() && !selectedMedia)}
                    className="h-11 px-5 rounded-xl"
                  >
                    {isLoading || isAnyGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        {editingPlan && (
          <AIPlanReviewModal
            isOpen={showEditModal}
            onClose={() => { setShowEditModal(false); setEditingPlan(null); }}
            planType={editingPlan.type}
            planData={editingPlan.planData}
            onSave={handleSaveEditedPlan}
            isSaving={updateProgram.isPending || updateMealPlan.isPending}
          />
        )}
      </div>
    </SwipeNavigationWrapper>
  );
}

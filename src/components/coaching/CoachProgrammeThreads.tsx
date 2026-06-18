import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  MessageSquare, Plus, ChevronRight, Calendar, Dumbbell,
  Users, Clock, Loader2, Send, ArrowLeft, Trash2, Edit3,
  Play, Pause, CheckCircle, AlertCircle, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Thread {
  id: string;
  title: string;
  description: string;
  programme_type: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  assigned_users: string[];
  weeks: number;
  created_at: string;
  updated_at: string;
  messages: ThreadMessage[];
}

interface ThreadMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  message_type: 'text' | 'session_plan' | 'ai_suggestion' | 'schedule' | 'feedback';
  data?: any;
  created_at: string;
}

const PROGRAMME_TYPES = [
  { id: 'strength', label: 'Strength', icon: '💪' },
  { id: 'sport', label: 'Sport-Specific', icon: '⚡' },
  { id: 'rehab', label: 'Rehab', icon: '🩹' },
  { id: 'hybrid', label: 'Hybrid', icon: '🔥' },
  { id: 'nutrition', label: 'Nutrition Plan', icon: '🥗' },
  { id: 'mindset', label: 'Mindset', icon: '🧠' },
];

export function CoachProgrammeThreads() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [creating, setCreating] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  // New thread form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('strength');
  const [newWeeks, setNewWeeks] = useState('4');

  const fetchThreads = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('programme_threads')
        .select('*')
        .or(`coach_id.eq.${user.id},assigned_users.cs.{${user.id}}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setThreads(data || []);
    } catch (err) {
      console.error('Failed to fetch threads:', err);
      // Table might not exist yet, show empty state
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchThreads(); }, [fetchThreads]);

  const handleCreate = async () => {
    if (!user || !newTitle.trim()) return;
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('programme_threads')
        .insert({
          coach_id: user.id,
          title: newTitle.trim(),
          description: newDesc.trim(),
          programme_type: newType,
          weeks: parseInt(newWeeks) || 4,
          status: 'draft',
          assigned_users: [],
        })
        .select()
        .single();

      if (error) throw error;

      // Add initial AI message
      await supabase.from('programme_thread_messages').insert({
        thread_id: data.id,
        sender_id: 'ai',
        sender_name: 'Unbreakable AI',
        content: `Programme thread created: "${newTitle}". ${parseInt(newWeeks) || 4} week ${PROGRAMME_TYPES.find(t => t.id === newType)?.label || newType} plan. Start building sessions, I'll suggest progressions and periodisation as you go.`,
        message_type: 'ai_suggestion',
      });

      setThreads(prev => [{ ...data, messages: [] }, ...prev]);
      setActiveThread({ ...data, messages: [] });
      setNewTitle('');
      setNewDesc('');
      toast.success('Programme thread created');
    } catch (err) {
      console.error('Create thread error:', err);
      toast.error('Failed to create thread. The programme_threads table may need to be created.');
    } finally {
      setCreating(false);
    }
  };

  const handleSend = async () => {
    if (!user || !activeThread || !newMessage.trim()) return;
    setSending(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, username')
        .eq('id', user.id)
        .single();

      const senderName = profile?.display_name || profile?.username || 'Coach';

      const { data, error } = await supabase
        .from('programme_thread_messages')
        .insert({
          thread_id: activeThread.id,
          sender_id: user.id,
          sender_name: senderName,
          content: newMessage.trim(),
          message_type: 'text',
        })
        .select()
        .single();

      if (error) throw error;

      setActiveThread(prev => prev ? {
        ...prev,
        messages: [...(prev.messages || []), data],
      } : null);

      setNewMessage('');

      // Update thread's updated_at
      await supabase
        .from('programme_threads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeThread.id);

    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const loadMessages = async (thread: Thread) => {
    try {
      const { data } = await supabase
        .from('programme_thread_messages')
        .select('*')
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: true });

      setActiveThread({ ...thread, messages: data || [] });
    } catch {
      setActiveThread({ ...thread, messages: [] });
    }
  };

  const statusColors: Record<string, string> = {
    draft: 'text-amber-500 border-amber-500/20',
    active: 'text-emerald-500 border-emerald-500/20',
    completed: 'text-blue-500 border-blue-500/20',
    archived: 'text-muted-foreground border-border',
  };

  // Thread list view
  if (!activeThread) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm tracking-wider text-primary flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> PROGRAMME THREADS
          </h2>
          <Button
            size="sm"
            onClick={() => {
              setNewTitle('');
              setNewDesc('');
              setCreating(true);
            }}
            className="bg-primary hover:bg-primary/80 font-display tracking-wider text-xs gap-1"
          >
            <Plus className="w-3 h-3" /> NEW THREAD
          </Button>
        </div>

        {/* Create new thread form */}
        <AnimatePresence>
          {creating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="border-primary/20">
                <CardContent className="p-4 space-y-3">
                  <Input
                    placeholder="Programme name (e.g. 12 Week Powerlifting)"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="font-display"
                  />
                  <Textarea
                    placeholder="Description (goals, athlete notes, etc.)"
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    rows={2}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    {PROGRAMME_TYPES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setNewType(t.id)}
                        className={`p-2 rounded-lg text-center text-xs font-display tracking-wide transition-all ${
                          newType === t.id ? 'bg-primary/10 border border-primary text-primary' : 'bg-card border border-border text-muted-foreground hover:border-primary/30'
                        }`}
                      >
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground font-display tracking-wide">WEEKS:</label>
                    <Input
                      type="number"
                      min={1}
                      max={52}
                      value={newWeeks}
                      onChange={e => setNewWeeks(e.target.value)}
                      className="w-20"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreate}
                      disabled={!newTitle.trim()}
                      className="flex-1 bg-primary hover:bg-primary/80 font-display tracking-wider text-xs"
                    >
                      CREATE THREAD
                    </Button>
                    <Button variant="outline" onClick={() => setCreating(false)} className="text-xs">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : threads.length === 0 ? (
          <Card className="border-border">
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-display text-sm tracking-wider mb-1">NO PROGRAMME THREADS</h3>
              <p className="text-xs text-muted-foreground">Create your first thread to start building a programme.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {threads.map((thread, idx) => (
              <motion.div
                key={thread.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <button
                  onClick={() => loadMessages(thread)}
                  className="w-full rounded-xl border border-border bg-card p-4 text-left hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{PROGRAMME_TYPES.find(t => t.id === thread.programme_type)?.icon || '📋'}</span>
                        <h3 className="font-display text-sm tracking-wide text-foreground truncate group-hover:text-primary transition-colors">
                          {thread.title}
                        </h3>
                      </div>
                      {thread.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{thread.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="outline" className={`text-[9px] font-display tracking-wider ${statusColors[thread.status]}`}>
                          {thread.status.toUpperCase()}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {thread.weeks}wk
                        </span>
                        {thread.assigned_users?.length > 0 && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Users className="w-3 h-3" /> {thread.assigned_users.length}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 mt-1" />
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Active thread view (chat-like)
  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      {/* Thread header */}
      <div className="flex items-center gap-3 pb-3 border-b border-border">
        <button onClick={() => setActiveThread(null)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-sm tracking-wide truncate">{activeThread.title}</h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-[8px] font-display tracking-wider ${statusColors[activeThread.status]}`}>
              {activeThread.status.toUpperCase()}
            </Badge>
            <span className="text-[10px] text-muted-foreground">{activeThread.weeks} weeks</span>
          </div>
        </div>
        <Button size="sm" variant="outline" className="text-xs gap-1">
          <Users className="w-3 h-3" /> Assign
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3">
        {(activeThread.messages || []).map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-xl p-3 ${
              msg.message_type === 'ai_suggestion'
                ? 'bg-primary/5 border border-primary/20'
                : msg.sender_id === user?.id
                ? 'bg-primary text-white'
                : 'bg-card border border-border'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {msg.message_type === 'ai_suggestion' && <Sparkles className="w-3 h-3 text-primary" />}
                <span className={`text-[10px] font-display tracking-wider ${
                  msg.sender_id === user?.id ? 'text-white/70' : 'text-muted-foreground'
                }`}>
                  {msg.sender_name}
                </span>
                <span className={`text-[9px] ${msg.sender_id === user?.id ? 'text-white/50' : 'text-muted-foreground/60'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className={`text-sm whitespace-pre-wrap ${
                msg.sender_id === user?.id ? 'text-white' : 'text-foreground'
              }`}>
                {msg.content}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Message input */}
      <div className="pt-3 border-t border-border">
        <div className="flex gap-2">
          <Input
            placeholder="Build sessions, add exercises, set schedules..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="bg-primary hover:bg-primary/80 px-3"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

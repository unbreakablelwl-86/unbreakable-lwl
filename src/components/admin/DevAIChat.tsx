import { useState, useRef, useEffect } from 'react';
import { useHelpChat } from '@/hooks/useHelpChat';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Flame, Send, Loader2, Trash2, Sparkles, Calendar,
  Megaphone, BarChart3, Zap, Brain, MessageSquare,
  MessageSquarePlus, Clock, PanelLeftClose, Volume2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QUICK_PROMPTS = [
  { label: '📅 Plan this week', prompt: 'Plan my social media content for this week. Give me a daily posting schedule across Instagram, Facebook, TikTok, and X. Use all 6 Unbreakable pillars and rotate tones. Include best posting times for each.', icon: Calendar },
  { label: '📊 Content audit', prompt: 'Do a content audit of my social strategy. What content types should I focus on? What\'s the ideal mix of Power, Movement, Fuel, Mindset, Un-Tunes, and Real Talk posts? Give me a ratio and explain why.', icon: BarChart3 },
  { label: '🎵 Un-Tunes post', prompt: 'Create an Un-Tunes post that showcases our music library. Reference the cassette tape aesthetic, mention specific genres we cover (rock/metal, rap, punk, chillstep, folk), and make it shareable. Scouse fire tone.', icon: Sparkles },
  { label: '📱 App feature promo', prompt: 'Write a series of 3 posts promoting Unbreakable app features. Cover the AI Coach, University courses, and the training programme builder. Each should be a different platform (IG, FB, TikTok). Make them scroll-stopping.', icon: Zap },
  { label: '🧠 Content strategy', prompt: 'Give me a full content strategy for growing the Unbreakable brand on social media. Include: content pillars, posting frequency, engagement tactics, hashtag strategy, and how to leverage our Un-Tunes music library for viral content.', icon: Brain },
  { label: '🔥 Transformation post', prompt: 'Write a raw, honest transformation post about the Unbreakable journey. Reference the founder\'s story — diagnosed autistic and ADHD at 39, turned it into a superpower. Liverpool roots, real talk, no fluff. Make it save-worthy.', icon: Megaphone },
];

/* ── Message Bubble — matches Help.tsx neon style ── */
function DevMessageBubble({ message }: { message: { id: string; role: string; content: string; created_at: string } }) {
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
      <div className="max-w-[80%]">
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

/* ── Component ── */
export function DevAIChat() {
  const {
    messages,
    conversations,
    currentConversationId,
    isLoading,
    sendMessage,
    loadConversation,
    deleteConversation,
    startNewConversation,
  } = useHelpChat();

  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (overridePrompt?: string) => {
    const text = overridePrompt || input.trim();
    if (!text || isLoading) return;
    setInput('');
    await sendMessage(text, { callerRole: 'dev' });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[500px] rounded-2xl border border-border overflow-hidden bg-background">
      {/* ── Conversation Sidebar ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-background border-r border-border flex flex-col z-50 overflow-hidden shrink-0"
            >
              <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
                <h2 className="font-display text-xs tracking-wider text-primary">CONVERSATIONS</h2>
                <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 flex-shrink-0">
                <button
                  onClick={() => { startNewConversation(); setSidebarOpen(false); }}
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
                    {conversations.slice(0, 20).map((conv) => (
                      <div
                        key={conv.id}
                        className={`group flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all border ${
                          currentConversationId === conv.id
                            ? 'bg-primary/10 border-primary/25'
                            : 'border-transparent hover:border-border hover:bg-card'
                        }`}
                        onClick={() => { loadConversation(conv.id); setSidebarOpen(false); }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{conv.title || 'Untitled'}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {new Date(conv.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-primary/50 hover:text-primary hover:bg-primary/10 transition-all flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                          onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete this conversation?')) deleteConversation(conv.id); }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <div className="relative">
              <div className="w-9 h-9 rounded-full flex items-center justify-center border border-primary/30 bg-primary/10"
                style={{ boxShadow: '0 0 12px rgba(255,85,0,0.15)' }}>
                <Flame className="w-5 h-5 text-primary" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-background" />
            </div>
            <div>
              <h2 className="font-display text-sm text-foreground tracking-wider">AI COMMAND</h2>
              <p className="text-[10px] text-muted-foreground tracking-widest">CLAUDE • DEV STRATEGY</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" onClick={startNewConversation}
              className="text-[9px] font-display h-7 px-2 gap-1 text-muted-foreground hover:text-primary">
              <MessageSquarePlus className="w-3 h-3" /> NEW
            </Button>
          </div>
        </div>

        {/* Messages / Empty State */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4"
                  style={{ boxShadow: '0 0 30px rgba(255,85,0,0.12)' }}>
                  <Flame className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-lg text-foreground tracking-wide mb-1">AI COMMAND CENTRE</h3>
                <p className="text-muted-foreground text-xs max-w-xs mx-auto">
                  Your dev strategy assistant. Plan content, audit your social presence, craft posts.
                </p>
              </div>

              {/* Quick prompts */}
              <div className="w-full max-w-lg">
                <p className="text-[10px] text-primary font-display tracking-widest text-center mb-3">⚡ QUICK COMMANDS</p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_PROMPTS.map((qp, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(qp.prompt)}
                      className="text-left p-3 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <qp.icon className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-display tracking-wider text-foreground">{qp.label}</span>
                      </div>
                      <p className="text-[9px] text-muted-foreground line-clamp-2 leading-relaxed">{qp.prompt.slice(0, 60)}...</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map(msg => (
                <DevMessageBubble key={msg.id} message={msg} />
              ))}

              {/* Loading indicator */}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-3 mb-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center border border-primary/30 bg-primary/10"
                      style={{ boxShadow: '0 0 12px rgba(255,85,0,0.15)' }}>
                      <Flame className="w-4 h-4 text-primary animate-pulse" />
                    </div>
                  </div>
                  <div className="rounded-2xl px-4 py-3 bg-card border border-border rounded-bl-md">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground font-display tracking-wider">THINKING...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border px-4 py-3 flex-shrink-0">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about content strategy, plan posts, review your calendar..."
              className="flex-1 min-h-[44px] max-h-[120px] resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/30 transition-all"
              rows={1}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 h-[44px] w-[44px] rounded-xl bg-primary hover:bg-primary/80 disabled:opacity-40 disabled:cursor-not-allowed
                flex items-center justify-center transition-all text-white"
              style={{ boxShadow: input.trim() && !isLoading ? '0 0 15px rgba(255,85,0,0.3)' : 'none' }}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[8px] text-muted-foreground tracking-wider">
              SHIFT+ENTER for new line • ENTER to send
            </p>
            <div className="flex items-center gap-1 text-[8px] text-muted-foreground font-display">
              <Sparkles className="w-2.5 h-2.5 text-primary" />
              CLAUDE POWERED
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

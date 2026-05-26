import { useState, useRef, useEffect } from 'react';
import { useHelpChat } from '@/hooks/useHelpChat';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Bot, Send, Loader2, Trash2, Sparkles, Calendar,
  Megaphone, BarChart3, Zap, Brain, MessageSquare,
  Plus, Clock,
} from 'lucide-react';

const QUICK_PROMPTS = [
  { label: '📅 Plan this week', prompt: 'Plan my social media content for this week. Give me a daily posting schedule across Instagram, Facebook, TikTok, and X. Use all 6 Unbreakable pillars and rotate tones. Include best posting times for each.', icon: Calendar },
  { label: '📊 Content audit', prompt: 'Do a content audit of my social strategy. What content types should I focus on? What\'s the ideal mix of Power, Movement, Fuel, Mindset, Un-Tunes, and Real Talk posts? Give me a ratio and explain why.', icon: BarChart3 },
  { label: '🎵 Un-Tunes post', prompt: 'Create an Un-Tunes post that showcases our music library. Reference the cassette tape aesthetic, mention specific genres we cover (rock/metal, rap, punk, chillstep, folk), and make it shareable. Scouse fire tone.', icon: Sparkles },
  { label: '📱 App feature promo', prompt: 'Write a series of 3 posts promoting Unbreakable app features. Cover the AI Coach, University courses, and the training programme builder. Each should be a different platform (IG, FB, TikTok). Make them scroll-stopping.', icon: Zap },
  { label: '🧠 Content strategy', prompt: 'Give me a full content strategy for growing the Unbreakable brand on social media. Include: content pillars, posting frequency, engagement tactics, hashtag strategy, and how to leverage our Un-Tunes music library for viral content.', icon: Brain },
  { label: '🔥 Transformation post', prompt: 'Write a raw, honest transformation post about the Unbreakable journey. Reference the founder\'s story — diagnosed autistic and ADHD at 39, turned it into a superpower. Liverpool roots, real talk, no fluff. Make it save-worthy.', icon: Megaphone },
];

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
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bot className="w-6 h-6 text-primary" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-card" />
          </div>
          <div>
            <h2 className="font-display text-lg text-foreground tracking-wider">AI COMMAND</h2>
            <p className="text-[10px] text-muted-foreground tracking-widest">VIKTOR + CLAUDE • DEV STRATEGY</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => setShowHistory(!showHistory)}
            className="text-[9px] font-display h-7 px-2 gap-1 text-muted-foreground">
            <Clock className="w-3 h-3" /> HISTORY
          </Button>
          <Button variant="ghost" size="sm" onClick={startNewConversation}
            className="text-[9px] font-display h-7 px-2 gap-1 text-muted-foreground">
            <Plus className="w-3 h-3" /> NEW
          </Button>
        </div>
      </div>

      {/* Conversation History */}
      {showHistory && conversations.length > 0 && (
        <Card>
          <CardContent className="pt-3 pb-2">
            <p className="text-[10px] text-primary font-display tracking-widest mb-2">CONVERSATIONS</p>
            <div className="max-h-[150px] overflow-y-auto space-y-1">
              {conversations.slice(0, 10).map(conv => (
                <div key={conv.id} className="flex items-center gap-2">
                  <button
                    onClick={() => { loadConversation(conv.id); setShowHistory(false); }}
                    className={`flex-1 text-left p-2 rounded-lg text-xs transition-all truncate ${
                      currentConversationId === conv.id
                        ? 'border border-primary bg-primary/10 text-foreground'
                        : 'border border-border text-muted-foreground hover:border-primary/30'
                    }`}
                  >
                    <span className="font-display text-[9px] tracking-wider">{conv.title || 'Untitled'}</span>
                  </button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0"
                    onClick={() => deleteConversation(conv.id)}>
                    <Trash2 className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Prompts (show when no messages) */}
      {messages.length === 0 && (
        <div className="space-y-3">
          <p className="text-[10px] text-primary font-display tracking-widest">⚡ QUICK COMMANDS</p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_PROMPTS.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSend(qp.prompt)}
                className="text-left p-3 rounded-lg border border-primary/20 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all group"
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
      )}

      {/* Chat Messages */}
      {messages.length > 0 && (
        <Card className="border-primary/20">
          <CardContent className="pt-4 pb-2">
            <div className="max-h-[400px] overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      </div>
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-foreground'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-[8px] mt-1 ${
                      msg.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                    }`}>
                      {new Date(msg.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-[10px] font-display text-primary-foreground">JJ</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5 text-primary animate-pulse" />
                    </div>
                  </div>
                  <div className="rounded-xl px-4 py-3 bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground font-display tracking-wider">THINKING...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Input */}
      <Card>
        <CardContent className="pt-3 pb-3">
          <div className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about content strategy, plan posts, review your calendar..."
              className="min-h-[44px] max-h-[120px] resize-none text-sm"
              rows={1}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="flex-shrink-0 h-[44px] w-[44px]"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[8px] text-muted-foreground tracking-wider">
              SHIFT+ENTER for new line • ENTER to send
            </p>
            <Badge variant="outline" className="text-[8px] font-display">
              <Sparkles className="w-2.5 h-2.5 mr-1" />CLAUDE POWERED
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useConversations, Conversation, Message } from '@/hooks/useConversations';
import { useCoachingAssignments } from '@/hooks/useCoachingAssignments';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import {
  ArrowLeft, Send, Search, MessageCircle, Check, CheckCheck,
  Users, UserCheck, Dumbbell, ClipboardCheck, Calendar,
  Settings, Hash, Megaphone, ChevronRight, ChevronLeft,
  X, MoreVertical, Bell, Sparkles, Eye, Brain,
  Footprints, Utensils, FileText, Image, Video,
} from 'lucide-react';
import { ChatMediaUpload, ChatMediaAttachment } from '@/components/inbox/ChatMediaUpload';
import { PaywallGate } from '@/components/paywall';
import { useUserPresence } from '@/hooks/usePresence';

/* ─── Types ─── */
type SidebarSection = 'clients' | 'channels';
type RightPanel = 'profile' | 'actions' | null;

interface ClientEntry {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  conversationId: string | null;
  unread: number;
  isOnline: boolean;
  status: 'active' | 'pending' | 'ended';
  lastMessage?: string;
  lastMessageAt?: string;
}

/* ─── Component ─── */
export default function CoachCommandCentre() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { role } = useUserRole();
  const { conversations, loading: convoLoading, sendMessage, markConversationAsRead } = useConversations();
  const { myAthletes, pendingRequests } = useCoachingAssignments();

  const [selectedClient, setSelectedClient] = useState<ClientEntry | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [rightPanel, setRightPanel] = useState<RightPanel>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mediaAttachment, setMediaAttachment] = useState<ChatMediaAttachment | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ─── Build client list from coaching assignments + conversations ─── */
  // Gather all athlete IDs for presence lookup
  const allAthleteIds = useMemo(() => {
    const ids = new Set<string>();
    myAthletes.forEach(a => ids.add(a.athlete_id));
    pendingRequests.forEach(r => ids.add(r.athlete_id));
    return Array.from(ids);
  }, [myAthletes, pendingRequests]);

  const presenceMap = useUserPresence(allAthleteIds);

  const clients = useMemo<ClientEntry[]>(() => {
    const map = new Map<string, ClientEntry>();

    // Add coached athletes
    myAthletes.forEach(a => {
      const convo = conversations.find(c =>
        c.participants.some(p => p.user_id === a.athlete_id)
      );
      map.set(a.athlete_id, {
        id: a.athlete_id,
        name: a.athlete_profile?.display_name || 'Unknown',
        username: a.athlete_profile?.username || 'unknown',
        avatar: a.athlete_profile?.avatar_url || null,
        conversationId: convo?.id || null,
        unread: convo?.unreadCount || 0,
        isOnline: presenceMap.get(a.athlete_id)?.isOnline ?? false,
        status: 'active',
        lastMessage: convo?.lastMessage?.content || undefined,
        lastMessageAt: convo?.lastMessage?.created_at || undefined,
      });
    });

    // Add pending
    pendingRequests.forEach(r => {
      if (!map.has(r.athlete_id)) {
        map.set(r.athlete_id, {
          id: r.athlete_id,
          name: r.athlete_profile?.display_name || 'Unknown',
          username: r.athlete_profile?.username || 'unknown',
          avatar: r.athlete_profile?.avatar_url || null,
          conversationId: null,
          unread: 0,
          isOnline: presenceMap.get(r.athlete_id)?.isOnline ?? false,
          status: 'pending',
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      // Online first, then by unread, then by last message time
      if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
      if (a.unread !== b.unread) return b.unread - a.unread;
      if (a.lastMessageAt && b.lastMessageAt) return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
      return a.name.localeCompare(b.name);
    });
  }, [myAthletes, pendingRequests, conversations, presenceMap]);

  const filteredClients = useMemo(() => {
    if (!searchQuery) return clients;
    const q = searchQuery.toLowerCase();
    return clients.filter(c => c.name.toLowerCase().includes(q) || c.username.toLowerCase().includes(q));
  }, [clients, searchQuery]);

  const totalUnread = useMemo(() => clients.reduce((sum, c) => sum + c.unread, 0), [clients]);

  /* ─── Load messages when client selected ─── */
  useEffect(() => {
    if (!selectedClient?.conversationId) {
      setMessages([]);
      return;
    }
    let mounted = true;
    const loadMessages = async () => {
      setMessagesLoading(true);
      const { data } = await supabase
        .from('messages')
        .select('*, sender:profiles!messages_sender_id_fkey(display_name, username, avatar_url)')
        .eq('conversation_id', selectedClient.conversationId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(100);
      if (mounted && data) setMessages(data as any);
      setMessagesLoading(false);
      if (selectedClient.conversationId) markConversationAsRead(selectedClient.conversationId);
    };
    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`coach-msgs-${selectedClient.conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${selectedClient.conversationId}`,
      }, (payload) => {
        if (mounted) {
          setMessages(prev => [...prev, payload.new as any]);
          if (selectedClient.conversationId) markConversationAsRead(selectedClient.conversationId);
        }
      })
      .subscribe();

    return () => { mounted = false; supabase.removeChannel(channel); };
  }, [selectedClient?.conversationId]);

  /* ─── Scroll to bottom on new messages ─── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ─── Send message ─── */
  const handleSend = async () => {
    if ((!messageText.trim() && !mediaAttachment) || !selectedClient?.conversationId) return;
    const text = messageText.trim();
    setMessageText('');
    setMediaAttachment(null);
    await sendMessage(
      selectedClient.conversationId,
      text || '',
      mediaAttachment?.type === 'image' ? mediaAttachment.url : undefined,
      mediaAttachment?.type === 'video' ? mediaAttachment.url : undefined
    );
    inputRef.current?.focus();
  };

  /* ─── Quick Actions ─── */
  const quickActions = [
    { icon: ClipboardCheck, label: 'Send Check-In', color: '#FF5500' },
    { icon: Dumbbell, label: 'Build Programme', color: '#FF5500', path: '/programming/create' },
    { icon: Utensils, label: 'Meal Plan', color: '#FF5500', path: '/fuel/planning' },
    { icon: Brain, label: 'Mindset Plan', color: '#FF5500', path: '/mindset' },
    { icon: Calendar, label: 'Schedule Session', color: '#FF5500' },
    { icon: Eye, label: 'View Data', color: '#FF5500' },
  ];

  /* ─── Channels (static for now) ─── */
  const channels = [
    { id: 'announcements', name: 'announcements', icon: Megaphone, unread: 0 },
    { id: 'general', name: 'general', icon: Hash, unread: 0 },
    { id: 'coaches-only', name: 'coaches-only', icon: UserCheck, unread: 0 },
  ];

  return (
    <PaywallGate feature="coach_command">
    <div className="h-screen flex flex-col" >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-muted-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-lg tracking-wider">
            <span className="text-primary">COMMAND</span>
            <span className="text-foreground"> CENTRE</span>
          </h1>
          <span className="text-[10px] font-display tracking-wider text-muted-foreground border border-border rounded px-2 py-0.5">
            {role?.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {totalUnread > 0 && (
            <span className="flex items-center gap-1 text-xs text-primary">
              <Bell className="w-3.5 h-3.5" /> {totalUnread}
            </span>
          )}
          <button onClick={() => navigate('/admin')} className="text-muted-foreground hover:text-muted-foreground transition-colors p-1.5">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ─── LEFT SIDEBAR ─── */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-72'} border-r border-border flex flex-col shrink-0 transition-all duration-200`}>
          {/* Sidebar header */}
          <div className="p-3 border-b border-border flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="relative flex-1 mr-2">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search clients..."
                  className="w-full bg-card border border-border rounded-lg pl-8 pr-3 py-1.5 text-sm text-muted-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/30"
                />
              </div>
            )}
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="text-muted-foreground hover:text-muted-foreground transition-colors p-1">
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Channels section */}
          {!sidebarCollapsed && (
            <div className="px-3 py-2">
              <p className="text-[10px] font-display tracking-wider text-muted-foreground mb-1.5">CHANNELS</p>
              {channels.map(ch => (
                <button key={ch.id} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-muted-foreground hover:text-muted-foreground hover:bg-white/5 transition-colors text-sm">
                  <ch.icon className="w-4 h-4" />
                  <span className="font-display text-xs tracking-wide">{ch.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-border mx-3" />

          {/* Client list */}
          <div className="flex-1 overflow-y-auto">
            {!sidebarCollapsed && (
              <div className="px-3 py-2">
                <p className="text-[10px] font-display tracking-wider text-muted-foreground mb-1.5">
                  CLIENTS ({clients.length})
                </p>
              </div>
            )}
            {filteredClients.map(client => (
              <button
                key={client.id}
                onClick={() => { setSelectedClient(client); setRightPanel(null); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 transition-colors ${
                  selectedClient?.id === client.id
                    ? 'bg-primary/10 border-l-2 border-l-[#FF5500]'
                    : 'hover:bg-white/5 border-l-2 border-l-transparent'
                }`}
              >
                <div className="relative shrink-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={client.avatar || undefined} />
                    <AvatarFallback className="text-xs font-display bg-primary/10 text-primary">
                      {client.name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {client.status === 'pending' && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-yellow-500 border-2 border-border" />
                  )}
                </div>
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${selectedClient?.id === client.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {client.name}
                      </p>
                      {client.unread > 0 && (
                        <span className="bg-primary text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center shrink-0 ml-1">
                          {client.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {client.status === 'pending' ? '⏳ Pending request' : client.lastMessage || `@${client.username}`}
                    </p>
                  </div>
                )}
                {sidebarCollapsed && client.unread > 0 && (
                  <span className="absolute right-1 top-1 bg-primary text-white text-[8px] rounded-full w-3.5 h-3.5 flex items-center justify-center">
                    {client.unread}
                  </span>
                )}
              </button>
            ))}
            {filteredClients.length === 0 && !sidebarCollapsed && (
              <div className="px-3 py-8 text-center">
                <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No clients found</p>
              </div>
            )}
          </div>
        </div>

        {/* ─── MAIN CHAT AREA ─── */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selectedClient ? (
            /* Empty state */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-foreground mx-auto mb-4" />
                <h2 className="font-display text-xl tracking-wider text-muted-foreground mb-2">SELECT A CLIENT</h2>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Choose a client from the sidebar to start coaching. All messages, check-ins, and programme updates in one place.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border border-primary/20">
                    <AvatarImage src={selectedClient.avatar || undefined} />
                    <AvatarFallback className="text-sm font-display bg-primary/10 text-primary">
                      {selectedClient.name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-display text-sm tracking-wide text-foreground">{selectedClient.name}</p>
                    <p className="text-[11px] text-muted-foreground">@{selectedClient.username}</p>
                  </div>
                  {selectedClient.status === 'pending' && (
                    <span className="text-[9px] font-display tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      PENDING
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setRightPanel(rightPanel === 'profile' ? null : 'profile')}
                    className={`p-2 rounded-lg transition-colors ${rightPanel === 'profile' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-muted-foreground hover:bg-white/5'}`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setRightPanel(rightPanel === 'actions' ? null : 'actions')}
                    className={`p-2 rounded-lg transition-colors ${rightPanel === 'actions' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-muted-foreground hover:bg-white/5'}`}
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messagesLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-primary/30 border-t-[#FF5500] rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-10 h-10 text-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No messages yet</p>
                    <p className="text-muted-foreground text-xs mt-1">Start the conversation with {selectedClient.name}</p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMe = msg.sender_id === user?.id;
                    const showAvatar = i === 0 || messages[i - 1]?.sender_id !== msg.sender_id;
                    return (
                      <div key={msg.id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                        {showAvatar ? (
                          <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                            <AvatarImage src={msg.sender?.avatar_url || undefined} />
                            <AvatarFallback className="text-[10px] font-display bg-primary/10 text-primary">
                              {(msg.sender?.display_name || '?')[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-7 shrink-0" />
                        )}
                        <div className={`max-w-[70%] ${isMe ? 'text-right' : ''}`}>
                          {showAvatar && (
                            <div className={`flex items-center gap-2 mb-0.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                              <span className="text-[11px] font-display tracking-wide text-muted-foreground">
                                {msg.sender?.display_name || 'Unknown'}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {format(new Date(msg.created_at), 'HH:mm')}
                              </span>
                            </div>
                          )}
                          {msg.image_url && (
                            <img src={msg.image_url} alt="" className="max-w-full rounded-lg mb-1 border border-border" />
                          )}
                          {msg.video_url && (
                            <video src={msg.video_url} controls className="max-w-full rounded-lg mb-1 border border-border" />
                          )}
                          {msg.content && (
                            <div className={`inline-block px-3 py-2 rounded-xl text-sm leading-relaxed ${
                              isMe
                                ? 'bg-primary text-white rounded-tr-sm'
                                : 'bg-card text-muted-foreground border border-border rounded-tl-sm'
                            }`}>
                              {msg.content}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <div className="border-t border-border px-4 py-3 shrink-0">
                {mediaAttachment && (
                  <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg bg-card border border-border">
                    {mediaAttachment.type === 'image' ? <Image className="w-4 h-4 text-primary" /> : <Video className="w-4 h-4 text-primary" />}
                    <span className="text-xs text-muted-foreground truncate flex-1">{mediaAttachment.file?.name || 'Attachment'}</span>
                    <button onClick={() => setMediaAttachment(null)} className="text-muted-foreground hover:text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <ChatMediaUpload attachment={mediaAttachment} onAttachmentChange={setMediaAttachment} />
                  <input
                    ref={inputRef}
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder={`Message ${selectedClient.name}...`}
                    className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-muted-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/30 transition-colors"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!messageText.trim() && !mediaAttachment}
                    className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ─── RIGHT PANEL ─── */}
        {rightPanel && selectedClient && (
          <div className="w-72 border-l border-border overflow-y-auto shrink-0">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <p className="font-display text-xs tracking-wider text-muted-foreground">
                {rightPanel === 'profile' ? 'CLIENT PROFILE' : 'QUICK ACTIONS'}
              </p>
              <button onClick={() => setRightPanel(null)} className="text-muted-foreground hover:text-muted-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {rightPanel === 'profile' && (
              <div className="p-4 space-y-4">
                <div className="text-center">
                  <Avatar className="h-16 w-16 mx-auto mb-3 border-2 border-primary/20">
                    <AvatarImage src={selectedClient.avatar || undefined} />
                    <AvatarFallback className="font-display text-lg bg-primary/10 text-primary">
                      {selectedClient.name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-display text-sm tracking-wide text-foreground">{selectedClient.name}</p>
                  <p className="text-xs text-muted-foreground">@{selectedClient.username}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-display tracking-wider text-muted-foreground">STATUS</p>
                  <span className={`text-[10px] font-display tracking-wider px-2 py-0.5 rounded-full border ${
                    selectedClient.status === 'active' ? 'text-primary bg-primary/10 border-primary/20' :
                    selectedClient.status === 'pending' ? 'text-primary bg-primary/10 border-primary/20' :
                    'text-muted-foreground bg-card border-border'
                  }`}>
                    {selectedClient.status.toUpperCase()}
                  </span>
                </div>

                <button
                  onClick={() => navigate(`/user/${selectedClient.id}`)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-card text-muted-foreground hover:border-primary/20 hover:text-muted-foreground transition-colors text-xs"
                >
                  <span className="flex items-center gap-2"><Eye className="w-3.5 h-3.5 text-primary" /> View Full Profile</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {rightPanel === 'actions' && (
              <div className="p-4 space-y-2">
                <p className="text-[10px] font-display tracking-wider text-muted-foreground mb-2">COACHING TOOLS</p>
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => action.path && navigate(action.path)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-card text-muted-foreground hover:border-primary/20 hover:text-foreground transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <action.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-display text-xs tracking-wide">{action.label}</span>
                  </button>
                ))}

                <div className="border-t border-border pt-3 mt-3">
                  <p className="text-[10px] font-display tracking-wider text-muted-foreground mb-2">NOTES</p>
                  <textarea
                    placeholder="Add private notes about this client..."
                    className="w-full bg-card border border-border rounded-lg p-3 text-sm text-muted-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/30 resize-none h-24 transition-colors"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </PaywallGate>
  );
}

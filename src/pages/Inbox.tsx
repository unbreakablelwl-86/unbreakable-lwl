import { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ThemedLogo } from '@/components/ThemedLogo';
import { useConversations, Conversation, Message } from '@/hooks/useConversations';
import { useAuth } from '@/hooks/useAuth';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Send,
  MoreVertical,
  Trash2,
  Search,
  MessageCircle,
  Check,
  CheckCheck,
  Ban,
  ShieldAlert,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NewMessageDialog } from '@/components/inbox/NewMessageDialog';
import { ChatMediaUpload, ChatMediaAttachment } from '@/components/inbox/ChatMediaUpload';
import { DeleteConfirmModal } from '@/components/tracker/DeleteConfirmModal';

export default function Inbox() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    conversations,
    loading,
    sendMessage,
    deleteConversation,
    deleteMessageForMe,
    deleteMessageForEveryone,
    getDeletedForMeIds,
    markConversationAsRead,
    startConversation,
  } = useConversations();
  const { blockUser, isUserBlocked, checkIfBlockedBy } = useBlockedUsers();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isBlockedByOther, setIsBlockedByOther] = useState(false);
  const [mediaAttachment, setMediaAttachment] = useState<ChatMediaAttachment | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Delete states
  const [deleteConvoModalOpen, setDeleteConvoModalOpen] = useState(false);
  const [convoToDelete, setConvoToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Auto-select conversation from URL query param ?cid=
  useEffect(() => {
    const cid = searchParams.get('cid');
    if (cid && !loading) {
      setSelectedConversationId(cid);
      // Clear the param so refreshing doesn't keep selecting it
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, loading]);

  // Open composer via /inbox?compose=1 or auto-start with ?to=
  useEffect(() => {
    const compose = searchParams.get('compose');
    const cid = searchParams.get('cid');
    const toUserId = searchParams.get('to');
    if (!cid && compose === '1' && !loading) {
      if (toUserId) {
        // Auto-start conversation with the specified user
        setSearchParams({}, { replace: true });
        startConversation(toUserId).then((result) => {
          if (result?.conversation?.id) {
            setSelectedConversationId(result.conversation.id);
          }
        }).catch((err) => {
          console.error('Failed to start conversation:', err);
          toast.error('Could not start conversation');
        });
      } else {
        setNewMessageOpen(true);
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, loading]);

  const selectedConversation = useMemo(() => {
    if (!selectedConversationId) return null;
    return conversations.find((c) => c.id === selectedConversationId) || null;
  }, [conversations, selectedConversationId]);

  // Filter conversations by search
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const otherParticipant = conv.participants.find(p => p.user_id !== user?.id);
    const name = otherParticipant?.profile?.display_name || otherParticipant?.profile?.username || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Fetch messages for selected conversation
  const fetchMessages = async (conversationId: string) => {
    setMessagesLoading(true);
    const deletedForMeIds = getDeletedForMeIds();
    
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (!error && data) {
      // Filter out messages deleted for me
      const filteredMessages = (data as Message[]).filter(
        msg => !deletedForMeIds.includes(msg.id)
      );
      setMessages(filteredMessages);
      markConversationAsRead(conversationId);
    }
    setMessagesLoading(false);
  };

  // Subscribe to new messages and check block status
  useEffect(() => {
    if (!selectedConversationId) {
      setIsBlockedByOther(false);
      return;
    }

    fetchMessages(selectedConversationId);

    const channel = supabase
      .channel(`inbox-chat-${selectedConversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversationId}`,
        },
        () => {
          fetchMessages(selectedConversationId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversationId]);

  // Check if blocked by the other user (once we have participant info)
  useEffect(() => {
    if (!selectedConversationId || !selectedConversation) {
      setIsBlockedByOther(false);
      return;
    }

    const otherParticipant = selectedConversation.participants.find(p => p.user_id !== user?.id);
    if (!otherParticipant) {
      setIsBlockedByOther(false);
      return;
    }

    checkIfBlockedBy(otherParticipant.user_id).then(setIsBlockedByOther);
  }, [selectedConversationId, selectedConversation, user?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() && !mediaAttachment) return;
    if (!selectedConversationId) return;
    if (!selectedConversation) {
      toast.error('Loading conversation…');
      return;
    }
    
    const otherParticipant = selectedConversation.participants.find(p => p.user_id !== user?.id);
    if (otherParticipant && isUserBlocked(otherParticipant.user_id)) {
      toast.error('You have blocked this user');
      return;
    }
    if (isBlockedByOther) {
      toast.error('You cannot message this user');
      return;
    }
    
    const text = messageText;
    const attachment = mediaAttachment;
    setMessageText('');
    setMediaAttachment(null);
    
    const imageUrl = attachment?.type === 'image' ? attachment.url : undefined;
    const videoUrl = attachment?.type === 'video' ? attachment.url : undefined;
    
    const { error } = await sendMessage(selectedConversationId, text, imageUrl, videoUrl);
    if (error) {
      toast.error(error.message);
      setMessageText(text);
      setMediaAttachment(attachment);
    }
  };

  const handleBlockUser = async (userId: string, name: string) => {
    const { error } = await blockUser(userId);
    if (error) {
      toast.error('Failed to block user');
    } else {
      toast.success(`${name} has been blocked`);
      setSelectedConversationId(null);
    }
  };

  // Direct delete handlers
  const handleDeleteForMe = async (msg: Message) => {
    const { error } = await deleteMessageForMe(msg.id);
    if (error) {
      toast.error('Failed to delete message');
    } else {
      setMessages(prev => prev.filter(m => m.id !== msg.id));
      toast.success('Message deleted');
    }
  };

  const handleDeleteForEveryone = async (msg: Message) => {
    const { error } = await deleteMessageForEveryone(msg.id);
    if (error) {
      toast.error('Failed to delete message');
    } else {
      setMessages(prev => prev.filter(m => m.id !== msg.id));
      toast.success('Message deleted for everyone');
    }
  };

  // Handle swipe to delete conversation
  const handleSwipeDeleteConvo = (conversationId: string) => {
    setConvoToDelete(conversationId);
    setDeleteConvoModalOpen(true);
  };

  const confirmDeleteConvo = async () => {
    if (!convoToDelete) return;
    setDeleteLoading(true);
    
    const { error } = await deleteConversation(convoToDelete);
    if (error) {
      toast.error('Failed to delete conversation');
    } else {
      toast.success('Conversation deleted');
      if (selectedConversationId === convoToDelete) {
        setSelectedConversationId(null);
      }
    }
    
    setDeleteLoading(false);
    setDeleteConvoModalOpen(false);
    setConvoToDelete(null);
  };

  const getMessageStatus = (msg: Message & { read_at?: string; delivered_at?: string; status?: string }): 'sent' | 'delivered' | 'read' => {
    if ((msg as any).read_at) return 'read';
    if ((msg as any).delivered_at) return 'delivered';
    if ((msg as any).status === 'read') return 'read';
    if ((msg as any).status === 'delivered') return 'delivered';
    return 'sent';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Please sign in to view messages</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <ThemedLogo className="h-8" />
          </Link>
          <h1 className="font-display text-lg tracking-wide flex-1">
            <span className="text-primary neon-glow-subtle">UNBREAKABLE</span> INBOX
          </h1>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List - Desktop */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-border flex flex-col ${
          selectedConversationId ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Search + New Message */}
          <div className="p-4 border-b border-border space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="pl-10"
                />
              </div>
              <NewMessageDialog onConversationStarted={(id) => {
                setSelectedConversationId(id);
               }}
               startConversationFn={startConversation}
               open={newMessageOpen}
               onOpenChange={setNewMessageOpen}
             />
            </div>
          </div>

          {/* Conversations */}
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No conversations yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Click "New Message" to start a conversation
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredConversations.map((conv) => {
                  const otherParticipant = conv.participants.find(p => p.user_id !== user.id);
                  const profile = otherParticipant?.profile;
                  const displayName = profile?.display_name || profile?.username || 'Unknown';
                  const initials = displayName.slice(0, 2).toUpperCase();
                  const isSelected = selectedConversation?.id === conv.id;

                  return (
                    <motion.div
                      key={conv.id}
                      drag="x"
                      dragConstraints={{ left: -80, right: 0 }}
                      dragElastic={0.1}
                      onDragEnd={(_, info: PanInfo) => {
                        if (info.offset.x < -60) {
                          handleSwipeDeleteConvo(conv.id);
                        }
                      }}
                      className="relative"
                    >
                      {/* Delete indicator behind */}
                      <div className="absolute inset-y-0 right-0 w-20 bg-destructive flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-destructive-foreground" />
                      </div>
                      
                      <motion.button
                        onClick={() => setSelectedConversationId(conv.id)}
                        className={`w-full p-4 text-left hover:bg-muted/50 transition-colors bg-background relative ${
                          isSelected ? 'bg-primary/10' : ''
                        } ${conv.unreadCount > 0 ? 'bg-primary/5' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={profile?.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/20 text-primary font-display">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-foreground truncate">{displayName}</p>
                              <div className="flex items-center gap-2">
                                {conv.lastMessage && (
                                  <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(conv.lastMessage.created_at), {
                                      addSuffix: false,
                                    })}
                                  </p>
                                )}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSwipeDeleteConvo(conv.id);
                                      }}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete conversation
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            {conv.lastMessage && (
                              <p className="text-sm text-muted-foreground truncate mt-1">
                                {conv.lastMessage.sender_id === user.id && 'You: '}
                                {conv.lastMessage.content || '[Media]'}
                              </p>
                            )}
                            {conv.unreadCount > 0 && (
                              <Badge variant="default" className="mt-1 h-5 text-xs">
                                {conv.unreadCount} new
                              </Badge>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat View */}
        <div className={`flex-1 flex flex-col ${
          selectedConversationId ? 'flex' : 'hidden md:flex'
        }`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedConversationId(null)}
                  className="md:hidden"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                {(() => {
                  const otherParticipant = selectedConversation.participants.find(
                    p => p.user_id !== user.id
                  );
                  const profile = otherParticipant?.profile;
                  const displayName = profile?.display_name || profile?.username || 'Unknown';
                  return (
                    <>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary font-display">
                          {displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{displayName}</p>
                        {profile?.username && (
                          <p className="text-sm text-muted-foreground">@{profile.username}</p>
                        )}
                      </div>
                    </>
                  );
                })()}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {(() => {
                      const otherParticipant = selectedConversation.participants.find(
                        p => p.user_id !== user.id
                      );
                      const profile = otherParticipant?.profile;
                      const displayName = profile?.display_name || profile?.username || 'User';
                      return (
                        <DropdownMenuItem
                          onClick={() => otherParticipant && handleBlockUser(otherParticipant.user_id, displayName)}
                          className="text-destructive"
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Block {displayName}
                        </DropdownMenuItem>
                      );
                    })()}
                    <DropdownMenuItem
                      onClick={() => {
                        deleteConversation(selectedConversationId);
                        setSelectedConversationId(null);
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <p>No messages yet</p>
                    <p className="text-sm mt-1">Say hello! 👋</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, index) => {
                      const isOwn = msg.sender_id === user.id;
                      const showDate = index === 0 || 
                        new Date(msg.created_at).toDateString() !== 
                        new Date(messages[index - 1].created_at).toDateString();
                      const status = getMessageStatus(msg);

                      return (
                        <div key={msg.id}>
                          {showDate && (
                            <div className="text-center text-xs text-muted-foreground my-4">
                              {format(new Date(msg.created_at), 'MMMM d, yyyy')}
                            </div>
                          )}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group items-start gap-1`}
                          >
                            {isOwn && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="md:opacity-0 md:group-hover:opacity-100 opacity-60 transition-opacity h-7 w-7 p-0 shrink-0 self-center"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                  <DropdownMenuItem onClick={() => handleDeleteForMe(msg)} className="text-muted-foreground">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete for me
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteForEveryone(msg)} className="text-destructive">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete for everyone
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                            <div
                              className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                                isOwn
                                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                                  : 'bg-muted rounded-bl-sm'
                              }`}
                            >
                                {msg.image_url && (
                                  <img
                                    src={msg.image_url}
                                    alt="Shared image"
                                    className="rounded-lg max-w-full mb-2"
                                  />
                                )}
                                {msg.video_url && (
                                  <video
                                    src={msg.video_url}
                                    controls
                                    className="rounded-lg max-w-full mb-2"
                                  />
                                )}
                                {msg.content && <p>{msg.content}</p>}
                                <div className={`flex items-center gap-1 mt-1 ${
                                  isOwn ? 'justify-end' : ''
                                }`}>
                                  <span
                                    className={`text-xs ${
                                      isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                    }`}
                                  >
                                    {format(new Date(msg.created_at), 'HH:mm')}
                                  </span>
                                  {isOwn && (
                                    <span className={`${
                                      status === 'read' ? 'text-primary-foreground' : 'text-primary-foreground/50'
                                    }`}>
                                      {status === 'read' ? (
                                        <CheckCheck className="w-3.5 h-3.5" />
                                      ) : status === 'delivered' ? (
                                        <CheckCheck className="w-3.5 h-3.5" />
                                      ) : (
                                        <Check className="w-3.5 h-3.5" />
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            {!isOwn && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="md:opacity-0 md:group-hover:opacity-100 opacity-60 transition-opacity h-7 w-7 p-0 shrink-0 self-center"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleDeleteForMe(msg)} className="text-destructive">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete for me
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </motion.div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border bg-card">
                {isBlockedByOther ? (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground py-2">
                    <ShieldAlert className="w-5 h-5" />
                    <span>You cannot reply to this conversation</span>
                  </div>
                ) : (() => {
                  const otherParticipant = selectedConversation.participants.find(p => p.user_id !== user.id);
                  const isBlocked = otherParticipant && isUserBlocked(otherParticipant.user_id);
                  if (isBlocked) {
                    return (
                      <div className="flex items-center justify-center gap-2 text-muted-foreground py-2">
                        <Ban className="w-5 h-5" />
                        <span>You have blocked this user</span>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-2">
                      {/* Media attachment preview */}
                      <ChatMediaUpload
                        attachment={mediaAttachment}
                        onAttachmentChange={setMediaAttachment}
                        disabled={false}
                      />
                      
                      {/* Text input and send */}
                      <div className="flex items-center gap-2">
                        <Input
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button 
                          onClick={handleSendMessage} 
                          disabled={!messageText.trim() && !mediaAttachment}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </>
          ) : selectedConversationId ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-lg">Loading conversation</p>
                <p className="text-sm mt-1">Just a moment…</p>
                <div className="mt-4">
                  <Button variant="outline" onClick={() => setSelectedConversationId(null)}>
                    Back
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a conversation</p>
                <p className="text-sm mt-1">Choose from your existing conversations</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Message Dialog */}
      <DeleteMessageDialog
        isOpen={deleteMessageDialogOpen}
        onClose={() => {
          setDeleteMessageDialogOpen(false);
          setSelectedMessageForDelete(null);
        }}
        onDeleteForMe={handleDeleteForMe}
        onDeleteForEveryone={handleDeleteForEveryone}
        isOwnMessage={selectedMessageForDelete?.sender_id === user?.id}
        loading={deleteLoading}
      />

      {/* Delete Conversation Modal */}
      <DeleteConfirmModal
        isOpen={deleteConvoModalOpen}
        onClose={() => {
          setDeleteConvoModalOpen(false);
          setConvoToDelete(null);
        }}
        onConfirm={confirmDeleteConvo}
        title="Delete Conversation"
        description="This will remove the conversation from your inbox. The other person will still be able to see the conversation."
        confirmText="Delete"
        loading={deleteLoading}
      />
    </div>
  );
}

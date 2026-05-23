import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useCoachContext, CoachUserContext } from './useCoachContext';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface MediaAttachment {
  type: 'image' | 'video';
  url: string;
  name: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/help-chat`;

export function useHelpChat() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const { gatherContext, gatherContextForUser, formatContextForAI } = useCoachContext();

  // Fetch all conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['help-conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('help_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as Conversation[];
    },
    enabled: !!user,
  });

  // Load messages for a conversation
  const loadConversation = useCallback(async (conversationId: string) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('help_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (error) {
      toast({ title: 'Error loading conversation', variant: 'destructive' });
      return;
    }
    
    setMessages(data as Message[]);
    setCurrentConversationId(conversationId);
  }, [user]);

  // Create new conversation
  const createConversation = useCallback(async (firstMessage: string) => {
    if (!user) return null;
    
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
    
    const { data, error } = await supabase
      .from('help_conversations')
      .insert({ user_id: user.id, title })
      .select()
      .single();
    
    if (error) {
      toast({ title: 'Error creating conversation', variant: 'destructive' });
      return null;
    }
    
    queryClient.invalidateQueries({ queryKey: ['help-conversations'] });
    return data.id;
  }, [user, queryClient]);

  // Save message to database
  const saveMessage = useCallback(async (conversationId: string, role: 'user' | 'assistant', content: string) => {
    if (!user) return;
    
    await supabase
      .from('help_messages')
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        role,
        content,
      });
    
    // Update conversation timestamp
    await supabase
      .from('help_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
  }, [user]);

  // Delete conversation
  const deleteConversation = useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase
        .from('help_conversations')
        .delete()
        .eq('id', conversationId);
      
      if (error) throw error;
    },
    onSuccess: (_, conversationId) => {
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
        setMessages([]);
      }
      queryClient.invalidateQueries({ queryKey: ['help-conversations'] });
      toast({ title: 'Conversation deleted' });
    },
    onError: () => {
      toast({ title: 'Error deleting conversation', variant: 'destructive' });
    },
  });

  // Stream chat response with user context and media support
  const sendMessage = useCallback(async (
    input: string,
    options?: {
      mediaAttachments?: MediaAttachment[];
      targetAthleteId?: string;
      targetAthleteName?: string;
      callerRole?: 'dev' | 'coach' | 'user';
    }
  ) => {
    if (!user || !input.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Gather user context — use athlete's data if building for a client
      const userContextData = options?.targetAthleteId
        ? await gatherContextForUser(options.targetAthleteId)
        : await gatherContext();
      const formattedContext = formatContextForAI(userContextData);
      
      // Create or use existing conversation
      let convId = currentConversationId;
      if (!convId) {
        convId = await createConversation(input);
        if (!convId) {
          setIsLoading(false);
          return;
        }
        setCurrentConversationId(convId);
      }
      
      // Add user message
      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: input,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, userMsg]);
      await saveMessage(convId, 'user', input);
      
      // Prepare messages for API
      const apiMessages = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));
      
      // Prepare media URLs if any
      const mediaUrls = options?.mediaAttachments?.map(m => ({
        type: m.type,
        url: m.url,
      })) || [];
      
      // Get the user's session token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      // Stream response with context and media
      const coachMode = !!options?.targetAthleteId;
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messages: apiMessages,
          userContext: formattedContext,
          mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
          coachMode,
          callerRole: options?.callerRole || 'user',
          targetAthleteName: options?.targetAthleteName || undefined,
        }),
      });
      
      if (!resp.ok || !resp.body) {
        const errorData = await resp.json().catch(() => ({}));
        if (resp.status === 402) {
          setTokenBalance(0);
          throw new Error(errorData.message || 'You\'ve used all your Unbreakable tokens. Head to Tokens to upgrade.');
        }
        throw new Error(errorData.error || 'Failed to get response');
      }
      
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let assistantContent = '';
      const assistantId = crypto.randomUUID();
      
      // Add empty assistant message
      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
      }]);
      
      let streamDone = false;
      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }
          
          try {
            const parsed = JSON.parse(jsonStr);
            // Token balance metadata event from edge function
            if (parsed.tokenBalance !== undefined) {
              setTokenBalance(parsed.tokenBalance);
              continue;
            }
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => prev.map(m => 
                m.id === assistantId ? { ...m, content: assistantContent } : m
              ));
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
      
      // Save assistant message
      if (assistantContent) {
        await saveMessage(convId, 'assistant', assistantContent);
      }
      
      queryClient.invalidateQueries({ queryKey: ['help-conversations'] });
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to get response',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, currentConversationId, messages, createConversation, saveMessage, queryClient, gatherContext, gatherContextForUser, formatContextForAI]);

  // Start new conversation
  const startNewConversation = useCallback(() => {
    setCurrentConversationId(null);
    setMessages([]);
  }, []);

  return {
    messages,
    conversations,
    currentConversationId,
    isLoading,
    conversationsLoading,
    tokenBalance,
    sendMessage,
    loadConversation,
    deleteConversation: deleteConversation.mutate,
    startNewConversation,
  };
}

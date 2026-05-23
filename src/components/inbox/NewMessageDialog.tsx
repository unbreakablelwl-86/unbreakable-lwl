import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUserSearch, SearchResult } from '@/hooks/useUserSearch';
import { useConversations } from '@/hooks/useConversations';
import { useFriends } from '@/hooks/useFriends';
import { toast } from 'sonner';
import { Plus, Search, Loader2, MessageCircle, Users } from 'lucide-react';

interface NewMessageDialogProps {
  onConversationStarted?: (conversationId: string) => void;
  /** Optional: provide a startConversation implementation from the parent to share state. */
  startConversationFn?: (recipientId: string) => Promise<{
    error: any;
    conversation: { id: string } | null;
  }>;
  /** Controlled open state (optional). */
  open?: boolean;
  /** Controlled open state setter (optional). */
  onOpenChange?: (open: boolean) => void;
  /** Hide the trigger button (optional). */
  hideTrigger?: boolean;
}

export function NewMessageDialog({
  onConversationStarted,
  startConversationFn,
  open: controlledOpen,
  onOpenChange,
  hideTrigger,
}: NewMessageDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const [query, setQuery] = useState('');
  const [starting, setStarting] = useState(false);
  
  const { results, loading, searchUsers, clearResults } = useUserSearch();
  const { startConversation: startConversationFromHook } = useConversations();
  const startConversation = startConversationFn ?? startConversationFromHook;
  const { friends } = useFriends();

  // Friends are already filtered as accepted in the hook
  const friendProfiles = friends;

  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.length >= 2) {
      searchUsers(value);
    } else {
      clearResults();
    }
  };

  const handleSelectUser = async (userId: string, name: string) => {
    setStarting(true);
    const { error, conversation } = await startConversation(userId);
    
    if (error) {
      toast.error(error.message || 'Failed to start conversation');
    } else {
      toast.success(`Started conversation with ${name}`);
      setOpen(false);
      setQuery('');
      clearResults();
      if (onConversationStarted && conversation) {
        onConversationStarted(conversation.id);
      }
    }
    setStarting(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setQuery('');
      clearResults();
    }
  };

  const displayResults = query.length >= 2 ? results : [];

  return (
    <>
      {!hideTrigger && (
        <Button size="sm" className="gap-2" type="button" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" />
          New Message
        </Button>
      )}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md bg-[#0a0a0a] border-gray-800">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wide">
              NEW MESSAGE
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>

            <ScrollArea className="h-64">
              {/* Search Results */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : displayResults.length > 0 ? (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground px-2 py-1">Search Results</p>
                  {displayResults.map((user) => (
                    <UserItem
                      key={user.user_id}
                      user={user}
                      onSelect={handleSelectUser}
                      disabled={starting}
                    />
                  ))}
                </div>
              ) : query.length >= 2 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No users found</p>
                </div>
              ) : friendProfiles.length > 0 ? (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground px-2 py-1 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Your Friends
                  </p>
                  {friendProfiles.map((friend) => (
                    <UserItem
                      key={friend.user_id}
                      user={{
                        user_id: friend.user_id,
                        display_name: friend.display_name,
                        username: friend.username,
                        avatar_url: friend.avatar_url,
                      }}
                      onSelect={handleSelectUser}
                      disabled={starting}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Search for users to start a conversation</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface UserItemProps {
  user: SearchResult;
  onSelect: (userId: string, name: string) => void;
  disabled?: boolean;
}

function UserItem({ user, onSelect, disabled }: UserItemProps) {
  const displayName = user.display_name || user.username || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <button
      onClick={() => onSelect(user.user_id, displayName)}
      disabled={disabled}
      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50"
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.avatar_url || undefined} />
        <AvatarFallback className="bg-primary/20 text-primary font-display">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="text-left flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{displayName}</p>
        {user.username && (
          <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
        )}
      </div>
      <MessageCircle className="w-4 h-4 text-muted-foreground" />
    </button>
  );
}

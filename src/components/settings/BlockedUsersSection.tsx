import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { toast } from 'sonner';
import { Ban, Loader2, UserX } from 'lucide-react';

export function BlockedUsersSection() {
  const { blockedUsers, loading, unblockUser } = useBlockedUsers();
  const [unblocking, setUnblocking] = useState<string | null>(null);

  const handleUnblock = async (blockedId: string, name: string) => {
    setUnblocking(blockedId);
    const { error } = await unblockUser(blockedId);
    setUnblocking(null);

    if (error) {
      toast.error('Failed to unblock user');
    } else {
      toast.success(`${name} has been unblocked`);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className=" border-border border-border bg-card">
      <CardHeader>
        <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
          <Ban className="w-5 h-5 text-primary" />
          BLOCKED USERS
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : blockedUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <UserX className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No blocked users</p>
            <p className="text-sm mt-1">Users you block won't be able to message you or see your content</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              Blocked users can't message you, send friend requests, or see your content.
            </p>
            {blockedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback className="bg-destructive/20 text-destructive font-display">
                      {getInitials(user.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-display text-foreground">
                      {user.display_name || 'User'}
                    </p>
                    {user.username && (
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUnblock(user.blocked_id, user.display_name || 'User')}
                  disabled={unblocking === user.blocked_id}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {unblocking === user.blocked_id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Unblock'
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

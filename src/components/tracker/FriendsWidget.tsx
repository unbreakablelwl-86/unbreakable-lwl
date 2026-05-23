import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Bell, ChevronRight } from 'lucide-react';
import { useFriends } from '@/hooks/useFriends';
import { UserSearchModal } from './UserSearchModal';
import { FriendRequestsModal } from './FriendRequestsModal';
import { FriendsListModal } from './FriendsListModal';

export function FriendsWidget() {
  const { friends, pendingRequests, loading } = useFriends();
  const [showSearch, setShowSearch] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [showFriends, setShowFriends] = useState(false);

  const receivedCount = pendingRequests.filter(r => r.type === 'received').length;

  if (loading) {
    return (
      <Card className=" border-border border-gray-800 bg-[#111]">
        <CardContent className="p-4">
          <div className="animate-pulse flex space-x-4">
            <div className="h-10 w-10 bg-muted rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className=" border-border border-gray-800 bg-[#111]">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg tracking-wide flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Friends
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Friends Count */}
          <button
            onClick={() => setShowFriends(true)}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
          >
            <div>
              <p className="font-display text-2xl text-foreground">{friends.length}</p>
              <p className="text-sm text-muted-foreground">
                {friends.length === 1 ? 'Friend' : 'Friends'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Friend Requests */}
          <button
            onClick={() => setShowRequests(true)}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Friend Requests</span>
            </div>
            <div className="flex items-center gap-2">
              {receivedCount > 0 && (
                <Badge variant="default" className="bg-primary text-primary-foreground">
                  {receivedCount}
                </Badge>
              )}
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </button>

          {/* Find Friends Button */}
          <Button 
            onClick={() => setShowSearch(true)} 
            className="w-full font-display tracking-wide"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Find Friends
          </Button>
        </CardContent>
      </Card>

      <UserSearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
      <FriendRequestsModal isOpen={showRequests} onClose={() => setShowRequests(false)} />
      <FriendsListModal isOpen={showFriends} onClose={() => setShowFriends(false)} />
    </>
  );
}

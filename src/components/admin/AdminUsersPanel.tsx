import { useState, useEffect } from 'react';
import { Search, MoreVertical, UserX, ShieldCheck, ShieldOff, Crown, User, Trash2, Pause, UserCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminUsers, AdminUser } from '@/hooks/useAdminUsers';
import { useUserRole, AppRole } from '@/hooks/useUserRole';
import { useCoachingAssignments } from '@/hooks/useCoachingAssignments';
import { format } from 'date-fns';

export function AdminUsersPanel() {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignCoachDialogOpen, setAssignCoachDialogOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [newRole, setNewRole] = useState<AppRole>('user');
  const [selectedCoachId, setSelectedCoachId] = useState('');
  const [deleting, setDeleting] = useState(false);
  
  const { users, loading, totalCount, fetchUsers, suspendUser, liftSuspension, assignRole, deleteUser } = useAdminUsers();
  const { isOwner } = useUserRole();
  const { assignCoach, assignments } = useCoachingAssignments();

  // Get coaches from the users list
  const coaches = users.filter(u => u.role === 'coach' || u.role === 'dev');

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    fetchUsers(search);
  };

  const handleSuspend = async () => {
    if (!selectedUser || !suspendReason) return;
    await suspendUser(selectedUser.user_id, suspendReason);
    setSuspendDialogOpen(false);
    setSuspendReason('');
    setSelectedUser(null);
    fetchUsers(search);
  };

  const handleLiftSuspension = async (user: AdminUser) => {
    await liftSuspension(user.user_id);
    fetchUsers(search);
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;
    await assignRole(selectedUser.user_id, newRole);
    setRoleDialogOpen(false);
    setSelectedUser(null);
    fetchUsers(search);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setDeleting(true);
    const result = await deleteUser(selectedUser.user_id);
    setDeleting(false);
    if (!result.error) {
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers(search);
    }
  };

  const handleAssignCoach = async () => {
    if (!selectedUser || !selectedCoachId) return;
    await assignCoach(selectedCoachId, selectedUser.user_id);
    setAssignCoachDialogOpen(false);
    setSelectedUser(null);
    setSelectedCoachId('');
  };

  const getInitials = (user: AdminUser) => {
    if (user.display_name) {
      return user.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user.username?.[0].toUpperCase() || 'U';
  };

  const getRoleBadge = (role?: AppRole) => {
    switch (role) {
      case 'dev':
        return <Badge className="bg-[#FF5500]/20 text-[#FF5500] border-[#FF5500]/30"><Crown className="w-3 h-3 mr-1" />Dev</Badge>;
      case 'coach':
        return <Badge className="bg-[#FF5500]/20 text-[#FF5500] border-[#FF5500]/30"><ShieldCheck className="w-3 h-3 mr-1" />Coach</Badge>;
      default:
        return <Badge variant="secondary"><User className="w-3 h-3 mr-1" />User</Badge>;
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="font-display flex items-center justify-between">
          <span>USER MANAGEMENT</span>
          <span className="text-sm font-normal text-muted-foreground">{totalCount} users</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            SEARCH
          </Button>
        </div>

        {/* Users List */}
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.user_id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  user.is_suspended ? 'bg-destructive/5 border-destructive/20' : 'bg-card border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>{getInitials(user)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user.display_name || user.username || 'Unknown'}</span>
                      {getRoleBadge(user.role)}
                      {user.is_suspended && (
                        <Badge variant="destructive">
                          <ShieldOff className="w-3 h-3 mr-1" />
                          Suspended
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      @{user.username || 'no-username'} • Joined {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {user.is_suspended ? (
                      <DropdownMenuItem onClick={() => handleLiftSuspension(user)}>
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Lift Suspension
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedUser(user);
                          setSuspendDialogOpen(true);
                        }}
                        className="text-destructive"
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Suspend User
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedUser(user);
                        setAssignCoachDialogOpen(true);
                      }}
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Assign Coach
                    </DropdownMenuItem>
                    {isOwner && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setNewRole(user.role || 'user');
                            setRoleDialogOpen(true);
                          }}
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>
      </CardContent>

      {/* Suspend Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">SUSPEND USER</DialogTitle>
            <DialogDescription>
              Suspend {selectedUser?.display_name || selectedUser?.username}? They will not be able to access the platform.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for suspension..."
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSuspend} disabled={!suspendReason}>
              Suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">CHANGE USER ROLE</DialogTitle>
            <DialogDescription>
              Update role for {selectedUser?.display_name || selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="coach">Coach</SelectItem>
              <SelectItem value="dev">Dev</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange}>
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-destructive">DELETE USER PERMANENTLY</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>{selectedUser?.display_name || selectedUser?.username}</strong> and all their data. This action cannot be undone. The user can re-register later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Coach Dialog */}
      <Dialog open={assignCoachDialogOpen} onOpenChange={setAssignCoachDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">ASSIGN COACH</DialogTitle>
            <DialogDescription>
              Assign a coach to {selectedUser?.display_name || selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <Select value={selectedCoachId} onValueChange={setSelectedCoachId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a coach..." />
            </SelectTrigger>
            <SelectContent>
              {coaches
                .filter(c => c.user_id !== selectedUser?.user_id)
                .map(coach => (
                  <SelectItem key={coach.user_id} value={coach.user_id}>
                    {coach.display_name || coach.username || 'Unknown'} ({coach.role})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignCoachDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignCoach} disabled={!selectedCoachId}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

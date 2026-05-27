import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'dev' | 'coach' | 'user';

interface UserRoleState {
  role: AppRole | null;
  isOwner: boolean;
  isAdmin: boolean;
  isAdminOrOwner: boolean;
  loading: boolean;
}

export function useUserRole() {
  const { user } = useAuth();
  const [state, setState] = useState<UserRoleState>({
    role: null,
    isOwner: false,
    isAdmin: false,
    isAdminOrOwner: false,
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setState({
        role: null,
        isOwner: false,
        isAdmin: false,
        isAdminOrOwner: false,
        loading: false,
      });
      return;
    }

    // Set loading true BEFORE starting async role fetch
    // This prevents a gap where isDev=false and loading=false
    setState(prev => ({ ...prev, loading: true }));
    fetchUserRole();
  }, [user]);

  const fetchUserRole = async () => {
    if (!user) return;

    try {
      // First check if user has owner role
      const { data: devData } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'dev' });

      if (devData) {
        setState({
          role: 'dev',
          isOwner: true,
          isAdmin: false,
          isAdminOrOwner: true,
          loading: false,
        });
        return;
      }

      // Check for coach role
      const { data: coachData } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'coach' });

      if (coachData) {
        setState({
          role: 'coach',
          isOwner: false,
          isAdmin: true,
          isAdminOrOwner: true,
          loading: false,
        });
        return;
      }

      // Default to user role
      setState({
        role: 'user',
        isOwner: false,
        isAdmin: false,
        isAdminOrOwner: false,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching user role:', error);
      setState({
        role: 'user',
        isOwner: false,
        isAdmin: false,
        isAdminOrOwner: false,
        loading: false,
      });
    }
  };

  return {
    ...state,
    isCoach: state.role === 'coach',
    isDev: state.role === 'dev',
    refetch: fetchUserRole,
  };
}

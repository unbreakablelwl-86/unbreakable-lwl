import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

interface CoachRouteProps {
  children: ReactNode;
}

/**
 * Route guard that only allows users with 'coach' or 'dev' roles.
 * Regular users are redirected to home.
 *
 * Used to hide 1-2-1 coaching pages from regular users while keeping
 * the code intact for future reactivation.
 */
export function CoachRoute({ children }: CoachRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { isDev, isCoach, loading: roleLoading } = useUserRole();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || (!isDev && !isCoach)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

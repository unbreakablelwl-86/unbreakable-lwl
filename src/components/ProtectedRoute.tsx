import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingCheck } from '@/hooks/useOnboardingCheck';
import { usePlatformSettings } from '@/hooks/usePlatformSettings';
import { useUserRole } from '@/hooks/useUserRole';
import { AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { needsOnboarding, loading: onboardingLoading } = useOnboardingCheck();
  const { isMaintenanceMode, maintenanceMessage } = usePlatformSettings();
  const { isDev, isCoach } = useUserRole();
  const location = useLocation();

  if (loading || onboardingLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Maintenance mode — dev/coach bypass it
  if (isMaintenanceMode && !isDev && !isCoach) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md space-y-4">
          <AlertTriangle className="w-16 h-16 text-primary mx-auto" />
          <h1 className="font-display text-2xl tracking-wide text-foreground">
            WE'LL BE BACK
          </h1>
          <p className="text-muted-foreground">
            {maintenanceMessage || "We're currently performing maintenance. Please check back soon!"}
          </p>
        </div>
      </div>
    );
  }

  // Redirect to onboarding if not completed (but don't redirect if already on onboarding)
  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

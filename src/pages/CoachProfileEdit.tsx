import { CoachProfileEditor } from '@/components/coaching/CoachProfileEditor';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function CoachProfileEdit() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
<main className="container mx-auto px-4 py-24 max-w-2xl">
        <div className="space-y-2 mb-6">
          <h1 className="font-display text-2xl tracking-wide">
            <span className="text-primary">COACH </span>
            <span className="text-foreground">PROFILE</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Set up your public coach profile. Clients will see this when browsing coaches.
          </p>
        </div>
        <CoachProfileEditor />
      </main>
</div>
  );
}

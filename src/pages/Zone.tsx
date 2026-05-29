import { lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const FocusTimerGame = lazy(() => import("@/components/mindset/FocusTimerGame"));

/**
 * ZONE — Universal Timer
 * Countdown timer & stopwatch for rest times, tracking, anything.
 * Standalone page accessible from bottom nav.
 */
const Zone = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="px-4 pt-4 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>
      <div className="px-4">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <p className="font-display text-primary tracking-wide animate-pulse">
                LOADING TIMER...
              </p>
            </div>
          }
        >
          <FocusTimerGame />
        </Suspense>
      </div>
    </div>
  );
};

export default Zone;

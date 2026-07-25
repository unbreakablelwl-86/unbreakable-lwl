import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';
import { useTokenBalance } from './useTokenBalance';

interface CourseAccessResult {
  /** User has access to this course (any active subscriber) */
  hasAccess: boolean;
  /** All course keys the user owns (legacy, kept for compatibility) */
  ownedCourses: string[];
  /** Still loading */
  loading: boolean;
}

/**
 * Check whether the current user can access university courses.
 *
 * Access rules (post-paywall removal):
 *   - Dev / Coach roles → always have access
 *   - Any paying subscriber (Starter / Pro / Elite / Absolute Base) → access
 *   - Free tier → no access to L2+ courses
 *
 * Level-progression requirements are handled separately in UniversityLevel
 * (must complete prior level assessment to unlock the next).
 */
export function useCourseAccess(courseKey?: string): CourseAccessResult {
  const { user } = useAuth();
  const { isDev, isCoach, loading: roleLoading } = useUserRole();
  const { currentTier, loading: tierLoading } = useTokenBalance();

  const loading = roleLoading || tierLoading;

  // Dev / coach users always have access
  if (isDev || isCoach) {
    return { hasAccess: true, ownedCourses: [], loading: false };
  }

  // Any paying subscriber gets full university access
  const paidTiers = ['base', 'absolute_base', 'pro', 'elite'];
  const isSubscriber = paidTiers.includes(currentTier);

  return {
    hasAccess: isSubscriber,
    ownedCourses: [], // Legacy field — no longer tracking individual purchases
    loading,
  };
}

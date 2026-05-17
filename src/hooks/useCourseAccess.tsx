import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';

interface CourseAccessResult {
  /** User owns this specific course */
  hasAccess: boolean;
  /** All course keys the user owns */
  ownedCourses: string[];
  /** Still loading */
  loading: boolean;
}

/**
 * Check whether the current user has purchased a university course.
 * Dev users bypass all purchase gates.
 */
export function useCourseAccess(courseKey?: string): CourseAccessResult {
  const { user } = useAuth();
  const { isDev, loading: roleLoading } = useUserRole();

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ['course-purchases', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('course_purchases' as any)
        .select('course_key')
        .eq('user_id', user.id);
      if (error) {
        console.error('Error fetching course purchases:', error);
        return [];
      }
      return (data as any[]).map((r: any) => r.course_key as string);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // cache 5 min
  });

  const loading = isLoading || roleLoading;

  // Dev users always have access
  if (isDev) {
    return { hasAccess: true, ownedCourses: purchases, loading: false };
  }

  return {
    hasAccess: courseKey ? purchases.includes(courseKey) : false,
    ownedCourses: purchases,
    loading,
  };
}

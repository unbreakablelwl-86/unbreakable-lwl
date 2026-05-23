import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { CertificateView } from '@/components/university/CertificateView';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useUniversityProgress } from '@/hooks/useUniversityProgress';
import { useUserRole } from '@/hooks/useUserRole';
import { getCourseColors } from '@/lib/university/courseColors';
import type { CourseType } from '@/lib/university/types';

export default function UniversityCertificate() {
  const { courseType, level } = useParams<{ courseType: string; level: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { assessments } = useUniversityProgress();
  const { isDev, isCoach } = useUserRole();

  const ct = (courseType || 'gym') as CourseType;
  // level param may be "level-2" or just "2"
  const levelNum = parseInt((level || '2').replace(/\D/g, ''), 10) || 2;
  const colors = getCourseColors(ct);

  // Dev / coach can view all certificates without passing
  const isPrivileged = isDev || isCoach;

  // Check the user actually passed the final assessment for this course/level
  const finalPassed = isPrivileged || assessments.some(
    (a: any) => a.level === levelNum && a.is_final && a.passed && (a.course_type || 'gym') === ct
  );

  // Get the date of passing (or today for preview)
  const passedAssessment = assessments.find(
    (a: any) => a.level === levelNum && a.is_final && a.passed && (a.course_type || 'gym') === ct
  );

  if (!user) return <Navigate to="/auth" replace />;

  const userName = profile?.display_name || profile?.username || 'Student';
  const completedDate = passedAssessment?.attempted_at || new Date().toISOString();

  return (
    <div className="min-h-screen bg-background flex flex-col">
<section className="pt-24 pb-8 border-b border-primary/20 relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-b ${colors.bgGradient} opacity-20 pointer-events-none`} />
        <div className="container mx-auto px-4 max-w-3xl relative z-10">
          <Button variant="ghost" size="sm" className="mb-4 gap-1.5" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>

          <h1 className="font-display text-3xl sm:text-4xl tracking-wide text-center">
            <span className="text-primary neon-glow-subtle">YOUR </span>
            <span className="text-foreground">CERTIFICATE</span>
          </h1>
          {!finalPassed && (
            <p className="text-center text-muted-foreground text-sm mt-2">
              Complete the final assessment to earn this certificate.
            </p>
          )}
        </div>
      </section>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        {finalPassed ? (
          <CertificateView
            userName={userName}
            courseType={ct}
            level={levelNum}
            completedDate={completedDate}
          />
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">You haven't passed the final assessment for this course yet.</p>
            <Button onClick={() => navigate(`/university/${ct}/level-${levelNum}`)}>
              Go to Level {levelNum}
            </Button>
          </div>
        )}
      </main>
</div>
  );
}

import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainNavigation } from '@/components/MainNavigation';
import { UnifiedFooter } from '@/components/UnifiedFooter';
import { Button } from '@/components/ui/button';
import { ChapterContent } from '@/components/university/ChapterContent';
import { ChevronLeft, ChevronRight, CheckCircle, ClipboardCheck, Lock, BookOpen } from 'lucide-react';
import { getChapterData, getUnitData, getChapterQuiz } from '@/lib/university/courseStructure';
import { useUniversityProgress } from '@/hooks/useUniversityProgress';
import { AdminControlPanel } from '@/components/university/AdminControlPanel';
import { toast } from 'sonner';

export default function UniversityChapter() {
  const { courseType, level, unit, chapter } = useParams();
  const navigate = useNavigate();
  const ct = courseType || 'gym';
  const levelNum = parseInt(level?.replace('level-', '') || '2');
  const unitNum = parseInt(unit?.replace('unit-', '') || '1');
  const chapterNum = parseInt(chapter?.replace('chapter-', '') || '1');

  const chapterData = getChapterData(levelNum, unitNum, chapterNum, ct);
  const unitData = getUnitData(levelNum, unitNum, ct);
  const { isChapterComplete, completeChapter, hasPassedChapterQuiz } = useUniversityProgress();
  const isComplete = isChapterComplete(levelNum, unitNum, chapterNum, ct);
  const quizPassed = hasPassedChapterQuiz(levelNum, unitNum, chapterNum, ct);
  const quiz = getChapterQuiz(levelNum, unitNum, chapterNum, ct);

  if (!chapterData || !unitData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Chapter not found</p>
      </div>
    );
  }

  const totalChapters = unitData.chapters.length;
  const hasNext = chapterNum < totalChapters;
  const hasPrev = chapterNum > 1;
  const canGoNext = hasNext && quizPassed;

  const handleComplete = () => {
    completeChapter.mutate(
      { level: levelNum, unitNumber: unitNum, chapterNumber: chapterNum, courseType: ct },
      {
        onSuccess: () => {
          toast.success('Chapter completed!');
          if (quiz && !quizPassed) {
            navigate(`/university/${ct}/level-${levelNum}/unit-${unitNum}/chapter-${chapterNum}/quiz`);
          } else if (hasNext) {
            navigate(`/university/${ct}/level-${levelNum}/unit-${unitNum}/chapter-${chapterNum + 1}`);
          }
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      {/* Chapter Header */}
      <div className="pt-24 pb-6 border-b border-primary/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 max-w-2xl relative z-10">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/university/${ct}/level-${levelNum}`)} className="mb-3 -ml-2 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4 mr-1" /> Unit {unitNum}: {unitData.title}
          </Button>

          {/* Breadcrumb + status */}
          <div className="flex items-center gap-3 mb-2">
            <p className="text-xs text-primary font-display tracking-wider">
              LEVEL {levelNum} — UNIT {unitNum} — CHAPTER {chapterNum}
            </p>
            {quizPassed && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/15 text-[10px] text-green-500 font-display tracking-wider">
                <CheckCircle className="w-3 h-3" /> COMPLETE
              </span>
            )}
            {isComplete && !quizPassed && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-[10px] text-primary font-display tracking-wider">
                QUIZ PENDING
              </span>
            )}
          </div>

          <h1 className="font-display text-2xl sm:text-3xl tracking-wider text-foreground leading-tight">
            {chapterData.title}
          </h1>

          {/* Chapter progress indicator */}
          <div className="flex items-center gap-1.5 mt-4">
            {Array.from({ length: totalChapters }, (_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i + 1 < chapterNum
                    ? 'bg-green-500/50'
                    : i + 1 === chapterNum
                    ? 'bg-primary'
                    : 'bg-muted/50'
                }`}
              />
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5">
            Chapter {chapterNum} of {totalChapters}
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChapterContent chapter={chapterData} />
          </motion.div>

          {/* Bottom Actions */}
          <div className="mt-12 pt-6 border-t border-primary/10 space-y-4">
            {!isComplete && (
              <Button onClick={handleComplete} className="w-full gap-2 h-12 text-base" disabled={completeChapter.isPending}>
                <CheckCircle className="w-5 h-5" />
                {quiz ? 'Complete & Take Quiz' : (hasNext ? 'Mark as Complete & Continue' : 'Mark as Complete')}
              </Button>
            )}

            {isComplete && quiz && !quizPassed && (
              <Button onClick={() => navigate(`/university/${ct}/level-${levelNum}/unit-${unitNum}/chapter-${chapterNum}/quiz`)} className="w-full gap-2 h-12 text-base">
                <ClipboardCheck className="w-5 h-5" />
                Take Chapter Quiz
              </Button>
            )}

            {isComplete && quiz && quizPassed && (
              <Button
                variant="outline"
                onClick={() => navigate(`/university/${ct}/level-${levelNum}/unit-${unitNum}/chapter-${chapterNum}/quiz`)}
                className="w-full gap-2 h-11 text-green-500 border-green-500/30 hover:bg-green-500/5"
              >
                <CheckCircle className="w-4 h-4" />
                Quiz Passed — Retake for Practice
              </Button>
            )}

            {/* Navigation */}
            <div className="flex gap-3">
              {hasPrev && (
                <Button variant="outline" onClick={() => navigate(`/university/${ct}/level-${levelNum}/unit-${unitNum}/chapter-${chapterNum - 1}`)} className="flex-1 h-11">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
              )}
              {hasNext && canGoNext && (
                <Button variant="outline" onClick={() => navigate(`/university/${ct}/level-${levelNum}/unit-${unitNum}/chapter-${chapterNum + 1}`)} className="flex-1 h-11">
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
              {hasNext && !canGoNext && isComplete && (
                <Button variant="outline" disabled className="flex-1 h-11 gap-2">
                  <Lock className="w-4 h-4" /> Pass Quiz to Unlock Next
                </Button>
              )}
              {!hasNext && isComplete && quizPassed && (
                <Button variant="outline" onClick={() => navigate(`/university/${ct}/level-${levelNum}`)} className="flex-1 h-11">
                  <BookOpen className="w-4 h-4 mr-1" /> Back to Unit List
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      <AdminControlPanel />
      <UnifiedFooter className="mt-auto" />
    </div>
  );
}

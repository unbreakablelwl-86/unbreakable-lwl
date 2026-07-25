import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChapterContent } from '@/components/university/ChapterContent';
import { ChevronLeft, ChevronRight, CheckCircle, ClipboardCheck, Lock, BookOpen, Clock, Volume2, VolumeX, Square } from 'lucide-react';
import { getChapterData, getUnitData, getChapterQuiz } from '@/lib/university/courseStructure';
import { useUniversityProgress } from '@/hooks/useUniversityProgress';
import { useCourseAccess } from '@/hooks/useCourseAccess';
import { toCourseKey } from '@/lib/coursePricing';
import { SubscriptionUpgradeBanner } from '@/components/university/SubscriptionUpgradeBanner';
import { AdminControlPanel } from '@/components/university/AdminControlPanel';
import { getCourseColors, getReadingTime } from '@/lib/university/courseColors';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { ContentSection } from '@/lib/university/types';

export default function UniversityChapter() {
  const { courseType, level, unit, chapter } = useParams();
  const navigate = useNavigate();
  const ct = courseType || 'gym';
  const levelNum = parseInt(level?.replace('level-', '') || '2');
  const unitNum = parseInt(unit?.replace('unit-', '') || '1');
  const chapterNum = parseInt(chapter?.replace('chapter-', '') || '1');
  const colors = getCourseColors(ct);

  const courseKey = toCourseKey(ct, levelNum);
  const { hasAccess, loading: accessLoading } = useCourseAccess(courseKey);

  const chapterData = getChapterData(levelNum, unitNum, chapterNum, ct);
  const unitData = getUnitData(levelNum, unitNum, ct);
  const { isChapterComplete, completeChapter, hasPassedChapterQuiz } = useUniversityProgress();
  const isComplete = isChapterComplete(levelNum, unitNum, chapterNum, ct);
  const quizPassed = hasPassedChapterQuiz(levelNum, unitNum, chapterNum, ct);
  const quiz = getChapterQuiz(levelNum, unitNum, chapterNum, ct);

  // JJ voice read-aloud
  const [isReading, setIsReading] = useState(false);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);

  const stopReading = useCallback(() => {
    if (ttsAudioRef.current) { ttsAudioRef.current.pause(); ttsAudioRef.current = null; }
    setIsReading(false);
  }, []);

  const readChapter = useCallback(async () => {
    if (isReading) { stopReading(); return; }
    if (!chapterData) return;

    // Extract plain text from chapter content
    const sections = Array.isArray(chapterData.content) ? chapterData.content as ContentSection[] : [];
    let text = chapterData.title + '. ';
    for (const s of sections) {
      if (s.heading) text += s.heading + '. ';
      if (s.paragraphs) text += s.paragraphs.join(' ') + ' ';
      if (s.bullets) text += s.bullets.join('. ') + ' ';
    }
    if (chapterData.unbreakableInsight) text += 'Unbreakable Insight. ' + chapterData.unbreakableInsight + ' ';
    if (chapterData.coachNote) text += 'Coach Note. ' + chapterData.coachNote;
    text = text.slice(0, 5000);

    setIsReading(true);
    try {
      const res = await supabase.functions.invoke('breathing-tts', { body: { text } });
      if (res.error || !res.data) {
        setIsReading(false);
        return;
      }
      const blob = new Blob([res.data], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      ttsAudioRef.current = audio;
      audio.onended = () => { setIsReading(false); URL.revokeObjectURL(url); ttsAudioRef.current = null; };
      audio.onerror = () => { setIsReading(false); URL.revokeObjectURL(url); ttsAudioRef.current = null; };
      await audio.play();
    } catch { setIsReading(false); }
  }, [chapterData, isReading, stopReading]);

  // Stop reading on chapter change
  // Scroll to top on chapter change
  useEffect(() => {
    stopReading();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [chapterNum, unitNum, levelNum, ct]);

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
  const readingTime = getReadingTime(chapterData);

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
{/* Chapter Header */}
      <div className="pt-6 pb-6 border-b border-primary/20 relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-b ${colors.bgGradient} opacity-20 pointer-events-none`} />
        <div className="container mx-auto px-4 max-w-2xl relative z-10">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/university/${ct}/level-${levelNum}`)} className="mb-3 -ml-2 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4 mr-1" /> Unit {unitNum}: {unitData.title}
          </Button>

          {/* Breadcrumb + status */}
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <p className={`text-xs ${colors.text} font-display tracking-wider`}>
              LEVEL {levelNum} — UNIT {unitNum} — CHAPTER {chapterNum}
            </p>
            {quizPassed && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-[10px] text-primary font-display tracking-wider">
                <CheckCircle className="w-3 h-3" /> COMPLETE
              </span>
            )}
            {isComplete && !quizPassed && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${colors.bg} text-[10px] ${colors.text} font-display tracking-wider`}>
                QUIZ PENDING
              </span>
            )}
          </div>

          <h1 className="font-display text-2xl sm:text-3xl tracking-wider text-foreground leading-tight">
            {chapterData.title}
          </h1>

          {/* Reading time */}
          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{readingTime} min read</span>
          </div>

          {/* Chapter progress indicator */}
          <div className="flex items-center gap-1.5 mt-4">
            {Array.from({ length: totalChapters }, (_, i) => (
              <motion.div
                key={i}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`h-1.5 flex-1 rounded-full transition-colors origin-left ${
                  i + 1 < chapterNum
                    ? 'bg-primary/50'
                    : i + 1 === chapterNum
                    ? colors.progressFill
                    : 'bg-muted/30'
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
          {accessLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !hasAccess ? (
            <SubscriptionUpgradeBanner />
          ) : (
          <>
          {/* JJ Voice Read-Aloud */}
          <div className="flex justify-end mb-4">
            <button
              onClick={readChapter}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-display tracking-wider transition-all ${
                isReading
                  ? 'border-primary/40 bg-primary/10 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.2)]'
                  : 'border-border bg-card/50 text-muted-foreground hover:text-foreground hover:border-primary/30'
              }`}
            >
              {isReading ? (
                <><Square className="w-3.5 h-3.5" /> STOP JJ</>
              ) : (
                <><Volume2 className="w-3.5 h-3.5" /> JJ READ ALOUD</>
              )}
            </button>
          </div>

          <motion.div
            key={`${ct}-${levelNum}-${unitNum}-${chapterNum}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChapterContent chapter={chapterData} courseType={ct} />
          </motion.div>

          {/* Bottom Actions */}
          <div className="mt-12 pt-6 border-t border-border/30 space-y-4">
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
                className="w-full gap-2 h-11 text-primary border-primary/30 hover:bg-primary/5"
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
          </>
          )}
        </div>
      </main>

      <AdminControlPanel />
</div>
  );
}

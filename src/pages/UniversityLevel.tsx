import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainNavigation } from '@/components/MainNavigation';
import { UnifiedFooter } from '@/components/UnifiedFooter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CourseProgressBar } from '@/components/university/CourseProgressBar';
import { ChevronLeft, ChevronRight, BookOpen, Lock, CheckCircle, Trophy, GraduationCap, Clock } from 'lucide-react';
import { getLevelData } from '@/lib/university/courseStructure';
import { useUniversityProgress } from '@/hooks/useUniversityProgress';
import { useCourseAccess } from '@/hooks/useCourseAccess';
import { toCourseKey } from '@/lib/coursePricing';
import { CoursePurchaseGate } from '@/components/university/CoursePurchaseGate';
import { AdminControlPanel } from '@/components/university/AdminControlPanel';
import { getCourseColors, getReadingTime } from '@/lib/university/courseColors';

export default function UniversityLevel() {
  const { courseType, level } = useParams();
  const navigate = useNavigate();
  const ct = courseType || 'gym';
  const levelNum = parseInt(level?.replace('level-', '') || '2');
  // Sport-specific courses should navigate back to the sport tab, not their raw key
  const backTab = ct.startsWith('sport-') ? 'sport' : ct;
  const courseKey = toCourseKey(ct, levelNum);
  const { hasAccess, ownedCourses, loading: accessLoading } = useCourseAccess(courseKey);
  const levelData = getLevelData(levelNum, ct);
  const colors = getCourseColors(ct);
  const {
    getUnitCompletedChapters,
    isChapterComplete,
    hasPassedAssessment,
    getBestAssessment,
    hasPassedChapterQuiz,
    allChapterQuizzesPassed,
  } = useUniversityProgress();

  if (!levelData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Level not found</p>
      </div>
    );
  }

  const isLevelLocked = levelNum > 2 && !hasPassedAssessment(levelNum - 1, 0, ct);
  if (isLevelLocked) {
    const prevLevel = levelNum - 1;
    return (
      <div className="min-h-screen bg-background">
        <MainNavigation />
        <div className="pt-24 pb-6 container mx-auto px-4 max-w-2xl text-center">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/university?course=${backTab}`)} className="mb-6 text-muted-foreground">
            <ChevronLeft className="w-4 h-4 mr-1" /> University
          </Button>
          <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="font-display text-3xl tracking-wider text-foreground mb-3">LEVEL {levelNum} LOCKED</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            You need to pass the Level {prevLevel} Final Assessment before you can progress to Level {levelNum}. Head back and finish what you started.
          </p>
          <Button onClick={() => navigate(`/university/${ct}/level-${prevLevel}`)}>
            Go to Level {prevLevel}
          </Button>
        </div>
        <UnifiedFooter className="mt-auto" />
      </div>
    );
  }

  const unitChapterCounts = levelData.units
    .filter(u => u.chapters.length > 0)
    .map(u => ({ unitNumber: u.number, chapters: u.chapters.length }));
  const allQuizzesPassed = allChapterQuizzesPassed(levelNum, unitChapterCounts, ct);

  const isChapterAccessible = (unitNumber: number, chapterNumber: number): boolean => {
    if (unitNumber === 1 && chapterNumber === 1) return true;
    if (chapterNumber === 1) {
      const prevUnit = levelData.units.find(u => u.number === unitNumber - 1);
      if (!prevUnit || prevUnit.chapters.length === 0) return true;
      return hasPassedChapterQuiz(levelNum, unitNumber - 1, prevUnit.chapters.length, ct);
    }
    return hasPassedChapterQuiz(levelNum, unitNumber, chapterNumber - 1, ct);
  };

  const getUnitQuizzesPassed = (unitNumber: number, totalChapters: number): number => {
    let count = 0;
    for (let i = 1; i <= totalChapters; i++) {
      if (hasPassedChapterQuiz(levelNum, unitNumber, i, ct)) count++;
    }
    return count;
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      {/* Level Header */}
      <div className="pt-24 pb-8 border-b border-primary/20 relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-b ${colors.bgGradient} opacity-30 pointer-events-none`} />
        <div className="container mx-auto px-4 max-w-3xl relative z-10">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/university?course=${backTab}`)} className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4 mr-1" /> University
          </Button>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${colors.iconBg} flex items-center justify-center shrink-0`}>
              <GraduationCap className={`w-6 h-6 ${colors.text}`} />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl tracking-wider leading-none">
                <span className={`${colors.text}`}>{levelData.title.toUpperCase()}</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">{levelData.subtitle} — {levelData.units.length} Units</p>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase banner */}
      {!accessLoading && !hasAccess && levelData && (
        <div className="container mx-auto px-4 pt-6">
          <div className="max-w-3xl mx-auto">
            <CoursePurchaseGate
              courseKey={courseKey}
              courseName={levelData.title}
              ownedCourses={ownedCourses}
              variant="banner"
            />
          </div>
        </div>
      )}

      {/* Units */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-5">
          {levelData.units.map((unit, idx) => {
            const hasChapters = unit.chapters.length > 0;
            const completedCount = getUnitCompletedChapters(levelNum, unit.number, ct);
            const quizzesPassed = hasChapters ? getUnitQuizzesPassed(unit.number, unit.chapters.length) : 0;
            const allUnitQuizzesPassed = hasChapters && quizzesPassed >= unit.chapters.length;
            const assessment = getLevelData(levelNum, ct)?.assessments.find(a => a.unitNumber === unit.number);
            const passed = hasPassedAssessment(levelNum, unit.number, ct);
            const best = getBestAssessment(levelNum, unit.number, ct);

            return (
              <motion.div
                key={unit.number}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                <Card className={`${colors.border} overflow-hidden`}>
                  {/* Unit header */}
                  <div className="p-5 pb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        allUnitQuizzesPassed ? 'bg-green-500/15' : colors.iconBg
                      }`}>
                        {allUnitQuizzesPassed ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <span className={`font-display text-sm ${colors.text}`}>{unit.number}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-display text-base sm:text-lg tracking-wider text-foreground">{unit.title}</h2>
                        <div className="flex items-center gap-3 mt-0.5">
                          <p className="text-xs text-muted-foreground">{unit.chapters.length} Chapters</p>
                          {hasChapters && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              ~{Math.round(unit.chapters.length * 5)} min
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{unit.description}</p>

                    {hasChapters && (
                      <CourseProgressBar
                        label="Quizzes Passed"
                        completed={quizzesPassed}
                        total={unit.chapters.length}
                        colorClass={colors.progressFill}
                      />
                    )}
                  </div>

                  {/* Chapters list — timeline style */}
                  {hasChapters && (
                    <div className="border-t border-border/50">
                      {unit.chapters.map((ch, chIdx) => {
                        const done = isChapterComplete(levelNum, unit.number, ch.number, ct);
                        const qPassed = hasPassedChapterQuiz(levelNum, unit.number, ch.number, ct);
                        const accessible = isChapterAccessible(unit.number, ch.number);
                        const isLast = chIdx === unit.chapters.length - 1;

                        return (
                          <motion.button
                            key={ch.number}
                            onClick={() => accessible ? navigate(`/university/${ct}/level-${levelNum}/unit-${unit.number}/chapter-${ch.number}`) : undefined}
                            disabled={!accessible}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.08 + chIdx * 0.03 }}
                            className={`w-full flex items-center gap-3 px-5 py-3.5 transition-all text-left ${
                              !isLast ? 'border-b border-border/30' : ''
                            } ${
                              accessible
                                ? `${colors.hoverBg} cursor-pointer`
                                : 'opacity-40 cursor-not-allowed'
                            }`}
                          >
                            {/* Timeline connector line */}
                            <div className="relative flex flex-col items-center">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 z-10 ${
                                qPassed
                                  ? 'bg-green-500/15 text-green-500'
                                  : done
                                  ? `${colors.iconBg} ${colors.text}`
                                  : !accessible
                                  ? 'bg-muted/50 text-muted-foreground'
                                  : 'bg-muted/50 text-muted-foreground'
                              }`}>
                                {!accessible ? (
                                  <Lock className="w-3 h-3" />
                                ) : qPassed ? (
                                  <CheckCircle className="w-3.5 h-3.5" />
                                ) : (
                                  ch.number
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground truncate">{ch.title}</p>
                              {qPassed && <p className="text-[11px] text-green-500 font-display tracking-wider">PASSED</p>}
                              {done && !qPassed && accessible && <p className={`text-[11px] ${colors.text} font-display tracking-wider`}>QUIZ PENDING</p>}
                            </div>
                            {accessible && <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0`} />}
                          </motion.button>
                        );
                      })}
                    </div>
                  )}

                  {/* Unit Assessment */}
                  {hasChapters && assessment && assessment.questions.length > 0 && (
                    <div className="border-t border-border/30 p-5 bg-card/50">
                      <button
                        onClick={() => navigate(`/university/${ct}/level-${levelNum}/unit-${unit.number}/assessment`)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border border-border/30 hover:${colors.borderActive} cursor-pointer transition-all ${colors.hoverBg} text-left`}
                      >
                        {passed ? (
                          <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center shrink-0">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                        ) : (
                          <div className={`w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0`}>
                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">Optional Revision — Unit Assessment</p>
                          <p className="text-xs text-muted-foreground">
                            {best
                              ? `Best: ${best.score}/${best.total} (${Math.round((best.score / best.total) * 100)}%)`
                              : `${assessment.questions.length} questions — practice only`}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </button>
                    </div>
                  )}

                  {!hasChapters && (
                    <div className="px-5 pb-5">
                      <p className={`text-xs ${colors.text} font-display tracking-wider`}>COMING SOON</p>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}

          {/* Final Assessment */}
          {levelData.finalAssessment && levelData.finalAssessment.questions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: levelData.units.length * 0.08 }}
            >
              <Card className={`overflow-hidden border-2 transition-all ${
                allQuizzesPassed
                  ? `${colors.borderActive} shadow-lg ${colors.glow}`
                  : 'border-muted/20'
              }`}>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      allQuizzesPassed
                        ? hasPassedAssessment(levelNum, 0, ct)
                          ? 'bg-green-500/15'
                          : colors.iconBg
                        : 'bg-muted/30'
                    }`}>
                      {hasPassedAssessment(levelNum, 0, ct) ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <Trophy className={`w-6 h-6 ${allQuizzesPassed ? colors.text : 'text-muted-foreground'}`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="font-display text-xl tracking-wider text-foreground">FINAL ASSESSMENT</h2>
                      <p className="text-xs text-muted-foreground">
                        {allQuizzesPassed
                          ? `${levelData.finalAssessment.questions.length} questions — ${levelData.finalAssessment.passMarkPercent}% to pass`
                          : 'Pass all chapter quizzes to unlock'}
                      </p>
                    </div>
                    {!allQuizzesPassed && <Lock className="w-5 h-5 text-muted-foreground" />}
                  </div>

                  {allQuizzesPassed && !hasPassedAssessment(levelNum, 0, ct) && (
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                      You've completed all the chapter quizzes — well done. This final assessment covers everything you've learned. You need {levelData.finalAssessment.passMarkPercent}% to pass.
                    </p>
                  )}

                  {hasPassedAssessment(levelNum, 0, ct) && (
                    <p className="text-sm text-green-500/80 leading-relaxed mb-5">
                      You've passed this assessment. You can retake it anytime for practice.
                    </p>
                  )}

                  <Button
                    onClick={() => navigate(`/university/${ct}/level-${levelNum}/unit-0/assessment`)}
                    disabled={!allQuizzesPassed}
                    className="w-full"
                    variant={allQuizzesPassed ? 'default' : 'outline'}
                  >
                    {hasPassedAssessment(levelNum, 0, ct)
                      ? 'Retake Final Assessment'
                      : allQuizzesPassed
                      ? 'Start Final Assessment'
                      : 'Complete All Chapter Quizzes First'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </main>

      <AdminControlPanel />
      <UnifiedFooter className="mt-auto" />
    </div>
  );
}

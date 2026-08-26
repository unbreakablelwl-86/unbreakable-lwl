import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CourseProgressBar } from '@/components/university/CourseProgressBar';
import { GraduationCap, Lock, ChevronRight, Flame, Dumbbell, Apple, Brain, BookOpen, Award, Zap, Trophy, Clock, FileText } from 'lucide-react';
import { allCourses, sportCourses, getTotalChapters } from '@/lib/university/courseStructure';
import { useUniversityProgress } from '@/hooks/useUniversityProgress';
import { AdminControlPanel } from '@/components/university/AdminControlPanel';
import { getCourseColors } from '@/lib/university/courseColors';
import { useCourseAccess } from '@/hooks/useCourseAccess';
import { FEATURES } from '@/config/features';
import { useUserRole } from '@/hooks/useUserRole';
import type { CourseType } from '@/lib/university/types';
import { GuidesSection } from '@/components/university/GuidesSection';

const courseTabs: { key: CourseType; label: string; icon: React.ReactNode; description: string; tagline: string; emoji: string }[] = [
  { key: 'gym', label: 'Power', icon: <Dumbbell className="w-5 h-5" />, description: 'Applied Fitness & Exercise Science', tagline: 'Understand how your body moves, adapts, and grows.', emoji: '💪' },
  { key: 'nutrition', label: 'Fuel', icon: <Apple className="w-5 h-5" />, description: 'Healthy Eating & Nutritional Science', tagline: 'Master the science of what you eat and why it matters.', emoji: '🍏' },
  { key: 'mindset', label: 'Mindset', icon: <Brain className="w-5 h-5" />, description: 'Mental Performance & Wellbeing', tagline: 'Build the mental resilience to keep showing up.', emoji: '🧠' },
  { key: 'sport', label: 'Sport', icon: <Trophy className="w-5 h-5" />, description: 'Sport-Specific Training', tagline: 'Apply your knowledge to the sport you love.', emoji: '🏆' },
];

/** Animated number counter */
function AnimatedStat({ value, suffix = '' }: { value: string; suffix?: string }) {
  const [displayed, setDisplayed] = useState(0);
  const numericPart = parseInt(value.replace(/[^0-9]/g, ''));

  useEffect(() => {
    let frame: number;
    const duration = 1200;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(numericPart * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [numericPart]);

  return <>{displayed.toLocaleString()}{suffix}</>;
}

export default function University() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = (searchParams.get('course') as CourseType) || 'gym';
  const { getLevelCompletedChapters, hasPassedAssessment } = useUniversityProgress();
  const { hasAccess } = useCourseAccess();
  const { isOwner } = useUserRole();
  // Sport courses & their certificates are hidden from clients pre-launch, but stay live for the owner account.
  const showSport = FEATURES.sportsCertificates || isOwner;
  const visibleCourseTabs = showSport ? courseTabs : courseTabs.filter(t => t.key !== 'sport');

  const activeTab: CourseType = (requestedTab === 'sport' && !showSport) ? 'gym' : requestedTab;
  // Hide Level 4 content (no images yet — re-enable when L4 images are ready)
  const courseData = (allCourses[activeTab] || []).filter(l => l.level <= 3);
  const colors = getCourseColors(activeTab);

  const setActiveTab = (tab: CourseType) => {
    setSearchParams({ course: tab });
  };

  const activeTabData = courseTabs.find(t => t.key === activeTab) || courseTabs[0];

  return (
    <div className="min-h-screen pb-24">

      {/* ━━━ Hero ━━━ */}
      <section className="pt-6 pb-12 md:pt-8 md:pb-16 border-b border-primary/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 text-center max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-1">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span className="text-xs font-display tracking-wider text-primary">EDUCATION FOR EVERYONE</span>
            </div>

            <h1 className="font-display text-2xl tracking-wide leading-none">
              <span className="text-primary">UNBREAKABLE </span>
              <span className="text-foreground">UNIVERSITY</span>
            </h1>

            <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              Real education that should be taught in schools — not locked behind a qualification.
              Level 2 &amp; 3 courses in fitness, nutrition, mindset and sports science. Unit 1 of every course is free.
            </p>

            <p className="text-xs text-muted-foreground/70 max-w-xl mx-auto">
              UNBREAKABLE courses are written to NVQ standard. These are not official qualifications — they are UNBREAKABLE education, built to be accessible to everyone.
            </p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-2"
            >
              {[
                { value: '19', suffix: '', label: 'Courses', icon: <BookOpen className="w-3.5 h-3.5" /> },
                { value: '4400', suffix: '+', label: 'Quiz Questions', icon: <Award className="w-3.5 h-3.5" /> },
                { value: '5', suffix: '', label: 'Disciplines', icon: <Zap className="w-3.5 h-3.5" /> },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1.5 text-primary">
                    {stat.icon}
                    <span className="font-display text-xl tracking-wider">
                      <AnimatedStat value={stat.value} suffix={stat.suffix} />
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-display tracking-wider">{stat.label.toUpperCase()}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ━━━ Course Tabs ━━━ */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-3xl mx-auto">
          <p className="font-display text-xs tracking-wider text-muted-foreground text-center mb-4">
            CHOOSE YOUR DISCIPLINE
          </p>

          {/* Horizontal scrollable on mobile, grid on desktop */}
          <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
            {visibleCourseTabs.map((tab, i) => {
              const tabColors = getCourseColors(tab.key);
              const isActive = activeTab === tab.key;
              return (
                <motion.button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-5 rounded-xl border transition-all w-[calc(25%-6px)] sm:w-[calc(25%-10px)] min-w-[72px] ${
                    isActive
                      ? `${tabColors.bg} ${tabColors.borderActive} shadow-lg ${tabColors.glow}`
                      : 'bg-card/50 border-border hover:border-primary/20 hover:bg-card'
                  }`}
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors ${
                    isActive
                      ? `${tabColors.iconBg} ${tabColors.text}`
                      : 'bg-muted/50 text-muted-foreground'
                  }`}>
                    {tab.icon}
                  </div>
                  <span className={`font-display text-[11px] sm:text-sm tracking-wider ${
                    isActive ? tabColors.text : 'text-foreground'
                  }`}>
                    {tab.label.toUpperCase()}
                  </span>
                  <span className="text-[9px] sm:text-xs text-muted-foreground text-center leading-tight hidden md:block">
                    {tab.description}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeDot"
                      className={`absolute -bottom-1.5 w-1.5 h-1.5 rounded-full ${tabColors.progressFill}`}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ━━━ Active Course Tagline ━━━ */}
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="text-center mb-6"
            >
              <p className="text-sm text-muted-foreground">{activeTabData.tagline}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ━━━ Content Area ━━━ */}
      <main className="container mx-auto px-4 pb-12 md:pb-20">
        <div className="max-w-3xl mx-auto space-y-5">

          {/* Guides tab */}
          {activeTab === 'guides' && (
            <GuidesSection />
          )}

          {/* Sport tab: grid of individual sport courses */}
          {showSport && activeTab === 'sport' && (() => {
            const sportList: { key: string; label: string; emoji: string }[] = [
              { key: 'sport-football', label: 'Football', emoji: '⚽' },
              { key: 'sport-boxing', label: 'Boxing', emoji: '🥊' },
              { key: 'sport-rugby', label: 'Rugby', emoji: '🏉' },
              { key: 'sport-running', label: 'Running', emoji: '🏃' },
              { key: 'sport-swimming', label: 'Swimming', emoji: '🏊' },
              { key: 'sport-mma', label: 'MMA', emoji: '🥋' },
              { key: 'sport-cycling', label: 'Cycling', emoji: '🚴' },
              { key: 'sport-tennis', label: 'Tennis', emoji: '🎾' },
              { key: 'sport-basketball', label: 'Basketball', emoji: '🏀' },
              { key: 'sport-cricket', label: 'Cricket', emoji: '🏏' },
            ];
            return (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {sportList.map((sport, i) => {
                  const sData = allCourses[sport.key] || [];
                  const total = sData.length > 0 ? getTotalChapters(sData[0].level, sport.key) : 0;
                  const completed = sData.length > 0 ? getLevelCompletedChapters(sData[0].level, sport.key) : 0;
                  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                  return (
                    <motion.div
                      key={sport.key}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -3, scale: 1.02 }}
                    >
                      <Card
                        className={`relative overflow-hidden ${colors.border} hover:${colors.borderActive} cursor-pointer hover:shadow-lg ${colors.glow} transition-all group`}
                        onClick={() => navigate(`/university/${sport.key}/level-1`)}
                      >
                        {total > 0 && (
                          <div className={`absolute top-0 left-0 h-1 ${colors.progressBg} w-full`}>
                            <motion.div
                              className={`h-full ${colors.progressFill}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, delay: i * 0.05 }}
                            />
                          </div>
                        )}
                        <div className="p-4 sm:p-5 text-center space-y-1.5">
                          <div className="text-2xl sm:text-3xl">{sport.emoji}</div>
                          <h3 className={`font-display text-xs sm:text-sm tracking-wider text-foreground group-hover:${colors.text} transition-colors`}>
                            {sport.label.toUpperCase()}
                          </h3>
                          <p className="text-[9px] sm:text-[10px] text-muted-foreground">
                            {total} Chapters
                          </p>
                          {total > 0 && completed > 0 && (
                            <p className={`text-[9px] sm:text-[10px] ${colors.text} font-display tracking-wider`}>{pct}%</p>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            );
          })()}

          {/* Non-sport tabs: empty state (content not yet loaded) */}
          {activeTab !== 'sport' && activeTab !== 'guides' && courseData.length === 0 && (
            <Card className={`p-8 ${colors.border} text-center`}>
              <Flame className={`w-10 h-10 ${colors.text} mx-auto mb-4`} />
              <h2 className="font-display text-xl tracking-wider text-foreground mb-2">NO COURSES YET</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                New {activeTabData.label} courses are being added — check back for updates.
              </p>
            </Card>
          )}

          {/* Non-sport tabs: level cards */}
          <AnimatePresence mode="wait">
            {activeTab !== 'sport' && activeTab !== 'guides' && courseData.map((level, i) => {
              const totalChapters = getTotalChapters(level.level, activeTab);
              const completedChapters = getLevelCompletedChapters(level.level, activeTab);
              const hasContent = level.units.some(u => u.chapters.length > 0);
              const isProgressLocked = level.level > 2 && !hasPassedAssessment(level.level - 1, 0, activeTab);
              // Free users: can click L2 (preview Unit 1), L3+ fully locked
              const isPaidLocked = !hasAccess;
              const isLocked = isProgressLocked || (isPaidLocked && level.level > 2);
              const progressPercent = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
              const estimatedHours = Math.round(totalChapters * 5 / 60);

              return (
                <motion.div
                  key={`${activeTab}-${level.level}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: i * 0.12, duration: 0.35 }}
                  whileHover={!isLocked && hasContent ? { y: -2 } : undefined}
                >
                  <Card
                    className={`relative overflow-hidden border transition-all group ${
                      isLocked
                        ? 'border-muted/30 opacity-60'
                        : `${colors.border} hover:${colors.borderActive} cursor-pointer hover:shadow-lg ${colors.glow}`
                    }`}
                    onClick={() => !isLocked && hasContent && navigate(`/university/${activeTab}/level-${level.level}`)}
                  >
                    {/* Progress accent bar */}
                    {!isLocked && totalChapters > 0 && (
                      <div className={`absolute top-0 left-0 h-1 ${colors.progressBg} w-full`}>
                        <motion.div
                          className={`h-full ${colors.progressFill}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    )}

                    <div className="p-5 sm:p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${
                            isLocked ? 'bg-muted/30' : colors.iconBg
                          }`}>
                            {isLocked ? (
                              <Lock className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <GraduationCap className={`w-5 h-5 sm:w-6 sm:h-6 ${colors.text}`} />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className="font-display text-lg sm:text-xl tracking-wider text-foreground">{level.title}</h2>
                              {isPaidLocked && level.level === 2 && (
                                <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">UNIT 1 FREE</span>
                              )}
                              {isPaidLocked && level.level > 2 && (
                                <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">LOCKED</span>
                              )}
                            </div>
                            <p className={`text-xs ${colors.text} font-display tracking-wider mt-0.5`}>{level.subtitle}</p>
                          </div>
                        </div>
                        {!isLocked && hasContent && (
                          <ChevronRight className={`w-5 h-5 text-muted-foreground group-hover:${colors.text} transition-colors shrink-0 mt-1`} />
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{level.description}</p>

                      {/* Stats row */}
                      <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-5 gap-y-2 text-xs text-muted-foreground mb-4">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className={`w-3.5 h-3.5 ${colors.textMuted}`} />
                          <span>{level.units.length} Units</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className={`w-3.5 h-3.5 ${colors.textMuted}`} />
                          <span>{totalChapters} Chapters</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className={`w-3.5 h-3.5 ${colors.textMuted}`} />
                          <span>~{estimatedHours}h</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Award className={`w-3.5 h-3.5 ${colors.textMuted}`} />
                          <span>80% Pass</span>
                        </div>
                      </div>

                      {hasContent && totalChapters > 0 && (
                        <CourseProgressBar
                          label="Course Progress"
                          completed={completedChapters}
                          total={totalChapters}
                          colorClass={colors.progressFill}
                        />
                      )}

                      {/* Certificate badge when final assessment passed */}
                      {hasPassedAssessment(level.level, 0, activeTab) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/university/${activeTab}/level-${level.level}/certificate`); }}
                          className={`flex items-center gap-2 text-xs ${colors.text} hover:underline mt-3`}
                        >
                          <Award className="w-4 h-4" />
                          <span className="font-display tracking-wider">VIEW CERTIFICATE</span>
                        </button>
                      )}

                      {!hasContent && !isLocked && (
                        <div className={`flex items-center gap-2 text-xs ${colors.text}`}>
                          <Flame className="w-3.5 h-3.5" />
                          <span className="font-display tracking-wider">IN DEVELOPMENT</span>
                        </div>
                      )}

                      {isLocked && (
                        <p className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                          <Lock className="w-3 h-3" />
                          Pass the Level {level.level - 1} Final Assessment to unlock
                        </p>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Bottom motto */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-14 space-y-2"
        >
          <p className="text-primary font-display text-lg tracking-wider">
            KNOWLEDGE IS POWER. EDUCATION IS FREEDOM.
          </p>
          <p className="text-xs text-muted-foreground">
            Learn what matters. Apply what you learn. Live without limits.
          </p>
        </motion.div>
      </main>

      <AdminControlPanel />
    </div>
  );
}

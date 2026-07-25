import { useNavigate, useParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronLeft, CheckCircle, XCircle, RotateCcw, Trophy, BookOpen, Award } from 'lucide-react';
import { getAssessment, getUnitData } from '@/lib/university/courseStructure';
import { useUniversityProgress } from '@/hooks/useUniversityProgress';
import { useUniversityAdmin } from '@/hooks/useUniversityAdmin';
import { useCourseAccess } from '@/hooks/useCourseAccess';
import { toCourseKey } from '@/lib/coursePricing';
import { SubscriptionUpgradeBanner } from '@/components/university/SubscriptionUpgradeBanner';
import { AdminControlPanel } from '@/components/university/AdminControlPanel';
import { getCourseColors } from '@/lib/university/courseColors';
import { toast } from 'sonner';
import type { AssessmentQuestion } from '@/lib/university/types';
import confetti from 'canvas-confetti';

function pickRandom(bank: AssessmentQuestion[], count: number): AssessmentQuestion[] {
  const shuffled = [...bank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function fireConfetti() {
  const duration = 2000;
  const end = Date.now() + duration;
  const colors = ['#ff6a00', '#ff9500', '#22c55e', '#fbbf24'];
  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export default function UniversityAssessment() {
  const { courseType, level, unit } = useParams();
  const navigate = useNavigate();
  const ct = courseType || 'gym';
  const levelNum = parseInt(level?.replace('level-', '') || '2');
  const unitNum = parseInt(unit?.replace('unit-', '') || '1');
  const colors = getCourseColors(ct);

  const courseKey = toCourseKey(ct, levelNum);
  const { hasAccess, loading: accessLoading } = useCourseAccess(courseKey);

  const assessment = getAssessment(levelNum, unitNum, ct);
  const unitData = getUnitData(levelNum, unitNum, ct);
  const { submitAssessment, getBestAssessment } = useUniversityProgress();
  const { effectiveShowAnswers } = useUniversityAdmin();
  const best = getBestAssessment(levelNum, unitNum, ct);

  const isFinal = unitNum === 0;
  const pickCount = assessment?.pickCount;

  const [seed, setSeed] = useState(0);
  const questions = useMemo(() => {
    if (!assessment) return [];
    if (pickCount && pickCount < assessment.questions.length) {
      return pickRandom(assessment.questions, pickCount);
    }
    return assessment.questions;
  }, [assessment, pickCount, seed]);

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  if (!assessment || !questions.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Assessment not found</p>
      </div>
    );
  }

  // Subscription gate — can't take assessments without an active subscription
  if (!accessLoading && !hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-6 container mx-auto px-4 max-w-2xl">
          <SubscriptionUpgradeBanner />
        </div>
      </div>
    );
  }

  const total = questions.length;
  const passMarkPercent = assessment.passMarkPercent;

  const handleSelect = (value: string) => {
    const updated = [...answers];
    updated[currentQ] = parseInt(value);
    setAnswers(updated);
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correctAnswer) correct++; });
    setScore(correct);
    setSubmitted(true);
    const passed = Math.round((correct / total) * 100) >= passMarkPercent;
    if (passed) {
      setTimeout(fireConfetti, 300);
    }
    submitAssessment.mutate(
      { level: levelNum, unitNumber: unitNum, isFinal, score: correct, total, passed, answers: answers as number[], courseType: ct },
      { onSuccess: () => { passed ? toast.success('Assessment passed! Well done.') : toast('Keep going — review the content and try again.'); } }
    );
  };

  const handleRetry = () => {
    setSeed(s => s + 1);
    setAnswers(new Array(pickCount || assessment.questions.length).fill(null));
    setCurrentQ(0);
    setSubmitted(false);
    setScore(0);
  };

  const allAnswered = answers.every(a => a !== null);
  const percent = Math.round((score / total) * 100);
  const passed = percent >= passMarkPercent;
  const question = questions[currentQ];

  const headerLabel = isFinal ? `LEVEL ${levelNum} — FINAL ASSESSMENT` : `LEVEL ${levelNum} — UNIT ${unitNum} ASSESSMENT`;
  const backLabel = isFinal ? `Back to Level ${levelNum}` : `Unit ${unitNum}: ${unitData?.title}`;
  const HeaderIcon = isFinal ? Trophy : BookOpen;

  /* ── Results screen ── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
<div className="pt-6 pb-6 border-b border-primary/20 relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-b ${colors.bgGradient} opacity-20 pointer-events-none`} />
          <div className="container mx-auto px-4 max-w-2xl relative z-10">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/university/${ct}/level-${levelNum}`)} className="mb-2 -ml-2 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-4 h-4 mr-1" /> {backLabel}
            </Button>
            <p className={`text-xs ${colors.text} font-display tracking-wider`}>{headerLabel} — RESULTS</p>
            <h1 className="font-display text-xl sm:text-2xl tracking-wider text-foreground mt-1">{assessment.title}</h1>
          </div>
        </div>
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <Card className={`p-8 text-center border-2 ${passed ? 'border-primary/40 bg-primary/5' : 'border-destructive/40 bg-destructive/5'}`}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                    passed ? 'bg-primary/15' : 'bg-destructive/15'
                  }`}
                >
                  {passed ? <CheckCircle className="w-8 h-8 text-primary" /> : <XCircle className="w-8 h-8 text-destructive" />}
                </motion.div>
                <h3 className="font-display text-2xl tracking-wider text-foreground mb-2">{passed ? 'PASSED' : 'NOT YET'}</h3>
                <p className="text-muted-foreground text-sm mb-1">
                  You scored <span className="text-foreground font-medium">{score}/{total}</span> ({percent}%)
                </p>
                <p className="text-muted-foreground text-xs">Pass mark: {passMarkPercent}%</p>
                {!passed && pickCount && <p className="text-muted-foreground text-xs mt-3">Review the content and try again. You'll get different questions next time.</p>}
                {!passed && !pickCount && <p className="text-muted-foreground text-xs mt-3">Review the content and try again. You've got this.</p>}
              </Card>
            </motion.div>

            <div className="space-y-3">
              {questions.map((q, i) => {
                const isCorrect = answers[i] === q.correctAnswer;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.04 }}
                  >
                    <Card className={`p-4 border ${isCorrect ? 'border-primary/20' : 'border-destructive/20'}`}>
                      <div className="flex items-start gap-2.5 mb-2">
                        {isCorrect ? <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" /> : <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />}
                        <p className="text-sm text-foreground font-medium">{q.question}</p>
                      </div>
                      {q.scenario && <p className="text-xs text-muted-foreground italic ml-6.5 pl-[2px] mb-2">{q.scenario}</p>}
                      <p className="text-xs text-muted-foreground ml-6.5 pl-[2px]">
                        {isCorrect ? 'Correct' : `Your answer: ${q.options[answers[i]!]}`}
                        {!isCorrect && ` → Correct: ${q.options[q.correctAnswer]}`}
                      </p>
                      <p className={`text-xs ${colors.textMuted} ml-6.5 pl-[2px] mt-1 leading-relaxed`}>{q.explanation}</p>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {!passed && (
              <Button onClick={handleRetry} className="w-full gap-2 h-12">
                <RotateCcw className="w-5 h-5" /> {pickCount ? 'Try Again with New Questions' : 'Try Again'}
              </Button>
            )}
            {passed && (
              <div className="space-y-3">
                {isFinal && (
                  <Button
                    onClick={() => navigate(`/university/${ct}/level-${levelNum}/certificate`)}
                    className="w-full gap-2 h-12 bg-orange-600 hover:bg-orange-700"
                  >
                    <Award className="w-5 h-5" /> View Your Certificate
                  </Button>
                )}
                <Button onClick={() => navigate(`/university/${ct}/level-${levelNum}`)} className="w-full gap-2 h-12" variant={isFinal ? 'outline' : 'default'}>
                  <CheckCircle className="w-5 h-5" /> Back to Level {levelNum}
                </Button>
              </div>
            )}
          </div>
        </main>
</div>
    );
  }

  /* ── Assessment screen ── */
  return (
    <div className="min-h-screen bg-background">
<div className="pt-6 pb-6 border-b border-primary/20 relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-b ${colors.bgGradient} opacity-20 pointer-events-none`} />
        <div className="container mx-auto px-4 max-w-2xl relative z-10">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/university/${ct}/level-${levelNum}`)} className="mb-2 -ml-2 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4 mr-1" /> {backLabel}
          </Button>
          <div className="flex items-center gap-3 mb-1">
            <HeaderIcon className={`w-5 h-5 ${colors.text}`} />
            <p className={`text-xs ${colors.text} font-display tracking-wider`}>{headerLabel}</p>
          </div>
          <h1 className="font-display text-xl sm:text-2xl tracking-wider text-foreground">{assessment.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} questions — {passMarkPercent}% to pass
            {pickCount && <span className="text-xs ml-1">(drawn from a larger bank)</span>}
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Question {currentQ + 1} of {total}</span>
              <span>{answers.filter(a => a !== null).length} answered</span>
            </div>
            <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${colors.progressFill} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${((currentQ + 1) / total) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <motion.div key={`${seed}-${currentQ}`} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
            <Card className={`p-6 ${colors.border}`}>
              {question.scenario && (
                <div className="bg-muted/30 rounded-xl p-4 mb-5 border border-border/50">
                  <p className="text-[10px] font-display tracking-wider text-muted-foreground mb-1.5">SCENARIO</p>
                  <p className="text-sm text-foreground leading-relaxed">{question.scenario}</p>
                </div>
              )}
              <p className="text-foreground font-medium text-sm mb-5 leading-relaxed">{question.question}</p>
              <RadioGroup value={answers[currentQ]?.toString() ?? ''} onValueChange={handleSelect} className="space-y-2.5">
                {question.options.map((opt, i) => {
                  const isCorrectAnswer = effectiveShowAnswers && i === question.correctAnswer;
                  const isSelected = answers[currentQ] === i;
                  return (
                    <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                      isCorrectAnswer
                        ? 'border-primary/50 bg-primary/10'
                        : isSelected
                        ? `${colors.borderActive} ${colors.bg}`
                        : `border-border hover:${colors.border}`
                    }`}>
                      <RadioGroupItem value={i.toString()} id={`q${currentQ}-o${i}`} className="mt-0.5" />
                      <Label htmlFor={`q${currentQ}-o${i}`} className="text-sm text-foreground cursor-pointer leading-relaxed flex-1">
                        {opt}
                        {isCorrectAnswer && <span className="ml-2 text-primary text-xs">✓ correct</span>}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </Card>
          </motion.div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0} className="flex-1 h-11">Previous</Button>
            {currentQ < total - 1 ? (
              <Button onClick={() => setCurrentQ(currentQ + 1)} disabled={answers[currentQ] === null} className="flex-1 h-11">Next</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!allAnswered} className="flex-1 h-11">Submit Assessment</Button>
            )}
          </div>

          {/* Question dots */}
          <div className="flex justify-center gap-1.5 flex-wrap">
            {questions.map((_, i) => (
              <button key={i} onClick={() => setCurrentQ(i)} className={`w-7 h-7 rounded-full text-xs font-medium transition-all ${
                i === currentQ ? `${colors.progressFill} text-foreground scale-110` : answers[i] !== null ? `${colors.bg} ${colors.text}` : 'bg-muted text-muted-foreground'
              }`}>{i + 1}</button>
            ))}
          </div>
        </div>
      </main>
      <AdminControlPanel />
</div>
  );
}

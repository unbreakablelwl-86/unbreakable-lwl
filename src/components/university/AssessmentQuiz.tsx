import { useState } from 'react';
import type { UnitAssessment } from '@/lib/university/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface Props {
  assessment: UnitAssessment;
  onComplete: (score: number, total: number, passed: boolean, answers: number[]) => void;
  bestScore?: { score: number; total: number; passed: boolean } | null;
}

export function AssessmentQuiz({ assessment, onComplete, bestScore }: Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(assessment.questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const question = assessment.questions[currentQ];
  const passMarkPercent = assessment.passMarkPercent;

  const handleSelect = (value: string) => {
    const updated = [...answers];
    updated[currentQ] = parseInt(value);
    setAnswers(updated);
  };

  const handleSubmit = () => {
    let correct = 0;
    assessment.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    setScore(correct);
    setSubmitted(true);
    const passed = Math.round((correct / assessment.questions.length) * 100) >= passMarkPercent;
    onComplete(correct, assessment.questions.length, passed, answers as number[]);
  };

  const handleRetry = () => {
    setAnswers(new Array(assessment.questions.length).fill(null));
    setCurrentQ(0);
    setSubmitted(false);
    setScore(0);
  };

  const allAnswered = answers.every(a => a !== null);
  const total = assessment.questions.length;
  const percent = Math.round((score / total) * 100);
  const passed = percent >= passMarkPercent;

  if (submitted) {
    return (
      <div className="space-y-6">
        <Card className={`p-6 text-center border-2 ${passed ? 'border-primary/50 bg-primary/10' : 'border-destructive/50 bg-destructive/10'}`}>
          {passed ? (
            <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
          ) : (
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
          )}
          <h3 className="font-display text-2xl tracking-wider text-foreground mb-1">
            {passed ? 'PASSED' : 'NOT YET'}
          </h3>
          <p className="text-muted-foreground text-sm mb-2">
            You scored {score}/{total} ({percent}%) — Pass mark: {passMarkPercent}%
          </p>
          {!passed && (
            <p className="text-muted-foreground text-xs">Review the content and try again. You've got this.</p>
          )}
        </Card>

        {/* Review answers */}
        <div className="space-y-4">
          {assessment.questions.map((q, i) => {
            const isCorrect = answers[i] === q.correctAnswer;
            return (
              <Card key={i} className={`p-4 border ${isCorrect ? 'border-primary/30' : 'border-destructive/30'}`}>
                <div className="flex items-start gap-2 mb-2">
                  {isCorrect ? (
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                  )}
                  <p className="text-sm text-foreground font-medium">{q.question}</p>
                </div>
                {q.scenario && (
                  <p className="text-xs text-muted-foreground italic ml-6 mb-2">{q.scenario}</p>
                )}
                <p className="text-xs text-muted-foreground ml-6">
                  {isCorrect ? 'Correct' : `Your answer: ${q.options[answers[i]!]}`}
                  {!isCorrect && ` → Correct: ${q.options[q.correctAnswer]}`}
                </p>
                <p className="text-xs text-primary/80 ml-6 mt-1">{q.explanation}</p>
              </Card>
            );
          })}
        </div>

        {!passed && (
          <Button onClick={handleRetry} className="w-full gap-2">
            <RotateCcw className="w-4 h-4" /> Try Again
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Question {currentQ + 1} of {total}</span>
        <span>{answers.filter(a => a !== null).length} answered</span>
      </div>

      {/* Question */}
      <Card className="p-5 border-border bg-card">
        {question.scenario && (
          <div className="bg-muted/50 rounded-lg p-3 mb-4">
            <p className="text-xs font-display tracking-wider text-muted-foreground mb-1">SCENARIO</p>
            <p className="text-sm text-foreground leading-relaxed">{question.scenario}</p>
          </div>
        )}
        <p className="text-foreground font-medium text-sm mb-4">{question.question}</p>
        <RadioGroup
          value={answers[currentQ]?.toString() ?? ''}
          onValueChange={handleSelect}
          className="space-y-3"
        >
          {question.options.map((opt, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors">
              <RadioGroupItem value={i.toString()} id={`q${currentQ}-o${i}`} className="mt-0.5" />
              <Label htmlFor={`q${currentQ}-o${i}`} className="text-sm text-foreground cursor-pointer leading-relaxed">
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
          disabled={currentQ === 0}
          className="flex-1"
        >
          Previous
        </Button>
        {currentQ < total - 1 ? (
          <Button
            onClick={() => setCurrentQ(currentQ + 1)}
            disabled={answers[currentQ] === null}
            className="flex-1"
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="flex-1"
          >
            Submit Assessment
          </Button>
        )}
      </div>

      {/* Question dots */}
      <div className="flex justify-center gap-1.5 flex-wrap">
        {assessment.questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQ(i)}
            className={`w-7 h-7 rounded-full text-xs font-medium transition-colors ${
              i === currentQ
                ? 'bg-primary text-primary-foreground'
                : answers[i] !== null
                ? 'bg-primary/20 text-primary'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

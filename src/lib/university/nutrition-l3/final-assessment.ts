import type { UnitAssessment } from '../types';
import { nutritionL3Unit1Assessment } from './assessments';
import { nutritionL3Unit2Assessment } from './unit2-assessments';
import { nutritionL3Unit3Assessment } from './unit3-assessments';
import { nutritionL3Unit4Assessment } from './unit4-assessments';

export const nutritionL3FinalAssessment: UnitAssessment = {
  unitNumber: 0, title: 'Level 3 Nutrition Final Assessment',
  passMarkPercent: 80, pickCount: 40,
  questions: [
    ...nutritionL3Unit1Assessment.questions,
    ...nutritionL3Unit2Assessment.questions,
    ...nutritionL3Unit3Assessment.questions,
    ...nutritionL3Unit4Assessment.questions,
  ],
};

// ── Chapter Quizzes ──
function cq(unit: number, ch: number, questions: any[]): ChapterQuiz {
  return { unitNumber: unit, chapterNumber: ch, questionBank: questions, pickCount: 5, passMarkPercent: 80 };

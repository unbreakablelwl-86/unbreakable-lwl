import type { Level, ChapterQuiz, CourseDefinition } from './types';
import { level2Unit1 } from './level2/unit1';
import { level2Unit2 } from './level2/unit2';
import { level2Unit3 } from './level2/unit3';
import { level2Unit4 } from './level2/unit4';
import { level2Unit1Assessment } from './level2/assessments';
import { level2Unit2Assessment } from './level2/unit2-assessments';
import { level2Unit3Assessment } from './level2/unit3-assessments';
import { level2Unit4Assessment } from './level2/unit4-assessments';
import { level2FinalAssessment } from './level2/final-assessment';
import { unit1ChapterQuizzes } from './level2/unit1-chapter-quizzes';
import { unit2ChapterQuizzes } from './level2/unit2-chapter-quizzes';
import { unit3ChapterQuizzes } from './level2/unit3-chapter-quizzes';
import { unit4ChapterQuizzes } from './level2/unit4-chapter-quizzes';

// Level 3 imports
import { level3Unit1 } from './level3/unit1';
import { level3Unit2 } from './level3/unit2';
import { level3Unit3 } from './level3/unit3';
import { level3Unit4 } from './level3/unit4';
import { level3Unit1Assessment } from './level3/assessments';
import { level3Unit2Assessment } from './level3/unit2-assessments';
import { level3Unit3Assessment } from './level3/unit3-assessments';
import { level3Unit4Assessment } from './level3/unit4-assessments';
import { level3FinalAssessment } from './level3/final-assessment';
import { level3Unit1ChapterQuizzes } from './level3/unit1-chapter-quizzes';
import { level3Unit2ChapterQuizzes } from './level3/unit2-chapter-quizzes';
import { level3Unit3ChapterQuizzes } from './level3/unit3-chapter-quizzes';
import { level3Unit4ChapterQuizzes } from './level3/unit4-chapter-quizzes';

// Nutrition Level 2 imports
import { nutritionL2Unit1 } from './nutrition-l2/unit1';
import { nutritionL2Unit2 } from './nutrition-l2/unit2';
import { nutritionL2Unit3 } from './nutrition-l2/unit3';
import { nutritionL2Unit4 } from './nutrition-l2/unit4';
import { nutritionL2Unit1Assessment } from './nutrition-l2/assessments';
import { nutritionL2Unit2Assessment } from './nutrition-l2/unit2-assessments';
import { nutritionL2Unit3Assessment } from './nutrition-l2/unit3-assessments';
import { nutritionL2Unit4Assessment } from './nutrition-l2/unit4-assessments';
import { nutritionL2FinalAssessment } from './nutrition-l2/final-assessment';
import { nutritionL2Unit1ChapterQuizzes } from './nutrition-l2/unit1-chapter-quizzes';
import { nutritionL2Unit2ChapterQuizzes } from './nutrition-l2/unit2-chapter-quizzes';
import { nutritionL2Unit3ChapterQuizzes } from './nutrition-l2/unit3-chapter-quizzes';
import { nutritionL2Unit4ChapterQuizzes } from './nutrition-l2/unit4-chapter-quizzes';

// Nutrition Level 3 imports
import { nutritionL3Unit1 } from './nutrition-l3/unit1';
import { nutritionL3Unit2 } from './nutrition-l3/unit2';
import { nutritionL3Unit3 } from './nutrition-l3/unit3';
import { nutritionL3Unit4 } from './nutrition-l3/unit4';
import { nutritionL3Unit1Assessment } from './nutrition-l3/assessments';
import { nutritionL3Unit2Assessment } from './nutrition-l3/unit2-assessments';
import { nutritionL3Unit3Assessment } from './nutrition-l3/unit3-assessments';
import { nutritionL3Unit4Assessment } from './nutrition-l3/unit4-assessments';
import { nutritionL3FinalAssessment } from './nutrition-l3/final-assessment';
import { nutritionL3Unit1ChapterQuizzes } from './nutrition-l3/unit1-chapter-quizzes';
import { nutritionL3Unit2ChapterQuizzes } from './nutrition-l3/unit2-chapter-quizzes';
import { nutritionL3Unit3ChapterQuizzes } from './nutrition-l3/unit3-chapter-quizzes';
import { nutritionL3Unit4ChapterQuizzes } from './nutrition-l3/unit4-chapter-quizzes';

// Mindset Level 2 imports
import { mindsetL2Unit1 } from './mindset-l2/unit1';
import { mindsetL2Unit2 } from './mindset-l2/unit2';
import { mindsetL2Unit3 } from './mindset-l2/unit3';
import { mindsetL2Unit4 } from './mindset-l2/unit4';
import { mindsetL2Unit1Assessment } from './mindset-l2/assessments';
import { mindsetL2Unit2Assessment } from './mindset-l2/unit2-assessments';
import { mindsetL2Unit3Assessment } from './mindset-l2/unit3-assessments';
import { mindsetL2Unit4Assessment } from './mindset-l2/unit4-assessments';
import { mindsetL2FinalAssessment } from './mindset-l2/final-assessment';
import { mindsetL2Unit1ChapterQuizzes } from './mindset-l2/unit1-chapter-quizzes';
import { mindsetL2Unit2ChapterQuizzes } from './mindset-l2/unit2-chapter-quizzes';
import { mindsetL2Unit3ChapterQuizzes } from './mindset-l2/unit3-chapter-quizzes';
import { mindsetL2Unit4ChapterQuizzes } from './mindset-l2/unit4-chapter-quizzes';

// Mindset Level 3 imports
import { mindsetL3Unit1 } from './mindset-l3/unit1';
import { mindsetL3Unit2 } from './mindset-l3/unit2';
import { mindsetL3Unit3 } from './mindset-l3/unit3';
import { mindsetL3Unit4 } from './mindset-l3/unit4';
import { mindsetL3Unit1Assessment } from './mindset-l3/assessments';
import { mindsetL3Unit2Assessment } from './mindset-l3/unit2-assessments';
import { mindsetL3Unit3Assessment } from './mindset-l3/unit3-assessments';
import { mindsetL3Unit4Assessment } from './mindset-l3/unit4-assessments';
import { mindsetL3FinalAssessment } from './mindset-l3/final-assessment';
import { mindsetL3Unit1ChapterQuizzes } from './mindset-l3/unit1-chapter-quizzes';
import { mindsetL3Unit2ChapterQuizzes } from './mindset-l3/unit2-chapter-quizzes';
import { mindsetL3Unit3ChapterQuizzes } from './mindset-l3/unit3-chapter-quizzes';
import { mindsetL3Unit4ChapterQuizzes } from './mindset-l3/unit4-chapter-quizzes';

export const PASS_MARK_PERCENT = 80;

const level2ChapterQuizzes: ChapterQuiz[] = [
  ...unit1ChapterQuizzes,
  ...unit2ChapterQuizzes,
  ...unit3ChapterQuizzes,
  ...unit4ChapterQuizzes,
];

const level3ChapterQuizzes: ChapterQuiz[] = [
  ...level3Unit1ChapterQuizzes,
  ...level3Unit2ChapterQuizzes,
  ...level3Unit3ChapterQuizzes,
  ...level3Unit4ChapterQuizzes,
];

const nutritionL2ChapterQuizzes: ChapterQuiz[] = [
  ...nutritionL2Unit1ChapterQuizzes,
  ...nutritionL2Unit2ChapterQuizzes,
  ...nutritionL2Unit3ChapterQuizzes,
  ...nutritionL2Unit4ChapterQuizzes,
];

const nutritionL3ChapterQuizzes: ChapterQuiz[] = [
  ...nutritionL3Unit1ChapterQuizzes,
  ...nutritionL3Unit2ChapterQuizzes,
  ...nutritionL3Unit3ChapterQuizzes,
  ...nutritionL3Unit4ChapterQuizzes,
];

export const courseData: Level[] = [
  {
    level: 2,
    title: 'Level 2 Certificate',
    subtitle: 'Foundation',
    description: 'Master the fundamentals of anatomy, nutrition, exercise science, and programme building. This level provides the essential knowledge every serious gym user needs.',
    units: [level2Unit1, level2Unit2, level2Unit3, level2Unit4],
    assessments: [level2Unit1Assessment, level2Unit2Assessment, level2Unit3Assessment, level2Unit4Assessment],
    finalAssessment: level2FinalAssessment,
    chapterQuizzes: level2ChapterQuizzes,
  },
  {
    level: 3,
    title: 'Level 3 Certificate',
    subtitle: 'Advanced Application',
    description: 'Take your knowledge further with advanced nutrition strategies, hypertrophy science, periodised programme design, and the psychology of long-term adherence.',
    units: [level3Unit1, level3Unit2, level3Unit3, level3Unit4],
    assessments: [level3Unit1Assessment, level3Unit2Assessment, level3Unit3Assessment, level3Unit4Assessment],
    finalAssessment: level3FinalAssessment,
    chapterQuizzes: level3ChapterQuizzes,
  },
];

export const nutritionCourseData: Level[] = [
  {
    level: 2,
    title: 'Level 2 Certificate',
    subtitle: 'Foundation Nutrition',
    description: 'Master the fundamentals of healthy eating, food safety, nutritional needs across life stages, and practical meal planning skills.',
    units: [nutritionL2Unit1, nutritionL2Unit2, nutritionL2Unit3, nutritionL2Unit4],
    assessments: [nutritionL2Unit1Assessment, nutritionL2Unit2Assessment, nutritionL2Unit3Assessment, nutritionL2Unit4Assessment],
    finalAssessment: nutritionL2FinalAssessment,
    chapterQuizzes: nutritionL2ChapterQuizzes,
  },
  {
    level: 3,
    title: 'Level 3 Certificate',
    subtitle: 'Advanced Nutrition',
    description: 'Master advanced macronutrient science, evidence-based supplementation, sports nutrition strategies, and the psychology of sustainable behaviour change.',
    units: [nutritionL3Unit1, nutritionL3Unit2, nutritionL3Unit3, nutritionL3Unit4],
    assessments: [nutritionL3Unit1Assessment, nutritionL3Unit2Assessment, nutritionL3Unit3Assessment, nutritionL3Unit4Assessment],
    finalAssessment: nutritionL3FinalAssessment,
    chapterQuizzes: nutritionL3ChapterQuizzes,
  },
];

const mindsetL2ChapterQuizzes: ChapterQuiz[] = [
  ...mindsetL2Unit1ChapterQuizzes,
  ...mindsetL2Unit2ChapterQuizzes,
  ...mindsetL2Unit3ChapterQuizzes,
  ...mindsetL2Unit4ChapterQuizzes,
];

const mindsetL3ChapterQuizzes: ChapterQuiz[] = [
  ...mindsetL3Unit1ChapterQuizzes,
  ...mindsetL3Unit2ChapterQuizzes,
  ...mindsetL3Unit3ChapterQuizzes,
  ...mindsetL3Unit4ChapterQuizzes,
];

export const mindsetCourseData: Level[] = [
  {
    level: 2,
    title: 'Level 2 Certificate',
    subtitle: 'Foundation Mindset',
    description: 'Master the foundations of mental resilience, breathing science, focus, habit formation, and daily practices that build unshakeable mental strength.',
    units: [mindsetL2Unit1, mindsetL2Unit2, mindsetL2Unit3, mindsetL2Unit4],
    assessments: [mindsetL2Unit1Assessment, mindsetL2Unit2Assessment, mindsetL2Unit3Assessment, mindsetL2Unit4Assessment],
    finalAssessment: mindsetL2FinalAssessment,
    chapterQuizzes: mindsetL2ChapterQuizzes,
  },
  {
    level: 3,
    title: 'Level 3 Certificate',
    subtitle: 'Advanced Mindset',
    description: 'Master advanced stress physiology, emotional regulation, exposure science, cognitive performance, motivation theory, and build a lifelong resilience system.',
    units: [mindsetL3Unit1, mindsetL3Unit2, mindsetL3Unit3, mindsetL3Unit4],
    assessments: [mindsetL3Unit1Assessment, mindsetL3Unit2Assessment, mindsetL3Unit3Assessment, mindsetL3Unit4Assessment],
    finalAssessment: mindsetL3FinalAssessment,
    chapterQuizzes: mindsetL3ChapterQuizzes,
  },
];

export const allCourses: Record<string, Level[]> = {
  gym: courseData,
  nutrition: nutritionCourseData,
  mindset: mindsetCourseData,
};

// Helper functions — default to gym course, accept optional courseType
export function getLevelData(level: number, courseType: string = 'gym'): Level | undefined {
  const levels = allCourses[courseType] || courseData;
  return levels.find(l => l.level === level);
}

export function getUnitData(level: number, unitNumber: number, courseType: string = 'gym') {
  const levelData = getLevelData(level, courseType);
  return levelData?.units.find(u => u.number === unitNumber);
}

export function getChapterData(level: number, unitNumber: number, chapterNumber: number, courseType: string = 'gym') {
  const unit = getUnitData(level, unitNumber, courseType);
  return unit?.chapters.find(c => c.number === chapterNumber);
}

export function getAssessment(level: number, unitNumber: number, courseType: string = 'gym') {
  const levelData = getLevelData(level, courseType);
  if (unitNumber === 0) return levelData?.finalAssessment;
  return levelData?.assessments.find(a => a.unitNumber === unitNumber);
}

export function getChapterQuiz(level: number, unitNumber: number, chapterNumber: number, courseType: string = 'gym'): ChapterQuiz | undefined {
  const levelData = getLevelData(level, courseType);
  return levelData?.chapterQuizzes.find(
    q => q.unitNumber === unitNumber && q.chapterNumber === chapterNumber
  );
}

export function getTotalChapters(level: number, courseType: string = 'gym'): number {
  const levelData = getLevelData(level, courseType);
  if (!levelData) return 0;
  return levelData.units.reduce((sum, u) => sum + u.chapters.length, 0);
}

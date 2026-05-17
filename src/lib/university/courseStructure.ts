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

// Nutrition Level 4 imports
import { nutritionL4Unit1 } from './nutrition-l4/unit1';
import { nutritionL4Unit2 } from './nutrition-l4/unit2';
import { nutritionL4Unit3 } from './nutrition-l4/unit3';
import { nutritionL4Unit4 } from './nutrition-l4/unit4';
import { nutritionL4Unit1Assessment } from './nutrition-l4/unit1-assessments';
import { nutritionL4Unit2Assessment } from './nutrition-l4/unit2-assessments';
import { nutritionL4Unit3Assessment } from './nutrition-l4/unit3-assessments';
import { nutritionL4Unit4Assessment } from './nutrition-l4/unit4-assessments';
import { nutritionL4FinalAssessment } from './nutrition-l4/final-assessment';
import { nutritionL4Unit1ChapterQuizzes } from './nutrition-l4/unit1-chapter-quizzes';
import { nutritionL4Unit2ChapterQuizzes } from './nutrition-l4/unit2-chapter-quizzes';
import { nutritionL4Unit3ChapterQuizzes } from './nutrition-l4/unit3-chapter-quizzes';
import { nutritionL4Unit4ChapterQuizzes } from './nutrition-l4/unit4-chapter-quizzes';

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

// Level 4 (Power) imports
import { level4Unit1 } from './level4/unit1';
import { level4Unit2 } from './level4/unit2';
import { level4Unit3 } from './level4/unit3';
import { level4Unit4 } from './level4/unit4';
import { level4Unit1Assessment } from './level4/unit1-assessments';
import { level4Unit2Assessment } from './level4/unit2-assessments';
import { level4Unit3Assessment } from './level4/unit3-assessments';
import { level4Unit4Assessment } from './level4/unit4-assessments';
import { level4FinalAssessment } from './level4/final-assessment';
import { level4Unit1ChapterQuizzes } from './level4/unit1-chapter-quizzes';
import { level4Unit2ChapterQuizzes } from './level4/unit2-chapter-quizzes';
import { level4Unit3ChapterQuizzes } from './level4/unit3-chapter-quizzes';
import { level4Unit4ChapterQuizzes } from './level4/unit4-chapter-quizzes';

// Individual Sport course imports
import { sportFootballUnit1 } from './sport-football/unit1';
import { sportFootballUnit1Assessment } from './sport-football/unit1-assessments';
import { sportFootballFinalAssessment } from './sport-football/final-assessment';
import { sportFootballUnit1ChapterQuizzes } from './sport-football/unit1-chapter-quizzes';

import { sportBoxingUnit1 } from './sport-boxing/unit1';
import { sportBoxingUnit1Assessment } from './sport-boxing/unit1-assessments';
import { sportBoxingFinalAssessment } from './sport-boxing/final-assessment';
import { sportBoxingUnit1ChapterQuizzes } from './sport-boxing/unit1-chapter-quizzes';

import { sportRugbyUnit1 } from './sport-rugby/unit1';
import { sportRugbyUnit1Assessment } from './sport-rugby/unit1-assessments';
import { sportRugbyFinalAssessment } from './sport-rugby/final-assessment';
import { sportRugbyUnit1ChapterQuizzes } from './sport-rugby/unit1-chapter-quizzes';

import { sportRunningUnit1 } from './sport-running/unit1';
import { sportRunningUnit1Assessment } from './sport-running/unit1-assessments';
import { sportRunningFinalAssessment } from './sport-running/final-assessment';
import { sportRunningUnit1ChapterQuizzes } from './sport-running/unit1-chapter-quizzes';

import { sportSwimmingUnit1 } from './sport-swimming/unit1';
import { sportSwimmingUnit1Assessment } from './sport-swimming/unit1-assessments';
import { sportSwimmingFinalAssessment } from './sport-swimming/final-assessment';
import { sportSwimmingUnit1ChapterQuizzes } from './sport-swimming/unit1-chapter-quizzes';

import { sportMMAUnit1 } from './sport-mma/unit1';
import { sportMMAUnit1Assessment } from './sport-mma/unit1-assessments';
import { sportMMAFinalAssessment } from './sport-mma/final-assessment';
import { sportMMAUnit1ChapterQuizzes } from './sport-mma/unit1-chapter-quizzes';

import { sportCyclingUnit1 } from './sport-cycling/unit1';
import { sportCyclingUnit1Assessment } from './sport-cycling/unit1-assessments';
import { sportCyclingFinalAssessment } from './sport-cycling/final-assessment';
import { sportCyclingUnit1ChapterQuizzes } from './sport-cycling/unit1-chapter-quizzes';

import { sportTennisUnit1 } from './sport-tennis/unit1';
import { sportTennisUnit1Assessment } from './sport-tennis/unit1-assessments';
import { sportTennisFinalAssessment } from './sport-tennis/final-assessment';
import { sportTennisUnit1ChapterQuizzes } from './sport-tennis/unit1-chapter-quizzes';

import { sportBasketballUnit1 } from './sport-basketball/unit1';
import { sportBasketballUnit1Assessment } from './sport-basketball/unit1-assessments';
import { sportBasketballFinalAssessment } from './sport-basketball/final-assessment';
import { sportBasketballUnit1ChapterQuizzes } from './sport-basketball/unit1-chapter-quizzes';

import { sportCricketUnit1 } from './sport-cricket/unit1';
import { sportCricketUnit1Assessment } from './sport-cricket/unit1-assessments';
import { sportCricketFinalAssessment } from './sport-cricket/final-assessment';
import { sportCricketUnit1ChapterQuizzes } from './sport-cricket/unit1-chapter-quizzes';

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

const nutritionL4ChapterQuizzes: ChapterQuiz[] = [
  ...nutritionL4Unit1ChapterQuizzes,
  ...nutritionL4Unit2ChapterQuizzes,
  ...nutritionL4Unit3ChapterQuizzes,
  ...nutritionL4Unit4ChapterQuizzes,
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
  {
    level: 4,
    title: 'Level 4 Certificate',
    subtitle: 'Clinical & Performance Nutrition',
    description: 'Master advanced metabolic science, clinical nutrition for special populations, performance supplementation, and professional practice. The knowledge behind expert-level nutrition coaching.',
    units: [nutritionL4Unit1, nutritionL4Unit2, nutritionL4Unit3, nutritionL4Unit4],
    assessments: [nutritionL4Unit1Assessment, nutritionL4Unit2Assessment, nutritionL4Unit3Assessment, nutritionL4Unit4Assessment],
    finalAssessment: nutritionL4FinalAssessment,
    chapterQuizzes: nutritionL4ChapterQuizzes,
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

const level4ChapterQuizzes: ChapterQuiz[] = [
  ...level4Unit1ChapterQuizzes,
  ...level4Unit2ChapterQuizzes,
  ...level4Unit3ChapterQuizzes,
  ...level4Unit4ChapterQuizzes,
];

// Power Level 4 — appended to gym/power course data
const powerLevel4: Level = {
  level: 4,
  title: 'Level 4 Certificate',
  subtitle: 'Sport Science',
  description: 'Expert-level sport science covering advanced periodisation, biomechanics, sport-specific conditioning, and professional coaching practice. The knowledge behind elite performance.',
  units: [level4Unit1, level4Unit2, level4Unit3, level4Unit4],
  assessments: [level4Unit1Assessment, level4Unit2Assessment, level4Unit3Assessment, level4Unit4Assessment],
  finalAssessment: level4FinalAssessment,
  chapterQuizzes: level4ChapterQuizzes,
};

// Helper to build a sport course from a single unit
function makeSportCourse(unit: any, assessment: any, finalAssessment: any, quizzes: any[], title: string, description: string): Level[] {
  return [{
    level: 1,
    title,
    subtitle: 'Sport-Specific Training',
    description,
    units: [unit],
    assessments: [assessment],
    finalAssessment,
    chapterQuizzes: quizzes,
  }];
}

// Individual Sport course data
const footballCourse = makeSportCourse(sportFootballUnit1, sportFootballUnit1Assessment, sportFootballFinalAssessment, sportFootballUnit1ChapterQuizzes, 'Football', 'Strength, conditioning, injury prevention, nutrition, and mental skills for football performance at every level.');
const boxingCourse = makeSportCourse(sportBoxingUnit1, sportBoxingUnit1Assessment, sportBoxingFinalAssessment, sportBoxingUnit1ChapterQuizzes, 'Boxing', 'Power, conditioning, injury prevention, nutrition, and mental skills for boxing and combat preparation.');
const rugbyCourse = makeSportCourse(sportRugbyUnit1, sportRugbyUnit1Assessment, sportRugbyFinalAssessment, sportRugbyUnit1ChapterQuizzes, 'Rugby', 'Strength, speed, collision preparation, nutrition, and mental toughness for rugby union and league.');
const runningCourse = makeSportCourse(sportRunningUnit1, sportRunningUnit1Assessment, sportRunningFinalAssessment, sportRunningUnit1ChapterQuizzes, 'Running', 'Endurance development, strength training, injury prevention, nutrition, and race preparation for runners.');
const swimmingCourse = makeSportCourse(sportSwimmingUnit1, sportSwimmingUnit1Assessment, sportSwimmingFinalAssessment, sportSwimmingUnit1ChapterQuizzes, 'Swimming', 'Stroke efficiency, dryland strength, pool conditioning, nutrition, and mental skills for competitive swimming.');
const mmaCourse = makeSportCourse(sportMMAUnit1, sportMMAUnit1Assessment, sportMMAFinalAssessment, sportMMAUnit1ChapterQuizzes, 'MMA', 'Striking, grappling conditioning, strength, weight management, and fight psychology for mixed martial arts.');
const cyclingCourse = makeSportCourse(sportCyclingUnit1, sportCyclingUnit1Assessment, sportCyclingFinalAssessment, sportCyclingUnit1ChapterQuizzes, 'Cycling', 'Power development, endurance training, injury prevention, nutrition, and season planning for cyclists.');
const tennisCourse = makeSportCourse(sportTennisUnit1, sportTennisUnit1Assessment, sportTennisFinalAssessment, sportTennisUnit1ChapterQuizzes, 'Tennis', 'Rotational power, agility, match conditioning, nutrition, and mental skills for competitive tennis.');
const basketballCourse = makeSportCourse(sportBasketballUnit1, sportBasketballUnit1Assessment, sportBasketballFinalAssessment, sportBasketballUnit1ChapterQuizzes, 'Basketball', 'Vertical power, speed, conditioning, injury prevention, nutrition, and mental skills for basketball.');
const cricketCourse = makeSportCourse(sportCricketUnit1, sportCricketUnit1Assessment, sportCricketFinalAssessment, sportCricketUnit1ChapterQuizzes, 'Cricket', 'Bowling resilience, batting power, fielding speed, nutrition, and mental skills for all cricket formats.');

export const sportCourses = {
  'sport-football': footballCourse,
  'sport-boxing': boxingCourse,
  'sport-rugby': rugbyCourse,
  'sport-running': runningCourse,
  'sport-swimming': swimmingCourse,
  'sport-mma': mmaCourse,
  'sport-cycling': cyclingCourse,
  'sport-tennis': tennisCourse,
  'sport-basketball': basketballCourse,
  'sport-cricket': cricketCourse,
} as const;

export const allCourses: Record<string, Level[]> = {
  gym: [...courseData, powerLevel4],
  nutrition: nutritionCourseData,
  mindset: mindsetCourseData,
  sport: [], // Sport tab shows grid of individual sports, not levels
  ...sportCourses,
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

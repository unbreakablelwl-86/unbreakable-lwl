export interface ContentSection {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
  imagePlaceholder?: string;
  imageUrl?: string;
  imageAlt?: string;
}

export interface PracticalTask {
  title: string;
  instructions: string;
  reflectionQuestions: string[];
}

export interface Chapter {
  number: number;
  title: string;
  learningOutcome?: string;
  assessmentCriteria?: string[];
  content: ContentSection[] | string;
  unbreakableInsight?: string;
  coachNote?: string;
  practicalTask?: PracticalTask;
  // Sport-specific fields
  description?: string;
  keyTakeaways?: string;
  practicalApplication?: string;
  imagePlaceholder?: string;
}

export interface AssessmentQuestion {
  type: 'multiple_choice' | 'scenario';
  question: string;
  scenario?: string;
  options: string[];
  correctAnswer: number; // index
  explanation: string;
}

export interface UnitAssessment {
  unitNumber: number;
  title: string;
  questions: AssessmentQuestion[];
  passMarkPercent: number;
  pickCount?: number; // if set, randomly pick this many from questions bank
}

export interface Unit {
  number: number;
  title: string;
  description: string;
  chapters: Chapter[];
}

export interface ChapterQuiz {
  unitNumber: number;
  chapterNumber: number;
  questionBank: AssessmentQuestion[];
  pickCount: number;
  passMarkPercent: number;
}

export type CourseType = 'gym' | 'nutrition' | 'mindset' | 'sport' | 'sport-football' | 'sport-boxing' | 'sport-rugby' | 'sport-running' | 'sport-swimming' | 'sport-mma' | 'sport-cycling' | 'sport-tennis' | 'sport-basketball' | 'sport-cricket';

export interface Level {
  level: number;
  title: string;
  subtitle: string;
  description: string;
  units: Unit[];
  assessments: UnitAssessment[];
  finalAssessment: UnitAssessment;
  chapterQuizzes: ChapterQuiz[];
}

export interface CourseDefinition {
  courseType: CourseType;
  label: string;
  description: string;
  levels: Level[];
}

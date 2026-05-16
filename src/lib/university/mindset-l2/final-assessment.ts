import type { UnitAssessment } from '../types';
import { mindsetL2Unit1Assessment } from './assessments';
import { mindsetL2Unit2Assessment } from './unit2-assessments';
import { mindsetL2Unit3Assessment } from './unit3-assessments';
import { mindsetL2Unit4Assessment } from './unit4-assessments';

export const mindsetL2FinalAssessment: UnitAssessment = {
  unitNumber: 0, title: 'Level 2 Mindset Final Assessment',
  passMarkPercent: 80, pickCount: 40,
  questions: [
    ...mindsetL2Unit1Assessment.questions,
    ...mindsetL2Unit2Assessment.questions,
    ...mindsetL2Unit3Assessment.questions,
    ...mindsetL2Unit4Assessment.questions,
  ],
};

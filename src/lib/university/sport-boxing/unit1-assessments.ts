import type { UnitAssessment } from '../types';

export const sportBoxingUnit1Assessment: UnitAssessment = {
  unitNumber: 1,
  title: 'Boxing — Unit Assessment',
  passMarkPercent: 80,
  pickCount: 10,
  questions: [
    { type: 'multiple_choice', question: 'What blood lactate levels are recorded in elite boxing?', options: ['2-4 mmol/L', '6-8 mmol/L', '10-14 mmol/L', '18-20 mmol/L'], correctAnswer: 2, explanation: 'Boxing produces lactate levels of 10-14 mmol/L — among the highest in sport.' },
    { type: 'multiple_choice', question: 'What type of power is most important for punching?', options: ['Vertical', 'Horizontal', 'Rotational', 'Isometric'], correctAnswer: 2, explanation: 'Every punch is a rotation through the kinetic chain.' },
    { type: 'multiple_choice', question: 'What is the key to hand speed in boxing?', options: ['Maximum muscle tension', 'Relaxation until the moment of impact', 'Heavier gloves', 'Stronger shoulders only'], correctAnswer: 1, explanation: 'Tension kills speed — the fastest punchers are relaxed.' },
    { type: 'multiple_choice', question: 'What percentage of boxing injuries involve the hands?', options: ['10-20%', '25-35%', '40-50%', '60-70%'], correctAnswer: 2, explanation: 'Hand injuries account for 40-50% of all boxing injuries.' },
    { type: 'multiple_choice', question: 'What protein intake is recommended for boxers?', options: ['1.0g/kg', '1.5g/kg', '2.0-2.4g/kg', '3.5g/kg'], correctAnswer: 2, explanation: 'High protein at 2.0-2.4g/kg supports intense training demands.' },
    { type: 'multiple_choice', question: 'What is the maximum safe water weight cut?', options: ['2-3%', '5-7%', '10-12%', '15%+'], correctAnswer: 1, explanation: 'Never cut more than 5-7% through water manipulation.' },
    { type: 'multiple_choice', question: 'How should pre-fight anxiety be managed?', options: ['Suppression', 'Reframing as excitement', 'Ignoring it', 'Medication'], correctAnswer: 1, explanation: 'Reframing anxiety as excitement improves performance.' },
    { type: 'multiple_choice', question: 'What defines courage in boxing?', options: ['Absence of fear', 'Action despite fear', 'Physical size', 'Aggression'], correctAnswer: 1, explanation: 'Courage is choosing to act in the presence of fear.' },
    { type: 'multiple_choice', question: 'When should hard sparring stop before a fight?', options: ['Day before', '3 days out', '7+ days out', 'Never stop'], correctAnswer: 2, explanation: 'No hard sparring in the final 7 days protects the brain.' },
    { type: 'multiple_choice', question: 'What is the biggest fight camp mistake?', options: ['Too little training', 'Starting too hard and burning out mid-camp', 'Too much rest', 'Not enough sparring'], correctAnswer: 1, explanation: 'Excessive early intensity leads to burnout before fight night.' },
    { type: 'multiple_choice', question: 'What heart rate should boxing intervals reach?', options: ['60-70%', '75-80%', '85-95%', '100% constant'], correctAnswer: 2, explanation: 'Boxing HIIT should reach 85-95% max heart rate during work periods.' },
    { type: 'multiple_choice', question: 'What builds in-fight composure?', options: ['Reading about boxing', 'Progressive exposure to increasing sparring intensity', 'Meditation only', 'Watching fights'], correctAnswer: 1, explanation: 'Graduated exposure to contact builds comfort under fire.' },
  ],
};
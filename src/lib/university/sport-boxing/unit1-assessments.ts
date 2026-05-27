import type { UnitAssessment } from '../types';

export const sportBoxingUnit1Assessment: UnitAssessment = {
  unitNumber: 1,
  title: 'Boxing — Unit Assessment',
  passMarkPercent: 80,
  pickCount: 10,
  questions: [
    { type: 'multiple_choice', question: 'What blood lactate levels are recorded in elite boxing?', options: ['2-4 mmol/L', '18-20 mmol/L', '6-8 mmol/L', '10-14 mmol/L'], correctAnswer: 3, explanation: 'Boxing produces lactate levels of 10-14 mmol/L — among the highest in sport.' },
    { type: 'multiple_choice', question: 'What type of power is most important for punching?', options: ['Isometric', 'Vertical', 'Horizontal', 'Rotational'], correctAnswer: 3, explanation: 'Every punch is a rotation through the kinetic chain.' },
    { type: 'multiple_choice', question: 'What is the key to hand speed in boxing?', options: ['Stronger shoulders only', 'Relaxation until the moment of impact', 'Heavier gloves', 'Maximum muscle tension'], correctAnswer: 1, explanation: 'Tension kills speed — the fastest punchers are relaxed.' },
    { type: 'multiple_choice', question: 'What percentage of boxing injuries involve the hands?', options: ['60-70%', '40-50%', '25-35%', '10-20%'], correctAnswer: 1, explanation: 'Hand injuries account for 40-50% of all boxing injuries.' },
    { type: 'multiple_choice', question: 'What protein intake is recommended for boxers?', options: ['3.5g/kg', '1.0g/kg', '1.5g/kg', '2.0-2.4g/kg'], correctAnswer: 3, explanation: 'High protein at 2.0-2.4g/kg supports intense training demands.' },
    { type: 'multiple_choice', question: 'What is the maximum safe water weight cut?', options: ['10-12%', '15%+', '5-7%', '2-3%'], correctAnswer: 2, explanation: 'Never cut more than 5-7% through water manipulation.' },
    { type: 'multiple_choice', question: 'How should pre-fight anxiety be managed?', options: ['Reframing as excitement', 'Suppression', 'Ignoring it', 'Medication'], correctAnswer: 0, explanation: 'Reframing anxiety as excitement improves performance.' },
    { type: 'multiple_choice', question: 'What defines courage in boxing?', options: ['Action despite fear', 'Absence of fear', 'Aggression', 'Physical size'], correctAnswer: 0, explanation: 'Courage is choosing to act in the presence of fear.' },
    { type: 'multiple_choice', question: 'When should hard sparring stop before a fight?', options: ['Day before', 'Never stop', '3 days out', '7+ days out'], correctAnswer: 3, explanation: 'No hard sparring in the final 7 days protects the brain.' },
    { type: 'multiple_choice', question: 'What is the biggest fight camp mistake?', options: ['Too much rest', 'Not enough sparring', 'Starting too hard and burning out mid-camp', 'Too little training'], correctAnswer: 2, explanation: 'Excessive early intensity leads to burnout before fight night.' },
    { type: 'multiple_choice', question: 'What heart rate should boxing intervals reach?', options: ['75-80%', '85-95%', '60-70%', '100% constant'], correctAnswer: 1, explanation: 'Boxing HIIT should reach 85-95% max heart rate during work periods.' },
    { type: 'multiple_choice', question: 'What builds in-fight composure?', options: ['Progressive exposure to increasing sparring intensity', 'Reading about boxing', 'Watching fights', 'Meditation only'], correctAnswer: 0, explanation: 'Graduated exposure to contact builds comfort under fire.' },
  ],
};
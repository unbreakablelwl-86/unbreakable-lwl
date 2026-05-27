import type { UnitAssessment } from '../types';

export const sportCyclingUnit1Assessment: UnitAssessment = {
  unitNumber: 1,
  title: 'Cycling — Unit Assessment',
  passMarkPercent: 80,
  pickCount: 10,
  questions: [
    { type: 'multiple_choice', question: 'What peak power do track sprinters produce?', options: ['500W', '1,500W', '2,000-2,400W', '5,000W'], correctAnswer: 2, explanation: '2,000-2,400 watts peak.' },
    { type: 'multiple_choice', question: 'Strength training improves cycling by?', options: ['15%', 'No effect', '0.5%', '2-8%'], correctAnswer: 3, explanation: '2-8% improvement from heavy resistance training.' },
    { type: 'multiple_choice', question: 'What should constitute 75-80% of cycling volume?', options: ['Recovery', 'Zone 2 training', 'Threshold work', 'Sprinting'], correctAnswer: 1, explanation: 'Zone 2 builds the aerobic infrastructure.' },
    { type: 'multiple_choice', question: 'What causes most cycling knee pain?', options: ['Flat pedals', 'Improper bike fit', 'Riding too far', 'Cold weather'], correctAnswer: 1, explanation: 'Bike fit issues cause most knee pain.' },
    { type: 'multiple_choice', question: 'Grand Tour stage calorie burn?', options: ['3,000', '4,000-8,000', '1,000-2,000', '10,000+'], correctAnswer: 1, explanation: '4,000-8,000 kcal per stage.' },
    { type: 'multiple_choice', question: 'What carb intake per hour for long rides?', options: ['200g', '60-90g', '20-30g', '40-50g'], correctAnswer: 1, explanation: '60-90g per hour.' },
    { type: 'multiple_choice', question: 'What is FTP?', options: ['Fast Track Power', 'First Training Phase', 'None', 'Highest sustainable ~60min power'], correctAnswer: 3, explanation: 'Functional Threshold Power.' },
    { type: 'multiple_choice', question: 'Most effective legal cycling enhancer?', options: ['Caffeine', 'Beet juice', 'BCAAs', 'Creatine'], correctAnswer: 0, explanation: 'Caffeine at 3-6mg/kg.' },
    { type: 'multiple_choice', question: 'What indicates peak readiness (TSB)?', options: ['0', '+10 to +25', '+50', '-20'], correctAnswer: 1, explanation: 'TSB +10 to +25 is ideal.' },
    { type: 'multiple_choice', question: 'Pro road cyclist VO2max?', options: ['70-85 mL/kg/min', '50-60', '90+', '60-70'], correctAnswer: 0, explanation: '70-85 mL/kg/min.' },
    { type: 'multiple_choice', question: 'When to start eating on long rides?', options: ['Only at stops', 'Within first 30min', 'When hungry', 'After 2h'], correctAnswer: 1, explanation: 'Early fuelling prevents depletion.' },
    { type: 'multiple_choice', question: 'Off-season cycling volume?', options: ['40-50% of peak', 'Maximum', 'Zero', '100% of peak'], correctAnswer: 0, explanation: 'Reduced to 40-50% for recovery.' },
  ],
};
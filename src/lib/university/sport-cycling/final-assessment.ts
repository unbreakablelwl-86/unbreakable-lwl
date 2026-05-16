import type { UnitAssessment } from '../types';

export const sportCyclingFinalAssessment: UnitAssessment = {
  unitNumber: 0,
  title: 'Cycling — Final Assessment',
  passMarkPercent: 80,
  pickCount: 15,
  questions: [
    { type: 'multiple_choice', question: 'Track sprint peak power?', options: ['500W', '1,500W', '2,000-2,400W', '5,000W'], correctAnswer: 2, explanation: '2,000-2,400 watts.' },
    { type: 'multiple_choice', question: 'Strength training cycling benefit?', options: ['0.5%', '2-8%', '15%', 'None'], correctAnswer: 1, explanation: '2-8% improvement.' },
    { type: 'multiple_choice', question: 'Dominant training zone?', options: ['Sprint', 'Zone 2 (75-80% of volume)', 'Threshold', 'Recovery'], correctAnswer: 1, explanation: 'Zone 2 dominates volume.' },
    { type: 'multiple_choice', question: 'Primary cause of cycling knee pain?', options: ['Volume', 'Bike fit', 'Weather', 'Pedals'], correctAnswer: 1, explanation: 'Improper bike fit.' },
    { type: 'multiple_choice', question: 'Grand Tour daily burn?', options: ['2,000', '3,500', '4,000-8,000', '10,000+'], correctAnswer: 2, explanation: '4,000-8,000 kcal.' },
    { type: 'multiple_choice', question: 'Long ride carbs per hour?', options: ['20-30g', '40-50g', '60-90g', '200g'], correctAnswer: 2, explanation: '60-90g/hour.' },
    { type: 'multiple_choice', question: 'FTP definition?', options: ['First phase', 'Highest ~60min power', 'Fast power', 'Race speed'], correctAnswer: 1, explanation: 'Highest sustainable power for ~60min.' },
    { type: 'multiple_choice', question: 'Best legal cycling supplement?', options: ['Creatine', 'Caffeine', 'BCAAs', 'Iron'], correctAnswer: 1, explanation: 'Caffeine at 3-6mg/kg.' },
    { type: 'multiple_choice', question: 'TSB for peak performance?', options: ['-20', '0', '+10 to +25', '+50'], correctAnswer: 2, explanation: 'Fresh and fit range.' },
    { type: 'multiple_choice', question: 'Pro road VO2max?', options: ['50-60', '60-70', '70-85', '90+'], correctAnswer: 2, explanation: '70-85 mL/kg/min.' },
    { type: 'multiple_choice', question: 'When start eating during rides?', options: ['When hungry', 'First 30 minutes', 'After 2h', 'End only'], correctAnswer: 1, explanation: 'Within the first 30 minutes.' },
    { type: 'multiple_choice', question: 'Off-season volume target?', options: ['Max volume', '40-50% of peak', 'Full peak', 'None'], correctAnswer: 1, explanation: '40-50% of peak for recovery.' },
    { type: 'multiple_choice', question: 'Sweet spot FTP percentage?', options: ['50-60%', '70-80%', '88-93%', '120%+'], correctAnswer: 2, explanation: '88-93% of FTP.' },
    { type: 'multiple_choice', question: 'Polarised training avoids?', options: ['Low intensity', 'High intensity', 'Moderate Zone 3', 'All zones'], correctAnswer: 2, explanation: 'The moderate middle ground.' },
    { type: 'multiple_choice', question: 'Cyclist injury prevention investment?', options: ['Expensive bike', 'Professional bike fit', 'New kit', 'More miles'], correctAnswer: 1, explanation: 'A proper bike fit.' },
  ],
};
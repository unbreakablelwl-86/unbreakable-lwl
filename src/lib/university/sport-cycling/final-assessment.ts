import type { UnitAssessment } from '../types';

export const sportCyclingFinalAssessment: UnitAssessment = {
  unitNumber: 0,
  title: 'Cycling — Final Assessment',
  passMarkPercent: 80,
  pickCount: 15,
  questions: [
    { type: 'multiple_choice', question: 'Track sprint peak power?', options: ['5,000W', '1,500W', '500W', '2,000-2,400W'], correctAnswer: 3, explanation: '2,000-2,400 watts.' },
    { type: 'multiple_choice', question: 'Strength training cycling benefit?', options: ['2-8%', '15%', 'None', '0.5%'], correctAnswer: 0, explanation: '2-8% improvement.' },
    { type: 'multiple_choice', question: 'Dominant training zone?', options: ['Zone 2 (75-80% of volume)', 'Sprint', 'Recovery', 'Threshold'], correctAnswer: 0, explanation: 'Zone 2 dominates volume.' },
    { type: 'multiple_choice', question: 'Primary cause of cycling knee pain?', options: ['Weather', 'Volume', 'Pedals', 'Bike fit'], correctAnswer: 3, explanation: 'Improper bike fit.' },
    { type: 'multiple_choice', question: 'Grand Tour daily burn?', options: ['4,000-8,000', '10,000+', '3,500', '2,000'], correctAnswer: 0, explanation: '4,000-8,000 kcal.' },
    { type: 'multiple_choice', question: 'Long ride carbs per hour?', options: ['40-50g', '20-30g', '60-90g', '200g'], correctAnswer: 2, explanation: '60-90g/hour.' },
    { type: 'multiple_choice', question: 'FTP definition?', options: ['Fast power', 'Highest ~60min power', 'First phase', 'Race speed'], correctAnswer: 1, explanation: 'Highest sustainable power for ~60min.' },
    { type: 'multiple_choice', question: 'Best legal cycling supplement?', options: ['Caffeine', 'BCAAs', 'Iron', 'Creatine'], correctAnswer: 0, explanation: 'Caffeine at 3-6mg/kg.' },
    { type: 'multiple_choice', question: 'TSB for peak performance?', options: ['0', '-20', '+10 to +25', '+50'], correctAnswer: 2, explanation: 'Fresh and fit range.' },
    { type: 'multiple_choice', question: 'Pro road VO2max?', options: ['50-60', '90+', '60-70', '70-85'], correctAnswer: 3, explanation: '70-85 mL/kg/min.' },
    { type: 'multiple_choice', question: 'When start eating during rides?', options: ['First 30 minutes', 'End only', 'When hungry', 'After 2h'], correctAnswer: 0, explanation: 'Within the first 30 minutes.' },
    { type: 'multiple_choice', question: 'Off-season volume target?', options: ['40-50% of peak', 'Full peak', 'None', 'Max volume'], correctAnswer: 0, explanation: '40-50% of peak for recovery.' },
    { type: 'multiple_choice', question: 'Sweet spot FTP percentage?', options: ['70-80%', '50-60%', '88-93%', '120%+'], correctAnswer: 2, explanation: '88-93% of FTP.' },
    { type: 'multiple_choice', question: 'Polarised training avoids?', options: ['Moderate Zone 3', 'High intensity', 'Low intensity', 'All zones'], correctAnswer: 0, explanation: 'The moderate middle ground.' },
    { type: 'multiple_choice', question: 'Cyclist injury prevention investment?', options: ['Professional bike fit', 'Expensive bike', 'New kit', 'More miles'], correctAnswer: 0, explanation: 'A proper bike fit.' },
  ],
};
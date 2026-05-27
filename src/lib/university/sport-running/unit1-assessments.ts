import type { UnitAssessment } from '../types';

export const sportRunningUnit1Assessment: UnitAssessment = {
  unitNumber: 1,
  title: 'Running — Unit Assessment',
  passMarkPercent: 80,
  pickCount: 10,
  questions: [
    { type: 'multiple_choice', question: 'What energy system dominates the 100m sprint?', options: ['Fat oxidation', 'Phosphocreatine', 'Lactate', 'Aerobic'], correctAnswer: 1, explanation: 'The phosphocreatine system fuels near-maximal efforts under 10 seconds.' },
    { type: 'multiple_choice', question: 'By how much does strength training improve running economy?', options: ['0.5-1%', '2-8%', '15-20%', 'No improvement'], correctAnswer: 1, explanation: 'Heavy lower-body strength training improves economy by 2-8%.' },
    { type: 'multiple_choice', question: 'What is the 80/20 rule?', options: ['80% running, 20% cycling', '80% hard, 20% easy', '80% easy/aerobic, 20% high intensity', '80 miles per week'], correctAnswer: 2, explanation: '80% easy and 20% intense training distribution.' },
    { type: 'multiple_choice', question: 'What percentage of runners get injured annually?', options: ['10-15%', '70%+', '40-50%', '20-25%'], correctAnswer: 2, explanation: '40-50% of recreational runners experience injury each year.' },
    { type: 'multiple_choice', question: 'What are the three marathon performance determinants?', options: ['Speed, power, flexibility', 'Weight, height, leg length', 'VO2max, lactate threshold, running economy', 'Volume, intensity, frequency'], correctAnswer: 2, explanation: 'VO2max, threshold, and economy determine endurance performance.' },
    { type: 'multiple_choice', question: 'How long do glycogen stores sustain moderate running?', options: ['30min', '180min', '60min', '90-120min'], correctAnswer: 3, explanation: 'Glycogen lasts approximately 90-120 minutes.' },
    { type: 'multiple_choice', question: 'What attention strategy do elite runners use in races?', options: ['Association (internal focus)', 'Music', 'Ignoring everything', 'Dissociation'], correctAnswer: 0, explanation: 'Elite runners monitor internal cues during racing.' },
    { type: 'multiple_choice', question: 'How much should taper volume be reduced?', options: ['10%', 'No reduction', '80%', '40-60%'], correctAnswer: 3, explanation: '40-60% volume reduction with maintained intensity.' },
    { type: 'multiple_choice', question: 'What ACWR range minimises running injury risk?', options: ['0.3-0.5', '1.5-2.0', 'Any', '0.8-1.3'], correctAnswer: 3, explanation: 'Keep ACWR between 0.8-1.3.' },
    { type: 'multiple_choice', question: 'What is the biggest race-day nutrition rule?', options: ['Eat as much as possible', 'Never try anything new', 'Skip breakfast', 'Avoid carbs'], correctAnswer: 1, explanation: 'Never use untested nutrition on race day.' },
    { type: 'multiple_choice', question: 'What ferritin level should runners maintain?', options: ['Any level', '10-20', 'Above 30-50 ng/mL', 'Below 10'], correctAnswer: 2, explanation: 'Optimal ferritin above 30-50 ng/mL.' },
    { type: 'multiple_choice', question: 'What loading pattern suits training mesocycles?', options: ['3:1 (3 weeks load, 1 recovery)', 'Randomly varied', 'Constant', 'All hard'], correctAnswer: 0, explanation: '3:1 allows progressive overload with recovery.' },
  ],
};
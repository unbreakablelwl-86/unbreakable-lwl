import type { UnitAssessment } from '../types';

export const sportRunningFinalAssessment: UnitAssessment = {
  unitNumber: 0,
  title: 'Running — Final Assessment',
  passMarkPercent: 80,
  pickCount: 15,
  questions: [
    { type: 'multiple_choice', question: 'What dominates the 100m sprint?', options: ['Aerobic system', 'Phosphocreatine system', 'Fat oxidation', 'Lactate system'], correctAnswer: 1, explanation: 'Near-maximal 10-second efforts use phosphocreatine.' },
    { type: 'multiple_choice', question: 'Strength training improves running economy by?', options: ['0.5-1%', '2-8%', '15-20%', 'No effect'], correctAnswer: 1, explanation: '2-8% improvement from heavy lower-body training.' },
    { type: 'multiple_choice', question: '80/20 rule in running?', options: ['80% hard', '80% easy/aerobic, 20% intensity', '80 miles weekly', '80% sprinting'], correctAnswer: 1, explanation: 'Research-supported intensity distribution.' },
    { type: 'multiple_choice', question: 'Annual runner injury rate?', options: ['10%', '25%', '40-50%', '75%'], correctAnswer: 2, explanation: '40-50% of recreational runners annually.' },
    { type: 'multiple_choice', question: 'Three marathon performance factors?', options: ['Speed, power, agility', 'VO2max, threshold, economy', 'Weight, genes, shoes', 'Volume, frequency, rest'], correctAnswer: 1, explanation: 'The physiological trio of endurance performance.' },
    { type: 'multiple_choice', question: 'Glycogen sustains moderate running for?', options: ['30min', '60min', '90-120min', '4 hours'], correctAnswer: 2, explanation: 'Approximately 90-120 minutes before depletion.' },
    { type: 'multiple_choice', question: 'Elite runners use what strategy racing?', options: ['Dissociation', 'Association', 'Visualization only', 'No strategy'], correctAnswer: 1, explanation: 'Internal monitoring during competition.' },
    { type: 'multiple_choice', question: 'Taper volume reduction?', options: ['10%', '40-60%', '90%', 'None'], correctAnswer: 1, explanation: '40-60% reduction optimises performance.' },
    { type: 'multiple_choice', question: 'Safe ACWR range?', options: ['0.3-0.5', '0.8-1.3', '1.5-2.0', 'Any ratio'], correctAnswer: 1, explanation: '0.8-1.3 minimises injury risk.' },
    { type: 'multiple_choice', question: 'Race-day nutrition golden rule?', options: ['Maximum carbs', 'Nothing new on race day', 'Skip meals', 'Only water'], correctAnswer: 1, explanation: 'Always practise nutrition in training first.' },
    { type: 'multiple_choice', question: 'Optimal ferritin for runners?', options: ['<10', '10-20', '>30-50 ng/mL', 'Irrelevant'], correctAnswer: 2, explanation: 'Above 30-50 ng/mL for optimal oxygen transport.' },
    { type: 'multiple_choice', question: 'Best mesocycle loading pattern?', options: ['Constant', '3:1 progressive:recovery', 'All-out weekly', 'Random'], correctAnswer: 1, explanation: 'Three weeks building, one week recovery.' },
    { type: 'multiple_choice', question: 'Why is the 400m so demanding?', options: ['It is long', 'Near-maximal effort for 45-55s creates extreme lactate', 'Hurdles', 'Curves'], correctAnswer: 1, explanation: 'Sustained near-max effort and extreme metabolic demand.' },
    { type: 'multiple_choice', question: 'How do hill sprints reduce injury risk?', options: ['Softer surface', 'Incline reduces impact forces naturally', 'Slower speed', 'Less effort'], correctAnswer: 1, explanation: 'The incline naturally reduces impact while building power.' },
    { type: 'multiple_choice', question: 'What reframes racing discomfort?', options: ['Ignoring it', 'Seeing it as maximal effort, not danger', 'Stopping', 'Slowing down'], correctAnswer: 1, explanation: 'Positive reframing sustains effort.' },
  ],
};
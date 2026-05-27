import type { UnitAssessment } from '../types';

export const sportRunningFinalAssessment: UnitAssessment = {
  unitNumber: 0,
  title: 'Running — Final Assessment',
  passMarkPercent: 80,
  pickCount: 15,
  questions: [
    { type: 'multiple_choice', question: 'What dominates the 100m sprint?', options: ['Fat oxidation', 'Aerobic system', 'Lactate system', 'Phosphocreatine system'], correctAnswer: 3, explanation: 'Near-maximal 10-second efforts use phosphocreatine.' },
    { type: 'multiple_choice', question: 'Strength training improves running economy by?', options: ['0.5-1%', '15-20%', 'No effect', '2-8%'], correctAnswer: 3, explanation: '2-8% improvement from heavy lower-body training.' },
    { type: 'multiple_choice', question: '80/20 rule in running?', options: ['80% hard', '80% easy/aerobic, 20% intensity', '80 miles weekly', '80% sprinting'], correctAnswer: 1, explanation: 'Research-supported intensity distribution.' },
    { type: 'multiple_choice', question: 'Annual runner injury rate?', options: ['10%', '25%', '75%', '40-50%'], correctAnswer: 3, explanation: '40-50% of recreational runners annually.' },
    { type: 'multiple_choice', question: 'Three marathon performance factors?', options: ['VO2max, threshold, economy', 'Speed, power, agility', 'Volume, frequency, rest', 'Weight, genes, shoes'], correctAnswer: 0, explanation: 'The physiological trio of endurance performance.' },
    { type: 'multiple_choice', question: 'Glycogen sustains moderate running for?', options: ['60min', '4 hours', '90-120min', '30min'], correctAnswer: 2, explanation: 'Approximately 90-120 minutes before depletion.' },
    { type: 'multiple_choice', question: 'Elite runners use what strategy racing?', options: ['Association', 'No strategy', 'Visualization only', 'Dissociation'], correctAnswer: 0, explanation: 'Internal monitoring during competition.' },
    { type: 'multiple_choice', question: 'Taper volume reduction?', options: ['None', '40-60%', '10%', '90%'], correctAnswer: 1, explanation: '40-60% reduction optimises performance.' },
    { type: 'multiple_choice', question: 'Safe ACWR range?', options: ['1.5-2.0', '0.8-1.3', 'Any ratio', '0.3-0.5'], correctAnswer: 1, explanation: '0.8-1.3 minimises injury risk.' },
    { type: 'multiple_choice', question: 'Race-day nutrition golden rule?', options: ['Maximum carbs', 'Nothing new on race day', 'Only water', 'Skip meals'], correctAnswer: 1, explanation: 'Always practise nutrition in training first.' },
    { type: 'multiple_choice', question: 'Optimal ferritin for runners?', options: ['10-20', '>30-50 ng/mL', '<10', 'Irrelevant'], correctAnswer: 1, explanation: 'Above 30-50 ng/mL for optimal oxygen transport.' },
    { type: 'multiple_choice', question: 'Best mesocycle loading pattern?', options: ['3:1 progressive:recovery', 'All-out weekly', 'Random', 'Constant'], correctAnswer: 0, explanation: 'Three weeks building, one week recovery.' },
    { type: 'multiple_choice', question: 'Why is the 400m so demanding?', options: ['Near-maximal effort for 45-55s creates extreme lactate', 'Curves', 'Hurdles', 'It is long'], correctAnswer: 0, explanation: 'Sustained near-max effort and extreme metabolic demand.' },
    { type: 'multiple_choice', question: 'How do hill sprints reduce injury risk?', options: ['Slower speed', 'Less effort', 'Softer surface', 'Incline reduces impact forces naturally'], correctAnswer: 3, explanation: 'The incline naturally reduces impact while building power.' },
    { type: 'multiple_choice', question: 'What reframes racing discomfort?', options: ['Stopping', 'Slowing down', 'Seeing it as maximal effort, not danger', 'Ignoring it'], correctAnswer: 2, explanation: 'Positive reframing sustains effort.' },
  ],
};
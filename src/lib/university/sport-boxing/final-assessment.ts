import type { UnitAssessment } from '../types';

export const sportBoxingFinalAssessment: UnitAssessment = {
  unitNumber: 0,
  title: 'Boxing — Final Assessment',
  passMarkPercent: 80,
  pickCount: 15,
  questions: [
    { type: 'multiple_choice', question: 'What blood lactate levels are recorded in elite boxing?', options: ['18-20 mmol/L', '10-14 mmol/L', '2-4 mmol/L', '6-8 mmol/L'], correctAnswer: 1, explanation: 'Boxing produces lactate levels of 10-14 mmol/L — among the highest in sport.' },
    { type: 'multiple_choice', question: 'What type of power is most important for punching?', options: ['Vertical', 'Horizontal', 'Isometric', 'Rotational'], correctAnswer: 3, explanation: 'Every punch is a rotation through the kinetic chain.' },
    { type: 'multiple_choice', question: 'What is the key to hand speed?', options: ['Maximum tension', 'Heavier gloves', 'Relaxation until impact', 'Only shoulder strength'], correctAnswer: 2, explanation: 'Relaxation is the secret to hand speed.' },
    { type: 'multiple_choice', question: 'What percentage of boxing injuries are hand injuries?', options: ['10-20%', '25-35%', '60-70%', '40-50%'], correctAnswer: 3, explanation: 'Hand injuries dominate boxing injury statistics at 40-50%.' },
    { type: 'multiple_choice', question: 'What daily protein is recommended for boxers?', options: ['1.0g/kg', '3.5g/kg', '1.5g/kg', '2.0-2.4g/kg'], correctAnswer: 3, explanation: '2.0-2.4g/kg supports recovery from intense training.' },
    { type: 'multiple_choice', question: 'What is the maximum safe water cut percentage?', options: ['15%+', '10-12%', '5-7%', '2-3%'], correctAnswer: 2, explanation: 'Cutting beyond 5-7% is dangerous and performance-destroying.' },
    { type: 'multiple_choice', question: 'How should anxiety be managed before a fight?', options: ['Suppression', 'Reframing as excitement', 'Avoidance', 'Complete relaxation'], correctAnswer: 1, explanation: 'Anxiety and excitement share identical physiology — reframe to perform.' },
    { type: 'multiple_choice', question: 'When must hard sparring stop before competition?', options: ['7+ days before', 'Never', '3 days out', 'Day before'], correctAnswer: 0, explanation: 'Brain protection requires 7+ days without hard sparring.' },
    { type: 'multiple_choice', question: 'What characterises a well-tapered fighter?', options: ['Restless eagerness and slight undertrained feeling', 'Exhaustion', 'Peak body weight', 'Maximum muscle soreness'], correctAnswer: 0, explanation: 'A successful taper leaves the fighter sharp and hungry.' },
    { type: 'multiple_choice', question: 'What pulling-to-pushing ratio protects boxer shoulders?', options: ['1:1', '2:1', '3:1', '1:2'], correctAnswer: 1, explanation: '2:1 pulling-to-pushing counteracts repetitive punching demands.' },
    { type: 'multiple_choice', question: 'What determines punching power?', options: ['Glove weight', 'Full-body kinetic chain from feet through hips to fist', 'Shoulder strength only', 'Arm size alone'], correctAnswer: 1, explanation: 'Punching power is generated through the entire kinetic chain.' },
    { type: 'multiple_choice', question: 'Why is neck strengthening critical for boxers?', options: ['It decelerates the head after impact, reducing brain injury risk', 'Better breathing', 'Appearance', 'Improved posture'], correctAnswer: 0, explanation: 'Stronger necks reduce rotational forces on the brain after impact.' },
    { type: 'multiple_choice', question: 'What is the three-round reset?', options: ['A combination', 'Resting for three rounds', 'A warm-up', 'Assess, adjust one thing, commit fully to next three rounds'], correctAnswer: 3, explanation: 'The reset prevents dwelling on lost rounds.' },
    { type: 'multiple_choice', question: 'During fight camp intensification, how many sparring rounds per session?', options: ['2-3', '6-8', '1 only', '12-15'], correctAnswer: 1, explanation: 'Intensification phase increases sparring to 6-8 rounds.' },
    { type: 'multiple_choice', question: 'What conditioning test matters most for boxers?', options: ['5km run time', 'Bench press max', 'Flexibility test', 'Recovery heart rate speed between rounds'], correctAnswer: 3, explanation: 'Recovery heart rate indicates boxing-specific cardiovascular fitness.' },
  ],
};
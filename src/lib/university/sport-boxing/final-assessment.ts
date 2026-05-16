import type { UnitAssessment } from '../types';

export const sportBoxingFinalAssessment: UnitAssessment = {
  unitNumber: 0,
  title: 'Boxing — Final Assessment',
  passMarkPercent: 80,
  pickCount: 15,
  questions: [
    { type: 'multiple_choice', question: 'What blood lactate levels are recorded in elite boxing?', options: ['2-4 mmol/L', '6-8 mmol/L', '10-14 mmol/L', '18-20 mmol/L'], correctAnswer: 2, explanation: 'Boxing produces lactate levels of 10-14 mmol/L — among the highest in sport.' },
    { type: 'multiple_choice', question: 'What type of power is most important for punching?', options: ['Vertical', 'Horizontal', 'Rotational', 'Isometric'], correctAnswer: 2, explanation: 'Every punch is a rotation through the kinetic chain.' },
    { type: 'multiple_choice', question: 'What is the key to hand speed?', options: ['Maximum tension', 'Relaxation until impact', 'Heavier gloves', 'Only shoulder strength'], correctAnswer: 1, explanation: 'Relaxation is the secret to hand speed.' },
    { type: 'multiple_choice', question: 'What percentage of boxing injuries are hand injuries?', options: ['10-20%', '25-35%', '40-50%', '60-70%'], correctAnswer: 2, explanation: 'Hand injuries dominate boxing injury statistics at 40-50%.' },
    { type: 'multiple_choice', question: 'What daily protein is recommended for boxers?', options: ['1.0g/kg', '1.5g/kg', '2.0-2.4g/kg', '3.5g/kg'], correctAnswer: 2, explanation: '2.0-2.4g/kg supports recovery from intense training.' },
    { type: 'multiple_choice', question: 'What is the maximum safe water cut percentage?', options: ['2-3%', '5-7%', '10-12%', '15%+'], correctAnswer: 1, explanation: 'Cutting beyond 5-7% is dangerous and performance-destroying.' },
    { type: 'multiple_choice', question: 'How should anxiety be managed before a fight?', options: ['Suppression', 'Reframing as excitement', 'Complete relaxation', 'Avoidance'], correctAnswer: 1, explanation: 'Anxiety and excitement share identical physiology — reframe to perform.' },
    { type: 'multiple_choice', question: 'When must hard sparring stop before competition?', options: ['Day before', '3 days out', '7+ days before', 'Never'], correctAnswer: 2, explanation: 'Brain protection requires 7+ days without hard sparring.' },
    { type: 'multiple_choice', question: 'What characterises a well-tapered fighter?', options: ['Exhaustion', 'Maximum muscle soreness', 'Restless eagerness and slight undertrained feeling', 'Peak body weight'], correctAnswer: 2, explanation: 'A successful taper leaves the fighter sharp and hungry.' },
    { type: 'multiple_choice', question: 'What pulling-to-pushing ratio protects boxer shoulders?', options: ['1:1', '1:2', '2:1', '3:1'], correctAnswer: 2, explanation: '2:1 pulling-to-pushing counteracts repetitive punching demands.' },
    { type: 'multiple_choice', question: 'What determines punching power?', options: ['Arm size alone', 'Full-body kinetic chain from feet through hips to fist', 'Glove weight', 'Shoulder strength only'], correctAnswer: 1, explanation: 'Punching power is generated through the entire kinetic chain.' },
    { type: 'multiple_choice', question: 'Why is neck strengthening critical for boxers?', options: ['Appearance', 'It decelerates the head after impact, reducing brain injury risk', 'Improved posture', 'Better breathing'], correctAnswer: 1, explanation: 'Stronger necks reduce rotational forces on the brain after impact.' },
    { type: 'multiple_choice', question: 'What is the three-round reset?', options: ['Resting for three rounds', 'Assess, adjust one thing, commit fully to next three rounds', 'A combination', 'A warm-up'], correctAnswer: 1, explanation: 'The reset prevents dwelling on lost rounds.' },
    { type: 'multiple_choice', question: 'During fight camp intensification, how many sparring rounds per session?', options: ['2-3', '6-8', '12-15', '1 only'], correctAnswer: 1, explanation: 'Intensification phase increases sparring to 6-8 rounds.' },
    { type: 'multiple_choice', question: 'What conditioning test matters most for boxers?', options: ['5km run time', 'Recovery heart rate speed between rounds', 'Bench press max', 'Flexibility test'], correctAnswer: 1, explanation: 'Recovery heart rate indicates boxing-specific cardiovascular fitness.' },
  ],
};
import type { UnitAssessment } from '../types';

export const level3Unit2Assessment: UnitAssessment = {
  unitNumber: 2,
  title: 'Muscle Growth Principles — Unit Assessment',
  passMarkPercent: 80,
  questions: [
    // ─── CH1: Hypertrophy Science ───
    {
      type: 'multiple_choice',
      question: 'Which of the following is considered the primary driver of muscle hypertrophy?',
      options: ['The pump', 'Metabolic stress', 'Mechanical tension', 'Muscle damage'],
      correctAnswer: 2,
      explanation: 'While all three contribute, mechanical tension — the force applied to muscle fibres — is the most important stimulus for hypertrophy.',
    },
    {
      type: 'multiple_choice',
      question: 'Metabolic stress during resistance training is primarily associated with:',
      options: ['Heavy singles at 95% 1RM', 'Moderate loads with shorter rest periods and higher reps', 'Stretching before lifting', 'Long rest periods between sets'],
      correctAnswer: 1,
      explanation: 'Metabolic stress is maximised with moderate loads, higher rep ranges, and shorter rest periods that create metabolite accumulation.',
    },
    // ─── CH2: Progressive Overload ───
    {
      type: 'multiple_choice',
      question: 'Progressive overload can be achieved by manipulating all of the following EXCEPT:',
      options: ['Sleep duration', 'Exercise order', 'Volume', 'Load'],
      correctAnswer: 0,
      explanation: 'Load, volume, density, range of motion, and exercise selection are all overload variables. Sleep is crucial for recovery but is not a direct training overload variable.',
    },
    {
      type: 'multiple_choice',
      question: 'Double progression involves increasing:',
      options: ['Rest periods between sets', 'Sets every week indefinitely', 'Weight every session regardless of reps', 'Reps within a range, then adding weight once the top of the range is reached'],
      correctAnswer: 3,
      explanation: 'Double progression first builds reps within a target range, then increases load when the upper rep target is consistently achieved.',
    },
    // ─── CH3: Volume & Intensity ───
    {
      type: 'multiple_choice',
      question: 'MRV stands for:',
      options: ['Maximum Recovery Volume', 'Minimum Required Volume', 'Maximum Recoverable Volume', 'Maximum Rep Velocity'],
      correctAnswer: 2,
      explanation: 'MRV (Maximum Recoverable Volume) is the highest training volume you can perform and still recover from before the next session.',
    },
    {
      type: 'multiple_choice',
      question: 'Training consistently above your MRV will likely result in:',
      options: ['Faster muscle growth', 'Overtraining and regression', 'No change in performance', 'Improved flexibility'],
      correctAnswer: 1,
      explanation: 'Exceeding MRV chronically leads to accumulated fatigue, performance decline, and potentially overtraining syndrome.',
    },
    {
      type: 'multiple_choice',
      question: 'MEV refers to the minimum volume needed to:',
      options: ['Start seeing measurable growth', 'Lose fat', 'Reach your genetic ceiling', 'Maintain current muscle mass'],
      correctAnswer: 0,
      explanation: 'MEV (Minimum Effective Volume) is the lowest dose of training that produces measurable hypertrophy for a given muscle group.',
    },
    // ─── CH4: Muscle Fibre Types ───
    {
      type: 'multiple_choice',
      question: 'Type II (fast-twitch) muscle fibres are best trained with:',
      options: ['High-rep bodyweight exercises only', 'Stretching and mobility work', 'Long-duration low-intensity cardio', 'Heavy loads and explosive movements'],
      correctAnswer: 3,
      explanation: 'Type II fibres are recruited under high-force, high-velocity demands — heavy resistance training and explosive movements preferentially target them.',
    },
    {
      type: 'multiple_choice',
      question: 'Type I (slow-twitch) fibres are characterised by:',
      options: ['Large size and rapid growth potential', 'High force production and fast fatigue', 'High endurance capacity and resistance to fatigue', 'Exclusive use in sprinting'],
      correctAnswer: 2,
      explanation: 'Type I fibres are smaller, fatigue-resistant, and rely primarily on aerobic metabolism — making them suited to endurance activities.',
    },
    // ─── CH5: Time Under Tension ───
    {
      type: 'multiple_choice',
      question: 'A "3-1-2-0" tempo prescription means:',
      options: ['3 minutes rest, 1 set, 2 reps, 0 weight', '3s eccentric, 1s pause, 2s concentric, 0s pause at top', '3 reps, 1 set, 2 exercises, 0 rest', '3s concentric, 1s eccentric, 2s hold, 0s rest'],
      correctAnswer: 1,
      explanation: 'Tempo is typically written as eccentric–pause at bottom–concentric–pause at top. So 3-1-2-0 means a slow 3-second lowering phase.',
    },
    {
      type: 'multiple_choice',
      question: 'Emphasising the eccentric phase of a lift primarily benefits:',
      options: ['Muscle damage signalling and strength through range', 'Joint mobility', 'Fat oxidation rates', 'Cardiovascular fitness'],
      correctAnswer: 0,
      explanation: 'Eccentric emphasis increases mechanical tension through the lengthening phase, creating greater muscle damage signalling and strength adaptations.',
    },
    // ─── CH6: Deloading ───
    {
      type: 'multiple_choice',
      question: 'A deload week typically involves:',
      options: ['Switching to a different sport entirely', 'Doubling training frequency', 'Complete rest with no exercise', 'Reducing volume and/or intensity by 40–60%'],
      correctAnswer: 3,
      explanation: 'Deloads reduce training stress (usually volume, intensity, or both) while maintaining movement patterns to allow systemic recovery.',
    },
    {
      type: 'multiple_choice',
      question: 'How often should a deload typically be programmed for intermediate lifters?',
      options: ['Only when injured', 'Once per year', 'Every 4–8 weeks', 'Every week'],
      correctAnswer: 2,
      explanation: 'Most intermediate lifters benefit from a planned deload every 4–8 weeks, depending on training intensity and individual recovery capacity.',
    },
    // ─── CH7: Mind-Muscle Connection ───
    {
      type: 'multiple_choice',
      question: 'Internal cueing during a bicep curl would involve:',
      options: ['Counting reps out loud', 'Focusing on squeezing and feeling the bicep contract', 'Thinking about the weight moving upward', 'Watching someone else perform the exercise'],
      correctAnswer: 1,
      explanation: 'Internal cueing directs attention to the target muscle itself — feeling the contraction and squeeze — rather than the external movement of the load.',
    },
    {
      type: 'multiple_choice',
      question: 'Research suggests the mind-muscle connection is most effective for:',
      options: ['Isolation exercises and lighter loads', 'Heavy compound lifts at 90%+ 1RM', 'Stretching and cool-downs', 'Cardiovascular exercise'],
      correctAnswer: 0,
      explanation: 'Studies show internal focus enhances muscle activation primarily during isolation work and moderate loads, where conscious contraction is feasible.',
    },
    // ─── CH8: Advanced Rep Schemes ───
    {
      type: 'multiple_choice',
      question: 'A rest-pause set involves:',
      options: ['Alternating between two exercises', 'Resting for 5 minutes between exercises', 'Using momentum to complete extra reps', 'Performing reps to near-failure, resting 10–20 seconds, then continuing'],
      correctAnswer: 3,
      explanation: 'Rest-pause extends a set by taking brief intra-set rest periods (10–20 seconds) to accumulate more reps at a challenging load.',
    },
    {
      type: 'multiple_choice',
      question: 'Myo-reps are most accurately described as:',
      options: ['A type of isometric hold', 'A warm-up protocol', 'A rest-pause method using an activation set followed by short clusters', 'A stretching technique for hypertrophy'],
      correctAnswer: 2,
      explanation: 'Myo-reps begin with an activation set close to failure, then use very short rest periods (3–5 breaths) to perform additional mini-sets of 3–5 reps.',
    },
    {
      type: 'multiple_choice',
      question: 'Drop sets primarily increase training stimulus through:',
      options: ['Longer rest periods', 'Extended time under tension and metabolic stress', 'Reduced range of motion', 'Heavier loads'],
      correctAnswer: 1,
      explanation: 'Drop sets reduce the weight immediately after reaching near-failure and continue the set, accumulating metabolic stress and time under tension.',
    },
    {
      type: 'scenario',
      question: 'An intermediate lifter has been training chest with 4 sets of bench press and 3 sets of flyes for 12 weeks without measurable growth. What is the most logical next step?',
      scenario: 'They have been consistent with nutrition and sleep.',
      options: [
        'Assess whether current volume exceeds MEV, consider adding 1–2 sets or introducing a new stimulus like tempo or an advanced rep scheme',
        'Remove all chest training for a month',
        'Switch entirely to machines',
        'Add 6 more sets of chest per session',
      ],
      correctAnswer: 0,
      explanation: 'Incremental volume increases or novel stimuli (tempo, drop sets, myo-reps) are more appropriate than dramatic changes when progress stalls.',
    },
  ],
};

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
      options: ['Muscle damage', 'Metabolic stress', 'Mechanical tension', 'The pump'],
      correctAnswer: 2,
      explanation: 'While all three contribute, mechanical tension — the force applied to muscle fibres — is the most important stimulus for hypertrophy.',
    },
    {
      type: 'multiple_choice',
      question: 'Metabolic stress during resistance training is primarily associated with:',
      options: ['Moderate loads with shorter rest periods and higher reps', 'Heavy singles at 95% 1RM', 'Long rest periods between sets', 'Stretching before lifting'],
      correctAnswer: 0,
      explanation: 'Metabolic stress is maximised with moderate loads, higher rep ranges, and shorter rest periods that create metabolite accumulation.',
    },
    // ─── CH2: Progressive Overload ───
    {
      type: 'multiple_choice',
      question: 'Progressive overload can be achieved by manipulating all of the following EXCEPT:',
      options: ['Load', 'Sleep duration', 'Exercise order', 'Volume'],
      correctAnswer: 1,
      explanation: 'Load, volume, density, range of motion, and exercise selection are all overload variables. Sleep is crucial for recovery but is not a direct training overload variable.',
    },
    {
      type: 'multiple_choice',
      question: 'Double progression involves increasing:',
      options: ['Weight every session regardless of reps', 'Rest periods between sets', 'Reps within a range, then adding weight once the top of the range is reached', 'Sets every week indefinitely'],
      correctAnswer: 2,
      explanation: 'Double progression first builds reps within a target range, then increases load when the upper rep target is consistently achieved.',
    },
    // ─── CH3: Volume & Intensity ───
    {
      type: 'multiple_choice',
      question: 'MRV stands for:',
      options: ['Minimum Required Volume', 'Maximum Recoverable Volume', 'Maximum Rep Velocity', 'Maximum Recovery Volume'],
      correctAnswer: 1,
      explanation: 'MRV (Maximum Recoverable Volume) is the highest training volume you can perform and still recover from before the next session.',
    },
    {
      type: 'multiple_choice',
      question: 'Training consistently above your MRV will likely result in:',
      options: ['No change in performance', 'Faster muscle growth', 'Improved flexibility', 'Overtraining and regression'],
      correctAnswer: 3,
      explanation: 'Exceeding MRV chronically leads to accumulated fatigue, performance decline, and potentially overtraining syndrome.',
    },
    {
      type: 'multiple_choice',
      question: 'MEV refers to the minimum volume needed to:',
      options: ['Start seeing measurable growth', 'Lose fat', 'Maintain current muscle mass', 'Reach your genetic ceiling'],
      correctAnswer: 0,
      explanation: 'MEV (Minimum Effective Volume) is the lowest dose of training that produces measurable hypertrophy for a given muscle group.',
    },
    // ─── CH4: Muscle Fibre Types ───
    {
      type: 'multiple_choice',
      question: 'Type II (fast-twitch) muscle fibres are best trained with:',
      options: ['Stretching and mobility work', 'High-rep bodyweight exercises only', 'Long-duration low-intensity cardio', 'Heavy loads and explosive movements'],
      correctAnswer: 3,
      explanation: 'Type II fibres are recruited under high-force, high-velocity demands — heavy resistance training and explosive movements preferentially target them.',
    },
    {
      type: 'multiple_choice',
      question: 'Type I (slow-twitch) fibres are characterised by:',
      options: ['High endurance capacity and resistance to fatigue', 'High force production and fast fatigue', 'Exclusive use in sprinting', 'Large size and rapid growth potential'],
      correctAnswer: 0,
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
      options: ['Fat oxidation rates', 'Muscle damage signalling and strength through range', 'Joint mobility', 'Cardiovascular fitness'],
      correctAnswer: 1,
      explanation: 'Eccentric emphasis increases mechanical tension through the lengthening phase, creating greater muscle damage signalling and strength adaptations.',
    },
    // ─── CH6: Deloading ───
    {
      type: 'multiple_choice',
      question: 'A deload week typically involves:',
      options: ['Complete rest with no exercise', 'Switching to a different sport entirely', 'Reducing volume and/or intensity by 40–60%', 'Doubling training frequency'],
      correctAnswer: 2,
      explanation: 'Deloads reduce training stress (usually volume, intensity, or both) while maintaining movement patterns to allow systemic recovery.',
    },
    {
      type: 'multiple_choice',
      question: 'How often should a deload typically be programmed for intermediate lifters?',
      options: ['Only when injured', 'Every 4–8 weeks', 'Once per year', 'Every week'],
      correctAnswer: 1,
      explanation: 'Most intermediate lifters benefit from a planned deload every 4–8 weeks, depending on training intensity and individual recovery capacity.',
    },
    // ─── CH7: Mind-Muscle Connection ───
    {
      type: 'multiple_choice',
      question: 'Internal cueing during a bicep curl would involve:',
      options: ['Watching someone else perform the exercise', 'Counting reps out loud', 'Thinking about the weight moving upward', 'Focusing on squeezing and feeling the bicep contract'],
      correctAnswer: 3,
      explanation: 'Internal cueing directs attention to the target muscle itself — feeling the contraction and squeeze — rather than the external movement of the load.',
    },
    {
      type: 'multiple_choice',
      question: 'Research suggests the mind-muscle connection is most effective for:',
      options: ['Stretching and cool-downs', 'Isolation exercises and lighter loads', 'Cardiovascular exercise', 'Heavy compound lifts at 90%+ 1RM'],
      correctAnswer: 1,
      explanation: 'Studies show internal focus enhances muscle activation primarily during isolation work and moderate loads, where conscious contraction is feasible.',
    },
    // ─── CH8: Advanced Rep Schemes ───
    {
      type: 'multiple_choice',
      question: 'A rest-pause set involves:',
      options: ['Resting for 5 minutes between exercises', 'Performing reps to near-failure, resting 10–20 seconds, then continuing', 'Using momentum to complete extra reps', 'Alternating between two exercises'],
      correctAnswer: 1,
      explanation: 'Rest-pause extends a set by taking brief intra-set rest periods (10–20 seconds) to accumulate more reps at a challenging load.',
    },
    {
      type: 'multiple_choice',
      question: 'Myo-reps are most accurately described as:',
      options: ['A warm-up protocol', 'A stretching technique for hypertrophy', 'A type of isometric hold', 'A rest-pause method using an activation set followed by short clusters'],
      correctAnswer: 3,
      explanation: 'Myo-reps begin with an activation set close to failure, then use very short rest periods (3–5 breaths) to perform additional mini-sets of 3–5 reps.',
    },
    {
      type: 'multiple_choice',
      question: 'Drop sets primarily increase training stimulus through:',
      options: ['Extended time under tension and metabolic stress', 'Longer rest periods', 'Heavier loads', 'Reduced range of motion'],
      correctAnswer: 0,
      explanation: 'Drop sets reduce the weight immediately after reaching near-failure and continue the set, accumulating metabolic stress and time under tension.',
    },
    {
      type: 'scenario',
      question: 'An intermediate lifter has been training chest with 4 sets of bench press and 3 sets of flyes for 12 weeks without measurable growth. What is the most logical next step?',
      scenario: 'They have been consistent with nutrition and sleep.',
      options: [      'Assess whether current volume exceeds MEV, consider adding 1–2 sets or introducing a new stimulus like tempo or an advanced rep scheme',
      'Remove all chest training for a month',
      'Add 6 more sets of chest per session',
      'Switch entirely to machines',
    ],
      correctAnswer: 0,
      explanation: 'Incremental volume increases or novel stimuli (tempo, drop sets, myo-reps) are more appropriate than dramatic changes when progress stalls.',
    },
  ],
};

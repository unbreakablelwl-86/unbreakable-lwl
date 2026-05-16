import type { UnitAssessment } from '../types';

export const level3Unit4Assessment: UnitAssessment = {
  unitNumber: 4,
  title: 'Behaviour & Lifestyle — Unit Assessment',
  passMarkPercent: 80,
  questions: [
    // ─── CH1: Adherence Psychology ───
    {
      type: 'multiple_choice',
      question: 'The most common reason people abandon a fitness programme is:',
      options: ['They have too much free time', 'They are too strong', 'It does not fit their lifestyle, preferences, or identity', 'The programme is too short'],
      correctAnswer: 2,
      explanation: 'Adherence fails most often when a programme conflicts with someone\'s real life, preferences, or sense of self — not because of the programme\'s design alone.',
    },
    {
      type: 'multiple_choice',
      question: 'Intrinsic motivation is driven by:',
      options: ['Social media likes', 'Internal satisfaction, enjoyment, and personal meaning', 'External rewards like money', 'Fear of punishment'],
      correctAnswer: 1,
      explanation: 'Intrinsic motivation comes from within — the satisfaction of the process itself, personal growth, and alignment with your values.',
    },
    {
      type: 'multiple_choice',
      question: 'Self-determination theory identifies three core psychological needs. Which is NOT one of them?',
      options: ['Perfection', 'Autonomy', 'Competence', 'Relatedness'],
      correctAnswer: 0,
      explanation: 'SDT identifies autonomy, competence, and relatedness as core needs. Perfection is not a component and can actually undermine motivation.',
    },
    // ─── CH2: Habit Formation ───
    {
      type: 'multiple_choice',
      question: 'The habit loop consists of:',
      options: ['Goal, plan, execute', 'Think, feel, act', 'Start, middle, end', 'Cue, routine, reward'],
      correctAnswer: 3,
      explanation: 'The habit loop — cue, routine, reward — is the neurological framework through which habits are formed and reinforced.',
    },
    {
      type: 'multiple_choice',
      question: 'Habit stacking involves:',
      options: ['Only forming habits on weekends', 'Breaking all habits simultaneously', 'Linking a new behaviour to an existing established habit', 'Doing all your habits at once'],
      correctAnswer: 2,
      explanation: 'Habit stacking attaches a new desired behaviour to an existing automatic routine — using the existing habit as the cue for the new one.',
    },
    // ─── CH3: Stress & Nervous System ───
    {
      type: 'multiple_choice',
      question: 'Chronic elevated cortisol can lead to:',
      options: ['Better immune function', 'Increased fat storage, impaired recovery, and disrupted sleep', 'Improved muscle growth', 'Higher testosterone levels'],
      correctAnswer: 1,
      explanation: 'Chronically elevated cortisol promotes fat storage (particularly visceral), impairs muscle recovery, disrupts sleep, and suppresses immune function.',
    },
    {
      type: 'multiple_choice',
      question: 'The parasympathetic nervous system is responsible for:',
      options: ['Rest, digestion, and recovery', 'Producing adrenaline', 'Fight-or-flight responses', 'Increasing heart rate during exercise'],
      correctAnswer: 0,
      explanation: 'The parasympathetic branch (rest and digest) promotes recovery, lowers heart rate, and supports digestion — the counterbalance to sympathetic activation.',
    },
    {
      type: 'multiple_choice',
      question: 'HRV (Heart Rate Variability) is a useful marker of:',
      options: ['Maximum strength', 'Blood oxygen levels', 'How many calories you burn', 'Autonomic nervous system balance and recovery readiness'],
      correctAnswer: 3,
      explanation: 'HRV reflects the balance between sympathetic and parasympathetic activity — higher HRV generally indicates better recovery and lower stress.',
    },
    // ─── CH4: Sleep ───
    {
      type: 'multiple_choice',
      question: 'How many hours of sleep per night is generally recommended for adults who train regularly?',
      options: ['10+ hours', '4–5 hours', '7–9 hours', '5–6 hours'],
      correctAnswer: 2,
      explanation: 'Most adults — especially those with regular training demands — need 7–9 hours of quality sleep for optimal recovery, hormone regulation, and cognitive function.',
    },
    {
      type: 'multiple_choice',
      question: 'Blue light exposure before bed can impair sleep because:',
      options: ['It increases hunger', 'It suppresses melatonin production', 'It causes eye strain only', 'It makes you too warm'],
      correctAnswer: 1,
      explanation: 'Blue light from screens suppresses melatonin — the hormone that signals your body it\'s time to sleep — delaying sleep onset and reducing quality.',
    },
    // ─── CH5: Managing Training Around Life ───
    {
      type: 'multiple_choice',
      question: 'The Minimum Effective Dose (MED) concept is most useful when:',
      options: ['Life disruptions reduce your available training time', 'You want to overtrain', 'You are a competitive powerlifter peaking for a meet', 'You have unlimited time to train'],
      correctAnswer: 0,
      explanation: 'MED identifies the smallest training stimulus that still produces or maintains results — essential during busy periods, travel, or illness.',
    },
    {
      type: 'multiple_choice',
      question: 'When returning to training after illness, the best approach is:',
      options: ['Avoid training for another month', 'Jump straight back to where you left off', 'Double your training to make up for lost time', 'Start at a reduced volume and intensity, then build back gradually'],
      correctAnswer: 3,
      explanation: 'A gradual return prevents setbacks and allows your body to readapt — jumping back too hard risks re-injury or prolonged fatigue.',
    },
    // ─── CH6: Mental Frameworks ───
    {
      type: 'multiple_choice',
      question: 'Identity-based habits focus on:',
      options: ['What others think of you', 'What you want to achieve', 'Who you want to become', 'How much money you earn'],
      correctAnswer: 2,
      explanation: 'Identity-based habits shift the focus from outcomes ("I want to lose weight") to identity ("I am someone who trains consistently") — creating deeper, lasting change.',
    },
    {
      type: 'multiple_choice',
      question: 'A growth mindset, as defined by Carol Dweck, is the belief that:',
      options: ['Failure should be avoided at all costs', 'Abilities can be developed through effort, strategy, and learning', 'Talent is fixed and cannot be changed', 'Only genetics determine success'],
      correctAnswer: 1,
      explanation: 'A growth mindset embraces challenge and sees effort as the path to mastery — viewing setbacks as learning opportunities rather than evidence of inability.',
    },
    // ─── CH7: Social Influence ───
    {
      type: 'multiple_choice',
      question: 'The biggest risk of social media comparison in fitness is:',
      options: ['Unrealistic expectations leading to discouragement and programme-hopping', 'Learning new exercises', 'Finding training partners', 'Discovering new supplements'],
      correctAnswer: 0,
      explanation: 'Comparing yourself to curated highlight reels creates unrealistic benchmarks, erodes confidence, and often leads to constant programme switching.',
    },
    {
      type: 'multiple_choice',
      question: 'Accountability partners are most effective when they:',
      options: ['Train the exact same programme as you', 'Judge you harshly for missing sessions', 'Only communicate via social media', 'Provide consistent, supportive check-ins aligned with your goals'],
      correctAnswer: 3,
      explanation: 'Effective accountability is about consistent, supportive engagement — not judgement — that helps you stay aligned with your own goals and values.',
    },
    // ─── CH8: Long-Term Sustainability ───
    {
      type: 'multiple_choice',
      question: 'The 80/20 rule in fitness suggests:',
      options: ['Train 80% of the time and eat badly 20%', 'Only 20% of exercises matter', 'Aim for consistent good decisions 80% of the time rather than demanding perfection', '80% of results come from supplements'],
      correctAnswer: 2,
      explanation: 'The 80/20 principle acknowledges that sustainable progress comes from consistent good choices most of the time — not rigid perfection that leads to burnout.',
    },
    {
      type: 'scenario',
      question: 'Someone has been training intensely for 18 months without a break. They report constant fatigue, irritability, loss of motivation, and recurring minor injuries. What is the most appropriate recommendation?',
      scenario: 'They insist they cannot take time off because they will "lose all their gains".',
      options: [
        'Switch to a completely different sport permanently',
        'Implement a structured deload or rest period, reassess training volume, and address recovery factors (sleep, stress, nutrition)',
        'Add more training sessions to build resilience',
        'Push through — the fatigue will pass',
      ],
      correctAnswer: 1,
      explanation: 'The symptoms strongly suggest overreaching or early overtraining. A structured rest/deload period combined with recovery assessment is essential. They will not lose meaningful progress from a planned recovery phase.',
    },
    {
      type: 'scenario',
      question: 'A person struggles to maintain training consistency because their work schedule changes weekly. What strategy is most likely to help?',
      scenario: 'Some weeks they can train 5 times, others only twice.',
      options: [
        'Create a flexible framework with a Minimum Effective Dose baseline (2 sessions) and optional additional sessions when time allows',
        'Only follow a programme designed for 5 days and skip sessions when busy',
        'Give up structured training entirely',
        'Train at 4 AM every day regardless of schedule',
      ],
      correctAnswer: 0,
      explanation: 'A flexible system with a guaranteed minimum baseline ensures consistency regardless of schedule changes — bonus sessions add extra stimulus when life allows.',
    },
  ],
};

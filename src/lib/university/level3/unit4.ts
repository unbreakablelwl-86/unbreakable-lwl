import { getUniversityImage } from '@/lib/university/imageMap';
import type { Unit } from '../types';

export const level3Unit4: Unit = {
  number: 4,
  title: 'Behaviour & Lifestyle',
  description: 'Adherence psychology, habit formation, stress and the nervous system, sleep optimisation, managing training around life, self-talk and mental frameworks, social influence, and long-term sustainability.',
  chapters: [
    {
      number: 1,
      title: 'Adherence Psychology',
      learningOutcome: 'Understand the psychological factors that determine long-term adherence to training and nutrition programmes.',
      assessmentCriteria: [
        'Explain the primary reasons people abandon fitness programmes',
        'Describe psychological strategies that improve long-term adherence',
        'Apply adherence principles to design a sustainable training approach',
      ],
      content: [
        {
          heading: 'Why People Quit',
          paragraphs: [
            'The fitness industry has a retention problem. Most people who start a programme quit within the first three months. The exercises and nutrition science are rarely the issue — the psychology of adherence is where most people fail.',
            'Understanding why people quit is the first step toward ensuring you do not become another statistic.',
          ],
          bullets: [
            'Unrealistic expectations — Expecting visible results in days or weeks when meaningful change takes months',
            'All-or-nothing thinking — Believing that a missed session or imperfect meal means the entire effort is wasted',
            'Programme mismatch — Following a programme that does not fit your schedule, preferences, or lifestyle',
            'Lack of intrinsic motivation — Relying on external motivation (social media, a bet, a holiday) that fades over time',
            'Comparison — Measuring your progress against other people rather than your own starting point',
          ],
          imageUrl: getUniversityImage('l3-u4-ch1-why-people-quit'),
          imageAlt: 'Declining motivation curve showing five common quit points over 90 days',
        },
        {
          heading: 'Building Consistency Over Perfection',
          paragraphs: [
            'Consistency beats perfection every time. A person who trains three times per week for a year will achieve far more than someone who trains six times per week for six weeks and then burns out.',
            'The key shift is moving from a performance mindset ("I need to train perfectly") to a consistency mindset ("I need to keep showing up"). This means accepting that some sessions will be average, some meals will be imperfect, and progress will not be linear.',
          ],
          imageUrl: getUniversityImage('l3-u4-ch1-adherence'),
          imageAlt: 'Graph comparing perfect but unsustainable adherence vs imperfect but consistent adherence over 12 months',
        },
        {
          heading: 'Strategies for Long-Term Adherence',
          paragraphs: [
            'Evidence-based strategies that improve adherence:',
          ],
          bullets: [
            'Set process goals, not just outcome goals — "Train 3× per week" is more actionable than "lose 10 kg"',
            'Build identity-based habits — Shift from "I am trying to get fit" to "I am someone who trains"',
            'Use minimum viable sessions — On low-motivation days, do a shortened session rather than skipping entirely',
            'Track progress with multiple metrics — Scale weight, photos, strength, energy, and how clothes fit',
            'Plan for obstacles — Anticipate busy weeks, holidays, and low-motivation periods. Have a plan B.',
          ],
          imageUrl: getUniversityImage('l3-u4-ch1-adherence-strategies'),
          imageAlt: 'Five adherence strategies: process goals, identity-based habits, minimum viable sessions, multi-metric tracking, obstacle planning',
        },
        {
          heading: 'The Role of Enjoyment',
          paragraphs: [
            'You are far more likely to stick with training you enjoy. If you hate running, do not build your programme around running. If you love lifting heavy, build around that. The "best" exercise is one you will actually do consistently.',
            'This does not mean avoiding hard work — it means structuring hard work in a way that aligns with your preferences and personality.',
          ],
        },
      ],
      unbreakableInsight: 'The best programme is the one you actually follow. A scientifically perfect plan that you abandon after three weeks is infinitely worse than an "imperfect" plan you stick with for a year.',
      coachNote: 'When someone misses a session, the conversation should be about getting back on track — not about what they missed. Guilt does not improve adherence; self-compassion does.',
      practicalTask: {
        title: 'Adherence Audit',
        instructions: 'Reflect on every time you have started and stopped a fitness programme. Identify the top three reasons you quit and write a specific strategy to address each one.',
        reflectionQuestions: [
          'What has caused you to abandon programmes in the past?',
          'Do you tend toward all-or-nothing thinking about training and nutrition?',
          'What would a "minimum viable session" look like for you on a difficult day?',
        ],
      },
    },
    {
      number: 2,
      title: 'Habit Formation',
      learningOutcome: 'Understand the science of habit formation and apply practical strategies to build and maintain training and nutrition habits.',
      assessmentCriteria: [
        'Explain the cue-routine-reward loop and its role in habit formation',
        'Describe habit stacking and environment design as strategies for building new habits',
        'Design a habit-building plan for a specific training or nutrition behaviour',
      ],
      content: [
        {
          heading: 'How Habits Work',
          paragraphs: [
            'A habit is a behaviour that has become automatic through repetition. Once a behaviour is habitual, it requires far less mental effort and willpower to execute. This is why building habits — rather than relying on motivation — is the most sustainable approach to long-term fitness.',
            'Every habit follows a three-part loop: cue (the trigger), routine (the behaviour), and reward (the outcome that reinforces the behaviour).',
          ],
          bullets: [
            'Cue — A contextual trigger that initiates the behaviour. This could be a time of day, a location, an emotion, or a preceding action.',
            'Routine — The behaviour itself. Going to the gym, preparing a meal, drinking water.',
            'Reward — The positive outcome that reinforces the loop. This could be the post-workout endorphin rush, the satisfaction of ticking a box, or a tangible reward you set for yourself.',
          ],
          imageUrl: getUniversityImage('l3-u4-ch2-habit-loop'),
          imageAlt: 'Circular diagram showing the habit loop — Cue triggers Routine which produces Reward which reinforces the Cue',
        },
        {
          heading: 'Habit Stacking',
          paragraphs: [
            'Habit stacking links a new behaviour to an existing habit. The formula is: "After [current habit], I will [new habit]." For example: "After I make my morning coffee, I will prepare my gym bag." By anchoring the new behaviour to something you already do automatically, the cue is already built in.',
            'This technique is particularly effective for small behaviours like taking supplements, filling a water bottle, or reviewing your training plan.',
          ],
          imageUrl: getUniversityImage('l3-u4-ch2-habit-stacking'),
          imageAlt: 'Habit stacking diagram showing existing habit plus new behaviour equals stacked routine',
        },
        {
          heading: 'Environment Design',
          paragraphs: [
            'Your environment has a far greater influence on your behaviour than your willpower. Making good choices easy and bad choices difficult is one of the most powerful strategies for building habits.',
          ],
          bullets: [
            'Lay out your gym clothes the night before — removing a decision barrier',
            'Keep healthy food visible and accessible; keep less healthy options out of sight',
            'Set a recurring calendar reminder for training sessions',
            'Choose a gym that is on your route to or from work — reducing friction',
            'Prepare meals in advance so healthy eating does not require daily effort',
          ],
        },
        {
          heading: 'How Long Does It Take?',
          paragraphs: [
            'The popular claim that habits take 21 days to form is a myth. Research by Phillippa Lally at University College London found that it takes an average of 66 days for a new behaviour to become automatic, with significant individual variation (18 to 254 days).',
            'The key finding was that missing a single day did not reset progress. What mattered was overall consistency, not perfection. This is liberating — it means occasional misses do not ruin your habit-building efforts.',
          ],
          imageUrl: getUniversityImage('l3-u4-ch2-habit-timeline'),
          imageAlt: 'Bell curve showing habit formation timeline averaging 66 days with range from 18 to 254 days',
        },
      ],
      unbreakableInsight: 'Motivation gets you started. Habits keep you going. If you are waiting to "feel like training" before you go, you will spend most of your time waiting.',
      coachNote: 'Focus on making the habit small and easy initially. "Go to the gym for 20 minutes" is more sustainable than "complete a 90-minute session" when building a new training habit. Once the habit is established, the sessions naturally expand.',
      practicalTask: {
        title: 'Habit Stack Design',
        instructions: 'Identify one fitness behaviour you want to make habitual. Design a habit stack linking it to an existing daily habit, and plan three environment changes to support it.',
        reflectionQuestions: [
          'What existing habits could you anchor a new fitness behaviour to?',
          'What environmental changes would make your training habit easier?',
          'What barriers currently make healthy behaviours difficult?',
        ],
      },
    },
    {
      number: 3,
      title: 'Stress & the Nervous System',
      learningOutcome: 'Understand how stress affects training performance and recovery through the autonomic nervous system.',
      assessmentCriteria: [
        'Explain the roles of the sympathetic and parasympathetic nervous systems',
        'Describe how chronic stress impairs training adaptation and recovery',
        'Identify strategies for managing stress to support training goals',
      ],
      content: [
        {
          heading: 'The Autonomic Nervous System',
          paragraphs: [
            'Your autonomic nervous system (ANS) has two branches that work in balance: the sympathetic nervous system (SNS) — your "fight or flight" response — and the parasympathetic nervous system (PNS) — your "rest and digest" response.',
            'Training itself is a sympathetic stressor. After training, you need to shift into a parasympathetic state for recovery and adaptation to occur. Problems arise when chronic life stress keeps you stuck in sympathetic dominance.',
          ],
          imageUrl: getUniversityImage('l3-u4-ch3-ans-branches'),
          imageAlt: 'Two-column comparison of sympathetic fight-or-flight vs parasympathetic rest-and-digest nervous system branches',
        },
        {
          heading: 'Cortisol and Training',
          paragraphs: [
            'Cortisol is the primary stress hormone. In acute doses (during training), it is normal and beneficial — it mobilises energy and supports performance. However, chronically elevated cortisol has negative effects:',
          ],
          bullets: [
            'Impaired muscle protein synthesis — Chronic cortisol inhibits the building of new muscle tissue',
            'Increased fat storage — Particularly around the midsection',
            'Disrupted sleep — Elevated cortisol in the evening prevents the natural sleep-onset process',
            'Suppressed immune function — Making you more susceptible to illness',
            'Reduced motivation — Chronic stress depletes the psychological resources needed for consistent training',
          ],
          imageUrl: getUniversityImage('l3-u4-ch3-nervous-system'),
          imageAlt: 'Balance scale diagram showing sympathetic vs parasympathetic nervous system with factors that tip each direction',
        },
        {
          heading: 'Heart Rate Variability (HRV)',
          paragraphs: [
            'HRV — the variation in time between successive heartbeats — is a non-invasive marker of autonomic nervous system balance. Higher HRV generally indicates better recovery and parasympathetic dominance. Lower HRV suggests sympathetic dominance and accumulated stress.',
            'Many wearable devices now track HRV. While not a perfect metric, trends in HRV over time can provide useful insight into your recovery status and readiness to train.',
          ],
          imageUrl: getUniversityImage('l3-u4-ch3-hrv'),
          imageAlt: 'Heart rate variability comparison showing high HRV good recovery vs low HRV stressed state with readiness zones',
        },
        {
          heading: 'Managing Stress for Better Training',
          paragraphs: [
            'You cannot eliminate stress, but you can manage your total stress load:',
          ],
          bullets: [
            'Recognise that training stress adds to life stress — during high-stress periods, reduce training volume or intensity',
            'Practise intentional relaxation — breathing exercises, meditation, or simply spending time in nature',
            'Prioritise sleep — the single most effective recovery tool you have',
            'Limit stimulant intake — excessive caffeine extends sympathetic activation',
            'Schedule recovery — active rest days, walks, and low-intensity movement support parasympathetic recovery',
          ],
        },
      ],
      unbreakableInsight: 'You do not grow in the gym. You grow when you recover from the gym. If your life outside training is a constant state of stress, your body is spending its resources surviving — not adapting.',
      coachNote: 'If someone reports poor sleep, low motivation, and stalled progress despite good training and nutrition, explore their stress levels before changing their programme. The issue may not be the training — it may be everything else.',
      practicalTask: {
        title: 'Stress Inventory',
        instructions: 'List all sources of stress in your life (work, relationships, financial, training, sleep, etc.). Rate each from 1–10. Identify the top three stressors and write one action you could take to reduce each.',
        reflectionQuestions: [
          'How does your stress level fluctuate across a typical week?',
          'Do you adjust your training during high-stress periods?',
          'What recovery practices do you currently use outside of sleep?',
        ],
      },
    },
    {
      number: 4,
      title: 'Sleep Optimisation',
      learningOutcome: 'Understand the impact of sleep on training performance and recovery, and apply evidence-based strategies to improve sleep quality.',
      assessmentCriteria: [
        'Explain how sleep affects muscle recovery, hormonal balance, and training performance',
        'Describe the concept of sleep hygiene and its key components',
        'Design a personalised sleep optimisation protocol',
      ],
      content: [
        {
          heading: 'Why Sleep Is Non-Negotiable',
          paragraphs: [
            'Sleep is the single most important recovery tool available to you — and it is free. During deep sleep, your body releases the majority of its daily growth hormone, repairs damaged tissues, consolidates motor learning, and restores the nervous system.',
            'Chronic sleep deprivation (consistently less than 7 hours) impairs every aspect of fitness: strength decreases, injury risk increases, appetite regulation breaks down, and motivation drops. No amount of supplements, recovery tools, or "optimal programming" can compensate for poor sleep.',
          ],
          imageUrl: getUniversityImage('l3-u4-ch4-sleep-deprivation'),
          imageAlt: 'Sleep deprivation effects on six body systems including strength, injury risk, appetite, motivation, immunity, and hormones',
        },
        {
          heading: 'Sleep and Hormones',
          paragraphs: [
            'Sleep profoundly affects your hormonal environment:',
          ],
          bullets: [
            'Growth hormone — Released primarily during deep (slow-wave) sleep. Essential for tissue repair and muscle growth.',
            'Testosterone — Sleep restriction reduces testosterone levels by up to 15% after just one week of 5-hour nights.',
            'Cortisol — Poor sleep elevates morning cortisol, promoting catabolism and fat storage.',
            'Leptin and ghrelin — Sleep deprivation decreases leptin (satiety) and increases ghrelin (hunger), making appetite control significantly harder.',
          ],
          imageUrl: getUniversityImage('l3-u4-ch4-sleep-stages'),
          imageAlt: 'Diagram showing sleep stages and hormonal release patterns across a typical 8-hour sleep cycle',
        },
        {
          heading: 'Sleep Hygiene Fundamentals',
          paragraphs: [
            'Sleep hygiene refers to the habits and environmental conditions that support quality sleep:',
          ],
          bullets: [
            'Consistent schedule — Go to bed and wake up at the same time every day, including weekends. This regulates your circadian rhythm.',
            'Cool, dark room — Optimal sleep temperature is 16–19°C. Use blackout curtains and eliminate light sources.',
            'Screen limitation — Reduce blue light exposure 60–90 minutes before bed. Blue light suppresses melatonin production.',
            'Caffeine curfew — Avoid caffeine after 2pm (or earlier if you are sensitive). Caffeine has a half-life of 5–7 hours.',
            'Pre-sleep routine — Develop a consistent wind-down routine: dim lights, read, stretch, or practise breathing exercises.',
            'Limit alcohol — While alcohol may help you fall asleep, it severely disrupts sleep architecture, reducing deep and REM sleep.',
          ],
          imageUrl: getUniversityImage('l3-u4-ch4-sleep-hygiene'),
          imageAlt: 'Sleep hygiene checklist with six key practices: consistent schedule, cool dark room, screen limitation, caffeine curfew, wind-down routine, limit alcohol',
        },
        {
          heading: 'Sleep and Training Performance',
          paragraphs: [
            'Research shows that even partial sleep deprivation impairs reaction time, reduces time to exhaustion, increases perceived effort, and impairs decision-making during training. One night of poor sleep will not ruin your session, but chronic sleep debt accumulates and progressively degrades performance.',
            'If you are serious about your training, treat sleep with the same priority as your programme and nutrition. It is not a luxury — it is a performance tool.',
          ],
        },
      ],
      unbreakableInsight: 'You can have the perfect programme, the perfect diet, and the perfect supplements — but if you sleep five hours a night, you are building on a foundation of sand. Sleep is the multiplier for everything else.',
      coachNote: 'Before adjusting someone\'s programme because progress has stalled, ask about their sleep. It is remarkable how often "I need a new programme" is actually "I need to go to bed an hour earlier."',
      practicalTask: {
        title: 'Sleep Audit',
        instructions: 'Track your sleep for one week — record bedtime, wake time, estimated sleep quality, and any factors that disrupted sleep. Identify your three biggest sleep barriers and implement one change.',
        reflectionQuestions: [
          'How many hours of sleep do you average per night?',
          'Is your bedtime consistent, or does it vary by more than an hour?',
          'What is the biggest barrier to improving your sleep?',
        ],
      },
    },
    {
      number: 5,
      title: 'Managing Training Around Life',
      learningOutcome: 'Develop strategies for maintaining training consistency during periods of disruption, including work demands, travel, illness, and motivation fluctuations.',
      assessmentCriteria: [
        'Describe common life disruptions and their impact on training',
        'Design flexible training strategies for periods of reduced availability',
        'Apply the concept of "minimum effective dose" to maintain progress during challenging periods',
      ],
      content: [
        {
          heading: 'Life Happens',
          paragraphs: [
            'No one trains in a vacuum. Work deadlines, family commitments, travel, illness, and mental health fluctuations all compete with your training schedule. The people who achieve long-term results are not the ones with perfect circumstances — they are the ones who adapt their training to imperfect circumstances.',
            'The goal during disrupted periods is not to maintain your optimal programme. It is to maintain the training habit and do enough to prevent significant regression.',
          ],
        },
        {
          heading: 'The Minimum Effective Dose',
          paragraphs: [
            'During challenging periods, apply the concept of minimum effective dose (MED) — the smallest amount of training needed to maintain your current level. Research suggests this is surprisingly low:',
          ],
          bullets: [
            'Strength can be maintained with as little as 1 heavy session per week per major movement pattern',
            'Muscle mass can be preserved with approximately one-third of your normal training volume, provided intensity is maintained',
            'Cardiovascular fitness declines more slowly than most people expect — moderate activity prevents significant loss for several weeks',
          ],
          imageUrl: getUniversityImage('l3-u4-ch5-stress-response'),
          imageAlt: 'Stress response pathway showing the HPA axis from stressor through hypothalamus, pituitary, adrenal glands, and cortisol release with negative feedback loop',
        },
        {
          heading: 'Training During Travel',
          paragraphs: [
            'Travel does not have to mean zero training. Build a repertoire of bodyweight and minimal-equipment sessions:',
          ],
          bullets: [
            'Bodyweight circuits — Push-ups, squats, lunges, planks, and burpees require no equipment',
            'Resistance bands — Lightweight, packable, and versatile for upper and lower body work',
            'Hotel gym sessions — Even basic equipment (dumbbells, cable machine) allows effective maintenance training',
            'Walking — Accumulating 8,000–10,000 steps daily maintains NEAT and cardiovascular health',
          ],
          imageUrl: getUniversityImage('l3-u4-ch5-travel-training'),
          imageAlt: 'Four travel training options: bodyweight circuits, resistance bands, hotel gym, and walking for 10000 steps',
        },
        {
          heading: 'Training During Illness',
          paragraphs: [
            'The general rule: if symptoms are above the neck (runny nose, sore throat, mild congestion), light exercise is usually acceptable. If symptoms are below the neck (chest congestion, body aches, fever, fatigue), rest completely until symptoms resolve.',
            'After illness, return gradually. Do not attempt to "make up" missed sessions. Start at 50–60% of your previous volume and intensity, and ramp back over 1–2 weeks.',
          ],
        },
        {
          heading: 'Motivation Dips',
          paragraphs: [
            'Motivation is not constant — it fluctuates. Waiting to "feel motivated" before training is a losing strategy. Instead, rely on your systems (habits, scheduled sessions, training partners, minimum sessions) to carry you through low-motivation periods.',
            'If low motivation persists for more than two weeks, it may signal overtraining, life stress overload, or the need for a programme change. Treat persistent amotivation as information, not a character flaw.',
          ],
          imageUrl: getUniversityImage('l3-u4-ch5-motivation-dips'),
          imageAlt: 'Motivation wave chart over 12 months showing dips where systems like habits and training partners carry you through',
        },
      ],
      unbreakableInsight: 'The person who does 20 minutes on a bad day beats the person who does nothing because they could not face a full session. Something always beats nothing.',
      coachNote: 'Give people explicit permission to have "minimum sessions." Many trainees feel guilty about anything less than their full programme. Having a pre-planned 20-minute fallback removes the guilt and maintains the habit.',
      practicalTask: {
        title: 'Disruption Plan',
        instructions: 'Design three training plans: your full programme, a reduced programme for busy weeks, and a minimum effective session for travel or illness. Write each one out so it is ready to use immediately.',
        reflectionQuestions: [
          'What is the most common disruption to your training?',
          'Do you have a bodyweight or minimal-equipment session ready to use?',
          'How do you typically respond to motivation dips — adapt or abandon?',
        ],
      },
    },
    {
      number: 6,
      title: 'Self-Talk & Mental Frameworks',
      learningOutcome: 'Understand how self-talk and mental frameworks influence training behaviour and learn to develop a growth-oriented mindset.',
      assessmentCriteria: [
        'Explain the concept of fixed vs growth mindset and its application to training',
        'Describe how identity-based habits differ from outcome-based habits',
        'Apply positive self-talk strategies to improve training performance and consistency',
      ],
      content: [
        {
          heading: 'Fixed vs Growth Mindset',
          paragraphs: [
            'Carol Dweck\'s research on mindset distinguishes between two fundamental orientations: a fixed mindset (believing abilities are innate and unchangeable) and a growth mindset (believing abilities can be developed through effort and learning).',
            'In training, a fixed mindset sounds like: "I am not a strong person." A growth mindset sounds like: "I am not strong yet, but I am getting stronger." This single word — "yet" — transforms a limitation into a work-in-progress.',
          ],
          imageUrl: getUniversityImage('l3-u4-ch6-mindset-comparison'),
          imageAlt: 'Fixed vs growth mindset comparison showing locked vs open mindset with the power of the word YET',
        },
        {
          heading: 'Identity-Based Habits',
          paragraphs: [
            'James Clear\'s concept of identity-based habits suggests that lasting behaviour change starts with who you believe you are, not what you want to achieve:',
          ],
          bullets: [
            'Outcome-based: "I want to lose 10 kg" — This goal has an end point. Once achieved (or abandoned), the behaviour often stops.',
            'Identity-based: "I am someone who trains consistently" — This is an ongoing identity that drives behaviour indefinitely.',
            'Every action you take is a vote for the type of person you want to become. Each training session reinforces the identity of "someone who trains."',
          ],
          imageUrl: getUniversityImage('l3-u4-ch6-social-support'),
          imageAlt: 'Social support and accountability diagram showing training partner, online community, coach/mentor, and family connections',
        },
        {
          heading: 'Self-Talk in Training',
          paragraphs: [
            'The way you talk to yourself during training directly affects performance. Research on self-talk in sport psychology consistently shows that instructional self-talk ("drive through the floor") and motivational self-talk ("I\'ve got this") improve performance compared to negative or no self-talk.',
          ],
          bullets: [
            'Replace "I can\'t" with "I am working on it"',
            'Use instructional cues during difficult sets: "tight core, drive up"',
            'After a poor set, redirect attention: "What will I do differently next set?" rather than dwelling on failure',
            'Celebrate small wins — acknowledging progress, however small, reinforces positive self-talk patterns',
          ],
          imageUrl: getUniversityImage('l3-u4-ch6-self-talk'),
          imageAlt: 'Self-talk reframe chart transforming negative statements into positive growth-oriented alternatives',
        },
        {
          heading: 'Reframing Failure',
          paragraphs: [
            'In a growth mindset framework, failure is not evidence that you are not good enough — it is data. A missed lift tells you something about your current capacity and programme. A stalled diet phase tells you something about your approach. The information is only useful if you treat it as feedback rather than judgment.',
            'The most resilient trainees are not the ones who never fail. They are the ones who fail, learn, and adjust without it defining their self-worth.',
          ],
        },
      ],
      unbreakableInsight: 'You will talk to yourself more than anyone else will ever talk to you. Make sure that voice is a coach, not a critic.',
      coachNote: 'Listen to how people describe themselves during sessions. "I\'m useless at this" or "I always fail" reveals a fixed mindset that will limit their progress regardless of how good their programme is. Address the narrative first.',
      practicalTask: {
        title: 'Self-Talk Rewrite',
        instructions: 'For one week, pay attention to your self-talk during training. Write down any negative statements and rewrite each one using a growth mindset frame.',
        reflectionQuestions: [
          'What do you typically say to yourself during difficult sets?',
          'Do you identify as "someone who trains" or "someone trying to get fit"?',
          'How do you typically respond to setbacks — with self-criticism or curiosity?',
        ],
      },
    },
    {
      number: 7,
      title: 'Social Influence & Accountability',
      learningOutcome: 'Understand how social environments influence training behaviour and learn to leverage accountability systems for long-term consistency.',
      assessmentCriteria: [
        'Explain how social influence affects training motivation and behaviour',
        'Describe the benefits and potential pitfalls of training with others',
        'Design an accountability system that supports long-term training consistency',
      ],
      content: [
        {
          heading: 'The Power of Social Environment',
          paragraphs: [
            'You are the average of the five people you spend the most time with — this often-quoted principle has genuine relevance in fitness. Research consistently shows that social environment significantly influences health behaviours, including exercise habits, dietary choices, and overall motivation.',
            'Surrounding yourself with people who value training and health creates social norms that make your own training feel natural rather than exceptional.',
          ],
          imageUrl: getUniversityImage('l3-u4-ch7-social-environment'),
          imageAlt: 'Social environment network diagram showing central person connected to training partner, coach, family, and communities',
        },
        {
          heading: 'Training Partners and Communities',
          paragraphs: [
            'A good training partner can be one of the most powerful tools for consistency:',
          ],
          bullets: [
            'Accountability — Knowing someone is expecting you at the gym makes it harder to skip',
            'Motivation — Working alongside someone with similar or slightly higher ability pushes you to perform better',
            'Safety — A spotter allows you to train closer to failure on heavy compounds',
            'Social enjoyment — Training becomes more enjoyable, which improves adherence',
          ],
          imageUrl: getUniversityImage('l3-u4-ch7-self-talk'),
          imageAlt: 'Self-talk reframing model showing negative self-talk transformed into positive reframes with the cue-thought-reframe-action process',
        },
        {
          heading: 'The Comparison Trap',
          paragraphs: [
            'Social influence is not always positive. Social media, in particular, creates a distorted comparison environment:',
          ],
          bullets: [
            'You see other people\'s highlight reels, not their struggles',
            'Many physiques presented as "natural" involve performance-enhancing drugs, professional lighting, and strategic angles',
            'Comparing your beginning to someone else\'s peak is demoralising and irrational',
            'The only valid comparison is you today vs you six months ago',
          ],
          imageUrl: getUniversityImage('l3-u4-ch7-comparison-trap'),
          imageAlt: 'The comparison trap showing highlight reel vs reality with the message to only compare yourself to your past self',
        },
        {
          heading: 'Building Effective Accountability',
          paragraphs: [
            'Accountability works best when it is structured and reciprocal:',
          ],
          bullets: [
            'Regular check-ins — Weekly progress reports to a training partner, coach, or group',
            'Public commitment — Telling others about your goals creates social pressure to follow through',
            'Tracking systems — Shared training logs or apps where progress is visible',
            'Consequences — Pre-committed consequences for missed sessions (e.g., donating to a cause you dislike)',
            'Celebrate together — Sharing successes reinforces the behaviour for everyone involved',
          ],
        },
      ],
      unbreakableInsight: 'If everyone around you thinks training is optional and diet does not matter, you are swimming upstream. Your environment is either lifting you up or holding you back — there is no neutral.',
      coachNote: 'Help people find their tribe. Whether it is a gym community, an online group, or a single training partner, the social scaffolding around training is often more important than the programme itself.',
      practicalTask: {
        title: 'Social Environment Audit',
        instructions: 'Evaluate your current social environment in relation to fitness. Identify who supports your goals, who might hinder them, and what steps you could take to strengthen your accountability system.',
        reflectionQuestions: [
          'Do the people around you support or undermine your training goals?',
          'Do you have a training partner or accountability system in place?',
          'How does social media affect your motivation — positively or negatively?',
        ],
      },
    },
    {
      number: 8,
      title: 'Long-Term Sustainability',
      learningOutcome: 'Develop a sustainable, long-term approach to training and nutrition that prevents burnout and supports lifelong fitness.',
      assessmentCriteria: [
        'Explain the concept of periodising lifestyle alongside training',
        'Describe strategies for avoiding burnout and maintaining motivation over years',
        'Apply the 80/20 principle to training, nutrition, and lifestyle for sustainable results',
      ],
      content: [
        {
          heading: 'The Long Game',
          paragraphs: [
            'Most fitness content focuses on the short term: 8-week transformations, 30-day challenges, rapid results. But the people who actually achieve and maintain exceptional physiques and fitness levels do so over years and decades, not weeks.',
            'Long-term sustainability requires a fundamentally different mindset from short-term intensity. It requires viewing fitness as a permanent part of your life — like brushing your teeth — rather than a temporary project with an end date.',
          ],
        },
        {
          heading: 'Periodising Your Life',
          paragraphs: [
            'Just as training benefits from periodisation, your overall approach to fitness should adapt to life phases:',
          ],
          bullets: [
            'Career-intensive periods — Reduce training volume, focus on maintenance, prioritise sleep and stress management',
            'Family transitions — Adapt to new schedules with home workouts, shorter sessions, and flexible timing',
            'Holiday and travel — Embrace active rest, enjoy food without guilt, maintain movement',
            'High-motivation phases — Capitalise on enthusiasm with progressive training blocks and ambitious goals',
            'Recovery phases — Deliberately pull back after intense training blocks or life events',
          ],
          imageUrl: getUniversityImage('l3-u4-ch8-long-term-planning'),
          imageAlt: 'Long-term planning framework showing a 12-month timeline with foundation, development, peak, and recovery phases with quarterly assessment checkpoints',
        },
        {
          heading: 'The 80/20 Rule',
          paragraphs: [
            'The 80/20 principle suggests that 80% of your results come from 20% of your efforts. In practice, this means:',
          ],
          bullets: [
            'Training — Compound movements, progressive overload, and adequate volume account for the vast majority of your results. Advanced techniques are the remaining 20%.',
            'Nutrition — Adequate protein and appropriate calories drive 80% of body composition outcomes. Meal timing, supplements, and micro-optimisation are the other 20%.',
            'Lifestyle — Consistent sleep, managed stress, and regular movement cover 80% of recovery needs. Ice baths, compression boots, and recovery gadgets are the other 20%.',
          ],
          imageUrl: getUniversityImage('l3-u4-ch8-eighty-twenty'),
          imageAlt: 'The 80/20 rule applied to training, nutrition, and lifestyle showing where the majority of results come from',
        },
        {
          heading: 'Avoiding Burnout',
          paragraphs: [
            'Burnout in fitness is real and common. Signs include persistent loss of motivation, dreading training, chronic fatigue despite adequate rest, and emotional exhaustion around food or body image.',
          ],
          bullets: [
            'Take planned breaks — A week off every 3–6 months for complete rest and mental reset',
            'Vary your training — Introduce new activities, sports, or challenges to maintain interest',
            'Decouple self-worth from performance — A bad training week does not make you a bad person',
            'Maintain perspective — Fitness serves your life, not the other way around',
            'Enjoy the process — If you only enjoy the results, you will be unhappy 95% of the time. Learn to enjoy the training itself.',
          ],
          imageUrl: getUniversityImage('l3-u4-ch8-burnout'),
          imageAlt: 'Burnout warning signs and prevention strategies with battery metaphor showing depletion vs recharge',
        },
        {
          heading: 'The Unbreakable Approach',
          paragraphs: [
            'Being unbreakable is not about training harder than everyone else. It is about training smarter, recovering better, adapting to challenges, and still being at it ten years from now. The person who trains consistently at 70% intensity for a decade will achieve more than someone who trains at 100% for six months and quits.',
            'This is the final lesson: sustainability is the ultimate performance strategy.',
          ],
        },
      ],
      unbreakableInsight: 'The finish line does not exist. There is no point where you "complete" fitness and stop. The moment you accept this, you stop chasing quick fixes and start building something that lasts.',
      coachNote: 'The best measure of a successful training approach is not what someone achieves in 12 weeks — it is whether they are still training in 12 months. Programme for the long term. Always.',
      practicalTask: {
        title: 'Sustainability Blueprint',
        instructions: 'Write a one-page plan for how you will maintain your fitness over the next 12 months, including how you will adapt during busy periods, holidays, and low-motivation phases.',
        reflectionQuestions: [
          'Can you see yourself following your current programme for the next year?',
          'What aspects of your current approach are unsustainable?',
          'How would you describe your relationship with fitness — is it healthy, obsessive, or inconsistent?',
        ],
      },
    },
  ],
};

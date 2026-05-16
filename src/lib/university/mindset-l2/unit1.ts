import type { Unit } from '../types';
import ch1MentalResilience from '@/assets/university/mindl2-u1-ch1-mental-resilience.png';
import ch2StressResponse from '@/assets/university/mindl2-u1-ch2-stress-response.png';
import ch3AutonomicNervous from '@/assets/university/mindl2-u1-ch3-autonomic-nervous.png';
import ch4GrowthMindset from '@/assets/university/mindl2-u1-ch4-growth-mindset.png';
import ch5GoalSetting from '@/assets/university/mindl2-u1-ch5-goal-setting.png';
import ch6SleepRecovery from '@/assets/university/mindl2-u1-ch6-sleep-recovery.png';

export const mindsetL2Unit1: Unit = {
  number: 1,
  title: 'Foundations of Mental Resilience',
  description: 'Understand the science of mental toughness, stress physiology, and the foundational mindset principles that underpin consistent personal development.',
  chapters: [
    {
      number: 1,
      title: 'What Is Mental Resilience?',
      learningOutcome: 'Understand the concept of mental resilience, its components, and why it is a trainable skill rather than an innate trait.',
      assessmentCriteria: [
        'Define mental resilience and distinguish it from suppressing emotions',
        'Identify the key components of resilience: adaptability, emotional regulation, and recovery',
        'Explain why resilience is developed through practice, not born into',
      ],
      content: [
        {
          heading: 'Resilience Is Not Toughness',
          paragraphs: [
            'Mental resilience is not about ignoring pain, suppressing emotions, or pretending everything is fine. It is the ability to adapt to stress, recover from setbacks, and maintain forward progress despite difficulty. Resilient people still feel fear, frustration, and doubt — they simply have better systems for processing these experiences and continuing to function.',
            'The misconception that resilience means "never breaking" causes immense harm. It discourages people from seeking help and frames normal emotional responses as weakness. True resilience includes knowing when to rest, when to ask for support, and when to adjust your approach.',
          ],
          imageUrl: ch1MentalResilience,
          imageAlt: 'Diagram showing the three pillars of mental resilience: adaptability, emotional regulation, and recovery',
        },
        {
          heading: 'The Components of Resilience',
          bullets: [
            'Adaptability — The ability to adjust your strategies and expectations when circumstances change, rather than rigidly clinging to the original plan',
            'Emotional regulation — Managing your emotional responses so they inform your decisions rather than hijack them. This is not suppression — it is conscious processing',
            'Recovery capacity — How quickly and effectively you bounce back from failure, disappointment, or adversity. This improves with deliberate practice',
            'Growth orientation — Viewing challenges as opportunities for development rather than threats to your identity',
          ],
        },
        {
          heading: 'Resilience Is Trainable',
          paragraphs: [
            'Research consistently demonstrates that resilience is not a fixed personality trait — it is a set of skills and habits that can be developed. Just as you build physical strength through progressive resistance, you build mental resilience through deliberate exposure to manageable challenges and structured recovery.',
            'This course will provide you with the tools, frameworks, and practices to systematically develop your mental resilience. Like any form of training, it requires consistency, patience, and honest self-assessment.',
          ],
        },
      ],
      unbreakableInsight: 'Resilience is not about never falling down — it is about how quickly and intelligently you get back up. The person who never struggles is not resilient; they are sheltered.',
      coachNote: 'Start by noticing how you currently respond to small frustrations — traffic, a missed alarm, a bad session at the gym. Your response to minor stress reveals your baseline resilience more honestly than any crisis does.',
      practicalTask: {
        title: 'Resilience Baseline Assessment',
        instructions: 'Over the next three days, journal your response to every frustration or setback you encounter — however small. Note what happened, how you felt, what you did, and how long it took you to recover. Look for patterns.',
        reflectionQuestions: [
          'Do you tend to catastrophise small problems or keep them in perspective?',
          'How long does it typically take you to recover from a minor setback?',
          'Are your responses to stress mostly helpful or mostly reactive?',
        ],
      },
    },
    {
      number: 2,
      title: 'The Stress Response',
      learningOutcome: 'Understand the physiology of the stress response, including the roles of the sympathetic nervous system, cortisol, and adrenaline.',
      assessmentCriteria: [
        'Describe the fight-or-flight response and its physiological effects',
        'Explain the difference between acute and chronic stress',
        'Discuss how chronic stress affects physical and mental health',
      ],
      content: [
        {
          heading: 'Fight or Flight — Your Survival System',
          paragraphs: [
            'When your brain perceives a threat — real or imagined — it activates the sympathetic nervous system, triggering the fight-or-flight response. This cascade of physiological changes evolved to help you survive immediate physical danger: increased heart rate, rapid breathing, heightened alertness, blood diverted to muscles, and non-essential functions (digestion, immune response) temporarily suppressed.',
            'The problem is that your brain cannot distinguish between a genuine threat (a car swerving toward you) and a perceived threat (an angry email from your boss). Both trigger the same physiological cascade. In the modern world, you rarely face physical danger — but your stress response fires constantly.',
          ],
          imageUrl: ch2StressResponse,
          imageAlt: 'Stress response pathway showing threat detection, hypothalamus activation, adrenal hormone release, and physiological effects',
        },
        {
          heading: 'Acute vs Chronic Stress',
          paragraphs: [
            'Acute stress is short-term and specific — a job interview, a heavy deadlift, a near-miss while driving. It activates the stress response, you deal with the situation, and your body returns to baseline. This type of stress is not only normal but beneficial — it drives adaptation and performance.',
            'Chronic stress is sustained and unresolved — ongoing work pressure, financial worry, relationship conflict, sleep deprivation. When the stress response stays elevated for weeks or months, it damages virtually every system in your body: immune function declines, inflammation increases, sleep quality deteriorates, digestion suffers, and mental health erodes.',
          ],
          bullets: [
            'Cortisol — The primary chronic stress hormone. Elevated cortisol promotes fat storage (particularly visceral fat), suppresses immune function, impairs memory, and disrupts sleep',
            'Adrenaline — The acute stress hormone. Provides immediate energy and alertness but is not designed for sustained release',
            'Chronic elevation — Linked to anxiety, depression, cardiovascular disease, digestive issues, and impaired recovery from exercise',
          ],
        },
        {
          heading: 'Why This Matters for You',
          paragraphs: [
            'Understanding your stress physiology gives you the power to intervene. You cannot always control what happens to you, but you can learn to regulate your response. The breathing techniques, exposure protocols, and cognitive strategies in this course are all tools for managing your stress response — shifting from reactive to intentional.',
          ],
        },
      ],
      unbreakableInsight: 'Stress is not the enemy — chronic, unmanaged stress is. Acute stress makes you stronger. The goal is not to eliminate stress but to control your relationship with it.',
      coachNote: 'If you are constantly tired, frequently ill, sleeping poorly, and struggling to recover from training — your stress load is likely too high. Before adding more training or supplements, address the stress.',
      practicalTask: {
        title: 'Stress Audit',
        instructions: 'List every source of stress in your life across five categories: work, relationships, health, finances, and training. Rate each from 1 (mild) to 5 (severe). Calculate your total stress load and identify the top three contributors.',
        reflectionQuestions: [
          'Is your total stress load higher than you expected?',
          'Which stressors are within your control to reduce or eliminate?',
          'Are you adding training stress on top of an already high life stress load?',
        ],
      },
    },
    {
      number: 3,
      title: 'The Autonomic Nervous System',
      learningOutcome: 'Understand the two branches of the autonomic nervous system and how to consciously influence the balance between activation and recovery.',
      assessmentCriteria: [
        'Describe the roles of the sympathetic and parasympathetic nervous systems',
        'Explain how breathing influences autonomic balance',
        'Discuss the concept of vagal tone and its relevance to resilience',
      ],
      content: [
        {
          heading: 'Two Systems, One Balance',
          paragraphs: [
            'Your autonomic nervous system (ANS) operates two complementary branches. The sympathetic nervous system (SNS) is your accelerator — it activates the fight-or-flight response, increases heart rate, and mobilises energy. The parasympathetic nervous system (PNS) is your brake — it promotes rest, digestion, recovery, and calm.',
            'Optimal functioning requires balance between these two systems. Most people in modern life are chronically sympathetically dominant — their accelerator is always pressed. Learning to activate the parasympathetic brake is one of the most powerful resilience skills you can develop.',
          ],
          imageUrl: ch3AutonomicNervous,
          imageAlt: 'Balanced sympathetic and parasympathetic nervous system diagram showing activation versus recovery states',
        },
        {
          heading: 'The Vagus Nerve — Your Recovery Highway',
          paragraphs: [
            'The vagus nerve is the primary pathway of the parasympathetic nervous system. It runs from your brainstem through your neck and into your chest and abdomen, connecting to your heart, lungs, and digestive system. "Vagal tone" refers to the strength and efficiency of this nerve — higher vagal tone is associated with better stress recovery, emotional regulation, and overall resilience.',
            'The remarkable thing about the vagus nerve is that you can stimulate it deliberately. Slow, controlled breathing — particularly with an extended exhale — directly activates vagal pathways and shifts your nervous system toward parasympathetic dominance. This is not mysticism; it is measurable physiology.',
          ],
        },
        {
          heading: 'Breathing as a Control Mechanism',
          paragraphs: [
            'Your breath is the only autonomic function that you can also control voluntarily. This makes it a unique bridge between your conscious and unconscious nervous system. By changing your breathing pattern, you can directly influence your heart rate, blood pressure, cortisol levels, and emotional state.',
            'Fast, shallow chest breathing activates the sympathetic system. Slow, deep diaphragmatic breathing with an extended exhale activates the parasympathetic system. This is why every evidence-based stress management protocol includes breathing techniques — they work because they directly interface with your neurology.',
          ],
          bullets: [
            'Inhale — Activates sympathetic tone slightly (heart rate increases)',
            'Exhale — Activates parasympathetic tone (heart rate decreases)',
            'Extended exhale — 4 seconds in, 6–8 seconds out creates a strong parasympathetic shift',
            'Nasal breathing — More efficient than mouth breathing, activates nitric oxide production, and naturally slows the breathing rate',
          ],
        },
      ],
      unbreakableInsight: 'You have a built-in stress management system that you carry with you everywhere — your breath. The problem is not that you lack the tools; it is that you have never been taught to use them.',
      coachNote: 'Before reaching for supplements, apps, or complex protocols, master the fundamentals: slow, nasal, diaphragmatic breathing with an extended exhale. Five minutes of this will shift your nervous system more reliably than any product.',
      practicalTask: {
        title: 'Breathing Pattern Awareness',
        instructions: 'Set three alarms throughout the day. At each alarm, notice your breathing without changing it: Are you breathing through your nose or mouth? Is your breath shallow (chest) or deep (belly)? Note your stress level at the same time.',
        reflectionQuestions: [
          'Were you predominantly breathing through your nose or mouth?',
          'Did you notice any correlation between shallow breathing and higher stress?',
          'How did it feel to simply observe your breathing without changing it?',
        ],
      },
    },
    {
      number: 4,
      title: 'Growth Mindset vs Fixed Mindset',
      learningOutcome: 'Understand Carol Dweck\'s mindset theory and apply it to your personal development and training.',
      assessmentCriteria: [
        'Define fixed mindset and growth mindset with examples',
        'Explain how mindset influences response to failure and feedback',
        'Discuss the limitations and nuances of mindset theory',
      ],
      content: [
        {
          heading: 'Two Ways of Seeing Ability',
          paragraphs: [
            'Psychologist Carol Dweck\'s research identifies two fundamental beliefs people hold about their abilities. A fixed mindset assumes that intelligence, talent, and ability are largely innate and unchangeable — you either "have it" or you do not. A growth mindset believes that abilities are developed through effort, learning, and persistence.',
            'These mindsets profoundly influence how you respond to challenges, failure, and feedback. Fixed mindset individuals avoid challenges (to protect their self-image), give up easily when things get hard, and view effort as a sign of inadequacy. Growth mindset individuals embrace challenges, persist through difficulty, and view effort as the path to mastery.',
          ],
          imageUrl: ch4GrowthMindset,
          imageAlt: 'Fixed mindset versus growth mindset comparison chart showing contrasting behaviours and beliefs',
        },
        {
          heading: 'Mindset in Practice',
          paragraphs: [
            'Consider two people who fail a personal record attempt at the gym. The fixed mindset response: "I am just not strong enough. Some people are built for this and I am not." The growth mindset response: "That attempt did not work today. What can I learn? What needs to change in my training or recovery?"',
            'The difference is not positivity versus negativity — it is attribution. Fixed mindset attributes outcomes to unchangeable traits. Growth mindset attributes outcomes to changeable behaviours and strategies.',
          ],
          bullets: [
            'Fixed mindset language — "I am bad at this," "I will never be able to," "I am not a _____ person"',
            'Growth mindset language — "I have not mastered this yet," "What can I try differently?", "This is challenging but I am improving"',
            'The word "yet" is one of the most powerful mindset tools — it transforms a dead end into a direction',
          ],
        },
        {
          heading: 'Nuances and Limitations',
          paragraphs: [
            'Mindset theory has been oversimplified in popular culture. Having a growth mindset does not mean you can achieve anything through sheer effort — genetics, resources, and circumstances all matter. It means that within your constraints, your approach to effort and learning significantly influences your outcomes.',
            'Most people hold different mindsets in different areas of life. You might have a growth mindset about fitness but a fixed mindset about your ability to cook, manage money, or maintain relationships. The goal is to notice where your fixed mindsets are limiting you and consciously challenge them.',
          ],
        },
      ],
      unbreakableInsight: 'Talent without effort produces potential. Effort without direction produces fatigue. A growth mindset combines both — directed effort toward continuous improvement. That is where results live.',
      coachNote: 'Listen to your own internal dialogue for one week. Every time you hear yourself say "I cannot" or "I am not," add the word "yet." This small linguistic shift begins rewiring how you frame your capabilities.',
      practicalTask: {
        title: 'Mindset Audit',
        instructions: 'Identify three areas where you hold a growth mindset and three where you suspect a fixed mindset. For each fixed mindset area, write down the specific belief and reframe it using growth-oriented language.',
        reflectionQuestions: [
          'Were you surprised by where your fixed mindsets appeared?',
          'How might your fixed mindsets be limiting your progress in those areas?',
          'What would change if you applied "yet" thinking to your biggest self-limiting belief?',
        ],
      },
    },
    {
      number: 5,
      title: 'Goal Setting for Mental Performance',
      learningOutcome: 'Apply advanced goal-setting strategies that support sustained motivation and mental resilience.',
      assessmentCriteria: [
        'Differentiate between outcome goals, performance goals, and process goals',
        'Explain why process goals are more effective for sustained motivation',
        'Design a goal hierarchy that connects daily actions to long-term vision',
      ],
      content: [
        {
          heading: 'Three Levels of Goals',
          paragraphs: [
            'Most people set outcome goals — "I want to lose 10kg," "I want to run a marathon," "I want to bench press 100kg." These are valid destinations, but they have a critical weakness: you do not have complete control over them. Injuries, life events, and genetics all influence outcomes regardless of your effort.',
            'Performance goals are partially within your control — "I want to improve my 5K time by 30 seconds." Process goals are entirely within your control — "I will train four times this week," "I will meal prep every Sunday," "I will practise breathing exercises for five minutes daily." Process goals drive the behaviours that lead to performance improvements, which in turn lead to outcomes.',
          ],
          imageUrl: ch5GoalSetting,
          imageAlt: 'Goal hierarchy pyramid showing process goals, performance goals, and outcome goals',
        },
        {
          heading: 'Why Process Goals Sustain Motivation',
          paragraphs: [
            'Outcome goals are motivating at first but become discouraging when progress is slow or invisible. If your only goal is "lose 10kg" and the scale does not move for two weeks, motivation evaporates — even though your process might be perfect.',
            'Process goals provide daily wins. Every time you complete a planned training session, prepare a healthy meal, or practise a breathing technique, you succeed. These small victories accumulate into habit formation, which is far more powerful than motivation — because habits do not require you to feel like doing something in order to do it.',
          ],
        },
        {
          heading: 'Building a Goal Hierarchy',
          paragraphs: [
            'A well-designed goal hierarchy connects your daily actions to your long-term vision. Start with your outcome goal (where you want to be in 6–12 months), break it into performance milestones (what measurable improvements will indicate progress), and then define the daily and weekly process goals that drive those improvements.',
            'Review your process goals weekly and your performance goals monthly. Adjust the process when performance is not moving in the right direction — but give each adjustment at least 2–4 weeks before concluding it is not working.',
          ],
        },
      ],
      unbreakableInsight: 'Fall in love with the process and the outcomes take care of themselves. If you need the outcome to stay motivated, you will quit every time the results take longer than you expected.',
      coachNote: 'Write your process goals on a whiteboard or somewhere visible. Check them off daily. The satisfaction of consistent completion builds the identity of someone who follows through — and that identity is more powerful than any single goal.',
      practicalTask: {
        title: 'Goal Hierarchy Design',
        instructions: 'Choose one meaningful outcome goal. Break it into 2–3 performance milestones and 3–5 daily/weekly process goals. Write all three levels on a single page and put it somewhere visible.',
        reflectionQuestions: [
          'Are your process goals entirely within your control?',
          'How will you track your process goals daily?',
          'What will you do when motivation is low but the process goal is still there?',
        ],
      },
    },
    {
      number: 6,
      title: 'Sleep & Recovery Science',
      learningOutcome: 'Understand the science of sleep, its role in mental and physical recovery, and evidence-based strategies for improving sleep quality.',
      assessmentCriteria: [
        'Describe the stages of sleep and their functions',
        'Explain why sleep deprivation impairs cognitive function and emotional regulation',
        'Identify evidence-based sleep hygiene practices',
      ],
      content: [
        {
          heading: 'Why Sleep Is Non-Negotiable',
          paragraphs: [
            'Sleep is the single most powerful recovery tool available to you — and it is free. During sleep, your body repairs tissue, consolidates memories, processes emotions, regulates hormones, and clears metabolic waste from the brain. No supplement, recovery technique, or training protocol can compensate for consistently poor sleep.',
            'Despite this, sleep is the first thing most people sacrifice when life gets busy. This is backwards. Cutting sleep to "get more done" reduces cognitive function, emotional regulation, physical performance, and immune function — making everything you do during your waking hours less effective.',
          ],
          imageUrl: ch6SleepRecovery,
          imageAlt: 'Sleep cycle diagram showing light sleep, deep sleep, REM sleep, and repeated overnight cycles',
        },
        {
          heading: 'Sleep Architecture',
          bullets: [
            'Light sleep (N1/N2) — Transition stages. Heart rate slows, body temperature drops. You spend approximately 50% of the night here',
            'Deep sleep (N3) — Critical for physical recovery. Growth hormone is released, tissues are repaired, and the immune system is strengthened. Predominates in the first half of the night',
            'REM sleep — Essential for emotional processing, creativity, and memory consolidation. Predominates in the second half of the night. Dreaming occurs here',
            'A complete cycle takes approximately 90 minutes. You cycle through 4–6 times per night',
          ],
        },
        {
          heading: 'Evidence-Based Sleep Hygiene',
          paragraphs: [
            'Sleep hygiene refers to behaviours and environmental factors that promote consistent, high-quality sleep. These are not complex — they are simple practices that most people know but fail to implement consistently.',
          ],
          bullets: [
            'Consistency — Go to bed and wake up at the same time every day, including weekends. This anchors your circadian rhythm',
            'Temperature — Your bedroom should be cool (16–18°C). Core body temperature must drop for sleep onset',
            'Light — Reduce bright and blue light exposure in the 1–2 hours before bed. Darkness triggers melatonin release',
            'Caffeine — Avoid caffeine after 2pm (earlier if you are a slow metaboliser). Caffeine has a half-life of 5–6 hours',
            'Alcohol — While it may help you fall asleep, alcohol significantly disrupts sleep architecture, reducing REM and deep sleep',
            'Screens — The content is often more disruptive than the light. Scrolling social media or watching stimulating content activates the sympathetic nervous system',
          ],
        },
      ],
      unbreakableInsight: 'You cannot out-train, out-supplement, or out-hustle poor sleep. Every system in your body — physical, mental, and emotional — degrades when you are sleep-deprived. Prioritising sleep is not lazy; it is strategic.',
      coachNote: 'If you could only change one thing about your lifestyle to improve performance, recovery, and mental health — improve your sleep. It sounds boring. It works better than anything else.',
      practicalTask: {
        title: 'Sleep Quality Assessment',
        instructions: 'Track your sleep for seven consecutive nights: time you went to bed, estimated time to fall asleep, any wake-ups, final wake time, and a subjective quality rating (1–10). Also note caffeine, alcohol, and screen time before bed.',
        reflectionQuestions: [
          'Is your sleep schedule consistent or highly variable?',
          'Do you notice patterns between pre-bed behaviour and sleep quality?',
          'What is the single most impactful change you could make to improve your sleep?',
        ],
      },
    },
    {
      number: 7,
      title: 'Self-Compassion & Inner Dialogue',
      learningOutcome: 'Understand the science of self-compassion, recognise the impact of inner dialogue on performance, and develop strategies to replace destructive self-talk with constructive internal coaching.',
      assessmentCriteria: [
        'Define self-compassion and distinguish it from self-pity or complacency',
        'Explain how negative self-talk activates the stress response and impairs performance',
        'Identify practical techniques for restructuring inner dialogue',
      ],
      content: [
        {
          heading: 'Self-Compassion Is Not Weakness',
          paragraphs: [
            'Self-compassion is often misunderstood as letting yourself off the hook. In reality, research by Dr Kristin Neff and others consistently shows that self-compassionate people are more motivated, more resilient, and more likely to take responsibility for mistakes — not less. Self-compassion means treating yourself with the same fairness and perspective you would offer a friend going through the same situation.',
            'The opposite of self-compassion is not discipline — it is self-destruction. Constant harsh self-criticism activates the threat system, flooding your body with cortisol and suppressing the very cognitive functions you need to learn and improve. You cannot bully yourself into lasting change.',
          ],
        },
        {
          heading: 'The Three Components of Self-Compassion',
          bullets: [
            'Self-kindness — Responding to failure or difficulty with understanding rather than brutal judgement. This does not mean ignoring mistakes; it means addressing them without character assassination',
            'Common humanity — Recognising that struggle, failure, and imperfection are universal human experiences, not personal defects. Everyone has bad sessions, bad days, and setbacks',
            'Mindful awareness — Acknowledging painful thoughts and feelings without suppressing them or being consumed by them. You observe: "I am frustrated" rather than spiralling into "I am useless"',
          ],
        },
        {
          heading: 'Restructuring Your Inner Dialogue',
          paragraphs: [
            'Your inner voice shapes your emotional state, your motivation, and your physiological stress response. If your default inner dialogue sounds like a hostile critic — "you always fail", "you are not good enough", "why bother" — you are triggering your own fight-or-flight system multiple times per day without any external threat.',
          ],
          bullets: [
            'Notice without judgement — Start by simply noticing what your inner voice says during stress. Write it down verbatim. Most people are shocked by how harsh it is',
            'Challenge the thought — Ask: "Would I say this to a friend?" If not, why is it acceptable to say it to yourself?',
            'Reframe constructively — Replace "I am terrible at this" with "I am struggling with this right now, and that is where the growth happens"',
            'Use your name — Research shows referring to yourself in the third person ("John, you have got this") reduces emotional reactivity and improves performance under pressure',
          ],
        },
      ],
      unbreakableInsight: 'The way you speak to yourself matters more than any motivational quote. Your inner dialogue is the voice you hear most often — make it one worth listening to.',
      coachNote: 'Pay attention to how you talk to yourself after a bad session or a missed goal. If it sounds like abuse, it is holding you back — not pushing you forward. Discipline and kindness are not opposites.',
      practicalTask: {
        title: 'Inner Dialogue Audit',
        instructions: 'For three days, carry a small notebook or use your phone to record every negative thing you say to yourself — however small. At the end of each day, rewrite each statement as something a supportive coach would say instead.',
        reflectionQuestions: [
          'How often do you engage in harsh self-criticism versus constructive self-coaching?',
          'Do you notice any patterns in when negative self-talk is most intense?',
          'How did it feel to rewrite your inner dialogue in a more compassionate tone?',
        ],
      },
    },
    {
      number: 8,
      title: 'Social Support & Connection',
      learningOutcome: 'Understand the role of social connection in mental resilience, the health consequences of isolation, and practical strategies for building and maintaining a supportive network.',
      assessmentCriteria: [
        'Explain why social connection is a biological need, not a luxury',
        'Describe the health impacts of loneliness and social isolation',
        'Identify strategies for strengthening your social support network',
      ],
      content: [
        {
          heading: 'Connection Is a Biological Need',
          paragraphs: [
            'Humans evolved as social creatures. Your nervous system is wired for connection — from the vagus nerve that responds to social cues, to the oxytocin system that rewards bonding, to the mirror neurons that help you understand others. Social connection is not a nice-to-have; it is a fundamental requirement for mental and physical health.',
            'Research consistently shows that strong social connections are among the most powerful predictors of longevity, happiness, and resilience. The Harvard Study of Adult Development, running since 1938, found that the quality of relationships is the single strongest predictor of health and wellbeing — more than wealth, fame, IQ, or genetics.',
          ],
        },
        {
          heading: 'The Cost of Isolation',
          bullets: [
            'Loneliness increases cortisol, systemic inflammation, and cardiovascular risk — comparable to smoking 15 cigarettes per day',
            'Social isolation impairs immune function, sleep quality, and cognitive performance',
            'Perceived loneliness (feeling disconnected even when around people) is as harmful as actual isolation',
            'Modern life creates the illusion of connection through social media while often deepening real disconnection',
          ],
        },
        {
          heading: 'Building Your Support Network',
          paragraphs: [
            'You do not need dozens of friends. Research suggests that having even two or three genuine, reciprocal relationships provides most of the resilience benefits of social connection. Quality matters far more than quantity.',
          ],
          bullets: [
            'Identify your existing connections — Who do you trust? Who would you call at 2am? Who challenges you to be better?',
            'Invest in reciprocity — Relationships require maintenance. Reach out first. Ask how people are doing. Be genuinely curious',
            'Find your tribe — Shared activities (gym, sport, hobbies) create natural bonding opportunities without the pressure of "making friends"',
            'Set boundaries — Not all relationships support resilience. Some drain it. Protect your energy by limiting time with consistently negative or toxic people',
            'Be vulnerable — Authentic connection requires showing up honestly. Pretending everything is fine prevents people from actually supporting you',
          ],
        },
      ],
      unbreakableInsight: 'You are not meant to do this alone. The strongest people in the world have support systems — they just do not always talk about them. Asking for help is not weakness; refusing to is stubbornness disguised as strength.',
      coachNote: 'If you are training alone, eating alone, and processing stress alone — you are playing on hard mode unnecessarily. Find one person this week to train with, talk to, or just check in on. Connection compounds.',
      practicalTask: {
        title: 'Social Connection Audit',
        instructions: 'Map your current social support network. List the people you interact with regularly and categorise them: emotional support (they listen), practical support (they help), challenge support (they push you). Identify gaps and one action you can take this week to strengthen a connection.',
        reflectionQuestions: [
          'Do you have at least one person you can be fully honest with about how you are doing?',
          'Are your closest relationships reciprocal, or predominantly one-directional?',
          'What barriers prevent you from deepening your social connections?',
        ],
      },
    },
  ],
};
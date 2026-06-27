import { getUniversityImage } from '@/lib/university/imageMap';
import type { Unit } from '../types';

export const level2Unit4: Unit = {
  number: 4,
  title: 'Building Your Foundation',
  description: 'Goal setting, programme structure, training frequency, progress tracking, and lifestyle factors. This unit ties everything together and prepares you to design and manage your own training.',
  chapters: [
    // ──────────── CHAPTER 1 ────────────
    {
      number: 1,
      title: 'Setting SMART Goals',
      learningOutcome: 'Understand and apply the SMART framework to set effective short-term, medium-term, and long-term fitness goals.',
      assessmentCriteria: [
        'Define each component of the SMART framework in a fitness context.',
        'Differentiate between outcome goals and process goals.',
        'Create a SMART goal for a given training scenario.',
        'Explain the importance of regular goal review and adjustment.',
      ],
      content: [
        {
          heading: 'Why Goal Setting Matters',
          paragraphs: [
            'Training without clear goals is like driving without a destination. You may be moving, but you have no way of knowing whether you are heading in the right direction. Goal setting provides purpose, motivation, and a measurable framework for evaluating progress.',
            'Research consistently shows that individuals who set specific, written goals are significantly more likely to achieve them than those who train with vague intentions such as "get fitter" or "lose weight."',
          ],
        },
        {
          heading: 'The SMART Framework',
          paragraphs: [
            'SMART is a widely used framework in fitness, sport, and professional development. Each letter represents a criterion that a well-formed goal should meet:',
          ],
          bullets: [
            'Specific — The goal must be clear and precise. "Improve my squat" is vague; "Increase my back squat from 80 kg to 100 kg" is specific.',
            'Measurable — There must be a quantifiable way to track progress. Numbers, times, distances, or body measurements all provide measurable data.',
            'Achievable — The goal should be challenging but realistic given the individual\'s current fitness level, experience, and available resources.',
            'Relevant — The goal must align with the individual\'s broader training objectives. A marathon runner setting a goal to bench press 150 kg may not be relevant to their primary aim.',
            'Time-bound — Every goal needs a deadline. "Achieve within 12 weeks" creates urgency and allows for structured planning.',
          ],
          imageUrl: getUniversityImage('u4-ch1-goal-types'),
          imageAlt: 'SMART goals framework diagram showing the five components: Specific, Measurable, Achievable, Relevant, and Time-bound',
        },
        {
          heading: 'Outcome Goals vs Process Goals',
          paragraphs: [
            'An outcome goal describes the end result you want to achieve — for example, "Run a 5K in under 25 minutes." A process goal describes the daily or weekly actions required to reach that outcome — for example, "Complete three structured running sessions per week."',
            'Both types of goal are essential. Outcome goals provide direction and motivation, while process goals provide the actionable steps that make the outcome possible. Over-focusing on outcomes alone can lead to frustration, particularly when progress is slow or non-linear.',
          ],
        },
        {
          heading: 'Short-Term, Medium-Term, and Long-Term Goals',
          paragraphs: [
            'Effective goal setting operates across multiple time horizons:',
          ],
          bullets: [
            'Short-term goals (1–4 weeks) — Immediate targets such as "attend four gym sessions this week" or "add 2.5 kg to my deadlift."',
            'Medium-term goals (1–3 months) — Milestones that build towards the long-term vision, such as "complete an 8-week strength programme" or "reduce body fat by 2%."',
            'Long-term goals (6–12 months+) — The bigger picture: "compete in a powerlifting meet," "run a half marathon," or "achieve a consistent body composition I am happy with."',
          ],
        },
        {
          heading: 'Reviewing and Adjusting Goals',
          paragraphs: [
            'Goals should not be rigid. Regular review — ideally every 2–4 weeks — allows you to assess whether your current approach is working and make evidence-based adjustments.',
            'If a goal is being met too easily, it may need to be made more challenging. If progress has stalled, the goal itself may need adjusting, or the training programme may need modification. The key principle is that goals should always be driving behaviour, not creating unnecessary frustration.',
          ],
        },
      ],
      unbreakableInsight: 'The best goal is one that excites you enough to start and is structured enough to keep you going. Write it down, review it often, and let your process goals do the heavy lifting.',
      coachNote: 'I see too many people skip goal setting because they think it\'s unnecessary. The ones who write clear goals and review them regularly are always — without exception — the ones who make the most progress. Don\'t skip this step.',
      practicalTask: {
        title: 'Create Your SMART Goal Hierarchy',
        instructions: 'Write one long-term fitness goal (6–12 months). Break it down into two medium-term goals (1–3 months each) and four short-term process goals (weekly actions). Ensure each goal meets all five SMART criteria.',
        reflectionQuestions: [
          'Does your long-term goal genuinely motivate you, or is it based on what you think you "should" want?',
          'Are your process goals specific enough that you could tick them off a checklist each week?',
          'How will you review and adjust these goals over time?',
        ],
      },
    },

    // ──────────── CHAPTER 2 ────────────
    {
      number: 2,
      title: 'Understanding Training Frequency',
      learningOutcome: 'Understand how training frequency affects adaptation and be able to select an appropriate training split for different goals and experience levels.',
      assessmentCriteria: [
        'Define training frequency and explain its relationship to recovery and adaptation.',
        'Compare and contrast full-body, upper/lower, and push/pull/legs training splits.',
        'Recommend an appropriate training split for a beginner, intermediate, and advanced trainee.',
        'Explain the concept of weekly training volume and how it is distributed across sessions.',
      ],
      content: [
        {
          heading: 'What Is Training Frequency?',
          paragraphs: [
            'Training frequency refers to how often a muscle group or movement pattern is trained within a given period, typically a week. It is one of the most important variables in programme design because it directly influences recovery, adaptation, and long-term progress.',
            'The optimal frequency depends on several factors: the individual\'s training experience, their recovery capacity, the intensity and volume of each session, and their overall lifestyle (sleep, nutrition, stress).',
          ],
        },
        {
          heading: 'Common Training Splits',
          paragraphs: [
            'A training split is the way you organise your exercises across the week. The three most common splits are:',
          ],
          bullets: [
            'Full-Body (2–4 sessions per week) — Every session trains all major muscle groups. Ideal for beginners and those with limited training days. Each muscle is stimulated frequently, promoting motor learning and consistent adaptation.',
            'Upper/Lower Split (4 sessions per week) — Two upper-body days and two lower-body days. Provides a good balance of frequency and volume. Suited to intermediate trainees who can handle more per-session work.',
            'Push/Pull/Legs (PPL) (5–6 sessions per week) — Push day (chest, shoulders, triceps), Pull day (back, biceps), Legs day. Allows high volume per muscle group with adequate recovery between sessions. Best suited to advanced trainees.',
          ],
          imageUrl: getUniversityImage('u4-ch2-volume-distribution'),
          imageAlt: 'Training split comparison showing full-body, upper/lower, and push/pull/legs weekly layouts',
        },
        {
          heading: 'Weekly Volume Distribution',
          paragraphs: [
            'Research suggests that for most individuals, training each muscle group at least twice per week produces superior results compared to once per week, provided total weekly volume is matched.',
            'Weekly volume refers to the total number of challenging sets performed for a given muscle group across the entire week. For most people, 10–20 sets per muscle group per week is a reasonable range, with beginners at the lower end and advanced trainees at the higher end.',
          ],
        },
        {
          heading: 'Recovery Between Sessions',
          paragraphs: [
            'When the same muscle group is trained across multiple sessions, adequate recovery time is essential. As a general guideline, allow at least 48 hours between sessions targeting the same muscles.',
            'Recovery is not just about muscle soreness — it also involves neural recovery, connective tissue repair, and hormonal balance. Training a muscle group that has not recovered will impair performance and increase injury risk.',
          ],
        },
        {
          heading: 'Matching Frequency to Experience Level',
          paragraphs: [
            'Beginners benefit from higher-frequency, lower-volume sessions (e.g., 3× full body). The primary stimulus for a beginner is motor learning — practising movements often. Intermediate trainees can increase per-session volume and reduce frequency slightly (e.g., 4× upper/lower). Advanced trainees typically require higher volume per muscle group and may use splits like PPL to manage the workload across the week.',
          ],
        },
      ],
      unbreakableInsight: 'The best training split is the one you can follow consistently. A perfect PPL programme means nothing if your schedule only allows three sessions a week. Match your split to your life, not the other way around.',
      coachNote: 'Beginners almost always overcomplicate their split. If you\'re training fewer than four days per week, full-body is nearly always the best option. Save the fancy splits for when you\'ve built a solid foundation.',
      practicalTask: {
        title: 'Design Your Weekly Training Split',
        instructions: 'Based on the number of days you can realistically train each week, select an appropriate training split. Map out which muscle groups or movement patterns you will train on each day, and ensure each major muscle group is trained at least twice per week.',
        reflectionQuestions: [
          'How many days per week can you realistically commit to training, accounting for work, family, and social commitments?',
          'Does your chosen split allow at least 48 hours of recovery between sessions targeting the same muscle group?',
          'If your schedule changed, how would you adapt your split?',
        ],
      },
    },

    // ──────────── CHAPTER 3 ────────────
    {
      number: 3,
      title: 'Programme Structure & Periodisation',
      learningOutcome: 'Understand the principles of periodisation and be able to structure a training programme across multiple training phases.',
      assessmentCriteria: [
        'Define periodisation and explain why it is used in programme design.',
        'Describe the structure of microcycles, mesocycles, and macrocycles.',
        'Compare linear periodisation with undulating periodisation.',
        'Explain the purpose and timing of deload weeks.',
      ],
      content: [
        {
          heading: 'What Is Periodisation?',
          paragraphs: [
            'Periodisation is the systematic planning of training over time. Rather than performing the same workout repeatedly, periodisation structures training into phases that progressively manipulate variables such as volume, intensity, and exercise selection to drive ongoing adaptation.',
            'Without periodisation, the body adapts to a fixed stimulus and progress stalls — a phenomenon known as the training plateau. Periodisation provides planned variation to prevent this.',
          ],
        },
        {
          heading: 'Training Cycles',
          paragraphs: [
            'Periodised programmes are organised into three levels of planning:',
          ],
          bullets: [
            'Microcycle — The smallest training unit, typically one week. It defines the day-by-day structure of training sessions.',
            'Mesocycle — A block of 4–6 microcycles (usually 4–6 weeks) focused on a specific training goal, such as hypertrophy, strength, or power.',
            'Macrocycle — The overall training plan, typically spanning several months to a year. It encompasses multiple mesocycles and represents the journey from starting point to long-term goal.',
          ],
          imageUrl: getUniversityImage('u4-ch3-periodisation-types'),
          imageAlt: 'Periodisation timeline showing microcycle, mesocycle, and macrocycle with volume and intensity progression',
        },
        {
          heading: 'Linear Periodisation',
          paragraphs: [
            'Linear periodisation follows a straightforward progression: as the programme advances, intensity increases while volume decreases. A typical linear model might look like this:',
          ],
          bullets: [
            'Weeks 1–4: Hypertrophy phase — 3–4 sets of 10–12 reps at moderate intensity (65–75% 1RM).',
            'Weeks 5–8: Strength phase — 4–5 sets of 4–6 reps at higher intensity (80–85% 1RM).',
            'Weeks 9–12: Power/peaking phase — 3–5 sets of 1–3 reps at near-maximal intensity (90–100% 1RM).',
          ],
        },
        {
          paragraphs: [
            'Linear periodisation is simple, effective, and well-suited to beginners and intermediate trainees. Its main limitation is that qualities developed in earlier phases may diminish as focus shifts to later phases.',
          ],
        },
        {
          heading: 'Undulating Periodisation',
          paragraphs: [
            'Undulating periodisation (also called non-linear periodisation) varies training variables within each week or even each session. For example, Monday might focus on strength (5×5), Wednesday on hypertrophy (3×10), and Friday on power (4×3).',
            'This approach maintains multiple fitness qualities simultaneously and is often preferred by intermediate and advanced trainees. Research suggests that undulating periodisation may produce slightly superior strength gains compared to linear models in trained individuals.',
          ],
        },
        {
          heading: 'Deload Weeks',
          paragraphs: [
            'A deload is a planned period of reduced training stress, typically lasting one week. During a deload, volume and/or intensity are reduced by 40–60% to allow the body to recover, repair, and adapt.',
            'Deloads are typically programmed every 4–6 weeks, or whenever accumulated fatigue begins to impair performance. They are not "time off" — they are an active recovery strategy that enables the next training block to be more productive.',
          ],
        },
      ],
      unbreakableInsight: 'Periodisation is not just for athletes. Anyone who trains consistently needs a plan that evolves over time. The body adapts to what you repeatedly do — your programme must adapt too.',
      coachNote: 'If you\'ve been doing the same workout for months and wondering why you\'re not progressing, this chapter is the answer. Plan your training in blocks, build in deloads, and watch what happens.',
      practicalTask: {
        title: 'Map a 12-Week Periodised Plan',
        instructions: 'Design a 12-week macrocycle using either linear or undulating periodisation. Define three mesocycles (4 weeks each) with a clear focus for each phase. Include a deload week at the end of each mesocycle. Specify the rep range, set count, and approximate intensity for each phase.',
        reflectionQuestions: [
          'Which periodisation model did you choose and why?',
          'How does each mesocycle build upon the previous one?',
          'What signs would tell you that a deload is needed sooner than planned?',
        ],
      },
    },

    // ──────────── CHAPTER 4 ────────────
    {
      number: 4,
      title: 'Exercise Order & Session Design',
      learningOutcome: 'Understand the principles of exercise order within a training session and be able to design a well-structured workout from warm-up to cool-down.',
      assessmentCriteria: [
        'Explain the rationale for the compound-first principle in session design.',
        'Describe the role of warm-up sets and how they differ from working sets.',
        'Organise a sequence of exercises into an optimal training order.',
        'Design a complete training session including warm-up, main work, and cool-down.',
      ],
      content: [
        {
          heading: 'The Compound-First Principle',
          paragraphs: [
            'The most universally accepted principle of exercise order is: perform compound movements before isolation exercises. Compound exercises recruit multiple muscle groups and joints, require more coordination, and are typically performed with heavier loads. Performing them while you are freshest ensures the highest quality of movement and the greatest training stimulus.',
            'For example, in an upper-body session, bench press (compound) should precede tricep pushdowns (isolation). In a lower-body session, squats should precede leg extensions.',
          ],
        },
        {
          heading: 'Warm-Up Sets',
          paragraphs: [
            'Before performing working sets (the sets that contribute to your training stimulus), warm-up sets are essential. Warm-up sets serve several purposes:',
          ],
          bullets: [
            'Increase blood flow to the working muscles.',
            'Rehearse the movement pattern at progressively heavier loads.',
            'Activate the nervous system for maximal force production.',
            'Identify any pain or discomfort before loading heavily.',
          ],
        },
        {
          paragraphs: [
            'A typical warm-up protocol for a heavy compound lift might include: empty bar × 10, 40% × 8, 60% × 5, 80% × 3, then working sets at the prescribed load.',
          ],
        },
        {
          heading: 'Optimal Exercise Sequence',
          paragraphs: [
            'Within a training session, exercises should generally follow this order:',
          ],
          bullets: [
            '1. General warm-up (5–10 minutes of low-intensity cardio and dynamic stretching).',
            '2. Activation drills (targeting muscles that tend to be underactive, e.g., glute bridges before squats).',
            '3. Primary compound movement (heaviest lift of the day, e.g., squat, deadlift, bench press).',
            '4. Secondary compound movement (supporting compound, e.g., Romanian deadlift after squats).',
            '5. Isolation exercises (targeting specific muscles, e.g., leg curls, lateral raises).',
            '6. Core work (anti-extension, anti-rotation, and bracing exercises).',
            '7. Cool-down (light cardio, static stretching, and/or foam rolling).',
          ],
          imageUrl: getUniversityImage('u4-ch4-warmup-sets'),
          imageAlt: 'Session structure flow diagram showing optimal exercise order from warm-up through compound movements to cool-down',
        },
        {
          heading: 'Session Duration and Time Management',
          paragraphs: [
            'Most effective training sessions last between 45 and 75 minutes, excluding warm-up and cool-down. Sessions that consistently exceed 90 minutes may indicate excessive volume, insufficient intensity, or too much rest between sets.',
            'Time management is a practical skill. Using structured rest periods (timed, not estimated), limiting phone use, and having a written plan before arriving at the gym all contribute to more productive sessions.',
          ],
        },
      ],
      unbreakableInsight: 'A well-ordered session is not about doing more — it is about doing the right things in the right sequence. The order of your exercises can be the difference between a great session and a wasted one.',
      coachNote: 'The biggest time-waster I see in the gym is people wandering between exercises with no plan. Write your session out before you arrive. Know exactly what you\'re doing, in what order, and how long you\'re resting.',
      practicalTask: {
        title: 'Design a Complete Training Session',
        instructions: 'Choose either an upper-body or lower-body session. Write out a complete session plan including: a 10-minute warm-up protocol, warm-up sets for your primary lift, 4–6 exercises in optimal order, prescribed sets/reps/rest for each, and a cool-down routine.',
        reflectionQuestions: [
          'Why did you place your exercises in this specific order?',
          'How many warm-up sets did you include for your primary lift, and what percentages did you use?',
          'How would your session change if you only had 45 minutes instead of 60?',
        ],
      },
    },

    // ──────────── CHAPTER 5 ────────────
    {
      number: 5,
      title: 'Tracking & Measuring Progress',
      learningOutcome: 'Understand the importance of tracking training data and body composition metrics, and be able to use multiple methods to evaluate progress objectively.',
      assessmentCriteria: [
        'Explain why subjective assessment alone is insufficient for tracking progress.',
        'Describe at least four methods of tracking fitness progress.',
        'Interpret basic training log data to identify trends.',
        'Determine when a programme change is warranted based on progress data.',
      ],
      content: [
        {
          heading: 'Why Track Progress?',
          paragraphs: [
            'Without objective data, it is impossible to know whether your training is working. Subjective feelings ("I feel stronger" or "I think I look different") are unreliable and heavily influenced by mood, sleep, stress, and daily fluctuations.',
            'Tracking provides the evidence needed to make informed decisions about your programme. It removes guesswork and replaces it with data-driven adjustments.',
          ],
        },
        {
          heading: 'Methods of Tracking',
          paragraphs: [
            'There are multiple tools available for tracking fitness progress. Using a combination of methods provides the most complete picture:',
          ],
          bullets: [
            'Training logs — Recording exercises, sets, reps, and weights for every session. This is the single most important tracking tool. Over time, it reveals whether you are progressively overloading.',
            'Body measurements — Circumference measurements of chest, waist, hips, arms, and thighs. Taken under consistent conditions (same time of day, same state of hydration).',
            'Progress photographs — Taken at regular intervals (every 2–4 weeks) under consistent lighting and angles. Photos capture changes that scales and tape measures cannot.',
            'Body weight — Useful but must be interpreted carefully. Daily fluctuations of 1–2 kg are normal due to hydration, food intake, and hormonal changes. Weekly averages are more meaningful than daily numbers.',
            'Performance tests — Periodic tests such as 1RM estimates, timed runs, or max reps at a given weight. These provide direct measures of fitness improvement.',
            'Subjective wellbeing — Rating energy, mood, sleep quality, and motivation on a simple 1–10 scale. Patterns in subjective data can reveal overtraining or lifestyle issues.',
          ],
          imageUrl: getUniversityImage('u4-ch5-data-trends'),
          imageAlt: 'Progress tracking methods diagram showing six key measurement approaches radiating from a central hub',
        },
        {
          heading: 'Interpreting Your Data',
          paragraphs: [
            'Raw data is only useful if you can interpret it. Look for trends over weeks, not individual sessions. A single bad workout does not indicate a problem. A consistent downward trend over 3–4 weeks likely does.',
            'Key questions to ask when reviewing your data: Am I lifting more weight or doing more reps over time? Are my body measurements moving in the desired direction? Do I feel recovered and energised, or consistently fatigued?',
          ],
        },
        {
          heading: 'When to Change Your Programme',
          paragraphs: [
            'A programme change is warranted when: progress has genuinely stalled for 2–3 consecutive weeks despite adequate recovery and nutrition; you have completed the planned mesocycle or macrocycle; or your goals have changed.',
            'Programme changes should be deliberate and evidence-based — not driven by boredom or the desire for novelty. Consistency with a well-designed programme will always outperform programme-hopping.',
          ],
        },
      ],
      unbreakableInsight: 'What gets measured gets managed. The simple act of writing down your numbers forces you to confront reality — and reality is where progress happens.',
      coachNote: 'The people who make the most progress are rarely the most talented or the most motivated. They\'re the ones who track their sessions consistently. It takes two minutes per session. There\'s no excuse not to do it.',
      practicalTask: {
        title: 'Build Your Tracking System',
        instructions: 'Set up a training log (digital or paper) and track three consecutive sessions in detail. Include: exercise name, sets, reps, weight, RPE, and any notes. Additionally, take baseline body measurements and a progress photo. Review your data after the three sessions and note any observations.',
        reflectionQuestions: [
          'What patterns or trends did you notice across your three logged sessions?',
          'Were there any exercises where your performance was better or worse than expected?',
          'How did the act of logging change your awareness during your sessions?',
        ],
      },
    },

    // ──────────── CHAPTER 6 ────────────
    {
      number: 6,
      title: 'Sleep & Stress Management',
      learningOutcome: 'Understand the critical role of sleep and stress management in training adaptation, and be able to implement practical strategies to optimise both.',
      assessmentCriteria: [
        'Explain the role of sleep in muscle recovery and hormonal regulation.',
        'Describe the stages of sleep and their relevance to physical adaptation.',
        'Identify at least four evidence-based sleep hygiene practices.',
        'Explain how chronic stress impairs training progress and describe strategies to manage it.',
      ],
      content: [
        {
          heading: 'Sleep and Physical Adaptation',
          paragraphs: [
            'Sleep is not a luxury — it is a biological necessity for anyone who trains. During sleep, the body performs critical repair processes: muscle protein synthesis is elevated, growth hormone is released in large pulses (primarily during deep sleep), and the nervous system recovers from the demands of training.',
            'Research consistently shows that insufficient sleep (fewer than 7 hours per night) impairs strength, reduces endurance, slows reaction time, increases perceived exertion, and elevates injury risk. It also disrupts appetite-regulating hormones, leading to increased cravings and poor food choices.',
          ],
        },
        {
          heading: 'Stages of Sleep',
          paragraphs: [
            'Sleep occurs in cycles of approximately 90 minutes, each containing distinct stages:',
          ],
          bullets: [
            'Stage 1 (Light sleep) — The transition from wakefulness to sleep. Easily disrupted.',
            'Stage 2 (Light sleep) — Heart rate and body temperature decrease. Memory consolidation begins.',
            'Stage 3 (Deep sleep / slow-wave sleep) — The most physically restorative stage. Growth hormone is released, muscle repair occurs, and the immune system is strengthened.',
            'REM sleep (Rapid Eye Movement) — The brain is highly active. Essential for cognitive function, emotional regulation, and motor learning.',
          ],
          imageUrl: getUniversityImage('u4-ch6-stress-recovery'),
          imageAlt: 'Sleep and recovery cycle diagram showing the relationship between training stimulus, cortisol response, sleep stages, and adaptation',
        },
        {
          heading: 'Sleep Hygiene Practices',
          paragraphs: [
            'Sleep hygiene refers to behaviours and environmental conditions that promote consistent, high-quality sleep:',
          ],
          bullets: [
            'Maintain a consistent sleep and wake schedule — even on weekends.',
            'Keep the bedroom cool (16–19°C), dark, and quiet.',
            'Avoid screens (phones, tablets, TVs) for at least 30–60 minutes before bed.',
            'Limit caffeine intake after midday.',
            'Avoid large meals within 2–3 hours of bedtime.',
            'Establish a pre-sleep routine (reading, stretching, breathing exercises).',
            'Limit alcohol — while it may help you fall asleep, it significantly disrupts deep sleep and REM sleep.',
          ],
        },
        {
          heading: 'Stress and Training',
          paragraphs: [
            'The body does not distinguish between physical stress (training) and psychological stress (work pressure, financial worries, relationship difficulties). Both activate the same hormonal stress response, primarily through cortisol.',
            'Chronically elevated cortisol impairs recovery, promotes muscle breakdown, disrupts sleep, and increases fat storage — particularly around the abdomen. Managing psychological stress is therefore as important for training progress as managing physical training load.',
          ],
        },
        {
          heading: 'Stress Management Strategies',
          bullets: [
            'Structured relaxation — Regular practice of deep breathing, meditation, or progressive muscle relaxation.',
            'Time management — Reducing unnecessary time pressure through planning and prioritisation.',
            'Social connection — Maintaining supportive relationships and communicating openly about stressors.',
            'Physical activity itself — Moderate exercise is one of the most effective stress reduction tools, but excessive training volume can add to the stress burden.',
            'Professional support — Recognising when stress levels are beyond self-management and seeking appropriate help.',
          ],
        },
      ],
      unbreakableInsight: 'You don\'t grow in the gym. You grow when you sleep. The most underrated performance enhancer in fitness is a consistent 8-hour sleep routine.',
      coachNote: 'Always consider your sleep before adjusting your programme. If sleep is poor, no amount of training optimisation will fix the problem. Fix the sleep first.',
      practicalTask: {
        title: 'One-Week Sleep Audit',
        instructions: 'For seven consecutive days, record: bedtime, wake time, total hours slept, sleep quality (1–10), and any factors that may have affected sleep (caffeine, screens, stress, late meals). At the end of the week, identify your three biggest sleep disruptors and create a plan to address them.',
        reflectionQuestions: [
          'What is your average sleep duration, and does it meet the recommended 7–9 hours?',
          'Were there consistent patterns in what disrupted your sleep?',
          'How did your sleep quality correlate with your training performance during the week?',
        ],
      },
    },

    // ──────────── CHAPTER 7 ────────────
    {
      number: 7,
      title: 'Lifestyle Factors & Adherence',
      learningOutcome: 'Understand the psychological and lifestyle factors that determine long-term training adherence, and be able to implement strategies for sustainable behaviour change.',
      assessmentCriteria: [
        'Explain the difference between motivation and discipline in the context of fitness.',
        'Describe the habit loop model and how it applies to exercise adherence.',
        'Identify at least three common barriers to training consistency and propose solutions.',
        'Explain the concept of habit stacking and provide a fitness-related example.',
      ],
      content: [
        {
          heading: 'Motivation vs Discipline',
          paragraphs: [
            'Motivation is the emotional desire to do something. It fluctuates daily based on mood, energy, external circumstances, and novelty. Relying solely on motivation to drive training behaviour is unreliable because motivation inevitably fades.',
            'Discipline is the ability to act consistently regardless of how you feel. It is built through repeated practice, not through willpower alone. The goal is not to always feel motivated — it is to build systems that make training the default behaviour, whether you feel like it or not.',
          ],
        },
        {
          heading: 'The Habit Loop',
          paragraphs: [
            'Every habit — good or bad — follows the same neurological loop:',
          ],
          bullets: [
            'Cue — A trigger that initiates the behaviour (e.g., your alarm goes off at 6 AM).',
            'Craving — The desire that the cue creates (e.g., the desire to feel energised and accomplished).',
            'Response — The actual behaviour (e.g., going to the gym).',
            'Reward — The positive outcome that reinforces the loop (e.g., the endorphin rush after training, the satisfaction of ticking it off your list).',
          ],
          imageUrl: getUniversityImage('u4-ch7-barriers'),
          imageAlt: 'Habit formation loop diagram showing Cue, Craving, Response, and Reward cycle with habit stacking concept',
        },
        {
          heading: 'Habit Stacking',
          paragraphs: [
            'Habit stacking is a technique where you link a new habit to an existing one. The formula is: "After I [CURRENT HABIT], I will [NEW HABIT]."',
            'Examples: "After I finish my morning coffee, I will put on my gym clothes." "After I park my car at work, I will walk for 10 minutes." "After I brush my teeth at night, I will do 5 minutes of stretching."',
            'By attaching new behaviours to established routines, you leverage existing neural pathways and reduce the friction required to start.',
          ],
        },
        {
          heading: 'Common Barriers and Solutions',
          bullets: [
            '"I don\'t have time" — Audit your weekly schedule honestly. Most people can find 3–4 hours per week if they reduce low-value activities (excessive social media, aimless TV watching). Even 30-minute sessions are effective.',
            '"I\'m too tired" — Distinguish between genuine fatigue (illness, sleep deprivation) and inertia. Most people feel better after training, not worse. Commit to just 10 minutes — you\'ll almost always continue once you start.',
            '"I get bored" — This is usually a sign that your programme lacks structure or progression. Having clear goals and a periodised plan maintains engagement.',
            '"I can\'t stay consistent" — Reduce the barrier to entry. Lay out gym clothes the night before, keep a gym bag in the car, choose a gym close to home or work.',
          ],
        },
        {
          heading: 'The Power of Consistency',
          paragraphs: [
            'Long-term results in fitness come from consistency, not intensity. Training at 80% effort for 52 weeks will always outperform training at 100% effort for 8 weeks followed by months of inactivity.',
            'Accept that some sessions will be average. Some will be poor. That is normal. The goal is never to have a perfect week — it is to have a consistent year.',
          ],
        },
      ],
      unbreakableInsight: 'You don\'t need more motivation. You need better systems. Design your environment and your routines so that training becomes the path of least resistance.',
      coachNote: 'The people who get the best results are rarely the most talented or the most motivated. They\'re the ones who show up consistently — even on days when they don\'t feel like it. Build the habit, and the results will follow.',
      practicalTask: {
        title: 'Build Your Training Habit System',
        instructions: 'Identify three habit stacks that link your training to existing daily routines. Write out your personal "barrier plan" — a list of your three most common excuses for missing training, each paired with a pre-planned solution. Commit to following this system for two weeks and journal the results.',
        reflectionQuestions: [
          'Which of your habit stacks feels the most natural and sustainable?',
          'When you missed a session (or were tempted to), what was the actual barrier?',
          'How did having a pre-planned solution change your response to the barrier?',
        ],
      },
    },

    // ──────────── CHAPTER 8 ────────────
    {
      number: 8,
      title: 'Building Your First Programme',
      learningOutcome: 'Be able to design a complete, evidence-based training programme by applying all principles covered in this unit.',
      assessmentCriteria: [
        'Select appropriate exercises for a beginner training programme based on movement patterns.',
        'Prescribe appropriate sets, reps, and rest periods for a given training goal.',
        'Structure a 4-week progressive training programme with a logical weekly layout.',
        'Incorporate warm-up, cool-down, progression strategy, and deload within the programme.',
      ],
      content: [
        {
          heading: 'Bringing It All Together',
          paragraphs: [
            'This chapter is the practical culmination of everything covered in this unit. You will use your knowledge of goal setting, training frequency, periodisation, exercise order, and recovery to design a complete 4-week training programme.',
            'A well-designed programme is not a random collection of exercises — it is a structured system where every variable has a purpose.',
          ],
        },
        {
          heading: 'Step 1: Define Your Goal',
          paragraphs: [
            'Before selecting any exercises, clarify the primary goal. Is the programme focused on general fitness, muscle building (hypertrophy), strength development, or fat loss? The goal determines the rep ranges, rest periods, and exercise selection.',
          ],
          bullets: [
            'General fitness: 3 sets of 8–12 reps, 60–90 seconds rest, mix of compound and isolation.',
            'Hypertrophy: 3–4 sets of 8–12 reps, 60–90 seconds rest, moderate intensity (65–75% 1RM).',
            'Strength: 4–5 sets of 3–6 reps, 2–3 minutes rest, higher intensity (80–90% 1RM).',
            'Fat loss: Higher rep ranges (12–15), shorter rest (30–60 seconds), circuit-style or supersets.',
          ],
        },
        {
          heading: 'Step 2: Choose Your Split',
          paragraphs: [
            'Based on your available training days and experience level, select the most appropriate split. For a beginner designing their first programme, a 3-day full-body split or a 4-day upper/lower split is recommended.',
          ],
        },
        {
          heading: 'Step 3: Select Exercises by Movement Pattern',
          paragraphs: [
            'Rather than thinking in terms of individual muscles, organise your exercises around fundamental movement patterns. This ensures balanced development and reduces the risk of overuse injuries:',
          ],
          bullets: [
            'Horizontal push (e.g., bench press, push-up).',
            'Horizontal pull (e.g., barbell row, seated cable row).',
            'Vertical push (e.g., overhead press, dumbbell shoulder press).',
            'Vertical pull (e.g., lat pulldown, pull-up).',
            'Hip hinge (e.g., deadlift, Romanian deadlift).',
            'Squat pattern (e.g., back squat, goblet squat).',
            'Single-leg work (e.g., lunges, Bulgarian split squat).',
            'Core (e.g., plank, Pallof press, dead bug).',
          ],
          imageUrl: getUniversityImage('u4-ch8-progressive-overload'),
          imageAlt: 'Sample 4-week beginner training programme template showing weekly layout and progressive overload across four weeks',
        },
        {
          heading: 'Step 4: Plan Progression',
          paragraphs: [
            'Every programme must have a built-in progression strategy. For beginners, the simplest and most effective approach is double progression:',
          ],
          bullets: [
            'Set a target rep range (e.g., 3 sets of 8–10 reps).',
            'Start at the bottom of the range with a manageable weight.',
            'When you can complete all sets at the top of the range with good form, increase the weight by the smallest available increment (typically 1.25–2.5 kg).',
            'Return to the bottom of the rep range with the new weight and build back up.',
          ],
        },
        {
          heading: 'Step 5: Include Recovery',
          paragraphs: [
            'Schedule rest days strategically. A 4-day programme might follow a Mon/Tue/Thu/Fri pattern with Wednesday and the weekend as recovery days. Include a deload in week 4 if the programme is part of a longer macrocycle.',
            'Ensure each session includes a proper warm-up (5–10 minutes) and cool-down (5 minutes of stretching or foam rolling).',
          ],
        },
      ],
      unbreakableInsight: 'The best programme is one that is designed with intention, followed with consistency, and adjusted with evidence. You now have every tool you need to build it.',
      coachNote: 'Don\'t overthink your first programme. Keep it simple: 4–6 exercises per session, compound-first, clear progression plan, and train consistently for 4 weeks before changing anything. Simplicity executed well beats complexity every time.',
      practicalTask: {
        title: 'Design Your 4-Week Starter Programme',
        instructions: 'Using everything you have learned in this unit, design a complete 4-week training programme. Include: your SMART goal, chosen training split, exercises for each session (organised by movement pattern), sets/reps/rest for each exercise, warm-up and cool-down protocols, and a progression strategy. Write it out in full — this is your capstone submission for Unit 4.',
        reflectionQuestions: [
          'Does your programme address all major movement patterns at least twice per week?',
          'Is your progression strategy clear and realistic for your current level?',
          'If you showed this programme to a coach, would they understand exactly what to do on each day?',
        ],
      },
    },
  ],
};

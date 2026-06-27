import { getUniversityImage } from '@/lib/university/imageMap';
import type { Unit } from '../types';

export const level2Unit3: Unit = {
  number: 3,
  title: 'Introduction to Exercise',
  description: 'Training types, warm-up and cool-down protocols, rep ranges, recovery, exercise selection, and training considerations for different populations.',
  chapters: [
    // ─── CHAPTER 1: Types of Training ─────────────────────────────
    {
      number: 1,
      title: 'Types of Training',
      learningOutcome: 'Understand the main categories of physical training, their physiological benefits, and when each type is most appropriately applied within a fitness programme.',
      assessmentCriteria: [
        'Define resistance, cardiovascular, flexibility, and high-intensity interval training.',
        'Explain the primary physiological benefits of each training type.',
        'Identify when each training modality is most appropriate for a given goal.',
        'Describe how different training types can be combined within a balanced programme.',
      ],
      content: [
        {
          heading: 'Why Understanding Training Types Matters',
          paragraphs: [
            'Exercise is not a single activity — it is a broad category encompassing many distinct training methods, each producing specific physiological adaptations. A well-rounded fitness programme draws from multiple training types to develop strength, cardiovascular fitness, flexibility, and body composition simultaneously.',
            'Understanding what each type of training achieves — and its limitations — is the first step toward designing effective programmes for your own goals.',
          ],
        },
        {
          heading: 'Resistance Training',
          paragraphs: [
            'Resistance training involves working muscles against an external force — free weights, machines, cables, resistance bands, or bodyweight. It is the primary method for developing muscular strength, hypertrophy (muscle growth), muscular endurance, and power.',
          ],
          bullets: [
            'Increases lean muscle mass and resting metabolic rate',
            'Strengthens tendons, ligaments, and bones (reducing injury risk)',
            'Improves functional capacity for daily tasks and sport',
            'Can be modified for any fitness level through load, volume, and exercise selection',
            'Produces both neural adaptations (early strength gains) and structural adaptations (hypertrophy over time)',
          ],
        },
        {
          heading: 'Cardiovascular Training',
          paragraphs: [
            'Cardiovascular (cardio) training targets the heart, lungs, and circulatory system. It involves sustained, rhythmic activities that elevate heart rate — running, cycling, swimming, rowing, or brisk walking.',
          ],
          bullets: [
            'Improves cardiac output and stroke volume (the heart becomes a more efficient pump)',
            'Enhances oxygen delivery to working muscles via increased capillary density',
            'Reduces resting heart rate and blood pressure over time',
            'Supports fat oxidation and energy expenditure for body composition goals',
            'Reduces risk of cardiovascular disease, type 2 diabetes, and metabolic syndrome',
          ],
        },
        {
          heading: 'Flexibility Training',
          paragraphs: [
            'Flexibility training aims to maintain or improve the range of motion (ROM) around a joint. It includes static stretching, dynamic stretching, PNF techniques, and mobility work.',
          ],
          bullets: [
            'Reduces muscle stiffness and improves movement quality',
            'Decreases risk of strains and overuse injuries',
            'Supports recovery between training sessions',
            'Enhances performance in movements requiring full ROM (e.g., squats, overhead press)',
            'Particularly important for sedentary individuals or those with postural imbalances',
          ],
        },
        {
          heading: 'High-Intensity Interval Training (HIIT)',
          paragraphs: [
            'HIIT alternates short bursts of near-maximal effort with recovery periods. Sessions are typically 15–30 minutes and can use any modality — sprints, cycling, bodyweight circuits, or equipment-based exercises.',
          ],
          bullets: [
            'Produces significant cardiovascular and metabolic adaptations in less time than steady-state cardio',
            'Elevates excess post-exercise oxygen consumption (EPOC), increasing calorie burn after the session',
            'Improves both aerobic and anaerobic capacity simultaneously',
            'Time-efficient — appealing for individuals with limited training availability',
            'Higher recovery demand — not suitable for daily use without adequate programming',
          ],
        },
        {
          heading: 'Combining Training Types',
          paragraphs: [
            'No single training type delivers all adaptations. An effective programme typically includes resistance training as a foundation, cardiovascular work for heart health and energy expenditure, flexibility training for movement quality, and potentially HIIT for time-efficient conditioning.',
            'The proportion of each depends on individual goals: a powerlifter prioritises resistance training, a marathon runner prioritises cardiovascular work, and someone focused on general fitness benefits from a balanced blend of all four.',
          ],
          imageUrl: getUniversityImage('u3-ch1-training-comparison'),
          imageAlt: 'Comparison of four main training types: resistance, cardiovascular, flexibility, and HIIT',
        },
      ],
      unbreakableInsight: 'The best programme is not the one with the most volume — it is the one that strategically balances training types to match your goals, recovery capacity, and lifestyle. Variety is not randomness; it is intentional design.',
      coachNote: 'When you ask yourself "what\'s the best type of exercise?", redirect the question: "Best for what goal?" This teaches you to think in outcomes rather than trends. Most people benefit from 2–3 resistance sessions, 2 cardio sessions, and daily mobility work per week.',
      practicalTask: {
        title: 'Training Type Audit',
        instructions: 'Review your current weekly training schedule (or design an ideal one). Categorise each session by training type. Identify any gaps — are you missing flexibility work? Is cardiovascular training absent? Write a revised weekly plan that includes at least three of the four training types.',
        reflectionQuestions: [
          'Which training type do you currently prioritise, and why?',
          'Which training type do you tend to avoid or neglect?',
          'How could adding the missing type improve your overall fitness or reduce injury risk?',
        ],
      },
    },

    // ─── CHAPTER 2: Warm-Up & Cool-Down ─────────────────────────────
    {
      number: 2,
      title: 'Warm-Up & Cool-Down',
      learningOutcome: 'Understand the physiological purpose and structure of effective warm-up and cool-down protocols, including the RAMP framework.',
      assessmentCriteria: [
        'Explain the physiological effects of warming up on the body.',
        'Describe the four phases of the RAMP warm-up protocol.',
        'Differentiate between dynamic and static stretching and their appropriate placement.',
        'Design a structured warm-up and cool-down for a given training session.',
      ],
      content: [
        {
          heading: 'Why Warming Up Matters',
          paragraphs: [
            'A warm-up is not optional filler before the "real" workout — it is a structured preparation phase that primes the body for the demands ahead. Skipping or rushing a warm-up increases injury risk and reduces performance.',
          ],
          bullets: [
            'Increases core and muscle temperature, improving contractile efficiency',
            'Enhances blood flow to working muscles by dilating blood vessels',
            'Increases synovial fluid production, lubricating joints for smoother movement',
            'Activates the nervous system, improving reaction time and coordination',
            'Psychologically prepares the individual for effort and focus',
          ],
        },
        {
          heading: 'The RAMP Warm-Up Protocol',
          paragraphs: [
            'RAMP is a widely used framework in UK fitness education that structures the warm-up into four progressive phases. It was developed by Dr Ian Jeffreys and provides a systematic approach applicable to any training session or sport.',
          ],
          imageUrl: getUniversityImage('u3-ch2-stretching-types'),
          imageAlt: 'RAMP warm-up protocol showing the four phases: Raise, Activate, Mobilise, Potentiate',
        },
        {
          heading: 'R — Raise',
          paragraphs: [
            'The Raise phase elevates heart rate, blood flow, core temperature, and respiration rate. This is typically achieved through 5–10 minutes of low-to-moderate intensity cardiovascular activity.',
          ],
          bullets: [
            'Examples: brisk walking, light jogging, cycling, skipping, rowing',
            'Intensity should be sufficient to break a light sweat without causing fatigue',
            'Duration: approximately 5–10 minutes depending on the session ahead',
          ],
        },
        {
          heading: 'A — Activate',
          paragraphs: [
            'The Activate phase targets key muscle groups that will be used in the main session. Activation exercises "wake up" muscles that may be underactive due to sedentary lifestyles or poor posture.',
          ],
          bullets: [
            'Glute bridges and clamshells for lower body sessions',
            'Band pull-aparts and scapular retractions for upper body sessions',
            'Dead bugs and bird dogs for core activation',
            'Typically 2–3 exercises, 10–15 reps each',
          ],
        },
        {
          heading: 'M — Mobilise',
          paragraphs: [
            'The Mobilise phase uses dynamic stretches to take joints through their full range of motion. This improves movement quality for the exercises ahead.',
          ],
          bullets: [
            'Leg swings, hip circles, thoracic rotations, arm circles',
            'Focus on joints and muscles relevant to the planned training session',
            'Dynamic stretching is preferred over static stretching pre-exercise (static stretching can temporarily reduce force production)',
            '8–10 reps per movement, controlled tempo',
          ],
        },
        {
          heading: 'P — Potentiate',
          paragraphs: [
            'The Potentiate phase bridges into the main session with movements that mirror or progressively load the exercises ahead. This phase ensures the neuromuscular system is fully primed.',
          ],
          bullets: [
            'Bodyweight squats before barbell squats',
            'Press-ups before bench press',
            'Gradually increasing loads on the first working exercise (ramping sets)',
            'Sport-specific drills for athletic populations',
          ],
        },
        {
          heading: 'Cooling Down',
          paragraphs: [
            'The cool-down facilitates the transition from exercise back to rest. It helps gradually reduce heart rate, begin the removal of metabolic by-products, and initiate recovery processes.',
          ],
          bullets: [
            '5–10 minutes of low-intensity activity (walking, gentle cycling)',
            'Static stretching of the major muscle groups worked — holding each stretch for 15–30 seconds',
            'Breathing exercises or mindfulness to activate the parasympathetic nervous system',
            'An opportunity to reflect on the session and note performance observations',
          ],
        },
        {
          heading: 'Static vs Dynamic Stretching: Timing Matters',
          paragraphs: [
            'Research consistently shows that static stretching before training can temporarily reduce strength and power output. Dynamic stretching, by contrast, enhances readiness. The general guideline: dynamic stretching in the warm-up, static stretching in the cool-down.',
            'Exception: if you have a specific mobility limitation that restricts safe execution of an exercise, a brief static stretch of that area during the warm-up may be appropriate, followed by dynamic movement.',
          ],
        },
      ],
      unbreakableInsight: 'The warm-up is not separate from the workout — it IS the first part of the workout. Treat it with the same intention and structure as your main session. The quality of your warm-up directly predicts the quality of your performance.',
      coachNote: 'Most gym-goers either skip the warm-up entirely or spend 20 minutes on a cross-trainer without any activation or mobilisation. Use the RAMP method as a non-negotiable habit. A good warm-up takes 10–15 minutes and dramatically improves session quality.',
      practicalTask: {
        title: 'Design a RAMP Warm-Up',
        instructions: 'Choose a training session type (e.g., lower body strength, upper body hypertrophy, full-body circuit). Design a complete RAMP warm-up specific to that session, listing 2–3 exercises for each phase with sets, reps, and duration.',
        reflectionQuestions: [
          'How does the warm-up change depending on the type of session that follows?',
          'Why might a static stretch be counterproductive before a heavy squat session?',
          'What signs would indicate that you are adequately warmed up?',
        ],
      },
    },

    // ─── CHAPTER 3: Resistance Training Fundamentals ────────────────
    {
      number: 3,
      title: 'Resistance Training Fundamentals',
      learningOutcome: 'Understand the key variables of resistance training — reps, sets, tempo, and rest periods — and how they are manipulated to target different training outcomes.',
      assessmentCriteria: [
        'Define reps, sets, tempo, and rest periods in the context of resistance training.',
        'Explain the rep range continuum and its relationship to strength, hypertrophy, and endurance.',
        'Describe how tempo notation works and why it matters.',
        'Select appropriate rest periods based on training goals.',
      ],
      content: [
        {
          heading: 'The Building Blocks of Resistance Training',
          paragraphs: [
            'Every resistance training programme is built from the same fundamental variables: repetitions (reps), sets, tempo, rest periods, and load (weight). Understanding how to manipulate these variables is what separates effective programming from random exercise.',
          ],
        },
        {
          heading: 'Repetitions (Reps)',
          paragraphs: [
            'A repetition is one complete execution of an exercise — from start position through the full range of motion and back. The number of reps performed in a set is one of the primary drivers of the training adaptation.',
          ],
        },
        {
          heading: 'The Rep Range Continuum',
          paragraphs: [
            'The rep range continuum is a foundational concept that links the number of reps to the primary training outcome. While there is overlap between zones, the general guidelines are:',
          ],
          bullets: [
            'Strength: 1–5 reps at 85–100% of 1RM — heavy loads, maximal neural drive, long rest periods (3–5 minutes)',
            'Hypertrophy: 6–12 reps at 65–85% of 1RM — moderate loads, mechanical tension and metabolic stress, moderate rest (60–120 seconds)',
            'Muscular Endurance: 15–25+ reps at 40–65% of 1RM — lighter loads, sustained effort, shorter rest (30–60 seconds)',
          ],
          imageUrl: getUniversityImage('u3-ch3-tempo-notation'),
          imageAlt: 'The rep range continuum showing strength, hypertrophy, and endurance zones',
        },
        {
          paragraphs: [
            'Important: these ranges are guidelines, not rigid rules. Hypertrophy can occur across a wide rep range (6–30 reps) provided sets are taken close to muscular failure. However, the 6–12 range remains the most practical and time-efficient for most trainees.',
          ],
        },
        {
          heading: 'Sets',
          paragraphs: [
            'A set is a group of consecutive reps performed without rest. The number of sets per exercise (and per muscle group per week) is a key determinant of training volume.',
          ],
          bullets: [
            'Beginners: 2–3 sets per exercise is typically sufficient for adaptation',
            'Intermediate: 3–4 sets per exercise with progressive volume over time',
            'Advanced: 4–6 sets per exercise, often spread across multiple sessions per week',
            'Weekly set volume per muscle group: research suggests 10–20 sets per week for hypertrophy in trained individuals',
          ],
        },
        {
          heading: 'Tempo',
          paragraphs: [
            'Tempo refers to the speed at which each phase of a rep is performed. It is expressed as a four-digit notation:',
          ],
          bullets: [
            'First digit: Eccentric (lowering) phase — e.g., lowering the bar in a bench press',
            'Second digit: Pause at the bottom (stretched position)',
            'Third digit: Concentric (lifting) phase — e.g., pressing the bar up',
            'Fourth digit: Pause at the top (contracted position)',
          ],
        },
        {
          paragraphs: [
            'Example: A tempo of 3-1-1-0 means 3 seconds lowering, 1 second pause at the bottom, 1 second lifting, 0 seconds pause at the top.',
            'Slower eccentrics increase time under tension and can enhance hypertrophy and eccentric strength. Explosive concentrics develop power. Pauses eliminate momentum and increase difficulty at specific joint angles.',
          ],
        },
        {
          heading: 'Rest Periods',
          paragraphs: [
            'Rest between sets directly influences recovery, performance on subsequent sets, and the metabolic environment within the muscle.',
          ],
          bullets: [
            'Strength training (1–5 reps): 3–5 minutes — allows full ATP-PC recovery for maximal force production',
            'Hypertrophy training (6–12 reps): 60–120 seconds — balances recovery with metabolic stress accumulation',
            'Muscular endurance (15+ reps): 30–60 seconds — maintains metabolic fatigue for endurance adaptation',
            'Compound exercises generally require longer rest than isolation exercises due to greater systemic fatigue',
          ],
        },
        {
          heading: 'Load Selection',
          paragraphs: [
            'Load (weight) should be selected based on the target rep range. If the goal is 8–10 reps, the load should be challenging enough that completing 10 reps is difficult but achievable with good form. If the trainee could easily complete 15 reps, the load is too light; if they fail at 5, it is too heavy.',
            'The concept of Reps in Reserve (RIR) is increasingly used: RIR 2 means the trainee could complete 2 more reps before failure. Most hypertrophy sets should be performed at RIR 1–3.',
          ],
        },
      ],
      unbreakableInsight: 'The rep range continuum is a tool, not a law. What matters most is that you train with sufficient intensity (close to failure), appropriate volume (enough sets), and progressive overload (doing more over time). The numbers serve the principle — never the other way around.',
      coachNote: 'When you\'re new to training, it\'s common to pick loads that are far too light because you\'re unfamiliar with what "hard" should feel like. Learn the concept of RIR early: "You should finish the set thinking you could have done 1–2 more, but it would have been genuinely difficult." This builds the skill of auto-regulation.',
      practicalTask: {
        title: 'Rep Range Application',
        instructions: 'Select three exercises (e.g., squat, bench press, bicep curl). For each exercise, write a prescription for: (a) a strength-focused set, (b) a hypertrophy-focused set, and (c) an endurance-focused set. Include reps, sets, estimated load (% of max or RPE), tempo, and rest periods.',
        reflectionQuestions: [
          'How does the training experience differ between 3 reps at heavy load vs 20 reps at light load?',
          'Why might a beginner benefit from starting in the hypertrophy rep range rather than the strength range?',
          'How does tempo affect the perceived difficulty of a set even when load and reps stay the same?',
        ],
      },
    },

    // ─── CHAPTER 4: Cardiovascular Training Principles ──────────────
    {
      number: 4,
      title: 'Cardiovascular Training Principles',
      learningOutcome: 'Understand the principles governing cardiovascular training prescription, including steady-state vs interval methods, heart rate zones, the FITT principle, and perceived exertion scales.',
      assessmentCriteria: [
        'Differentiate between steady-state and interval-based cardiovascular training.',
        'Describe the five heart rate training zones and their primary adaptations.',
        'Apply the FITT principle to design a cardiovascular training session.',
        'Explain the RPE and Talk Test methods for monitoring exercise intensity.',
      ],
      content: [
        {
          heading: 'Two Approaches to Cardio',
          paragraphs: [
            'Cardiovascular training broadly falls into two categories: steady-state and interval training. Both improve cardiovascular fitness, but they do so through different mechanisms and suit different goals.',
          ],
        },
        {
          heading: 'Steady-State Training',
          paragraphs: [
            'Steady-state (continuous) training involves maintaining a consistent intensity for an extended duration — typically 20–60 minutes. Examples include jogging, cycling at a constant pace, or swimming laps.',
          ],
          bullets: [
            'Primarily develops aerobic capacity (VO₂ max) and cardiac efficiency',
            'Relies heavily on fat oxidation as a fuel source at lower intensities',
            'Lower injury risk per session compared to high-intensity methods',
            'Suitable for beginners building a cardiovascular base',
            'Can be monotonous — adherence may be an issue for some people',
          ],
        },
        {
          heading: 'Interval Training',
          paragraphs: [
            'Interval training alternates between periods of higher intensity work and recovery. This can range from moderate intervals (e.g., fartlek running) to maximal effort sprint intervals (SIT/HIIT).',
          ],
          bullets: [
            'More time-efficient — significant adaptations in shorter sessions',
            'Improves both aerobic and anaerobic energy systems',
            'Greater EPOC (excess post-exercise oxygen consumption) than steady-state',
            'Higher neuromuscular and metabolic demand — requires more recovery',
            'Not suitable for every session or every population without appropriate progression',
          ],
        },
        {
          heading: 'Heart Rate Training Zones',
          paragraphs: [
            'Heart rate zones provide an objective framework for prescribing cardiovascular intensity. They are calculated as a percentage of maximum heart rate (MHR), commonly estimated as 220 minus age (though individual variation exists).',
          ],
          bullets: [
            'Zone 1 (50–60% MHR): Very light — active recovery, warm-up, cool-down',
            'Zone 2 (60–70% MHR): Light — fat burning, aerobic base building, conversational pace',
            'Zone 3 (70–80% MHR): Moderate — aerobic development, improved cardiac efficiency',
            'Zone 4 (80–90% MHR): Hard — threshold training, lactate tolerance, race pace preparation',
            'Zone 5 (90–100% MHR): Maximal — VO₂ max intervals, anaerobic capacity, very short durations',
          ],
          imageUrl: getUniversityImage('u3-ch4-fitt-principle'),
          imageAlt: 'Heart rate training zones showing intensity percentages and primary adaptations',
        },
        {
          paragraphs: [
            'Most people should spend the majority of their cardiovascular training in Zones 2–3, with occasional Zone 4–5 work for variety and progression. The 80/20 rule — 80% low intensity, 20% high intensity — is a well-supported framework used by elite endurance athletes and applicable to recreational exercisers.',
          ],
        },
        {
          heading: 'The FITT Principle',
          paragraphs: [
            'FITT provides a simple framework for prescribing any cardiovascular training session:',
          ],
          bullets: [
            'Frequency: How often — e.g., 3–5 sessions per week',
            'Intensity: How hard — measured by heart rate zone, RPE, or pace',
            'Time: How long — session duration in minutes',
            'Type: What modality — running, cycling, rowing, swimming, etc.',
          ],
        },
        {
          paragraphs: [
            'UK physical activity guidelines recommend at least 150 minutes of moderate-intensity or 75 minutes of vigorous-intensity cardiovascular activity per week for adults, alongside resistance training on at least two days.',
          ],
        },
        {
          heading: 'Measuring Intensity: RPE & Talk Test',
          paragraphs: [
            'Not everyone has access to heart rate monitors. Two practical alternatives are widely used:',
          ],
          bullets: [
            'RPE (Rating of Perceived Exertion): A 1–10 scale where 1 is "no effort" and 10 is "maximal effort". Zone 2 cardio typically feels like RPE 4–5; HIIT intervals are RPE 8–9.',
            'Talk Test: Can you hold a conversation? If yes — low to moderate intensity. Can you speak in short sentences? Moderate to vigorous. Can barely get a word out? High to maximal intensity.',
          ],
        },
      ],
      unbreakableInsight: 'More is not always better with cardio. Most people train too hard on easy days and too easy on hard days. Polarised training — genuinely easy aerobic work combined with genuinely hard interval work — produces better results than constantly training in the uncomfortable middle ground.',
      coachNote: 'Zone 2 training is the most undervalued tool in fitness. It builds the aerobic engine that supports everything else — including recovery between resistance training sets. Embrace "boring" low-intensity work. The Talk Test is the simplest intensity tool: if you can chat comfortably, you are in Zone 2.',
      practicalTask: {
        title: 'Cardiovascular Session Design',
        instructions: 'Using the FITT principle, design two cardiovascular training sessions: one steady-state session (Zone 2) and one interval session (Zones 4–5). Include modality, duration, work/rest intervals (if applicable), warm-up, and cool-down.',
        reflectionQuestions: [
          'How did the perceived effort differ between the two session types?',
          'Which session would be more appropriate for a beginner, and why?',
          'How would you modify the interval session for someone with limited fitness?',
        ],
      },
    },

    // ─── CHAPTER 5: Flexibility & Mobility ──────────────────────────
    {
      number: 5,
      title: 'Flexibility & Mobility',
      learningOutcome: 'Understand the different types of flexibility and mobility training, their physiological effects, and how to incorporate them into a training programme for injury prevention and movement quality.',
      assessmentCriteria: [
        'Differentiate between flexibility and mobility.',
        'Describe the three main types of stretching: static, dynamic, and PNF.',
        'Explain the role of foam rolling and self-myofascial release.',
        'Design a flexibility and mobility routine for a given training context.',
      ],
      content: [
        {
          heading: 'Flexibility vs Mobility',
          paragraphs: [
            'These terms are often used interchangeably, but they describe different qualities:',
          ],
          bullets: [
            'Flexibility: The ability of a muscle or muscle group to lengthen passively through a range of motion. It is a passive quality — someone could push your leg into a stretch position.',
            'Mobility: The ability to actively move a joint through its full range of motion with control. It requires not just muscle length but also strength, stability, and motor control at end ranges.',
          ],
        },
        {
          paragraphs: [
            'A gymnast might have excellent flexibility (can be placed in extreme positions) but a powerlifter with less flexibility might have better functional mobility (can control movement through the ranges they need). Both qualities matter, but mobility is generally more important for performance and injury prevention.',
          ],
        },
        {
          heading: 'Static Stretching',
          paragraphs: [
            'Static stretching involves holding a muscle in a lengthened position for a sustained duration, typically 15–30 seconds. It is the most common form of flexibility training.',
          ],
          bullets: [
            'Best performed post-exercise or as a standalone flexibility session',
            'Increases muscle length and reduces muscle stiffness over time',
            'Not recommended immediately before strength or power activities (can temporarily reduce force production by 5–10%)',
            'Hold each stretch for 15–30 seconds; 2–4 repetitions per muscle group',
            'Should feel like a gentle pull, never sharp pain',
          ],
        },
        {
          heading: 'Dynamic Stretching',
          paragraphs: [
            'Dynamic stretching involves controlled movements through a full range of motion. The body moves in and out of stretched positions rhythmically rather than holding.',
          ],
          bullets: [
            'Ideal for warm-ups — increases blood flow, ROM, and neuromuscular readiness',
            'Examples: leg swings, walking lunges with rotation, inchworms, arm circles',
            'Mirrors the movement patterns of the upcoming training session',
            '8–12 reps per movement, gradually increasing range and speed',
          ],
          imageUrl: getUniversityImage('u3-ch5-flexibility'),
          imageAlt: 'Types of flexibility and mobility training including static, dynamic, and PNF stretching',
        },
        {
          heading: 'PNF Stretching',
          paragraphs: [
            'Proprioceptive Neuromuscular Facilitation (PNF) is an advanced stretching technique that uses alternating contractions and stretches to achieve greater ROM gains than static stretching alone.',
          ],
          bullets: [
            'Contract-Relax method: stretch the muscle, then isometrically contract it for 5–10 seconds, relax, then stretch further',
            'Most effective with a partner but can be performed solo with bands or equipment',
            'Produces the greatest acute improvements in flexibility',
            'Best used post-exercise or in dedicated flexibility sessions, not pre-training',
            'Requires proper instruction to avoid overstretching',
          ],
        },
        {
          heading: 'Foam Rolling & Self-Myofascial Release (SMR)',
          paragraphs: [
            'Foam rolling applies pressure to soft tissue to reduce muscle tone, improve blood flow, and temporarily increase range of motion. It targets the fascia — the connective tissue surrounding muscles.',
          ],
          bullets: [
            'Can be used pre-exercise (without the force-reduction effects of static stretching) or post-exercise for recovery',
            'Roll slowly over the target area; pause on tender spots for 20–30 seconds',
            'Common areas: quadriceps, IT band, calves, thoracic spine, lats, glutes',
            'Should feel like a "good hurt" — not sharp or unbearable pain',
            'Tools: foam rollers, lacrosse balls, massage guns, peanut balls',
          ],
        },
        {
          heading: 'Mobility Drills',
          paragraphs: [
            'Mobility drills are active exercises that improve joint range of motion with control. Unlike stretching (which focuses on muscle length), mobility drills develop the strength and coordination to use available range.',
          ],
          bullets: [
            'Hip 90/90 rotations for hip internal and external rotation',
            'Controlled articular rotations (CARs) for shoulders, hips, and ankles',
            'Deep squat holds and goblet squat prying for hip and ankle mobility',
            'Thoracic spine rotations for upper back mobility (critical for overhead movements)',
            'Can be integrated into warm-ups or performed as dedicated mobility sessions',
          ],
        },
      ],
      unbreakableInsight: 'Flexibility without control is instability. Mobility without strength is fragility. The goal is not to become the most flexible person in the gym — it is to own the range of motion you have and gradually expand it with control. If you cannot stabilise a position, you should not be stretching into it.',
      coachNote: 'Most people need more hip and thoracic mobility, not more hamstring flexibility. When you cannot squat to depth, the issue is rarely tight hamstrings — it is usually limited ankle dorsiflexion, hip flexion mobility, or thoracic extension. Assess your movement before prescribing yourself stretches.',
      practicalTask: {
        title: 'Mobility Assessment & Routine',
        instructions: 'Test your own range of motion at three key joints: ankles (knee-to-wall test), hips (deep squat hold), and thoracic spine (seated rotation). Note any limitations. Design a 10-minute daily mobility routine targeting your identified restrictions using a combination of foam rolling, dynamic stretching, and mobility drills.',
        reflectionQuestions: [
          'Which joint showed the most restriction, and how might this affect your training?',
          'How does foam rolling feel different from static stretching?',
          'Why is it important to develop active mobility rather than just passive flexibility?',
        ],
      },
    },

    // ─── CHAPTER 6: Exercise Selection & Technique ──────────────────
    {
      number: 6,
      title: 'Exercise Selection & Technique',
      learningOutcome: 'Understand how to select exercises based on movement patterns, training goals, and individual factors, and identify common technique faults.',
      assessmentCriteria: [
        'Differentiate between compound and isolation exercises.',
        'Identify the six fundamental human movement patterns.',
        'Explain the factors influencing exercise selection for a given individual.',
        'Recognise common technique faults and their potential consequences.',
      ],
      content: [
        {
          heading: 'Compound vs Isolation Exercises',
          paragraphs: [
            'Exercises can be broadly categorised as compound (multi-joint) or isolation (single-joint). Understanding this distinction is fundamental to effective programme design.',
          ],
          bullets: [
            'Compound exercises: involve two or more joints and multiple muscle groups (e.g., squat, deadlift, bench press, pull-up, overhead press, row)',
            'Isolation exercises: involve a single joint and primarily target one muscle group (e.g., bicep curl, tricep extension, leg curl, lateral raise)',
            'Compound exercises are more time-efficient, produce greater hormonal responses, and develop functional strength',
            'Isolation exercises are useful for targeting weak points, rehabilitation, and aesthetic balance',
            'A well-designed programme typically prioritises compound exercises and supplements with isolation work',
          ],
        },
        {
          heading: 'The Six Fundamental Movement Patterns',
          paragraphs: [
            'All human movement can be broken down into six fundamental patterns. Building a programme around these patterns ensures balanced development and reduces the risk of muscular imbalances.',
          ],
          bullets: [
            'Push (horizontal and vertical): bench press, overhead press, push-up, dumbbell press',
            'Pull (horizontal and vertical): barbell row, pull-up, lat pulldown, face pull',
            'Squat: back squat, front squat, goblet squat, leg press',
            'Hinge: deadlift, Romanian deadlift, hip thrust, kettlebell swing',
            'Lunge: walking lunge, reverse lunge, Bulgarian split squat, step-up',
            'Carry: farmer\'s walk, suitcase carry, overhead carry, sandbag carry',
          ],
          imageUrl: getUniversityImage('u3-ch6-bilateral-unilateral'),
          imageAlt: 'The six fundamental movement patterns used in exercise selection',
        },
        {
          heading: 'Bilateral vs Unilateral Exercises',
          paragraphs: [
            'Bilateral exercises use both limbs simultaneously (e.g., barbell squat, bench press). Unilateral exercises work one limb at a time (e.g., single-leg squat, dumbbell row).',
          ],
          bullets: [
            'Bilateral exercises allow heavier loads and are better for maximal strength development',
            'Unilateral exercises expose and correct left-right imbalances',
            'Unilateral work demands greater stabilisation, improving balance and proprioception',
            'A balanced programme includes both — typically bilateral primary lifts with unilateral accessories',
          ],
        },
        {
          heading: 'Factors Influencing Exercise Selection',
          paragraphs: [
            'Exercise selection is not one-size-fits-all. The best exercise is the one that matches the individual\'s goals, experience, anatomy, and available equipment.',
          ],
          bullets: [
            'Training goal: strength vs hypertrophy vs endurance vs power',
            'Experience level: beginners benefit from simpler movement patterns (goblet squat before back squat)',
            'Injury history: avoiding exercises that aggravate existing conditions',
            'Individual anatomy: limb length, joint structure, and mobility affect optimal exercise selection',
            'Equipment availability: a home gym requires different exercise choices than a fully equipped commercial facility',
            'Personal preference: adherence is highest when you enjoy your training',
          ],
        },
        {
          heading: 'Common Technique Faults',
          paragraphs: [
            'Poor technique reduces the effectiveness of an exercise and increases injury risk. Recognising common faults is a core competency:',
          ],
          bullets: [
            'Squat: knees caving inward (valgus), excessive forward lean, heels rising, rounding lower back',
            'Deadlift: rounding the lumbar spine, bar drifting away from the body, hyperextending at lockout',
            'Bench Press: flaring elbows excessively, bouncing the bar off the chest, loss of scapular retraction',
            'Overhead Press: excessive lumbar extension (arching back), pressing in front of the face rather than overhead',
            'Row: using momentum (swinging), not achieving full scapular retraction, excessive lumbar extension',
          ],
        },
        {
          paragraphs: [
            'The root cause of technique faults is usually one of: insufficient mobility (cannot achieve the required position), insufficient stability (cannot control the position), excessive load (weight beyond current capacity), or inadequate coaching (does not know what correct form looks like).',
          ],
        },
      ],
      unbreakableInsight: 'The best exercise is the one you can perform with excellent technique through a full range of motion. A perfectly executed goblet squat will always build more muscle and less injury risk than a poorly performed barbell squat. Master the movement before loading the movement.',
      coachNote: 'Resist the urge to jump straight to advanced exercises — it is not impressive, it is a recipe for injury. Build a foundation: bodyweight → dumbbell → barbell. Earn the right to progress to more complex movements by demonstrating competence at simpler ones.',
      practicalTask: {
        title: 'Movement Pattern Programme',
        instructions: 'Design a full-body training session using the six movement patterns. For each pattern, select one compound exercise and one isolation or accessory exercise. Specify sets, reps, and rest periods. Then identify one common technique fault for each compound exercise and explain how you would correct it.',
        reflectionQuestions: [
          'Why should compound exercises generally be placed before isolation exercises in a session?',
          'How would you modify exercise selection if you had limited shoulder mobility?',
          'What is the value of including unilateral exercises alongside bilateral lifts?',
        ],
      },
    },

    // ─── CHAPTER 7: Recovery & Adaptation ───────────────────────────
    {
      number: 7,
      title: 'Recovery & Adaptation',
      learningOutcome: 'Understand the physiological processes of recovery and adaptation, including the SAID principle, supercompensation, and practical recovery strategies.',
      assessmentCriteria: [
        'Explain the SAID principle and its application to training programme design.',
        'Describe the supercompensation model and its implications for session timing.',
        'Identify the signs of overtraining and under-recovery.',
        'Outline practical recovery strategies including sleep, nutrition, and deloading.',
      ],
      content: [
        {
          heading: 'The SAID Principle',
          paragraphs: [
            'SAID stands for Specific Adaptation to Imposed Demands. It is the most fundamental principle in exercise science: the body adapts specifically to the type of stress placed upon it.',
          ],
          bullets: [
            'Lift heavy weights → the body adapts to produce more force (strength)',
            'Run long distances → the body adapts to sustain prolonged aerobic effort (endurance)',
            'Stretch regularly → the body adapts to allow greater range of motion (flexibility)',
            'Train explosively → the body adapts to produce force rapidly (power)',
          ],
        },
        {
          paragraphs: [
            'The SAID principle has a critical implication: your training must match your goals. If you want to get stronger, you must train with heavy loads. If you want better endurance, you must train with sustained effort. General fitness requires a balance of stimuli.',
          ],
        },
        {
          heading: 'The Supercompensation Model',
          paragraphs: [
            'Supercompensation explains how the body recovers and adapts after a training session. The cycle has four phases:',
          ],
          bullets: [
            'Training stimulus: the workout creates controlled damage and depletes energy stores',
            'Fatigue: immediately after training, performance capacity drops below baseline',
            'Recovery: the body repairs damage and replenishes energy, returning to baseline',
            'Supercompensation: the body overcompensates, briefly exceeding the previous baseline',
          ],
          imageUrl: getUniversityImage('u3-ch7-overtraining-signs'),
          imageAlt: 'The supercompensation curve showing training stimulus, fatigue, recovery, and adaptation',
        },
        {
          paragraphs: [
            'The key to effective programming is timing the next training session during the supercompensation window — when the body has adapted beyond its previous capacity. Train too soon (still fatigued) and performance declines. Wait too long (detraining) and the adaptation is lost.',
            'In practice, this means most muscle groups benefit from being trained every 48–72 hours, depending on session intensity and individual recovery capacity.',
          ],
        },
        {
          heading: 'Progressive Overload',
          paragraphs: [
            'Progressive overload is the systematic increase of training demands over time. Without it, the body has no reason to continue adapting. Overload can be achieved through:',
          ],
          bullets: [
            'Increasing load (adding weight to the bar)',
            'Increasing volume (more sets or reps)',
            'Increasing frequency (training a muscle group more often)',
            'Increasing range of motion (e.g., deficit deadlifts)',
            'Decreasing rest periods (increasing density)',
            'Improving technique (better muscle activation at the same load)',
          ],
        },
        {
          heading: 'Signs of Overtraining & Under-Recovery',
          paragraphs: [
            'Overtraining syndrome occurs when the cumulative training stress exceeds the body\'s ability to recover. It is relatively rare in recreational exercisers but under-recovery is extremely common.',
          ],
          bullets: [
            'Persistent fatigue that does not improve with a day off',
            'Declining performance despite continued training',
            'Increased resting heart rate (5–10 bpm above normal)',
            'Disturbed sleep — difficulty falling or staying asleep',
            'Mood changes: irritability, lack of motivation, anxiety',
            'Increased frequency of illness (suppressed immune function)',
            'Persistent muscle soreness beyond normal DOMS',
            'Loss of appetite or digestive disturbance',
          ],
        },
        {
          heading: 'Sleep: The Ultimate Recovery Tool',
          paragraphs: [
            'Sleep is the single most important recovery strategy. During deep sleep, the body releases growth hormone, repairs damaged tissue, consolidates motor learning, and restores the nervous system.',
          ],
          bullets: [
            'Adults should aim for 7–9 hours of quality sleep per night',
            'Sleep deprivation (< 6 hours) has been shown to reduce strength, impair decision-making, and increase injury risk',
            'Sleep hygiene: consistent bed/wake times, dark and cool room, no screens 30–60 minutes before bed, limited caffeine after midday',
          ],
        },
        {
          heading: 'Deloading',
          paragraphs: [
            'A deload is a planned reduction in training volume and/or intensity, typically lasting one week. It allows accumulated fatigue to dissipate while maintaining the training habit.',
          ],
          bullets: [
            'Typically performed every 4–8 weeks depending on training intensity',
            'Reduce volume by 40–60% while maintaining intensity (or vice versa)',
            'Not a week off — continue training, just at reduced stress',
            'Deloads are proactive recovery, not a sign of weakness',
            'After a deload, trainees often return stronger due to fatigue dissipation and full supercompensation',
          ],
        },
      ],
      unbreakableInsight: 'You do not get fitter in the gym — you get fitter recovering from the gym. Training provides the stimulus; sleep, nutrition, and rest provide the adaptation. The hardest-training person with the worst recovery will always lose to the moderately-training person who recovers brilliantly.',
      coachNote: 'Most people under-recover rather than overtrain. Before adding more sessions, ask: are you sleeping 7+ hours? Eating enough protein? Managing stress? Often the answer to a plateau is not "train harder" but "recover better". Schedule deloads proactively — do not wait until you are burned out.',
      practicalTask: {
        title: 'Recovery Audit',
        instructions: 'Track your sleep, nutrition, and subjective recovery (1–10 scale) for one week alongside your training. At the end of the week, analyse: are your recovery practices supporting your training demands? Identify your weakest recovery factor and create an action plan to improve it.',
        reflectionQuestions: [
          'How many hours of sleep are you consistently getting, and is it enough?',
          'Do you notice performance differences based on sleep quality the night before?',
          'When was the last time you took a planned deload, and how did you feel afterwards?',
        ],
      },
    },

    // ─── CHAPTER 8: Training for Special Populations ────────────────
    {
      number: 8,
      title: 'Understanding Individual Differences',
      learningOutcome: 'Understand the key considerations and modifications for training across different life stages and circumstances, including beginners, older adults, and pre/postnatal individuals.',
      assessmentCriteria: [
        'Identify the key principles for beginning a training programme safely and effectively.',
        'Describe the physiological considerations for training as you age.',
        'Outline the general guidelines for pre- and postnatal exercise.',
        'Explain when to seek medical clearance before starting or modifying an exercise programme.',
      ],
      content: [
        {
          heading: 'Why Individual Differences Matter',
          paragraphs: [
            'Not everyone starts from the same baseline. Factors such as age, training experience, medical history, pregnancy, and physical limitations all affect how you should approach exercise. Understanding these differences — whether for yourself or for people you train alongside — ensures safety and effectiveness.',
            'This chapter covers the key considerations you should be aware of across different circumstances.',
          ],
        },
        {
          heading: 'Training Beginners',
          paragraphs: [
            'A complete beginner is someone with little to no structured exercise experience. Their needs differ significantly from an intermediate or advanced trainee.',
          ],
          bullets: [
            'Prioritise movement quality over load — technique before intensity',
            'Begin with bodyweight and machine-based exercises before progressing to free weights',
            'Start with lower volumes (2 sets per exercise) and gradually increase',
            'Full-body sessions 2–3 times per week are more effective than body-part splits',
            'Initial strength gains are primarily neural — the nervous system becomes more efficient before muscle growth occurs',
            'Build confidence and enjoyment — adherence is the biggest predictor of results',
            'Introduce progressive overload gradually: add one variable at a time',
          ],
        },
        {
          heading: 'Training Older Adults (65+)',
          paragraphs: [
            'Ageing brings physiological changes that affect training prescription, but exercise remains one of the most powerful interventions for healthy ageing.',
          ],
          bullets: [
            'Sarcopenia: age-related loss of muscle mass — resistance training is the primary countermeasure',
            'Osteoporosis risk: weight-bearing and resistance exercises help maintain bone density',
            'Balance and proprioception decline — include balance training to reduce fall risk',
            'Longer warm-ups may be needed as joints stiffen with age',
            'Recovery times are typically longer — allow adequate rest between sessions',
            'Avoid high-impact exercises if joint health is compromised',
            'Focus on functional movements: sit-to-stand, step-ups, carries, reaching overhead',
            'UK guidelines: 150 minutes moderate activity + 2 strength sessions per week apply to all adults, including those over 65',
          ],
          imageUrl: getUniversityImage('u3-ch8-special-populations'),
          imageAlt: 'Training considerations for special populations including beginners, older adults, and pre/postnatal',
        },
        {
          heading: 'Pre- and Postnatal Exercise',
          paragraphs: [
            'Exercise during pregnancy and after birth is generally safe and beneficial when appropriately prescribed. However, significant physiological changes require programme modifications.',
          ],
        },
        {
          heading: 'Prenatal Considerations',
          bullets: [
            'Avoid lying supine (on back) after the first trimester — can compress the vena cava',
            'Avoid exercises with a high risk of falling or abdominal trauma',
            'Relaxin hormone increases joint laxity — avoid overstretching and heavy ballistic movements',
            'Pelvic floor exercises (Kegels) are important throughout pregnancy',
            'Monitor intensity with the Talk Test — you should be able to maintain conversation',
            'RPE should generally stay at 6–7 out of 10',
            'Stay hydrated and avoid overheating',
            'Exercise is beneficial for gestational diabetes prevention, mood, and easier labour',
          ],
        },
        {
          heading: 'Postnatal Considerations',
          bullets: [
            'Return to exercise should be gradual and guided by medical clearance (typically 6 weeks for vaginal delivery, 8–12 weeks for caesarean)',
            'Pelvic floor rehabilitation is the first priority before returning to high-impact or heavy resistance training',
            'Diastasis recti (abdominal separation) screening should be performed before core-intensive exercises',
            'Avoid sit-ups and crunches until diastasis has been assessed and addressed',
            'Postnatal depression is common — exercise is a proven intervention but approach sensitively',
            'Sleep deprivation affects recovery — programme lower volumes with adequate rest',
          ],
        },
        {
          heading: 'When to Seek Medical Clearance',
          paragraphs: [
            'There are situations where medical clearance should be obtained before starting or modifying an exercise programme. Recognising these situations is an important part of training safely.',
          ],
          bullets: [
            'Any new, unexplained symptoms during exercise (chest pain, dizziness, fainting) — stop immediately and seek medical advice',
            'Known cardiovascular conditions, diabetes, or respiratory conditions',
            'Recent surgery or significant injury',
            'Pregnancy (especially if not previously active)',
            'The PAR-Q (Physical Activity Readiness Questionnaire) is a simple screening tool that helps identify whether medical clearance is needed before beginning exercise',
            'When in doubt, seek clearance — it is always better to be safe',
          ],
        },
      ],
      unbreakableInsight: 'Understanding individual differences is not about limiting what you can do — it is about training intelligently within your current circumstances. Whether you are a complete beginner, returning from injury, or navigating a life stage like pregnancy or ageing, the principles of safe, progressive training still apply.',
      coachNote: 'Wherever you are starting from, the fundamentals remain the same: move well before moving heavy, progress gradually, listen to your body, and seek professional advice when something does not feel right. There is always a way to train — it just needs to be appropriate for your situation.',
      practicalTask: {
        title: 'Personal Considerations Audit',
        instructions: 'Reflect on your own training circumstances. Do any of the considerations covered in this chapter apply to you? If so, identify at least two specific modifications you should make to your current training. If not, consider someone you know (a family member, friend, or gym partner) and think about what modifications might apply to them.',
        reflectionQuestions: [
          'Are there any health conditions or physical limitations that should influence your training approach?',
          'Have you completed a PAR-Q or sought medical clearance if applicable?',
          'How would your training change if your circumstances changed (e.g., injury, ageing, pregnancy)?',
        ],
      },
    },
  ],
};

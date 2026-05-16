import type { Unit } from '../types';

export const level4Unit1: Unit = {
  number: 1,
  title: 'Advanced Periodisation & Programming',
  description: 'Master periodisation models used by elite coaches, learn auto-regulation strategies, and understand how to design long-term training plans that peak performance at the right time.',
  chapters: [
    {
      number: 1,
      title: 'Linear vs Non-Linear Periodisation',
      learningOutcome: 'Compare traditional linear periodisation with non-linear approaches and identify when each model is most appropriate.',
      assessmentCriteria: [
        'Describe the structure and progression of linear periodisation',
        'Explain the advantages of non-linear periodisation for intermediate and advanced lifters',
        'Identify the limitations of each model in different training contexts',
      ],
      content: [
        {
          heading: 'Linear Periodisation Revisited',
          paragraphs: [
            'Linear periodisation (LP) follows a predictable path: begin with high volume and low intensity, then progressively shift toward lower volume and higher intensity over weeks or months. The classic model moves from hypertrophy (4×12 at 65%) through strength (4×6 at 80%) to peaking (3×2 at 90%+).',
            'LP works well for beginners and intermediate lifters because the progressive increase in intensity matches their capacity to adapt. However, for advanced trainees, the extended periods at sub-maximal intensity can lead to detraining of qualities developed in earlier phases. By the time you reach peak strength, you may have lost some of the muscle you built in the hypertrophy phase.',
          ],
        },
        {
          heading: 'Non-Linear (Undulating) Periodisation',
          paragraphs: [
            'Non-linear periodisation varies training variables more frequently — daily, weekly, or within a micro-cycle. Rather than dedicating entire blocks to one quality, you train multiple qualities within the same week. This maintains a broader fitness base and may produce superior adaptations in trained athletes.',
            'The key advantage is stimulus variation. Your body adapts to repeated identical stimuli with diminishing returns. By varying rep ranges, intensities, and volumes within shorter time frames, you keep the adaptive signal strong across multiple physical qualities simultaneously.',
          ],
          bullets: [
            'Daily Undulating — Different rep scheme each session (e.g., Monday 4×6, Wednesday 3×10, Friday 5×3)',
            'Weekly Undulating — Different emphasis each week (e.g., Week 1 hypertrophy focus, Week 2 strength, Week 3 power)',
            'Block-wave hybrid — Blocks of emphasis with undulating variation within each block',
          ],
        },
        {
          heading: 'Choosing the Right Model',
          paragraphs: [
            'Neither model is universally superior — the best choice depends on training age, goals, competition schedule, and individual response. Linear periodisation suits beginners, those with clear competition dates, and athletes in sports with defined seasons. Non-linear suits advanced lifters, those training year-round without specific peaking dates, and individuals who respond poorly to extended periods of one stimulus type.',
          ],
          bullets: [
            'Beginner (< 2 years) — Linear periodisation with 4–6 week phases',
            'Intermediate (2–5 years) — Weekly undulating or block periodisation',
            'Advanced (5+ years) — Daily undulating, conjugate, or individualised hybrid models',
            'Competitor — Linear or block model timed to peak for competition',
          ],
        },
      ],
      unbreakableInsight: 'The best periodisation model is the one you execute consistently and recover from. A perfectly designed programme that you cannot adhere to is worse than a simple one you follow relentlessly.',
      coachNote: 'Start with linear periodisation until progress stalls. Then introduce undulating variation. Complexity should increase only when simpler approaches stop working — not because a model looks more sophisticated.',
      practicalTask: {
        title: 'Periodisation Model Comparison',
        instructions: 'Design two 12-week training outlines for the same goal (e.g., increasing squat 1RM): one using linear periodisation and one using weekly undulating periodisation. Compare the two approaches and identify the trade-offs.',
        reflectionQuestions: [
          'Which model better fits your current training schedule and recovery capacity?',
          'What qualities might be lost during extended phases in the linear model?',
          'How would you track whether the undulating approach is producing sufficient progressive overload?',
        ],
      },
    },
    {
      number: 2,
      title: 'Daily Undulating Periodisation',
      learningOutcome: 'Design and implement a DUP programme with appropriate intensity, volume, and exercise selection across training sessions.',
      assessmentCriteria: [
        'Explain the theoretical basis for daily undulating periodisation',
        'Design a DUP programme for a specific strength goal',
        'Describe how to manage fatigue and recovery within a DUP framework',
      ],
      content: [
        {
          heading: 'The DUP Framework',
          paragraphs: [
            'Daily Undulating Periodisation assigns different training stimuli to each session within a week. A typical three-day DUP structure might alternate between hypertrophy (8–12 reps at 65–75%), strength (3–5 reps at 80–87%), and power (2–3 reps at 88–93%) days. This provides variation at the session level while maintaining progressive overload at the weekly or monthly level.',
            'The physiological rationale is that frequent variation in rep range and intensity recruits different motor unit populations, engages different metabolic pathways, and prevents the neural staleness that comes from repeated identical sessions. Research by Rhea et al. (2002) and Zourdos et al. (2016) supports DUP for strength gains in trained lifters.',
          ],
        },
        {
          heading: 'Programming a DUP Cycle',
          bullets: [
            'Session A (Hypertrophy) — 3–4 sets of 8–12 reps at RPE 7–8. Focus on muscle tension and controlled tempo. Accessory work emphasises volume',
            'Session B (Strength) — 4–5 sets of 3–5 reps at RPE 8–9. Focus on force production with moderate rest (3–4 min). Accessories support main lifts',
            'Session C (Power/Peak) — 3–5 sets of 1–3 reps at RPE 8.5–9.5. Focus on maximal intent and technical precision. Minimal accessory volume',
            'Progression — Increase loads by 2.5–5% every 2–3 weeks if RPE targets are being met. Deload every 4th week',
          ],
        },
        {
          heading: 'Managing Fatigue in DUP',
          paragraphs: [
            'DUP programmes generate fatigue from multiple directions simultaneously — mechanical tension from heavy days, metabolic stress from high-rep days, and neural fatigue from power days. Managing this requires careful attention to total weekly volume, adequate rest between sessions, and periodic deloads.',
            'A common mistake is treating every DUP session with maximal effort. The system works because each session type provides a different stimulus at a manageable intensity. If you are consistently hitting RPE 10 on every session, you are not undulating — you are overreaching. Keep RPE targets disciplined and trust the process.',
          ],
        },
        {
          heading: 'Exercise Selection for DUP',
          paragraphs: [
            'In DUP, you can either use the same exercise across all three days (e.g., back squat on hypertrophy, strength, and power days) or use variations (e.g., goblet squat for hypertrophy, back squat for strength, pause squat for power). Using the same exercise improves movement skill; using variations reduces overuse risk and targets weaknesses.',
          ],
        },
      ],
      unbreakableInsight: 'DUP works because it respects a fundamental truth: your body adapts to what you repeatedly do, and then stops adapting. Variation is not randomness — it is strategic disruption of the adaptation process.',
      coachNote: 'Track RPE honestly on every working set. DUP only works when you regulate intensity properly across sessions. A logbook or app that records RPE alongside load is essential — not optional.',
      practicalTask: {
        title: 'DUP Programme Design',
        instructions: 'Design a 4-week DUP programme for your three main lifts (squat, bench press, deadlift). Include rep schemes, target RPEs, and accessory work for each session type. Plan your deload in week 4.',
        reflectionQuestions: [
          'How will you ensure progressive overload across the 4-week cycle?',
          'What will you do if RPE targets are consistently too easy or too hard?',
          'How does this approach compare to your current training structure?',
        ],
      },
    },
    {
      number: 3,
      title: 'Block Periodisation',
      learningOutcome: 'Understand block periodisation theory and design concentrated training blocks that develop specific qualities in sequence.',
      assessmentCriteria: [
        'Describe the three primary block types: accumulation, transmutation, and realisation',
        'Explain the concept of residual training effects and how they influence block sequencing',
        'Design a block periodisation programme for a specific athletic goal',
      ],
      content: [
        {
          heading: 'The Block System',
          paragraphs: [
            'Block periodisation, developed by Vladimir Issurin, organises training into concentrated blocks of 2–4 weeks, each focused on developing one or two primary physical qualities. The system is built on the concept of residual training effects — after you stop training a quality, its adaptations persist for a predictable period before decaying.',
            'This allows you to train qualities sequentially rather than simultaneously, providing a concentrated stimulus that is more effective for advanced athletes who need greater training stress to continue adapting. The three primary block types form a logical sequence leading to peak performance.',
          ],
        },
        {
          heading: 'The Three Block Types',
          bullets: [
            'Accumulation — High volume, moderate intensity. Builds the foundation: muscle mass, work capacity, general strength, and aerobic base. Typically 3–4 weeks. Residual effect lasts 4–6 weeks',
            'Transmutation — Moderate volume, high intensity. Converts accumulated fitness into sport-specific strength and power. Typically 2–3 weeks. Residual effect lasts 2–4 weeks',
            'Realisation — Low volume, very high intensity. Allows fatigue to dissipate while maintaining sharpness. Peak performance emerges. Typically 1–2 weeks. This is your competition or testing phase',
          ],
        },
        {
          heading: 'Residual Training Effects',
          paragraphs: [
            'Different physical qualities decay at different rates after training ceases. Aerobic endurance and muscle mass decay slowly (15–30+ days). Maximal strength decays moderately (10–20 days). Speed and power decay quickly (5–10 days). This predictable decay pattern determines optimal block sequencing: train the most durable qualities first (accumulation), then the moderately durable ones (transmutation), then the most perishable ones last (realisation).',
            'Understanding residual effects means you can be confident that the hypertrophy gained in your accumulation block will still be present when you test your 1RM in the realisation block — provided the blocks are sequenced correctly and the timeline is appropriate.',
          ],
        },
        {
          heading: 'When to Use Block Periodisation',
          paragraphs: [
            'Block periodisation is most appropriate for advanced athletes with a clear competition date and sufficient training history to tolerate concentrated loading. It is less appropriate for beginners (who adapt well to mixed training), recreational lifters (who do not need to peak), and those who enjoy training variety within each session.',
          ],
        },
      ],
      unbreakableInsight: 'Elite performance is not about being good at everything all the time. It is about strategically building qualities in sequence so they all converge at the moment that matters most.',
      coachNote: 'Block periodisation requires discipline — you must accept that during an accumulation block, you will not feel "strong." That is by design. Trust the process and resist the urge to test heavy singles during a volume phase.',
      practicalTask: {
        title: 'Block Periodisation Plan',
        instructions: 'Design a 10-week block periodisation plan: 4-week accumulation, 3-week transmutation, 2-week realisation, 1-week test. Define the primary qualities, volume, and intensity targets for each block.',
        reflectionQuestions: [
          'How does the intensity progression across blocks differ from linear periodisation?',
          'What residual training effects are you relying on to maintain qualities between blocks?',
          'How would you adjust if you felt overtrained during the transmutation block?',
        ],
      },
    },
    {
      number: 4,
      title: 'The Conjugate Method',
      learningOutcome: 'Understand the Westside Barbell conjugate method and its application to raw and equipped strength training.',
      assessmentCriteria: [
        'Describe the structure of a conjugate training week',
        'Explain the maximal effort and dynamic effort methods',
        'Discuss the role of exercise rotation and special exercises in the conjugate system',
      ],
      content: [
        {
          heading: 'Origins and Philosophy',
          paragraphs: [
            'The conjugate method, popularised by Louie Simmons at Westside Barbell, is based on the concurrent development of multiple strength qualities within each training week. Unlike block periodisation, which trains qualities in sequence, the conjugate method trains maximal strength, speed-strength, and work capacity simultaneously through dedicated session types.',
            'The system is built on two key insights: first, that training the same exercise with near-maximal loads for more than 1–3 weeks leads to accommodation (diminishing returns). Second, that maximal strength requires both the ability to produce high force (maximal effort) and the ability to produce force quickly (dynamic effort).',
          ],
        },
        {
          heading: 'Weekly Structure',
          bullets: [
            'Max Effort Upper — Work up to a 1–3 rep max on a pressing variation (changes every 1–3 weeks). Follow with high-volume accessory work targeting weaknesses',
            'Max Effort Lower — Work up to a 1–3 rep max on a squat or deadlift variation (changes every 1–3 weeks). Follow with posterior chain and core accessories',
            'Dynamic Effort Upper — Speed bench press: 8–12 sets of 3 reps at 50–60% with accommodating resistance (bands/chains). Focus on bar speed. Follow with high-rep triceps and shoulder work',
            'Dynamic Effort Lower — Speed squat or deadlift: 10–12 sets of 2 reps at 50–65% with accommodating resistance. Explosive intent. Follow with hamstrings, glutes, and lower back',
          ],
        },
        {
          heading: 'Exercise Rotation — Beating Accommodation',
          paragraphs: [
            'A defining feature of the conjugate method is frequent exercise rotation on max effort days. Rather than back squatting every week, you might use a safety bar squat in week 1, a box squat in week 2, and a front squat in week 3. Each variation provides a similar training effect while avoiding the neural accommodation that occurs when the same movement pattern is repeated at maximal intensity.',
            'Dynamic effort exercises change less frequently — speed squats and speed bench press remain consistent for 3-week waves, with load percentages increasing each week (50%, 55%, 60%) before resetting.',
          ],
        },
        {
          heading: 'Adapting Conjugate for Raw Lifters',
          paragraphs: [
            'The original conjugate method was developed for equipped powerlifters using squat suits, bench shirts, and deadlift suits. Raw lifters may need modifications: slightly higher dynamic effort percentages (55–70%), more emphasis on muscular development over gear-specific positions, and potentially lower max effort frequency to manage joint stress without the protection of equipment.',
          ],
        },
      ],
      unbreakableInsight: 'The conjugate method teaches a principle that transcends any specific system: if what you are doing stops working, change the exercise — not the effort. Accommodation is the enemy of progress.',
      coachNote: 'Keep a logbook of every max effort exercise and the weight achieved. When you rotate back to the same variation months later, you should be stronger. If you are not, your system is not producing adaptation — troubleshoot volume, recovery, or exercise selection.',
      practicalTask: {
        title: 'Conjugate Week Design',
        instructions: 'Design one complete conjugate training week for a raw lifter: ME Upper, ME Lower, DE Upper, DE Lower. Select appropriate max effort variations, dynamic effort parameters, and 3–4 accessories per session.',
        reflectionQuestions: [
          'How does training four days per week with different methods compare to your current approach?',
          'What are the risks of attempting true 1RM efforts every week?',
          'How would you select accessories to address your specific weak points?',
        ],
      },
    },
    {
      number: 5,
      title: 'Autoregulation & RPE-Based Training',
      learningOutcome: 'Implement RPE and velocity-based autoregulation to optimise daily training loads based on readiness rather than fixed percentages.',
      assessmentCriteria: [
        'Explain the RPE scale and its application to resistance training',
        'Describe velocity-based training (VBT) principles and how bar speed informs load selection',
        'Discuss the advantages and limitations of autoregulated programming',
      ],
      content: [
        {
          heading: 'Why Autoregulate?',
          paragraphs: [
            'Percentage-based programmes assume that your 1RM is fixed and that your daily capacity is constant. Neither is true. Your strength fluctuates by 5–15% on any given day based on sleep quality, stress, nutrition, accumulated fatigue, and time of day. A programme prescribing 85% of your 1RM might be appropriately challenging on a good day and impossibly heavy on a bad one.',
            'Autoregulation adjusts training loads based on your actual performance on the day, rather than a theoretical percentage. This means you train hard enough to stimulate adaptation without exceeding your recovery capacity. Over time, autoregulated training produces more consistent progress with fewer injuries and less burnout than rigid percentage-based programmes.',
          ],
        },
        {
          heading: 'The RPE Scale (Rate of Perceived Exertion)',
          paragraphs: [
            'In resistance training, the RPE scale (adapted by Mike Tuchscherer from Borg\'s original) runs from 1 to 10 and estimates proximity to failure. RPE 10 means no more reps were possible. RPE 9 means one rep was left in reserve. RPE 8 means two reps left. RPE 7 means three reps left.',
          ],
          bullets: [
            'RPE 6 — Warm-up weight. Could do 4+ more reps easily',
            'RPE 7 — Moderate effort. 3 reps left in reserve. Good for speed work and technique practice',
            'RPE 8 — Hard but manageable. 2 reps in reserve. Ideal for most working sets in a training block',
            'RPE 9 — Very hard. 1 rep left. Appropriate for top sets and near-maximal work',
            'RPE 10 — Maximum effort. No more reps possible. Used sparingly — testing or competition only',
          ],
        },
        {
          heading: 'Velocity-Based Training (VBT)',
          paragraphs: [
            'VBT uses a device (linear position transducer or accelerometer) to measure bar speed during each rep. Because bar velocity decreases predictably as load increases, velocity provides an objective measure of effort that removes the subjectivity of RPE.',
            'Common velocity zones: > 0.80 m/s for power work, 0.60–0.80 m/s for strength-speed, 0.40–0.60 m/s for maximal strength, < 0.40 m/s for near-maximal effort. When bar speed drops below a target threshold, you stop the set — preventing junk volume and excessive fatigue.',
          ],
        },
        {
          heading: 'Implementing Autoregulation',
          paragraphs: [
            'The simplest approach is RPE-based loading: prescribe a rep count and target RPE, then let the athlete select the load that achieves that RPE. For example, "Squat 4×4 @ RPE 8" means find a weight where you could do 4 reps with 2 left in reserve, and repeat for 4 sets. If today\'s RPE 8 is 120kg instead of yesterday\'s 130kg, that is the correct load for today.',
            'More advanced autoregulation combines RPE with fatigue stops: perform sets until RPE reaches a target, then stop. This naturally adjusts volume based on daily readiness — on a good day you might complete 6 sets before hitting RPE 9; on a tough day, 3 sets.',
          ],
        },
      ],
      unbreakableInsight: 'The best athletes do not train harder than everyone else — they train smarter. Autoregulation ensures that every session is appropriately challenging, every day. Not too easy, not too hard, and never wasted.',
      coachNote: 'RPE calibration takes practice. Most beginners underestimate effort (calling RPE 8 what is really RPE 6). Film your top sets and review them. Over time, your internal calibration improves dramatically. Budget 4–6 weeks of conscious practice before RPE becomes reliable.',
      practicalTask: {
        title: 'RPE Calibration Week',
        instructions: 'For one week, record the weight, reps, and your RPE for every working set. At the end of the week, review: were your RPE ratings consistent with the actual difficulty? Did heavier sets always get higher RPE, or were there inconsistencies?',
        reflectionQuestions: [
          'How accurate was your RPE estimation compared to your actual effort?',
          'Did your performance vary across the week? What factors influenced it?',
          'How would RPE-based loading change your current programme?',
        ],
      },
    },
    {
      number: 6,
      title: 'Deload Strategies & Fatigue Management',
      learningOutcome: 'Understand the science of fatigue accumulation and implement evidence-based deload strategies to optimise long-term progress.',
      assessmentCriteria: [
        'Explain the fitness-fatigue model and how it relates to supercompensation',
        'Describe different deload approaches: volume reduction, intensity reduction, and active recovery',
        'Identify signs of accumulated fatigue that indicate a deload is needed',
      ],
      content: [
        {
          heading: 'The Fitness-Fatigue Model',
          paragraphs: [
            'Every training session produces two effects: a fitness gain and a fatigue cost. Your observed performance at any moment is the difference between accumulated fitness and accumulated fatigue. When fatigue dissipates faster than fitness (during a deload or taper), performance temporarily exceeds your baseline — this is supercompensation.',
            'The fitness-fatigue model explains why you can train hard for weeks and feel worse, then take a deload week and suddenly feel stronger than ever. The fitness was there all along — it was just masked by accumulated fatigue. Strategic deloading is not about being lazy; it is about allowing your fitness to be expressed.',
          ],
        },
        {
          heading: 'Types of Deload',
          bullets: [
            'Volume deload — Reduce sets by 40–60% while maintaining intensity. Most common and effective approach. Maintains neural patterns while reducing mechanical stress. e.g., 3×3 at 85% instead of 5×5 at 85%',
            'Intensity deload — Reduce load by 10–20% while maintaining volume. Useful for joint recovery. Less effective for maintaining strength-specific neural patterns',
            'Frequency deload — Reduce training days (e.g., 4 sessions → 2 sessions) while keeping individual session structure similar',
            'Active recovery week — Replace barbell training with bodyweight work, light cardio, mobility, and recovery modalities. Best for severe overreaching or after competition',
            'Complete rest — 5–7 days off. Reserved for injury, illness, or psychological burnout. Performance may dip initially but often rebounds strongly',
          ],
        },
        {
          heading: 'When to Deload',
          paragraphs: [
            'Planned deloads (every 3–6 weeks depending on training intensity) prevent accumulated fatigue from exceeding your recovery capacity. Reactive deloads are taken when signs of overreaching appear: unexplained performance drops across multiple sessions, persistent fatigue despite adequate sleep, elevated resting heart rate, mood disturbances, increased injury niggles, or loss of training motivation.',
            'The optimal deload frequency depends on training age, programme intensity, and life stress. Beginners may not need deloads for 6–8 weeks. Advanced lifters training at high intensities may need them every 3–4 weeks. When in doubt, deload earlier rather than later — a slightly premature deload costs you one easy week; delayed deloading can cost you months of overtraining recovery.',
          ],
        },
      ],
      unbreakableInsight: 'Progress is not made during the hard weeks — it is revealed during the easy ones. If you never deload, you never express the fitness you have built. Deloading is not the absence of training; it is part of training.',
      coachNote: 'The hardest part of deloading is the psychology — it feels like going backwards. Reframe it: you are not resting, you are allowing adaptation to occur. Plan your deloads in advance so they are non-negotiable parts of your programme.',
      practicalTask: {
        title: 'Deload Protocol Design',
        instructions: 'Design two different deload protocols for your current programme: a volume deload and an intensity deload. Specify exact set/rep/load changes for each main lift. Also identify three personal signs of accumulated fatigue that would trigger a reactive deload.',
        reflectionQuestions: [
          'How long has it been since your last deload or rest week?',
          'Do you currently experience any signs of accumulated fatigue?',
          'Which deload approach would you find psychologically easier to execute?',
        ],
      },
    },
    {
      number: 7,
      title: 'Peaking & Competition Preparation',
      learningOutcome: 'Design a peaking programme that maximises performance on a specific competition or testing date.',
      assessmentCriteria: [
        'Describe the taper process and how to time fatigue dissipation for peak performance',
        'Explain attempt selection strategy for powerlifting competition',
        'Discuss the role of practice, routine, and mental preparation in competition readiness',
      ],
      content: [
        {
          heading: 'The Taper — From Training to Performance',
          paragraphs: [
            'A taper is a planned reduction in training stress in the final 1–3 weeks before competition that allows accumulated fatigue to dissipate while maintaining the fitness and skill you have built. The goal is to arrive at competition day at the intersection of maximum fitness and minimum fatigue.',
            'Research consistently shows that the most effective taper reduces volume by 40–60% while maintaining or slightly increasing intensity. This preserves the neural patterns and motor unit recruitment needed for heavy lifting while removing the fatigue that suppresses their expression. Reducing intensity during a taper is a common mistake — it de-trains the specific quality you are trying to display.',
          ],
        },
        {
          heading: 'Taper Timeline',
          bullets: [
            'Three weeks out — Reduce volume by 30%. Maintain intensity. Hit planned openers at RPE 7–8',
            'Two weeks out — Reduce volume by 50%. Top sets at planned second attempts. RPE 8',
            'One week out — Reduce volume by 60–70%. Brief, sharp sessions. Hit openers only. RPE 7. Nothing over planned second attempts',
            'Two to three days out — Complete rest or very light movement. Focus on sleep, hydration, and nutrition',
            'Competition day — Execute the plan. Trust the preparation',
          ],
        },
        {
          heading: 'Attempt Selection Strategy',
          paragraphs: [
            'Attempt selection is where competitions are won or lost. The goal is to maximise your total (the sum of your best successful squat, bench, and deadlift), not to hit dramatic single-lift PRs at the expense of missed attempts.',
          ],
          bullets: [
            'First attempt (opener) — A weight you can hit confidently on your worst day. Typically 90–92% of your target third attempt. Purpose: get on the board, build confidence, establish rhythm',
            'Second attempt — A weight you are confident of hitting on a normal training day. Typically 95–97% of your third. Purpose: build your total and set up a meaningful third attempt',
            'Third attempt — Your reach weight. An ambitious but realistic target based on training performance. Purpose: personal records and competitive positioning',
            'If you miss a second attempt — Repeat it rather than taking a jump to your planned third. A missed lift costs you more than a conservative third attempt',
          ],
        },
        {
          heading: 'Competition Day Routine',
          paragraphs: [
            'Establish and rehearse a competition day routine that covers every controllable variable: wake time, meal timing and composition, warm-up protocol, attempt timing, and inter-lift recovery. The more your competition routine resembles a training session, the calmer and more confident you will be. Uncertainty creates anxiety; preparation eliminates it.',
          ],
        },
      ],
      unbreakableInsight: 'Competition day is not the time to train — it is the time to perform. Your preparation happened in the weeks and months before. On the day, your only job is to execute what you have already practised. Trust the process.',
      coachNote: 'Have your attempt selection planned before you arrive at the competition. Write down your openers, planned seconds, and ideal thirds. Adjust during the day only if your opener moves significantly better or worse than expected. Emotion-driven jumps are the most common cause of missed lifts.',
      practicalTask: {
        title: 'Mock Competition Taper',
        instructions: 'Design a 3-week taper leading into a mock testing day. Plan your taper volume and intensity reductions, your attempt selection for squat, bench, and deadlift, and your day-of routine from morning to final lift.',
        reflectionQuestions: [
          'How conservative are your planned openers? Could you hit them on your worst day?',
          'What is your plan if you miss a second attempt?',
          'How will you manage nerves and arousal between attempts?',
        ],
      },
    },
    {
      number: 8,
      title: 'Long-Term Athletic Development',
      learningOutcome: 'Understand the principles of long-term athlete development and how to structure years-long training progressions.',
      assessmentCriteria: [
        'Describe the stages of long-term athletic development',
        'Explain how training priorities should shift across years of training',
        'Discuss the concept of training age and how it differs from chronological age',
      ],
      content: [
        {
          heading: 'Thinking in Years, Not Weeks',
          paragraphs: [
            'Most people plan their training in 4–12 week blocks. Elite athletes and coaches think in years and decades. The reason is simple: the adaptations that produce extraordinary performance — maximal muscle development, highly refined motor patterns, psychological hardness, and deep knowledge of your own body — take years to develop. There are no meaningful shortcuts.',
            'Long-term athletic development (LTAD) recognises that different phases of a training career require different emphases. What matters in your first year of training is radically different from what matters in your tenth. Applying expert-level strategies to beginner-level development is as counterproductive as applying beginner strategies to an advanced lifter.',
          ],
        },
        {
          heading: 'Stages of Development',
          bullets: [
            'Foundation (Years 1–2) — Movement quality, consistency, general physical preparation. Priority: learn the movements, build training habits, develop baseline fitness. Avoid specialisation',
            'Development (Years 2–5) — Progressive overload, structured programming, nutritional optimisation. Priority: build muscle, increase strength systematically, learn your body\'s responses to different training stimuli',
            'Performance (Years 5–10) — Advanced periodisation, competition experience, individualised programming. Priority: refine weaknesses, peak for specific events, develop mental toughness under pressure',
            'Mastery (Years 10+) — Highly individualised training, coaching others, giving back to the sport. Priority: maintain health, find sustainable training that supports lifelong participation, mentor the next generation',
          ],
        },
        {
          heading: 'Training Age vs Chronological Age',
          paragraphs: [
            'Training age — the number of years of consistent, structured training — matters far more than chronological age for determining training approach. A 40-year-old with two years of training experience is still a beginner in training terms and should be programmed accordingly. A 25-year-old with ten years of structured training is advanced and needs advanced strategies.',
            'This distinction is critical because many people apply programmes designed for advanced lifters because they have been "going to the gym" for years, when in reality their training has been inconsistent, unstructured, or inappropriate. Honest assessment of your training age — measured in years of consistent, progressive, structured training — should determine your programming choices.',
          ],
        },
        {
          heading: 'Sustainability and Longevity',
          paragraphs: [
            'The ultimate goal of long-term athletic development is not a single peak performance — it is decades of healthy, productive training. This requires prioritising joint health, managing training volume to prevent burnout, maintaining a positive relationship with training, and adapting goals as your body and life circumstances change.',
            'The person who trains consistently for thirty years at moderate intensity will accumulate vastly more total training volume — and likely more total strength — than the person who trains at maximum intensity for five years and then stops due to injury or burnout. Play the long game.',
          ],
        },
      ],
      unbreakableInsight: 'There is no finish line. Training is not a destination — it is a lifelong practice. The best programme is one you will still be following, in some form, in twenty years.',
      coachNote: 'Ask yourself: "Will this training approach still serve me in ten years?" If the answer is no — if it requires unsustainable intensity, ignores joint health, or depends on motivation rather than habit — adjust now. Your future self will thank you.',
      practicalTask: {
        title: 'Training Career Retrospective',
        instructions: 'Map your training career to date: how many years have you trained? How many of those were consistent and structured? Where do you sit in the development stages? Based on this honest assessment, identify the three most important priorities for your next 12 months of training.',
        reflectionQuestions: [
          'Is your current programme appropriate for your actual training age?',
          'What mistakes from earlier in your training career would you correct if you could?',
          'What does your ideal training practice look like at age 50? 60? 70?',
        ],
      },
    },
  ],
};

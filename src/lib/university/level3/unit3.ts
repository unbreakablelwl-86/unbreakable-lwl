import { getUniversityImage } from '@/lib/university/imageMap';
import type { Unit } from '../types';

export const level3Unit3: Unit = {
  number: 3,
  title: 'Programme Design',
  description: 'Periodisation models, exercise selection and order, training splits, auto-regulation, weak point training, peaking and tapering, programming for different training ages, and building complete programmes.',
  chapters: [
    {
      number: 1,
      title: 'Periodisation Models',
      learningOutcome: 'Understand and compare the major periodisation models and their applications across different training goals.',
      assessmentCriteria: [
        'Define linear, undulating, block, and conjugate periodisation',
        'Explain the advantages and limitations of each model',
        'Select an appropriate periodisation model for a given training scenario',
      ],
      content: [
        {
          heading: 'What Is Periodisation?',
          paragraphs: [
            'Periodisation is the systematic planning of training across time. Rather than doing the same thing week after week, periodisation organises training into distinct phases — each with a specific focus — to manage fatigue, prevent plateaus, and optimise long-term progress.',
            'Without periodisation, you are relying on hope rather than strategy. You might make initial progress, but eventually the lack of structured variation leads to stagnation, overtraining, or injury.',
          ],
        },
        {
          heading: 'Linear Periodisation',
          paragraphs: [
            'Linear (or traditional) periodisation progresses from high volume and low intensity to low volume and high intensity over a macrocycle. A classic example is spending four weeks at 4 × 12, then four weeks at 4 × 8, then four weeks at 4 × 5, gradually increasing load as reps decrease.',
          ],
          bullets: [
            'Advantages — Simple to programme and follow. Clear progression path. Well-suited to beginners and those peaking for a specific event.',
            'Limitations — Only one quality is emphasised at a time. Gains in earlier phases (e.g., endurance) may detrain while focusing on later phases (e.g., strength).',
          ],
          imageUrl: getUniversityImage('l3-u3-ch1-linear-periodisation'),
          imageAlt: 'Staircase chart showing ascending load and descending reps across 12 weeks of linear periodisation',
        },
        {
          heading: 'Daily Undulating Periodisation (DUP)',
          paragraphs: [
            'DUP varies the training stimulus within a single week. For example, Monday might be a heavy day (4 × 5), Wednesday a moderate hypertrophy day (3 × 10), and Friday a light, higher-rep day (3 × 15). This provides frequent variation while training multiple qualities simultaneously.',
          ],
          bullets: [
            'Advantages — Trains multiple qualities concurrently. Greater variety reduces boredom. Research shows it can produce similar or superior results to linear periodisation for intermediate trainees.',
            'Limitations — More complex to programme. Requires careful management of fatigue across sessions.',
          ],
          imageUrl: getUniversityImage('l3-u3-ch1-periodisation-models'),
          imageAlt: 'Comparison chart showing linear periodisation vs daily undulating periodisation across a 12-week cycle',
        },
        {
          heading: 'Block Periodisation',
          paragraphs: [
            'Block periodisation concentrates training into focused 2–4 week blocks, each targeting a specific quality: accumulation (high volume for hypertrophy), transmutation (moderate volume for strength), and realisation (low volume for peaking/performance).',
          ],
          bullets: [
            'Advantages — Concentrated focus produces faster adaptation in the targeted quality. Efficient for advanced trainees with specific performance goals.',
            'Limitations — Non-targeted qualities may detrain during blocks that do not address them. Requires precise planning.',
          ],
          imageUrl: getUniversityImage('l3-u3-ch1-block-periodisation'),
          imageAlt: 'Three-block diagram showing Accumulation, Transmutation, and Realisation phases of block periodisation',
        },
        {
          heading: 'Conjugate Periodisation',
          paragraphs: [
            'Conjugate (concurrent) periodisation trains multiple qualities simultaneously by dedicating different sessions to different focuses. The Westside Barbell method is the most well-known example: maximum effort days for strength, dynamic effort days for speed, and repetition days for hypertrophy within the same week.',
            'This model is most commonly used by advanced powerlifters but the principles — varying the training stimulus within a week while maintaining multiple qualities — can be applied to any programme.',
          ],
          imageUrl: getUniversityImage('l3-u3-ch1-conjugate-method'),
          imageAlt: 'Three-pillar diagram showing Max Effort, Dynamic Effort, and Repetition methods of the conjugate system',
        },
        {
          heading: 'Choosing a Model',
          paragraphs: [
            'There is no universally "best" periodisation model. The choice depends on your training age, goals, and schedule. Beginners do well with linear progression. Intermediates benefit from DUP or simple block structures. Advanced trainees often need more sophisticated approaches like conjugate or hybrid models.',
          ],
        },
      ],
      unbreakableInsight: 'The best periodisation model is the one you understand well enough to actually follow. A simple plan executed consistently will always beat a complex plan abandoned after three weeks.',
      coachNote: 'For most recreational trainees, DUP with a volume ramp across mesocycles provides the best balance of simplicity, variety, and results. Save block and conjugate models for those with specific competitive goals.',
      practicalTask: {
        title: 'Periodisation Selection',
        instructions: 'Based on your current training level and goals, select the periodisation model that best fits your situation. Outline the first 4 weeks of a programme using that model.',
        reflectionQuestions: [
          'Which periodisation model have you been using (consciously or unconsciously)?',
          'What are the main limitations of your current approach?',
          'How would switching models change your weekly training structure?',
        ],
      },
    },
    {
      number: 2,
      title: 'Exercise Selection & Order',
      learningOutcome: 'Apply evidence-based principles to select exercises and sequence them within a session for optimal results.',
      assessmentCriteria: [
        'Explain the criteria for selecting exercises based on goals and individual factors',
        'Describe the principles of exercise sequencing within a session',
        'Design an exercise order for a session that maximises performance on priority movements',
      ],
      content: [
         {
          heading: 'Compound vs Isolation Exercises',
          paragraphs: [
            'Compound exercises involve multiple joints and muscle groups (squats, deadlifts, bench press, rows). Isolation exercises target a single muscle group through a single joint (bicep curls, leg extensions, lateral raises). Both have a role in a well-designed programme.',
          ],
          bullets: [
            'Compounds provide the greatest overall stimulus per exercise — they should form the foundation of any programme',
            'Isolation exercises allow targeted development of specific muscles that may be underserved by compounds',
            'A balance of both is ideal: compounds for overall development, isolations for targeted work',
          ],
          imageUrl: getUniversityImage('l3-u3-ch2-compound-vs-isolation'),
          imageAlt: 'Side-by-side comparison of compound and isolation exercises showing multi-joint vs single-joint muscle activation',
        },
        {
          heading: 'Exercise Selection Criteria',
          paragraphs: [
            'Not every exercise is appropriate for every person. Selection should be based on:',
          ],
          bullets: [
            'Goal alignment — Does this exercise target the muscle or movement pattern relevant to the goal?',
            'Individual anatomy — Limb lengths, joint health, and mobility affect which exercises are safe and effective for each person',
            'Stimulus-to-fatigue ratio — How much growth stimulus does the exercise provide relative to the systemic fatigue it creates? Leg press offers high quad stimulus with less spinal fatigue than squats.',
            'Equipment availability — The best exercise is one you can actually perform consistently with the equipment available',
            'Skill level — Complex movements (Olympic lifts, single-leg work) require technical proficiency before they are effective',
          ],
          imageUrl: getUniversityImage('l3-u3-ch2-exercise-selection'),
          imageAlt: 'Decision flowchart for exercise selection showing goal alignment, anatomy check, stimulus-to-fatigue ratio assessment, equipment check, and skill level evaluation',
        },
        {
          heading: 'Exercise Sequencing Principles',
          paragraphs: [
            'The order in which you perform exercises within a session significantly affects performance and results:',
          ],
          bullets: [
            'Priority principle — Place the exercises most important to your goals first in the session when you are freshest',
            'Compound before isolation — Perform multi-joint exercises before single-joint exercises in most cases',
            'High-skill before low-skill — Technical exercises (Olympic lifts, heavy compounds) should precede simpler movements',
            'Alternating muscle groups — If supersetting, pair non-competing muscle groups (e.g., chest with back) to maintain performance',
            'Fatigue management — Save high-fatigue exercises (Romanian deadlifts, walking lunges) for later in the session to avoid compromising earlier work',
          ],
        },
        {
          heading: 'The Stimulus-to-Fatigue Ratio',
          paragraphs: [
            'This concept deserves special attention. Two exercises may target the same muscle, but one might create significantly more systemic fatigue than the other. For example, a barbell row and a chest-supported dumbbell row both target the back, but the barbell row creates substantially more lower back and systemic fatigue.',
            'Choosing exercises with a favourable stimulus-to-fatigue ratio allows you to accumulate more effective training volume without exceeding your recovery capacity.',
          ],
          imageUrl: getUniversityImage('l3-u3-ch2-sfr-comparison'),
          imageAlt: 'Stimulus-to-fatigue ratio comparison between barbell row and chest-supported row showing fatigue differences',
        },
      ],
      unbreakableInsight: 'The "best" exercise is not the one that looks most impressive on social media. It is the one that gives your target muscle the most growth stimulus while taking the least out of you overall.',
      coachNote: 'When someone stalls on a compound lift, look at exercise order first. If they are squatting after 20 minutes of leg extensions and leg curls, fatigue — not weakness — is likely the issue.',
      practicalTask: {
        title: 'Session Sequencing Redesign',
        instructions: 'Take your current training session and re-order the exercises using the principles from this chapter. Explain your reasoning for each placement.',
        reflectionQuestions: [
          'Are your priority exercises placed first in the session?',
          'Are there any exercises with a poor stimulus-to-fatigue ratio that could be swapped?',
          'How does your current exercise order affect your performance on key lifts?',
        ],
      },
    },
    {
      number: 3,
      title: 'Training Splits',
      learningOutcome: 'Evaluate common training splits and select the most appropriate split based on training goals, experience, and schedule.',
      assessmentCriteria: [
        'Describe the structure of push/pull/legs, upper/lower, full body, and body part splits',
        'Compare the advantages and limitations of each split',
        'Match training splits to individual circumstances including frequency and recovery capacity',
      ],
      content: [
        {
          heading: 'What Is a Training Split?',
          paragraphs: [
            'A training split determines how you distribute your training across the week. It defines which muscle groups are trained on which days, how frequently each muscle is hit, and how total volume is distributed. The right split depends on your schedule, goals, training age, and recovery capacity.',
          ],
        },
        {
          heading: 'Full Body Training',
          paragraphs: [
            'Full body sessions train all major muscle groups in every session, typically performed 3 times per week.',
          ],
          bullets: [
            'Advantages — High frequency per muscle group (3×/week). Ideal for beginners. Efficient for those with limited training days. Research supports higher frequency for hypertrophy.',
            'Limitations — Sessions can be long. Fatigue from early exercises affects later ones. Harder to accumulate high volume per muscle group as you advance.',
          ],
          imageUrl: getUniversityImage('l3-u3-ch3-full-body-layout'),
          imageAlt: 'Weekly calendar showing 3-day full body training split with rest days and muscle frequency of 3x per week',
        },
        {
          heading: 'Upper/Lower Split',
          paragraphs: [
            'Alternates between upper body and lower body sessions, typically performed 4 days per week (2 upper, 2 lower).',
          ],
          bullets: [
            'Advantages — Good balance of frequency (2×/week per muscle) and volume. Manageable session lengths. Suitable for intermediates.',
            'Limitations — Lower body days can be demanding with squats, deadlifts, and accessories in one session. May need variation between the two upper and two lower sessions.',
          ],
          imageUrl: getUniversityImage('l3-u3-ch3-training-splits'),
          imageAlt: 'Weekly schedule comparison showing full body, upper/lower, PPL, and body part split with muscle group frequency indicated',
        },
        {
          heading: 'Push/Pull/Legs (PPL)',
          paragraphs: [
            'Divides training into pushing movements (chest, shoulders, triceps), pulling movements (back, biceps, rear delts), and leg exercises. Can be run as a 3-day or 6-day rotation.',
          ],
          bullets: [
            'Advantages — Logical grouping by movement pattern. Allows high volume per muscle group. 6-day PPL provides 2× frequency.',
            'Limitations — Requires 6 days per week for optimal frequency. 3-day PPL only hits each muscle once per week. Demanding recovery requirements.',
          ],
          imageUrl: getUniversityImage('l3-u3-ch3-ppl-layout'),
          imageAlt: '6-day Push/Pull/Legs rotation layout showing muscle groupings and 2x weekly frequency',
        },
        {
          heading: 'Body Part Split ("Bro Split")',
          paragraphs: [
            'Dedicates each session to one or two muscle groups (e.g., Monday: chest, Tuesday: back, Wednesday: shoulders, etc.). Typically 5 days per week.',
          ],
          bullets: [
            'Advantages — High volume per muscle in a single session. Simple to plan. Popular among bodybuilders.',
            'Limitations — Each muscle is only trained once per week, which research suggests is suboptimal for hypertrophy compared to 2× frequency. Long gap between stimuli.',
          ],
        },
        {
          heading: 'Choosing Your Split',
          paragraphs: [
            'The optimal split is one that allows you to train each muscle group at least twice per week, fits within your available schedule, and allows adequate recovery. For most people training 3–5 days per week, a full body, upper/lower, or PPL split will be most effective.',
          ],
        },
      ],
      unbreakableInsight: 'The best training split is the one you can actually stick to. A "perfect" 6-day PPL that you abandon after two weeks loses to an "imperfect" 3-day full body programme that you follow for a year.',
      coachNote: 'Match the split to the person\'s life, not the other way around. A new parent with unpredictable sleep is not going to thrive on a 6-day PPL. Give them a flexible 3-day full body plan they can adjust week by week.',
      practicalTask: {
        title: 'Split Assessment',
        instructions: 'Evaluate your current training split against the criteria in this chapter. Determine whether it is optimal for your goals and schedule, or whether a different split would serve you better.',
        reflectionQuestions: [
          'How many times per week does each muscle group get trained with your current split?',
          'Does your split fit your weekly schedule realistically?',
          'If you could only train 3 days per week, which split would you choose and why?',
        ],
      },
    },
    {
      number: 4,
      title: 'Auto-Regulation',
      learningOutcome: 'Understand and apply auto-regulation strategies to adjust training in real-time based on daily readiness.',
      assessmentCriteria: [
        'Explain the RPE and RIR scales and how they are used in practice',
        'Describe how auto-regulation differs from rigid percentage-based programming',
        'Apply auto-regulation to adjust sets, reps, or load within a session based on performance feedback',
      ],
      content: [
        {
          heading: 'Why Auto-Regulation Matters',
          paragraphs: [
            'Your performance varies day to day. Sleep quality, stress, nutrition, and cumulative fatigue all affect how much you can lift on any given session. Rigid percentage-based programmes do not account for this — they prescribe the same load regardless of how you are performing.',
            'Auto-regulation allows you to adjust training in real-time based on how you are actually performing that day. On good days, you do more. On bad days, you do less. The result is better long-term progress with lower injury risk.',
          ],
        },
        {
          heading: 'RPE — Rate of Perceived Exertion',
          paragraphs: [
            'The RPE scale (adapted from Borg\'s scale by powerlifter Mike Tuchscherer) rates the difficulty of a set from 1 to 10:',
          ],
          bullets: [
            'RPE 6 — Could have done 4 more reps. Very light effort.',
            'RPE 7 — Could have done 3 more reps. Warm-up intensity.',
            'RPE 8 — Could have done 2 more reps. Working weight, solid effort.',
            'RPE 9 — Could have done 1 more rep. Very challenging.',
            'RPE 10 — Maximum effort. Could not have done another rep (true failure).',
          ],
          imageUrl: getUniversityImage('l3-u3-ch4-rpe-scale'),
          imageAlt: 'RPE scale visual from 6 to 10 showing reps in reserve for each level with colour coding from green to red',
        },
        {
          heading: 'RIR — Reps in Reserve',
          paragraphs: [
            'RIR (Reps in Reserve) is closely related to RPE and is often easier for trainees to understand. Instead of rating effort, you estimate how many more reps you could have performed. RPE 8 = 2 RIR. RPE 9 = 1 RIR. RPE 10 = 0 RIR (failure).',
            'Research suggests that training at RPE 7–9 (1–3 RIR) for most working sets produces optimal hypertrophy results. Training to true failure on every set creates excessive fatigue without proportional benefit.',
          ],
          imageUrl: getUniversityImage('l3-u3-ch4-rir-scale'),
          imageAlt: 'RIR scale from 0 to 4 with corresponding RPE values and optimal training zone highlighted between RIR 1-3',
        },
        {
          heading: 'Applying Auto-Regulation',
          paragraphs: [
            'There are several ways to use auto-regulation in practice:',
          ],
          bullets: [
            'Load auto-regulation — Programme a target RPE instead of a fixed weight. "Work up to 3 × 6 at RPE 8" allows the load to vary based on daily performance.',
            'Volume auto-regulation — Perform sets until a performance threshold is crossed. "Continue sets of 8 until RPE reaches 9" adjusts volume to current capacity.',
            'Fatigue stops — Set a performance limit (e.g., "stop when rep speed noticeably drops or RPE exceeds 9"). This prevents junk volume.',
            'Back-off sets — After a top set, reduce the load by 10–15% and perform additional volume at a lower RPE.',
          ],
          imageUrl: getUniversityImage('l3-u3-ch4-autoregulation-flow'),
          imageAlt: 'Decision flowchart for auto-regulation showing readiness assessment leading to load adjustment paths',
        },
        {
          heading: 'Learning to Rate Accurately',
          paragraphs: [
            'RPE accuracy is a skill that improves with practice. Most beginners underestimate their effort (they think RPE 7 is actually RPE 9). Recording your RPE alongside actual performance over several weeks calibrates your perception.',
            'Video review is helpful — watching your sets back reveals bar speed and form cues that inform more accurate RPE ratings.',
          ],
        },
      ],
      unbreakableInsight: 'A programme that tells you to lift 100 kg regardless of whether you slept four hours or eight hours is not intelligent programming — it is a recipe printed on paper. Auto-regulation makes your programme responsive to your reality.',
      coachNote: 'Most people should train at RPE 7–8 for the majority of their working sets. Reserve RPE 9–10 for specific testing or peaking sessions. Consistency at RPE 8 produces better results than alternating between RPE 6 and RPE 10.',
      practicalTask: {
        title: 'RPE Calibration',
        instructions: 'For your next two training sessions, record the RPE for every working set alongside the weight and reps. Compare your ratings to your actual performance trends.',
        reflectionQuestions: [
          'How accurately can you currently rate your RPE?',
          'Are most of your sets at an appropriate intensity (RPE 7–9)?',
          'On a day when you feel underperforming, how would you adjust your session?',
        ],
      },
    },
    {
      number: 5,
      title: 'Weak Point Training',
      learningOutcome: 'Identify lagging muscle groups and design targeted strategies to address weaknesses within a balanced programme.',
      assessmentCriteria: [
        'Describe methods for identifying weak points in physique and performance',
        'Explain how exercise selection, volume allocation, and priority placement address weaknesses',
        'Design a training adjustment plan targeting an identified weakness',
      ],
      content: [
        {
          heading: 'Identifying Weak Points',
          paragraphs: [
            'A weak point is a muscle group or movement pattern that lags behind the rest of your development. This could be visible (a muscle that is noticeably smaller than surrounding muscles) or functional (a portion of a lift where you consistently fail).',
            'Honest self-assessment is critical. Most people focus on their strengths because they are more enjoyable to train. The muscles you avoid are usually the ones that need the most work.',
          ],
          bullets: [
            'Visual assessment — Progress photos from multiple angles reveal imbalances. Compare left to right, front to back, upper to lower.',
            'Strength ratios — Compare performance across opposing muscle groups. Significant imbalances (e.g., push far exceeding pull) suggest weak points.',
            'Sticking points — Where you fail in a lift often indicates the weakest link. Failing at the bottom of a squat suggests quad or glute weakness; failing at lockout suggests hip extension.',
            'Movement quality — Poor form during specific exercises may indicate weakness in stabilising muscles.',
          ],
          imageUrl: getUniversityImage('l3-u3-ch5-weak-points'),
          imageAlt: 'Body map diagram highlighting common weak points — rear delts, hamstrings, glutes, upper back — with typical imbalance patterns',
        },
        {
          heading: 'Strategies for Addressing Weak Points',
          paragraphs: [
            'Once identified, weak points can be addressed through several strategies:',
          ],
          bullets: [
            'Priority placement — Train the weak muscle first in the session when energy and focus are highest',
            'Volume allocation — Increase weekly sets for the lagging muscle while maintaining (or slightly reducing) volume for dominant muscles',
            'Exercise selection — Choose exercises that emphasise the weak point. If the upper chest is lagging, add incline pressing variations.',
            'Isolation work — Add direct isolation exercises for the weak muscle group',
            'Frequency increase — Train the weak muscle more frequently (e.g., 3× per week instead of 2×)',
          ],
          imageUrl: getUniversityImage('l3-u3-ch5-priority-strategies'),
          imageAlt: 'Five-pillar diagram showing weak point strategies: priority placement, volume increase, exercise selection, isolation work, and frequency boost',
        },
        {
          heading: 'Common Weak Points and Solutions',
          paragraphs: [
            'Certain muscle groups are commonly undertrained:',
          ],
          bullets: [
            'Rear deltoids — Often neglected in favour of front and lateral delts. Add face pulls, reverse flys, and rear delt rows.',
            'Hamstrings — Overshadowed by quad-dominant exercises. Add Romanian deadlifts, Nordic curls, and leg curls.',
            'Upper back — Insufficient rowing volume relative to pressing. Add a 2:1 ratio of pull to push volume.',
            'Glutes — Under-activated in many trainees. Add hip thrusts, glute bridges, and cable kickbacks with a mind-muscle focus.',
          ],
          imageUrl: getUniversityImage('l3-u3-ch5-common-fixes'),
          imageAlt: 'Table showing common weak points (rear delts, hamstrings, upper back, glutes) with specific exercise solutions',
        },
        {
          heading: 'Patience and Consistency',
          paragraphs: [
            'Addressing a weak point takes time. Expect a minimum of 8–12 weeks of targeted work before visible changes appear. Stay consistent with the approach and resist the temptation to revert to training what you enjoy most.',
          ],
        },
      ],
      unbreakableInsight: 'Your favourite exercises are rarely your weakest areas. If you spent half the time on your weaknesses that you spend on your strengths, you would not have any weaknesses.',
      coachNote: 'When addressing a weak point, reduce volume on the strongest muscle groups to make room in the programme. Adding volume for the weak point without removing anything else leads to overtraining.',
      practicalTask: {
        title: 'Weak Point Identification',
        instructions: 'Take progress photos from four angles. Compare your muscle development across all major groups. Identify your top two weak points and write a 4-week plan to address them.',
        reflectionQuestions: [
          'Which muscles do you tend to avoid training?',
          'Are there any lifts where you consistently fail at the same point?',
          'How would you reallocate volume to prioritise your weak points?',
        ],
      },
    },
    {
      number: 6,
      title: 'Peaking & Tapering',
      learningOutcome: 'Understand peaking and tapering strategies and how to programme training to reach peak performance for a specific date or event.',
      assessmentCriteria: [
        'Explain the physiological rationale behind tapering',
        'Describe different tapering protocols and their applications',
        'Design a 2–3 week peaking protocol for a strength or physique goal',
      ],
      content: [
        {
          heading: 'What Is Peaking?',
          paragraphs: [
            'Peaking is the process of manipulating training variables to reach your best possible performance on a specific date. Whether you are preparing for a powerlifting meet, a physique show, a fitness test, or simply want to test your maximal strength, peaking involves systematically reducing fatigue while maintaining fitness.',
            'The concept relies on the fitness-fatigue model: your observed performance at any given time is a product of your underlying fitness minus your accumulated fatigue. By reducing fatigue while maintaining fitness, performance rises to its peak.',
          ],
        },
        {
          heading: 'Tapering — Reducing Fatigue',
          paragraphs: [
            'A taper is the planned reduction in training load leading up to an event or test. The goal is to shed accumulated fatigue without losing the fitness you have built. Research consistently shows that well-executed tapers improve performance by 2–5%.',
          ],
          bullets: [
            'Reduce volume (sets and reps) by 40–60% over 1–3 weeks',
            'Maintain or slightly increase intensity (load). This preserves neuromuscular readiness.',
            'Maintain training frequency. Reducing sessions disrupts rhythm and can impair readiness.',
            'Prioritise sleep, nutrition, and stress management during the taper.',
          ],
          imageUrl: getUniversityImage('l3-u3-ch6-tapering'),
          imageAlt: 'Graph showing the fitness-fatigue model during a taper — fitness remains high while fatigue drops sharply and performance peaks',
        },
        {
          heading: 'Types of Taper',
          paragraphs: [
            'Different tapering approaches suit different situations:',
          ],
          bullets: [
            'Linear taper — Volume decreases steadily each week. Simple and effective for most scenarios.',
            'Step taper — Volume drops sharply at the start of the taper and remains low. Best for short tapers (1 week).',
            'Exponential taper — Volume decreases rapidly at first, then more gradually. Often considered optimal for endurance events.',
          ],
          imageUrl: getUniversityImage('l3-u3-ch6-taper-types'),
          imageAlt: 'Three-line graph comparing linear, step, and exponential taper types showing volume reduction over 3 weeks',
        },
        {
          heading: 'Peaking for Strength',
          paragraphs: [
            'For strength peaking (e.g., testing 1RM or competing in powerlifting), the final two weeks should feature reduced volume with heavy singles, doubles, or triples at 90–95% of projected maxes. The final 3–5 days before the event should involve very light movement or complete rest.',
            'Practice the competition movements at the expected loads during the taper. This is not the time to introduce new exercises or techniques.',
          ],
          imageUrl: getUniversityImage('l3-u3-ch6-strength-peak'),
          imageAlt: 'Timeline showing the final 2-week strength peaking protocol with decreasing volume bars leading to competition day',
        },
        {
          heading: 'Common Peaking Mistakes',
          paragraphs: [
            'The most common mistake is trying to "squeeze in" extra training during the taper because anxiety says you have not done enough. Trust the process — the fitness is already built. The taper is about revealing it, not building more.',
          ],
        },
      ],
      unbreakableInsight: 'You cannot cram for a peak. The fitness was built over months of consistent training. The taper is the final reveal — not the final effort. Trust what you have done and rest.',
      coachNote: 'Most people taper too little, not too much. If someone feels "too fresh" during a taper, that is a good sign — it means fatigue is dissipating. Resist the urge to add training back in.',
      practicalTask: {
        title: 'Taper Design',
        instructions: 'Choose a lift or performance marker you want to peak. Design a 3-week taper leading up to the test, specifying volume, intensity, and frequency for each week.',
        reflectionQuestions: [
          'Have you ever peaked for a specific date? What went well or poorly?',
          'How would your training change in the final week before a 1RM test?',
          'What non-training factors (sleep, nutrition, stress) would you manage during a taper?',
        ],
      },
    },
    {
      number: 7,
      title: 'Programming for Different Training Ages',
      learningOutcome: 'Understand how training programme design should differ based on training experience and adaptation potential.',
      assessmentCriteria: [
        'Define beginner, intermediate, and advanced training ages and their characteristics',
        'Explain how programme complexity should scale with training experience',
        'Design appropriate programme frameworks for each training age',
      ],
      content: [
        {
          heading: 'What Is Training Age?',
          paragraphs: [
            'Training age is not how old you are — it is how long you have been training effectively and consistently. Someone who has been going to the gym for five years but spent most of that time without progression has a lower training age than someone who has trained intelligently for two years.',
            'Training age determines your rate of adaptation, your recovery capacity, and the complexity of programming required to continue making progress.',
          ],
        },
        {
          heading: 'Beginner (0–12 Months of Consistent Training)',
          paragraphs: [
            'Beginners adapt rapidly to almost any reasonable stimulus. Neural adaptations dominate early progress, allowing strength to increase session to session.',
          ],
          bullets: [
            'Programme needs — Simple, compound-focused, full body 3× per week. Linear progression (add weight each session).',
            'Volume — Low to moderate (10–14 sets per muscle group per week).',
            'Complexity — Minimal. Master basic movement patterns. No need for advanced techniques.',
            'Key focus — Learning technique, building consistency, establishing the training habit.',
          ],
          imageUrl: getUniversityImage('l3-u3-ch7-progression-curves'),
          imageAlt: 'Progression curve diagram showing beginner, intermediate, and advanced training ages with diminishing rate of progress',
        },
        {
          heading: 'Intermediate (1–3 Years of Consistent Training)',
          paragraphs: [
            'Intermediates have exhausted the rapid neural adaptations of the beginner phase. Progress is slower and requires more deliberate programming.',
          ],
          bullets: [
            'Programme needs — Structured periodisation (DUP or simple block). Weekly or bi-weekly progression rather than session to session.',
            'Volume — Moderate to high (14–20 sets per muscle group per week).',
            'Complexity — Moderate. Introduction of varied rep ranges, auto-regulation (RPE/RIR), and basic advanced techniques.',
            'Key focus — Building muscle, refining technique, learning to manage fatigue and recovery.',
          ],
          imageUrl: getUniversityImage('l3-u3-ch7-intermediate-framework'),
          imageAlt: 'Intermediate programme framework showing 4-week mesocycle with DUP and progressive volume ramp plus deload',
        },
        {
          heading: 'Advanced (3+ Years of Consistent, Well-Programmed Training)',
          paragraphs: [
            'Advanced trainees make very slow progress and require sophisticated programming to continue adapting. Each additional kilogram of muscle or strength is hard-won.',
          ],
          bullets: [
            'Programme needs — Formal periodisation with planned mesocycles, deloads, and possibly competitive peaking.',
            'Volume — High and carefully managed (16–24+ sets per muscle group per week, approaching individual MRV).',
            'Complexity — High. Advanced techniques, auto-regulation, weak point specialisation, and frequent programme adjustments.',
            'Key focus — Incremental progress, injury prevention, long-term planning, and sustainability.',
          ],
          imageUrl: getUniversityImage('l3-u3-ch7-advanced-framework'),
          imageAlt: 'Layered diagram showing advanced programme complexity with macrocycle, mesocycle, and microcycle layers',
        },
        {
          heading: 'Matching Programme to Training Age',
          paragraphs: [
            'The biggest programming mistake is mismatching complexity to training age. A beginner following an advanced programme wastes time on unnecessary complexity. An advanced trainee following a beginner programme fails to provide sufficient stimulus. Honest assessment of your training age is the starting point for effective programming.',
          ],
        },
      ],
      unbreakableInsight: 'Your training age is not measured by the calendar — it is measured by the quality and consistency of your training. Five years of mediocre effort does not make you advanced. Two years of intelligent, progressive training might.',
      coachNote: 'Most people overestimate their training age. If someone cannot squat 1.5× body weight, bench 1× body weight, and deadlift 2× body weight (as rough male benchmarks), they are likely still intermediate regardless of time spent in the gym.',
      practicalTask: {
        title: 'Training Age Assessment',
        instructions: 'Honestly assess your training age based on consistent, progressive training — not just time since you first joined a gym. Identify which programming framework best matches your current level.',
        reflectionQuestions: [
          'How many years of genuinely consistent, progressive training have you completed?',
          'Does your current programme complexity match your training age?',
          'What changes would you make if you were honest about your training level?',
        ],
      },
    },
    {
      number: 8,
      title: 'Putting It All Together',
      learningOutcome: 'Integrate all programme design principles to build a complete, periodised training programme from scratch.',
      assessmentCriteria: [
        'Demonstrate the ability to combine periodisation, exercise selection, volume management, and auto-regulation into a cohesive programme',
        'Design a complete 12-week programme for a specific goal',
        'Justify all programming decisions with evidence-based reasoning',
      ],
      content: [
        {
          heading: 'The Programme Design Process',
          paragraphs: [
            'Building a programme from scratch requires integrating everything covered in this unit. The process follows a logical sequence: define the goal, assess the individual, select the framework, then fill in the details.',
          ],
          bullets: [
            'Step 1 — Define the primary goal (hypertrophy, strength, fat loss, performance)',
            'Step 2 — Assess the individual (training age, schedule, equipment, injury history)',
            'Step 3 — Choose the training split and periodisation model',
            'Step 4 — Select exercises based on goal alignment and stimulus-to-fatigue ratio',
            'Step 5 — Set volume, intensity, and progression targets',
            'Step 6 — Build in auto-regulation, deloads, and recovery management',
            'Step 7 — Review, execute, and adjust based on feedback',
          ],
          imageUrl: getUniversityImage('l3-u3-ch8-design-process'),
          imageAlt: '7-step sequential flowchart of the programme design process from goal definition to review and adjustment',
        },
        {
          heading: 'Example: 12-Week Hypertrophy Programme',
          paragraphs: [
            'Goal: Hypertrophy for an intermediate trainee training 4 days per week.',
          ],
          bullets: [
            'Split: Upper/Lower, 4 days per week (U/L/rest/U/L/rest/rest)',
            'Periodisation: Volume ramp with DUP elements (heavier/lighter upper and lower days)',
            'Weeks 1–4 (Accumulation): Moderate volume (12–16 sets/muscle/week), RPE 7–8, focus on technique and progressive overload',
            'Weeks 5–8 (Intensification): Increased volume (16–20 sets/muscle/week), RPE 8–9, introduction of advanced techniques on final sets',
            'Week 9 (Deload): Volume reduced by 50%, load maintained, RPE 6–7',
            'Weeks 10–12 (Peak block): High volume with heavy emphasis, RPE 8–9, testing PRs in week 12',
          ],
          imageUrl: getUniversityImage('l3-u3-ch8-programme-layout'),
          imageAlt: 'Gantt chart style diagram showing a 12-week programme layout with accumulation, intensification, deload, and peak blocks',
        },
        {
          heading: 'Exercise Selection for the Example',
          paragraphs: [
            'Upper Day A (Heavy): Barbell bench press 4 × 6, barbell row 4 × 6, overhead press 3 × 8, chin-ups 3 × 8, lateral raises 3 × 15, face pulls 3 × 15.',
            'Upper Day B (Volume): Dumbbell incline press 3 × 10, cable row 3 × 10, dumbbell shoulder press 3 × 12, lat pulldown 3 × 12, bicep curls 3 × 12, tricep pushdowns 3 × 12.',
            'Lower Day A (Heavy): Back squat 4 × 6, Romanian deadlift 3 × 8, leg press 3 × 10, leg curl 3 × 10, calf raises 4 × 12.',
            'Lower Day B (Volume): Front squat 3 × 10, hip thrust 3 × 10, walking lunge 3 × 12, leg extension 3 × 12, seated calf raise 4 × 15.',
          ],
        },
        {
          heading: 'Review and Adjustment',
          paragraphs: [
            'No programme survives first contact with reality without some adjustment. After each mesocycle, review performance data: did lifts progress? Was recovery adequate? Were any exercises causing joint issues? Use this feedback to refine the next block.',
            'The mark of good programming is not perfection on paper — it is the ability to adjust intelligently when things do not go exactly as planned.',
          ],
          imageUrl: getUniversityImage('l3-u3-ch8-review-cycle'),
          imageAlt: 'Circular feedback loop showing Execute, Measure, Evaluate, and Adjust stages of continuous programme improvement',
        },
      ],
      unbreakableInsight: 'A programme is a plan, not a contract. The best coaches and lifters adjust based on feedback. Rigidly following a failing plan is not discipline — it is stubbornness.',
      coachNote: 'When designing programmes for others (or yourself), document the reasoning behind each decision. "Why this exercise? Why this volume? Why this split?" If you cannot justify a choice, it probably should not be there.',
      practicalTask: {
        title: 'Build Your 12-Week Programme',
        instructions: 'Using everything from this unit, design a complete 12-week training programme for your current goal. Include the split, periodisation model, exercise selection, volume targets, progression plan, and deload scheduling.',
        reflectionQuestions: [
          'Can you justify every exercise selection in your programme?',
          'Does your volume ramp appropriately across the mesocycle?',
          'How will you know if the programme is working or needs adjustment?',
        ],
      },
    },
  ],
};

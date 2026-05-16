import type { Unit } from '../types';

export const level4Unit3: Unit = {
  number: 3,
  title: 'Sport-Specific Strength & Conditioning',
  description: 'Apply strength and conditioning principles to sport performance — including needs analysis, speed development, plyometrics, and in-season programming.',
  chapters: [
    {
      number: 1,
      title: 'Needs Analysis for Sport',
      learningOutcome: 'Conduct a needs analysis for any sport, identifying the dominant energy systems, movement patterns, and physical qualities required for performance.',
      assessmentCriteria: [
        'Describe the components of a sport-specific needs analysis',
        'Identify the dominant energy systems in different sports',
        'Explain how needs analysis informs training programme design',
      ],
      content: [
        {
          heading: 'What Is a Needs Analysis?',
          paragraphs: [
            'A needs analysis is a systematic assessment of the physical demands of a sport and the individual athlete\'s strengths and weaknesses relative to those demands. It answers two fundamental questions: "What does this sport require?" and "Where does this athlete fall short?"',
            'Without a needs analysis, training becomes generic — the footballer trains like a powerlifter, the boxer does bodybuilding, and the rugby player follows a marathon running programme. Specificity matters, and a needs analysis ensures that every hour of training contributes directly to sport performance.',
          ],
        },
        {
          heading: 'Components of Analysis',
          bullets: [
            'Movement patterns — What movements dominate the sport? Sprinting, jumping, cutting, throwing, grappling? These determine exercise selection',
            'Energy systems — Is the sport predominantly aerobic (marathon), anaerobic alactic (100m sprint), or anaerobic lactic (400m)? Most team sports are intermittent: repeated high-intensity efforts with incomplete recovery',
            'Muscle groups and actions — Which muscles are primary movers? What types of contraction dominate (concentric, eccentric, isometric)?',
            'Common injury sites — What are the most frequent injuries in the sport? This informs prehabilitation priorities',
            'Positional demands — In team sports, different positions have different physical demands. A goalkeeper and a midfielder have very different needs analyses',
          ],
        },
        {
          heading: 'From Analysis to Programme',
          paragraphs: [
            'Once the demands are mapped, compare them to the athlete\'s current abilities through testing: speed tests, strength assessments, endurance benchmarks, and movement quality screens. The gap between sport demands and athlete abilities defines training priorities.',
            'A centre-back in football with excellent endurance but poor acceleration needs sprint training and lower-body power work, not more running. A boxer with explosive power but poor gas tank needs energy system development. The needs analysis prevents the common mistake of training what athletes are already good at while neglecting what they actually need.',
          ],
        },
      ],
      unbreakableInsight: 'Training hard is easy. Training smart is hard. A needs analysis ensures every session moves you toward performance, not just fatigue. The question is never "did I work hard?" — it is "did I work on the right things?"',
      coachNote: 'Before writing a single programme, spend time watching the sport. Attend matches, watch footage, and talk to coaches and athletes. The best needs analysis comes from deep understanding of the sport, not from textbooks alone.',
      practicalTask: {
        title: 'Sport Needs Analysis',
        instructions: 'Choose a sport you participate in or coach. Conduct a full needs analysis: dominant energy systems, primary movement patterns, key muscle groups, common injuries, and positional differences (if applicable). Then identify the three most important physical qualities for that sport.',
        reflectionQuestions: [
          'Does your current training address the dominant energy system of your sport?',
          'Are there physical qualities critical to your sport that you are not currently training?',
          'How would your programme change based on this needs analysis?',
        ],
      },
    },
    {
      number: 2,
      title: 'Speed & Power Development',
      learningOutcome: 'Understand the physiology of speed production and apply training methods that develop acceleration, maximum velocity, and rate of force development.',
      assessmentCriteria: [
        'Explain the physiological basis of speed and power production',
        'Describe the difference between acceleration and maximum velocity training',
        'Design a speed development session for a field sport athlete',
      ],
      content: [
        {
          heading: 'The Physics of Speed',
          paragraphs: [
            'Speed is the product of stride length and stride frequency. Improving either (without decreasing the other) makes you faster. However, the primary determinant of speed is force production — specifically, how much force you can apply to the ground in the brief contact time available during each stride.',
            'This is why stronger athletes tend to be faster, and why maximal strength training improves sprint performance even without sprint-specific practice. A stronger athlete applies more force per ground contact, which increases stride length and acceleration. The transfer from gym to track is direct and well-established in research.',
          ],
        },
        {
          heading: 'Acceleration vs Maximum Velocity',
          paragraphs: [
            'Acceleration (0–30 metres) and maximum velocity (30+ metres) are distinct physical qualities with different biomechanics and training methods. Most field sport athletes rarely reach maximum velocity during competition — the majority of sprints are short bursts of acceleration from a standing or jogging start.',
          ],
          bullets: [
            'Acceleration — Forward body lean, powerful hip extension, strong push-back into the ground. Trained through resisted sprints (sled pulls, hill sprints), short sprints from various starts, and heavy hip-dominant strength work (trap bar deadlift, hip thrust)',
            'Maximum velocity — Upright posture, high knee drive, elastic ground contacts. Trained through flying sprints (build-up then full speed), wicket runs for stride mechanics, and plyometric training for reactive strength',
            'Deceleration — Often overlooked but critical for injury prevention and sport performance. The ability to stop and change direction safely requires eccentric strength and neuromuscular control. Trained through progressive deceleration drills and eccentric-focused strength work',
          ],
        },
        {
          heading: 'Rate of Force Development',
          paragraphs: [
            'In sport, you rarely have time to produce maximal force — ground contacts during sprinting last 80–120 milliseconds, while maximal force production takes 300+ milliseconds. Rate of force development (RFD) — how quickly you can reach peak force — is therefore more important than absolute maximal strength for most sport applications.',
            'RFD is improved through explosive training methods: Olympic lift derivatives (power clean, hang clean), ballistic exercises (jump squats, bench throws), plyometrics, and maximal intent lifting (moving submaximal weights as fast as possible). The intent to move quickly is as important as the actual movement speed.',
          ],
        },
      ],
      unbreakableInsight: 'Speed is a skill built on a foundation of strength. You cannot be fast if you are weak. But you also cannot be fast if you only train slowly. Train both the engine (strength) and the transmission (speed).',
      coachNote: 'Sprint training requires full recovery between efforts — 3–5 minutes minimum between maximal sprints. If athletes are running sprints on short rest, they are training conditioning, not speed. These are different goals and should not be confused.',
      practicalTask: {
        title: 'Speed Session Design',
        instructions: 'Design a speed development session for a field sport athlete: warm-up, acceleration work (4–6 short sprints), maximum velocity work (2–4 flying sprints), and a speed-strength exercise. Include rest periods and total session time.',
        reflectionQuestions: [
          'Are the rest periods long enough for genuine speed development?',
          'How would you measure whether sprint performance is improving over time?',
          'What gym exercises would best complement this speed session?',
        ],
      },
    },
    {
      number: 3,
      title: 'Agility & Change of Direction',
      learningOutcome: 'Distinguish between agility and change of direction speed, and apply training methods that develop both physical and perceptual components of agility.',
      assessmentCriteria: [
        'Differentiate between agility and pre-planned change of direction',
        'Explain the role of perception and decision-making in agility',
        'Design agility training drills that incorporate reactive components',
      ],
      content: [
        {
          heading: 'Change of Direction vs Agility',
          paragraphs: [
            'Change of direction speed (CODS) and agility are often used interchangeably, but they describe different qualities. CODS is the physical ability to decelerate, change direction, and re-accelerate — it is pre-planned and predictable. Agility adds a perceptual and decision-making component: reading a stimulus (opponent, ball, teammate) and responding with the appropriate movement.',
            'Training CODS without the perceptual component produces athletes who are fast through cones but slow to react in game situations. True agility requires integrating physical movement with visual scanning, pattern recognition, and rapid decision-making under pressure.',
          ],
        },
        {
          heading: 'Physical Components of Direction Change',
          bullets: [
            'Eccentric braking strength — The ability to decelerate quickly is the most important physical quality for direction change. Trained through eccentric squats, deceleration drills, and landing mechanics',
            'Lateral force production — Pushing off sideways requires strong hip abductors and adductors. Lateral sled drags, Cossack squats, and lateral bounds develop this quality',
            'Ankle stiffness — Rapid direction changes require a stiff ankle joint that can transmit force efficiently. Ankle hops, drop landings, and skipping drills improve ankle stiffness',
            'Low centre of gravity — The ability to lower your centre of mass during direction changes improves stability and force application. Practised through lateral shuffle progressions and defensive slides',
          ],
        },
        {
          heading: 'Reactive Agility Training',
          paragraphs: [
            'To develop true agility, drills must include an unpredictable stimulus that requires the athlete to read and react. A coach pointing left or right, a light board signalling direction, a mirror drill following a partner, or small-sided games with defensive pressure all force the athlete to combine perception with movement.',
            'Research shows that elite athletes are not significantly faster in pre-planned CODS tests — but they are dramatically faster in reactive agility tests. The difference is perceptual speed: they read cues earlier, process information faster, and initiate movement sooner. This is a trainable skill that improves with practice and sport-specific exposure.',
          ],
        },
      ],
      unbreakableInsight: 'The fastest athlete in a straight line is not always the fastest on the field. Sport is chaotic. The ability to read, react, and change direction under pressure separates good athletes from great ones.',
      coachNote: 'Stop running athletes through pre-planned cone drills and calling it agility training. Add a reactive element — even something as simple as calling "left" or "right" at random — and the training effect changes dramatically.',
      practicalTask: {
        title: 'Agility Session Design',
        instructions: 'Design a 20-minute agility session that includes: a pre-planned CODS drill (for physical development), a reactive agility drill (with an unpredictable stimulus), and a small-sided game that demands agility under sport-specific pressure.',
        reflectionQuestions: [
          'How does adding a reactive component change the difficulty of a drill?',
          'What perceptual cues are most relevant to your sport?',
          'How would you progress these drills over a 6-week training block?',
        ],
      },
    },
    {
      number: 4,
      title: 'Endurance Training Integration',
      learningOutcome: 'Understand how to develop sport-specific endurance without compromising strength and power adaptations.',
      assessmentCriteria: [
        'Explain the interference effect between concurrent strength and endurance training',
        'Describe different endurance training methods and their application to sport',
        'Design a weekly programme that develops endurance without compromising strength',
      ],
      content: [
        {
          heading: 'The Interference Effect',
          paragraphs: [
            'The interference effect (also called the concurrent training effect) describes the phenomenon where simultaneous strength and endurance training produces inferior adaptations in one or both qualities compared to training either alone. At the molecular level, the signalling pathways for muscle growth (mTOR) and mitochondrial biogenesis (AMPK) partially inhibit each other.',
            'However, the interference effect is not absolute — it depends on training volume, modality, sequencing, and the athlete\'s training status. Most field sport athletes can develop both strength and endurance simultaneously with intelligent programming. The key is managing volume and sequencing to minimise molecular conflict.',
          ],
        },
        {
          heading: 'Endurance Methods for Field Sports',
          bullets: [
            'Cardiac output training — Low-intensity steady state (120–150 bpm) for 30–60 minutes. Develops the aerobic base: left ventricular volume, capillary density, mitochondrial function. Essential foundation that supports recovery between high-intensity efforts',
            'Threshold training — Sustained efforts at lactate threshold (tempo runs, threshold intervals). Improves the intensity at which lactate accumulates, allowing harder sustained efforts',
            'High-intensity interval training (HIIT) — Repeated bouts of near-maximal effort with incomplete recovery (e.g., 30-second sprints with 30-second rest). Develops both aerobic and anaerobic capacity. Most sport-specific for intermittent sports',
            'Repeated sprint ability (RSA) — Maximal sprints with short recovery (e.g., 6×30m with 20-second rest). Trains the ability to reproduce high-quality sprints with minimal recovery — a direct simulation of match demands in team sports',
          ],
        },
        {
          heading: 'Programming Concurrent Training',
          paragraphs: [
            'To minimise interference: separate strength and endurance sessions by at least 6 hours (or train on different days). Prioritise the quality you most need to develop by training it first when fresh. Avoid high-volume running immediately before or after lower-body strength work. Use cycling or rowing for aerobic development when possible — lower eccentric stress means less interference with strength adaptations.',
            'Monitor total training load across all modalities. A common mistake is programming strength training and endurance training independently, resulting in a combined workload that exceeds recovery capacity. Both the strength coach and endurance coach (or both aspects of your own programming) must communicate.',
          ],
        },
      ],
      unbreakableInsight: 'You can be strong and fit — you just cannot train for both simultaneously without intelligence. Brute-force approaches to concurrent training produce mediocre results in both. Strategic approaches produce excellent results in both.',
      coachNote: 'If an athlete is losing strength despite consistent training, check their endurance training volume first. Excessive running volume — particularly high-mileage steady state — is the most common reason field sport athletes struggle to maintain or build strength.',
      practicalTask: {
        title: 'Concurrent Training Week',
        instructions: 'Design a one-week programme for a field sport athlete that includes three strength sessions and three endurance sessions. Show how you would sequence them to minimise interference. Include the endurance method used for each session.',
        reflectionQuestions: [
          'How did you sequence strength and endurance sessions to minimise interference?',
          'What endurance methods did you choose and why?',
          'How would you monitor whether the combined load is manageable?',
        ],
      },
    },
    {
      number: 5,
      title: 'Plyometrics & Reactive Strength',
      learningOutcome: 'Understand the stretch-shortening cycle and apply plyometric training methods to develop reactive strength and elastic power.',
      assessmentCriteria: [
        'Explain the stretch-shortening cycle and its role in explosive movement',
        'Describe the progression from low-intensity to high-intensity plyometrics',
        'Identify contraindications and prerequisites for plyometric training',
      ],
      content: [
        {
          heading: 'The Stretch-Shortening Cycle',
          paragraphs: [
            'The stretch-shortening cycle (SSC) is the mechanism by which muscles produce more force during a concentric contraction when preceded by a rapid eccentric contraction. When you jump, your muscles and tendons stretch during the downward phase (eccentric), store elastic energy like a spring, and then release that energy during the upward phase (concentric) — producing more force than a concentric-only contraction could achieve.',
            'Plyometric training specifically targets the SSC to improve reactive strength — the ability to rapidly absorb and re-apply force. This quality is essential for sprinting, jumping, cutting, and any movement that involves rapid ground contacts. A strong muscle that cannot cycle quickly through the SSC is powerful but slow.',
          ],
        },
        {
          heading: 'Plyometric Progression',
          bullets: [
            'Level 1 — Landing mechanics. Drop landings, box step-offs, and jump-and-stick drills. Focus on absorbing force safely with proper knee and hip alignment. Master these before progressing',
            'Level 2 — Low-intensity jumps. Squat jumps, countermovement jumps, broad jumps. Focus on maximal jump height or distance with full recovery between reps. 2–3 sets of 3–5 reps',
            'Level 3 — Moderate-intensity bounds. Alternate leg bounds, lateral bounds, box jump variations. Ground contacts are faster and elastic. 3–4 sets of 4–6 reps',
            'Level 4 — High-intensity depth jumps. Drop from a box (30–75cm), land, and immediately jump maximally. The gold standard for reactive strength development. Only for athletes with a solid strength base (1.5× bodyweight squat minimum). 3–5 sets of 3–5 reps with full recovery',
            'Level 5 — Sport-specific reactive drills. Single-leg hops for distance, repeated hurdle jumps, approach jumps. Integrate plyometric qualities into sport-relevant movement patterns',
          ],
        },
        {
          heading: 'Programming Plyometrics',
          paragraphs: [
            'Plyometric training demands quality over quantity. Ground contacts should be fast, powerful, and technically sound. Once form deteriorates or ground contact time increases, the set is over. Total foot contacts per session should be managed: beginners 40–60, intermediate 80–100, advanced 120–140.',
            'Schedule plyometrics early in the session when the nervous system is fresh, ideally before strength training. Allow 48–72 hours between plyometric sessions for tendon recovery. Never programme heavy plyometrics immediately after high-volume lower body strength work — the combination dramatically increases injury risk.',
          ],
        },
      ],
      unbreakableInsight: 'Plyometrics are not about jumping more — they are about jumping better. A single perfectly executed depth jump develops more reactive strength than twenty sloppy box jumps. Quality of ground contact is everything.',
      coachNote: 'Listen to the sound of ground contacts. Quick, sharp contacts (like a basketball bouncing) indicate good reactive strength. Slow, heavy contacts (like a sack of sand) indicate the athlete needs more time at lower plyometric levels before progressing.',
      practicalTask: {
        title: 'Plyometric Assessment & Session',
        instructions: 'Assess your current plyometric readiness: can you perform a drop landing from 30cm with stable, controlled absorption? Can you perform 5 consecutive countermovement jumps with consistent height? Based on your assessment, design a plyometric session appropriate for your level.',
        reflectionQuestions: [
          'What level of the plyometric progression are you currently at?',
          'How would you measure improvement in reactive strength over time?',
          'What is the minimum strength base you would recommend before adding depth jumps?',
        ],
      },
    },
    {
      number: 6,
      title: 'Sport-Specific Programme Design',
      learningOutcome: 'Design a complete strength and conditioning programme for a specific sport, integrating all physical qualities within a structured training plan.',
      assessmentCriteria: [
        'Apply needs analysis findings to exercise selection and training priorities',
        'Balance strength, speed, power, endurance, and mobility within a weekly structure',
        'Design a programme that accounts for sport practice and competition schedule',
      ],
      content: [
        {
          heading: 'From Qualities to Sessions',
          paragraphs: [
            'Effective sport-specific programming integrates multiple physical qualities into a coherent weekly structure that complements — not competes with — sport practice and competition. The programme must develop the qualities identified in the needs analysis while respecting the total training load the athlete can recover from.',
            'The fundamental principle is: train what you need most, maintain what you have enough of, and never let gym training interfere with sport practice quality. The gym supports the field — not the other way around.',
          ],
        },
        {
          heading: 'Weekly Template for Field Sports',
          bullets: [
            'Day 1 (Post-match +1) — Active recovery. Light movement, mobility work, or complete rest depending on match intensity',
            'Day 2 (Post-match +2) — Speed and power session. Sprint work, plyometrics, and explosive lifts while nervous system has recovered. Lower body strength (moderate volume)',
            'Day 3 (Post-match +3) — Upper body strength. Heavy pressing and pulling. Can combine with conditioning if needed',
            'Day 4 (Pre-match -3) — Lower body strength (heavier). Last heavy session before match day. Emphasise main lifts with low accessory volume',
            'Day 5 (Pre-match -2) — Sport practice. Tactical work. Any gym work is minimal (maintenance only)',
            'Day 6 (Pre-match -1) — Light movement or rest. Activation drills if desired. No fatigue-inducing work',
            'Day 7 — Match day',
          ],
        },
        {
          heading: 'Exercise Selection Principles',
          paragraphs: [
            'Select exercises that develop the qualities your needs analysis identified as priorities. Use compound, multi-joint movements as the foundation — they transfer to sport better than isolation exercises. Include unilateral work to develop single-leg strength and address asymmetries. Programme exercises in the order of neurological demand: speed work → power work → strength work → hypertrophy/conditioning.',
            'Avoid exercise variety for its own sake. A small number of well-chosen exercises progressed consistently over months will produce more sport-specific adaptation than constantly rotating through novel exercises. Your athletes need to get strong at specific patterns, not experienced at many.',
          ],
        },
      ],
      unbreakableInsight: 'The best S&C programme is invisible to the athlete on match day — their body just works better, moves faster, and lasts longer. If your gym training is making athletes tired for practice, the programme has failed.',
      coachNote: 'Always ask: "Is this session making the athlete better at their sport, or just more tired?" If the answer is "more tired," reduce the volume or change the timing. Fatigue is not a training outcome — it is a cost.',
      practicalTask: {
        title: 'Full Programme Design',
        instructions: 'Choose a sport. Conduct a brief needs analysis, then design a complete 4-week programme that includes all training sessions (gym, speed, conditioning, plyometrics) alongside sport practice. Show how the programme fits around a weekly competition schedule.',
        reflectionQuestions: [
          'How does the gym programme complement rather than compete with sport practice?',
          'Are you training the right qualities based on your needs analysis?',
          'How would you adjust the programme during a congested fixture period?',
        ],
      },
    },
    {
      number: 7,
      title: 'In-Season vs Off-Season Training',
      learningOutcome: 'Understand how to adjust training priorities, volume, and intensity across the competitive season to maintain fitness while managing fatigue.',
      assessmentCriteria: [
        'Describe the key differences between in-season and off-season training objectives',
        'Explain how to maintain strength and power during a competitive season',
        'Discuss strategies for managing cumulative fatigue across a long season',
      ],
      content: [
        {
          heading: 'The Annual Training Plan',
          paragraphs: [
            'A competitive season creates a fundamental tension: the demands of competition and sport practice leave less time and recovery capacity for physical development, yet physical qualities must be maintained (or improved) across months of competition. The solution is seasonal periodisation — adjusting training priorities, volume, and intensity based on the phase of the year.',
            'The annual plan typically divides into three phases: off-season (development), pre-season (transition), and in-season (maintenance and performance). Each phase has different priorities, and failing to adjust between phases is one of the most common programming errors in sport.',
          ],
        },
        {
          heading: 'Off-Season: Build',
          bullets: [
            'Duration — 8–16 weeks depending on sport',
            'Priority — Physical development. This is when you build muscle, increase maximal strength, improve aerobic base, and address weaknesses identified during the previous season',
            'Volume — Highest of the year. 4–5 gym sessions per week with progressive overload',
            'Intensity — Moderate to high. Focus on accumulating training volume and building work capacity',
            'Sport practice — Reduced or absent. Skills maintenance only',
          ],
        },
        {
          heading: 'In-Season: Maintain and Perform',
          bullets: [
            'Duration — Length of competitive season',
            'Priority — Performance and recovery. Maintain physical qualities developed in the off-season while managing fatigue from competition and practice',
            'Volume — Reduced by 40–60% from off-season. 2–3 gym sessions per week, often shorter sessions',
            'Intensity — Maintain or slightly increase. Reducing intensity causes detraining faster than reducing volume. Keep lifting heavy but do fewer total sets',
            'Key principle — You can maintain strength on surprisingly little volume. Research shows that one-third of the volume used to develop a quality is often sufficient to maintain it',
          ],
        },
        {
          heading: 'Managing Season Fatigue',
          paragraphs: [
            'Cumulative fatigue across a long season is inevitable. Smart management includes scheduled lighter training weeks coinciding with breaks in the fixture schedule, monitoring subjective wellness markers (sleep quality, mood, motivation, muscle soreness), and being willing to reduce gym work when competition demands are high. The athlete who arrives at the playoffs fresh and healthy is more valuable than the one who arrives overtrained and injured.',
          ],
        },
      ],
      unbreakableInsight: 'Off-season is where you build. In-season is where you maintain and express what you built. Trying to build during the season leads to fatigue. Failing to maintain leads to detraining. Know which phase you are in and train accordingly.',
      coachNote: 'The hardest conversation in S&C is convincing a motivated athlete to do less during the season. Explain it clearly: "Your job right now is to win matches, not set gym PRs. We protect what we built so it\'s there when you need it most."',
      practicalTask: {
        title: 'Seasonal Training Map',
        instructions: 'Map out a 12-month training year for a sport with a defined competitive season. Identify the off-season, pre-season, and in-season phases. For each phase, define the primary training objective, gym session frequency, approximate volume and intensity, and how sport practice fits alongside.',
        reflectionQuestions: [
          'How does your in-season volume compare to your off-season volume?',
          'At what point in the season would you expect fatigue to peak?',
          'What markers would tell you that an athlete needs an unplanned recovery week?',
        ],
      },
    },
    {
      number: 8,
      title: 'Concurrent Training Management',
      learningOutcome: 'Manage the complex interaction between multiple training stimuli to produce optimal multi-quality development without overtraining.',
      assessmentCriteria: [
        'Explain how to sequence different training qualities within a session and week',
        'Describe methods for monitoring total training load across all modalities',
        'Discuss the concept of minimal effective dose and maximum recoverable volume in concurrent training',
      ],
      content: [
        {
          heading: 'The Complexity of Multi-Quality Training',
          paragraphs: [
            'Sport athletes must develop and maintain multiple physical qualities simultaneously: strength, power, speed, endurance, agility, and mobility. Each quality requires a specific training stimulus, generates a specific fatigue profile, and interacts with every other quality being trained. Managing this complexity is the central challenge of strength and conditioning.',
            'The naive approach is to train everything all the time at maximum volume. This inevitably leads to overtraining, injury, and mediocre development across all qualities. The intelligent approach is to identify the minimum effective dose for each quality, prioritise based on the athlete\'s needs and the phase of the season, and sequence training stimuli to minimise negative interactions.',
          ],
        },
        {
          heading: 'Sequencing Within a Session',
          bullets: [
            'Speed and power work first — These require a fresh, well-recovered nervous system. Place sprints, plyometrics, and Olympic lift derivatives at the start of the session when neural drive is highest',
            'Strength work second — Main compound lifts after speed and power work. The nervous system is slightly fatigued but still capable of high-quality force production',
            'Hypertrophy and accessory work third — Higher-rep, lower-intensity work that does not require peak neural drive. Good location for prehab, isolation exercises, and addressing weaknesses',
            'Conditioning last — If included in the same session, place endurance work at the end. It generates the most metabolic fatigue and interferes most with preceding quality work',
          ],
        },
        {
          heading: 'Monitoring Total Load',
          paragraphs: [
            'When athletes train with multiple coaches or follow multiple programmes, total training load can escalate unnoticed. A session RPE system provides a simple monitoring tool: after each training session (gym, sport practice, conditioning), the athlete rates the session difficulty (1–10) and multiplies by duration in minutes to produce a session load score. Tracking this across the week reveals whether total load is manageable.',
          ],
          bullets: [
            'Session load = RPE × duration (minutes)',
            'Weekly load = sum of all session loads',
            'Acute:chronic ratio — Compare this week\'s load to the 4-week rolling average. Keep the ratio between 0.8 and 1.3 for optimal adaptation with manageable injury risk',
            'Monotony — If every day is the same load, the body does not get adequate recovery variation. Alternate hard and easy days',
          ],
        },
        {
          heading: 'Minimum Effective Dose',
          paragraphs: [
            'The minimum effective dose (MED) is the smallest training stimulus that produces a meaningful adaptation. Training above the MED produces additional adaptation — but with diminishing returns and increasing fatigue cost. For concurrent athletes, staying close to the MED for each quality allows more qualities to be trained simultaneously without exceeding total recovery capacity.',
            'Finding the MED requires experimentation: reduce volume gradually until adaptations stall, then add a small amount back. For most qualities, the MED is lower than most people think. Two heavy sets of squats twice per week maintains strength surprisingly well. Two sprint sessions per week maintains speed. One plyometric session maintains reactive strength. The MED approach frees recovery capacity for the qualities that need the most development.',
          ],
        },
      ],
      unbreakableInsight: 'The goal is not to do the most training possible — it is to do the most effective training recoverable. Every set, sprint, and drill has a cost. If the cost exceeds the benefit, you are not training harder — you are recovering less.',
      coachNote: 'Track total weekly training load across all modalities. The athlete who trains five times per week in the gym and also practices sport four times, plays matches, and does extra conditioning is not dedicated — they are on a path to overtraining. Someone needs to manage the total picture.',
      practicalTask: {
        title: 'Weekly Load Audit',
        instructions: 'For one full week, rate every training session (gym, sport practice, conditioning, matches) using session RPE × duration. Calculate your total weekly load and acute:chronic ratio. Identify whether your total load is sustainable.',
        reflectionQuestions: [
          'Was your total weekly load higher or lower than expected?',
          'Which sessions contribute the most to your total load?',
          'Could you achieve similar results with less total training volume?',
        ],
      },
    },
  ],
};

import { getUniversityImage } from '@/lib/university/imageMap';
import type { Unit } from '../types';

export const mindsetL3Unit4: Unit = {
  number: 4,
  title: 'Resilience Integration & Lifelong Practice',
  description: 'Integrate all mental resilience practices into a sustainable daily system, navigate setbacks with advanced strategies, build meaningful relationships, and design a life of purpose-driven performance.',
  chapters: [
    {
      number: 1,
      title: 'Building a Personal Resilience System',
      learningOutcome: 'Design and implement a personalised daily resilience system that integrates breathwork, exposure, journaling, movement, and recovery into a sustainable practice.',
      assessmentCriteria: [
        'Identify the core components of a complete resilience system',
        'Design a personalised daily protocol that balances challenge and recovery',
        'Explain how to periodise mental training alongside physical training',
      ],
      content: [
        {
          heading: 'The Five Pillars of Daily Resilience',
          paragraphs: [
            'A complete resilience system addresses five areas daily: physiological regulation (breathwork, exposure therapy), physical challenge (training, movement), cognitive engagement (learning, deep work), emotional processing (journaling, reflection), and social connection (meaningful relationships). Missing any pillar consistently creates a vulnerability.',
            'The key is integration, not addition. You do not need hours of extra practice — you need intentional design. Your morning routine, training session, and evening wind-down can incorporate all five pillars within your existing schedule.',
          ],
          imageUrl: getUniversityImage('mindl3-u4-ch1-resilience-system'),
          imageAlt: 'Personal resilience system showing interconnected physical, mental, emotional, and social pillars with daily practices',
          imagePlaceholder: 'Pentagon diagram showing the five pillars of daily resilience — Physiological Regulation, Physical Challenge, Cognitive Engagement, Emotional Processing, Social Connection — with example practices for each',
        },
        {
          heading: 'Designing Your Protocol',
          paragraphs: [
            'Morning (20–30 minutes): Cold exposure (2 min) + breathwork (10 min) + journaling (10 min). This covers physiological regulation and emotional processing before the day begins. Training session: Deep work approach — phone away, full presence, progressive overload. This covers physical challenge and cognitive engagement.',
            'Evening (15 minutes): Gratitude journaling (3 items) + social connection (meaningful conversation, not scrolling) + extended exhale breathing before sleep. Weekend: One longer exposure session (contrast therapy, extended breathwork, or outdoor cold water) plus genuine leisure time with people you care about.',
          ],
          bullets: [
            'Start small — Implement one pillar per week rather than all five at once',
            'Non-negotiables — Identify 2–3 practices that are daily regardless of circumstances',
            'Flexibility — The specific practice can vary; the commitment to the pillar cannot',
            'Tracking — Simple checkbox system to maintain accountability without creating burden',
            'Review — Weekly 10-minute review of what worked and what needs adjusting',
          ],
        },
        {
          heading: 'Periodising Mental Training',
          paragraphs: [
            'Just as physical training follows periodisation (higher stress phases followed by recovery phases), mental training benefits from the same approach. During high-stress life periods, reduce the intensity of exposure practices and increase recovery-focused practices (gentle breathing, extra sleep, nature exposure). During stable periods, push harder with advanced protocols.',
            'Deload weeks are as important mentally as physically. Every 4–6 weeks, reduce your exposure intensity, extend your sleep, and focus on enjoyment rather than performance. This prevents psychological burnout and maintains the long-term sustainability of your practice.',
          ],
        },
      ],
      unbreakableInsight: 'Systems beat motivation every time. Build a daily practice so well-designed that doing it is easier than skipping it. That is when resilience becomes automatic.',
      coachNote: 'Start with the single practice that addresses your biggest current weakness. Perfect that one habit before adding more. Stack gradually, not ambitiously.',
      practicalTask: {
        title: 'Personal Resilience System Design',
        instructions: 'Audit your current daily routine against the five pillars. Design a realistic daily protocol that addresses each pillar within your existing schedule (no more than 45 minutes of additional daily commitment). Implement for one week and evaluate.',
        reflectionQuestions: [
          'Which pillar was most neglected before this exercise?',
          'Did the structured approach feel sustainable, or did it feel like too much?',
          'What would you modify for long-term adherence?',
        ],
      },
    },
    {
      number: 2,
      title: 'Advanced Setback Navigation',
      learningOutcome: 'Apply advanced psychological strategies for navigating major setbacks including injury, loss, failure, and life transitions, using structured recovery frameworks.',
      assessmentCriteria: [
        'Describe the psychological stages of setback recovery and the non-linear nature of the process',
        'Apply the "Setback Protocol" — assess, accept, adapt, act',
        'Distinguish between productive struggle and harmful rumination during difficult periods',
      ],
      content: [
        {
          heading: 'The Psychology of Major Setbacks',
          paragraphs: [
            'Major setbacks — injury, job loss, relationship breakdown, bereavement — disrupt your identity, routine, and sense of control simultaneously. The psychological response is not a clean linear process but a messy oscillation between denial, anger, bargaining, sadness, and acceptance (Kübler-Ross\'s model, adapted for general setbacks).',
            'Understanding that oscillation is normal prevents the secondary injury of criticising yourself for "not handling it well." Some days you will feel fine; the next day the setback hits again. This is not regression — it is the natural pattern of psychological processing.',
          ],
          imageUrl: getUniversityImage('mindl3-u4-ch2-setback-navigation'),
          imageAlt: 'Advanced setback navigation showing emotional timeline after failure and bounce-back protocol steps',
          imagePlaceholder: 'Wave diagram showing the non-linear oscillation of setback recovery, with emotional intensity gradually decreasing over time but with frequent revisits to earlier emotional states',
        },
        {
          heading: 'The Setback Protocol: AAAA',
          paragraphs: [
            'Assess — Honestly evaluate the situation. What has actually changed? What remains intact? Catastrophising (imagining the worst) and minimising (pretending it is fine) are both distortions. Seek the accurate middle ground.',
            'Accept — This does not mean agreeing that the situation is acceptable. It means acknowledging reality as it is, rather than wasting energy arguing with what has already happened. Acceptance is not passive — it is the foundation for effective action.',
          ],
          bullets: [
            'Assess — What is the objective reality? Remove emotional exaggeration and minimisation',
            'Accept — Acknowledge what has happened without denial or resistance',
            'Adapt — What needs to change? Modify your plan, timeline, or approach to fit the new reality',
            'Act — Take the smallest meaningful step forward. Action breaks the paralysis cycle',
          ],
        },
        {
          heading: 'Rumination vs Reflection',
          paragraphs: [
            'Reflection is purposeful analysis of what happened, what you can learn, and what you will do differently. It has a beginning, a process, and a conclusion. Rumination is repetitive, circular thinking about the setback without moving toward resolution. It amplifies distress without producing insight.',
            'Practical distinction: reflection produces an action point; rumination produces more rumination. If you have been thinking about the same setback for more than 20 minutes without reaching a new insight or action, you are ruminating. The intervention: write down three specific things you can control and do one of them immediately.',
          ],
        },
      ],
      unbreakableInsight: 'Setbacks are not interruptions to your progress — they are part of it. How you navigate them determines who you become on the other side.',
      coachNote: 'When a major setback hits, the first step is always the smallest. Not "fix everything" — just "do one constructive thing today." Momentum builds from there.',
      practicalTask: {
        title: 'Setback Retrospective',
        instructions: 'Reflect on a past significant setback. Apply the AAAA protocol retrospectively: how did you assess, accept, adapt, and act? Identify what you did well and what you would do differently with the knowledge you now have.',
        reflectionQuestions: [
          'At which stage of the AAAA protocol did you get stuck during the original setback?',
          'How long did you spend in rumination vs productive reflection?',
          'What strengths did you discover through navigating that difficult period?',
        ],
      },
    },
    {
      number: 3,
      title: 'Relationships, Boundaries & Social Resilience',
      learningOutcome: 'Understand how relationships impact mental health and resilience, apply boundary-setting strategies, and build a social environment that supports your growth.',
      assessmentCriteria: [
        'Explain the impact of social connection on mental health, stress resilience, and longevity',
        'Apply assertive communication and boundary-setting techniques',
        'Design your social environment to support your values and goals',
      ],
      content: [
        {
          heading: 'Social Connection as a Health Intervention',
          paragraphs: [
            'Loneliness is as harmful to health as smoking 15 cigarettes per day — this is not hyperbole but the conclusion of a meta-analysis of 148 studies involving 300,000+ participants. Social connection reduces cortisol, improves immune function, enhances cardiovascular health, and is the single strongest predictor of happiness and longevity.',
            'Quality matters more than quantity. One deeply supportive relationship is more protective than a hundred superficial connections. The relationships that matter are characterised by trust, reciprocity, emotional safety, and the ability to be authentically yourself.',
          ],
          imageUrl: getUniversityImage('mindl3-u4-ch3-social-resilience'),
          imageAlt: 'Social resilience and boundaries showing relationship energy audit, boundary types, and social support network map',
          imagePlaceholder: 'Infographic comparing the health impact of loneliness vs social connection across five health domains — cardiovascular, immune, mental health, longevity, and cognitive function',
        },
        {
          heading: 'Setting Boundaries',
          paragraphs: [
            'Boundaries are not walls — they are communication about what you need to function well. "I need to be in bed by 10pm on training days" is a boundary. "I do not accept being spoken to disrespectfully" is a boundary. Setting them feels uncomfortable initially but is essential for protecting your energy and mental health.',
            'Assertive communication (not aggressive, not passive) is the tool: state your need clearly, explain the reason briefly, and hold the boundary without excessive justification. "I\'m not available on Sunday mornings — that\'s my training time" is complete. You do not need to apologise or provide a lengthy explanation.',
          ],
          bullets: [
            'Clear — State the boundary specifically, not vaguely ("I need quiet after 9pm" not "I need space")',
            'Consistent — Enforce the boundary every time, not just when convenient',
            'Compassionate — Boundaries protect the relationship, they do not attack the other person',
            'Consequences — Know what you will do if the boundary is not respected',
          ],
        },
        {
          heading: 'Curating Your Social Environment',
          paragraphs: [
            'You are the average of the five people you spend the most time with — this is overly simplistic but directionally correct. Your social environment shapes your norms, expectations, and beliefs about what is possible. If your closest circle normalises mediocrity, maintaining high standards requires constant willpower. If your circle normalises growth, it requires no effort at all.',
            'This is not about ruthlessly cutting people out. It is about deliberately adding people who embody the values and behaviours you are building. Join a gym with serious members. Find a study group. Attend events where people share your aspirations. The environment does the heavy lifting.',
          ],
        },
      ],
      unbreakableInsight: 'Your relationships are either fuel or friction. You owe it to yourself to surround yourself with people who make growth easier, not harder.',
      coachNote: 'This week, have one honest conversation with someone you trust about something you have been avoiding. Vulnerability in the right relationship strengthens both people.',
      practicalTask: {
        title: 'Relationship Audit',
        instructions: 'List your five closest relationships. For each, honestly assess: does this person energise or drain you? Do they support or undermine your growth? Identify one boundary you need to set and one new connection you want to build.',
        reflectionQuestions: [
          'Were any of the audit results surprising?',
          'What makes setting boundaries feel difficult, and what belief is driving that?',
          'What specific step will you take to add a growth-supportive relationship?',
        ],
      },
    },
    {
      number: 4,
      title: 'Purpose, Values & Meaning',
      learningOutcome: 'Explore the psychology of purpose and meaning, identify your core values, and align your daily actions with a sense of direction that sustains motivation through difficulty.',
      assessmentCriteria: [
        'Distinguish between hedonic wellbeing (pleasure) and eudaimonic wellbeing (meaning and purpose)',
        'Identify personal core values through structured reflection exercises',
        'Apply values-based decision-making to training, career, and relationship choices',
      ],
      content: [
        {
          heading: 'Hedonic vs Eudaimonic Wellbeing',
          paragraphs: [
            'Hedonic wellbeing is the pursuit of pleasure and avoidance of pain — it is about feeling good. Eudaimonic wellbeing is the pursuit of meaning, purpose, and the realisation of your potential — it is about living well. Research consistently shows that eudaimonic wellbeing produces deeper, more lasting satisfaction than hedonic wellbeing alone.',
            'This is not about rejecting pleasure. It is about understanding that a life built solely on comfort-seeking eventually feels empty, while a life with purpose can sustain you through discomfort. The training metaphor is perfect: the session is often uncomfortable, but the sense of accomplishment, progress, and alignment with your values makes it deeply satisfying.',
          ],
          imageUrl: getUniversityImage('mindl3-u4-ch4-purpose-values'),
          imageAlt: 'Purpose, values and meaning showing values hierarchy pyramid, ikigai framework, and purpose-driven decision filter',
          imagePlaceholder: 'Comparison chart showing hedonic wellbeing (short-term pleasure, diminishing returns) vs eudaimonic wellbeing (deeper satisfaction, compounds over time) with examples from training context',
        },
        {
          heading: 'Identifying Your Core Values',
          paragraphs: [
            'Values are not what you say matters — they are what you consistently prioritise when things get difficult. If you say you value health but consistently sacrifice sleep for entertainment, entertainment is your actual value. This is not a judgement — it is useful information for understanding the gap between who you are and who you want to be.',
            'A values clarification exercise: imagine you are at the end of your life, looking back. What do you want to have been true about how you lived? What would you regret not doing? The answers point toward your deepest values. Common core values include growth, integrity, connection, excellence, freedom, and service — but yours must be genuinely yours, not borrowed.',
          ],
          bullets: [
            'Health & vitality — Taking care of your body as a vehicle for everything else',
            'Growth — Continuous learning, challenge, and self-improvement',
            'Integrity — Alignment between what you say and what you do',
            'Connection — Deep, authentic relationships with people you care about',
            'Excellence — Doing things to the best of your ability, not settling for "good enough"',
            'Freedom — Autonomy over your time, choices, and direction',
          ],
        },
        {
          heading: 'Values-Based Decision-Making',
          paragraphs: [
            'When facing a difficult decision, ask: "Which option is most aligned with my core values?" This cuts through analysis paralysis because it provides a clear decision framework. Should you train today when you are tired? If growth and discipline are core values, the answer is usually yes (with appropriate intensity adjustment).',
            'Values-based living creates a powerful form of intrinsic motivation. When your daily actions align with your deepest values, you experience a sense of coherence that sustains effort far longer than external rewards. You are not training because someone told you to — you are training because it is who you are.',
          ],
        },
      ],
      unbreakableInsight: 'Purpose is not a destination you arrive at — it is a direction you walk in. Align your daily actions with your deepest values, and meaning emerges from the ordinary.',
      coachNote: 'Write your top three values on a card you carry with you. Before any significant decision this week, check: does this align with or contradict my values? Let the answer guide you.',
      practicalTask: {
        title: 'Values Clarification Exercise',
        instructions: 'Complete the "end of life" reflection: what do you want to have been true? From your reflections, identify your top 3–5 core values. Then audit your last week: how many of your decisions aligned with these values? Create a values-action alignment plan for the coming week.',
        reflectionQuestions: [
          'Were your stated values and your actual behaviour aligned, or was there a gap?',
          'Which value felt most important and non-negotiable?',
          'How does knowing your values change how you approach your training and daily choices?',
        ],
      },
    },
    {
      number: 5,
      title: 'Coaching Others & Teaching Resilience',
      learningOutcome: 'Understand the principles of effective coaching and mentoring, apply active listening and motivational interviewing techniques, and support others in developing their own mental resilience.',
      assessmentCriteria: [
        'Explain the difference between coaching, mentoring, and therapy',
        'Apply active listening and powerful questioning techniques',
        'Identify when someone needs professional support beyond peer coaching',
      ],
      content: [
        {
          heading: 'Coaching vs Mentoring vs Therapy',
          paragraphs: [
            'Coaching helps someone find their own answers through questions and structured reflection. Mentoring shares experience and guidance based on the mentor\'s own journey. Therapy treats psychological disorders, trauma, and clinical conditions using evidence-based clinical techniques. Understanding these distinctions prevents you from overstepping your competence.',
            'As a resilience-informed individual, you can coach and mentor — helping friends, training partners, and colleagues develop mental toughness through the practices you have learned. You cannot and should not attempt to provide therapy. When someone describes symptoms of depression, anxiety disorders, PTSD, or suicidal ideation, the appropriate response is to encourage them to seek professional help.',
          ],
          imageUrl: getUniversityImage('mindl3-u4-ch5-coaching-others'),
          imageAlt: 'Coaching others and teaching resilience showing coaching conversation model and mentoring vs coaching distinction',
          imagePlaceholder: 'Comparison table showing the scope, approach, and appropriate context for coaching, mentoring, and therapy with clear boundaries between each',
        },
        {
          heading: 'Active Listening & Powerful Questions',
          paragraphs: [
            'Active listening means being fully present — not preparing your response while the other person speaks. It involves paraphrasing ("So what you are saying is..."), reflecting emotions ("That sounds really frustrating"), and asking open-ended questions that promote self-reflection rather than giving advice.',
            'Powerful questions are open-ended, non-judgemental, and promote self-discovery: "What would you do if you were not afraid?" "What is the smallest step you could take right now?" "What would this look like if it were easy?" These questions help others find their own answers — which are always more powerful than being told what to do.',
          ],
          bullets: [
            'Listen more than you speak — The 80/20 rule applies',
            'Resist the urge to fix — People usually need to be heard before they need solutions',
            'Ask, do not tell — "What do you think you should do?" beats "Here is what I would do"',
            'Reflect emotions — "It sounds like you are feeling overwhelmed" validates their experience',
            'Comfortable silence — Allow thinking time after questions; do not rush to fill the gap',
          ],
        },
        {
          heading: 'Knowing Your Limits',
          paragraphs: [
            'The most important coaching skill is knowing when to refer. If someone is describing persistent low mood lasting more than two weeks, panic attacks, self-harm, substance dependency, or trauma responses, they need professional support. Your role is to normalise help-seeking ("Seeing a professional is not weakness — it is the smart move") and, if appropriate, help them access services.',
            'Supporting someone through a difficult period is valuable, but you are not a replacement for clinical intervention. The best thing you can do is be a reliable, non-judgemental presence while encouraging them to get the expert help they deserve.',
          ],
        },
      ],
      unbreakableInsight: 'The greatest test of your resilience knowledge is whether you can help someone else build theirs. Teaching what you have learned deepens your own mastery and extends your impact beyond yourself.',
      coachNote: 'Find one person in your life who is struggling and apply active listening — no advice, no fixing, just listening. Notice how it changes the conversation.',
      practicalTask: {
        title: 'Peer Coaching Practice',
        instructions: 'Arrange a 20-minute conversation with a willing friend or training partner where you practise active listening and powerful questioning only. Your goal: help them clarify a challenge they are facing without offering advice or solutions. Record (with permission) and review your technique.',
        reflectionQuestions: [
          'How difficult was it to resist giving advice and instead ask questions?',
          'Did the other person reach any insights or conclusions on their own?',
          'What did you learn about your default communication style through this exercise?',
        ],
      },
    },
    {
      number: 6,
      title: 'Living Without Limits — The Unbreakable Philosophy',
      learningOutcome: 'Synthesise all course content into a personal philosophy of resilience, commit to a lifelong practice of mental strength, and understand that the goal is not perfection but consistent, values-aligned living.',
      assessmentCriteria: [
        'Articulate a personal resilience philosophy that integrates stress science, breathwork, focus, and values',
        'Design a sustainable long-term mental resilience maintenance plan',
        'Reflect on the journey from Level 2 through Level 3 and identify key growth areas',
      ],
      content: [
        {
          heading: 'The Unbreakable Philosophy',
          paragraphs: [
            'Being "unbreakable" does not mean never breaking. It means having the knowledge, tools, and self-awareness to recover from anything and come back stronger. It means understanding your nervous system well enough to regulate it. Knowing your values well enough to navigate by them. Having practiced enough discomfort to know that you can handle more than you think.',
            'The philosophy is simple: show up, do the work, process what happens, recover, and repeat. Not perfectly — consistently. The person who trains 3 times a week for 10 years beats the person who trains 7 times a week for 3 months. Sustainability is the ultimate performance metric.',
          ],
          imageUrl: getUniversityImage('mindl3-u4-ch6-unbreakable-philosophy'),
          imageAlt: 'The Unbreakable Philosophy master integration blueprint connecting all mindset pillars with lifetime resilience framework',
          imagePlaceholder: 'Visual summary of the Unbreakable Philosophy — circular diagram showing the cycle of Challenge → Response → Recovery → Growth → Challenge, with the five pillars of resilience supporting the cycle',
        },
        {
          heading: 'Your Lifelong Maintenance Plan',
          paragraphs: [
            'Mental resilience is not a course you complete — it is a practice you maintain. Like physical fitness, it atrophies without consistent training. Your maintenance plan should include: daily non-negotiables (breathwork, journaling, movement), weekly practices (exposure therapy, deep work, social connection), and periodic reviews (monthly values check, quarterly resilience audit).',
            'Build in flexibility. Life will disrupt your routine — illness, travel, crises. The plan should specify minimum viable doses for difficult periods: even 5 minutes of breathing and a single journal entry is better than nothing. Protect the streak, even if the individual session is small.',
          ],
          bullets: [
            'Daily — 10 minutes breathwork, evening journaling, phone-free training',
            'Weekly — One cold/heat exposure, one deep work session, one meaningful conversation',
            'Monthly — Review habits, adjust protocols, assess which pillar needs attention',
            'Quarterly — Resilience audit: BOLT score, sleep quality, stress management effectiveness',
            'Annually — Full values reassessment and goal alignment review',
          ],
        },
        {
          heading: 'The Journey Continues',
          paragraphs: [
            'You have covered an extraordinary amount of ground across Level 2 and Level 3. From the basics of stress physiology to advanced emotional regulation, from beginner breathing to competitive breathing protocols, from understanding habits to reshaping your identity. But knowledge without application is just trivia.',
            'The real course begins now — in the daily application of what you have learned. In the cold shower you choose when the warm one is easier. In the training session you complete when skipping would be simpler. In the honest conversation you have when silence would be comfortable. In the boundary you set when accommodation would be easier. This is where resilience lives — not in textbooks, but in the accumulated evidence of who you choose to be, every single day.',
          ],
        },
      ],
      unbreakableInsight: 'You are not trying to become unbreakable. You already are — you just needed the tools to prove it to yourself. Now go live it.',
      coachNote: 'Commit to one practice from this course that you will do every single day for the next year. Just one. That consistency will teach you more than any course ever could.',
      practicalTask: {
        title: 'Personal Resilience Manifesto',
        instructions: 'Write your personal resilience manifesto — a one-page document that captures your philosophy, your non-negotiable daily practices, your values, and the identity you are building. This is your reference document for difficult days. Make it personal, make it honest, and keep it visible.',
        reflectionQuestions: [
          'What was the single most impactful lesson from the entire Level 2 and Level 3 journey?',
          'How has your understanding of mental resilience changed from when you started?',
          'What is the one daily practice you are committing to, and why that one specifically?',
        ],
      },
    },
    {
      number: 7,
      title: 'Seasonal Resilience & Long-Term Periodisation',
      learningOutcome: 'Understand how to periodise mental resilience training across months and years, account for seasonal and life-phase variations, and build a sustainable long-term development framework.',
      assessmentCriteria: [
        'Explain why resilience capacity fluctuates across seasons and life phases',
        'Design a periodised annual mental resilience plan',
        'Identify strategies for maintaining baseline practices during high-stress periods',
      ],
      content: [
        {
          heading: 'Resilience Is Not a Constant',
          paragraphs: [
            'Your resilience capacity is not fixed at one level — it fluctuates across days, weeks, seasons, and life phases. Just as physical performance cycles through peaks and valleys, your mental resilience has natural rhythms influenced by daylight, workload, life events, hormonal cycles, and cumulative stress. Ignoring these fluctuations leads to burnout during low phases and underperformance during high ones.',
            'Long-term resilience development requires periodisation — the same principle that underlies effective physical training. You cannot train at maximum intensity year-round without breaking. The same applies to mental resilience: periods of growth must be balanced with periods of consolidation and recovery.',
          ],
        },
        {
          heading: 'Seasonal Considerations',
          bullets: [
            'Winter — Reduced daylight affects serotonin production and circadian rhythm. Energy and motivation naturally dip. This is a consolidation phase: maintain baseline practices, prioritise sleep and social connection, reduce exposure training intensity',
            'Spring — Increasing daylight boosts energy and motivation. Good time to introduce new challenges, increase training volume, and push comfort zone boundaries',
            'Summer — Peak energy and social opportunity. Ideal for intensification phases: harder exposure training, bigger goals, social resilience building',
            'Autumn — Transition period. Good for reflection, skill refinement, and preparing systems for winter maintenance',
            'These are general patterns — your individual rhythm may differ. Track your energy and motivation monthly for a year to identify your personal peaks and valleys',
          ],
        },
        {
          heading: 'Life-Phase Periodisation',
          paragraphs: [
            'Beyond seasonal cycles, major life events require periodisation adjustments. Starting a new job, becoming a parent, grieving a loss, or managing illness all temporarily reduce your capacity for growth-focused resilience work. During these periods, the goal shifts from progression to maintenance — protecting your baseline practices while being compassionate about reduced capacity.',
          ],
          bullets: [
            'High-stress life phases — Reduce to non-negotiable minimums: daily breathwork, adequate sleep, one social connection. Do not add new challenges',
            'Stable phases — Build progressively: add exposure training, expand comfort zones, take on new learning',
            'Growth phases — Push boundaries deliberately: advanced protocols, challenging goals, teaching others',
            'Recovery phases — Consolidate gains: review learnings, refine systems, restore energy reserves',
            'Annual review — Once per year, conduct a comprehensive review of your resilience development: what improved, what regressed, what needs attention next',
          ],
        },
      ],
      unbreakableInsight: 'The goal is not to be at your peak every single day — that is unsustainable and counterproductive. The goal is to build a system that sustains progress across years, not just weeks. The person who maintains 70% consistency for a decade will outperform the person who gives 100% for three months and quits.',
      coachNote: 'Give yourself permission to have maintenance phases. Not every month needs to be a breakthrough. Sometimes holding the line is the most resilient thing you can do.',
      practicalTask: {
        title: 'Annual Resilience Periodisation Plan',
        instructions: 'Create a 12-month resilience development plan. For each month, assign a phase (foundation, building, intensification, or deload) based on your known commitments, seasonal patterns, and energy levels. Identify your non-negotiable baseline practices that continue regardless of phase. Define what "progression" and "maintenance" look like for each major resilience domain.',
        reflectionQuestions: [
          'Can you identify your personal seasonal energy patterns from the past year?',
          'What are your non-negotiable baseline practices that you would maintain even during the hardest life phase?',
          'How does framing resilience as a long-term, periodised practice change your relationship with setbacks?',
        ],
      },
    },
    {
      number: 8,
      title: 'Reflective Practice & Portfolio Development',
      learningOutcome: 'Consolidate all Level 3 learning through structured reflective practice, build a personal development portfolio, and create a framework for continued autonomous growth beyond this course.',
      assessmentCriteria: [
        'Explain why reflective practice is essential for sustained learning and development',
        'Create a personal development portfolio documenting key learnings and growth areas',
        'Design a self-directed development plan for the next 12 months',
      ],
      content: [
        {
          heading: 'From Student to Practitioner',
          paragraphs: [
            'Completing a course is not the same as embodying its lessons. The gap between knowledge and practice is where most people stall. Reflective practice bridges this gap by turning experience into learning, and learning into improved practice. It is the mechanism by which you continue to grow after the structured curriculum ends.',
            'This chapter is not an ending — it is a transition point. You are moving from guided learning to autonomous development. The tools, frameworks, and practices from Levels 2 and 3 are now your toolkit. This chapter teaches you how to maintain, apply, and evolve that toolkit independently.',
          ],
        },
        {
          heading: 'The Reflective Practice Cycle',
          bullets: [
            'Experience — Something happens: a stressful event, a training session, a difficult conversation, a breakthrough',
            'Reflection — You step back and examine: What happened? How did I respond? What worked? What did I not?',
            'Learning — You extract a principle or insight: "I notice that my stress response is worse when I skip morning breathwork"',
            'Application — You adjust your practice based on the learning: "I will make morning breathwork non-negotiable, even on busy days"',
            'Repeat — The cycle continues. Each iteration deepens your self-knowledge and refines your practice',
          ],
        },
        {
          heading: 'Building Your Development Portfolio',
          paragraphs: [
            'A personal development portfolio is a living document that captures your growth journey. It serves two purposes: (1) it provides a concrete record of progress that sustains motivation during plateaus, and (2) it forces you to articulate what you have learned — and articulation deepens understanding.',
          ],
          bullets: [
            'Key learnings — For each unit, write one paragraph summarising the most impactful thing you learned and how it has changed your behaviour',
            'Self-assessment — Honestly rate your current competence in each major domain: stress management, breathwork, focus, emotional regulation, sleep, social resilience. Identify your top two strengths and two development areas',
            'Evidence of growth — Collect tangible evidence: journal entries, tracking data, before/after comparisons, completed practical tasks',
            'Next steps — For each development area, define one specific action you will take in the next 90 days',
            'Teaching summary — Write a brief explanation of each core concept as if teaching it to a friend. If you cannot explain it simply, you do not fully understand it',
          ],
        },
        {
          heading: 'Your 12-Month Self-Directed Plan',
          paragraphs: [
            'Design a plan that maintains your baseline practices, progressively develops your weakest areas, and periodically revisits strong areas to prevent regression. The plan should be simple enough to follow without external accountability, but structured enough to prevent drift.',
          ],
          bullets: [
            'Daily non-negotiables — Identify 2–3 practices you will do every day regardless of circumstances (e.g., morning breathwork, evening reflection, hydration target)',
            'Monthly focus — Each month, choose one domain for deeper focus. Reread the relevant chapter, intensify that practice, and track progress',
            'Quarterly review — Every three months, revisit your portfolio, update your self-assessment, and adjust your plan based on what you have learned',
            'Annual reflection — At the year mark, complete a comprehensive review. Compare your current self-assessment to where you were at the start of this course',
          ],
        },
      ],
      unbreakableInsight: 'The course ends here. Your development does not. Everything you have learned is a starting point, not a destination. The person you become in the next year depends entirely on what you do with this knowledge — not on the fact that you acquired it.',
      coachNote: 'This is the most important chapter in the entire course — because it determines whether everything else sticks. Take the portfolio seriously. The 30 minutes you invest in writing it will be worth more than 30 hours of passive reading.',
      practicalTask: {
        title: 'Personal Development Portfolio & 12-Month Plan',
        instructions: 'Create your personal development portfolio. For each of the four units in Level 3, write: (1) the most impactful lesson, (2) how it has changed your behaviour, (3) your current competence rating (1–10). Then design your 12-month self-directed plan: identify daily non-negotiables, monthly focus areas, and quarterly review dates. Put the review dates in your calendar now.',
        reflectionQuestions: [
          'Looking back across the entire Level 3 course, what has changed most about how you think about resilience?',
          'Which practices have already become habits, and which still require conscious effort?',
          'What would you tell your past self — the person who started Level 2 — about what lies ahead?',
        ],
      },
    },
  ],
};

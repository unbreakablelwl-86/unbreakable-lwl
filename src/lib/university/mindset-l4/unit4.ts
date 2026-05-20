import type { Unit } from '../types';

export const mindsetL4Unit4: Unit = {
  number: 4,
  title: 'Applied Psychology & Professional Practice',
  description: 'Integrate everything into professional practice. From behaviour change science and client psychology to resilience under adversity, ethical practice, and building a psychology-informed approach to coaching, fitness, and life.',
  chapters: [
    {
      number: 1,
      title: 'Behaviour Change Science',
      learningOutcome: 'Understand the major theoretical models of behaviour change and apply them to real-world coaching and personal development.',
      assessmentCriteria: [
        'Describe the Transtheoretical Model (Stages of Change)',
        'Explain the COM-B model and its practical applications',
        'Match intervention strategies to the appropriate stage of change',
      ],
      content: [
        {
          heading: 'The Transtheoretical Model',
          paragraphs: [
            'Prochaska and DiClemente\'s Transtheoretical Model describes change as a process with distinct stages, not a single event. Understanding which stage someone is in determines which intervention will work — and which will backfire.',
          ],
          bullets: [
            'Precontemplation — Not considering change. "I don\'t have a problem." Intervention: raise awareness, provide information, don\'t push',
            'Contemplation — Considering change but ambivalent. "I want to but..." Intervention: explore pros/cons, use MI techniques, support decision-making',
            'Preparation — Planning to change soon. "I\'m going to start." Intervention: help create specific plans, address barriers, build confidence',
            'Action — Actively changing. "I\'m doing it." Intervention: support, reinforce, problem-solve obstacles',
            'Maintenance — Sustaining change over time. "I\'ve been doing it." Intervention: prevent relapse, build identity around the new behaviour',
            'Relapse — Returning to old behaviour. Not failure — normal. Intervention: normalise, learn from it, re-enter the cycle',
          ],
        },
        {
          heading: 'The COM-B Model',
          paragraphs: [
            'Susan Michie\'s COM-B model states that behaviour requires three conditions: Capability (physical and psychological ability), Opportunity (physical and social environment), and Motivation (reflective and automatic drives). If someone isn\'t changing, at least one of these is missing. The model diagnoses which one.',
            'A client who "knows what to do but doesn\'t do it" isn\'t lacking information (capability). They may lack opportunity (no gym access, no time, unsupportive environment) or motivation (the behaviour isn\'t connected to their values, or competing motivations are stronger). The intervention depends on the diagnosis — more information won\'t fix an opportunity problem.',
          ],
        },
        {
          heading: 'Designing Effective Interventions',
          paragraphs: [
            'The most common mistake in behaviour change is applying the right intervention at the wrong stage, or targeting the wrong COM-B component. Giving a gym programme to someone in precontemplation is like giving directions to someone who hasn\'t decided to travel. Understanding where someone is — psychologically — before intervening is the difference between effective coaching and wasted effort.',
          ],
        },
      ],
      unbreakableInsight: 'People don\'t fail to change because they\'re lazy. They fail because the intervention didn\'t match their readiness, capability, opportunity, or motivation. Diagnose before you prescribe.',
      coachNote: 'Before designing any programme for a client, spend 10 minutes assessing: which stage of change are they in? Do they have capability, opportunity, AND motivation? The answers should shape everything you prescribe.',
      practicalTask: {
        title: 'COM-B Diagnosis',
        instructions: 'Choose a behaviour you or a client is trying to change. Assess each COM-B component (1-10): Capability (do they know how?), Opportunity (does the environment support it?), Motivation (is the drive there?). Design an intervention targeting the lowest-scoring component.',
        reflectionQuestions: [
          'Which COM-B component was the primary barrier?',
          'Were you previously targeting the wrong component?',
          'How would the intervention change if you correctly identified the barrier?',
        ],
      },
    },
    {
      number: 2,
      title: 'Client Psychology & Adherence',
      learningOutcome: 'Understand the psychological factors that determine client adherence and design programmes that people actually follow.',
      assessmentCriteria: [
        'Explain Self-Determination Theory and its three basic needs',
        'Describe the psychological barriers to programme adherence',
        'Design adherence-optimised programmes using psychological principles',
      ],
      content: [
        {
          heading: 'Self-Determination Theory (SDT)',
          paragraphs: [
            'SDT (Deci & Ryan) is the most well-validated theory of human motivation. It states that intrinsic motivation — doing something because it\'s inherently satisfying — depends on three basic psychological needs: Autonomy (choice and self-direction), Competence (feeling effective and capable), and Relatedness (feeling connected to others). Programmes that satisfy all three produce lasting engagement. Programmes that undermine any one produce dropout.',
            'Extrinsic motivation (rewards, punishments, social pressure) can start behaviour, but only intrinsic motivation sustains it. The coaching challenge is bridging the gap: use external structure and accountability initially while progressively building internal motivation through autonomy, competence, and connection.',
          ],
        },
        {
          heading: 'Why People Drop Out',
          paragraphs: [
            'Research consistently identifies the same barriers to exercise adherence:',
          ],
          bullets: [
            'Perceived lack of time — often a priority issue disguised as a time issue',
            'Low self-efficacy — "I\'m not a gym person" (identity) or "I can\'t do this" (capability belief)',
            'Social anxiety — fear of judgement, especially in gym environments',
            'Programme complexity — too many variables, too little clarity',
            'Lack of autonomy — feeling controlled rather than supported',
            'No visible progress — feedback is too infrequent or too vague',
            'Isolation — no social connection or accountability',
          ],
        },
        {
          heading: 'Designing for Adherence',
          paragraphs: [
            'The best programme is the one people follow. Adherence-optimised design means: building autonomy through choice within structure (not unlimited freedom), ensuring early wins that build competence (progression that feels achievable), creating social connection (training partners, group elements, community), providing frequent visible feedback (measurements, performance tracking, check-ins), and keeping complexity low enough that the programme doesn\'t become a source of stress.',
            'The 80% rule: if a client can\'t follow the programme 80% of the time, the programme is wrong — not the client. Adjust the programme to match the person\'s life, not the other way around.',
          ],
        },
      ],
      unbreakableInsight: 'The perfect programme that someone abandons produces zero results. The imperfect programme that someone follows produces everything. Design for adherence first, optimisation second.',
      coachNote: 'Ask every client: "On a scale of 1-10, how confident are you that you can follow this programme?" If the answer is below 7, simplify until it\'s a 7 or above. Confidence predicts adherence more than programme quality.',
      practicalTask: {
        title: 'Adherence Audit',
        instructions: 'Review a programme (yours or a client\'s). Rate it 1-10 on: Autonomy support, Competence building, Social connection, Simplicity, Feedback frequency. Redesign the lowest-scoring element.',
        reflectionQuestions: [
          'Which SDT need is least satisfied by the current programme?',
          'If adherence is below 80%, which specific barrier is causing it?',
          'What is the simplest version of this programme that would still produce results?',
        ],
      },
    },
    {
      number: 3,
      title: 'Resilience & Post-Adversity Growth',
      learningOutcome: 'Understand resilience as a dynamic process and develop strategies for building psychological toughness through adversity.',
      assessmentCriteria: [
        'Define resilience as a process rather than a trait',
        'Describe the factors that predict resilient outcomes',
        'Design a personal resilience development plan',
      ],
      content: [
        {
          heading: 'Resilience Is a Process',
          paragraphs: [
            'Resilience is not a personality trait you either have or don\'t. It\'s a dynamic process of positive adaptation in the face of significant adversity. This distinction matters because traits feel fixed ("I\'m just not resilient") while processes can be developed ("I can build resilience through specific practices").',
            'Research identifies several factors that predict resilient outcomes: strong social support, realistic optimism (not naive positivity), sense of purpose, cognitive flexibility (ability to reframe), active coping strategies (problem-focused rather than avoidance-based), and physical health. All of these are modifiable.',
          ],
        },
        {
          heading: 'The Resilience Toolkit',
          paragraphs: [
            'Building resilience requires stacking multiple protective factors:',
          ],
          bullets: [
            'Social connection — the single strongest predictor of resilience. Invest in relationships before you need them',
            'Realistic optimism — believing things can improve while honestly acknowledging current challenges',
            'Sense of coherence — understanding why adversity happened, believing you can cope, finding meaning in it',
            'Active coping — taking action on what you can control, accepting what you can\'t',
            'Physical resilience — exercise, sleep, and nutrition directly support psychological resilience',
            'Cognitive flexibility — ability to find alternative perspectives and adapt your approach',
            'Purpose and meaning — clear values and goals provide direction through chaos',
          ],
        },
        {
          heading: 'Stress Inoculation',
          paragraphs: [
            'Controlled exposure to manageable stress builds resilience — just as muscles grow through progressive overload. Cold exposure, demanding training, public speaking, and voluntary discomfort all train the stress response system. The key is graduated challenge: enough stress to adapt, not so much that you break.',
            'Military, emergency services, and elite sports all use stress inoculation training: exposing people to simulated high-stress scenarios in controlled environments. You can apply the same principle: deliberately seek situations that are uncomfortable but survivable. Each one expands your capacity.',
          ],
        },
      ],
      unbreakableInsight: 'You cannot prevent adversity. But you can prepare for it. Every hard conversation, uncomfortable workout, cold shower, and voluntary challenge is a deposit in your resilience account. When life makes a withdrawal — and it will — you\'ll have the balance to cover it.',
      coachNote: 'Resilience isn\'t about suffering in silence. It\'s about processing adversity effectively — which usually means connecting with others, finding meaning, and taking action. Build your support network before you need it.',
      practicalTask: {
        title: 'Resilience Factor Assessment',
        instructions: 'Rate yourself 1-10 on each resilience factor: social support, realistic optimism, sense of purpose, cognitive flexibility, active coping, physical health, meaning-making. Identify the two lowest and create a 4-week strengthening plan.',
        reflectionQuestions: [
          'Which factor is your strongest resilience resource?',
          'Which factor represents your biggest vulnerability?',
          'How would you cope with a major setback right now — what would you do first?',
        ],
      },
    },
    {
      number: 4,
      title: 'Positive Psychology & Flourishing',
      learningOutcome: 'Understand the science of wellbeing and apply positive psychology interventions to promote flourishing.',
      assessmentCriteria: [
        'Describe Seligman\'s PERMA model of wellbeing',
        'Explain the broaden-and-build theory of positive emotions',
        'Apply evidence-based positive psychology interventions',
      ],
      content: [
        {
          heading: 'Beyond "Not Depressed"',
          paragraphs: [
            'Traditional psychology focused on fixing what\'s wrong. Positive psychology asks: what makes life worth living? Martin Seligman argued that wellbeing isn\'t just the absence of mental illness — it\'s the presence of positive functioning. You can be free of depression and still not flourishing. The goal isn\'t just to get above zero; it\'s to build a life of genuine engagement, meaning, and vitality.',
          ],
        },
        {
          heading: 'The PERMA Model',
          paragraphs: [
            'Seligman\'s PERMA model identifies five pillars of wellbeing, each independently measurable and developable:',
          ],
          bullets: [
            'Positive Emotions — experiencing joy, gratitude, hope, interest, and love regularly',
            'Engagement — being absorbed in activities that challenge your skills (flow states)',
            'Relationships — having deep, meaningful connections with others',
            'Meaning — belonging to and serving something bigger than yourself',
            'Accomplishment — pursuing achievement and mastery for its own sake',
          ],
        },
        {
          heading: 'Evidence-Based Interventions',
          paragraphs: [
            'Positive psychology isn\'t about forced optimism. It\'s about evidence-based practices that measurably improve wellbeing:',
          ],
          bullets: [
            'Three Good Things — each evening, write three things that went well and why. Simple, proven to reduce depression and increase happiness for 6+ months',
            'Gratitude letter — write and deliver a letter of gratitude to someone who\'s made a difference. Single most powerful positive psychology intervention tested',
            'Strengths identification — discover and deploy your character strengths daily (VIA Survey)',
            'Acts of kindness — performing 5 deliberate acts of kindness in one day reliably boosts mood',
            'Savouring — deliberately extending positive experiences by paying full attention to them',
            'Best possible self — write about your ideal future in detail. Increases optimism and goal pursuit',
          ],
        },
      ],
      unbreakableInsight: 'Wellbeing is not a destination you arrive at. It\'s a set of practices you maintain. Like fitness, it requires consistent work — but the returns compound over a lifetime.',
      coachNote: 'Start with "Three Good Things" tonight. It takes 5 minutes, the evidence is robust, and you\'ll feel the difference within a week. Then recommend it to every client you work with.',
      practicalTask: {
        title: 'PERMA Profile',
        instructions: 'Rate yourself 1-10 on each PERMA pillar: Positive Emotions, Engagement, Relationships, Meaning, Accomplishment. Choose the lowest-scoring pillar and implement one evidence-based intervention for 7 days.',
        reflectionQuestions: [
          'Which PERMA pillar is your strongest?',
          'Which pillar needs the most attention?',
          'After 7 days of the intervention, what changed?',
        ],
      },
    },
    {
      number: 5,
      title: 'Stress Physiology & Management',
      learningOutcome: 'Understand the physiology of stress, distinguish between helpful and harmful stress, and apply evidence-based management strategies.',
      assessmentCriteria: [
        'Describe the HPA axis and the acute stress response',
        'Differentiate eustress from distress and acute from chronic stress',
        'Apply physiological stress management techniques',
      ],
      content: [
        {
          heading: 'The Stress Response System',
          paragraphs: [
            'The stress response operates through the Hypothalamic-Pituitary-Adrenal (HPA) axis. A perceived threat triggers the hypothalamus to release CRH, which signals the pituitary to release ACTH, which tells the adrenal glands to release cortisol and adrenaline. This cascade prepares the body for action: elevated heart rate, redirected blood flow, heightened alertness, suppressed digestion.',
            'This system evolved for acute, physical threats — run from the predator, then recover. Modern stress is chronic and psychological — work deadlines, social comparison, financial pressure — but triggers the same cascade. The body can\'t distinguish between a lion and an inbox. Chronic activation of the stress response damages cardiovascular health, immune function, cognitive performance, and mental health.',
          ],
        },
        {
          heading: 'Eustress vs Distress',
          paragraphs: [
            'Not all stress is harmful. Eustress (positive stress) — such as an exciting challenge, a tough workout, or a meaningful deadline — promotes growth, focus, and performance. Distress (negative stress) — characterised by feeling overwhelmed, helpless, or threatened — degrades performance and health. The difference often isn\'t the stressor itself but your perceived ability to cope with it.',
            'The Yerkes-Dodson law describes the inverted-U relationship between arousal and performance: too little stress produces boredom and underperformance; optimal stress produces peak performance; too much stress produces anxiety and collapse. The goal is not to eliminate stress but to calibrate it.',
          ],
        },
        {
          heading: 'Evidence-Based Management',
          paragraphs: [
            'The most effective stress management techniques work at different levels:',
          ],
          bullets: [
            'Physiological — Box breathing (4-4-4-4), physiological sigh (double inhale + long exhale), progressive muscle relaxation, cold exposure',
            'Cognitive — Reappraisal (reframing the situation), cognitive defusion, perspective-taking ("Will this matter in 5 years?")',
            'Behavioural — Exercise (the single best stress buffer), sleep hygiene, time in nature, social connection',
            'Environmental — Reducing controllable stressors, setting boundaries, saying no, designing recovery into your schedule',
          ],
        },
      ],
      unbreakableInsight: 'Stress isn\'t the enemy. Chronic, unmanaged stress is the enemy. Acute stress with adequate recovery is how you grow. The skill isn\'t avoiding stress — it\'s managing the dose and ensuring recovery.',
      coachNote: 'Learn the physiological sigh: two quick inhales through the nose, one long exhale through the mouth. It\'s the fastest evidence-based way to reduce acute stress — takes 30 seconds and works in real time.',
      practicalTask: {
        title: 'Stress Audit & Recovery Plan',
        instructions: 'List your top 5 stressors. Classify each as eustress or distress. Rate each 1-10 for intensity. For each distress source, identify one management strategy from each level (physiological, cognitive, behavioural, environmental).',
        reflectionQuestions: [
          'What proportion of your stress is eustress vs distress?',
          'Where are you lacking recovery between stress exposures?',
          'Which management technique has worked best for you historically?',
        ],
      },
    },
    {
      number: 6,
      title: 'Psychology of Identity & Self-Concept',
      learningOutcome: 'Understand how identity shapes behaviour and how deliberate identity shifts can drive lasting change.',
      assessmentCriteria: [
        'Explain how self-concept influences behaviour through identity-based motivation',
        'Describe the process of deliberate identity construction',
        'Apply identity-based strategies to behaviour change',
      ],
      content: [
        {
          heading: 'Identity Drives Behaviour',
          paragraphs: [
            'The most powerful predictor of long-term behaviour is not goals, habits, or motivation — it\'s identity. People who identify as "someone who exercises" maintain fitness through disruption, illness, and life changes. People who identify as "trying to get fit" quit when it gets hard. The difference is not discipline — it\'s self-concept.',
            'James Clear\'s insight in Atomic Habits captures this: "Every action you take is a vote for the type of person you wish to become." When you go to the gym despite not wanting to, you\'re not just burning calories — you\'re casting a vote for the identity of "someone who trains." Enough votes and the identity sticks. Once it sticks, the behaviour becomes self-sustaining.',
          ],
        },
        {
          heading: 'Self-Concept & Possible Selves',
          paragraphs: [
            'Your self-concept is the collection of beliefs about who you are. It includes your past self (who you were), current self (who you are), and possible selves (who you could become). Possible selves can be positive (hoped-for selves) or negative (feared selves). Both motivate behaviour, but hoped-for selves paired with a clear plan produce the best outcomes.',
            'The gap between your current self and your ideal self creates either motivation (when the gap feels bridgeable) or despair (when it feels insurmountable). Effective coaching closes this gap by making the ideal self vivid and the path to it clear and achievable.',
          ],
        },
        {
          heading: 'Deliberate Identity Construction',
          paragraphs: [
            'Identity change follows a reliable process:',
          ],
          bullets: [
            'Define the target identity — "I am someone who..." (be specific and values-aligned)',
            'Identify the smallest actions consistent with that identity',
            'Perform those actions consistently — each one is a vote',
            'Narrate the identity — tell yourself and others who you\'re becoming',
            'Find a tribe that shares the identity — identity is reinforced by community',
            'Prune conflicting identities — you can\'t be "someone who prioritises health" and "someone who says yes to everything"',
          ],
        },
      ],
      unbreakableInsight: 'You don\'t rise to the level of your goals. You fall to the level of your identity. Change who you believe you are, and your behaviour follows. This is the deepest level of change — and the most lasting.',
      coachNote: 'Help clients define their identity with a simple prompt: "What kind of person do you want to be?" Then connect every action in their programme to that identity: "This is what [that person] does."',
      practicalTask: {
        title: 'Identity Blueprint',
        instructions: 'Write a detailed description of your ideal self 2 years from now. Include: how they look, what they do daily, how they handle stress, what their relationships are like, and what they\'ve accomplished. Then list 5 daily actions that are consistent with being that person.',
        reflectionQuestions: [
          'How different is your ideal self from your current self?',
          'Which daily actions would cast the strongest votes for your ideal identity?',
          'What identity are your current habits voting for?',
        ],
      },
    },
    {
      number: 7,
      title: 'Ethics, Boundaries & Professional Standards',
      learningOutcome: 'Understand the ethical principles that govern professional practice in coaching and psychology-related fields.',
      assessmentCriteria: [
        'Describe the core ethical principles in coaching and psychology',
        'Explain the importance of professional boundaries',
        'Identify common ethical dilemmas and appropriate responses',
      ],
      content: [
        {
          heading: 'Core Ethical Principles',
          paragraphs: [
            'Whether you\'re a coach, trainer, or anyone in a position of influence, ethical practice rests on four principles adapted from psychology\'s ethical code:',
          ],
          bullets: [
            'Beneficence — act in the client\'s best interest. Every recommendation should serve them, not you',
            'Non-maleficence — do no harm. If you\'re not qualified for something, don\'t attempt it',
            'Autonomy — respect the client\'s right to make their own decisions, even ones you disagree with',
            'Justice — treat all clients fairly, without discrimination based on identity, background, or ability to pay',
          ],
        },
        {
          heading: 'Professional Boundaries',
          paragraphs: [
            'Boundaries protect both practitioner and client. They define where the professional relationship begins and ends, preventing exploitation, dependency, and role confusion. Boundary violations are the single most common source of harm in helping professions.',
            'Key boundaries to maintain: scope of practice (don\'t practise outside your competence), dual relationships (avoid mixing professional and personal relationships), confidentiality (client information stays private unless there\'s a safeguarding concern), financial boundaries (transparent pricing, no exploitation), and emotional boundaries (empathy without absorption).',
          ],
        },
        {
          heading: 'Common Ethical Dilemmas',
          paragraphs: [
            'Real-world ethical situations are rarely black and white:',
          ],
          bullets: [
            'A client shares concerning mental health symptoms — when do you refer? (Answer: when it\'s beyond your competence or scope)',
            'A client asks you to train their child but you suspect the child doesn\'t want to — autonomy conflict',
            'You notice signs of disordered eating in a client — how do you address it without overstepping?',
            'A client offers you a business opportunity — dual relationship risk',
            'Social media: sharing client transformation photos — consent and dignity considerations',
            'When a client makes progress you disagree with — respecting autonomy over your own opinions',
          ],
        },
      ],
      unbreakableInsight: 'Ethics aren\'t rules that limit your practice. They\'re principles that define good practice. When in doubt, ask: "Is this in my client\'s best interest?" and "Am I operating within my competence?" Those two questions resolve most dilemmas.',
      coachNote: 'Create a personal code of ethics — 5-10 principles that guide your professional behaviour. Review it quarterly. Having a written code makes in-the-moment decisions easier because the thinking has already been done.',
      practicalTask: {
        title: 'Personal Ethics Code',
        instructions: 'Write a personal code of professional ethics with 7-10 principles that will guide your practice. For each principle, include a concrete example of how it would apply in a real situation.',
        reflectionQuestions: [
          'Have you ever faced an ethical dilemma in a professional context?',
          'Which principle would be hardest to uphold under pressure?',
          'How would having a written code change your decision-making?',
        ],
      },
    },
    {
      number: 8,
      title: 'Psychology of Goal-Setting & Achievement',
      learningOutcome: 'Understand goal-setting theory and apply advanced strategies for translating goals into sustained achievement.',
      assessmentCriteria: [
        'Describe Locke and Latham\'s Goal-Setting Theory',
        'Explain implementation intentions and mental contrasting',
        'Design a goal architecture that maximises follow-through',
      ],
      content: [
        {
          heading: 'Goal-Setting Theory',
          paragraphs: [
            'Edwin Locke and Gary Latham\'s research — spanning 35+ years and 1,000 studies — established clear principles: specific, difficult goals produce higher performance than vague or easy goals. Goals with feedback outperform goals without. Commitment, self-efficacy, and task complexity moderate the relationship. This isn\'t self-help speculation — it\'s one of the most replicated findings in organisational psychology.',
            'But goal-setting has a dark side. Goals that are too outcome-focused create anxiety. Goals set by others without buy-in produce resistance. Multiple competing goals cause paralysis. And fixation on goals at the expense of systems leads to boom-bust cycles. The science says goals work — but only when implemented correctly.',
          ],
        },
        {
          heading: 'Implementation Intentions',
          paragraphs: [
            'Peter Gollwitzer\'s research on implementation intentions shows that planning when, where, and how you\'ll act on a goal approximately doubles follow-through. The format: "When [situation], I will [behaviour]." Example: "When I finish work on Monday, Wednesday, and Friday, I will go directly to the gym." This transforms a vague goal into a specific plan linked to an environmental cue.',
            'Mental contrasting (Gabriele Oettingen\'s WOOP framework) pairs positive visualisation with obstacle identification: Wish (what you want) → Outcome (how it would feel) → Obstacle (what\'s in the way) → Plan (if-then strategy for the obstacle). This combination is more effective than either positive thinking or defensive pessimism alone.',
          ],
        },
        {
          heading: 'Goal Architecture',
          paragraphs: [
            'High performers don\'t just set goals — they build goal architectures:',
          ],
          bullets: [
            'Outcome goals — the destination ("Lose 10kg," "Run a marathon"). Provides direction but not daily guidance',
            'Performance goals — specific standards ("Train 4x per week," "Eat 140g protein daily"). Provides measurable benchmarks',
            'Process goals — daily actions ("Prepare meals every Sunday," "Walk to work"). Provides the actual system',
            'Identity alignment — connect goals to identity ("I am someone who trains consistently")',
            'Quarterly review — goals should be reviewed and adjusted, not abandoned or blindly followed',
            'Public commitment — sharing goals increases accountability but choose your audience wisely',
          ],
        },
      ],
      unbreakableInsight: 'Goals give you direction. Systems give you results. The person who sets a goal to run a marathon and builds a daily running system will outperform the person who just sets the goal and waits for motivation every single time.',
      coachNote: 'For every outcome goal a client sets, help them identify 3 process goals and 3 implementation intentions. This converts aspiration into architecture.',
      practicalTask: {
        title: 'Goal Architecture Workshop',
        instructions: 'Choose your most important 12-month goal. Build a complete architecture: outcome goal, 3 performance goals, 5 process goals, 3 implementation intentions, and 2 WOOP plans for likely obstacles.',
        reflectionQuestions: [
          'Is your daily system actually aligned with your stated goal?',
          'What is the most likely obstacle, and do you have a plan for it?',
          'Which process goal, if done consistently, would make the outcome inevitable?',
        ],
      },
    },
    {
      number: 9,
      title: 'Integrating Psychology Into Practice',
      learningOutcome: 'Synthesise the full Mindset L4 curriculum into a coherent, personalised approach to psychology-informed practice.',
      assessmentCriteria: [
        'Integrate concepts from multiple units into a cohesive framework',
        'Design a psychology-informed practice model',
        'Create a personal development plan for continued growth',
      ],
      content: [
        {
          heading: 'The Integration Challenge',
          paragraphs: [
            'You\'ve now covered clinical psychology, neuroscience, leadership, social dynamics, and applied practice. The risk is that these remain separate knowledge silos. The power comes from integration — seeing how CBT informs coaching conversations, how neuroscience explains motivation, how social identity drives adherence, and how behaviour change models frame everything you do.',
            'Integration means thinking in systems. A client who drops out isn\'t "unmotivated" — they may have a COM-B barrier (capability/opportunity/motivation), an unmet SDT need (autonomy/competence/relatedness), a stage-of-change mismatch, or a depleted neurochemical state. Your ability to diagnose accurately across these frameworks is what separates informed practice from guesswork.',
          ],
        },
        {
          heading: 'Building Your Framework',
          paragraphs: [
            'Every effective practitioner develops a personal operating framework — a mental model for how they approach their work. Yours should include:',
          ],
          bullets: [
            'Assessment — How do you evaluate where someone is? (Stages of change, COM-B, SDT needs, current mental state)',
            'Relationship — How do you build trust and rapport? (MI spirit, active listening, psychological safety)',
            'Intervention — What tools do you use? (CBT techniques, behavioural activation, goal architecture, identity work)',
            'Support — How do you maintain change? (Community, accountability, resilience building, relapse prevention)',
            'Boundaries — What are your ethical limits? (Scope of practice, referral knowledge, professional standards)',
          ],
        },
        {
          heading: 'Continued Development',
          paragraphs: [
            'This course is a foundation, not a ceiling. The field of psychology continues to evolve. Commit to continued learning: read primary research (not just summaries), attend workshops and conferences, seek supervision or mentorship, practise reflective journaling, and most importantly — apply what you learn. Knowledge without application is entertainment. Knowledge applied is transformation.',
            'The final lesson: you are your own first client. Everything in this course applies to you first. Master your own psychology — your thoughts, emotions, motivation, relationships, identity — and you\'ll have the credibility and capability to help others do the same.',
          ],
        },
      ],
      unbreakableInsight: 'Psychology isn\'t something you study. It\'s something you practice — on yourself first, then with others. The best coaches, leaders, and humans are those who never stop working on their own minds while helping others work on theirs.',
      coachNote: 'Create your personal development plan: 3 areas to deepen, 3 skills to practise, 3 books to read, and a 12-week timeline. Review monthly. The day you stop learning is the day you start becoming irrelevant.',
      practicalTask: {
        title: 'Personal Practice Model',
        instructions: 'Design your integrated psychology-informed practice model on one page. Include: your assessment approach, relationship-building strategy, intervention toolkit, maintenance system, and ethical boundaries. This becomes your professional operating manual.',
        reflectionQuestions: [
          'Which psychological framework from this course resonated most with you?',
          'How will you integrate these concepts into your daily practice?',
          'What is the single biggest insight you\'re taking from Mindset L4?',
        ],
      },
    },
  ],
};

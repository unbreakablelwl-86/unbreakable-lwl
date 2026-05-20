import type { Unit } from '../types';

export const mindsetL4Unit1: Unit = {
  number: 1,
  title: 'Clinical Psychology & Evidence-Based Interventions',
  description: 'Understand the science behind clinical anxiety, depression, and trauma. Learn evidence-based therapeutic frameworks including CBT, ACT, and motivational interviewing — not to become a therapist, but to recognise patterns, support yourself and others more effectively, and know when to refer.',
  chapters: [
    {
      number: 1,
      title: 'Cognitive Behavioural Therapy (CBT) Foundations',
      learningOutcome: 'Understand the CBT model and how cognitive distortions maintain psychological distress.',
      assessmentCriteria: [
        'Explain the CBT triangle (thoughts, feelings, behaviours)',
        'Identify at least five common cognitive distortions',
        'Describe how thought challenging works in practice',
      ],
      content: [
        {
          heading: 'The CBT Model',
          paragraphs: [
            'Cognitive Behavioural Therapy is the most researched psychological intervention in history. Its core premise is deceptively simple: the way we interpret events — not the events themselves — determines how we feel and behave. A thought like "I failed one set, so I\'m weak" isn\'t a fact. It\'s an interpretation. And interpretations can be examined, tested, and changed.',
            'The CBT triangle connects thoughts, emotions, and behaviours in a self-reinforcing loop. Negative automatic thoughts trigger distressing emotions, which drive avoidance behaviours, which create more situations that confirm the negative thoughts. Break any link in the chain and the whole cycle weakens.',
          ],
        },
        {
          heading: 'Common Cognitive Distortions',
          paragraphs: [
            'Cognitive distortions are systematic errors in thinking that feel true but don\'t survive scrutiny. Once you learn to spot them, you see them everywhere — in yourself and others. The goal isn\'t to eliminate negative thinking (that\'s impossible and unnecessary). It\'s to catch distorted thinking before it drives unhelpful behaviour.',
          ],
          bullets: [
            'All-or-nothing thinking — "If I\'m not perfect, I\'m a failure"',
            'Catastrophising — "If I miss this session, my progress is ruined"',
            'Mind reading — "Everyone at the gym is judging me"',
            'Emotional reasoning — "I feel anxious, so something must be wrong"',
            'Should statements — "I should be stronger by now"',
            'Discounting the positive — "That PR doesn\'t count, the bar felt light"',
            'Overgeneralisation — "I always fail when it matters"',
          ],
        },
        {
          heading: 'Thought Challenging in Practice',
          paragraphs: [
            'Thought challenging isn\'t about forcing positive thinking. It\'s about accuracy. When you catch a distorted thought, you ask: What\'s the evidence for this? What\'s the evidence against? What would I tell a friend who thought this? What\'s a more balanced interpretation? The balanced thought isn\'t blindly optimistic — it\'s realistic. "I didn\'t hit my target today, but one session doesn\'t define my trajectory."',
            'This process feels mechanical at first. With practice, it becomes automatic. Elite performers do this instinctively — they reframe setbacks as data rather than verdicts.',
          ],
        },
      ],
      unbreakableInsight: 'Your thoughts are not facts. They are mental events — some accurate, some distorted. Learning to examine them rather than obey them is one of the most powerful skills you can develop.',
      coachNote: 'Start a thought record this week. When you notice a strong negative emotion, write down the situation, the automatic thought, the distortion type, and a balanced alternative. Three entries per day for seven days will shift your awareness permanently.',
      practicalTask: {
        title: 'Cognitive Distortion Audit',
        instructions: 'Over the next 48 hours, keep a pocket notebook. Every time you notice a negative automatic thought, write it down and identify which cognitive distortion it represents. At the end, review the patterns.',
        reflectionQuestions: [
          'Which distortion type appeared most frequently?',
          'Did identifying the distortion reduce its emotional impact?',
          'How would your behaviour change if you responded to the balanced thought instead?',
        ],
      },
    },
    {
      number: 2,
      title: 'Acceptance & Commitment Therapy (ACT)',
      learningOutcome: 'Understand ACT\'s six core processes and how psychological flexibility differs from thought suppression.',
      assessmentCriteria: [
        'Explain the concept of psychological flexibility',
        'Describe cognitive defusion and how it differs from thought challenging',
        'Identify values-based committed action in everyday contexts',
      ],
      content: [
        {
          heading: 'Psychological Flexibility',
          paragraphs: [
            'Where CBT says "challenge the thought," ACT says "change your relationship with it." Acceptance and Commitment Therapy doesn\'t try to reduce negative thoughts or feelings. Instead, it builds the ability to have difficult internal experiences and still move toward what matters. This is psychological flexibility — the skill of being present, open, and doing what matters.',
            'The opposite — psychological rigidity — shows up as fusion with thoughts ("I am anxious" vs "I\'m having the thought that I\'m anxious"), experiential avoidance (refusing to feel discomfort), and disconnection from values. Rigidity predicts poor mental health outcomes across nearly every condition studied.',
          ],
        },
        {
          heading: 'The Six Core Processes',
          paragraphs: [
            'ACT organises psychological flexibility around six interconnected processes. Together they form the "hexaflex" — a model of mental health built not on symptom reduction but on living a rich, meaningful life even in the presence of pain.',
          ],
          bullets: [
            'Acceptance — willingness to experience difficult thoughts and feelings without trying to control or eliminate them',
            'Cognitive defusion — stepping back from thoughts, seeing them as mental events rather than literal truths',
            'Present moment awareness — contacting the here-and-now rather than living in past regrets or future fears',
            'Self-as-context — the observing self that remains constant beneath changing thoughts and emotions',
            'Values — chosen qualities of ongoing action that give life direction and meaning',
            'Committed action — concrete behaviour aligned with values, even when it\'s uncomfortable',
          ],
        },
        {
          heading: 'Defusion Techniques',
          paragraphs: [
            'Cognitive defusion creates distance between you and your thoughts. One technique: take a distressing thought like "I\'m not good enough" and repeat it prefixed with "I notice I\'m having the thought that I\'m not good enough." Another: say the thought in a cartoon voice. These sound silly, but they work by breaking the literal grip of language on emotion.',
            'Defusion doesn\'t make the thought go away. It reduces its power to dictate your behaviour. You can have the thought "I can\'t do this" and still do it. That\'s the point.',
          ],
        },
      ],
      unbreakableInsight: 'Pain is inevitable. Suffering is the struggle against pain. When you stop fighting what you feel and start moving toward what matters, you unlock a different kind of strength — one that doesn\'t depend on feeling good first.',
      coachNote: 'Try this defusion exercise: write your most persistent negative thought on a piece of paper. Carry it in your pocket all day. Notice that you can carry the thought AND live your life. The thought doesn\'t have to stop you.',
      practicalTask: {
        title: 'Values Compass Exercise',
        instructions: 'List your top five values (e.g., growth, connection, health, courage, learning). For each, rate 1-10 how consistently your daily actions align with that value. Choose the lowest-scoring value and design one committed action for this week.',
        reflectionQuestions: [
          'Which values are you living most consistently?',
          'Where is the biggest gap between your values and your actions?',
          'What discomfort are you avoiding that sits between you and a valued action?',
        ],
      },
    },
    {
      number: 3,
      title: 'Understanding Clinical Anxiety',
      learningOutcome: 'Distinguish between normal anxiety and clinical anxiety disorders, and understand evidence-based treatment approaches.',
      assessmentCriteria: [
        'Differentiate adaptive anxiety from anxiety disorders',
        'Describe the maintenance cycle of anxiety through avoidance',
        'Explain graded exposure as a treatment principle',
      ],
      content: [
        {
          heading: 'Anxiety as Adaptation',
          paragraphs: [
            'Anxiety is not a malfunction. It\'s a survival system that evolved to keep you alive. The problem isn\'t anxiety itself — it\'s when the alarm system fires too often, too intensely, or in situations that don\'t warrant it. Clinical anxiety occurs when the fear response becomes disproportionate to the actual threat and begins to significantly impair daily functioning.',
            'The key distinction: normal anxiety is proportionate, time-limited, and doesn\'t prevent you from doing what matters. Clinical anxiety is disproportionate, persistent, and drives increasing avoidance of life activities. One in four people will experience a clinical anxiety disorder in their lifetime.',
          ],
        },
        {
          heading: 'The Avoidance Trap',
          paragraphs: [
            'Avoidance is the fuel that keeps anxiety burning. When you avoid something feared, you get immediate relief — which reinforces the avoidance behaviour. But you never learn that the feared outcome probably wouldn\'t happen, or that you could cope if it did. Each avoidance makes the next encounter more frightening.',
            'Safety behaviours are subtle avoidance: going to the gym but only at quiet times, exercising but checking your heart rate constantly, attending a social event but staying near the exit. They provide the illusion of coping while preventing genuine learning.',
          ],
        },
        {
          heading: 'Graded Exposure',
          paragraphs: [
            'Exposure therapy is the gold standard treatment for anxiety disorders. The principle: deliberately and repeatedly face feared situations in a gradual hierarchy, staying in the situation long enough for the anxiety to naturally reduce (habituation). You learn that anxiety peaks and passes, that feared catastrophes don\'t occur, and that you can tolerate discomfort.',
            'A graded exposure hierarchy starts with low-anxiety situations and progressively moves toward higher challenges. Each step builds confidence and tolerance for the next. The key is consistency and staying in each situation until anxiety reduces — not escaping at the peak.',
          ],
          bullets: [
            'Step 1 — Identify the feared situations and rate anxiety 0-100 for each',
            'Step 2 — Arrange in a hierarchy from lowest to highest anxiety',
            'Step 3 — Start with the lowest item and repeat until anxiety drops below 30',
            'Step 4 — Move to the next step only when the current one feels manageable',
            'Step 5 — Continue until the previously feared situations feel routine',
          ],
        },
      ],
      unbreakableInsight: 'Avoidance feels like protection. It\'s actually a prison. Every time you face what you fear and survive it, the walls get smaller. Every time you avoid it, they grow.',
      coachNote: 'If you recognise clinical anxiety patterns in yourself or a client, graded exposure is powerful but should ideally be guided by a qualified therapist for moderate-to-severe cases. Knowing the principles helps you support the process and understand why avoidance makes things worse.',
      practicalTask: {
        title: 'Anxiety Hierarchy Construction',
        instructions: 'Choose one area where anxiety limits your life (social situations, gym anxiety, public speaking, etc.). List 10 situations related to that fear, rate each 0-100 for anxiety, and arrange them into a graded hierarchy.',
        reflectionQuestions: [
          'Which situations are you currently avoiding?',
          'What safety behaviours do you use in partially-faced situations?',
          'What would you do differently if the anxiety weren\'t there?',
        ],
      },
    },
    {
      number: 4,
      title: 'Understanding Depression',
      learningOutcome: 'Understand the biopsychosocial model of depression and the role of behavioural activation in treatment.',
      assessmentCriteria: [
        'Describe the biopsychosocial model of depression',
        'Explain the withdrawal-inactivity cycle',
        'Outline the principles of behavioural activation',
      ],
      content: [
        {
          heading: 'The Biopsychosocial Model',
          paragraphs: [
            'Depression is not simply a chemical imbalance — that narrative oversimplifies a complex condition. The biopsychosocial model recognises that depression arises from the interaction of biological factors (genetics, neurochemistry, inflammation), psychological factors (thinking patterns, coping styles, past experiences), and social factors (relationships, isolation, life circumstances).',
            'This matters because it means treatment isn\'t one-size-fits-all. Some people respond to medication (biological), some to therapy (psychological), some to lifestyle changes (social/behavioural), and most benefit from a combination. Exercise is one of the strongest evidence-based interventions precisely because it affects all three domains.',
          ],
        },
        {
          heading: 'The Withdrawal Cycle',
          paragraphs: [
            'Depression creates a self-reinforcing withdrawal cycle. Low mood leads to reduced activity. Reduced activity means fewer sources of pleasure and achievement. Fewer rewards reinforce low mood. Lower mood drives further withdrawal. The cycle accelerates until someone is barely functioning — not because they\'re lazy, but because the system that generates motivation and reward has been disrupted.',
            'Understanding this cycle is critical because it shifts blame from character ("they\'re just not trying") to mechanism ("the reward system is suppressed"). This is why telling someone with depression to "just get up and do something" is both technically correct (activity IS the treatment) and practically useless without structured support.',
          ],
        },
        {
          heading: 'Behavioural Activation',
          paragraphs: [
            'Behavioural Activation (BA) is a structured approach that breaks the withdrawal cycle by scheduling activities that provide mastery (sense of achievement) and pleasure. It works from the outside in: rather than waiting to feel motivated, you act first and let the feeling follow. Action precedes motivation — not the other way around.',
            'BA is as effective as CBT and antidepressants for moderate depression and requires less therapist training to deliver. It involves activity monitoring, identifying values-aligned activities, scheduling them into the week, and tracking mood changes. The key insight: you don\'t need to feel like doing something to benefit from doing it.',
          ],
          bullets: [
            'Start small — even a 10-minute walk counts as a win',
            'Schedule, don\'t decide in the moment — mood-dependent decisions lead to avoidance',
            'Track mastery and pleasure ratings (0-10) after each activity',
            'Gradually increase activity level as the reward system reactivates',
            'Include social contact — isolation is both symptom and cause',
          ],
        },
      ],
      unbreakableInsight: 'Depression lies. It tells you nothing will help, nothing matters, and you don\'t have the energy. The single most powerful thing you can do is act despite the lie. Start impossibly small. One walk. One meal. One conversation. Stack from there.',
      coachNote: 'If you suspect clinical depression in yourself or someone you\'re working with, professional support is essential. But behavioural activation principles can be applied immediately alongside professional treatment — exercise, routine, social contact, and small daily goals.',
      practicalTask: {
        title: 'Activity-Mood Monitoring',
        instructions: 'For 3 days, log every activity and rate your mood before (0-10) and after (0-10). Identify which activities consistently improve mood and which drain it. Use this data to design an intentional week.',
        reflectionQuestions: [
          'Which activities produced the biggest positive mood shift?',
          'Were there activities you expected to enjoy but didn\'t (and vice versa)?',
          'How does this data compare to how you spend a typical unstructured day?',
        ],
      },
    },
    {
      number: 5,
      title: 'Motivational Interviewing',
      learningOutcome: 'Understand the principles of motivational interviewing and how to use them in coaching and self-change contexts.',
      assessmentCriteria: [
        'Explain the four processes of motivational interviewing',
        'Describe the concept of change talk vs sustain talk',
        'Apply reflective listening in a behaviour change conversation',
      ],
      content: [
        {
          heading: 'The Spirit of MI',
          paragraphs: [
            'Motivational Interviewing (MI) was developed by William Miller and Stephen Rollnick as a way to help people resolve ambivalence about change. Its core insight: most people who aren\'t changing aren\'t lacking information — they\'re stuck between wanting to change and wanting to stay the same. Pushing harder usually increases resistance.',
            'MI works by evoking the person\'s own reasons for change rather than imposing external ones. The "spirit" of MI rests on four pillars: partnership (collaborative, not authoritarian), acceptance (respecting autonomy), compassion (prioritising the person\'s welfare), and evocation (drawing out their own motivation rather than installing yours).',
          ],
        },
        {
          heading: 'The Four Processes',
          paragraphs: [
            'MI follows four overlapping processes: Engaging (building rapport and trust), Focusing (agreeing on the direction of change), Evoking (eliciting the person\'s own motivation), and Planning (developing a concrete change plan). These aren\'t rigid stages — you cycle between them throughout a conversation.',
          ],
          bullets: [
            'Engaging — Open questions, affirmations, reflective listening, summarising (OARS)',
            'Focusing — "What matters most to you right now?"',
            'Evoking — "Why would you want to make this change?" "What would be different?"',
            'Planning — "What would a first step look like?" "How confident are you?"',
          ],
        },
        {
          heading: 'Change Talk & Sustain Talk',
          paragraphs: [
            'Change talk is any speech that favours change: "I want to get healthier," "I need to stop skipping sessions." Sustain talk favours the status quo: "I don\'t have time," "It\'s not that bad." The MI practitioner\'s job is to amplify change talk and explore (not argue with) sustain talk.',
            'A powerful technique: when someone expresses ambivalence ("I want to train but I\'m always tired"), reflect the change side back to them: "Getting fitter matters to you, even when energy is low." This isn\'t manipulation — it\'s selectively reinforcing what they\'ve already said they want.',
          ],
        },
      ],
      unbreakableInsight: 'You cannot force anyone to change — including yourself through willpower alone. But you can create the conditions where change becomes the person\'s own idea. That\'s when it sticks.',
      coachNote: 'Next time someone tells you they want to change but can\'t, resist the urge to give advice immediately. Instead, ask: "On a scale of 1-10, how important is this change to you?" Then: "Why a [number] and not a 1?" Watch what happens when they argue for their own change.',
      practicalTask: {
        title: 'MI Conversation Practice',
        instructions: 'Have a 10-minute conversation with someone about a change they\'re considering. Use only OARS: Open questions, Affirmations, Reflective listening, and Summarising. Do not give advice.',
        reflectionQuestions: [
          'How did it feel to listen without advising?',
          'Did the other person generate their own solutions?',
          'What change talk did you notice?',
        ],
      },
    },
    {
      number: 6,
      title: 'Trauma & Post-Traumatic Growth',
      learningOutcome: 'Understand the psychology of trauma, its neurological basis, and how post-traumatic growth occurs.',
      assessmentCriteria: [
        'Describe the neurobiological basis of trauma responses',
        'Explain the difference between PTSD and post-traumatic growth',
        'Identify trauma-sensitive approaches in coaching contexts',
      ],
      content: [
        {
          heading: 'What Trauma Does to the Brain',
          paragraphs: [
            'Trauma isn\'t about the event — it\'s about the nervous system\'s response. Two people can experience the same event and one develops PTSD while the other doesn\'t. The difference lies in how the brain processes and stores the memory. In trauma, the amygdala (threat detection) becomes hyperactive, the prefrontal cortex (rational thinking) goes offline, and the hippocampus (memory filing) fails to process the experience properly.',
            'This creates a memory that isn\'t "filed away" as past. Instead, it remains raw and present — triggers can replay the full emotional and physiological response as if the event is happening now. This is why trauma responses seem irrational from the outside but are neurologically logical from the inside.',
          ],
        },
        {
          heading: 'Post-Traumatic Growth',
          paragraphs: [
            'Post-traumatic growth (PTG) describes the positive psychological change that can emerge from the struggle with highly challenging life circumstances. This isn\'t about "silver linings" or minimising suffering. It\'s the documented phenomenon that some people, after processing trauma, develop greater appreciation for life, stronger relationships, new possibilities, increased personal strength, and spiritual or existential growth.',
            'PTG doesn\'t replace the pain — it coexists with it. Growth and grief can occupy the same space. The key factor is deliberate rumination: actively processing the experience rather than suppressing or being overwhelmed by it. This usually requires support — professional or social.',
          ],
        },
        {
          heading: 'Trauma-Sensitive Coaching',
          paragraphs: [
            'If you\'re a coach or leader, you will work with people carrying trauma. Trauma-sensitive practice means creating physical and psychological safety, offering choice and control, being predictable and transparent, and never pushing someone into exposure without their informed consent. It means reading nervous system signals — a client who freezes, dissociates, or becomes hyper-reactive may be in a trauma response, not being "difficult."',
          ],
          bullets: [
            'Always offer choice — "Would you prefer to try this or that?"',
            'Avoid surprise physical contact or unexpected loud cues',
            'Notice freeze/shutdown responses and respond with calm, not pressure',
            'Create predictable session structures — routine reduces threat',
            'Know your scope — refer to qualified trauma therapists when needed',
          ],
        },
      ],
      unbreakableInsight: 'Trauma doesn\'t make you broken. It means your nervous system is doing exactly what it was designed to do — protect you. Recovery isn\'t about forgetting. It\'s about teaching your brain that the danger has passed and you survived.',
      coachNote: 'If someone discloses trauma to you, the best response is: "Thank you for trusting me with that. How can I best support you?" Don\'t try to fix it, minimise it, or share your own trauma in response. Listen, validate, and refer appropriately.',
      practicalTask: {
        title: 'Trauma-Informed Environment Audit',
        instructions: 'Evaluate your training environment (gym, class, coaching space) through a trauma-sensitive lens. Identify three aspects that promote safety and three that could be improved.',
        reflectionQuestions: [
          'How predictable and structured is the environment?',
          'How much choice and autonomy do participants have?',
          'What would you change to make someone with a trauma history feel safer?',
        ],
      },
    },
    {
      number: 7,
      title: 'Sleep Psychology & Circadian Science',
      learningOutcome: 'Understand the psychology of sleep disorders, circadian rhythm regulation, and evidence-based sleep interventions.',
      assessmentCriteria: [
        'Describe the two-process model of sleep regulation',
        'Explain the principles of stimulus control therapy for insomnia',
        'Identify behaviours that disrupt and support circadian rhythm alignment',
      ],
      content: [
        {
          heading: 'The Two-Process Model',
          paragraphs: [
            'Sleep is regulated by two independent systems working in parallel. Process S (sleep pressure) builds during waking hours as adenosine accumulates — the longer you\'re awake, the stronger the drive to sleep. Process C (circadian rhythm) is your 24-hour internal clock, controlled by the suprachiasmatic nucleus in the hypothalamus, that determines when you feel alert and when you feel sleepy regardless of how long you\'ve been awake.',
            'Good sleep happens when both systems align — high sleep pressure meeting the circadian dip. Insomnia often results from disruption to one or both: caffeine blocks adenosine (reducing Process S), irregular schedules confuse Process C, and anxiety keeps the arousal system active despite both processes signalling sleep.',
          ],
        },
        {
          heading: 'Cognitive Behavioural Therapy for Insomnia (CBT-I)',
          paragraphs: [
            'CBT-I is the first-line treatment for chronic insomnia — more effective than sleeping pills in the long term, with no side effects. It combines sleep restriction (limiting time in bed to match actual sleep time), stimulus control (bed = sleep only, not screens or worry), sleep hygiene, cognitive restructuring (challenging catastrophic thoughts about sleep), and relaxation training.',
            'The counterintuitive core: spending less time in bed initially increases sleep efficiency. If you\'re sleeping 5 hours but spending 8 hours in bed, restrict to 5.5 hours. This concentrates sleep pressure, improves sleep quality, and you gradually extend as efficiency improves. It\'s uncomfortable but remarkably effective.',
          ],
          bullets: [
            'Go to bed only when sleepy — not at a scheduled time',
            'If awake for >15 minutes, get up and do something calm in dim light',
            'Wake at the same time every day regardless of sleep quality',
            'No napping (initially) — build sleep pressure',
            'Bed is for sleep only — no phones, no TV, no worrying',
          ],
        },
        {
          heading: 'Circadian Rhythm Alignment',
          paragraphs: [
            'Your circadian rhythm is set primarily by light exposure. Morning bright light (ideally sunlight within 30 minutes of waking) advances the clock and promotes alertness. Evening light exposure (especially blue light from screens) delays the clock and suppresses melatonin. Temperature also matters — a cooling body signals sleep onset, which is why a cool bedroom promotes better sleep.',
            'Chronotype (morning lark vs night owl) is largely genetic and should be respected rather than fought. However, most people\'s circadian clocks run slightly longer than 24 hours, which means without morning light anchoring, the clock drifts later over time. Consistent morning light exposure is the single most powerful circadian intervention.',
          ],
        },
      ],
      unbreakableInsight: 'Sleep isn\'t a luxury or a reward for a productive day. It\'s the foundation everything else is built on. Protect your sleep the way you protect your training — with structure, consistency, and non-negotiable boundaries.',
      coachNote: 'If you or a client struggle with sleep, start with two changes only: consistent wake time (every day, including weekends) and morning light exposure. These anchor the circadian rhythm and produce noticeable improvements within 1-2 weeks.',
      practicalTask: {
        title: 'Sleep Efficiency Assessment',
        instructions: 'Track your sleep for 5 nights: record time into bed, estimated time to fall asleep, any wake-ups, final wake time, and time out of bed. Calculate sleep efficiency: (total sleep ÷ total time in bed) × 100. Target: >85%.',
        reflectionQuestions: [
          'What is your current sleep efficiency percentage?',
          'Which stimulus control rules are you currently violating?',
          'What is one change you can implement immediately?',
        ],
      },
    },
    {
      number: 8,
      title: 'Addiction, Habit Loops & Compulsive Behaviour',
      learningOutcome: 'Understand the neuroscience of addiction and compulsive behaviour, and how these principles apply to everyday habits.',
      assessmentCriteria: [
        'Explain the dopaminergic reward pathway and its role in addiction',
        'Describe the habit loop and how it applies to compulsive behaviours',
        'Identify evidence-based strategies for breaking maladaptive habit cycles',
      ],
      content: [
        {
          heading: 'The Reward Pathway',
          paragraphs: [
            'Addiction hijacks the brain\'s reward system — specifically the mesolimbic dopamine pathway connecting the ventral tegmental area (VTA) to the nucleus accumbens. Dopamine doesn\'t just signal pleasure; it signals prediction of reward. Over time, addictive substances and behaviours cause the brain to release massive dopamine surges that dwarf natural rewards, resetting the baseline so that normal pleasures feel flat.',
            'This neuroadaptation explains tolerance (needing more for the same effect) and withdrawal (feeling worse than before when the substance is removed). It also explains why addiction is not a choice or moral failure — it\'s a neurological hijacking of the system designed to motivate survival behaviours.',
          ],
        },
        {
          heading: 'The Habit Loop Extended',
          paragraphs: [
            'Every habit — constructive or destructive — runs on the same loop: cue, routine, reward. For compulsive behaviours, the cue is often an emotional state (stress, boredom, loneliness), the routine is the behaviour (scrolling, eating, drinking, gambling), and the reward is temporary relief from the emotional state. The behaviour is maintained not by the reward itself but by the prediction of relief.',
            'Breaking a maladaptive habit requires intervening at the cue (change the environment), the routine (substitute a healthier behaviour that provides similar emotional relief), or the reward (make the consequences of the behaviour more salient). Most approaches fail because they rely solely on willpower — trying to resist the routine without addressing the cue or the reward.',
          ],
        },
        {
          heading: 'Evidence-Based Approaches',
          paragraphs: [
            'Effective interventions for compulsive behaviours combine multiple strategies. Environmental design removes or reduces cues. Implementation intentions ("If X happens, I will do Y instead") pre-load alternative routines. Mindfulness-based relapse prevention teaches people to observe cravings without acting on them — "urge surfing." Social support provides accountability and alternative reward.',
          ],
          bullets: [
            'Remove cues — phone in another room, don\'t keep trigger foods in the house',
            'Substitute routines — when stressed, walk instead of scroll',
            'Urge surf — observe the craving, note its intensity, let it pass (typically 15-20 minutes)',
            'Delay — commit to waiting 10 minutes before acting on any compulsion',
            'Track — awareness of frequency is often enough to reduce automatic behaviour',
          ],
        },
      ],
      unbreakableInsight: 'Every behaviour you repeat is solving a problem — even the destructive ones. To change the behaviour, you must first understand what problem it\'s solving, then find a better solution for that same problem.',
      coachNote: 'Addiction and compulsive behaviour are not character flaws. They\'re learned neurological patterns that can be unlearned with the right support and environmental changes. If someone is struggling with substance dependency, professional support is essential.',
      practicalTask: {
        title: 'Habit Loop Deconstruction',
        instructions: 'Choose one habit you want to change (compulsive phone checking, late-night snacking, etc.). For 3 days, track every occurrence: what was the cue (time, place, emotion), what was the routine, and what reward did you get?',
        reflectionQuestions: [
          'What emotional state most frequently triggers the behaviour?',
          'What healthier routine could provide a similar reward?',
          'What environmental change would eliminate or reduce the cue?',
        ],
      },
    },
    {
      number: 9,
      title: 'When to Refer & Professional Boundaries',
      learningOutcome: 'Understand the scope of practice for non-clinicians and recognise the signs that warrant professional referral.',
      assessmentCriteria: [
        'Identify red flags that indicate clinical-level psychological distress',
        'Describe appropriate referral pathways in the UK',
        'Explain the importance of scope of practice and professional boundaries',
      ],
      content: [
        {
          heading: 'Scope of Practice',
          paragraphs: [
            'Understanding psychology doesn\'t make you a therapist. This distinction is not just ethical — it\'s practical. A coach, personal trainer, or knowledgeable friend can support mental wellbeing through exercise programming, lifestyle guidance, active listening, and informed signposting. But clinical conditions — active suicidal ideation, psychosis, severe depression, eating disorders, PTSD — require qualified professionals with clinical training.',
            'The danger of overstepping isn\'t just incompetence — it\'s harm. Well-meaning but unskilled attempts to address clinical issues can make them worse. The most helpful thing a non-clinician can do is recognise the boundary and facilitate appropriate referral.',
          ],
        },
        {
          heading: 'Red Flags Requiring Referral',
          paragraphs: [
            'Learn these warning signs. Any of them warrants a conversation about professional support:',
          ],
          bullets: [
            'Suicidal thoughts or self-harm — urgent referral (Samaritans: 116 123, NHS Crisis: 111)',
            'Persistent low mood lasting more than 2 weeks with functional impairment',
            'Panic attacks — recurrent, unexpected episodes of intense fear with physical symptoms',
            'Disordered eating — restrictive intake, binge-purge cycles, extreme body image distortion',
            'Substance misuse — inability to control use despite negative consequences',
            'Psychotic symptoms — hallucinations, delusions, disorganised thinking',
            'Trauma responses — flashbacks, nightmares, hypervigilance following a traumatic event',
            'Significant anxiety — avoidance that prevents normal daily activities',
          ],
        },
        {
          heading: 'Making the Referral',
          paragraphs: [
            'Suggesting professional help requires sensitivity. Frame it positively: "I think talking to someone who specialises in this could really help — not because something\'s wrong with you, but because you deserve proper support." Normalise it: "A lot of people I respect work with therapists." Offer practical next steps: "Your GP is a good starting point — they can refer you to IAPT (Improving Access to Psychological Therapies) for free NHS support."',
            'In the UK, key pathways include: NHS Talking Therapies (self-referral or GP referral), private therapy (BACP/BPS registered therapists), Mind charity helpline, and for immediate risk, A&E or 999. Having this information readily available is part of responsible practice.',
          ],
        },
      ],
      unbreakableInsight: 'Knowing your limits isn\'t weakness — it\'s the highest form of responsibility. The bravest thing you can do for someone in distress is connect them with someone qualified to help, rather than trying to be the hero yourself.',
      coachNote: 'Create a simple referral document: local GP details, NHS Talking Therapies self-referral link, Samaritans number, Mind helpline, and 2-3 local private therapists. Having this ready means you can act immediately when someone needs it.',
      practicalTask: {
        title: 'Referral Pathway Document',
        instructions: 'Create a one-page referral resource sheet with at least 5 professional support options available in your area, including free and paid services, crisis lines, and self-referral pathways.',
        reflectionQuestions: [
          'Could you confidently signpost someone to professional help right now?',
          'Have you ever been in a situation where you should have referred but didn\'t?',
          'How would you approach the conversation if someone disclosed distress to you?',
        ],
      },
    },
  ],
};

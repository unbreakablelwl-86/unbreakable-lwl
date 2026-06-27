import { getUniversityImage } from '@/lib/university/imageMap';
import type { Unit } from '../types';

export const mindsetL3Unit1: Unit = {
  number: 1,
  title: 'Advanced Stress Physiology & Emotional Mastery',
  description: 'Explore the neuroscience of stress, advanced emotional regulation strategies, and evidence-based techniques for transforming your relationship with pressure.',
  chapters: [
    {
      number: 1,
      title: 'The Neuroscience of Stress',
      learningOutcome: 'Understand the detailed neurological pathways of stress, including the HPA axis, neurotransmitter cascades, and the distinction between acute and chronic stress at a cellular level.',
      assessmentCriteria: [
        'Describe the hypothalamic-pituitary-adrenal (HPA) axis and its role in stress regulation',
        'Explain the difference between eustress and distress at a physiological level',
        'Identify the effects of chronic cortisol elevation on the brain, immune system, and metabolism',
      ],
      content: [
        {
          heading: 'The HPA Axis — Your Stress Command Centre',
          paragraphs: [
            'The hypothalamic-pituitary-adrenal (HPA) axis is the body\'s central stress response system. When your brain detects a threat — real or perceived — the hypothalamus releases corticotropin-releasing hormone (CRH), which signals the pituitary gland to release adrenocorticotropic hormone (ACTH). ACTH then travels through the bloodstream to the adrenal glands, triggering cortisol release.',
            'This cascade is designed to be rapid and self-limiting. Cortisol feeds back to the hypothalamus and pituitary to shut down the response once the threat passes. Problems arise when this feedback loop becomes dysregulated through chronic stress — the system stays "on" when it should be switching off.',
          ],
          imageUrl: getUniversityImage('mindl3-u1-ch1-neuroscience-stress'),
          imageAlt: 'HPA axis pathway diagram showing hypothalamus, pituitary gland, and adrenal cortex with cortisol feedback loops',
          imagePlaceholder: 'Diagram of the HPA axis showing the hypothalamus, pituitary gland, and adrenal glands with CRH, ACTH, and cortisol feedback loops clearly labelled',
        },
        {
          heading: 'Eustress vs Distress',
          paragraphs: [
            'Not all stress is harmful. Eustress — positive stress — drives adaptation and growth. A challenging workout, an important presentation, or learning a new skill all create eustress. Your body responds with the same hormonal cascade, but the duration is short, the recovery is complete, and the outcome is beneficial.',
            'Distress occurs when stress exceeds your capacity to cope, or when it becomes chronic without adequate recovery. The same hormones that enhance performance in short bursts cause damage when sustained: cortisol suppresses immune function, disrupts sleep architecture, promotes visceral fat storage, and impairs hippocampal function (memory and learning).',
          ],
          bullets: [
            'Eustress — Short-duration, within coping capacity, leads to adaptation and growth',
            'Distress — Prolonged, exceeds coping resources, causes physiological damage',
            'Allostatic load — The cumulative wear and tear of chronic stress on body systems',
            'The same stressor can be eustress or distress depending on your perception and recovery state',
          ],
        },
        {
          heading: 'Chronic Cortisol — The Silent Damage',
          paragraphs: [
            'When cortisol stays elevated, the consequences are wide-ranging. In the brain, chronic cortisol shrinks the hippocampus (impairing memory) while enlarging the amygdala (increasing anxiety). It disrupts the prefrontal cortex, reducing your capacity for rational decision-making and impulse control.',
            'Metabolically, sustained cortisol promotes insulin resistance, increases appetite for high-calorie foods, and preferentially deposits fat around the abdomen. Immune function is suppressed, increasing susceptibility to illness. Sleep architecture is disrupted, with reduced deep sleep and fragmented REM — creating a vicious cycle where poor sleep further elevates cortisol.',
          ],
        },
      ],
      unbreakableInsight: 'Stress is not something that happens to you — it is something your nervous system creates. Understanding the mechanism gives you the power to intervene at multiple points in the cascade.',
      coachNote: 'Track your stress signals for a week — jaw tension, shallow breathing, disrupted sleep. Awareness is the first intervention. You cannot manage what you refuse to notice.',
      practicalTask: {
        title: 'HPA Axis Awareness Audit',
        instructions: 'Over three days, note every moment you feel a stress response activate. Record the trigger, your physical sensations, how long the response lasted, and what (if anything) resolved it. Identify which were eustress and which were distress.',
        reflectionQuestions: [
          'Which stress responses resolved quickly, and which lingered? What was different?',
          'Were any of your stress responses disproportionate to the actual threat?',
          'What patterns did you notice in your stress triggers across the three days?',
        ],
      },
    },
    {
      number: 2,
      title: 'Emotional Regulation Strategies',
      learningOutcome: 'Apply evidence-based emotional regulation techniques including cognitive reappraisal, affect labelling, and distress tolerance to manage emotional responses effectively.',
      assessmentCriteria: [
        'Explain cognitive reappraisal and how it alters the emotional impact of events',
        'Describe the neuroscience behind affect labelling and its calming effect',
        'Apply distress tolerance techniques to manage intense emotional states without avoidance',
      ],
      content: [
        {
          heading: 'Cognitive Reappraisal — Changing the Meaning',
          paragraphs: [
            'Cognitive reappraisal is the process of deliberately reinterpreting the meaning of a situation to change your emotional response. Unlike suppression (which tries to push emotions down), reappraisal changes the emotion at its source by altering how you perceive the event.',
            'Research shows that reappraisal reduces amygdala activation and increases prefrontal cortex engagement. It is not about pretending something is fine — it is about finding a more accurate, balanced, or useful interpretation. "This is a disaster" becomes "This is a setback I can learn from." The facts remain the same; your relationship to them changes.',
          ],
          imageUrl: getUniversityImage('mindl3-u1-ch2-emotional-regulation'),
          imageAlt: 'Emotional regulation strategies comparing cognitive reappraisal and suppression pathways with window of tolerance zones',
          imagePlaceholder: 'Flowchart comparing emotional suppression vs cognitive reappraisal pathways, showing brain regions involved and long-term outcomes for each strategy',
        },
        {
          heading: 'Affect Labelling — Name It to Tame It',
          paragraphs: [
            'Affect labelling is the practice of putting a precise name to what you are feeling. Research by Matthew Lieberman at UCLA shows that verbalising emotions — even silently — reduces amygdala activity by up to 50%. The act of labelling recruits the prefrontal cortex, which naturally dampens the emotional intensity.',
            'The key is precision. "I feel bad" is less effective than "I feel frustrated because I expected a different outcome." The more specific your label, the greater the regulatory effect. This is why journaling about emotions is so powerful — it forces precise labelling.',
          ],
          bullets: [
            'Simple labelling — "I am feeling anxious" reduces amygdala activation',
            'Detailed labelling — Adding context and cause increases the regulatory effect',
            'Written labelling — Journaling produces the strongest and most lasting emotional regulation',
            'Third-person labelling — Referring to yourself by name ("James feels frustrated") creates additional psychological distance',
          ],
        },
        {
          heading: 'Distress Tolerance',
          paragraphs: [
            'Sometimes emotions cannot be immediately resolved — you must sit with discomfort. Distress tolerance skills help you endure intense emotional states without reacting impulsively or resorting to avoidance behaviours (scrolling, eating, drinking, withdrawing).',
            'The TIPP technique from Dialectical Behaviour Therapy is highly effective: Temperature (cold water on face activates the dive reflex), Intense exercise (burns off adrenaline), Paced breathing (4-second inhale, 8-second exhale), and Progressive muscle relaxation. These physiological interventions change your body state, which in turn changes your emotional state.',
          ],
        },
      ],
      unbreakableInsight: 'You do not control what emotions arise. You do control what you do with them. Regulation is not suppression — it is intelligent processing.',
      coachNote: 'Start with affect labelling — it is the simplest and most immediate technique. Before reacting to anything, pause and name exactly what you are feeling. The pause itself is transformative.',
      practicalTask: {
        title: 'Reappraisal Practice Journal',
        instructions: 'For one week, record three situations each day that triggered a negative emotional response. For each, write the automatic interpretation, then write an alternative reappraisal. Note how the reappraisal changed (or did not change) your emotional intensity.',
        reflectionQuestions: [
          'Which situations were easiest to reappraise, and which resisted reinterpretation?',
          'Did regular practice change how quickly you could generate alternative interpretations?',
          'How did affect labelling change your experience of strong emotions during the week?',
        ],
      },
    },
    {
      number: 3,
      title: 'Flow States & Peak Performance',
      learningOutcome: 'Understand the neuroscience of flow states, the conditions required to enter flow, and how to design your environment and tasks to maximise the frequency of peak performance experiences.',
      assessmentCriteria: [
        'Define flow state and describe its neurochemical signature',
        'Identify the conditions required for flow: challenge-skill balance, clear goals, and immediate feedback',
        'Explain how to structure training and work environments to increase flow probability',
      ],
      content: [
        {
          heading: 'What Is Flow?',
          paragraphs: [
            'Flow state — described by psychologist Mihaly Csikszentmihalyi — is a state of complete absorption where self-consciousness dissolves, time perception alters, and performance peaks. During flow, the prefrontal cortex undergoes temporary hypofrontality: it partially deactivates, silencing the inner critic and allowing implicit learning systems to drive action.',
            'Neurochemically, flow involves a cascade of norepinephrine, dopamine, endorphins, anandamide, and serotonin. This cocktail enhances focus, pattern recognition, lateral thinking, and pain tolerance simultaneously. Flow is not just about feeling good — research shows it can increase productivity by 200–500%.',
          ],
          imageUrl: getUniversityImage('mindl3-u1-ch3-flow-states'),
          imageAlt: 'Flow state channel diagram showing skill vs challenge axes with optimal zone between anxiety and boredom',
          imagePlaceholder: 'Diagram showing the flow channel — the zone between anxiety (challenge too high) and boredom (skill too high) with the optimal challenge-skill balance highlighted',
        },
        {
          heading: 'The Conditions for Flow',
          paragraphs: [
            'Flow does not happen by accident. Research identifies three core conditions: challenge-skill balance (the task must be approximately 4% beyond your current ability), clear proximal goals (you know exactly what to do next), and immediate feedback (you can see whether your actions are working in real time).',
            'Additional triggers include deep embodiment (physical engagement), high consequences (real stakes), rich environments (novelty and complexity), and creativity (pattern recognition demands). Understanding these triggers allows you to engineer your training sessions and work blocks for maximum flow probability.',
          ],
          bullets: [
            'Challenge-skill balance — Task difficulty 4% above current ability (the "stretch zone")',
            'Clear goals — Know precisely what you are aiming to achieve in this moment',
            'Immediate feedback — See the results of your actions without delay',
            'Uninterrupted focus — Minimum 20 minutes without distraction to enter flow',
            'Intrinsic motivation — Genuine interest in the task, not purely external reward',
          ],
        },
        {
          heading: 'Engineering Flow in Training',
          paragraphs: [
            'Your gym sessions are prime flow territory. Progressive overload naturally creates the challenge-skill balance. Clear rep and weight targets provide goals. Real-time physical feedback (the weight moves or it does not) is immediate. The key additions are: eliminating distractions (phone in locker), using music that matches the session intensity, and structuring sessions so difficulty escalates naturally.',
            'Flow also requires a "struggle phase" — a period of difficulty before the breakthrough. Many people quit during this phase, mistaking struggle for failure. Understanding the flow cycle (struggle → release → flow → recovery) helps you persist through the uncomfortable early minutes of a session.',
          ],
        },
      ],
      unbreakableInsight: 'Flow is not a gift — it is an engineering problem. Design the right conditions, show up consistently, and peak performance becomes a regular occurrence rather than a rare accident.',
      coachNote: 'Start by removing the single biggest flow-killer: your phone. Put it in your bag during training. The uninterrupted focus window is the most important trigger you control.',
      practicalTask: {
        title: 'Flow Session Design',
        instructions: 'Design and execute three training sessions specifically optimised for flow using the triggers outlined. Record pre-session setup, moments you felt closest to flow, and what disrupted it. Compare the three sessions.',
        reflectionQuestions: [
          'What was the difference in training quality between your flow-optimised sessions and normal sessions?',
          'Which flow trigger had the biggest impact on your focus and performance?',
          'What consistently disrupted your focus, and how could you eliminate it?',
        ],
      },
    },
    {
      number: 4,
      title: 'Trauma, Adversity & Post-Traumatic Growth',
      learningOutcome: 'Understand the psychological impact of trauma and adversity, recognise the boundaries of your competence as a non-clinical practitioner, and identify the conditions that facilitate post-traumatic growth.',
      assessmentCriteria: [
        'Distinguish between acute stress reactions, PTSD, and post-traumatic growth',
        'Explain the conditions under which adversity can lead to personal growth',
        'Identify when emotional difficulties exceed personal coping and professional help is needed',
      ],
      content: [
        {
          heading: 'Understanding Trauma Responses',
          paragraphs: [
            'Trauma is not defined by what happened to you — it is defined by how your nervous system responded and whether that response became stuck. Acute stress reactions (heightened arousal, intrusive thoughts, emotional numbness) are normal after adverse events and typically resolve within weeks. When these responses persist beyond a month and significantly impair daily functioning, post-traumatic stress disorder (PTSD) may be present.',
            'PTSD involves changes in brain structure and function: an overactive amygdala, a suppressed prefrontal cortex, and a hippocampus that struggles to process traumatic memories into narrative form. The memory remains "live" — triggered by sensory cues that replay the experience as though it were happening now.',
          ],
          imageUrl: getUniversityImage('mindl3-u1-ch4-post-traumatic-growth'),
          imageAlt: 'Post-traumatic growth trajectory showing decline after adversity then surpassing baseline with five PTG domains',
          imagePlaceholder: 'Diagram showing the spectrum from normal stress response through acute stress reaction to PTSD, with timeline markers and key symptoms at each stage',
        },
        {
          heading: 'Post-Traumatic Growth',
          paragraphs: [
            'Post-traumatic growth (PTG) describes positive psychological changes that emerge from the struggle with highly challenging life events. Identified by researchers Tedeschi and Calhoun, PTG manifests in five domains: greater appreciation for life, improved personal relationships, increased sense of personal strength, recognition of new possibilities, and spiritual or existential development.',
            'PTG does not mean trauma was beneficial or necessary. It means that the process of rebuilding after trauma can, under the right conditions, lead to personal development that would not have occurred otherwise. The conditions include: adequate social support, deliberate reflective processing (not avoidance), and sufficient time.',
          ],
          bullets: [
            'Greater appreciation — Valuing daily experiences that were previously taken for granted',
            'Deeper relationships — Increased empathy and emotional connection with others',
            'Personal strength — "If I survived that, I can handle this"',
            'New possibilities — Discovering paths and interests that emerged from the struggle',
            'Existential clarity — Deeper understanding of what matters and why',
          ],
        },
        {
          heading: 'Knowing Your Boundaries',
          paragraphs: [
            'This course teaches you about mental resilience for personal development — it does not qualify you to treat trauma, mental illness, or psychological disorders. Knowing the boundary between personal growth techniques and clinical intervention is essential.',
            'Refer to professional help when: thoughts of self-harm or suicide are present, daily functioning is significantly impaired for more than two weeks, substance use is being used to cope, panic attacks are frequent, or traumatic memories are causing flashbacks or severe avoidance. Mental health professionals (clinical psychologists, psychiatrists, counsellors) are trained to provide evidence-based treatment for these conditions.',
          ],
        },
      ],
      unbreakableInsight: 'Growth does not require trauma. But when adversity hits — and it will — understanding that growth is possible changes everything about how you approach the struggle.',
      coachNote: 'If any of this content resonates because of your own experiences, that is worth noticing. Seeking professional support is not weakness — it is the most resilient thing you can do.',
      practicalTask: {
        title: 'Adversity Reflection',
        instructions: 'Reflect on a past challenge or difficult period in your life (not recent trauma). Identify which, if any, of the five PTG domains you have experienced as a result. Consider what conditions supported your growth and what made recovery harder.',
        reflectionQuestions: [
          'Which domain of post-traumatic growth resonates most with your experience?',
          'What role did social support play in your recovery from the difficult period?',
          'How has your perspective on that experience changed over time?',
        ],
      },
    },
    {
      number: 5,
      title: 'Psychophysiology of Confidence',
      learningOutcome: 'Understand how confidence is built and maintained through physiological states, competence development, and cognitive framing, and apply strategies to build genuine self-efficacy.',
      assessmentCriteria: [
        'Explain the relationship between physiology, cognition, and confidence',
        'Distinguish between genuine self-efficacy and performative confidence',
        'Apply evidence-based strategies for building lasting confidence through competence and exposure',
      ],
      content: [
        {
          heading: 'Confidence Is a Physiological State',
          paragraphs: [
            'Confidence is not just a thought — it is a bodily state. Research by Amy Cuddy and subsequent studies show that posture, breathing rate, and hormonal profiles all influence subjective confidence. Testosterone is associated with assertiveness and risk-taking; cortisol with anxiety and hesitation. The ratio between them — the T/C ratio — correlates with behavioural confidence.',
            'This is not about "power posing" as a quick fix. It is about understanding that your body state influences your psychological state. Chronic poor posture, shallow breathing, and physical inactivity create a physiological profile that undermines confidence regardless of your achievements.',
          ],
          imageUrl: getUniversityImage('mindl3-u1-ch5-confidence'),
          imageAlt: 'Psychophysiology of confidence showing self-efficacy building blocks, mastery experiences, and confidence-competence loop',
          imagePlaceholder: 'Infographic showing the bidirectional relationship between physiology (posture, breathing, hormones) and psychology (confidence, self-efficacy, risk tolerance)',
        },
        {
          heading: 'Self-Efficacy vs Performative Confidence',
          paragraphs: [
            'Albert Bandura defined self-efficacy as your belief in your ability to succeed at specific tasks. It is built through four sources: mastery experiences (actually doing the thing successfully), vicarious experiences (seeing someone similar succeed), verbal persuasion (encouragement from credible sources), and physiological states (feeling physically capable).',
            'Performative confidence — appearing confident without substance — is fragile and collapses under pressure. Genuine self-efficacy is built through progressive exposure and competence development. Each small success becomes evidence that you can handle the next challenge. This is why progressive overload in the gym builds more than muscle — it builds the psychological habit of proving yourself capable.',
          ],
          bullets: [
            'Mastery experiences — The strongest source of self-efficacy; actually succeeding at progressively harder challenges',
            'Vicarious experiences — Seeing someone you identify with succeed ("If they can, I can")',
            'Verbal persuasion — Encouragement from someone you respect (limited effect without mastery)',
            'Physiological state — Feeling physically strong, rested, and capable influences your belief in yourself',
          ],
        },
        {
          heading: 'Building Confidence Through Exposure',
          paragraphs: [
            'Avoidance is the enemy of confidence. Every time you avoid something you fear, you reinforce the belief that you cannot handle it. Exposure — gradually and systematically facing feared situations — is the most effective confidence-building strategy in psychological research.',
            'The principle applies everywhere: dreading a difficult conversation means having it (prepared, but having it). Anxious about a new exercise means trying it (with appropriate weight, but trying it). Scared of failing publicly means performing (imperfectly, but performing). Each exposure that does not result in catastrophe weakens the fear and strengthens self-efficacy.',
          ],
        },
      ],
      unbreakableInsight: 'Confidence is not something you find — it is something you build, rep by rep, exposure by exposure. There is no shortcut that does not eventually collapse.',
      coachNote: 'Identify one thing you have been avoiding because of self-doubt. Do it this week — badly if necessary, but do it. The doing is the medicine.',
      practicalTask: {
        title: 'Confidence Exposure Ladder',
        instructions: 'Create a list of 10 situations ranked from mildly uncomfortable to genuinely frightening. Over two weeks, work through as many as possible, starting from the easiest. Record your anxiety level before and after each exposure.',
        reflectionQuestions: [
          'How did your predicted anxiety compare to your actual experience?',
          'Did completing easier exposures make harder ones feel more manageable?',
          'Which of Bandura\'s four sources of self-efficacy did you experience most strongly?',
        ],
      },
    },
    {
      number: 6,
      title: 'Nervous System Regulation & Polyvagal Theory',
      learningOutcome: 'Understand polyvagal theory and how the autonomic nervous system moves through states of safety, mobilisation, and shutdown, and apply regulation techniques to shift between states intentionally.',
      assessmentCriteria: [
        'Describe the three states of the polyvagal hierarchy: ventral vagal, sympathetic, and dorsal vagal',
        'Identify physiological and behavioural signs of each autonomic state',
        'Apply co-regulation and self-regulation techniques to shift from defensive states to safety',
      ],
      content: [
        {
          heading: 'Polyvagal Theory — Three States of the Nervous System',
          paragraphs: [
            'Stephen Porges\' polyvagal theory describes three hierarchical states of the autonomic nervous system. The ventral vagal state (social engagement) is the state of safety — you feel connected, calm, and capable of complex thought. The sympathetic state (mobilisation) is the fight-or-flight response — anxiety, agitation, and hyper-alertness. The dorsal vagal state (shutdown) is the freeze response — numbness, disconnection, and collapse.',
            'Your nervous system moves through these states constantly, often outside your awareness. Understanding which state you are in allows you to apply targeted interventions rather than fighting your physiology with willpower.',
          ],
          imageUrl: getUniversityImage('mindl3-u1-ch6-polyvagal'),
          imageAlt: 'Polyvagal theory diagram showing three autonomic states: ventral vagal, sympathetic, and dorsal vagal with vagus nerve pathway',
          imagePlaceholder: 'Vertical ladder diagram showing the three polyvagal states — ventral vagal (safety/connection) at top, sympathetic (fight/flight) in middle, dorsal vagal (freeze/shutdown) at bottom — with associated behaviours and sensations',
        },
        {
          heading: 'Reading Your Own Nervous System',
          bullets: [
            'Ventral vagal signs — Relaxed facial muscles, social eye contact, modulated voice tone, open posture, curiosity, calm energy',
            'Sympathetic signs — Increased heart rate, muscle tension, scanning for threats, difficulty sitting still, irritability, shallow breathing',
            'Dorsal vagal signs — Feeling numb or disconnected, wanting to hide, brain fog, flat affect, extreme fatigue, feeling "checked out"',
            'Mixed states are common — You can be sympathetically activated (anxious) while partially in dorsal vagal (feeling helpless about it)',
          ],
        },
        {
          heading: 'Regulation Techniques by State',
          paragraphs: [
            'Different states require different interventions. In sympathetic activation (fight/flight), slow diaphragmatic breathing with extended exhales works because it directly activates the ventral vagal system. Movement also helps — it completes the stress cycle that your body is preparing for.',
            'In dorsal vagal shutdown, slow breathing alone may not work because the system is in collapse. Gentle movement (walking, stretching), orienting to the environment (naming five things you can see), cold water on the face (activating the dive reflex), and social connection (hearing a trusted voice) are more effective at shifting from shutdown toward mobilisation and then safety.',
          ],
        },
      ],
      unbreakableInsight: 'You cannot think your way out of a nervous system state. You must use your body to shift your physiology first — then your mind follows.',
      coachNote: 'Check in with your autonomic state three times daily. Just notice: am I in safety, mobilisation, or shutdown? The noticing itself begins the shift toward regulation.',
      practicalTask: {
        title: 'Autonomic State Tracking',
        instructions: 'For five days, check in with your autonomic state three times daily (morning, midday, evening). Note your state, what caused it, and apply the appropriate regulation technique. Record whether the intervention shifted your state.',
        reflectionQuestions: [
          'Which autonomic state did you spend the most time in across the five days?',
          'Which regulation techniques were most effective for you personally?',
          'Did awareness of your state change how you responded to stressful situations?',
        ],
      },
    },
    {
      number: 7,
      title: 'Psychoneuroimmunology & the Mind-Body Connection',
      learningOutcome: 'Understand the bidirectional relationship between psychological states and immune function, and how chronic stress, emotional states, and mental practices directly influence physical health outcomes.',
      assessmentCriteria: [
        'Define psychoneuroimmunology and explain its relevance to resilience training',
        'Describe how chronic stress suppresses immune function through the HPA axis',
        'Identify evidence-based mental practices that positively influence immune markers',
      ],
      content: [
        {
          heading: 'Your Mind and Body Are Not Separate Systems',
          paragraphs: [
            'Psychoneuroimmunology (PNI) is the study of how psychological processes interact with the nervous and immune systems. It demolishes the outdated idea that mind and body operate independently. Your thoughts, emotions, and stress levels directly influence your immune cells, inflammatory markers, wound healing speed, and susceptibility to illness.',
            'This is not metaphorical. Chronic psychological stress measurably reduces natural killer cell activity, slows wound healing by 25–40%, increases susceptibility to upper respiratory infections, and accelerates cellular ageing through telomere shortening. Your mental state is a physiological variable — as real and measurable as your heart rate.',
          ],
        },
        {
          heading: 'The Stress-Immunity Pathway',
          bullets: [
            'Acute stress (short-term) temporarily enhances immune function — preparing the body for potential injury. This is adaptive and beneficial',
            'Chronic stress suppresses immune function through sustained cortisol elevation, which reduces lymphocyte production and natural killer cell activity',
            'Loneliness and social isolation produce inflammatory profiles similar to chronic stress — elevating C-reactive protein and interleukin-6',
            'Sleep deprivation compounds immune suppression — even one night of poor sleep reduces natural killer cell activity by up to 70%',
            'The gut-brain axis connects emotional states to gut microbiome health, which in turn influences systemic inflammation and immune regulation',
          ],
        },
        {
          heading: 'Mental Practices That Support Immunity',
          paragraphs: [
            'If psychological stress harms immune function, it follows that psychological interventions can support it. Research confirms this across multiple modalities.',
          ],
          bullets: [
            'Meditation — Regular meditation practice is associated with reduced inflammatory markers, increased telomerase activity, and enhanced antibody response to vaccination',
            'Social connection — Strong social bonds are associated with lower inflammatory markers and better immune surveillance',
            'Positive affect — Genuine positive emotions (not forced positivity) are associated with stronger immune responses. Gratitude practices and savouring positive experiences measurably influence immune markers',
            'Cold exposure — Controlled cold stress (as covered in Level 2) increases circulating immune cells and reduces inflammatory cytokines',
            'Exercise — Moderate regular exercise enhances immune surveillance. Overtraining suppresses it. The dose matters',
          ],
        },
      ],
      unbreakableInsight: 'Every time you manage your stress, regulate your emotions, sleep well, and connect with people you care about — you are not just protecting your mind. You are directly strengthening your immune system. Mental resilience is physical health.',
      coachNote: 'This chapter connects everything in the course. When you practice breathwork, improve sleep, build social connections, and manage stress — you are not doing separate things. You are running one integrated system better.',
      practicalTask: {
        title: 'Mind-Body Connection Audit',
        instructions: 'For two weeks, track three variables daily: stress level (1–10), sleep quality (1–10), and any illness symptoms (sore throat, fatigue, headaches, digestive issues). Also note any significant emotional events. Look for correlations between high-stress periods and physical symptoms.',
        reflectionQuestions: [
          'Do you notice physical symptoms appearing during or shortly after high-stress periods?',
          'How does sleep quality correlate with your susceptibility to minor illness?',
          'Does this data change how you prioritise stress management and recovery?',
        ],
      },
    },
    {
      number: 8,
      title: 'Emotional Intelligence & Social Awareness',
      learningOutcome: 'Develop advanced emotional intelligence skills including self-awareness, empathy, social perception, and the ability to navigate complex interpersonal dynamics under pressure.',
      assessmentCriteria: [
        'Define the four domains of emotional intelligence and their relevance to resilience',
        'Distinguish between cognitive empathy and affective empathy',
        'Apply emotional intelligence principles to manage conflict and build stronger relationships',
      ],
      content: [
        {
          heading: 'Beyond Self-Regulation',
          paragraphs: [
            'Earlier chapters focused on managing your own emotions — the internal dimension of emotional intelligence. This chapter extends outward: understanding others, reading social dynamics, navigating conflict, and building the interpersonal skills that advanced resilience requires. Resilience is not a solo sport.',
            'Daniel Goleman\'s emotional intelligence framework identifies four domains: self-awareness (recognising your own emotions), self-management (regulating your responses), social awareness (reading others and situations), and relationship management (influencing, coaching, and resolving conflict). Levels 2 and earlier Level 3 chapters developed the first two. This chapter develops the latter two.',
          ],
        },
        {
          heading: 'Empathy — The Foundation of Social Intelligence',
          bullets: [
            'Cognitive empathy — Understanding what another person is thinking or feeling without necessarily sharing that feeling. Essential for effective communication, negotiation, and leadership',
            'Affective empathy — Actually feeling what another person feels. Powerful for connection but can lead to emotional overwhelm if unmanaged',
            'Empathic accuracy — The ability to correctly identify another person\'s emotional state. This is a trainable skill, not an innate gift',
            'Empathy fatigue — Constant exposure to others\' distress without recovery depletes your own emotional resources. Boundaries are essential',
          ],
        },
        {
          heading: 'Navigating Conflict & Difficult Conversations',
          paragraphs: [
            'Conflict is inevitable in any meaningful relationship. Emotional intelligence does not eliminate conflict — it gives you the tools to navigate it without destroying the relationship or yourself.',
          ],
          bullets: [
            'Separate behaviour from identity — Address what someone did, not who they are. "That comment was hurtful" versus "you are a hurtful person"',
            'Listen to understand, not to respond — Most people listen while preparing their rebuttal. Genuine listening means suspending your response until the other person feels heard',
            'Name the emotion — "I notice I am feeling defensive right now" disarms the emotion and prevents reactive escalation',
            'Seek the need behind the position — Every conflict position ("you never listen!") has an underlying need ("I need to feel valued"). Address the need, not just the position',
            'Know when to pause — If you or the other person is in a heightened sympathetic state, nothing productive will happen. Take a break and return when regulated',
          ],
        },
      ],
      unbreakableInsight: 'The strongest people are not the ones who suppress their emotions or dominate every room. They are the ones who understand their own emotional landscape, read others accurately, and navigate conflict without losing themselves.',
      coachNote: 'Emotional intelligence is not soft — it is the hardest skill to develop because it requires genuine self-honesty. Start by noticing your default conflict style: do you fight, flee, freeze, or fawn? That awareness is the starting point.',
      practicalTask: {
        title: 'Empathy & Conflict Navigation Practice',
        instructions: 'This week, practice active listening in three conversations. Your only goal is to understand what the other person is feeling — not to fix, advise, or respond. After each conversation, write down: (1) what they said, (2) what you think they were actually feeling, and (3) what need was driving the conversation.',
        reflectionQuestions: [
          'How did it feel to listen without preparing a response?',
          'Were you able to identify the emotion behind the words, or did you default to the surface content?',
          'Did the quality of the conversation change when you focused on understanding rather than responding?',
        ],
      },
    },
  ],
};

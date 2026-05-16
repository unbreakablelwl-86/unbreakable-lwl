import type { Unit } from '../types';
import ch1DeepWork from '@/assets/university/mindl3-u3-ch1-deep-work.png';
import ch2Willpower from '@/assets/university/mindl3-u3-ch2-willpower.png';
import ch3CognitivePerformance from '@/assets/university/mindl3-u3-ch3-cognitive-performance.png';
import ch4SelfDetermination from '@/assets/university/mindl3-u3-ch4-self-determination.png';
import ch5IdentityChange from '@/assets/university/mindl3-u3-ch5-identity-change.png';
import ch6Visualisation from '@/assets/university/mindl3-u3-ch6-visualisation.png';

export const mindsetL3Unit3: Unit = {
  number: 3,
  title: 'Advanced Focus, Discipline & Cognitive Performance',
  description: 'Master advanced attention training, deep work strategies, cognitive performance optimisation, and the neuroscience of willpower and decision-making.',
  chapters: [
    {
      number: 1,
      title: 'Attention Training & Deep Work',
      learningOutcome: 'Understand the neuroscience of attention, the cost of distraction, and apply deep work strategies to maximise cognitive performance in training and daily life.',
      assessmentCriteria: [
        'Explain the attention residue effect and its impact on cognitive performance',
        'Describe the difference between shallow and deep work and their neurological demands',
        'Apply time-blocking and environmental design strategies to protect deep focus periods',
      ],
      content: [
        {
          heading: 'The Neuroscience of Attention',
          paragraphs: [
            'Attention is not a single system — it involves three networks: the alerting network (readiness), the orienting network (directing focus), and the executive network (resolving conflict between competing demands). Deep, sustained attention requires all three networks working in coordination, which is metabolically expensive — your brain uses 20% of total body energy despite being 2% of body mass.',
            'Attention residue — identified by researcher Sophie Leroy — is the cognitive cost of switching tasks. When you check your phone between sets, your brain does not fully return to the training task. Part of your attention remains on the phone content, reducing the quality of your focus for 10–20 minutes. This is why eliminating distractions is more important than "trying harder to focus."',
          ],
          imageUrl: ch1DeepWork,
          imageAlt: 'Attention training and deep work showing prefrontal cortex attention network and focus session blocks',
          imagePlaceholder: 'Diagram showing the three attention networks (alerting, orienting, executive) in the brain and how attention residue accumulates across task switches',
        },
        {
          heading: 'Deep Work vs Shallow Work',
          paragraphs: [
            'Cal Newport defines deep work as "professional activities performed in a state of distraction-free concentration that push your cognitive capabilities to their limit." Shallow work is logistical, low-cognitive-demand activity that can be performed while distracted.',
            'Training sessions can be deep work or shallow work depending on your approach. Going through the motions while scrolling between sets is shallow. Full presence with progressive overload tracking, technique focus, and mind-muscle connection is deep. The physiological results differ dramatically.',
          ],
          bullets: [
            'Deep work requires 90–120 minute uninterrupted blocks for complex tasks',
            'Most people can sustain 3–4 hours of genuine deep work per day',
            'Training for deep work: start with 25-minute Pomodoro blocks and extend gradually',
            'Environmental design beats willpower: remove distractions rather than resisting them',
          ],
        },
        {
          heading: 'Protecting Your Focus',
          paragraphs: [
            'Practical strategies: phone in airplane mode or locked away during focus blocks. Communicate boundaries clearly — "I am unavailable for the next 90 minutes." Use environmental cues: a specific desk, lighting, or music that signals "deep work mode" to your brain. Batch shallow tasks (emails, messages) into designated windows rather than responding reactively.',
            'In training: designate your gym session as a deep work block. No social scrolling, no non-essential conversations, no checking notifications. Use a training log to maintain task focus. Treat your session with the same intentionality as a critical work meeting.',
          ],
        },
      ],
      unbreakableInsight: 'Distraction is not a minor nuisance — it is a performance-destroying habit. Every notification you check costs you 15 minutes of focused capability. Protect your attention like the asset it is.',
      coachNote: 'Try one "phone-free" training session this week. Lock your phone in your car or bag. Notice the difference in session quality and mind-muscle connection.',
      practicalTask: {
        title: 'Deep Work Experiment',
        instructions: 'Implement three phone-free training sessions and three 90-minute deep work blocks (any cognitively demanding task). Record subjective focus quality, output, and how you felt during and after each block.',
        reflectionQuestions: [
          'How did removing your phone change the quality of your training sessions?',
          'What was the most challenging aspect of maintaining uninterrupted focus for 90 minutes?',
          'Did the deep work practice in other areas improve your ability to focus during training?',
        ],
      },
    },
    {
      number: 2,
      title: 'Willpower, Decision Fatigue & Ego Depletion',
      learningOutcome: 'Understand the current evidence on willpower as a limited vs renewable resource, apply strategies to reduce decision fatigue, and design systems that minimise reliance on willpower.',
      assessmentCriteria: [
        'Evaluate the ego depletion model and its criticisms in current psychological research',
        'Explain decision fatigue and its impact on training adherence and nutrition choices',
        'Design systems and routines that reduce dependence on willpower for key behaviours',
      ],
      content: [
        {
          heading: 'The Willpower Debate',
          paragraphs: [
            'Roy Baumeister\'s ego depletion theory proposed that willpower is a finite resource that gets "used up" through the day. This explained why people make worse decisions in the evening and why resisting one temptation makes it harder to resist the next. However, recent large-scale replication studies have challenged this model, suggesting the effect is smaller than originally claimed and may be influenced by beliefs about willpower.',
            'The current consensus: willpower is influenced by both physiological factors (blood glucose, sleep, stress) and psychological factors (beliefs, motivation, perceived difficulty). Whether or not it is a "depletable resource," it is clear that the more decisions you make, the worse those decisions tend to become. This is decision fatigue, and it is well-documented.',
          ],
          imageUrl: ch2Willpower,
          imageAlt: 'Willpower and decision fatigue showing ego depletion model and decision fatigue curve',
          imagePlaceholder: 'Chart showing decision quality declining across the day with the number of decisions made, and how routines/systems flatten the decline curve',
        },
        {
          heading: 'Decision Fatigue in Practice',
          paragraphs: [
            'Israeli parole board studies famously showed that favourable rulings dropped from 65% to nearly 0% as the day progressed, only recovering after food breaks. While the exact mechanism is debated, the practical effect is real: the more decisions you make before your training session or meal prep, the more likely you are to default to easier, less disciplined choices.',
            'Nutritional choices are particularly vulnerable. After a day of work decisions, the mental effort of choosing healthy food often loses to the ease of convenience food. Training sessions scheduled after a cognitively demanding day require more perceived effort than morning sessions.',
          ],
          bullets: [
            'Morning decisions tend to be higher quality than evening decisions',
            'Each decision (even trivial ones) depletes some cognitive capacity',
            'Binary decisions are easier than open-ended choices ("go to gym yes/no" vs "what exercise should I do?")',
            'Pre-commitment eliminates the decision entirely — meal prep, scheduled sessions, laid-out gym clothes',
          ],
        },
        {
          heading: 'Systems Over Willpower',
          paragraphs: [
            'The solution to willpower limitations is not "trying harder" — it is designing systems that remove the need for willpower. Meal prep eliminates food decisions. A written training programme eliminates exercise selection decisions. Laying out gym clothes the night before eliminates the morning debate. Direct debit payments eliminate the "should I cancel?" temptation.',
            'James Clear calls this "making the right thing the default." You are not building willpower — you are building an environment where the desired behaviour requires less effort than the undesired alternative. This is where lasting consistency comes from.',
          ],
        },
      ],
      unbreakableInsight: 'Relying on willpower is a losing strategy. Winners build systems so good that discipline becomes automatic. The question is not "how do I stay motivated?" — it is "how do I make this effortless?"',
      coachNote: 'Audit your week: how many unnecessary decisions are you making daily? Eliminate five of them this week through pre-commitment or routine. Watch what happens to your consistency.',
      practicalTask: {
        title: 'Decision Audit & System Design',
        instructions: 'Track every decision you make for two full days. Identify which decisions are unnecessary (could be automated, pre-committed, or eliminated). Design systems to remove at least five recurring decisions. Implement them for one week.',
        reflectionQuestions: [
          'How many daily decisions were genuinely necessary vs habitual or avoidable?',
          'Which systems had the biggest impact on your consistency and energy?',
          'Did reducing decision load affect your evening willpower for training or nutrition?',
        ],
      },
    },
    {
      number: 3,
      title: 'Cognitive Performance & Brain Health',
      learningOutcome: 'Understand the lifestyle factors that optimise cognitive performance, including sleep, nutrition, exercise, and stress management, and apply evidence-based strategies for long-term brain health.',
      assessmentCriteria: [
        'Explain how exercise, sleep, and nutrition each affect cognitive performance and neuroplasticity',
        'Describe the role of BDNF in learning, memory, and brain health',
        'Apply a holistic cognitive optimisation protocol addressing all key lifestyle factors',
      ],
      content: [
        {
          heading: 'Exercise & the Brain',
          paragraphs: [
            'Exercise is the most powerful neuroplasticity-enhancing intervention available without a prescription. Aerobic exercise increases brain-derived neurotrophic factor (BDNF), which supports the growth and survival of neurons, enhances synaptic plasticity, and improves learning and memory. The hippocampus — critical for memory — physically grows with regular exercise.',
            'Resistance training also has cognitive benefits: it reduces neuroinflammation, improves executive function, and may reduce dementia risk. High-intensity interval training (HIIT) produces the largest acute BDNF increases, while consistent moderate exercise produces the best long-term brain health outcomes.',
          ],
          imageUrl: ch3CognitivePerformance,
          imageAlt: 'Cognitive performance and brain health showing BDNF pathways, neuroplasticity, and exercise-brain connection',
          imagePlaceholder: 'Diagram showing how different types of exercise (aerobic, resistance, HIIT) affect BDNF levels, hippocampal volume, and cognitive performance',
        },
        {
          heading: 'Sleep & Cognitive Function',
          paragraphs: [
            'Sleep is when the brain consolidates memories, clears metabolic waste (via the glymphatic system), and repairs neural pathways. Sleep deprivation impairs attention, decision-making, emotional regulation, and creativity — often to a degree equivalent to alcohol intoxication. Even modest sleep restriction (6 hours vs 8 hours) causes cumulative cognitive decline that you do not subjectively notice.',
            'The glymphatic system — discovered in 2012 — clears amyloid-beta and tau proteins during deep sleep. These are the proteins associated with Alzheimer\'s disease. Chronic poor sleep may therefore accelerate neurodegeneration. Prioritising sleep is not lazy — it is a non-negotiable investment in long-term brain health.',
          ],
          bullets: [
            'Memory consolidation requires adequate REM and deep sleep (7–9 hours total)',
            'Glymphatic clearance is 10x more active during sleep than wakefulness',
            'Sleep deprivation reduces prefrontal cortex function — impairing willpower and decision-making',
            'Napping (20–30 min) can partially restore cognitive function after poor sleep',
            'Consistent sleep timing is as important as duration for cognitive performance',
          ],
        },
        {
          heading: 'Nutrition for Brain Performance',
          paragraphs: [
            'The brain consumes approximately 20% of your daily calories. Glucose is its primary fuel, but ketones (from fasting or low-carb states) provide an efficient alternative that some research suggests may enhance mental clarity. Omega-3 fatty acids (DHA in particular) are structural components of neuronal membranes and support synaptic function.',
            'Polyphenols (found in berries, dark chocolate, green tea) have neuroprotective properties. Creatine supplementation (3–5g daily) has been shown to improve short-term memory and reasoning, particularly under stress or sleep deprivation. Adequate hydration (even 2% dehydration impairs cognitive performance) is often overlooked.',
          ],
        },
      ],
      unbreakableInsight: 'Your brain is a physical organ that responds to the same lifestyle factors as your muscles. Train it, feed it, rest it, and challenge it — or watch it decline by default.',
      coachNote: 'If you are serious about mental performance, sleep is your number one priority. You cannot out-supplement or out-train poor sleep. Fix that first, then optimise everything else.',
      practicalTask: {
        title: 'Cognitive Optimisation Protocol',
        instructions: 'Implement a one-week cognitive optimisation protocol: prioritise 8 hours of sleep with consistent timing, include 3+ exercise sessions, ensure adequate omega-3 and hydration, and include one daily focus session (25+ minutes of deep work). Track cognitive clarity, mood, and energy daily.',
        reflectionQuestions: [
          'Which single factor — sleep, exercise, nutrition, or focus practice — had the biggest impact on your cognitive clarity?',
          'Did you notice a difference between days where all factors were optimised vs days where one was missing?',
          'How sustainable does this protocol feel for long-term implementation?',
        ],
      },
    },
    {
      number: 4,
      title: 'Motivation Science & Self-Determination',
      learningOutcome: 'Understand self-determination theory, the science of intrinsic vs extrinsic motivation, and how to design your goals and environment to sustain long-term motivation.',
      assessmentCriteria: [
        'Explain the three basic psychological needs identified by self-determination theory',
        'Distinguish between intrinsic and extrinsic motivation and their effects on long-term adherence',
        'Apply motivational strategies that support autonomy, competence, and relatedness',
      ],
      content: [
        {
          heading: 'Self-Determination Theory (SDT)',
          paragraphs: [
            'Deci and Ryan\'s self-determination theory identifies three basic psychological needs that must be satisfied for sustained motivation: autonomy (feeling in control of your choices), competence (feeling capable and making progress), and relatedness (feeling connected to others). When these needs are met, intrinsic motivation flourishes; when they are thwarted, motivation collapses.',
            'This explains why rigid, externally imposed programmes often fail — they undermine autonomy. Why programmes that are too easy or too hard cause dropout — they undermine competence. And why training alone without any social connection feels harder to maintain — it undermines relatedness.',
          ],
          imageUrl: ch4SelfDetermination,
          imageAlt: 'Self-determination theory showing three basic needs: autonomy, competence, and relatedness with motivation continuum',
          imagePlaceholder: 'Venn diagram showing the three SDT needs (Autonomy, Competence, Relatedness) with intrinsic motivation at the intersection and examples of each need in training context',
        },
        {
          heading: 'The Motivation Spectrum',
          paragraphs: [
            'SDT describes motivation as a spectrum, not a binary. From least to most self-determined: amotivation (no desire to act), external regulation ("I train because my coach told me"), introjected regulation ("I train because I\'d feel guilty if I didn\'t"), identified regulation ("I train because health is important to me"), integrated regulation ("I train because it is part of who I am"), and intrinsic motivation ("I train because I love it").',
            'The goal is not to eliminate external motivators — it is to move along the spectrum toward more internalised forms. Someone who starts training for aesthetic reasons (external) can gradually shift to valuing the process itself (intrinsic) if their autonomy, competence, and relatedness needs are supported.',
          ],
          bullets: [
            'External motivation — Driven by rewards or punishments; fragile and requires constant reinforcement',
            'Introjected motivation — Driven by guilt or ego; internally pressured but not truly chosen',
            'Identified motivation — Aligned with personal values; resilient because it connects to identity',
            'Intrinsic motivation — Driven by the inherent enjoyment and satisfaction of the activity itself',
          ],
        },
        {
          heading: 'Designing for Sustained Motivation',
          paragraphs: [
            'Support autonomy by giving yourself meaningful choices within your programme — exercise selection, session timing, rest periods. Support competence by ensuring progressive overload is visible and celebrated — track your numbers, acknowledge small wins. Support relatedness by training with others, sharing progress, or coaching someone less experienced.',
            'Motivation is not something you "find" — it is something you create through environment design. Expecting motivation to appear before action is the wrong order. Action, supported by the right conditions, generates motivation. Show up consistently, and the desire to continue builds itself.',
          ],
        },
      ],
      unbreakableInsight: 'Motivation follows action, not the other way around. Build the conditions that sustain it — autonomy, competence, connection — and stop waiting to "feel like it."',
      coachNote: 'Identify which of the three SDT needs is currently least satisfied in your training life. That is your bottleneck. Address it specifically and watch motivation improve.',
      practicalTask: {
        title: 'SDT Self-Assessment',
        instructions: 'Rate your current training experience against each SDT need (autonomy, competence, relatedness) on a 1–10 scale. For your lowest-scoring need, implement three specific changes this week. Re-rate after the week.',
        reflectionQuestions: [
          'Which psychological need was least satisfied, and how did that affect your motivation?',
          'Did addressing your lowest-scoring need change your training experience?',
          'Where on the motivation spectrum is your current training motivation, and has it shifted?',
        ],
      },
    },
    {
      number: 5,
      title: 'Identity-Based Change & Self-Concept',
      learningOutcome: 'Understand how identity shapes behaviour, apply identity-based habit formation strategies, and manage identity transitions during personal transformation.',
      assessmentCriteria: [
        'Explain how self-concept influences behaviour and decision-making',
        'Apply James Clear\'s identity-based habit model to training and lifestyle goals',
        'Identify and manage identity conflicts that arise during personal change',
      ],
      content: [
        {
          heading: 'Identity Drives Behaviour',
          paragraphs: [
            'Your behaviour is largely a reflection of your identity — your beliefs about who you are. Someone who identifies as "a runner" does not need willpower to go running; it is simply what they do. Someone who identifies as "not a gym person" will struggle with consistency regardless of their programme quality. The most lasting changes happen when you shift your identity, not just your actions.',
            'James Clear describes three layers of behaviour change: outcomes (what you achieve), processes (what you do), and identity (what you believe). Most people start with outcomes ("I want to lose 10kg") and work inward. More effective change starts with identity ("I am someone who takes care of their health") and works outward.',
          ],
          imageUrl: ch5IdentityChange,
          imageAlt: 'Identity-based change showing identity iceberg model with actions, beliefs, and identity layers',
          imagePlaceholder: 'Concentric circles diagram showing the three layers of behaviour change — Identity (core), Process (middle), Outcome (outer) — with arrows showing the preferred inside-out direction',
        },
        {
          heading: 'Building a New Identity',
          paragraphs: [
            'Identity is not changed through declarations — it is changed through evidence. Every time you show up to train, you cast a vote for the identity of "someone who trains." Every time you choose a protein-rich meal, you cast a vote for "someone who eats well." No single vote is decisive, but over time, the votes accumulate into a clear identity.',
            'The process: decide who you want to become, then ask "what would that person do?" at each decision point. You do not need to be that person yet — you just need to consistently act as they would. The identity follows the evidence, not the other way around.',
          ],
          bullets: [
            'Each small action is a "vote" for or against your desired identity',
            'Consistency matters more than intensity — daily small votes outweigh occasional grand gestures',
            'Identity is always changing — you can deliberately direct the change',
            'Attach habits to identity: "I don\'t skip training" is more powerful than "I should train today"',
          ],
        },
        {
          heading: 'Identity Conflicts During Change',
          paragraphs: [
            'Personal transformation often creates identity conflicts. Friends and family who knew the "old you" may resist your changes. You may feel like an imposter in your new identity. Social environments that supported old behaviours may become uncomfortable.',
            'These conflicts are normal and expected. They are signs that genuine change is occurring. The response is not to retreat — it is to continue casting votes for your new identity while accepting that the transition period is uncomfortable. Surround yourself with people who share or support your new identity. The discomfort is temporary; the identity shift is permanent.',
          ],
        },
      ],
      unbreakableInsight: 'You do not rise to the level of your goals. You fall to the level of your identity. Change who you believe you are, and your behaviour follows effortlessly.',
      coachNote: 'Write a single sentence that describes the identity you are building: "I am someone who ___." Put it somewhere you will see it daily. Then focus on casting votes for that person.',
      practicalTask: {
        title: 'Identity Statement & Vote Tracking',
        instructions: 'Write your aspirational identity statement. For one week, track every action that casts a vote for or against that identity. At the end of the week, calculate your "vote ratio" and identify patterns.',
        reflectionQuestions: [
          'How did explicitly framing actions as "votes" change your decision-making?',
          'Where did you consistently vote against your desired identity, and what drove those decisions?',
          'Did any identity conflicts arise, and how did you handle them?',
        ],
      },
    },
    {
      number: 6,
      title: 'Visualisation & Mental Rehearsal',
      learningOutcome: 'Understand the neuroscience of mental imagery, apply structured visualisation techniques for performance enhancement, and use mental rehearsal to prepare for challenging situations.',
      assessmentCriteria: [
        'Explain how mental rehearsal activates similar neural pathways to physical practice',
        'Apply process visualisation and outcome visualisation appropriately for different goals',
        'Design a structured mental rehearsal protocol for a specific training or life goal',
      ],
      content: [
        {
          heading: 'The Neuroscience of Visualisation',
          paragraphs: [
            'Brain imaging studies show that vividly imagining an action activates many of the same motor cortex regions as physically performing it. This is not mystical — it is neuroplasticity. Mental rehearsal strengthens neural pathways, improves motor planning, and enhances confidence through simulated experience.',
            'Studies in athletic performance show that mental practice combined with physical practice produces better results than physical practice alone. Weightlifters who visualised successful lifts alongside training showed greater strength gains than those who only trained physically. The effect is real and measurable.',
          ],
          imageUrl: ch6Visualisation,
          imageAlt: 'Advanced visualisation and mental rehearsal showing brain activation during mental practice and PETTLEP model',
          imagePlaceholder: 'Brain scan comparison showing motor cortex activation during physical movement vs mental visualisation of the same movement, highlighting the overlap in activated regions',
        },
        {
          heading: 'Process vs Outcome Visualisation',
          paragraphs: [
            'Outcome visualisation (imagining the end result) can increase motivation but may reduce effort — your brain partially "experiences" the reward before you have earned it. Process visualisation (imagining the steps, the effort, the technique) enhances preparation and performance because it primes the neural pathways you will actually use.',
            'The optimal approach combines both: visualise the desired outcome briefly (to set direction), then spend most of your visualisation time on the process — the preparation, the effort, the specific actions, the recovery from setbacks. Include the struggle, not just the success.',
          ],
          bullets: [
            'Process visualisation — Imagine the effort, technique, and steps. Activates motor planning',
            'Outcome visualisation — Imagine the end result. Useful for direction, dangerous if overused',
            'Include adversity — Visualise overcoming obstacles, not just smooth success',
            'Multi-sensory — Include sight, sound, feel, even smell. Richer imagery = stronger effect',
            'Regular practice — 5–10 minutes daily is sufficient for measurable performance benefits',
          ],
        },
        {
          heading: 'Structured Mental Rehearsal Protocol',
          paragraphs: [
            'A structured protocol: find a quiet space, close your eyes, take 5 slow breaths to calm your nervous system. Then visualise your upcoming session or challenge in detail: the environment, your preparation, the first movement. Walk through the entire experience in real time, including moments of difficulty and how you respond to them.',
            'After the rehearsal, open your eyes and note any tension or anxiety. Repeat the visualisation, this time deliberately adjusting any negative elements. With practice, mental rehearsal becomes a powerful pre-performance tool that reduces anxiety and improves execution.',
          ],
        },
      ],
      unbreakableInsight: 'Your brain does not fully distinguish between vividly imagined and physically performed experiences. Use this to your advantage — rehearse success before you attempt it.',
      coachNote: 'Start with 5 minutes of process visualisation before your next training session. Visualise each exercise, the weights, and your form. Notice how it changes your readiness.',
      practicalTask: {
        title: 'Mental Rehearsal Programme',
        instructions: 'Implement a daily 5-minute mental rehearsal practice for two weeks. Alternate between training visualisation (before sessions) and life challenge visualisation (before difficult situations). Record the effect on your performance and anxiety.',
        reflectionQuestions: [
          'Did pre-session visualisation change how you performed or felt during training?',
          'Which type of visualisation (process or outcome) was more effective for you?',
          'How vivid was your imagery, and did it improve with practice?',
        ],
      },
    },
    {
      number: 7,
      title: 'Creativity, Problem Solving & Lateral Thinking',
      learningOutcome: 'Understand the cognitive science of creativity, how divergent thinking complements focused attention, and practical techniques for enhancing creative problem solving under pressure.',
      assessmentCriteria: [
        'Explain the relationship between default mode network activity and creative insight',
        'Distinguish between convergent and divergent thinking and when each is most useful',
        'Apply lateral thinking techniques to real-world problem solving',
      ],
      content: [
        {
          heading: 'Creativity Is Not a Gift — It Is a Process',
          paragraphs: [
            'Creativity is often romanticised as a mysterious gift that strikes unpredictably. In reality, creative insight follows predictable cognitive patterns that can be deliberately cultivated. The neuroscience is clear: creativity emerges from the interplay between focused attention (task-positive network) and mind-wandering (default mode network). Both are essential — and most people over-emphasise focus while starving the wandering that generates novel connections.',
            'This matters for resilience because life\'s most challenging problems rarely have obvious, linear solutions. The ability to think laterally — to approach problems from unexpected angles, reframe constraints as opportunities, and generate options when the obvious path is blocked — is a core resilience skill.',
          ],
        },
        {
          heading: 'Convergent vs Divergent Thinking',
          bullets: [
            'Convergent thinking — Narrowing options to find the single best answer. Analytical, logical, step-by-step. Essential for execution and decision-making',
            'Divergent thinking — Expanding options to generate multiple possible answers. Associative, playful, non-linear. Essential for innovation and problem solving',
            'Most education and work environments heavily reward convergent thinking and neglect divergent thinking. This creates blind spots in problem solving',
            'The creative process requires both: diverge first (generate many ideas without judgement), then converge (evaluate and select the best ones). Mixing them kills creativity — judging ideas while generating them shuts down the process',
          ],
        },
        {
          heading: 'Practical Creativity Techniques',
          bullets: [
            'Incubation — When stuck on a problem, deliberately step away. Walk, shower, do a mundane task. Your default mode network continues processing unconsciously, often producing breakthrough insights',
            'Constraint reframing — Instead of asking "how do I remove this obstacle?" ask "how could this obstacle become an advantage?" Constraints often drive the most creative solutions',
            'First principles thinking — Strip the problem back to its fundamental truths and rebuild from there, rather than reasoning by analogy with existing solutions',
            'Random input — Introduce an unrelated stimulus (a random word, image, or concept) and force connections to your problem. This bypasses habitual thinking patterns',
            'Pre-mortem analysis — Before starting a project, imagine it has failed spectacularly. Ask: "What went wrong?" This generates creative risk identification that forward-looking analysis often misses',
            'Movement and creativity — Walking increases creative output by an average of 60% (Stanford research). Physical movement stimulates the brain networks involved in divergent thinking',
          ],
        },
      ],
      unbreakableInsight: 'The most resilient people are not the ones with the best Plan A — they are the ones who can generate Plans B through Z when Plan A fails. Creative thinking is a survival skill disguised as an art form.',
      coachNote: 'If you are stuck on any problem in life — training, career, relationships — try this: go for a 20-minute walk with no phone, no music, no podcast. Just walk and let your mind wander. The solution often appears without effort.',
      practicalTask: {
        title: 'Creative Problem Solving Practice',
        instructions: 'Choose a real problem you are currently facing (training plateau, time management, relationship challenge). Apply three different techniques: (1) constraint reframing, (2) first principles thinking, and (3) incubation (think about it before a walk, then walk for 20 minutes without devices). Document the ideas generated by each method.',
        reflectionQuestions: [
          'Which technique generated the most surprising or useful ideas?',
          'Did you notice a difference between ideas generated through focused analysis versus those that emerged during incubation?',
          'How could you integrate more divergent thinking into your regular problem-solving approach?',
        ],
      },
    },
    {
      number: 8,
      title: 'Sleep Architecture & Cognitive Recovery',
      learningOutcome: 'Master advanced sleep science including sleep stage optimisation, the cognitive consequences of sleep debt, and evidence-based interventions for maximising sleep quality for cognitive performance.',
      assessmentCriteria: [
        'Explain how different sleep stages contribute to specific cognitive functions',
        'Describe the concept of sleep debt and its cumulative impact on performance',
        'Design an advanced sleep optimisation protocol targeting cognitive recovery',
      ],
      content: [
        {
          heading: 'Sleep Stages and Cognitive Function',
          paragraphs: [
            'Level 2 introduced sleep architecture. This chapter goes deeper into how specific sleep stages serve specific cognitive functions — and what happens when those stages are selectively disrupted. Understanding this allows you to target your sleep optimisation efforts more precisely.',
            'Your cognitive performance is not determined by how many hours you sleep — it is determined by how much time you spend in the right stages. Someone sleeping 8 hours of fragmented, alcohol-disrupted sleep may get less deep sleep and REM than someone sleeping 7 hours of high-quality, uninterrupted sleep.',
          ],
        },
        {
          heading: 'Stage-Specific Cognitive Functions',
          bullets: [
            'Deep sleep (N3/SWS) — Memory consolidation for facts and procedures. Growth hormone release for physical repair. Glymphatic system activation clears metabolic waste (including beta-amyloid) from the brain. Predominates in the first half of the night — going to bed late selectively reduces deep sleep',
            'REM sleep — Emotional processing and regulation. Creative problem solving and insight. Integration of new information with existing knowledge networks. Predominates in the second half — early wake alarms selectively reduce REM',
            'Light sleep (N2) — Sleep spindles in N2 are associated with motor learning and procedural memory. Important for athletes learning new movement patterns',
            'Sleep cycles — A complete cycle (N1→N2→N3→N2→REM) takes approximately 90 minutes. Planning sleep in 90-minute multiples (e.g., 7.5 hours = 5 cycles) can improve wake quality',
          ],
        },
        {
          heading: 'Sleep Debt — The Hidden Performance Killer',
          paragraphs: [
            'Sleep debt is cumulative. Missing one hour of sleep per night for a week creates a performance deficit equivalent to staying awake for 24 consecutive hours. The dangerous part: subjective awareness of impairment plateaus after a few days, while objective performance continues to decline. You stop feeling tired, but your brain is measurably compromised.',
          ],
          bullets: [
            'Reaction time, decision-making, and emotional regulation are the first functions affected by sleep debt',
            'Sleep debt cannot be fully "repaid" by a single long sleep. Recovery requires several nights of quality sleep',
            'Weekend sleep-ins help partially but disrupt circadian rhythm consistency, creating a "social jet lag" effect',
            'Napping can strategically offset some sleep debt — 20-minute naps improve alertness without entering deep sleep (which causes grogginess)',
          ],
        },
        {
          heading: 'Advanced Sleep Optimisation',
          bullets: [
            'Temperature manipulation — Core body temperature must drop 1–2°C for sleep onset. A hot bath 60–90 minutes before bed paradoxically cools you by drawing blood to the surface, accelerating heat dissipation',
            'Light exposure timing — Bright light in the first hour of waking advances your circadian clock and improves evening sleep onset. Morning sunlight is the strongest circadian signal available',
            'Caffeine curfew — Caffeine blocks adenosine receptors for 6–8 hours. If you sleep at 11pm, your last caffeine should be before 3pm (earlier if you are a slow metaboliser — roughly 50% of people)',
            'Consistent wake time — Your wake time is the single most important anchor for circadian rhythm. Keep it consistent to within 30 minutes, even on weekends',
            'Strategic napping — If sleep-deprived, a 20-minute nap before 3pm can restore alertness. Set an alarm to prevent entering deep sleep',
          ],
        },
      ],
      unbreakableInsight: 'Sleep is not dead time — it is when your brain does its most important work. Every memory consolidated, every emotion processed, every creative insight incubated happens while you sleep. Cutting sleep to "get more done" is like cutting your training sessions to "have more time to compete."',
      coachNote: 'Track your sleep for two weeks with objective data (a wearable or sleep app). Compare your deep sleep and REM percentages on nights when you follow your sleep protocol versus nights when you do not. The data will convince you faster than any lecture.',
      practicalTask: {
        title: 'Sleep Optimisation Protocol',
        instructions: 'Implement an advanced sleep optimisation protocol for two weeks: (1) fixed wake time within 30 minutes daily, (2) bright light within 30 minutes of waking, (3) caffeine curfew at 2pm, (4) pre-sleep breathwork (4-7-8 method), (5) bedroom temperature below 19°C. Track sleep quality, deep sleep percentage (if using a wearable), and next-day cognitive performance.',
        reflectionQuestions: [
          'Which intervention had the most noticeable impact on your sleep quality?',
          'Did you notice changes in your focus, mood, or creativity on well-slept days versus poorly-slept days?',
          'What is the biggest barrier to maintaining optimal sleep hygiene, and how can you design around it?',
        ],
      },
    },
  ],
};

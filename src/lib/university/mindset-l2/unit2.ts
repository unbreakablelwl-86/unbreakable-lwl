import type { Unit } from '../types';
import ch1BreathingPhysiology from '@/assets/university/mindl2-u2-ch1-breathing-physiology.png';
import ch2Diaphragmatic from '@/assets/university/mindl2-u2-ch2-diaphragmatic.png';
import ch3BoxBreathing from '@/assets/university/mindl2-u2-ch3-box-breathing.png';
import ch4EnergisingBreathwork from '@/assets/university/mindl2-u2-ch4-energising-breathwork.png';
import ch5ColdExposure from '@/assets/university/mindl2-u2-ch5-cold-exposure.png';
import ch6Journaling from '@/assets/university/mindl2-u2-ch6-journaling.png';


export const mindsetL2Unit2: Unit = {
  number: 2,
  title: 'Breathing Science & Practice',
  description: 'Learn the physiology of breathing, master foundational techniques, and understand how deliberate breathwork directly influences your nervous system, focus, and performance.',
  chapters: [
    {
      number: 1,
      title: 'The Physiology of Breathing',
      learningOutcome: 'Understand the mechanics and physiology of breathing, including gas exchange, the role of CO2, and common dysfunctional breathing patterns.',
      assessmentCriteria: [
        'Describe the mechanics of inhalation and exhalation',
        'Explain the role of carbon dioxide in regulating breathing rate',
        'Identify signs of dysfunctional breathing patterns',
      ],
      content: [
        {
          heading: 'How Breathing Works',
          paragraphs: [
            'Breathing is the process of drawing air into the lungs (inhalation) and expelling it (exhalation). During inhalation, the diaphragm contracts and flattens, expanding the chest cavity and creating negative pressure that draws air in. During exhalation, the diaphragm relaxes and the elastic recoil of the lungs pushes air out.',
            'In the lungs, oxygen passes from the air into the blood via the alveoli — tiny air sacs with walls just one cell thick. Simultaneously, carbon dioxide passes from the blood into the alveoli to be exhaled. This gas exchange is the fundamental purpose of breathing.',
          ],
          imageUrl: ch1BreathingPhysiology,
          imageAlt: 'Breathing physiology diagram showing diaphragm, lungs, alveoli, and oxygen-carbon dioxide exchange',
        },
        {
          heading: 'The Role of Carbon Dioxide',
          paragraphs: [
            'Most people assume that the urge to breathe is driven by low oxygen. In reality, your breathing rate is primarily controlled by carbon dioxide (CO2) levels in the blood. When CO2 rises, chemoreceptors in the brainstem signal you to breathe. This is why holding your breath becomes uncomfortable long before oxygen levels actually drop to dangerous levels.',
            'Your CO2 tolerance — the level of CO2 at which you feel the urge to breathe — varies between individuals and can be trained. People with low CO2 tolerance breathe faster, more shallowly, and are often in a chronic state of over-breathing (hyperventilation) without realising it.',
          ],
        },
        {
          heading: 'Dysfunctional Breathing Patterns',
          bullets: [
            'Chronic mouth breathing — Bypasses nasal filtration, warming, and nitric oxide production. Associated with poor sleep, dental problems, and increased stress activation',
            'Chest (thoracic) breathing — Shallow, rapid breathing using accessory muscles rather than the diaphragm. Promotes sympathetic nervous system activation',
            'Over-breathing (hyperventilation) — Exhaling too much CO2, which paradoxically reduces oxygen delivery to tissues (the Bohr effect) and increases anxiety',
            'Breath-holding during exertion — Common during heavy lifting. While brief Valsalva manoeuvres have a role, chronic breath-holding increases blood pressure and tension',
          ],
        },
      ],
      unbreakableInsight: 'You take approximately 20,000 breaths per day. If your default pattern is dysfunctional — mouth breathing, shallow, fast — you are running a stress programme 20,000 times daily without realising it.',
      coachNote: 'Tape your mouth shut during sleep (use surgical tape — it sounds extreme but is a well-evidenced technique for promoting nasal breathing). Many people see immediate improvements in sleep quality.',
      practicalTask: {
        title: 'Breathing Pattern Assessment',
        instructions: 'Sit quietly and breathe normally for two minutes. Count your breaths per minute without trying to change them. Then note: are you breathing through your nose or mouth? Is your chest or belly moving more? Take a normal breath in, breathe out normally, then time how long you can comfortably pause before needing to breathe again (this is your BOLT score — Body Oxygen Level Test).',
        reflectionQuestions: [
          'Was your breathing rate above 12 breaths per minute (which may indicate over-breathing)?',
          'Were you predominantly chest or belly breathing?',
          'What was your BOLT score? (Under 20 seconds suggests room for improvement)',
        ],
      },
    },
    {
      number: 2,
      title: 'Diaphragmatic Breathing',
      learningOutcome: 'Master the technique of diaphragmatic breathing and understand its effects on the nervous system, posture, and core stability.',
      assessmentCriteria: [
        'Demonstrate correct diaphragmatic breathing technique',
        'Explain how diaphragmatic breathing activates the parasympathetic nervous system',
        'Describe the connection between breathing, posture, and core stability',
      ],
      content: [
        {
          heading: 'The Diaphragm — Your Primary Breathing Muscle',
          paragraphs: [
            'The diaphragm is a dome-shaped muscle at the base of your ribcage. When it contracts, it moves downward, expanding the abdominal cavity and drawing air deep into the lower lungs where gas exchange is most efficient. This is diaphragmatic breathing — sometimes called belly breathing.',
            'Most people default to chest breathing, which uses the accessory muscles of the neck and upper chest. This is less efficient, moves less air per breath, and signals the sympathetic nervous system. Retraining yourself to use the diaphragm as your primary breathing muscle is one of the most impactful changes you can make.',
          ],
          imageUrl: ch2Diaphragmatic,
          imageAlt: 'Chest breathing versus diaphragmatic breathing comparison',
        },
        {
          heading: 'How to Practise',
          paragraphs: [
            'Lie on your back with one hand on your chest and one on your belly. Breathe in slowly through your nose — aim to feel your belly hand rise while your chest hand stays relatively still. Exhale slowly through your nose, feeling your belly fall. This simple exercise retrains your default breathing pattern.',
            'Once comfortable lying down, practise seated, then standing, then during walking. The goal is for diaphragmatic breathing to become your default — not something you have to consciously activate.',
          ],
          bullets: [
            'Step 1 — Lie on your back, knees bent, hands on chest and belly',
            'Step 2 — Inhale through the nose for 4 seconds, feeling belly rise',
            'Step 3 — Exhale through the nose for 6 seconds, feeling belly fall',
            'Step 4 — Repeat for 5 minutes, twice daily',
            'Progression — Practise in seated, standing, then walking positions as it becomes natural',
          ],
        },
        {
          heading: 'Breathing and Core Stability',
          paragraphs: [
            'Your diaphragm is not just a breathing muscle — it is a core stability muscle. Proper diaphragmatic breathing creates intra-abdominal pressure that stabilises your spine. This is why elite strength athletes use the Valsalva manoeuvre (a controlled breath-hold against a closed glottis) during heavy lifts — it maximises core pressure and spinal stability.',
            'Poor breathing mechanics and poor core stability are often the same problem. By retraining your diaphragm, you improve both simultaneously.',
          ],
        },
      ],
      unbreakableInsight: 'The most powerful performance tool you own sits at the base of your ribcage and you have probably been using it incorrectly for years. Retraining your diaphragm changes everything downstream.',
      coachNote: 'Practise diaphragmatic breathing for 5 minutes before bed. It doubles as a sleep aid and a breathing retraining tool. Consistency matters more than duration — 5 minutes daily beats 30 minutes occasionally.',
      practicalTask: {
        title: 'Diaphragmatic Breathing Practice',
        instructions: 'Practise the lying diaphragmatic breathing protocol for 5 minutes, twice daily, for seven consecutive days. Track each session with a simple yes/no and note any changes in your default breathing pattern or stress levels.',
        reflectionQuestions: [
          'Did you find it easier by the end of the week compared to the first day?',
          'Did you notice your breathing changing unconsciously during the day?',
          'How did the practice affect your stress levels or sleep quality?',
        ],
      },
    },
    {
      number: 3,
      title: 'Box Breathing & Calming Techniques',
      learningOutcome: 'Learn structured breathing techniques designed to activate the parasympathetic nervous system and reduce acute stress.',
      assessmentCriteria: [
        'Describe the box breathing protocol and its physiological effects',
        'Explain why extended exhale techniques are effective for calming',
        'Apply calming breathing techniques to real-world stress situations',
      ],
      content: [
        {
          heading: 'Box Breathing (4-4-4-4)',
          paragraphs: [
            'Box breathing — also called square breathing — is a structured protocol used by military special forces, emergency services, and high-performance athletes to maintain composure under pressure. It works by imposing a controlled, rhythmic pattern on your breathing that activates the parasympathetic nervous system.',
            'The protocol: Inhale through the nose for 4 seconds. Hold for 4 seconds. Exhale through the nose for 4 seconds. Hold for 4 seconds. Repeat for 4–5 minutes. The equal timing creates a balanced autonomic state — neither overly activated nor overly relaxed.',
          ],
          imageUrl: ch3BoxBreathing,
          imageAlt: 'Box breathing cycle showing inhale, hold, exhale, and hold timing',
        },
        {
          heading: 'Extended Exhale Breathing (4-7-8)',
          paragraphs: [
            'For deeper calming, extend the exhale relative to the inhale. The 4-7-8 technique (inhale for 4 seconds, hold for 7, exhale for 8) strongly activates the vagus nerve and shifts the nervous system toward parasympathetic dominance. This technique is particularly effective before sleep or during moments of acute anxiety.',
            'The mechanism is straightforward: the exhale phase is when your heart rate naturally decreases (respiratory sinus arrhythmia). By extending the exhale, you spend more time in each breathing cycle with a decreasing heart rate, cumulatively reducing your overall arousal state.',
          ],
        },
        {
          heading: 'When to Use Calming Techniques',
          bullets: [
            'Before sleep — 5 minutes of extended exhale breathing helps transition from wakefulness to sleep readiness',
            'Before a stressful event — Job interview, difficult conversation, competition. 2–3 minutes of box breathing reduces acute anxiety',
            'During acute stress — When you feel overwhelmed, angry, or panicked. Even 6 slow breaths can shift your nervous system state',
            'Between training sets — For exercises requiring focus and calm (e.g., heavy squats, Olympic lifts)',
            'After an argument or conflict — Before responding, take 10 slow breaths. This prevents reactive decisions you may regret',
          ],
        },
      ],
      unbreakableInsight: 'The Navy SEALs use box breathing before combat. If it works under gunfire, it will work before your presentation, your exam, or your heavy deadlift. The technique is simple — the discipline to use it is the hard part.',
      coachNote: 'Set a daily reminder to practise box breathing for 3 minutes. Do not wait until you are stressed — practise when calm so the technique is automatic when you need it under pressure.',
      practicalTask: {
        title: 'Calming Technique Practice',
        instructions: 'Practise box breathing (4-4-4-4) for 3 minutes in the morning and extended exhale breathing (4-7-8) for 3 minutes before bed, every day for one week. Rate your stress level before and after each session on a 1–10 scale.',
        reflectionQuestions: [
          'Did you notice a consistent reduction in stress levels after each session?',
          'Which technique felt more effective for you — box breathing or extended exhale?',
          'Were there situations during the week where you used these techniques reactively?',
        ],
      },
    },
    {
      number: 4,
      title: 'Energising Breathwork',
      learningOutcome: 'Learn breathing techniques designed to increase alertness, energy, and sympathetic nervous system activation for performance.',
      assessmentCriteria: [
        'Describe the physiological mechanism behind energising breathwork',
        'Explain the Unbreakable Breathwork Method and its effects',
        'Discuss safety considerations for hyperventilation-based techniques',
      ],
      content: [
        {
          heading: 'When You Need Activation, Not Calm',
          paragraphs: [
            'While calming techniques are essential, there are times when you need the opposite — increased alertness, energy, and readiness. Before a competition, a heavy training session, or when you need to overcome fatigue, energising breathwork can shift your nervous system into a state of controlled activation.',
            'These techniques work by deliberately increasing sympathetic nervous system tone through controlled hyperventilation, breath holds, or rapid breathing patterns. They temporarily lower CO2 levels, alter blood pH, and trigger an adrenaline response.',
          ],
          imageUrl: ch4EnergisingBreathwork,
          imageAlt: 'Calming versus energising breathwork nervous system effects',
        },
        {
          heading: 'The Unbreakable Breathwork Method',
          paragraphs: [
            'The Unbreakable Breathwork technique involves 30–40 deep, rapid breaths followed by an exhale and breath retention (holding with lungs empty) for as long as comfortable, then a recovery breath held for 15 seconds. This cycle is repeated 3–4 times.',
            'The rapid breathing phase lowers CO2 levels (respiratory alkalosis), which allows you to hold your breath longer than normal and triggers a controlled adrenaline release. The breath retention phase activates the dive reflex and influences autonomic tone. Research has shown this method can influence the innate immune response and increase pain tolerance.',
          ],
          bullets: [
            'Phase 1 — 30–40 deep breaths: inhale fully through mouth or nose, exhale passively (do not force)',
            'Phase 2 — After the final exhale, hold your breath with lungs empty. Time it. The urge to breathe comes from rising CO2, not low oxygen',
            'Phase 3 — When you must breathe, inhale deeply and hold for 15 seconds (recovery breath)',
            'Repeat — 3–4 rounds total. Retention times typically increase with each round',
          ],
        },
        {
          heading: 'Safety Considerations',
          paragraphs: [
            'Energising breathwork techniques involving hyperventilation carry real risks and must be practised with awareness. The lowered CO2 levels can cause tingling, light-headedness, and in extreme cases, loss of consciousness. Never practise these techniques in or near water, while driving, or in any situation where fainting would be dangerous.',
            'Start conservatively — begin with 20 breaths per round rather than 40, and do not push breath holds to the absolute limit until you are experienced. If you have epilepsy, cardiovascular conditions, or are pregnant, consult a healthcare professional before attempting these techniques.',
          ],
        },
      ],
      unbreakableInsight: 'Your breath can be a sedative or a stimulant — the same tool used differently produces opposite effects. Learning to control both sides of this spectrum gives you a level of autonomic control most people never access.',
      coachNote: 'Practise Unbreakable Breathwork in the morning on an empty stomach, never near water or while standing. Start with 3 rounds and build tolerance over weeks. Track your retention times — they are a useful measure of CO2 tolerance improvement.',
      practicalTask: {
        title: 'Energising Breathwork Session',
        instructions: 'Complete one Unbreakable Breathwork session (3 rounds) in a safe environment — seated or lying down, not near water. Record your breath hold time for each round. Note how you feel before and after.',
        reflectionQuestions: [
          'Did your retention time increase across the three rounds?',
          'What physical sensations did you notice during the rapid breathing phase?',
          'How did your energy and alertness levels change after the session?',
        ],
      },
    },
    {
      number: 5,
      title: 'Introduction to Cold Exposure',
      learningOutcome: 'Understand the physiological effects of cold exposure and the evidence behind its use for resilience, recovery, and mental health.',
      assessmentCriteria: [
        'Describe the physiological response to cold water immersion',
        'Explain the evidence for cold exposure benefits on mood and resilience',
        'Discuss safety protocols for beginners',
      ],
      content: [
        {
          heading: 'What Happens When You Get Cold',
          paragraphs: [
            'When your body is exposed to cold — particularly cold water — a cascade of physiological responses occurs. Blood vessels in the skin constrict (vasoconstriction) to preserve core temperature. Your heart rate and blood pressure increase. Breathing rate accelerates. Noradrenaline and dopamine are released in significant quantities.',
            'The noradrenaline release is particularly interesting — cold water immersion can increase noradrenaline by 200–300%, producing sustained improvements in alertness, mood, and focus. The dopamine response provides a natural mood elevation that can last for several hours.',
          ],
          imageUrl: ch5ColdExposure,
          imageAlt: 'Cold exposure physiology diagram showing vasoconstriction and hormone response',
        },
        {
          heading: 'Evidence-Based Benefits',
          bullets: [
            'Mood and mental health — Significant increases in dopamine and noradrenaline produce sustained mood elevation. Some research suggests regular cold exposure may be as effective as antidepressants for mild to moderate depression',
            'Mental resilience — Deliberately choosing discomfort builds the psychological muscle of doing hard things when you do not want to. This transfers to other areas of life',
            'Inflammation — Cold exposure reduces inflammatory markers, which may aid recovery from intense exercise',
            'Brown fat activation — Regular cold exposure activates brown adipose tissue, which generates heat by burning calories. The metabolic impact is modest but real',
            'Immune function — Some evidence suggests regular cold exposure may modestly improve immune function, though this research is still emerging',
          ],
        },
        {
          heading: 'Getting Started Safely',
          paragraphs: [
            'Begin with cold showers rather than ice baths. End your normal shower with 30 seconds of the coldest water you can tolerate. Focus on controlling your breathing — the instinct is to gasp and hyperventilate, but practising slow, controlled breathing through the discomfort is the primary resilience training.',
            'Over weeks, gradually increase the duration (up to 2–3 minutes) and decrease the temperature. There is no need to pursue extreme cold — the majority of benefits occur in the first 1–3 minutes of exposure at 10–15°C.',
          ],
          bullets: [
            'Week 1–2 — 30 seconds of cold at the end of your shower',
            'Week 3–4 — 60 seconds of cold',
            'Week 5–6 — 90 seconds to 2 minutes',
            'Beyond — 2–3 minutes at the coldest setting, or progress to cold water immersion if desired',
            'Never force it — listen to your body and stop if you feel faint, excessively dizzy, or experience chest pain',
          ],
        },
      ],
      unbreakableInsight: 'Cold exposure is not about punishing yourself — it is about proving to yourself that you can choose to do something uncomfortable and survive it. That proof transfers to every other hard thing in your life.',
      coachNote: 'The hardest part of cold exposure is the moment before you turn the tap. Once you are in it, your body adapts faster than you expect. Focus on your breathing, not the temperature.',
      practicalTask: {
        title: 'Cold Exposure Introduction',
        instructions: 'For seven consecutive days, end your shower with 30 seconds of the coldest water available. Focus on maintaining slow, controlled nasal breathing throughout. Rate the difficulty (1–10) and your mood 30 minutes afterwards.',
        reflectionQuestions: [
          'Did the difficulty decrease over the seven days?',
          'How did your mood and energy levels change in the 30 minutes following cold exposure?',
          'What mental strategies helped you stay in the cold water?',
        ],
      },
    },
    {
      number: 6,
      title: 'Introduction to Journaling & Self-Reflection',
      learningOutcome: 'Understand the evidence behind journaling as a mental health and resilience tool, and establish a practical daily practice.',
      assessmentCriteria: [
        'Explain the psychological benefits of expressive writing',
        'Describe different journaling approaches and their applications',
        'Design a sustainable daily journaling practice',
      ],
      content: [
        {
          heading: 'Why Journaling Works',
          paragraphs: [
            'Expressive writing — putting your thoughts and feelings into words on paper — has been extensively researched since James Pennebaker\'s pioneering studies in the 1980s. The evidence consistently shows that regular journaling reduces stress, improves mood, enhances immune function, and helps process difficult experiences.',
            'The mechanism appears to involve cognitive processing — when you write about an experience, you are forced to organise your thoughts, identify patterns, and create narrative coherence from what might otherwise remain a chaotic emotional experience. This processing reduces the emotional charge associated with stressful events.',
          ],
          imageUrl: ch6Journaling,
          imageAlt: 'Journaling benefits diagram showing stress reduction, pattern recognition, and clarity',
        },
        {
          heading: 'Types of Journaling',
          bullets: [
            'Free writing — Write whatever comes to mind for a set time (5–10 minutes). No rules, no editing, no judgement. Useful for processing emotions and clearing mental clutter',
            'Gratitude journaling — Write 3 things you are grateful for each day. Research shows this shifts attention toward positive aspects of life and improves wellbeing',
            'Reflective journaling — Structured reflection on your day: what went well, what did not, what you learned. Builds self-awareness and pattern recognition',
            'Habit journaling — Track daily habits and behaviours. The act of recording creates accountability and reveals patterns invisible to memory alone',
            'Prompt-based journaling — Use specific questions to guide your writing. Useful when you do not know where to start',
          ],
        },
        {
          heading: 'Building the Habit',
          paragraphs: [
            'The most important factor in journaling is consistency, not quality. A messy paragraph every morning is infinitely more valuable than a beautifully crafted entry once a month. Set a time (morning or evening), keep it short (5 minutes is sufficient), and lower the bar — do not try to write perfectly.',
            'If you struggle to start, use a simple three-question framework: What am I grateful for today? What is my biggest challenge right now? What is one thing I can do about it? This takes 3 minutes and provides enormous clarity over time.',
          ],
        },
      ],
      unbreakableInsight: 'The thoughts that cause you the most stress are usually the ones you have never written down. Putting them on paper does not solve the problem — but it stops the problem from owning you.',
      coachNote: 'Buy a cheap notebook and keep it by your bed. Write for 5 minutes every morning before you check your phone. After 30 days, read back through your entries — you will see patterns you never noticed in real time.',
      practicalTask: {
        title: 'Seven-Day Journaling Challenge',
        instructions: 'Journal every morning for seven consecutive days using the three-question framework: (1) What am I grateful for? (2) What is my biggest challenge? (3) What is one action I can take? Keep each entry to 5 minutes maximum.',
        reflectionQuestions: [
          'Did the practice feel easier by day seven compared to day one?',
          'Did you notice any recurring themes across the week?',
          'How did starting the day with reflection affect your mindset for the rest of the day?',
        ],
      },
    },
    {
      number: 7,
      title: 'Nasal Breathing & Respiratory Health',
      learningOutcome: 'Understand the physiological advantages of nasal breathing over mouth breathing, the role of nitric oxide, and how to transition to habitual nasal breathing during rest and low-intensity exercise.',
      assessmentCriteria: [
        'Explain the key differences between nasal and mouth breathing',
        'Describe the role of nitric oxide produced during nasal breathing',
        'Identify strategies for transitioning to habitual nasal breathing',
      ],
      content: [
        {
          heading: 'Why Your Nose Matters More Than You Think',
          paragraphs: [
            'Your nose is not just a passive air hole — it is a sophisticated filtration, humidification, and conditioning system. Nasal breathing warms incoming air to body temperature, humidifies it to protect delicate lung tissue, and filters out pathogens and particles. None of this happens when you breathe through your mouth.',
            'Perhaps most importantly, nasal breathing triggers the production of nitric oxide (NO) in the paranasal sinuses. Nitric oxide is a vasodilator — it widens blood vessels, improving blood flow and oxygen delivery to tissues. It also has antimicrobial properties, helping protect against respiratory infections.',
          ],
        },
        {
          heading: 'Mouth Breathing — The Hidden Problem',
          bullets: [
            'Chronic mouth breathing activates sympathetic tone — keeping you in a low-level stress state even at rest',
            'It bypasses the nasal filtration system, increasing susceptibility to respiratory infections and allergies',
            'Mouth breathing during sleep contributes to snoring, poor sleep quality, and reduced oxygen saturation',
            'Over time, habitual mouth breathing can alter facial structure, posture (forward head position), and dental health',
            'Many people mouth-breathe without awareness — especially during exercise, concentration, or sleep',
          ],
        },
        {
          heading: 'Transitioning to Nasal Breathing',
          paragraphs: [
            'If you have been a mouth breather for years, the transition takes patience. Your nasal passages may feel restricted initially, but they adapt — nasal breathing begets better nasal breathing as the tissues respond to consistent use.',
          ],
          bullets: [
            'Start at rest — Consciously close your mouth and breathe through your nose during sedentary activities: working, reading, watching TV',
            'Progress to walking — Nasal-only breathing during walks is an excellent training ground. If you cannot maintain it, slow down',
            'Low-intensity exercise — Gradually introduce nasal breathing during warm-ups and easy cardio. Expect performance to dip temporarily',
            'Sleep taping — Medical-grade mouth tape during sleep is a simple intervention. Start with a small strip and ensure you can still open your mouth if needed',
            'Be patient — Full adaptation can take 2–6 weeks of consistent practice',
          ],
        },
      ],
      unbreakableInsight: 'How you breathe when you are not thinking about it reveals your baseline nervous system state. If your default is shallow mouth breathing, your body thinks it is always under mild threat.',
      coachNote: 'Try this: right now, close your mouth and take five slow breaths through your nose. Notice how different it feels compared to your usual breathing pattern. That difference is information about your current state.',
      practicalTask: {
        title: 'Nasal Breathing Transition',
        instructions: 'For one week, commit to nasal-only breathing during all non-exercise waking hours. Set three daily reminders on your phone to check: "Am I breathing through my nose?" Log your observations each evening — energy levels, stress, sleep quality.',
        reflectionQuestions: [
          'How often did you catch yourself mouth breathing when reminded?',
          'Did you notice any changes in your resting heart rate, energy, or stress levels?',
          'What situations triggered a return to mouth breathing?',
        ],
      },
    },
    {
      number: 8,
      title: 'Breathwork Programming & Integration',
      learningOutcome: 'Learn how to structure a personal breathwork practice, integrate techniques into daily routines, and select the right protocol for different situations.',
      assessmentCriteria: [
        'Design a basic weekly breathwork programme targeting specific outcomes',
        'Match breathwork techniques to appropriate contexts (calming, energising, focus, recovery)',
        'Explain the principle of progressive breathwork training',
      ],
      content: [
        {
          heading: 'From Techniques to Practice',
          paragraphs: [
            'Knowing breathing techniques is not the same as having a breathing practice. The previous chapters taught you diaphragmatic breathing, box breathing, energising breathwork, and calming protocols. This chapter teaches you how to integrate them into a coherent, sustainable daily practice that serves your goals.',
            'Like physical training, breathwork benefits from structure, progression, and consistency. A haphazard approach — doing random techniques when you remember — will produce haphazard results.',
          ],
        },
        {
          heading: 'Matching Techniques to Contexts',
          bullets: [
            'Morning activation — 2–3 minutes of energising breathwork (e.g., rhythmic breathing or gentle cyclic breathing rounds) to shift from parasympathetic sleep state to alert wakefulness',
            'Pre-training — 60 seconds of energising nasal breathing to prime the nervous system without over-stimulating',
            'Post-training — 3–5 minutes of extended exhale breathing (e.g., 4-count inhale, 6–8-count exhale) to accelerate parasympathetic recovery',
            'Stressful moments — Box breathing (4-4-4-4) as an immediate calming intervention during acute stress',
            'Pre-sleep — 5 minutes of slow diaphragmatic breathing with extended exhale to downregulate the nervous system',
            'Focus work — 2 minutes of controlled nasal breathing before deep work sessions to prime attention',
          ],
        },
        {
          heading: 'Building Your Weekly Programme',
          paragraphs: [
            'A sustainable breathwork programme does not require hours. Five to ten minutes per day, applied consistently and with intention, will produce measurable changes in your baseline stress levels, recovery quality, and emotional regulation within two to four weeks.',
          ],
          bullets: [
            'Daily minimum — Morning activation (2 min) + evening wind-down (5 min). This is your non-negotiable baseline',
            'Training days — Add pre-training priming (1 min) and post-training recovery breathing (3–5 min)',
            'Stress days — Add box breathing intervals whenever you notice rising tension. Even 60 seconds makes a difference',
            'Weekly longer session — One 15–20 minute guided breathwork session per week for deeper nervous system training',
            'Track your practice — Note which techniques you used, when, and how you felt. Patterns emerge within two weeks',
          ],
        },
      ],
      unbreakableInsight: 'Breathwork is the only tool in this entire course that costs nothing, requires no equipment, takes under five minutes, and can be done anywhere. Yet it is consistently the most underused. The gap between knowing and doing is where most people live.',
      coachNote: 'Do not try to add everything at once. Start with the morning and evening bookends — two minutes on waking, five minutes before sleep. Once that is automatic (give it two weeks), layer in pre- and post-training protocols.',
      practicalTask: {
        title: 'Personal Breathwork Programme',
        instructions: 'Design your personal breathwork programme for the next two weeks. Choose a morning protocol, an evening protocol, and one context-specific technique (e.g., pre-training or stressful moments). Follow it daily and log adherence plus subjective effects.',
        reflectionQuestions: [
          'Which technique felt most impactful for you personally?',
          'Did you find it easier to maintain morning or evening practice?',
          'How did structured breathwork compare to doing techniques randomly?',
        ],
      },
    },
  ],
};

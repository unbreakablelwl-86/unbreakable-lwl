import { getUniversityImage } from '@/lib/university/imageMap';
import type { Unit } from '../types';

export const mindsetL2Unit4: Unit = {
  number: 4,
  title: 'Practical Application & Daily Practice',
  description: 'Bring together everything you have learned into a sustainable daily practice that builds mental resilience, focus, and wellbeing over time.',
  chapters: [
    {
      number: 1,
      title: 'Building a Morning Routine',
      learningOutcome: 'Design a practical, sustainable morning routine that sets the tone for mental performance throughout the day.',
      assessmentCriteria: [
        'Identify the key components of an effective morning routine for mental resilience',
        'Explain why consistency matters more than duration or complexity',
        'Design a personalised morning routine lasting 15–30 minutes',
      ],
      content: [
        {
          heading: 'Why Mornings Matter',
          paragraphs: [
            'How you start your day sets the neurological and psychological tone for everything that follows. A morning spent scrolling social media, checking emails, and reacting to other people\'s priorities puts you in reactive mode from the start. A morning spent with intentional practices puts you in proactive mode — focused, calm, and directed.',
            'This does not require waking at 4am or performing elaborate two-hour rituals. A simple, consistent 15–30 minute routine that includes movement, breathwork, and reflection is sufficient to create a meaningful shift in your daily experience.',
          ],
          imageUrl: getUniversityImage('mindl2-u4-ch1-morning-routine'),
          imageAlt: 'Morning routine timeline with breathwork, journaling, movement, and hydration',
        },
        {
          heading: 'Core Components',
          bullets: [
            'No phone for the first 30–60 minutes — Checking your phone immediately floods your brain with other people\'s priorities and triggers reactive thinking',
            'Hydration — Drink 500ml of water before anything else. You wake mildly dehydrated after 7–8 hours without fluid',
            'Breathwork — 3–5 minutes of box breathing or diaphragmatic breathing to set your nervous system baseline',
            'Movement — 5–10 minutes of gentle movement: stretching, walking, bodyweight exercises. This wakes up your body and increases alertness',
            'Reflection — 5 minutes of journaling: gratitude, intentions for the day, or processing yesterday\'s challenges',
          ],
        },
        {
          heading: 'Start Small, Stay Consistent',
          paragraphs: [
            'The biggest mistake people make with morning routines is starting too ambitiously. A 90-minute routine sounds impressive but collapses the first time you oversleep or have an early commitment. Start with 10 minutes — breathwork and journaling only — and add components as the habit solidifies.',
            'Consistency beats intensity. A 10-minute routine you do every day for a year will transform your life. A 60-minute routine you abandon after two weeks will not.',
          ],
        },
      ],
      unbreakableInsight: 'The first hour of your day belongs to you. If you give it to your phone, your email, and other people\'s emergencies, you have surrendered the most powerful hour of your day before it has even begun.',
      coachNote: 'Charge your phone in another room tonight. When you wake up, do not retrieve it until your morning routine is complete. This single change is the most impactful thing you can do for your mornings.',
      practicalTask: {
        title: 'Morning Routine Design',
        instructions: 'Design a 15-minute morning routine using at least three components from this chapter. Implement it for seven consecutive days. Track completion and note how your day feels compared to mornings without the routine.',
        reflectionQuestions: [
          'Which component of the routine had the most noticeable impact?',
          'Was 15 minutes sustainable every day, or do you need to adjust the duration?',
          'How did your mornings without the routine compare?',
        ],
      },
    },
    {
      number: 2,
      title: 'Stress Inoculation Training',
      learningOutcome: 'Understand stress inoculation theory and how deliberate, controlled exposure to stress builds resilience.',
      assessmentCriteria: [
        'Define stress inoculation and explain its three phases',
        'Describe how controlled discomfort builds mental toughness',
        'Design a progressive stress exposure plan',
      ],
      content: [
        {
          heading: 'What Is Stress Inoculation?',
          paragraphs: [
            'Stress inoculation training (SIT), developed by Donald Meichenbaum, is based on a simple principle: controlled exposure to manageable stress builds resilience to larger stressors. Just as a vaccine exposes your immune system to a weakened pathogen to build immunity, stress inoculation exposes your nervous system to controlled challenges to build mental toughness.',
            'The key word is "controlled." Uncontrolled, overwhelming stress causes trauma. Controlled, progressive stress — where you choose the challenge and have tools to manage it — builds capacity.',
          ],
          imageUrl: getUniversityImage('mindl2-u4-ch2-stress-inoculation'),
          imageAlt: 'Stress inoculation training phases diagram',
        },
        {
          heading: 'The Three Phases',
          bullets: [
            'Phase 1: Education — Understand your stress response (covered in earlier chapters). Know what happens physiologically and psychologically when you are stressed',
            'Phase 2: Skill Acquisition — Learn and practise coping tools: breathing techniques, cognitive reappraisal, visualisation, the STOP method. These become your toolkit',
            'Phase 3: Application — Deliberately expose yourself to progressively challenging situations while using your tools. Cold showers, public speaking, difficult conversations, competitive events',
          ],
        },
        {
          heading: 'Progressive Exposure in Practice',
          paragraphs: [
            'Start with challenges that are uncomfortable but manageable — a cold shower, speaking up in a meeting, trying a new skill in public. As your confidence and competence grow, increase the difficulty. The discomfort does not disappear — but your capacity to handle it expands.',
            'Each successful exposure provides evidence that you can handle hard things. This evidence accumulates into a deep, experiential confidence that no motivational quote or theory can replicate.',
          ],
        },
      ],
      unbreakableInsight: 'Comfort is the enemy of growth. Not extreme suffering — but the deliberate, daily choice to do something slightly harder than you feel ready for. That is where resilience lives.',
      coachNote: 'Choose one uncomfortable thing to do every day for a month. It does not have to be dramatic — cold water, a difficult conversation, volunteering to go first. The practice of choosing discomfort is the training.',
      practicalTask: {
        title: 'Progressive Stress Exposure Plan',
        instructions: 'Design a 4-week progressive stress exposure plan. Week 1: one small daily discomfort. Week 2: add a slightly bigger weekly challenge. Week 3: combine multiple tools. Week 4: attempt something that previously felt beyond you.',
        reflectionQuestions: [
          'How did your response to discomfort change over the four weeks?',
          'Which coping tools were most effective during challenging moments?',
          'Did the daily practice transfer to how you handle unexpected stress?',
        ],
      },
    },
    {
      number: 3,
      title: 'Mindfulness & Present-Moment Awareness',
      learningOutcome: 'Understand the evidence behind mindfulness practices and develop a sustainable mindfulness routine.',
      assessmentCriteria: [
        'Define mindfulness and distinguish it from meditation',
        'Explain the evidence for mindfulness benefits on stress, focus, and emotional regulation',
        'Apply simple mindfulness techniques to daily life',
      ],
      content: [
        {
          heading: 'What Mindfulness Actually Is',
          paragraphs: [
            'Mindfulness is paying attention to the present moment, on purpose, without judgement. It is not about clearing your mind, achieving a state of bliss, or sitting cross-legged for hours. It is simply the practice of noticing what is happening right now — your thoughts, sensations, emotions, and surroundings — without trying to change them.',
            'The reason mindfulness works is that most mental suffering comes from ruminating about the past (regret, guilt) or worrying about the future (anxiety, fear). When you bring your attention to the present moment, you interrupt these patterns and give your nervous system a break from the chronic stress they generate.',
          ],
          imageUrl: getUniversityImage('mindl2-u4-ch3-mindfulness'),
          imageAlt: 'Mindfulness timeline showing past rumination, present awareness, and future worry',
        },
        {
          heading: 'The Evidence',
          bullets: [
            'Stress reduction — Meta-analyses show consistent moderate-to-large reductions in perceived stress',
            'Attention — Regular practice improves sustained attention and reduces mind-wandering',
            'Emotional regulation — Increases the gap between stimulus and response, allowing more conscious choices',
            'Physical health — Reduces blood pressure, improves sleep quality, and decreases inflammatory markers',
            'Brain structure — Long-term practitioners show increased cortical thickness in areas associated with attention and emotional regulation',
          ],
        },
        {
          heading: 'Simple Practices',
          paragraphs: [
            'You do not need an app, a retreat, or special equipment. The simplest mindfulness practice is this: sit comfortably, close your eyes, and focus on your breathing. When your mind wanders (it will), notice that it has wandered and gently return your attention to the breath. That moment of noticing is the practice — not the unbroken focus.',
            'You can also practise mindfulness during daily activities: eating without screens (noticing flavours and textures), walking without headphones (noticing your surroundings), or simply pausing between tasks to take three conscious breaths.',
          ],
        },
      ],
      unbreakableInsight: 'Mindfulness is not about having a quiet mind — it is about noticing when your mind is loud. Every time you catch yourself lost in thought and return to the present, you have just done a mental bicep curl. That is the practice.',
      coachNote: 'Start with 3 minutes per day. Set a timer, sit quietly, breathe, and notice. When your mind wanders, return to the breath. After two weeks, increase to 5 minutes. Small, consistent practice beats sporadic long sessions every time.',
      practicalTask: {
        title: 'Mindfulness Foundation',
        instructions: 'Practise 3 minutes of seated mindfulness (breath focus) every day for 14 days. Track each session with a simple yes/no. Additionally, practise one "mindful moment" during a daily activity (eating, walking, brushing teeth) each day.',
        reflectionQuestions: [
          'How often did your mind wander during the 3-minute sessions?',
          'Did you notice a difference in your daily activities when practising mindfully?',
          'Did the practice get easier or harder over the 14 days?',
        ],
      },
    },
    {
      number: 4,
      title: 'Building Your Personal Resilience Protocol',
      learningOutcome: 'Synthesise everything learned in the course into a personalised, sustainable daily resilience practice.',
      assessmentCriteria: [
        'Select appropriate techniques based on individual needs and preferences',
        'Design a balanced daily protocol that includes breathwork, reflection, and exposure',
        'Explain how to progress and adjust the protocol over time',
      ],
      content: [
        {
          heading: 'Bringing It All Together',
          paragraphs: [
            'Throughout this course, you have learned the science behind resilience, breathwork, cold exposure, focus, habit formation, emotional regulation, visualisation, and mindfulness. The final step is assembling these tools into a personalised daily practice that works for your life, your schedule, and your specific goals.',
            'The key principle is sustainability. A protocol that takes 15 minutes and you do every day is infinitely more powerful than a 90-minute protocol you abandon after a week. Start with the minimum effective dose and build from there.',
          ],
          imageUrl: getUniversityImage('mindl2-u4-ch4-resilience-protocol'),
          imageAlt: 'Personal resilience protocol template with morning, training, and evening blocks',
        },
        {
          heading: 'Building Your Protocol',
          bullets: [
            'Morning (10 minutes minimum) — Choose one: box breathing, diaphragmatic breathing, or Unbreakable Breathwork. Add journaling (3 questions)',
            'Pre-training (3 minutes) — Process visualisation of the upcoming session',
            'During the day — One mindful moment (eating, walking, or commuting without distraction)',
            'Evening (5 minutes) — Reflective journaling: what went well, what you learned, what you are grateful for',
            'Weekly — One cold exposure session, one deliberate stress inoculation challenge',
            'Monthly — Review and adjust. What is working? What needs changing? What is the next progression?',
          ],
        },
        {
          heading: 'Progression Framework',
          paragraphs: [
            'Like physical training, your mental practice should progress over time. Increase breathwork duration, extend cold exposure time, tackle bigger stress challenges, and deepen your mindfulness practice. But only progress when the current level feels manageable and consistent — rushing leads to burnout and abandonment.',
            'The ultimate goal is not to follow a protocol forever — it is for these practices to become so integrated into your identity that they feel as natural as brushing your teeth. At that point, you are not practising resilience — you are living it.',
          ],
        },
      ],
      unbreakableInsight: 'Knowledge without practice is entertainment. You have learned the tools — now the only question is whether you will use them. The course is over. The practice starts now.',
      coachNote: 'Write your personal protocol on a single card. Keep it simple — no more than five daily practices. Post it where you will see it every morning. After 30 days of consistent practice, you will not recognise your baseline state.',
      practicalTask: {
        title: 'Personal Resilience Protocol',
        instructions: 'Design your personal daily resilience protocol on a single page. Include morning, during-day, and evening practices. Specify exact durations. Commit to following it for 30 days. Start tomorrow.',
        reflectionQuestions: [
          'Is your protocol realistic given your current schedule and commitments?',
          'Which practices are you most looking forward to and which feel most challenging?',
          'How will you hold yourself accountable for the next 30 days?',
        ],
      },
    },
    {
      number: 5,
      title: 'Evening Routines & Sleep Optimisation',
      learningOutcome: 'Understand the science of sleep and its critical role in physical and mental recovery, and design an evidence-based evening routine that maximises sleep quality.',
      assessmentCriteria: [
        'Explain the stages of sleep and their specific functions for physical recovery and cognitive consolidation',
        'Identify at least five evidence-based factors that improve or impair sleep quality',
        'Design a personal evening wind-down protocol based on sleep hygiene principles',
      ],
      content: [
        {
          heading: 'Sleep: The Most Underrated Performance Tool',
          paragraphs: [
            'You can train perfectly, eat perfectly, and manage your stress — but if you\'re sleeping poorly, none of it matters as much as it should. Sleep is when your body repairs muscle tissue, consolidates learning, regulates hormones, and clears metabolic waste from the brain.',
            'One night of poor sleep (under 6 hours) reduces testosterone by up to 15%, impairs glucose metabolism, increases cortisol, reduces reaction time, and weakens willpower. Chronic sleep deprivation is linked to obesity, depression, reduced immune function, and cognitive decline. It\'s not a luxury — it\'s a non-negotiable.',
          ],
        },
        {
          heading: 'The Architecture of Sleep',
          paragraphs: [
            'Sleep isn\'t one uniform state — it cycles through distinct stages roughly every 90 minutes:',
          ],
          bullets: [
            'Stage 1 (N1) — light sleep, transition from wakefulness. Lasts 5-10 minutes. Easy to wake from.',
            'Stage 2 (N2) — body temperature drops, heart rate slows. Memory consolidation begins. Makes up about 50% of total sleep.',
            'Stage 3 (N3) — deep sleep / slow-wave sleep. This is where physical recovery happens: growth hormone release peaks, muscle repair occurs, immune function is restored. Hardest to wake from.',
            'REM Sleep — rapid eye movement sleep. Brain activity increases to near-waking levels. This is where emotional processing, creativity, and procedural memory consolidation occur. Dreams happen here.',
          ],
          paragraphs: [
            'Deep sleep (N3) dominates the first half of the night. REM sleep dominates the second half. This is why cutting sleep short costs you REM, and going to bed too late costs you deep sleep. Both matter — you need a full 7-9 hours to cycle through all stages adequately.',
          ],
          imageUrl: getUniversityImage('mindl2-u4-ch5-sleep-stages'),
          imageAlt: 'Hypnogram showing sleep architecture across an 8-hour night with deep sleep dominant early and REM dominant later',
        },
        {
          heading: 'What Destroys Sleep Quality',
          bullets: [
            'Blue light from screens — suppresses melatonin production by up to 50%, delaying sleep onset and reducing sleep quality. Worst in the 2 hours before bed.',
            'Caffeine after 2pm — caffeine has a half-life of 5-6 hours. A coffee at 4pm means half the caffeine is still in your system at 10pm.',
            'Alcohol — while it may help you fall asleep faster, alcohol fragments sleep architecture, suppresses REM, and causes middle-of-the-night waking. Even 1-2 drinks significantly reduces sleep quality.',
            'Irregular sleep schedule — your circadian rhythm thrives on consistency. Going to bed and waking up at wildly different times confuses your internal clock.',
            'Room temperature too high — optimal sleep temperature is 16-19°C (60-67°F). Your body needs to drop its core temperature to initiate deep sleep.',
            'Late heavy meals — eating large meals within 2 hours of bed can cause discomfort and elevate body temperature through digestion.',
          ],
        },
        {
          heading: 'Building an Evening Wind-Down',
          paragraphs: [
            'An effective evening routine isn\'t about rigid rules — it\'s about sending consistent signals to your brain that it\'s time to switch off. Start your wind-down 60-90 minutes before your target sleep time:',
          ],
          bullets: [
            'Set a "screens off" alarm — 60 minutes before bed, put devices away. Switch to reading, journaling, or conversation.',
            'Dim the lights — bright overhead lights suppress melatonin. Use lamps, candles, or red-spectrum bulbs in the evening.',
            'Cool your environment — lower the thermostat or open a window. A cool room promotes deeper sleep.',
            'Light stretching or breathing — 5-10 minutes of gentle mobility work or box breathing activates the parasympathetic nervous system.',
            'Brain dump — write down anything on your mind: tomorrow\'s tasks, worries, random thoughts. Getting them on paper stops your brain from trying to remember them at 2am.',
            'Consistent bedtime — aim for the same time ±30 minutes every night, including weekends.',
          ],
        },
        {
          heading: 'Morning Light & the Circadian Link',
          paragraphs: [
            'Your evening sleep quality actually starts in the morning. Exposing your eyes to bright natural light within 30 minutes of waking sets your circadian clock, which determines when melatonin production begins in the evening. No sunglasses — you need direct (not staring at the sun) bright light hitting your retinas.',
            'People who get morning sunlight consistently fall asleep faster, sleep deeper, and report better mood. It\'s free, takes 10 minutes, and is one of the single most impactful things you can do for your sleep.',
          ],
        },
      ],
      unbreakableInsight: 'Sleep is not "doing nothing" — it\'s the most productive thing your body does. Every adaptation from training, every lesson learned, every emotion processed happens during sleep. Sacrificing sleep for an extra hour of work or Netflix is borrowing from tomorrow\'s performance to waste today\'s time.',
      coachNote: 'Don\'t try to overhaul your entire sleep routine at once. Pick two things from this chapter that feel most relevant to your current habits and implement them for two weeks. Most people see noticeable changes in energy, mood, and training performance within days of improving their sleep hygiene.',
      practicalTask: {
        title: 'Sleep Quality Tracker',
        instructions: 'For the next 7 nights, track these variables: (1) time screens off, (2) time into bed, (3) estimated time to fall asleep, (4) any wake-ups during the night, (5) time you woke up, (6) energy rating 1-10 the following day. Also implement at least one new sleep hygiene practice from this chapter during the tracking period.',
        reflectionQuestions: [
          'What patterns did you notice between your evening habits and your energy the next day?',
          'Did the sleep hygiene change you implemented make a noticeable difference?',
          'What is the biggest obstacle between you and consistent quality sleep?',
        ],
      },
    },
    {
      number: 6,
      title: 'Journaling for Mental Clarity',
      learningOutcome: 'Understand how written reflection improves self-awareness, emotional processing, and decision-making, and develop a sustainable journaling practice.',
      assessmentCriteria: [
        'Explain the psychological mechanisms through which journaling improves mental clarity and emotional regulation',
        'Describe at least three different journaling methods and identify which suits different purposes',
        'Design a personal journaling practice that fits realistically into daily life',
      ],
      content: [
        {
          heading: 'Why Writing Changes Your Mind',
          paragraphs: [
            'Journaling isn\'t a diary for teenagers — it\'s a cognitive tool used by CEOs, athletes, therapists, and military leaders. The act of writing forces you to translate vague feelings and scattered thoughts into structured language. This process itself creates clarity.',
            'Research by James Pennebaker at the University of Texas showed that expressive writing — writing about thoughts and feelings around stressful events — significantly reduces anxiety, improves immune function, and accelerates emotional processing. The mechanism is simple: when a thought stays in your head, it loops. When you write it down, your brain can process and release it.',
          ],
        },
        {
          heading: 'How Journaling Works in the Brain',
          paragraphs: [
            'Writing engages different neural pathways than thinking or speaking. When you write by hand, you activate the reticular activating system (RAS), which filters information and signals your brain to pay closer attention to what you\'re writing. This is why written goals are significantly more likely to be achieved than goals that are only thought about.',
            'Journaling also bridges the left brain (language, logic, analysis) and the right brain (emotion, intuition, creativity). By putting emotions into words, you engage your prefrontal cortex — the rational, planning part of your brain — which helps regulate the emotional limbic system. This is the same mechanism used in cognitive behavioural therapy.',
          ],
          imageUrl: getUniversityImage('mindl2-u4-ch6-journaling-brain'),
          imageAlt: 'Brain regions activated during journaling: prefrontal cortex, reticular activating system, and limbic system connected through writing',
        },
        {
          heading: 'Journaling Methods',
          paragraphs: [
            'There\'s no single "right" way to journal. Different methods serve different purposes:',
          ],
          bullets: [
            'Free writing / stream of consciousness — write whatever comes to mind for a set time (5-15 minutes). No structure, no editing. Best for processing emotions and clearing mental clutter.',
            'Gratitude journaling — write 3-5 things you\'re grateful for each day. Research shows this consistently improves mood, sleep quality, and overall life satisfaction. Simple but powerful.',
            'Reflective journaling — answer specific prompts about your day, decisions, or experiences. "What went well today?" "What would I do differently?" "What did I learn?" Best for continuous improvement.',
            'Goal/intention setting — write down your key intentions for the day ahead each morning. Clarifies priorities and creates accountability. Often used alongside evening reflection.',
            'Stress/anxiety processing — write specifically about things that are worrying you. Describe the worst case, the likely case, and what you would do in each scenario. Reduces the power of anxiety by making the abstract concrete.',
          ],
        },
        {
          heading: 'Making It Sustainable',
          paragraphs: [
            'The most common reason people stop journaling is making it too complicated. Here are principles for building a lasting practice:',
          ],
          bullets: [
            'Keep it short — 5 minutes is enough. You don\'t need to write essays. Three sentences is better than three pages you won\'t write.',
            'Anchor it to an existing habit — journal right after your morning coffee, or right before you read at night. Habit stacking makes it automatic.',
            'Use a physical notebook — handwriting is slower and more deliberate, which is the point. Keep it by your bed or in your bag.',
            'Don\'t judge the writing — this isn\'t for anyone else to read. Spelling, grammar, and neatness don\'t matter. Raw, honest, messy writing is the most useful kind.',
            'Start with a prompt — if you don\'t know what to write, start with: "Right now I feel..." or "The thing on my mind most is..." and let it flow from there.',
          ],
        },
        {
          heading: 'Journaling for Training & Performance',
          paragraphs: [
            'Beyond emotional health, journaling is a powerful tool for physical performance. A training journal helps you track what works, identify patterns in energy and recovery, and make better programming decisions over time.',
          ],
          bullets: [
            'Pre-session: write your intention for the session — what you want to focus on, how you want to show up',
            'Post-session: note what went well, what felt off, sleep quality the night before, stress levels that day',
            'Weekly review: look for patterns — do you perform better on certain days? After certain meals? When stress is lower?',
            'This data becomes incredibly valuable over months and years. You\'ll see patterns no app or coach could identify for you.',
          ],
        },
      ],
      unbreakableInsight: 'Most people live in reaction mode — bouncing from stimulus to stimulus without ever stopping to think clearly. Journaling is the antidote. Five minutes of honest writing gives you more self-awareness than a month of living on autopilot. The pen is a weapon against chaos.',
      coachNote: 'I journal every morning — three intentions for the day, and three reflections from yesterday. It takes under 5 minutes and it changed my decision-making, my emotional regulation, and my training more than any other single practice. Don\'t overthink it. Just start writing.',
      practicalTask: {
        title: 'Seven-Day Journaling Challenge',
        instructions: 'Commit to journaling for 7 consecutive days using this structure: Morning (2 minutes) — write your top 3 intentions for the day. Evening (3 minutes) — answer these three questions: What went well? What would I do differently? What am I grateful for? Use a physical notebook.',
        reflectionQuestions: [
          'By day 7, did the practice feel more natural than day 1?',
          'Did writing your intentions in the morning change how you approached the day?',
          'Which evening question gave you the most insight about yourself?',
        ],
      },
    },
    {
      number: 7,
      title: 'Nutrition & Hydration for Mental Performance',
      learningOutcome: 'Understand how nutrition and hydration directly affect cognitive function, mood, and mental resilience, and identify practical dietary strategies that support mental performance.',
      assessmentCriteria: [
        'Explain the relationship between blood glucose stability and cognitive function',
        'Describe how dehydration impairs focus, mood, and decision-making',
        'Identify key nutrients that support brain health and mental performance',
      ],
      content: [
        {
          heading: 'Your Brain Runs on Fuel',
          paragraphs: [
            'Your brain accounts for roughly 2% of your body weight but consumes approximately 20% of your daily energy. It is the most metabolically demanding organ in your body — and it is exquisitely sensitive to fuel quality, timing, and hydration status. Poor nutrition does not just affect your body; it directly impairs your ability to think, focus, regulate emotions, and make decisions.',
            'This is not about optimising for marginal gains. The basics — stable blood glucose, adequate hydration, sufficient protein, and essential fatty acids — provide the foundation for everything else in this course. No amount of breathwork or habit design can compensate for a brain running on caffeine, sugar, and dehydration.',
          ],
        },
        {
          heading: 'Blood Glucose & Cognitive Function',
          bullets: [
            'Your brain relies primarily on glucose for energy. Sharp drops in blood glucose (from skipping meals or consuming high-sugar foods) cause fatigue, irritability, poor concentration, and impulsive decision-making',
            'Stable blood glucose — achieved through regular meals containing protein, fibre, and complex carbohydrates — supports sustained focus and emotional stability',
            'The "afternoon slump" many people experience is often a blood glucose crash, not a natural circadian dip. Adjusting lunch composition can eliminate it',
            'Caffeine masks the symptoms of poor fuelling but does not fix the underlying problem. It borrows energy from later — with interest',
          ],
        },
        {
          heading: 'Hydration & Mental Performance',
          paragraphs: [
            'Even mild dehydration (1–2% body weight loss) measurably impairs attention, working memory, reaction time, and mood. Most people are mildly dehydrated most of the time without realising it, because thirst is a lagging indicator — by the time you feel thirsty, cognitive performance has already declined.',
          ],
          bullets: [
            'Aim for 2–3 litres of water per day as a baseline, more during training or hot weather',
            'Front-load hydration — drink 500ml within the first hour of waking to rehydrate after overnight fluid loss',
            'Pair water with electrolytes during and after exercise to replace sodium, potassium, and magnesium lost in sweat',
            'Monitor urine colour — pale straw is well-hydrated; dark yellow suggests dehydration',
          ],
        },
        {
          heading: 'Key Brain Nutrients',
          bullets: [
            'Omega-3 fatty acids (EPA/DHA) — Essential for brain cell membrane integrity, anti-inflammatory effects, and neurotransmitter function. Found in oily fish, walnuts, flaxseeds',
            'B vitamins — Critical for energy metabolism and neurotransmitter synthesis. Found in whole grains, eggs, leafy greens, meat',
            'Magnesium — Supports nervous system function and sleep quality. Found in dark chocolate, nuts, seeds, leafy greens',
            'Iron — Carries oxygen to the brain. Deficiency causes fatigue, poor concentration, and low mood. Found in red meat, lentils, spinach',
          ],
        },
      ],
      unbreakableInsight: 'You would not put the wrong fuel in a high-performance car and expect it to run well. Your brain is the highest-performance machine you own — and most people fuel it with caffeine and hope.',
      coachNote: 'Before reaching for another coffee when your focus drops, ask yourself three questions: Have I eaten in the last 3–4 hours? Have I had at least a litre of water today? Did I sleep well? Fix those first.',
      practicalTask: {
        title: 'Brain Fuel Audit',
        instructions: 'For three days, log everything you eat and drink alongside your energy, focus, and mood levels (rated 1–10) at four time points: morning, midday, mid-afternoon, and evening. Look for correlations between meals, hydration, and mental performance.',
        reflectionQuestions: [
          'Do you notice patterns between what you eat and how well you focus afterwards?',
          'How much water are you actually consuming versus how much you think you consume?',
          'What one nutritional change could make the biggest difference to your daily mental performance?',
        ],
      },
    },
    {
      number: 8,
      title: 'Weekly Review & Continuous Improvement',
      learningOutcome: 'Learn to implement a structured weekly review process that consolidates learning, tracks progress, identifies adjustments, and sustains long-term development across all areas of this course.',
      assessmentCriteria: [
        'Explain why periodic review is essential for long-term behaviour change',
        'Design a weekly review process covering physical, mental, and lifestyle domains',
        'Apply the principles of continuous improvement (kaizen) to personal development',
      ],
      content: [
        {
          heading: 'Why Weekly Reviews Matter',
          paragraphs: [
            'Daily habits are the engine of progress, but without periodic review, you risk running the engine in the wrong direction. A weekly review gives you the altitude to see patterns, catch drift, celebrate progress, and make informed adjustments. Without it, you operate on autopilot — repeating the same mistakes and missing opportunities for improvement.',
            'The concept comes from both military after-action reviews and the Japanese principle of kaizen — continuous, incremental improvement. Elite performers across every domain share this practice: they reflect regularly, honestly, and with a bias toward action.',
          ],
        },
        {
          heading: 'The Weekly Review Framework',
          bullets: [
            'Schedule it — Pick a consistent day and time (Sunday evening works well for most people). Put it in your calendar. Protect it like a training session',
            'Review your commitments — Look at what you planned to do this week versus what you actually did. No judgement — just honest data',
            'Identify wins — What went well? What are you proud of? What habits held? Acknowledging progress sustains motivation',
            'Identify lessons — What did not go as planned? What caused it? Was it within your control? Extract the learning',
            'Adjust for next week — Based on your review, what one or two adjustments will you make? Do not overhaul everything — small, targeted changes compound',
            'Set intentions — Write 3–5 specific intentions for the coming week. Make them process-based and within your control',
          ],
        },
        {
          heading: 'Continuous Improvement Principles',
          paragraphs: [
            'Kaizen is not about dramatic transformation — it is about getting 1% better consistently. Over a year, 1% daily improvement compounds to a 37× improvement. The trap most people fall into is seeking dramatic change (which fades quickly) instead of sustainable micro-improvements (which compound indefinitely).',
          ],
          bullets: [
            'Focus on systems, not goals — Goals set direction; systems produce results. Your weekly review is a system for ensuring your systems work',
            'One adjustment at a time — Resist the urge to change everything after a bad week. Identify the single highest-leverage change and focus there',
            'Measure lead indicators — Track what you can control (sessions completed, hours slept, meals prepped) not just outcomes (weight, mood, performance)',
            'Embrace plateaus — Progress is not linear. Plateaus are where consolidation happens. The review helps you stay committed during flat periods',
          ],
        },
      ],
      unbreakableInsight: 'Most people spend more time planning their meals for the week than reviewing how their life is going. Ten minutes of honest reflection every Sunday night will do more for your progress than ten hours of motivation on Monday morning.',
      coachNote: 'Your weekly review does not need to be perfect or long. Set a timer for 10 minutes, open your notebook, and answer three questions: What worked? What did I learn? What am I adjusting? That is it. Consistency beats complexity.',
      practicalTask: {
        title: 'Weekly Review Implementation',
        instructions: 'Implement the weekly review framework for four consecutive weeks. Choose a fixed day and time, create a simple template (paper or digital), and complete it every week without exception. After four weeks, evaluate whether the practice has changed your awareness, consistency, or progress.',
        reflectionQuestions: [
          'Did the weekly review help you catch problems earlier than you normally would?',
          'How did the practice of acknowledging wins affect your motivation?',
          'What patterns emerged over four weeks that you would not have noticed without structured reflection?',
        ],
      },
    },
  ],
};

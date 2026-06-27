import { getUniversityImage } from '@/lib/university/imageMap';
import type { Unit } from '../types';

export const level3Unit1: Unit = {
  number: 1,
  title: 'Advanced Nutrition',
  description: 'Macro periodisation, nutrient timing, evidence-based supplementation, body composition, metabolic adaptation, calorie cycling, gut health, and goal-specific nutrition strategies.',
  chapters: [
    {
      number: 1,
      title: 'Macro Periodisation',
      learningOutcome: 'Understand how to adjust macronutrient intake across different training phases to support performance and body composition goals.',
      assessmentCriteria: [
        'Explain the rationale for altering macros between training phases',
        'Describe how protein, carbohydrate, and fat requirements shift during bulking, cutting, and maintenance',
        'Apply macro periodisation principles to a sample training block',
      ],
      content: [
        {
          heading: 'Why Your Macros Should Change',
          paragraphs: [
            'If you eat the same macros year-round regardless of what your training looks like, you are leaving results on the table. Your body\'s fuel demands shift as your training volume, intensity, and goals change — and your nutrition should reflect that.',
            'Macro periodisation is the practice of deliberately adjusting your protein, carbohydrate, and fat intake to align with your current training phase. This is not about fad dieting or dramatic swings — it is about strategic, evidence-based adjustments that support recovery, performance, and body composition over time.',
          ],
        },
        {
          heading: 'The Three Core Phases',
          paragraphs: [
            'Most structured training follows a cyclical pattern. Understanding the nutritional demands of each phase allows you to fuel appropriately:',
          ],
          bullets: [
            'Bulking (caloric surplus) — Prioritise carbohydrates for training fuel and recovery. Protein stays high (1.6–2.2 g/kg). Fat provides remaining calories. The surplus drives muscle growth.',
            'Cutting (caloric deficit) — Protein increases to preserve lean mass (2.0–2.4 g/kg). Carbohydrates are reduced but kept high enough to fuel training. Fat is kept at minimum healthy levels (0.7–1.0 g/kg).',
            'Maintenance (energy balance) — A balanced approach. Protein at 1.6–2.0 g/kg, carbohydrates and fats distributed according to preference and activity level.',
          ],
          imageUrl: getUniversityImage('l3-u1-ch1-three-phases'),
          imageAlt: 'The three core nutrition phases — bulking, cutting, and maintenance — with macro ranges for each',
        },
        {
          heading: 'Adjusting Within a Training Block',
          paragraphs: [
            'Even within a single mesocycle, your macros can be fine-tuned. During a high-volume accumulation block, carbohydrate needs are elevated because glycogen turnover is greater. During a deload week, total intake can drop slightly because training stress is reduced.',
            'The key principle is responsiveness. You are not locked into a rigid plan — you are adjusting based on training demand, recovery quality, and how your body is responding.',
          ],
          imageUrl: getUniversityImage('l3-u1-ch1-macro-periodisation'),
          imageAlt: 'Diagram showing macro split changes across bulking, cutting, and maintenance phases with protein, carbs, and fat bars adjusting per phase',
        },
        {
          heading: 'Practical Application',
          paragraphs: [
            'Start by establishing your maintenance calories and macros. From there, apply small adjustments (200–500 kcal) when transitioning between phases. Avoid dramatic overnight changes — gradual transitions give your body time to adapt and reduce the risk of metabolic slowdown or excessive fat gain.',
            'Track your intake for the first two to three weeks of any new phase to ensure you are hitting your targets. After that, many people can transition to intuitive adjustments based on hunger, energy, and performance feedback.',
          ],
          imageUrl: getUniversityImage('l3-u1-ch1-practical-application'),
          imageAlt: 'Phase transition flowchart showing 5 steps from establishing maintenance to assessing and fine-tuning',
        },
      ],
      unbreakableInsight: 'Eating the same thing every day regardless of your training is like wearing the same shoes for running, lifting, and swimming. It technically works — but you will never perform at your best.',
      coachNote: 'When transitioning between phases, change one macro at a time and give it 7–10 days before making further adjustments. This makes it far easier to identify what is driving any changes in your body or performance.',
      practicalTask: {
        title: 'Phase Nutrition Audit',
        instructions: 'Review your current training phase. Write out your current daily macros and compare them to the recommended ranges for that phase. Identify one adjustment you could make this week.',
        reflectionQuestions: [
          'Are your current macros aligned with your training phase?',
          'Which macronutrient is most likely too high or too low for your current goals?',
          'How would your macros need to change if you switched phase next month?',
        ],
      },
    },
    {
      number: 2,
      title: 'Nutrient Timing',
      learningOutcome: 'Evaluate the role of nutrient timing around training and understand when it matters and when it does not.',
      assessmentCriteria: [
        'Describe the pre-, intra-, and post-workout nutrition windows',
        'Assess the evidence for nutrient timing effects on performance and recovery',
        'Design a peri-workout nutrition strategy for a given training scenario',
      ],
      content: [
        {
          heading: 'The Anabolic Window — Fact and Fiction',
          paragraphs: [
            'For years, the fitness industry promoted a 30-minute "anabolic window" after training where you had to consume protein or lose your gains. The reality is more nuanced. While post-exercise nutrition is important, the urgency depends entirely on context.',
            'If you trained fasted or your last meal was more than four hours ago, post-workout nutrition becomes more important. If you ate a balanced meal one to two hours before training, the window extends significantly — you have several hours, not minutes.',
          ],
        },
        {
          heading: 'Pre-Workout Nutrition',
          paragraphs: [
            'The goal before training is to ensure adequate fuel and hydration without causing discomfort. A meal containing protein and carbohydrates consumed one to three hours before training is ideal for most people.',
          ],
          bullets: [
            'Carbohydrates top up glycogen stores, which are your primary fuel source for moderate-to-high intensity work',
            'Protein before training increases amino acid availability during the session, which may support muscle protein synthesis',
            'Fat slows digestion — keep fat moderate-to-low in the meal closest to training to avoid stomach discomfort',
            'Hydration is non-negotiable — even mild dehydration impairs strength and concentration',
          ],
          imageUrl: getUniversityImage('l3-u1-ch2-pre-workout'),
          imageAlt: 'Nutrient timing around training — before, during, and after with recommended macronutrient focus',
        },
        {
          heading: 'Intra-Workout Nutrition',
          paragraphs: [
            'For most gym-based sessions lasting under 90 minutes, intra-workout nutrition is unnecessary if you ate beforehand. Water is sufficient.',
            'For endurance sessions, high-volume training days, or sessions exceeding 90 minutes, intra-workout carbohydrates (30–60 g/hour) can maintain performance. This is where sports drinks, gels, or simple carbohydrate sources have genuine value.',
          ],
          imageUrl: getUniversityImage('l3-u1-ch2-nutrient-timing'),
          imageAlt: 'Timeline diagram showing pre-workout, intra-workout, and post-workout nutrition windows with recommended macronutrient focus for each',
        },
        {
          heading: 'Post-Workout Nutrition',
          paragraphs: [
            'After training, your priorities are replenishing glycogen and providing amino acids for muscle repair. A meal or shake containing 20–40 g of protein and a serving of carbohydrates within two hours of training covers both needs.',
            'The type of protein matters less than the total amount. Whey is convenient and fast-absorbing, but whole food sources like chicken, eggs, or Greek yoghurt work equally well if consumed within a reasonable timeframe.',
          ],
          imageUrl: getUniversityImage('l3-u1-ch2-post-session'),
          imageAlt: 'Post-session recovery priorities — glycogen replenishment and muscle repair with protein sources comparison',
        },
      ],
      unbreakableInsight: 'Nutrient timing is the fine print. Total daily intake is the headline. Get the headline right first — then worry about the details.',
      coachNote: 'If a client is stressing about the exact minute they eat after training but cannot tell you their daily protein intake, they are focusing on the wrong thing. Fix the fundamentals first.',
      practicalTask: {
        title: 'Peri-Workout Nutrition Plan',
        instructions: 'Write out your current pre-, intra-, and post-workout nutrition. Then design an improved version based on the principles covered in this chapter.',
        reflectionQuestions: [
          'How long before training do you typically eat?',
          'Do you consume anything during your session? Should you, based on session length?',
          'Is your post-workout meal adequate in protein and carbohydrates?',
        ],
      },
    },
    {
      number: 3,
      title: 'Evidence-Based Supplementation',
      learningOutcome: 'Critically evaluate common supplements and distinguish between those supported by evidence and those driven by marketing.',
      assessmentCriteria: [
        'Categorise supplements into evidence-supported and unsupported tiers',
        'Explain the mechanisms and dosing of creatine, caffeine, and vitamin D',
        'Identify red flags in supplement marketing claims',
      ],
      content: [
        {
          heading: 'The Supplement Landscape',
          paragraphs: [
            'The supplement industry is worth billions — and the vast majority of products on the shelf do not do what they claim. Understanding which supplements have genuine evidence behind them and which are marketing-driven is one of the most valuable skills you can develop.',
            'A useful framework is to categorise supplements into tiers based on the strength of evidence supporting them.',
          ],
        },
        {
          heading: 'Tier 1 — Strong Evidence',
          paragraphs: [
            'These supplements have robust, replicated research supporting their use:',
          ],
          bullets: [
            'Creatine monohydrate — Increases phosphocreatine stores, improving performance in short, high-intensity efforts. Dose: 3–5 g daily. No loading phase required. One of the most studied supplements in history.',
            'Caffeine — Enhances alertness, reduces perceived effort, and improves endurance and strength performance. Dose: 3–6 mg/kg body weight, consumed 30–60 minutes before training.',
            'Vitamin D — Essential for bone health, immune function, and potentially muscle function. Supplementation is recommended if blood levels are below 75 nmol/L, particularly in northern climates with limited sun exposure.',
            'Protein powder — A convenient way to hit daily protein targets. Not superior to whole food protein, but practical for timing and convenience.',
          ],
          imageUrl: getUniversityImage('l3-u1-ch3-tier1-supplements'),
          imageAlt: 'Evidence-based supplements — creatine, caffeine, vitamin D, and protein powder with dosing guidelines',
        },
        {
          heading: 'Tier 2 — Moderate Evidence',
          paragraphs: [
            'These have some supporting evidence but are not essential:',
          ],
          bullets: [
            'Beta-alanine — May improve endurance in efforts lasting 1–4 minutes by buffering hydrogen ions. Dose: 3–6 g daily.',
            'Omega-3 fatty acids — Anti-inflammatory properties that may support recovery. Dose: 2–3 g EPA/DHA daily.',
            'Ashwagandha — Some evidence for reducing cortisol and improving recovery. Research is growing but not yet conclusive.',
          ],
          imageUrl: getUniversityImage('l3-u1-ch3-supplement-pyramid'),
          imageAlt: 'Tiered supplement pyramid showing Tier 1 (strong evidence) at the base, Tier 2 (moderate) in the middle, and Tier 3 (weak/no evidence) at the top',
        },
        {
          heading: 'Red Flags in Supplement Marketing',
          paragraphs: [
            'Learn to spot the warning signs of a product that relies on hype rather than science:',
          ],
          bullets: [
            'Proprietary blends that hide individual ingredient doses',
            'Claims of "clinically proven" without citing specific studies',
            'Before-and-after photos with no context or timeframe',
            'Products claiming to "boost testosterone" or "burn fat" without specifying mechanism or magnitude',
            'Endorsements from athletes who are almost certainly using performance-enhancing drugs alongside the product',
          ],
          imageUrl: getUniversityImage('l3-u1-ch3-red-flags'),
          imageAlt: 'Red flags in supplement marketing — proprietary blends, unverified claims, misleading photos, vague promises',
        },
      ],
      unbreakableInsight: 'If a supplement worked as well as its marketing claims, it would be regulated as a drug. The ones that actually work are boring, cheap, and well-studied.',
      coachNote: 'Before recommending any supplement, ask whether the person\'s diet, sleep, and training are already optimised. Supplements fill gaps — they do not replace foundations.',
      practicalTask: {
        title: 'Supplement Audit',
        instructions: 'List every supplement you currently take. For each one, research the evidence tier it belongs to and decide whether it is worth continuing.',
        reflectionQuestions: [
          'How many of your current supplements have Tier 1 evidence?',
          'Are you spending money on products with little or no evidence?',
          'Could any of your supplement needs be met through whole foods instead?',
        ],
      },
    },
    {
      number: 4,
      title: 'Body Composition',
      learningOutcome: 'Understand the principles of body composition and the factors that influence the ratio of lean mass to body fat.',
      assessmentCriteria: [
        'Explain the difference between weight loss and fat loss',
        'Describe methods for estimating body composition and their limitations',
        'Outline the conditions required for body recomposition',
      ],
      content: [
        {
          heading: 'Weight vs Body Composition',
          paragraphs: [
            'The number on the scale tells you how much you weigh. It does not tell you what that weight is made of. Two people at the same body weight can look completely different depending on their ratio of muscle to fat.',
            'Body composition is a far more meaningful metric than body weight alone. When people say they want to "lose weight," what they almost always mean is they want to lose fat while preserving (or gaining) muscle. These are very different goals that require different strategies.',
          ],
        },
        {
          heading: 'Measuring Body Composition',
          paragraphs: [
            'No measurement method is perfect, but some are more useful than others:',
          ],
          bullets: [
            'DEXA scan — Considered the gold standard for body composition analysis. Uses low-dose X-rays to distinguish between bone, lean tissue, and fat. Accurate but expensive and requires clinical access.',
            'Bioelectrical impedance analysis (BIA) — Found in smart scales and handheld devices. Convenient but influenced by hydration, meal timing, and skin temperature. Best used for tracking trends rather than absolute values.',
            'Skinfold callipers — Measures subcutaneous fat at specific sites. Accuracy depends heavily on the skill of the person taking the measurements. Consistent technique matters more than the individual reading.',
            'Visual assessment and progress photos — Subjective but practical. Taking photos under consistent conditions (same lighting, time of day, clothing) provides useful visual feedback over weeks and months.',
          ],
          imageUrl: getUniversityImage('l3-u1-ch4-body-composition'),
          imageAlt: 'Comparison diagram showing different body composition measurement methods — DEXA, BIA, skinfold callipers — with accuracy and accessibility ratings',
        },
        {
          heading: 'Body Recomposition',
          paragraphs: [
            'Recomposition — gaining muscle while losing fat simultaneously — is possible, but it is not equally achievable for everyone. It works best for beginners, those returning after a break, individuals with higher body fat, and people using performance-enhancing drugs.',
            'For trained individuals at moderate body fat levels, recomposition is slow and difficult. In most cases, dedicated bulking and cutting phases are more efficient for changing body composition.',
          ],
          imageUrl: getUniversityImage('l3-u1-ch4-recomposition'),
          imageAlt: 'Body recomposition — who it works for vs who should use dedicated bulk/cut cycles',
        },
        {
          heading: 'Healthy Body Fat Ranges',
          paragraphs: [
            'Body fat percentage varies by sex and age. General health ranges for adults are approximately 10–20% for men and 18–28% for women. Essential fat (the minimum for physiological function) is around 3–5% for men and 10–13% for women.',
            'Chasing extremely low body fat percentages is not healthy or sustainable for most people. The leanest physiques you see in magazines and on social media are typically achieved for short periods, often with significant trade-offs to health and wellbeing.',
          ],
          imageUrl: getUniversityImage('l3-u1-ch4-body-fat-ranges'),
          imageAlt: 'Healthy body fat percentage ranges for men and women across categories from essential to overfat',
        },
      ],
      unbreakableInsight: 'The scale measures gravity\'s pull on your body. It does not measure your health, your fitness, or your worth. Stop letting a number define your progress.',
      coachNote: 'Encourage the use of multiple metrics — photos, measurements, strength performance, and how clothes fit — rather than relying on weight alone. A fuller picture prevents unnecessary frustration.',
      practicalTask: {
        title: 'Body Composition Baseline',
        instructions: 'Choose two methods from this chapter and take baseline measurements. Record them alongside a progress photo taken under consistent conditions.',
        reflectionQuestions: [
          'Which measurement methods are most accessible to you?',
          'How has your relationship with the scale influenced your training decisions in the past?',
          'What would change if you focused on body composition rather than body weight?',
        ],
      },
    },
    {
      number: 5,
      title: 'Metabolic Adaptation',
      learningOutcome: 'Understand how the body adapts to caloric restriction and apply strategies to manage metabolic slowdown during dieting phases.',
      assessmentCriteria: [
        'Explain the concept of adaptive thermogenesis',
        'Describe the physiological mechanisms behind metabolic adaptation',
        'Outline strategies for managing metabolic adaptation including diet breaks and reverse dieting',
      ],
      content: [
        {
          heading: 'What Is Metabolic Adaptation?',
          paragraphs: [
            'When you eat in a caloric deficit, your body does not simply burn through its fat stores at a constant rate. Over time, it adapts to the reduced energy intake by becoming more efficient — burning fewer calories at rest and during activity. This is metabolic adaptation, sometimes called adaptive thermogenesis.',
            'This is not your metabolism "breaking" — it is a survival mechanism. Your body is designed to resist sustained energy deficits because, from an evolutionary perspective, prolonged food scarcity was a threat to survival.',
          ],
        },
        {
          heading: 'How It Happens',
          paragraphs: [
            'Several mechanisms contribute to metabolic adaptation:',
          ],
          bullets: [
            'Reduced resting metabolic rate (RMR) — As you lose weight, you have less tissue to maintain. But the drop in RMR often exceeds what weight loss alone would predict.',
            'Decreased non-exercise activity thermogenesis (NEAT) — You unconsciously move less. Fidgeting, walking, and general daily movement decline. This can account for hundreds of calories per day.',
            'Hormonal changes — Leptin (the satiety hormone) drops, ghrelin (the hunger hormone) rises, and thyroid output may decrease. You feel hungrier and your body burns less.',
            'Increased metabolic efficiency — Your muscles become more efficient at producing work with less energy, which sounds positive but means you burn fewer calories during exercise.',
          ],
          imageUrl: getUniversityImage('l3-u1-ch5-metabolic-adaptation'),
          imageAlt: 'Flow diagram showing the metabolic adaptation loop — caloric deficit leading to hormonal changes, reduced NEAT, lower RMR, and increased hunger',
        },
        {
          heading: 'Diet Breaks and Refeeds',
          paragraphs: [
            'A diet break is a planned period (typically 1–2 weeks) of eating at maintenance calories during a fat-loss phase. Research suggests that diet breaks can partially reverse some aspects of metabolic adaptation, particularly the drop in leptin and the reduction in NEAT.',
            'Refeeds are shorter — usually one to two days of higher carbohydrate intake within a deficit. They provide a psychological break and may temporarily boost leptin, though the metabolic impact is smaller than a full diet break.',
          ],
          imageUrl: getUniversityImage('l3-u1-ch5-diet-strategies'),
          imageAlt: 'Comparison of diet breaks, refeeds, and reverse dieting strategies with duration and purpose',
        },
        {
          heading: 'Reverse Dieting',
          paragraphs: [
            'After a prolonged cut, jumping straight back to high calories often leads to rapid fat regain. Reverse dieting involves gradually increasing calories (typically 50–100 kcal per week) to allow your metabolism to upregulate without excessive fat gain.',
            'Not everyone needs a formal reverse diet. If you were dieting at a moderate deficit for a short period, returning to maintenance over one to two weeks is usually sufficient. Reverse dieting is most valuable after aggressive or prolonged deficits.',
          ],
        },
      ],
      unbreakableInsight: 'Your body is not broken — it is doing exactly what evolution designed it to do. Understanding the adaptation does not stop it happening, but it does stop you panicking when progress slows.',
      coachNote: 'If fat loss has stalled for more than two weeks despite consistent adherence, consider a diet break before dropping calories further. Often the solution is eating more temporarily, not less.',
      practicalTask: {
        title: 'Adaptation Awareness Check',
        instructions: 'Reflect on your last dieting phase. List any signs of metabolic adaptation you experienced (increased hunger, reduced energy, lower daily step count, stalled weight loss).',
        reflectionQuestions: [
          'Did you notice your daily movement declining during a cut?',
          'Have you ever used a diet break or refeed strategically?',
          'How long was your longest continuous dieting phase, and what happened afterwards?',
        ],
      },
    },
    {
      number: 6,
      title: 'Calorie Cycling',
      learningOutcome: 'Understand and apply calorie cycling strategies to improve dietary adherence, performance, and body composition outcomes.',
      assessmentCriteria: [
        'Explain the concept of calorie cycling and its potential benefits',
        'Describe different calorie cycling protocols including high/low days and refeeds',
        'Design a weekly calorie cycling plan aligned with a training schedule',
      ],
      content: [
        {
          heading: 'What Is Calorie Cycling?',
          paragraphs: [
            'Calorie cycling means deliberately varying your daily caloric intake rather than eating the same amount every day. The weekly total remains the same, but the distribution across days changes based on your training schedule, recovery needs, or social commitments.',
            'This approach can improve dietary adherence (by allowing higher-calorie days), optimise performance (by fuelling training days more), and make sustained deficits more psychologically manageable.',
          ],
        },
        {
          heading: 'Common Protocols',
          paragraphs: [
            'There are several ways to implement calorie cycling. The best approach depends on your training split, lifestyle, and personal preference:',
          ],
          bullets: [
            'High/low days — Higher calories on training days, lower on rest days. Typically a 300–500 kcal swing between the two. Carbohydrates are usually the variable that changes.',
            'Refeed days — One or two days per week at maintenance or slight surplus during a cutting phase. These are higher in carbohydrates and can help restore glycogen and reduce diet fatigue.',
            'Weekend cycling — Lower intake during the structured work week, slightly higher on weekends to accommodate social eating. Pragmatic and sustainable for many people.',
            '5:2 approach — Five days at a moderate deficit, two days at maintenance. Simple to implement and effective for adherence.',
          ],
          imageUrl: getUniversityImage('l3-u1-ch6-calorie-cycling'),
          imageAlt: 'Weekly calendar view showing calorie cycling with training days at higher calories and rest days at lower calories, with weekly total remaining consistent',
        },
        {
          heading: 'Matching Calories to Training',
          paragraphs: [
            'The most logical application of calorie cycling is aligning intake with energy expenditure. On heavy training days, your body needs more fuel — particularly carbohydrates — to support performance and recovery. On rest days, energy demands are lower.',
            'This does not mean starving yourself on rest days. It means making sensible adjustments. A rest day might have 300 fewer calories, primarily from reduced carbohydrates, while protein and fat remain relatively stable.',
          ],
        },
        {
          heading: 'When Calorie Cycling Is Not Necessary',
          paragraphs: [
            'Calorie cycling adds complexity. If you are already struggling to track your intake consistently, adding daily variation will make things harder, not easier. Master consistent daily intake first, then consider cycling as a refinement.',
            'For people whose primary goal is simply to maintain a healthy weight and train regularly, eating roughly the same amount each day is perfectly effective and much simpler.',
          ],
        },
      ],
      unbreakableInsight: 'Calorie cycling is a strategy, not a requirement. The best nutritional approach is the one you can actually follow consistently. Complexity does not equal superiority.',
      coachNote: 'Introduce calorie cycling only after someone has demonstrated consistent tracking for at least four weeks. It is an optimisation tool, not a starting point.',
      practicalTask: {
        title: 'Design a Cycling Week',
        instructions: 'Using your current weekly calorie target, design a 7-day calorie cycling plan that aligns higher intake with your training days and lower intake with rest days.',
        reflectionQuestions: [
          'How does your current intake vary across the week?',
          'Which days would benefit most from additional carbohydrates?',
          'Does calorie cycling appeal to you, or would consistent daily intake suit you better?',
        ],
      },
    },
    {
      number: 7,
      title: 'Digestion & Gut Health',
      learningOutcome: 'Understand the role of the digestive system in nutrient absorption and the factors that influence gut health.',
      assessmentCriteria: [
        'Describe the basic process of digestion and nutrient absorption',
        'Explain the role of the gut microbiome in overall health',
        'Identify common digestive issues and dietary strategies to address them',
      ],
      content: [
        {
          heading: 'Why Gut Health Matters for Performance',
          paragraphs: [
            'You can eat the most perfectly designed diet in the world, but if your body cannot digest and absorb the nutrients effectively, it counts for very little. Your digestive system is where nutrition meets physiology — it is the bridge between what you eat and what your body actually uses.',
            'Gut health also influences immune function, mood, sleep quality, and inflammation. Research increasingly shows that the gut microbiome — the trillions of bacteria living in your digestive tract — plays a role in nearly every aspect of health.',
          ],
        },
        {
          heading: 'The Basics of Digestion',
          paragraphs: [
            'Digestion is a multi-stage process:',
          ],
          bullets: [
            'Mouth — Mechanical breakdown through chewing and chemical breakdown through salivary enzymes (amylase begins carbohydrate digestion)',
            'Stomach — Hydrochloric acid and pepsin break down proteins. The stomach also serves as a reservoir, releasing food gradually into the small intestine.',
            'Small intestine — The primary site of nutrient absorption. Enzymes from the pancreas and bile from the liver complete digestion. Nutrients are absorbed through the intestinal wall into the bloodstream.',
            'Large intestine — Absorbs water and electrolytes. Home to the majority of gut bacteria, which ferment undigested fibre and produce short-chain fatty acids.',
          ],
          imageUrl: getUniversityImage('l3-u1-ch7-digestive-system'),
          imageAlt: 'Anatomical diagram of the digestive system highlighting each stage — mouth, stomach, small intestine, large intestine — with key functions labelled',
        },
        {
          heading: 'The Gut Microbiome',
          paragraphs: [
            'Your gut contains approximately 100 trillion microorganisms. The composition of this microbial community is influenced by your diet, stress levels, sleep, antibiotic use, and environment.',
            'A diverse microbiome is generally associated with better health outcomes. Diets high in fibre, fermented foods, and a wide variety of plant foods tend to support microbial diversity. Highly processed diets, excessive alcohol, and chronic stress tend to reduce it.',
          ],
        },
        {
          heading: 'Common Digestive Issues',
          paragraphs: [
            'Many active people experience digestive discomfort, particularly during or after training. Common issues include bloating, gas, acid reflux, and irregular bowel movements.',
          ],
          bullets: [
            'Bloating — Often caused by eating too quickly, high FODMAP foods, or insufficient fibre adaptation. Increase fibre gradually (5 g per week) rather than suddenly.',
            'Exercise-related GI distress — High-intensity exercise diverts blood away from the gut. Avoid high-fibre and high-fat foods within two hours of intense training.',
            'Food intolerances — Lactose and gluten intolerances are common. If you suspect an intolerance, try a structured elimination diet for 2–4 weeks, then reintroduce systematically.',
          ],
        },
      ],
      unbreakableInsight: 'Your gut is not just processing food — it is running your immune system, influencing your mood, and deciding how much of your carefully planned diet actually gets used. Ignore it at your peril.',
      coachNote: 'If someone reports persistent digestive issues, recommend they keep a food and symptom diary for two weeks before making major dietary changes. Pattern recognition is more useful than guessing.',
      practicalTask: {
        title: 'Gut Health Assessment',
        instructions: 'For one week, keep a brief food and digestion diary noting what you eat, when, and any digestive symptoms. At the end of the week, identify any patterns.',
        reflectionQuestions: [
          'How many different plant foods did you eat this week?',
          'Did any specific foods consistently cause discomfort?',
          'How does your digestion change on training days vs rest days?',
        ],
      },
    },
    {
      number: 8,
      title: 'Nutrition for Specific Goals',
      learningOutcome: 'Apply nutritional strategies tailored to specific training goals including cutting, bulking, maintenance, and endurance fuelling.',
      assessmentCriteria: [
        'Design a nutritional approach for a fat-loss phase that preserves lean mass',
        'Outline the key differences between nutrition for hypertrophy vs endurance',
        'Explain how to transition between different nutritional phases safely and effectively',
      ],
      content: [
        {
          heading: 'Cutting — Fat Loss with Muscle Preservation',
          paragraphs: [
            'A successful cut is not about losing weight as fast as possible. It is about losing fat while preserving as much lean mass as you can. This requires a moderate deficit (typically 300–500 kcal below maintenance), high protein intake (2.0–2.4 g/kg), and continued resistance training.',
          ],
          bullets: [
            'Rate of loss: Aim for 0.5–1.0% of body weight per week. Faster rates increase muscle loss risk.',
            'Protein priority: This is not the time to skimp. High protein intake is the single most important nutritional factor for preserving muscle during a deficit.',
            'Training intensity: Maintain lifting intensity (heavy weights, compound movements). Reduce volume if recovery is suffering, but do not switch to "light weights and high reps" as your primary strategy.',
            'Diet breaks: Every 8–12 weeks of continuous dieting, consider a 1–2 week maintenance phase.',
          ],
        },
        {
          heading: 'Bulking — Gaining Muscle Efficiently',
          paragraphs: [
            'Bulking requires a caloric surplus, but more is not always better. A "lean bulk" with a surplus of 200–400 kcal above maintenance minimises fat gain while still providing enough energy for muscle growth.',
          ],
          bullets: [
            'Surplus size: Beginners can use a slightly larger surplus (300–500 kcal) because they have greater potential for muscle gain. Advanced trainees should use smaller surpluses.',
            'Carbohydrate focus: Carbs fuel training and support recovery. A bulk is the time to prioritise carbohydrate intake.',
            'Monitoring: Track body weight weekly and assess rate of gain. If weight is increasing faster than 0.5–1.0% per month (for intermediates/advanced), the surplus is likely too large.',
          ],
          imageUrl: getUniversityImage('l3-u1-ch8-phase-targets'),
          imageAlt: 'Side-by-side comparison table showing recommended calorie surplus/deficit, protein, carbs, and fat targets for cutting vs bulking vs maintenance phases',
        },
        {
          heading: 'Endurance Fuelling',
          paragraphs: [
            'Endurance athletes and those incorporating significant cardiovascular training have different nutritional demands. Carbohydrate needs are substantially higher — often 5–10 g/kg body weight depending on training volume.',
            'Periodising carbohydrate intake around training sessions (higher on long/intense days, moderate on easy days) is more effective than eating the same amount daily. Fat adaptation strategies ("train low") have some research support but are not recommended as a primary fuelling strategy for high-performance endurance work.',
          ],
        },
        {
          heading: 'Transitioning Between Phases',
          paragraphs: [
            'Abrupt transitions between nutritional phases often lead to poor outcomes — rapid fat gain when coming out of a cut, or muscle loss when dropping into an aggressive deficit. Plan transitions over 1–2 weeks, gradually adjusting calories by 100–200 kcal every few days.',
            'The transition period is also a good time to reassess your overall approach. Review what worked, what did not, and what you would change for the next phase.',
          ],
        },
      ],
      unbreakableInsight: 'There is no single "best diet." There is only the best diet for your current goal, your current phase, and your current life. The ability to adjust is the skill — not the ability to find the perfect plan.',
      coachNote: 'Help people see nutrition as phases within a longer journey, not as permanent restrictions. The person who can confidently move between cutting, maintaining, and building has a far healthier relationship with food than someone who is perpetually dieting.',
      practicalTask: {
        title: 'Goal-Specific Nutrition Plan',
        instructions: 'Choose your current primary goal (cutting, bulking, maintenance, or endurance). Using the guidelines from this chapter, write a 7-day nutritional outline including daily calorie and macro targets.',
        reflectionQuestions: [
          'Is your current nutrition aligned with your primary training goal?',
          'How would your approach need to change if your goal shifted?',
          'What is the biggest nutritional mistake you have made in past phases, and how would you avoid it now?',
        ],
      },
    },
  ],
};

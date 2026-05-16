import type { Unit } from '../types';

export const nutritionL4Unit1: Unit = {
  number: 1,
  title: 'Advanced Metabolic Science',
  description: 'Deep-dive into metabolic pathways, hormonal regulation of body composition, and the science of metabolic adaptation — equipping you to troubleshoot plateaus and optimise results.',
  chapters: [
    {
      number: 1,
      title: 'Metabolic Pathways in Detail',
      learningOutcome: 'Understand the three primary metabolic pathways and how they interact during different types of exercise and daily activity.',
      assessmentCriteria: [
        'Describe glycolysis, the Krebs cycle, and oxidative phosphorylation',
        'Explain how substrate utilisation shifts with exercise intensity',
        'Discuss the concept of metabolic flexibility',
      ],
      content: [
        {
          heading: 'The Three Energy Systems Revisited',
          paragraphs: [
            'At Level 2, you learned that the body uses three energy systems. At Level 4, we examine the biochemistry behind them. Understanding the actual metabolic pathways — not just their names — allows you to manipulate training and nutrition strategies with precision.',
            'All three systems operate simultaneously at all times. The dominant system depends on exercise intensity, duration, and the availability of substrates (carbohydrates, fats, and to a lesser extent, amino acids). There is no "switch" between systems — there is a continuous shift in the relative contribution of each.',
          ],
        },
        {
          heading: 'Glycolysis and Lactate',
          paragraphs: [
            'Glycolysis breaks glucose into pyruvate, producing 2 ATP per glucose molecule. When oxygen is sufficient, pyruvate enters the mitochondria for further oxidation (the Krebs cycle). When exercise intensity exceeds the oxidative system\'s capacity, pyruvate is converted to lactate.',
            'Lactate is not a waste product — this is one of the most persistent myths in exercise science. Lactate is a fuel source that can be oxidised by the heart, brain, and less-active muscles. It is also a signalling molecule that triggers beneficial adaptations. The "burn" you feel during intense exercise is primarily caused by hydrogen ion accumulation (acidosis), not lactate itself.',
          ],
        },
        {
          heading: 'Metabolic Flexibility',
          paragraphs: [
            'Metabolic flexibility is the ability to efficiently switch between fat and carbohydrate oxidation based on availability and demand. A metabolically flexible individual burns predominantly fat at rest and during low-intensity activity, then smoothly transitions to carbohydrate oxidation during high-intensity work.',
            'Poor metabolic flexibility — often seen in sedentary, insulin-resistant individuals — means the body struggles to efficiently oxidise fat, relying disproportionately on carbohydrates even at rest. This contributes to fatigue, difficulty with body composition management, and poor exercise performance. Metabolic flexibility improves with regular exercise, adequate sleep, and periods of moderate carbohydrate restriction.',
          ],
        },
      ],
      unbreakableInsight: 'Your metabolism is not "fast" or "slow" — it is flexible or inflexible. A healthy metabolism adapts its fuel source to the demands you place on it. Train this flexibility through varied exercise intensities and intelligent nutrition.',
      coachNote: 'When a client says they have a "slow metabolism," what they usually mean is poor metabolic flexibility combined with low NEAT. Address both through progressive exercise and practical nutrition strategies, not by reinforcing the "slow metabolism" narrative.',
      practicalTask: {
        title: 'Substrate Utilisation Mapping',
        instructions: 'During your next training session, note your perceived exertion at different points: warm-up, moderate work, and high-intensity efforts. Estimate which energy system is dominant at each intensity based on how you feel (can you talk easily? Is the effort sustainable for minutes or seconds?).',
        reflectionQuestions: [
          'At what intensity did you feel the shift from predominantly aerobic to glycolytic effort?',
          'How does your nutrition before training affect your perceived energy during different intensities?',
          'What would improving your metabolic flexibility mean for your daily energy and performance?',
        ],
      },
    },
    {
      number: 2,
      title: 'Hormonal Regulation of Body Composition',
      learningOutcome: 'Understand how key hormones influence fat storage, muscle growth, appetite, and metabolic rate — and what you can and cannot control.',
      assessmentCriteria: [
        'Describe the roles of insulin, cortisol, leptin, ghrelin, and thyroid hormones in body composition',
        'Explain how lifestyle factors influence hormonal balance',
        'Identify common misconceptions about hormones and fat loss',
      ],
      content: [
        {
          heading: 'Insulin — Beyond Blood Sugar',
          paragraphs: [
            'Insulin is released by the pancreas in response to rising blood glucose. Its primary role is to facilitate glucose uptake into cells for energy or storage. Insulin also promotes amino acid uptake into muscle (supporting muscle protein synthesis) and inhibits lipolysis (fat breakdown).',
            'The popular claim that "insulin makes you fat" is a dramatic oversimplification. Insulin is an essential anabolic hormone. Chronically elevated insulin (due to constant overconsumption, particularly of refined carbohydrates in sedentary individuals) does promote fat storage — but the root cause is energy surplus, not insulin itself. Healthy, active individuals with good insulin sensitivity manage insulin fluctuations efficiently.',
          ],
        },
        {
          heading: 'Cortisol, Leptin & Ghrelin',
          bullets: [
            'Cortisol — Released during stress and fasting. Acutely, it mobilises energy (beneficial during exercise). Chronically elevated, it promotes visceral fat storage, muscle breakdown, and immune suppression. Managed through sleep, stress management, and adequate nutrition',
            'Leptin — Produced by fat cells. Signals satiety to the brain. During prolonged dieting, leptin drops significantly, increasing hunger and reducing metabolic rate — this is the primary hormonal driver of "diet fatigue" and weight regain',
            'Ghrelin — Produced by the stomach. Signals hunger. Increases during caloric restriction and decreases after meals. Protein and fibre are the most effective macronutrients for suppressing ghrelin',
            'Thyroid hormones (T3, T4) — Regulate metabolic rate. Prolonged caloric restriction can reduce thyroid output by 15–25%, lowering metabolic rate. This is reversible with adequate nutrition and is not evidence of permanent metabolic damage',
          ],
        },
        {
          heading: 'What You Can Actually Control',
          paragraphs: [
            'You cannot directly control your hormones through food combinations, meal timing, or supplements — despite what social media suggests. What you can control are the lifestyle factors that influence hormonal balance: sleep quality and duration, stress management, consistent exercise, adequate protein intake, and avoiding prolonged extreme caloric restriction. These fundamentals have far more impact on hormonal health than any "hormone-balancing" supplement or diet.',
          ],
        },
      ],
      unbreakableInsight: 'Hormones are not switches you can flip with the right food or supplement. They are the downstream result of how you live — how you sleep, move, eat, and manage stress. Fix the lifestyle, and the hormones follow.',
      coachNote: 'When a client blames hormones for their body composition, gently redirect: "Hormones are influenced by your daily habits. Let us optimise the things we can control — sleep, stress, nutrition, exercise — and see how your body responds."',
      practicalTask: {
        title: 'Hormonal Health Audit',
        instructions: 'Assess the four primary lifestyle factors that influence hormonal balance: sleep (hours and quality), stress (subjective rating 1–10), exercise (frequency and intensity), and nutrition (calorie adequacy, protein intake). Identify the weakest area and design a two-week improvement plan.',
        reflectionQuestions: [
          'Which lifestyle factor do you think is most negatively affecting your hormonal balance?',
          'Have you ever blamed hormones for a result that was more likely caused by lifestyle factors?',
          'How would optimising your weakest lifestyle factor affect your energy, mood, and body composition?',
        ],
      },
    },
    {
      number: 3,
      title: 'Metabolic Adaptation & Plateaus',
      learningOutcome: 'Understand why fat loss plateaus occur, the science of metabolic adaptation, and evidence-based strategies for overcoming them.',
      assessmentCriteria: [
        'Explain adaptive thermogenesis and its components',
        'Describe the physiological changes that occur during prolonged caloric restriction',
        'Design strategies for managing and overcoming fat loss plateaus',
      ],
      content: [
        {
          heading: 'Why Plateaus Happen',
          paragraphs: [
            'Fat loss plateaus are not a sign of failure — they are a predictable physiological response to sustained caloric restriction. As you lose weight, your body adapts in multiple ways that collectively reduce energy expenditure and increase hunger. Understanding these adaptations allows you to anticipate and manage them.',
            'The total metabolic adaptation during a diet can reduce energy expenditure by 15–25% beyond what is explained by the loss of body mass alone. This means a person who has dieted down to 80kg burns fewer calories than a person who has always been 80kg. This is adaptive thermogenesis — your body defending against further weight loss.',
          ],
        },
        {
          heading: 'Components of Adaptation',
          bullets: [
            'Reduced BMR — Basal metabolic rate decreases as you lose metabolically active tissue (both muscle and fat) and as thyroid and leptin levels decline',
            'Reduced NEAT — Non-exercise activity thermogenesis drops significantly during dieting. You unconsciously move less — fewer steps, less fidgeting, less spontaneous movement. This can account for 200–400 fewer calories burned daily',
            'Reduced TEF — You are eating less food, so the thermic effect of digesting food decreases proportionally',
            'Improved exercise efficiency — Your body becomes more mechanically efficient at the same exercise, burning fewer calories for the same workload',
            'Increased hunger — Leptin drops, ghrelin rises, reward sensitivity to food increases. You are physiologically driven to eat more',
          ],
        },
        {
          heading: 'Overcoming Plateaus',
          bullets: [
            'Diet breaks — 1–2 weeks at maintenance calories. Research (MATADOR study) suggests intermittent dieting may produce superior fat loss and better metabolic outcomes than continuous restriction',
            'Refeed days — 1–2 days per week at maintenance or slight surplus, emphasising carbohydrates. Temporarily boosts leptin and thyroid output, reduces diet fatigue',
            'Increase NEAT consciously — Set a daily step target (8,000–12,000 steps). Walk more. Stand more. This directly counteracts the unconscious reduction in movement',
            'Reassess calorie targets — After significant weight loss, recalculate your TDEE at your new body weight. Your original deficit may no longer be a deficit',
            'Prioritise protein — Maintain high protein intake (2.0–2.4 g/kg during dieting) to preserve muscle mass, support satiety, and maintain TEF',
          ],
        },
      ],
      unbreakableInsight: 'A plateau does not mean your body is "broken" — it means your body is working exactly as evolution designed it. Metabolic adaptation is a survival mechanism. Your job is to work with it intelligently, not fight it with more restriction.',
      coachNote: 'When a client hits a plateau, the first response should never be "eat less and exercise more." Instead, audit NEAT, sleep, stress, and adherence. The solution is almost always a strategic adjustment, not additional deprivation.',
      practicalTask: {
        title: 'Plateau Management Strategy',
        instructions: 'Imagine you (or a client) have been in a caloric deficit for 12 weeks and fat loss has stalled for the past 2 weeks despite consistent adherence. Design a 4-week strategy to break the plateau using at least two of the methods discussed.',
        reflectionQuestions: [
          'Which plateau-breaking strategy would you try first, and why?',
          'How would you determine whether the plateau is due to metabolic adaptation or adherence drift?',
          'What psychological impact does a plateau have, and how would you manage it?',
        ],
      },
    },
    {
      number: 4,
      title: 'Reverse Dieting & Recovery',
      learningOutcome: 'Understand how to transition from a caloric deficit back to maintenance or surplus without excessive fat regain.',
      assessmentCriteria: [
        'Explain the concept and purpose of reverse dieting',
        'Describe the physiological and psychological benefits of a structured diet exit strategy',
        'Design a reverse diet protocol for a specific scenario',
      ],
      content: [
        {
          heading: 'The Problem with Stopping a Diet Abruptly',
          paragraphs: [
            'After weeks or months of caloric restriction, your body is in an adapted state: lower metabolic rate, reduced leptin, elevated ghrelin, heightened food reward sensitivity, and depleted glycogen stores. If you suddenly return to your pre-diet calorie intake, the combination of a suppressed metabolic rate and restored appetite creates ideal conditions for rapid fat regain — often overshooting your original body weight.',
            'This "post-diet rebound" is not a lack of discipline. It is a predictable physiological response. Your body is primed to restore energy reserves, and your hunger signals are amplified. A structured exit strategy — reverse dieting — mitigates this rebound.',
          ],
        },
        {
          heading: 'Reverse Dieting Protocol',
          paragraphs: [
            'Reverse dieting involves gradually increasing caloric intake from your deficit level back to maintenance over 4–12 weeks. The gradual increase allows your metabolic rate to recover, leptin to normalise, and your body to adapt to the higher intake without excessive fat storage.',
          ],
          bullets: [
            'Week 1–2 — Increase calories by 100–150 per day (primarily from carbohydrates and fats). Monitor weight and measurements',
            'Week 3–4 — Add another 100–150 calories if weight remains stable or increases minimally (1–2% of body weight)',
            'Week 5–8 — Continue increasing by 50–100 calories per week until you reach estimated maintenance',
            'Beyond week 8 — Spend 4–8 weeks at maintenance before considering another deficit phase. This recovery period is essential for hormonal normalisation',
            'Expected weight increase — 1–3kg from glycogen and water restoration is normal and not fat regain. Do not panic and restrict again',
          ],
        },
        {
          heading: 'Psychological Recovery',
          paragraphs: [
            'The psychological transition out of a diet is as important as the physiological one. After months of restriction, many people develop anxiety around increasing food intake, fear of regaining weight, or guilt about eating "more." These responses are normal but must be managed consciously.',
            'Reframe the reverse diet as an active phase of your plan — not the absence of dieting. You are building metabolic capacity, restoring hormonal health, and creating a foundation for your next phase of progress. This is strategic recovery, not giving up.',
          ],
        },
      ],
      unbreakableInsight: 'How you end a diet matters as much as how you execute it. A diet without an exit strategy is a setup for rebound. Plan the way out before you go in.',
      coachNote: 'Before starting any client on a fat loss phase, discuss the exit strategy. "Here is how we will diet, and here is exactly how we will come out of it." This prevents the panic-driven restriction cycles that destroy metabolic health and psychological wellbeing.',
      practicalTask: {
        title: 'Reverse Diet Design',
        instructions: 'Design a reverse diet protocol for someone finishing a 16-week fat loss phase. Their current intake is 1,800 kcal and estimated maintenance is 2,400 kcal. Plan the weekly calorie increases, macronutrient distribution, and metrics you would monitor.',
        reflectionQuestions: [
          'How long would your reverse diet take to reach maintenance?',
          'What weight increase would you consider normal versus concerning during the reverse?',
          'How would you support the psychological challenges of increasing food intake?',
        ],
      },
    },
    {
      number: 5,
      title: 'Advanced Body Composition Strategies',
      learningOutcome: 'Apply advanced strategies for simultaneous fat loss and muscle gain, body recomposition, and optimising body composition for different goals.',
      assessmentCriteria: [
        'Explain the conditions under which body recomposition is possible',
        'Describe calorie and protein cycling strategies for advanced body composition goals',
        'Discuss the role of training variables in body composition outcomes',
      ],
      content: [
        {
          heading: 'Body Recomposition — Is It Real?',
          paragraphs: [
            'Body recomposition — simultaneously losing fat and gaining muscle — is often dismissed as impossible, but research demonstrates it can occur under specific conditions: in beginners (the "newbie gains" window), in detrained individuals returning to training, in overweight individuals starting a structured programme, and in individuals using performance-enhancing drugs.',
            'For trained, lean individuals, simultaneous recomposition is possible but extremely slow. In most cases, dedicated phases of surplus (for muscle gain) and deficit (for fat loss) produce faster and more measurable results than attempting both simultaneously. The exception is when body composition is already close to target and the goal is fine-tuning rather than dramatic change.',
          ],
        },
        {
          heading: 'Calorie and Carb Cycling',
          paragraphs: [
            'Calorie cycling involves varying your daily caloric intake based on training demands — higher calories on training days, lower on rest days. This strategy may improve nutrient partitioning (directing more calories toward muscle recovery on training days) while maintaining a weekly energy deficit.',
          ],
          bullets: [
            'Training day — Maintenance or slight surplus. Higher carbohydrates to fuel performance and support recovery. Higher protein remains constant',
            'Rest day — Moderate deficit. Lower carbohydrates (reduced need for glycogen), slightly higher fats for satiety. Protein remains constant',
            'Weekly average — The total weekly calorie intake determines body composition change, not individual daily intake. Ensure the weekly average aligns with your goal (deficit, maintenance, or surplus)',
          ],
        },
        {
          heading: 'Training for Body Composition',
          paragraphs: [
            'Training variables directly influence body composition outcomes independent of nutrition. Higher training volumes produce greater hypertrophy stimulus. Compound movements create the largest metabolic demand. Progressive overload ensures continued adaptation.',
            'During fat loss phases, maintain training intensity (load) but reduce volume if recovery is compromised. The goal is to provide sufficient stimulus to preserve (or build) muscle while in a deficit. Dropping to light weights and high reps during a cut is the fastest way to lose muscle — the opposite of what you want.',
          ],
        },
      ],
      unbreakableInsight: 'Body composition is the result of what you eat AND how you train — not one or the other. The person who nails nutrition but trains poorly will look different from the person who does both well. Train like you want to build muscle, eat like you want to lose fat.',
      coachNote: 'Calorie cycling adds complexity. Only introduce it when a client has mastered consistent daily nutrition. Adding complexity too early creates confusion and reduces adherence — which matters more than the marginal benefit of cycling.',
      practicalTask: {
        title: 'Calorie Cycling Plan',
        instructions: 'Design a one-week calorie cycling plan for someone training 4 days per week with a fat loss goal. Show daily calorie targets for training and rest days, macronutrient breakdown, and verify the weekly average creates an appropriate deficit.',
        reflectionQuestions: [
          'Does the weekly calorie average align with your fat loss target?',
          'How would training day nutrition differ from rest day nutrition?',
          'Is the added complexity of cycling worth the potential benefit for this individual?',
        ],
      },
    },
    {
      number: 6,
      title: 'Gut Health & the Microbiome',
      learningOutcome: 'Understand the role of the gut microbiome in digestion, immune function, mental health, and body composition — and how nutrition influences it.',
      assessmentCriteria: [
        'Describe the composition and function of the gut microbiome',
        'Explain how diet influences microbiome diversity and health',
        'Discuss the gut-brain axis and its implications for mental wellbeing',
      ],
      content: [
        {
          heading: 'Your Second Brain',
          paragraphs: [
            'The human gut contains approximately 100 trillion microorganisms — bacteria, fungi, viruses, and other microbes collectively called the microbiome. These organisms are not passengers; they are active participants in your health. They digest fibre, produce vitamins (B12, K), manufacture neurotransmitters (95% of serotonin is produced in the gut), regulate immune function, and influence body composition.',
            'The diversity of your microbiome — the number of different species present — is one of the most reliable markers of gut health. Greater diversity is associated with better immune function, lower inflammation, improved mental health, and healthier body composition. Modern processed diets, antibiotic overuse, and sterile living environments have dramatically reduced microbiome diversity in Western populations.',
          ],
        },
        {
          heading: 'Feeding Your Microbiome',
          bullets: [
            'Fibre diversity — Different fibre types feed different bacterial species. Eat a wide variety of plant foods: vegetables, fruits, legumes, whole grains, nuts, seeds. Aim for 30+ different plant foods per week',
            'Fermented foods — Yoghurt, kefir, sauerkraut, kimchi, kombucha, and miso contain live bacteria that contribute to microbiome diversity. Include daily if tolerated',
            'Polyphenols — Found in berries, dark chocolate, green tea, coffee, and olive oil. These compounds are metabolised by gut bacteria and promote the growth of beneficial species',
            'Prebiotic foods — Garlic, onions, leeks, asparagus, bananas, and oats contain prebiotic fibres that selectively feed beneficial bacteria',
            'Limit ultra-processed foods — Emulsifiers, artificial sweeteners, and other additives found in ultra-processed foods can disrupt the microbiome and increase intestinal permeability',
          ],
        },
        {
          heading: 'The Gut-Brain Axis',
          paragraphs: [
            'The gut and brain communicate bidirectionally through the vagus nerve, hormones, and immune signalling. This gut-brain axis means that gut health directly influences mood, cognition, stress response, and mental health. Conversely, psychological stress directly impacts gut function — explaining why anxiety often presents with digestive symptoms.',
            'Emerging research links microbiome composition to depression, anxiety, and cognitive performance. While the science is still developing and "psychobiotic" supplements are premature, the practical implication is clear: eating for gut health is eating for mental health. A diverse, fibre-rich diet supports both.',
          ],
        },
      ],
      unbreakableInsight: 'Your gut is not just a digestive organ — it is an ecosystem. Feed it diverse, whole foods and it supports your immunity, mood, and body composition. Neglect it with processed food and it fights back.',
      coachNote: 'The simplest gut health intervention is dietary diversity. Before recommending probiotics or supplements, ask: "How many different plant foods do you eat per week?" Most people are shocked at how low their number is. Start there.',
      practicalTask: {
        title: 'Plant Food Diversity Challenge',
        instructions: 'For one week, log every different plant food you consume (vegetables, fruits, grains, legumes, nuts, seeds, herbs, spices). Count unique species. Then design a meal plan for the following week that increases your diversity to 30+ unique plant foods.',
        reflectionQuestions: [
          'How many different plant foods did you consume this week?',
          'Were there entire categories of plant foods (legumes, fermented foods, whole grains) you were missing?',
          'How could you increase diversity without dramatically changing your meals?',
        ],
      },
    },
    {
      number: 7,
      title: 'Nutrition Periodisation',
      learningOutcome: 'Align nutritional strategies with training phases, competition schedules, and seasonal demands for optimal performance and body composition.',
      assessmentCriteria: [
        'Explain how nutritional needs change across different training phases',
        'Design a periodised nutrition plan that supports a competitive athlete\'s annual training cycle',
        'Discuss the role of strategic surplus and deficit phases in long-term body composition management',
      ],
      content: [
        {
          heading: 'Matching Nutrition to Training Phase',
          paragraphs: [
            'Just as training is periodised across the year, nutrition should be periodised to support the demands of each phase. Eating the same way during a high-volume off-season block as during a low-volume competition taper is a missed opportunity for optimisation.',
            'The core principle is simple: eat to support what you are doing. When training volume is high, caloric and carbohydrate needs increase. When volume is low, needs decrease. When the goal is muscle gain, a surplus is required. When the goal is making weight or reducing body fat, a deficit is needed. Nutrition periodisation formalises this intuition into a structured plan.',
          ],
        },
        {
          heading: 'Phase-Specific Nutrition',
          bullets: [
            'Off-season / Accumulation — Moderate surplus (200–400 kcal above maintenance). High protein (1.8–2.2 g/kg). Higher carbohydrates to fuel training volume. Priority: support recovery, drive muscle growth, build work capacity',
            'Pre-competition / Transmutation — Maintenance or slight deficit. Maintained protein. Carbohydrates matched to training intensity. Priority: refine body composition while maintaining performance',
            'Competition / Realisation — Maintenance calories. High carbohydrates to maximise glycogen stores. Priority: fuel performance, support recovery between events',
            'Recovery / Transition — Return to maintenance. Intuitive eating with maintained protein. Reduced structure. Priority: psychological and physiological recovery from the competitive season',
          ],
        },
        {
          heading: 'Long-Term Body Composition Phases',
          paragraphs: [
            'For non-competitive individuals focused on body composition, a phased approach produces better long-term results than perpetual dieting or perpetual bulking. A typical annual plan might include: 12–16 weeks of structured surplus (muscle building), 4–6 weeks at maintenance (metabolic recovery), 12–16 weeks of structured deficit (fat loss), and 4–6 weeks at maintenance (reverse diet and stabilisation).',
            'This structured cycling prevents the metabolic adaptation, hormonal disruption, and psychological fatigue that come from extended periods in any single phase. It also produces a net positive body composition change each year — slightly more muscle, slightly less fat — that compounds over years into dramatic transformation.',
          ],
        },
      ],
      unbreakableInsight: 'Nutrition is not a static plan — it is a dynamic strategy that adapts to your training, your goals, and the phase of your year. The person who eats the same way year-round is leaving results on the table.',
      coachNote: 'Help clients understand that phases of intentional surplus are not "getting fat" and phases of deficit are not "starving." Both are strategic tools in service of long-term body composition goals. Frame every phase as purposeful.',
      practicalTask: {
        title: 'Annual Nutrition Plan',
        instructions: 'Design a 12-month periodised nutrition plan that includes at least one surplus phase, one deficit phase, and two maintenance phases. For each phase, define duration, calorie targets, macronutrient emphasis, and how it aligns with your training.',
        reflectionQuestions: [
          'How does your nutrition plan align with your training periodisation?',
          'What is the longest you would recommend staying in a deficit phase?',
          'How would you manage the psychological transition between phases?',
        ],
      },
    },
    {
      number: 8,
      title: 'Research Literacy & Critical Thinking',
      learningOutcome: 'Develop the ability to read, interpret, and apply nutrition research — becoming a critical consumer of scientific evidence.',
      assessmentCriteria: [
        'Interpret the key sections of a nutrition research paper',
        'Identify common methodological limitations in nutrition studies',
        'Apply research findings to practical nutrition decisions',
      ],
      content: [
        {
          heading: 'Reading a Research Paper',
          paragraphs: [
            'Nutrition research is published in peer-reviewed journals and follows a standard structure: Abstract (summary), Introduction (background and hypothesis), Methods (how the study was conducted), Results (what was found), and Discussion (what it means). You do not need a PhD to read research — but you need to know where to focus your attention.',
            'Start with the abstract for an overview. Then read the methods section carefully — this tells you whether the study was well-designed. Check the results for effect sizes (not just p-values). Finally, read the discussion for context, limitations, and practical implications. The methods section is the most important — a study with perfect results but poor methods produces meaningless conclusions.',
          ],
        },
        {
          heading: 'Common Pitfalls in Nutrition Research',
          bullets: [
            'Self-reported dietary intake — Most nutrition studies rely on food frequency questionnaires or dietary recalls, which are notoriously inaccurate. People underreport intake by 20–50%',
            'Confounding variables — Observational studies cannot prove causation. People who eat more vegetables may also exercise more, sleep better, and smoke less. The vegetable consumption and the health outcome may both be caused by a third variable',
            'Short study duration — Many intervention studies last 4–12 weeks. Nutrition adaptations often take months or years to manifest',
            'Industry funding — Studies funded by food or supplement companies are more likely to produce favourable results for the funder\'s product. Always check funding declarations',
            'Surrogate endpoints — Studies measuring blood markers or lab values may not translate to real-world health outcomes. A supplement that improves a blood marker does not necessarily improve health or performance',
          ],
        },
        {
          heading: 'From Paper to Practice',
          paragraphs: [
            'A single study should rarely change your practice. Look for consistent findings across multiple well-designed studies, ideally summarised in systematic reviews or meta-analyses. When the evidence is strong and consistent, apply it. When it is preliminary or conflicting, note it and wait for more data.',
            'The practical value of research literacy is not memorising study results — it is developing the ability to evaluate new claims critically. When someone tells you that a new supplement "is proven to work" or that a food "causes cancer," you should be able to find and evaluate the actual evidence behind the claim. This skill protects you and your clients from misinformation.',
          ],
        },
      ],
      unbreakableInsight: 'The ability to read research is the ultimate defence against misinformation. It transforms you from a passive consumer of fitness advice into an active, critical thinker who can separate evidence from marketing.',
      coachNote: 'Pick one research paper per month in an area relevant to your practice. Read it fully — not just the abstract. Over a year, you will develop a working knowledge of the evidence base that sets you apart from the vast majority of fitness professionals.',
      practicalTask: {
        title: 'Research Paper Review',
        instructions: 'Find one peer-reviewed nutrition research paper on a topic relevant to your practice. Read it in full. Summarise: what was the hypothesis, how was the study designed, what were the results, and what are the practical implications for your nutrition practice?',
        reflectionQuestions: [
          'Were there any methodological limitations that reduce your confidence in the findings?',
          'Who funded the study, and could this introduce bias?',
          'Would you change your practice based on this single study? Why or why not?',
        ],
      },
    },
  ],
};

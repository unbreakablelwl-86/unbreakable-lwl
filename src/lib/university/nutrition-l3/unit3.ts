import { getUniversityImage } from '@/lib/university/imageMap';
import type { Unit } from '../types';

export const nutritionL3Unit3: Unit = {
  number: 3,
  title: 'Sports Nutrition & Performance Fuelling',
  description: 'Apply advanced nutritional strategies to optimise training performance, recovery, and body composition — covering everything from fuelling endurance to cutting weight safely.',
  chapters: [
    {
      number: 1,
      title: 'Fuelling Resistance Training',
      learningOutcome: 'Understand the specific nutritional demands of resistance training and how to optimise your diet for strength, hypertrophy, and recovery.',
      assessmentCriteria: [
        'Describe the macronutrient requirements for resistance-trained individuals',
        'Explain the role of carbohydrates in supporting high-volume resistance training',
        'Discuss practical meal timing strategies around resistance training sessions',
      ],
      content: [
        {
          heading: 'Macronutrient Targets for Resistance Training',
          paragraphs: [
            'Resistance training places unique nutritional demands on your body. Unlike endurance exercise, which primarily taxes the aerobic energy system, resistance training relies heavily on the phosphocreatine and glycolytic systems — meaning carbohydrates and stored creatine phosphate are the primary fuels during your working sets.',
            'General macronutrient guidelines for resistance-trained individuals aim to provide enough protein for muscle repair and growth, enough carbohydrate to fuel training performance, and enough fat to support hormonal health — all within an appropriate caloric framework for your goal.',
          ],
          imageUrl: getUniversityImage('nutl3-u3-ch1-resistance-fuelling'),
          imageAlt: 'Resistance training macronutrient recommendations',
          bullets: [
            'Protein — 1.6 to 2.2 grams per kilogram body weight daily. Higher end during caloric deficit to preserve muscle',
            'Carbohydrate — 3 to 7 grams per kilogram depending on training volume and intensity',
            'Fat — 0.7 to 1.5 grams per kilogram. Do not drop below 0.7g/kg to protect hormonal function',
            'These are ranges, not fixed targets — individual variation, preferences, and response matter',
          ],
        },
        {
          heading: 'Carbohydrates and Training Performance',
          paragraphs: [
            'Muscle glycogen is the primary fuel source during resistance training. A typical high-volume training session (20–25 working sets) depletes approximately 25–40% of muscle glycogen stores. If you begin a session with suboptimal glycogen levels, your performance — particularly in the second half of the session — will suffer.',
            'This is why very low-carbohydrate diets often lead to reduced training performance, even if body weight decreases. The weight loss may be partly muscle and partly water (glycogen binds water at a ratio of approximately 3g water per 1g glycogen).',
          ],
          imageUrl: getUniversityImage('nutl3-u3-ch1-carb-performance'),
          imageAlt: 'Glycogen depletion: 25-40% per resistance training session',
        },
        {
          heading: 'Practical Meal Timing',
          paragraphs: [
            'A pre-training meal 2–3 hours before training should contain approximately 25–40g protein and 40–80g carbohydrates from easily digestible sources. If you cannot eat a full meal, a smaller snack (banana, rice cakes with honey, or a protein bar) 30–60 minutes before training provides a workable alternative.',
            'Post-training, aim for a protein-rich meal within 1–2 hours. If your next training session is more than 24 hours away, urgent refuelling is unnecessary — your normal meal pattern will replenish glycogen stores. If you train daily or twice daily, post-training carbohydrate intake becomes more critical.',
          ],
          imageUrl: getUniversityImage('nutl3-u3-ch1-meal-timing'),
          imageAlt: 'Pre and post training meal timing around sessions',
        },
      ],
      unbreakableInsight: 'You cannot out-eat a bad programme, and you cannot out-train a bad diet. Nutrition and training are partners — neglecting either limits the other.',
      coachNote: 'Track your training performance (reps, weight, perceived effort) alongside your nutrition for two weeks. Patterns emerge quickly — you will see which eating strategies correlate with your best sessions.',
      practicalTask: {
        title: 'Training Day Nutrition Plan',
        instructions: 'Create a full training day nutrition plan based on the macronutrient ranges for your body weight and training volume. Include specific foods, portions, and timing around your training session.',
        reflectionQuestions: [
          'Does your current eating pattern align with these recommendations?',
          'Where is the biggest gap between your current intake and the guidelines?',
          'How might your performance change with optimised pre-training nutrition?',
        ],
      },
    },
    {
      number: 2,
      title: 'Fuelling Endurance Performance',
      learningOutcome: 'Understand the nutritional strategies specific to endurance training and competition, including carbohydrate loading, intra-event fuelling, and recovery.',
      assessmentCriteria: [
        'Explain the principles and protocols for carbohydrate loading',
        'Describe intra-event fuelling strategies for activities lasting over 60 minutes',
        'Discuss the importance of sodium and electrolyte management during endurance exercise',
      ],
      content: [
        {
          heading: 'Carbohydrate Loading',
          paragraphs: [
            'Carbohydrate loading is a strategy used to maximise muscle glycogen stores before prolonged endurance events. The modern protocol involves increasing carbohydrate intake to 8–12 grams per kilogram of body weight for 36–48 hours before the event, while tapering training volume.',
            'The older "depletion-loading" protocol (depleting glycogen through exhaustive exercise, then loading) has been largely abandoned. It is unnecessary, unpleasant, and the modern simplified approach achieves comparable glycogen levels with far less discomfort and risk.',
          ],
          imageUrl: getUniversityImage('nutl3-u3-ch2-endurance-fuelling'),
          imageAlt: 'Carbohydrate loading protocol timeline',
        },
        {
          heading: 'During-Event Fuelling',
          paragraphs: [
            'For events lasting over 60–90 minutes, consuming carbohydrates during activity maintains blood glucose levels and delays glycogen depletion. Current recommendations suggest 30–60 grams of carbohydrate per hour for events lasting 1–2.5 hours, increasing to up to 90 grams per hour for events exceeding 2.5 hours.',
            'Achieving 90g/hour requires using multiple transportable carbohydrates (typically a 2:1 glucose-to-fructose ratio) to utilise different intestinal absorption pathways. This must be practised in training — the gut can be trained to tolerate higher carbohydrate intake, but attempting it for the first time on race day risks gastrointestinal distress.',
          ],
          imageUrl: getUniversityImage('nutl3-u3-ch2-intra-fuelling'),
          imageAlt: 'Intra-event fuelling rates: glucose only vs glucose plus fructose',
          bullets: [
            'Events under 60 minutes — Water only (mouth rinsing with carbohydrate may provide a small benefit)',
            'Events 1–2.5 hours — 30–60g carbohydrate per hour from gels, drinks, or whole foods',
            'Events over 2.5 hours — Up to 90g per hour using glucose-fructose combinations',
            'Practise your fuelling strategy in training — never try something new on race day',
          ],
        },
        {
          heading: 'Electrolytes and Hydration',
          paragraphs: [
            'During prolonged exercise, you lose sodium, potassium, and other electrolytes through sweat. Sodium is the primary electrolyte of concern — losses can range from 200mg to over 2,000mg per hour depending on sweat rate, genetics, and environmental conditions.',
            'Hyponatraemia (dangerously low blood sodium) is a real risk during long endurance events and is usually caused by over-drinking plain water without replacing sodium. This is why electrolyte drinks and sodium supplementation are recommended for events lasting over 2 hours, particularly in hot conditions.',
          ],
          imageUrl: getUniversityImage('nutl3-u3-ch2-electrolytes'),
          imageAlt: 'Electrolyte losses in sweat: sodium and potassium ranges',
        },
      ],
      unbreakableInsight: 'More people have ruined their race by experimenting with nutrition on the day than by under-training. Practise your fuelling strategy in training just as seriously as you practise your running or cycling.',
      coachNote: 'Start training your gut with intra-session carbohydrates during your long runs or rides at least 6–8 weeks before your target event. Gradually increase the amount as your gut tolerance improves.',
      practicalTask: {
        title: 'Event Fuelling Plan',
        instructions: 'Choose an endurance event (real or hypothetical) lasting over 90 minutes. Create a complete fuelling plan covering pre-event meals, carbohydrate loading, intra-event fuelling, and post-event recovery nutrition.',
        reflectionQuestions: [
          'How would your plan differ for a cool day versus a hot day?',
          'What are the risks of under-fuelling versus over-fuelling during the event?',
          'How would you practise this strategy during training?',
        ],
      },
    },
    {
      number: 3,
      title: 'Nutrition for Fat Loss',
      learningOutcome: 'Understand evidence-based strategies for achieving and maintaining fat loss through nutritional manipulation, without compromising health or performance.',
      assessmentCriteria: [
        'Calculate an appropriate caloric deficit for sustainable fat loss',
        'Explain the role of protein in preserving lean mass during a deficit',
        'Discuss the psychological and physiological challenges of sustained fat loss phases',
      ],
      content: [
        {
          heading: 'Setting an Appropriate Deficit',
          paragraphs: [
            'Fat loss requires a sustained caloric deficit — consuming fewer calories than you expend. However, the size of the deficit matters enormously. Too aggressive (more than 500–700 calories below maintenance) and you risk muscle loss, hormonal disruption, performance decline, and psychological burnout. Too modest (less than 200 calories) and progress is so slow that adherence wavers.',
            'A deficit of 300–500 calories below maintenance is appropriate for most people. This typically produces fat loss of 0.25–0.5kg per week in non-obese individuals. Overweight individuals can tolerate larger deficits initially, but the same principles apply as body fat decreases.',
          ],
          imageUrl: getUniversityImage('nutl3-u3-ch3-fat-loss-nutrition'),
          imageAlt: 'Deficit size vs muscle loss risk chart',
        },
        {
          heading: 'Protein — Your Most Important Macronutrient During Fat Loss',
          paragraphs: [
            'During a caloric deficit, your body is in an energy-deprived state and will catabolise tissue for fuel. Without adequate protein and resistance training stimulus, a significant proportion of weight lost will be muscle — which reduces your metabolic rate and leaves you looking "skinny fat" rather than lean.',
            'Protein intake during a deficit should increase to 2.0–2.4 grams per kilogram of body weight — higher than during maintenance or surplus phases. This higher intake helps preserve muscle mass, increases satiety (protein is the most filling macronutrient), and has a higher thermic effect (burning more calories during digestion).',
          ],
          imageUrl: getUniversityImage('nutl3-u3-ch3-deficit-range'),
          imageAlt: 'Calorie deficit sweet spot: 300-500 kcal optimal range',
          bullets: [
            'Maintenance or surplus — 1.6–2.0g protein per kg body weight',
            'Fat loss phase — 2.0–2.4g protein per kg body weight',
            'Very lean or aggressive dieting — Up to 2.7–3.0g/kg may be beneficial',
            'Higher protein intake does not cause kidney damage in healthy individuals',
          ],
        },
        {
          heading: 'Managing Hunger and Adherence',
          paragraphs: [
            'The biggest predictor of successful fat loss is adherence — the ability to maintain the deficit consistently over weeks and months. Strategies that improve adherence include prioritising high-volume, low-calorie-density foods (vegetables, fruits, lean proteins), maintaining adequate fibre intake (25–35g daily), staying well-hydrated, and ensuring adequate sleep.',
            'Flexible dieting approaches — where no foods are entirely off-limits but total intake is managed — consistently outperform rigid, restrictive diets for long-term adherence. The "best diet" is one you can actually follow consistently.',
          ],
          imageUrl: getUniversityImage('nutl3-u3-ch3-hunger-management'),
          imageAlt: 'Hunger management: volume eating, fibre, and hydration strategies',
        },
        {
          heading: 'When to Stop Dieting',
          paragraphs: [
            'Fat loss phases should not be indefinite. After 8–16 weeks in a deficit, a planned transition to maintenance calories (reverse dieting) is important for hormonal recovery, psychological health, and metabolic restoration. The goal is to spend the majority of your year at or near maintenance, with focused fat loss phases as relatively brief interventions.',
            'Signs that you should end a fat loss phase include persistent fatigue, loss of menstrual cycle (amenorrhoea), significant strength loss, extreme hunger that disrupts daily life, poor sleep quality, and declining mental health.',
          ],
        },
      ],
      unbreakableInsight: 'The goal of fat loss is not to lose weight as quickly as possible — it is to lose fat while keeping as much muscle as possible. Speed kills results. Patience builds physiques.',
      coachNote: 'If you have been dieting for more than 12 weeks without a break, take a planned 2-week period at maintenance calories. You will not lose progress — you will restore the hormonal and psychological resources needed to continue effectively.',
      practicalTask: {
        title: 'Fat Loss Phase Design',
        instructions: 'Calculate your estimated maintenance calories using a TDEE calculator. Then design a 12-week fat loss plan including your target deficit, macronutrient breakdown, a diet break schedule, and criteria for when to end the phase.',
        reflectionQuestions: [
          'Is your planned deficit sustainable for 8–12 weeks?',
          'How will you ensure your protein intake stays high enough to preserve muscle?',
          'What non-scale indicators will you use to assess progress?',
        ],
      },
    },
    {
      number: 4,
      title: 'Nutrition for Muscle Gain',
      learningOutcome: 'Understand the nutritional requirements for maximising lean muscle gain while minimising unnecessary fat accumulation.',
      assessmentCriteria: [
        'Explain the caloric surplus required for optimal muscle gain',
        'Describe the concept of a "lean bulk" versus a traditional bulk',
        'Discuss the diminishing returns of larger surpluses on muscle growth rate',
      ],
      content: [
        {
          heading: 'The Caloric Surplus for Muscle Growth',
          paragraphs: [
            'Building muscle requires a caloric surplus — providing your body with more energy than it expends. However, the relationship between surplus size and muscle growth is not linear. A modest surplus of 200–400 calories above maintenance provides sufficient energy for muscle growth in most trained individuals.',
            'Larger surpluses (500+ calories) do not proportionally increase muscle growth rate — they primarily increase fat accumulation. The rate of muscle growth is limited by biological factors (protein synthesis capacity, hormonal environment, training stimulus) regardless of how much food you consume.',
          ],
          imageUrl: getUniversityImage('nutl3-u3-ch4-muscle-gain-nutrition'),
          imageAlt: 'Surplus size vs muscle/fat gain graph',
        },
        {
          heading: 'Lean Bulk vs Traditional Bulk',
          paragraphs: [
            'A "lean bulk" targets a modest surplus (200–400 calories) and aims for weight gain of 0.25–0.5% of body weight per week. This approach minimises fat gain, reduces the length and severity of any subsequent cutting phase, and keeps you looking presentable year-round.',
            'A traditional "dirty bulk" with unrestricted eating may seem appealing — and it works in the sense that muscle is gained — but the excessive fat gain requires a longer, harder diet to remove. For natural lifters, the lean bulk approach is almost always superior for long-term body composition.',
          ],
          imageUrl: getUniversityImage('nutl3-u3-ch4-lean-bulk'),
          imageAlt: 'Lean bulk vs dirty bulk surplus comparison',
          bullets: [
            'Beginners — Can gain approximately 0.5–1% body weight per month (higher proportion as muscle)',
            'Intermediate — Approximately 0.25–0.5% body weight per month',
            'Advanced — Approximately 0.1–0.25% body weight per month (very slow muscle growth rate)',
            'The more trained you are, the smaller the surplus needed and the slower the rate of gain',
          ],
        },
        {
          heading: 'Practical Implementation',
          paragraphs: [
            'Set your surplus at approximately 200–400 calories above maintenance. Prioritise protein at 1.6–2.2g per kilogram. Fill remaining calories with carbohydrates (which support training performance and glycogen replenishment) and adequate fat (at least 0.7g per kilogram for hormonal health).',
            'Monitor weight gain weekly — if gaining faster than 0.5% body weight per week, reduce the surplus slightly. If weight is stable or declining, increase by 100–200 calories. This requires consistent tracking and patience, but produces the best long-term results.',
          ],
          imageUrl: getUniversityImage('nutl3-u3-ch4-gain-rates'),
          imageAlt: 'Muscle gain rates by experience level',
        },
      ],
      unbreakableInsight: 'You cannot force-feed your way to more muscle. Your body has a maximum rate of muscle protein synthesis — excess calories beyond that limit are stored as fat, full stop. Eat enough to grow, not enough to bloat.',
      coachNote: 'Track your waist measurement alongside body weight during a gaining phase. If your waist is increasing significantly faster than your weight, your surplus is too large.',
      practicalTask: {
        title: 'Lean Bulk Nutrition Plan',
        instructions: 'Design a one-week nutrition plan for a muscle gain phase. Calculate your maintenance calories, add a 200–400 calorie surplus, and plan your macronutrient distribution across 4–5 daily meals.',
        reflectionQuestions: [
          'How did you distribute your carbohydrate intake around training?',
          'What rate of weight gain would be appropriate for your training experience level?',
          'How would you know when to adjust your surplus up or down?',
        ],
      },
    },
    {
      number: 5,
      title: 'Hydration Science',
      learningOutcome: 'Understand the science of hydration, including fluid balance, electrolytes, and practical strategies for optimal hydration in different contexts.',
      assessmentCriteria: [
        'Explain the physiological mechanisms of fluid balance and thirst',
        'Describe the effects of dehydration on performance and health',
        'Discuss practical hydration strategies for training and daily life',
      ],
      content: [
        {
          heading: 'Fluid Balance and Regulation',
          paragraphs: [
            'Your body is approximately 60% water by weight, and maintaining fluid balance is critical for virtually every physiological process — from temperature regulation to nutrient transport, joint lubrication, and cognitive function. Fluid balance is regulated primarily through thirst (which triggers drinking) and anti-diuretic hormone (ADH), which controls how much water your kidneys retain.',
            'For most healthy individuals in normal conditions, drinking to thirst is a reliable hydration strategy. The commonly cited "eight glasses a day" has no robust scientific basis — fluid needs vary enormously based on body size, activity level, climate, and diet (many foods, particularly fruits and vegetables, contribute significant water).',
          ],
          imageUrl: getUniversityImage('nutl3-u3-ch5-hydration-science'),
          imageAlt: 'Human fluid balance diagram',
        },
        {
          heading: 'Dehydration and Performance',
          paragraphs: [
            'Dehydration of 2% or more of body weight consistently impairs both physical and cognitive performance. For a 70kg individual, this represents a fluid loss of just 1.4 litres — easily achievable during an intense training session, particularly in warm environments.',
            'Effects of dehydration include increased heart rate, reduced blood volume, impaired thermoregulation, decreased strength and power output, reduced endurance capacity, and impaired concentration and decision-making.',
          ],
          imageUrl: getUniversityImage('nutl3-u3-ch5-dehydration-scale'),
          imageAlt: 'Dehydration severity scale: 1% to 5%+ body weight loss',
          bullets: [
            '1% dehydration — Thirst is triggered. Minimal performance impact for most activities',
            '2% dehydration — Measurable decline in endurance performance and cognitive function',
            '3–4% dehydration — Significant performance impairment, headache, increased heart rate',
            '5%+ dehydration — Dangerous. Risk of heat illness, collapse, and organ damage',
          ],
        },
        {
          heading: 'Practical Hydration Strategies',
          paragraphs: [
            'Monitor your hydration status using urine colour — pale straw indicates good hydration, dark yellow suggests you need to drink more. First-morning urine is typically more concentrated, so assess mid-morning or afternoon urine for a more accurate picture.',
            'Pre-hydrate before training by drinking 400–600ml of water in the 2–3 hours before exercise. During training, drink to thirst — approximately 150–250ml every 15–20 minutes for most activities. After training, replace approximately 150% of any weight lost during the session (if you lost 1kg, drink 1.5 litres over the following hours).',
          ],
          imageUrl: getUniversityImage('nutl3-u3-ch5-hydration-strategy'),
          imageAlt: 'Hydration protocol: before, during, and after training',
        },
      ],
      unbreakableInsight: 'You do not need to force-drink water all day. Your thirst mechanism works. Drink when you are thirsty, drink around training, and stop overthinking it — unless you are training for over 90 minutes in the heat.',
      coachNote: 'Carry a water bottle and sip throughout the day. If you arrive at training and your urine was dark at your last visit to the toilet, you are already behind on hydration.',
      practicalTask: {
        title: 'Hydration Assessment',
        instructions: 'Track your fluid intake and urine colour for three consecutive days, including at least one training day. Note any symptoms of dehydration you may have been overlooking.',
        reflectionQuestions: [
          'Was your urine consistently pale straw throughout the day?',
          'How much did your fluid intake differ between training and rest days?',
          'Were you drinking enough before and during training?',
        ],
      },
    },
    {
      number: 6,
      title: 'Body Composition Assessment',
      learningOutcome: 'Understand the methods, limitations, and practical applications of body composition assessment for tracking progress and informing nutritional decisions.',
      assessmentCriteria: [
        'Compare the accuracy, accessibility, and limitations of common body composition methods',
        'Explain why body weight alone is an unreliable measure of progress',
        'Describe how to use body composition data to inform nutritional adjustments',
      ],
      content: [
        {
          heading: 'Why Body Weight Is Misleading',
          paragraphs: [
            'Body weight is the simplest metric to track but one of the most misleading. Daily weight fluctuations of 1–3kg are normal and result from changes in water retention, glycogen stores, gut contents, and hormonal cycles — none of which reflect actual changes in fat or muscle mass.',
            'A person can lose fat, gain muscle, and improve their health dramatically while their weight barely changes — or even increases. Conversely, rapid weight loss from crash dieting often reflects water and muscle loss rather than meaningful fat reduction.',
          ],
          imageUrl: getUniversityImage('nutl3-u3-ch6-body-composition'),
          imageAlt: 'Daily weight fluctuations vs trend line graph',
        },
        {
          heading: 'Methods of Body Composition Assessment',
          paragraphs: [
            'Several methods exist for estimating body composition, each with different levels of accuracy, cost, and accessibility.',
          ],
          imageUrl: getUniversityImage('nutl3-u3-ch6-body-comp-methods'),
          imageAlt: 'Body composition methods: DEXA, BIA, skinfolds, mirror',
          bullets: [
            'DEXA scan — Considered the practical gold standard. Uses low-dose X-rays to differentiate bone, lean mass, and fat mass. Accurate to approximately 1–2% body fat. Cost: approximately £50–150 per scan',
            'Bioelectrical impedance (BIA) — Uses a small electrical current to estimate body composition. Found in home scales and gym devices. Accuracy is highly variable — affected by hydration, food intake, and skin temperature. Best used for tracking trends, not absolute values',
            'Skinfold callipers — Measure subcutaneous fat thickness at specific sites. Accuracy depends entirely on the skill of the person taking measurements. Consistent technique from the same practitioner provides useful trend data',
            'Waist circumference — Simple, free, and surprisingly informative. Strongly correlates with visceral fat and metabolic health risk. Men above 94cm and women above 80cm are at increased risk',
            'Progress photos — Perhaps the most practical tool. Taken monthly under consistent conditions (same lighting, time, clothing), they reveal changes that numbers often miss',
          ],
        },
        {
          heading: 'Using Body Composition Data',
          paragraphs: [
            'No single measurement tells the full story. The most effective approach combines multiple metrics: weekly average weight (not daily weight), monthly waist circumference, monthly progress photos, and if accessible, periodic DEXA or skinfold measurements.',
            'Use this data to inform nutritional adjustments. If weight is stable but waist is decreasing and photos show visible improvement, you are likely recomposing (gaining muscle while losing fat) — even though the scale suggests "no progress." If weight is increasing and waist is also increasing, your surplus is likely too large.',
          ],
          imageUrl: getUniversityImage('nutl3-u3-ch6-progress-tracking'),
          imageAlt: 'Progress tracking methods: weight trend, measurements, photos',
        },
      ],
      unbreakableInsight: 'The scale measures your relationship with gravity, not your progress. If you are chasing a number on the scale rather than how you look, feel, and perform, you are optimising for the wrong thing.',
      coachNote: 'Take progress photos on the first of every month — same time, same lighting, same clothing. After three months, the visual changes will tell you more than any scale ever could.',
      practicalTask: {
        title: 'Multi-Metric Progress Tracking Setup',
        instructions: 'Set up a comprehensive progress tracking system using at least three different metrics. Take baseline measurements and plan your reassessment schedule.',
        reflectionQuestions: [
          'Which metric do you currently rely on most heavily? Is it the most informative?',
          'How might tracking multiple metrics change your response to daily weight fluctuations?',
          'What would you do if your weight increased but your waist measurement decreased?',
        ],
      },
    },
    {
      number: 7,
      title: 'Competition & Travel Nutrition',
      learningOutcome: 'Plan and execute nutrition strategies for competition day, away fixtures, travel, and non-routine environments where access to familiar food is limited.',
      assessmentCriteria: [
        'Design a competition-day nutrition timeline for different sport types',
        'Identify the nutritional challenges of travel and how to mitigate them',
        'Create contingency plans for when preferred foods are unavailable',
      ],
      content: [
        {
          heading: 'Competition Day — No Experiments',
          paragraphs: [
            'The single most important rule of competition nutrition: do not try anything new on competition day. Every food, drink, supplement, and timing strategy should be tested multiple times in training before being used in competition. Gastrointestinal distress, energy crashes, and dehydration during competition are almost always caused by untested nutrition protocols.',
            'Competition nutrition is not about optimising — it is about executing a plan you have already proven works for your body, your sport, and your schedule. The goal is to eliminate variables, not introduce them.',
          ],
        },
        {
          heading: 'Pre-Competition Fuelling',
          bullets: [
            'The night before — A familiar carbohydrate-rich meal 10–12 hours before competition. Nothing exotic, nothing heavy, nothing high in fibre. White rice, pasta, chicken, and low-residue vegetables are reliable choices',
            '3–4 hours before — A moderate meal: 1–2g/kg carbohydrate, 0.3g/kg protein, low fat, low fibre. Examples: porridge with banana, toast with jam and scrambled eggs, rice cakes with honey',
            '60 minutes before — A small carbohydrate top-up if needed: banana, sports drink, energy gel. Keep it simple and easily digestible',
            '30 minutes before — Sip water or electrolyte drink. Avoid large volumes that may cause stomach discomfort',
            'Caffeine — If you use it, 3–6mg/kg body weight 30–60 minutes before competition. Only if previously tested in training',
          ],
        },
        {
          heading: 'Travel Nutrition Challenges',
          paragraphs: [
            'Travel disrupts every aspect of nutrition: meal timing, food availability, hydration, sleep (which affects appetite hormones), and routine. Whether travelling for competition, work, or leisure, a proactive approach prevents the common pattern of poor food choices, dehydration, and energy crashes.',
          ],
          bullets: [
            'Pack non-perishable staples — Protein bars, dried fruit, nuts, rice cakes, oat sachets, and single-serve nut butter packets provide reliable macro coverage regardless of destination',
            'Hydrate proactively — Air travel is dehydrating. Aim for 250ml of water per hour of flight. Carry an empty bottle through security and fill it before boarding',
            'Maintain meal timing — Shift eating patterns to match the destination time zone as quickly as possible to help reset your circadian rhythm',
            'Scout food options — Research restaurants, supermarkets, and delivery options at your destination before arriving. Decisions made in advance are better than decisions made when hungry and jetlagged',
            'Accept imperfection — Travel nutrition is about damage limitation, not perfection. Maintaining adequate protein, hydration, and total energy intake covers 80% of the equation',
          ],
        },
      ],
      unbreakableInsight: 'Competition day is not the time to get clever with nutrition. It is the time to be boring, predictable, and reliable. The athletes who perform best on the day are the ones who eliminated nutritional uncertainty weeks ago.',
      coachNote: 'Create a written competition-day nutrition plan with exact foods, portions, and timings. Rehearse it at least three times in training. On the day, follow the plan. Adjust only if something genuinely goes wrong, not because you feel like experimenting.',
      practicalTask: {
        title: 'Competition Day Nutrition Plan',
        instructions: 'Design a complete competition-day nutrition plan for your sport (or a sport you follow). Include: evening-before meal, morning meal, pre-competition snack, during-competition fuelling (if applicable), and post-competition recovery nutrition. Specify exact foods, portions, and timings. Then test the plan during a hard training session.',
        reflectionQuestions: [
          'Did the plan work as designed during the training test, or were adjustments needed?',
          'What would you do if your planned foods were unavailable on competition day?',
          'How far in advance would you need to start preparing to execute this plan perfectly?',
        ],
      },
    },
    {
      number: 8,
      title: 'Periodised Nutrition Programming',
      learningOutcome: 'Design comprehensive, periodised nutrition programmes that align with training phases, body composition goals, and individual client needs across weeks, months, and competitive seasons.',
      assessmentCriteria: [
        'Explain the rationale for periodising nutrition alongside training',
        'Design a multi-phase nutrition programme for a specific training cycle',
        'Adjust macronutrient distribution and energy intake across different training phases',
      ],
      content: [
        {
          heading: 'Why Static Diets Fail',
          paragraphs: [
            'Most nutrition plans are static — the same macros, the same calories, the same meal structure regardless of what the body is doing. This is fundamentally mismatched with how training works. Training is periodised: volume, intensity, and goals change across weeks and months. Nutrition should follow the same logic.',
            'Periodised nutrition means deliberately adjusting energy intake, macronutrient ratios, and nutrient timing to match the demands of each training phase. It is the difference between wearing the same clothes year-round and dressing appropriately for the season.',
          ],
        },
        {
          heading: 'Nutrition Across Training Phases',
          bullets: [
            'Off-season / Base phase — Moderate surplus (200–300 kcal above TDEE). Higher carbohydrate to support training volume. Focus on building muscle, addressing nutrient gaps, and establishing consistent eating patterns',
            'Strength / Hypertrophy phase — Slight surplus. Protein at 1.8–2.2g/kg. Carbohydrate at 4–6g/kg to fuel training. Fat at minimum 0.8g/kg for hormonal health. Prioritise post-training nutrition',
            'Fat loss / Cutting phase — Moderate deficit (300–500 kcal below TDEE). Protein increased to 2.0–2.4g/kg to preserve lean mass. Carbohydrate reduced first, distributed around training. Fat maintained at minimum thresholds. Diet breaks every 8–12 weeks',
            'Competition preparation — Carbohydrate loading if appropriate (7–12g/kg for 24–48 hours). Fibre reduction to minimise GI distress. Familiar foods only. Hydration strategy rehearsed',
            'Recovery / Deload phase — Return to maintenance calories. Emphasise micronutrient-dense foods, anti-inflammatory nutrition, sleep-supporting foods. Reduce stimulant use',
          ],
        },
        {
          heading: 'Building a Periodised Plan',
          paragraphs: [
            'A periodised nutrition plan starts with the training calendar and works backwards. Know what the body needs to do in each phase, then design the nutrition to support it.',
          ],
          bullets: [
            'Step 1: Map the training cycle — Identify each phase, its duration, and its primary goal (build, cut, maintain, compete)',
            'Step 2: Set energy targets — Calculate TDEE for each phase based on expected training volume and body composition goal',
            'Step 3: Distribute macros — Allocate protein first (always adequate), then carbohydrate (matched to training demand), then fat (fills remaining calories above minimum threshold)',
            'Step 4: Plan transitions — Do not jump abruptly between phases. Transition calories by 200–300 kcal per week to allow metabolic adjustment',
            'Step 5: Build in flexibility — Life happens. Build planned flexibility (social events, holidays, travel) into the programme rather than treating them as failures',
            'Step 6: Review and adjust — Reassess every 2–4 weeks using body composition data, training performance, energy levels, and adherence',
          ],
        },
      ],
      unbreakableInsight: 'A nutrition plan that ignores the training calendar is a meal plan, not a performance programme. The body\'s needs change — your nutrition should change with them.',
      coachNote: 'Start simple: match carbohydrate to training demand (higher on hard days, lower on rest days) and keep protein consistent. That single adjustment is more impactful than any complicated macro-cycling protocol.',
      practicalTask: {
        title: 'Periodised Nutrition Programme Design',
        instructions: 'Design a 12-week periodised nutrition programme for yourself (or a hypothetical client) aligned with a training cycle. Include: training phase breakdown, energy targets per phase, macronutrient distribution, transition strategies, and a review schedule. Provide one sample day of eating for each distinct phase.',
        reflectionQuestions: [
          'How does your current nutrition match (or mismatch) your current training phase?',
          'What would change about your eating if you aligned nutrition with your training calendar?',
          'Where do you anticipate the biggest compliance challenges across the 12 weeks?',
        ],
      },
    },
  ],
};

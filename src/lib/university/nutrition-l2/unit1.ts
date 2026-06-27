import { getUniversityImage } from '@/lib/university/imageMap';
import type { Unit } from '../types';

export const nutritionL2Unit1: Unit = {
  number: 1,
  title: 'Principles of Healthy Eating',
  description: 'Understand the fundamentals of balanced nutrition — from macronutrients and micronutrients to hydration, food groups, and building meals that support your goals.',
  chapters: [
    {
      number: 1,
      title: 'The Eatwell Guide',
      learningOutcome: 'Understand the UK Eatwell Guide and how to use it as a framework for balanced eating.',
      assessmentCriteria: [
        'Describe the five food groups in the Eatwell Guide',
        'Explain the recommended proportions of each food group',
        'Identify limitations of the Eatwell Guide for active individuals',
      ],
      content: [
        {
          heading: 'What Is the Eatwell Guide?',
          paragraphs: [
            'The Eatwell Guide is a visual representation of the UK government\'s recommendations for a balanced diet. It divides food into five groups and shows the approximate proportions in which you should aim to eat them over the course of a day or week.',
            'It was designed for the general population aged 2 and above, and provides a useful starting framework — though it has limitations when applied to people with specific performance or body composition goals.',
          ],
          imageUrl: getUniversityImage('nutl2-u1-ch1-eatwell-guide'),
          imageAlt: 'UK Eatwell Guide diagram',
        },
        {
          heading: 'The Five Food Groups',
          imageUrl: getUniversityImage('nutl2-u1-ch1-food-groups'),
          imageAlt: 'The five food groups with recommended proportions',
          paragraphs: [
            'Fruit and vegetables — Should make up just over a third of your daily food intake. These provide essential vitamins, minerals, and fibre. Aim for at least five portions per day, with variety in colour and type.',
            'Starchy carbohydrates — Including bread, rice, potatoes, pasta, and cereals. These should make up just over a third of your diet. Choose wholegrain or higher-fibre versions where possible for sustained energy.',
            'Protein foods — Beans, pulses, fish, eggs, meat, and other protein sources. These are essential for muscle repair and growth. Aim for two portions of fish per week, one of which should be oily.',
            'Dairy and alternatives — Milk, cheese, yoghurt, and plant-based alternatives. These provide calcium for bone health. Choose lower-fat and lower-sugar options where available.',
            'Oils and spreads — Choose unsaturated oils and spreads in small amounts. These provide essential fatty acids but are calorie-dense.',
          ],
        },
        {
          heading: 'Limitations for Active Individuals',
          imageUrl: getUniversityImage('nutl2-u1-ch1-active-limitations'),
          imageAlt: 'Eatwell Guide limitations for active individuals comparison',
          paragraphs: [
            'The Eatwell Guide is designed for the average sedentary adult. If you train regularly, your protein and carbohydrate needs are likely higher than what the guide suggests. Your fat intake requirements may also differ depending on your training phase.',
            'It does not account for caloric demands of exercise, nutrient timing, or specific body composition goals. Think of it as a foundation — not a ceiling.',
          ],
          bullets: [
            'Protein recommendations are lower than evidence-based targets for active people (1.6–2.2 g/kg)',
            'Carbohydrate proportions may need adjusting based on training volume',
            'No guidance on meal timing or nutrient periodisation',
            'Does not distinguish between sedentary and active populations',
          ],
        },
      ],
      unbreakableInsight: 'The Eatwell Guide is a starting point, not a destination. It teaches balance, but your body\'s demands go beyond a poster on a wall. Learn the framework, then build beyond it.',
      coachNote: 'Use the Eatwell Guide as a teaching tool for general balance. Once you understand the basics, you\'ll naturally move towards more precise nutrition strategies that match your training.',
      practicalTask: {
        title: 'Eatwell Guide Audit',
        instructions: 'Record everything you eat for one full day. Compare your intake against the Eatwell Guide proportions. Where do you over-eat? Where do you under-eat?',
        reflectionQuestions: [
          'Which food groups do you consistently under-eat from?',
          'How does your current diet compare to the recommended proportions?',
          'What one change would bring you closer to a balanced intake?',
        ],
      },
    },
    {
      number: 2,
      title: 'Macronutrients Explained',
      learningOutcome: 'Understand the three macronutrients — protein, carbohydrates, and fats — and their roles in the body.',
      assessmentCriteria: [
        'Define each macronutrient and its caloric value per gram',
        'Explain the primary functions of each macronutrient',
        'Identify food sources for each macronutrient',
      ],
      content: [
        {
          heading: 'What Are Macronutrients?',
          paragraphs: [
            'Macronutrients are the nutrients your body needs in large quantities to provide energy and support essential functions. There are three: protein, carbohydrates, and fats. Each plays a distinct role and provides a specific amount of energy per gram.',
            'Protein provides 4 calories per gram. Carbohydrates provide 4 calories per gram. Fat provides 9 calories per gram. Alcohol, while not a macronutrient, provides 7 calories per gram with no nutritional benefit.',
          ],
          imageUrl: getUniversityImage('nutl2-u1-ch2-macronutrients'),
          imageAlt: 'Macronutrient comparison diagram',
        },
        {
          heading: 'Protein',
          imageUrl: getUniversityImage('nutl2-u1-ch2-protein'),
          imageAlt: 'Protein structure, function, and complete vs incomplete protein sources',
          paragraphs: [
            'Protein is essential for muscle repair, immune function, enzyme production, and hormone regulation. It is made up of amino acids — nine of which are essential, meaning your body cannot produce them and they must come from food.',
            'Complete proteins contain all nine essential amino acids. These include meat, fish, eggs, and dairy. Incomplete proteins (most plant sources) can be combined to provide a full amino acid profile — for example, rice and beans.',
          ],
          bullets: [
            'Meat, poultry, and fish — high-quality complete proteins',
            'Eggs — one of the most bioavailable protein sources',
            'Dairy — milk, yoghurt, cheese provide both protein and calcium',
            'Legumes, tofu, tempeh — plant-based options (combine for complete profile)',
            'Protein supplements — convenient but not superior to whole food sources',
          ],
        },
        {
          heading: 'Carbohydrates',
          paragraphs: [
            'Carbohydrates are your body\'s preferred energy source, particularly during high-intensity exercise. They are broken down into glucose, which fuels your muscles, brain, and nervous system.',
            'Carbohydrates are classified as simple (fast-digesting sugars) or complex (slower-digesting starches and fibre). Neither is inherently "good" or "bad" — context matters. Complex carbohydrates provide sustained energy, while simple carbohydrates can be useful around training.',
          ],
          bullets: [
            'Oats, rice, potatoes, pasta — staple complex carbohydrate sources',
            'Fruit — provides simple sugars alongside vitamins and fibre',
            'Vegetables — lower-calorie carbohydrate sources rich in micronutrients',
            'Bread, cereals — choose wholegrain for higher fibre content',
          ],
        },
        {
          heading: 'Fats',
          imageUrl: getUniversityImage('nutl2-u1-ch2-fats'),
          imageAlt: 'Dietary fats types and sources — saturated, unsaturated, and trans fats',
          paragraphs: [
            'Dietary fat is essential for hormone production (including testosterone), brain function, vitamin absorption (A, D, E, K), and cell membrane integrity. It is the most calorie-dense macronutrient at 9 calories per gram.',
            'Fats are classified as saturated, monounsaturated, and polyunsaturated. Trans fats (artificially hydrogenated) should be avoided. A balanced intake of all natural fat types supports optimal health.',
          ],
          bullets: [
            'Olive oil, avocado — rich in monounsaturated fats',
            'Oily fish (salmon, mackerel) — excellent source of omega-3 polyunsaturated fats',
            'Nuts and seeds — provide a mix of unsaturated fats and micronutrients',
            'Butter, cheese, fatty meat — sources of saturated fat (moderate intake recommended)',
          ],
        },
      ],
      unbreakableInsight: 'No macronutrient is the enemy. Protein builds, carbs fuel, fats regulate. The only bad diet is one that chronically eliminates any of them without medical reason.',
      coachNote: 'Start by understanding what each macro does before worrying about exact amounts. Awareness of food composition naturally improves your choices over time.',
      practicalTask: {
        title: 'Macro Identification',
        instructions: 'Take five items from your kitchen cupboard or fridge. For each item, identify the dominant macronutrient and note its calorie content per serving.',
        reflectionQuestions: [
          'Which macronutrient are most of your foods highest in?',
          'Did any food surprise you with its macro breakdown?',
          'How could you adjust your shopping to improve balance?',
        ],
      },
    },
    {
      number: 3,
      title: 'Micronutrients & Vitamins',
      learningOutcome: 'Understand the role of vitamins and minerals in health and performance, and identify common deficiencies.',
      assessmentCriteria: [
        'Differentiate between fat-soluble and water-soluble vitamins',
        'Identify key minerals and their functions',
        'Recognise signs of common micronutrient deficiencies',
      ],
      content: [
        {
          heading: 'What Are Micronutrients?',
          paragraphs: [
            'Micronutrients are vitamins and minerals that your body needs in small amounts for proper functioning. Unlike macronutrients, they do not provide calories — but they are essential for energy production, immune function, bone health, and hundreds of biochemical processes.',
            'Deficiencies in micronutrients can impair performance, recovery, mood, and long-term health — even if your calorie and macro intake is perfect.',
          ],
          imageUrl: getUniversityImage('nutl2-u1-ch3-vitamins-minerals'),
          imageAlt: 'Vitamins and minerals chart',
        },
        {
          heading: 'Vitamins',
          imageUrl: getUniversityImage('nutl2-u1-ch3-vitamins'),
          imageAlt: 'Essential vitamins — fat-soluble and water-soluble classification',
          paragraphs: [
            'Vitamins are divided into two categories based on how they are stored in the body:',
            'Fat-soluble vitamins (A, D, E, K) — These are stored in body fat and the liver. Because they accumulate, excessive intake can cause toxicity. They require dietary fat for proper absorption.',
            'Water-soluble vitamins (B-complex, C) — These are not stored in large amounts and excess is excreted in urine. They need to be consumed regularly through diet.',
          ],
          bullets: [
            'Vitamin A — Vision, skin health, immune function (found in liver, carrots, sweet potato)',
            'Vitamin D — Bone health, immune function, mood regulation (sunlight, oily fish, eggs)',
            'Vitamin E — Antioxidant protection (nuts, seeds, vegetable oils)',
            'Vitamin K — Blood clotting, bone metabolism (green leafy vegetables)',
            'B vitamins — Energy metabolism, nervous system function (whole grains, meat, eggs)',
            'Vitamin C — Immune support, collagen production, iron absorption (citrus, peppers, berries)',
          ],
        },
        {
          heading: 'Key Minerals',
          imageUrl: getUniversityImage('nutl2-u1-ch3-minerals'),
          imageAlt: 'Key minerals grid showing calcium, iron, zinc, magnesium, potassium, and sodium',
          paragraphs: [
            'Minerals are inorganic elements that support structural and functional roles in the body. Some are needed in larger amounts (macro-minerals) and others in trace amounts.',
          ],
          bullets: [
            'Calcium — Bone and teeth structure, muscle contraction (dairy, fortified plant milks, leafy greens)',
            'Iron — Oxygen transport in blood, energy production (red meat, lentils, spinach)',
            'Magnesium — Muscle relaxation, nerve function, sleep quality (nuts, seeds, dark chocolate)',
            'Zinc — Immune function, protein synthesis, wound healing (meat, shellfish, pumpkin seeds)',
            'Potassium — Fluid balance, muscle contractions, blood pressure (bananas, potatoes, avocado)',
            'Sodium — Fluid balance, nerve signalling (salt, processed foods — most people consume enough)',
          ],
        },
        {
          heading: 'Common Deficiencies in the UK',
          paragraphs: [
            'The most common micronutrient deficiencies in the UK population are vitamin D (especially in winter), iron (particularly in women), and magnesium. Active individuals may also have increased needs for B vitamins, zinc, and electrolytes due to higher metabolic demands and sweat losses.',
          ],
          bullets: [
            'Vitamin D — Limited sunlight in the UK means supplementation (10 mcg/day) is recommended October–March',
            'Iron — Women of reproductive age are at highest risk of deficiency',
            'Magnesium — Often under-consumed; linked to poor sleep and muscle cramps',
            'Omega-3 — Most people do not eat enough oily fish (aim for 2 portions per week)',
          ],
        },
      ],
      unbreakableInsight: 'You can hit your macros perfectly and still feel terrible if your micronutrients are off. The small things add up — your body runs on vitamins and minerals, not just calories.',
      coachNote: 'Eat a variety of colourful whole foods before reaching for supplements. If you suspect a deficiency, get blood work done rather than guessing.',
      practicalTask: {
        title: 'Micronutrient Check',
        instructions: 'Review your diet from the past three days. Identify which vitamins and minerals you may be under-consuming based on the food sources listed above.',
        reflectionQuestions: [
          'Do you eat enough colourful fruit and vegetables daily?',
          'Are you getting adequate vitamin D, especially in winter?',
          'Which mineral-rich foods could you add to your regular meals?',
        ],
      },
    },
    {
      number: 4,
      title: 'Dietary Fibre',
      learningOutcome: 'Understand the types, functions, and health benefits of dietary fibre.',
      assessmentCriteria: [
        'Differentiate between soluble and insoluble fibre',
        'State the recommended daily fibre intake for adults',
        'Identify high-fibre food sources',
      ],
      content: [
        {
          heading: 'What Is Dietary Fibre?',
          paragraphs: [
            'Dietary fibre is a type of carbohydrate that your body cannot digest. Unlike other carbohydrates that are broken down into glucose, fibre passes through the digestive system largely intact — but it plays crucial roles in gut health, blood sugar regulation, and satiety.',
            'The recommended daily intake for adults in the UK is 30 grams per day. Most people consume around 18 grams — well below the target.',
          ],
          imageUrl: getUniversityImage('nutl2-u1-ch4-fibre-types'),
          imageAlt: 'Soluble and insoluble fibre diagram',
        },
        {
          heading: 'Types of Fibre',
          imageUrl: getUniversityImage('nutl2-u1-ch4-fibre-comparison'),
          imageAlt: 'Soluble vs insoluble fibre comparison with food sources and daily target',
          paragraphs: [
            'Soluble fibre — Dissolves in water to form a gel-like substance. It slows digestion, helps regulate blood sugar levels, and can lower cholesterol. Found in oats, beans, lentils, fruits, and vegetables.',
            'Insoluble fibre — Does not dissolve in water. It adds bulk to stool and helps food pass through the digestive system more efficiently. Found in whole grains, nuts, seeds, and the skin of fruits and vegetables.',
            'Many foods contain both types of fibre. The key is overall intake rather than worrying about the ratio.',
          ],
        },
        {
          heading: 'Health Benefits of Fibre',
          bullets: [
            'Improved digestive health — Prevents constipation and supports regular bowel movements',
            'Blood sugar control — Slows glucose absorption, reducing spikes after meals',
            'Heart health — Soluble fibre can reduce LDL (bad) cholesterol',
            'Satiety — High-fibre foods keep you feeling fuller for longer, supporting weight management',
            'Gut microbiome — Fibre feeds beneficial gut bacteria, supporting immune function',
            'Reduced disease risk — Associated with lower risk of colorectal cancer, type 2 diabetes, and cardiovascular disease',
          ],
        },
        {
          heading: 'High-Fibre Food Sources',
          bullets: [
            'Oats — 10 g per 100 g (one of the best breakfast options for fibre)',
            'Lentils and beans — 7–8 g per 100 g cooked',
            'Whole wheat bread — 6–7 g per 100 g',
            'Broccoli — 2.6 g per 100 g (with additional micronutrient benefits)',
            'Berries — 2–4 g per 100 g (with antioxidant benefits)',
            'Chia seeds — 34 g per 100 g (extremely fibre-dense)',
            'Sweet potato — 3 g per 100 g (with the skin on)',
          ],
        },
      ],
      unbreakableInsight: 'Fibre is the most under-rated nutrient in fitness. It controls your appetite, feeds your gut, and protects your long-term health. Hit your 30 grams.',
      coachNote: 'Increase fibre gradually — a sudden jump can cause bloating and discomfort. Add 5 grams per week until you reach your target.',
      practicalTask: {
        title: 'Fibre Audit',
        instructions: 'Track your fibre intake for one day using food labels or a tracking app. Compare it against the 30 g/day recommendation.',
        reflectionQuestions: [
          'How close are you to the recommended 30 grams per day?',
          'Which high-fibre foods could you easily add to your existing meals?',
          'Do you notice any patterns in your digestive comfort related to fibre intake?',
        ],
      },
    },
    {
      number: 5,
      title: 'Hydration',
      learningOutcome: 'Understand the importance of hydration for health and performance, and how to assess and maintain adequate fluid intake.',
      assessmentCriteria: [
        'Explain why water is essential for bodily functions',
        'State general fluid intake recommendations',
        'Describe methods for assessing hydration status',
      ],
      content: [
        {
          heading: 'Why Hydration Matters',
          paragraphs: [
            'Water makes up approximately 60% of adult body weight and is involved in virtually every physiological process — from temperature regulation and nutrient transport to joint lubrication and waste removal.',
            'Even mild dehydration (1–2% body weight loss) can impair cognitive function, mood, exercise performance, and recovery. Chronic under-hydration is associated with kidney stones, urinary tract infections, and reduced metabolic efficiency.',
          ],
          imageUrl: getUniversityImage('nutl2-u1-ch5-water-functions'),
          imageAlt: 'Water functions in the body diagram',
        },
        {
          heading: 'How Much Water Do You Need?',
          paragraphs: [
            'The general recommendation for adults is 6–8 glasses (approximately 1.5–2 litres) per day from all fluids, including water, tea, coffee, and milk. However, individual needs vary based on body size, activity level, climate, and diet.',
            'Active individuals need more. A practical guideline is to consume an additional 500–1000 ml for every hour of exercise, adjusted for sweat rate and environmental conditions.',
          ],
          bullets: [
            'Sedentary adult — 1.5–2 litres per day minimum',
            'Moderately active — 2–2.5 litres per day',
            'Highly active / hot climate — 3+ litres per day',
            'During exercise — 150–250 ml every 15–20 minutes',
          ],
        },
        {
          heading: 'Assessing Hydration Status',
          imageUrl: getUniversityImage('nutl2-u1-ch5-hydration-check'),
          imageAlt: 'Hydration status assessment with urine colour chart and quick checks',
          paragraphs: [
            'The simplest method is the urine colour test. Pale straw-coloured urine indicates good hydration. Dark yellow or amber suggests dehydration. Note that some supplements (particularly B vitamins) can affect urine colour.',
          ],
          bullets: [
            'Urine colour — Aim for pale straw; dark yellow = drink more',
            'Thirst — If you feel thirsty, you are already mildly dehydrated',
            'Body weight — Weigh yourself before and after exercise; each kg lost = approximately 1 litre of fluid to replace',
            'Fatigue and headaches — Common early signs of dehydration',
          ],
        },
        {
          heading: 'Practical Hydration Tips',
          bullets: [
            'Carry a water bottle with you throughout the day',
            'Drink a glass of water with every meal',
            'Set reminders if you tend to forget to drink',
            'Herbal teas, milk, and water-rich foods (cucumber, watermelon) all count towards intake',
            'Limit excessive caffeine — while moderate amounts are fine, high doses can have a mild diuretic effect',
          ],
        },
      ],
      unbreakableInsight: 'Dehydration makes everything worse — your training, your recovery, your focus, your mood. It is the simplest thing to fix and the easiest to neglect.',
      coachNote: 'Make hydration a habit, not an afterthought. If you struggle to drink enough, start your day with a full glass before anything else.',
      practicalTask: {
        title: 'Hydration Tracking',
        instructions: 'Track your total fluid intake for one full day, including water, tea, coffee, and other beverages. Also note your urine colour at least three times during the day.',
        reflectionQuestions: [
          'Are you meeting the minimum recommended fluid intake?',
          'What does your urine colour suggest about your hydration status?',
          'What practical change could help you drink more consistently?',
        ],
      },
    },
    {
      number: 6,
      title: 'Understanding Food Groups',
      learningOutcome: 'Understand the nutritional value of different food groups and how to combine them for balanced meals.',
      assessmentCriteria: [
        'Describe the nutritional characteristics of each major food group',
        'Explain the concept of nutrient density',
        'Apply food group knowledge to construct a balanced plate',
      ],
      content: [
        {
          heading: 'Food Groups and Nutrient Density',
          paragraphs: [
            'Nutrient density refers to the amount of beneficial nutrients a food provides relative to its calorie content. Foods high in vitamins, minerals, protein, and fibre relative to their calories are considered nutrient-dense. Foods high in calories but low in beneficial nutrients are considered calorie-dense but nutrient-poor.',
            'Understanding nutrient density helps you make better food choices without needing to obsessively track every meal. Prioritising nutrient-dense foods naturally supports health, performance, and body composition.',
          ],
          imageUrl: getUniversityImage('nutl2-u1-ch6-nutrient-density'),
          imageAlt: 'Nutrient density comparison chart',
        },
        {
          heading: 'Protein-Rich Foods',
          bullets: [
            'Chicken breast — High protein, low fat, versatile',
            'Salmon — Protein plus omega-3 fatty acids',
            'Eggs — Complete protein, affordable, easy to prepare',
            'Greek yoghurt — Protein plus probiotics for gut health',
            'Lentils and chickpeas — Plant-based protein with fibre',
          ],
        },
        {
          heading: 'Carbohydrate-Rich Foods',
          bullets: [
            'Oats — Slow-releasing energy, high in fibre',
            'Sweet potato — Complex carbs plus vitamin A',
            'Brown rice — Sustained energy with B vitamins',
            'Fruit — Quick energy plus vitamins and antioxidants',
            'Whole wheat pasta — Staple energy source with fibre',
          ],
        },
        {
          heading: 'Fat-Rich Foods',
          bullets: [
            'Avocado — Monounsaturated fats plus potassium',
            'Olive oil — Heart-healthy fat for cooking and dressings',
            'Nuts and seeds — Mixed fats plus minerals',
            'Oily fish — Omega-3s for brain and heart health',
            'Dark chocolate (70%+) — Antioxidants and magnesium in moderation',
          ],
        },
        {
          heading: 'Building a Balanced Plate',
          imageUrl: getUniversityImage('nutl2-u1-ch6-balanced-plate'),
          imageAlt: 'Balanced plate diagram showing 50% vegetables, 25% protein, 25% carbs',
          paragraphs: [
            'A simple framework: fill half your plate with vegetables and salad, a quarter with protein, and a quarter with complex carbohydrates. Add a small amount of healthy fat (dressing, cooking oil, or avocado). This approach works for most meals and ensures a balance of macronutrients and micronutrients without detailed tracking.',
          ],
        },
      ],
      unbreakableInsight: 'You do not need to memorise every nutrient in every food. Focus on variety and nutrient density — eat colourful, whole foods most of the time, and the details take care of themselves.',
      coachNote: 'The balanced plate method is the simplest tool for improving your diet without tracking. Master this before moving to more detailed approaches.',
      practicalTask: {
        title: 'Balanced Plate Construction',
        instructions: 'Plan three meals using the balanced plate method — half vegetables, a quarter protein, a quarter carbohydrates, plus a small amount of fat. Write out the ingredients for each.',
        reflectionQuestions: [
          'Did building a balanced plate feel natural or forced?',
          'Which food groups were easiest and hardest to include?',
          'How does this compare to how you normally eat?',
        ],
      },
    },
    {
      number: 7,
      title: 'Portion Control',
      learningOutcome: 'Understand practical portion control strategies and why portion awareness supports healthy eating.',
      assessmentCriteria: [
        'Explain the difference between portion size and serving size',
        'Describe hand-based portion estimation methods',
        'Identify factors that influence portion sizes',
      ],
      content: [
        {
          heading: 'Portion Size vs Serving Size',
          paragraphs: [
            'A serving size is a standardised measurement used on food labels. A portion size is how much you actually eat. These are often different — and the gap between them is where many people unknowingly over-consume calories.',
            'Over the past few decades, average portion sizes have increased significantly. Restaurant meals, ready meals, and even dinner plates have grown — leading to a distorted sense of what a "normal" amount of food looks like.',
          ],
          imageUrl: getUniversityImage('nutl2-u1-ch7-portion-sizes'),
          imageAlt: 'Portion size comparison over time',
        },
        {
          heading: 'Hand-Based Portion Estimation',
          imageUrl: getUniversityImage('nutl2-u1-ch7-hand-portions'),
          imageAlt: 'Hand-based portion guide showing palm, fist, cupped hand, and thumb measurements',
          paragraphs: [
            'Your hand provides a convenient, always-available tool for estimating portions without scales or apps. While not perfectly accurate, this method is practical and good enough for most people.',
          ],
          bullets: [
            'Palm = 1 portion of protein (approximately 20–30 g protein)',
            'Fist = 1 portion of vegetables',
            'Cupped hand = 1 portion of carbohydrates (cooked rice, pasta, etc.)',
            'Thumb = 1 portion of fats (oils, nut butter, cheese)',
          ],
        },
        {
          heading: 'Factors That Influence Portions',
          bullets: [
            'Plate size — Larger plates lead to larger portions (use smaller plates to naturally reduce intake)',
            'Package size — Eating from a large bag results in higher consumption than portioning out first',
            'Distracted eating — Eating while watching TV or scrolling leads to overconsumption',
            'Social influence — You tend to eat more when dining with others who eat large portions',
            'Hunger level — Eating when extremely hungry makes portion control harder',
            'Food availability — Having food visible and accessible increases consumption',
          ],
        },
        {
          heading: 'Practical Portion Strategies',
          bullets: [
            'Serve food on plates rather than eating from containers',
            'Pre-portion snacks into small bowls or bags',
            'Eat slowly — it takes 15–20 minutes for satiety signals to reach your brain',
            'Use smaller plates and bowls',
            'Fill up on vegetables first to naturally reduce calorie-dense food intake',
          ],
        },
      ],
      unbreakableInsight: 'You don\'t need to weigh every gram of food for the rest of your life. But you do need to develop portion awareness — knowing roughly what a reasonable serving looks like is a skill that serves you forever.',
      coachNote: 'The hand method is your best friend when eating out, travelling, or when you simply don\'t want to track. Learn it, use it, trust it.',
      practicalTask: {
        title: 'Portion Awareness Exercise',
        instructions: 'For your next three meals, estimate your portions using the hand method before eating. Then, weigh the same portions to see how accurate your estimates are.',
        reflectionQuestions: [
          'How accurate were your hand-based estimates compared to actual weights?',
          'Were you over- or under-estimating any particular food group?',
          'How could this method help you in situations where tracking isn\'t practical?',
        ],
      },
    },
    {
      number: 8,
      title: 'Building Balanced Meals',
      learningOutcome: 'Apply nutritional knowledge to plan and build balanced meals that support health and energy needs.',
      assessmentCriteria: [
        'Construct a balanced meal using macronutrient and food group principles',
        'Explain the importance of meal regularity and consistency',
        'Describe strategies for improving meal quality',
      ],
      content: [
        {
          heading: 'Meal Structure Fundamentals',
          paragraphs: [
            'A well-structured meal provides energy, satisfies appetite, and delivers the nutrients your body needs. Rather than following complicated rules, the goal is to build habits that make balanced eating your default — not something that requires constant effort.',
            'Most people benefit from three main meals per day, with the option of one to two snacks depending on activity level and hunger patterns. Consistency in meal timing helps regulate appetite, blood sugar, and energy levels.',
          ],
          imageUrl: getUniversityImage('nutl2-u1-ch8-balanced-day'),
          imageAlt: 'Balanced daily meals with macro breakdowns',
        },
        {
          heading: 'The Four-Component Meal',
          imageUrl: getUniversityImage('nutl2-u1-ch8-four-component'),
          imageAlt: 'Four-component meal framework showing protein, carbs, vegetables, and healthy fats',
          paragraphs: [
            'Every main meal should aim to include four components: a protein source, a complex carbohydrate, vegetables or fruit, and a small amount of healthy fat. This framework ensures nutritional balance without over-thinking.',
          ],
          bullets: [
            'Breakfast example — Scrambled eggs (protein) + wholemeal toast (carbs) + spinach (veg) + avocado (fat)',
            'Lunch example — Chicken breast (protein) + brown rice (carbs) + mixed salad (veg) + olive oil dressing (fat)',
            'Dinner example — Salmon (protein + fat) + sweet potato (carbs) + steamed broccoli (veg)',
          ],
        },
        {
          heading: 'Meal Regularity',
          imageUrl: getUniversityImage('nutl2-u1-ch8-meal-timing'),
          imageAlt: 'Daily meal structure timeline showing calorie distribution across four meals',
          paragraphs: [
            'Eating at roughly consistent times each day helps regulate hunger hormones (ghrelin and leptin), maintains stable blood sugar, and prevents the extreme hunger that leads to poor food choices.',
            'There is no single "best" number of meals per day. What matters most is total daily intake and consistency. Whether you eat three, four, or five times per day, the key is finding a pattern you can sustain.',
          ],
        },
        {
          heading: 'Improving Meal Quality Over Time',
          bullets: [
            'Start with one improved meal per day, then build from there',
            'Prepare ingredients in advance (batch cooking) to make healthy choices easier',
            'Focus on adding nutrients rather than restricting foods',
            'Keep healthy staples stocked — eggs, frozen vegetables, tinned fish, oats, rice',
            'Allow flexibility — an 80/20 approach (80% nutrient-dense, 20% flexible) is sustainable',
          ],
        },
      ],
      unbreakableInsight: 'Perfection is the enemy of consistency. Build meals that are good enough, repeatable, and enjoyable. The best diet is the one you actually follow.',
      coachNote: 'Master a small rotation of balanced meals you enjoy. Having 5–7 go-to meals removes decision fatigue and makes healthy eating automatic.',
      practicalTask: {
        title: 'Meal Plan Draft',
        instructions: 'Using the four-component framework (protein, carbs, veg, fat), plan a full day of meals — breakfast, lunch, dinner, and one snack. Keep it realistic and based on foods you actually enjoy.',
        reflectionQuestions: [
          'Does your plan cover all four components at each meal?',
          'Is this a day of eating you could realistically repeat?',
          'What adjustments would make it even more sustainable for you?',
        ],
      },
    },
  ],
};

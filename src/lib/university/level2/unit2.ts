import type { Unit } from '../types';
import ch1Macronutrients from '@/assets/university/u2-ch1-protein-sources.png';
import ch2Micronutrients from '@/assets/university/u2-ch2-deficiency-signs.png';
import ch3Hydration from '@/assets/university/u2-ch3-dehydration-stages.png';
import ch4EnergyBalance from '@/assets/university/u2-ch4-tdee-breakdown.png';
import ch5FoodLabels from '@/assets/university/u2-ch5-marketing-claims.png';
import ch6NutrientTiming from '@/assets/university/u2-ch6-meal-frequency.png';
import ch7BalancedPlate from '@/assets/university/u2-ch7-plate-model.png';

export const level2Unit2: Unit = {
  number: 2,
  title: 'Principles of Nutrition',
  description: 'Understand macronutrients, micronutrients, hydration, energy balance, food labels, nutrient timing, and how to build a sustainable, balanced diet for health and performance.',
  chapters: [
    // ─── Chapter 1: Understanding Macronutrients ───
    {
      number: 1,
      title: 'Understanding Macronutrients',
      learningOutcome: 'Understand the three macronutrients — protein, carbohydrates, and fats — including their roles in the body, caloric values, food sources, and how they contribute to health and performance.',
      assessmentCriteria: [
        'Identify the three macronutrients and state the caloric value of each per gram',
        'Describe the primary role of each macronutrient in the body',
        'Give at least three quality food sources for each macronutrient',
        'Explain the difference between simple and complex carbohydrates',
      ],
      content: [
        {
          heading: 'Why Macronutrients Matter',
          paragraphs: [
            'Every piece of food you eat is made up of macronutrients — the nutrients your body needs in large quantities for energy, growth, and repair. Understanding macronutrients is the foundation of all nutrition knowledge.',
            'There are three macronutrients: protein, carbohydrates, and fats. Each plays a unique and essential role. None of them are "bad" — they are all necessary for optimal health and performance.',
          ],
        },
        {
          heading: 'Protein — The Builder',
          paragraphs: [
            'Protein provides 4 calories per gram. It is the primary nutrient responsible for building and repairing muscle tissue, producing enzymes and hormones, and supporting immune function.',
            'Protein is made up of amino acids — often called the building blocks of the body. There are 20 amino acids, 9 of which are "essential", meaning they must come from food because the body cannot produce them.',
          ],
          bullets: [
            'Complete protein sources (contain all 9 essential amino acids): chicken, beef, fish, eggs, dairy, soy',
            'Incomplete protein sources (missing one or more essential amino acids): beans, lentils, nuts, seeds, grains',
            'Recommended intake for active individuals: 1.6–2.2g per kg of bodyweight per day',
            'Protein has the highest thermic effect of food (TEF) — your body uses more energy digesting protein than any other macronutrient',
          ],
        },
        {
          heading: 'Carbohydrates — The Fuel',
          paragraphs: [
            'Carbohydrates provide 4 calories per gram. They are the body\'s preferred source of energy, particularly during moderate-to-high intensity exercise. Carbohydrates are broken down into glucose, which fuels muscles and the brain.',
          ],
          bullets: [
            'Simple carbohydrates: quick-release energy — sugar, fruit, honey, white bread. Useful around training for fast fuel.',
            'Complex carbohydrates: slow-release energy — oats, sweet potato, brown rice, wholegrain bread. Better for sustained energy throughout the day.',
            'Fibre: a type of carbohydrate the body cannot digest. Essential for gut health, satiety, and blood sugar regulation. Found in vegetables, fruits, whole grains, and legumes.',
            'Glycogen: the stored form of carbohydrate in muscles and the liver. Depleted during exercise and replenished through dietary carbohydrate.',
          ],
          imageUrl: ch1Macronutrients,
          imageAlt: 'Diagram showing the three macronutrients — protein, carbohydrates, and fats — with their caloric values and food sources',
        },
        {
          heading: 'Fats — The Essential Regulator',
          paragraphs: [
            'Fat provides 9 calories per gram — more than double that of protein or carbohydrates. Despite its reputation, dietary fat is essential for hormone production (including testosterone), brain function, joint health, and the absorption of fat-soluble vitamins (A, D, E, K).',
          ],
          bullets: [
            'Unsaturated fats (healthy fats): olive oil, avocado, nuts, seeds, oily fish (salmon, mackerel). These support heart health and reduce inflammation.',
            'Saturated fats: butter, cheese, red meat, coconut oil. Not inherently bad, but should be consumed in moderation — aim for less than 10% of total calorie intake.',
            'Trans fats: artificially created fats found in processed foods, margarine, and fried fast food. These should be avoided entirely — they increase LDL cholesterol and cardiovascular risk.',
            'Essential fatty acids: Omega-3 and Omega-6 must come from the diet. Omega-3 (found in oily fish, flaxseed, walnuts) is particularly important for reducing inflammation.',
          ],
        },
        {
          heading: 'Putting Macronutrients Together',
          paragraphs: [
            'A balanced diet includes all three macronutrients in appropriate proportions. The exact ratio depends on individual goals, activity level, and body composition. Common starting points:',
          ],
          bullets: [
            'General health: ~30% protein, ~40% carbohydrates, ~30% fats',
            'Muscle building: ~35% protein, ~45% carbohydrates, ~20% fats',
            'Fat loss: ~40% protein, ~30% carbohydrates, ~30% fats',
            'Endurance athletes: ~25% protein, ~55% carbohydrates, ~20% fats',
          ],
        },
      ],
      unbreakableInsight: 'No single macronutrient is the enemy. Cutting out carbs, avoiding fats, or under-eating protein are all common mistakes that lead to poor performance, hormonal issues, and eventual failure. Balance is not boring — it\'s the foundation of every successful long-term nutrition strategy.',
      coachNote: 'Don\'t get caught up in exact percentages at this stage. Focus on understanding what each macronutrient does, identifying quality sources, and recognising that all three are essential. The specifics of ratios and amounts come with experience and individualisation.',
      practicalTask: {
        title: 'Macronutrient Audit',
        instructions: 'Track everything you eat for one full day. For each food item, identify whether it is primarily a source of protein, carbohydrates, or fat. At the end of the day, assess whether your intake was reasonably balanced across all three.',
        reflectionQuestions: [
          'Which macronutrient did you consume the most of?',
          'Which macronutrient was most underrepresented in your diet?',
          'Can you identify two simple swaps to improve your balance?',
        ],
      },
    },

    // ─── Chapter 2: Micronutrients & Their Role ───
    {
      number: 2,
      title: 'Micronutrients & Their Role',
      learningOutcome: 'Understand the role of vitamins and minerals in health and performance, identify key micronutrients relevant to active individuals, and recognise common deficiency signs.',
      assessmentCriteria: [
        'Distinguish between fat-soluble and water-soluble vitamins',
        'Identify at least four key minerals and their roles in the body',
        'Recognise common signs and symptoms of micronutrient deficiencies',
        'Explain the difference between obtaining micronutrients from food versus supplements',
      ],
      content: [
        {
          heading: 'What Are Micronutrients?',
          paragraphs: [
            'While macronutrients provide energy in large quantities, micronutrients — vitamins and minerals — are needed in smaller amounts but are equally critical. They regulate thousands of chemical processes in the body, from energy production to immune function.',
            'Unlike macronutrients, micronutrients do not provide calories. However, without adequate micronutrient intake, your body cannot efficiently use the macronutrients you consume.',
          ],
        },
        {
          heading: 'Vitamins',
          paragraphs: [
            'Vitamins are organic compounds divided into two categories based on how the body absorbs and stores them:',
          ],
          bullets: [
            'Fat-soluble vitamins (A, D, E, K): Stored in the body\'s fat tissues and liver. Can accumulate over time. Require dietary fat for absorption.',
            'Vitamin A — vision, immune function, skin health. Sources: liver, sweet potato, carrots, spinach.',
            'Vitamin D — bone health, immune regulation, mood. Sources: sunlight, oily fish, eggs, fortified foods. Deficiency is extremely common in the UK.',
            'Vitamin E — antioxidant, protects cells from damage. Sources: nuts, seeds, olive oil, avocado.',
            'Vitamin K — blood clotting, bone metabolism. Sources: leafy greens (kale, spinach, broccoli).',
          ],
          imageUrl: ch2Micronutrients,
          imageAlt: 'Diagram showing fat-soluble and water-soluble vitamins alongside key minerals and their food sources',
        },
        {
          heading: 'Water-Soluble Vitamins',
          paragraphs: [
            'Water-soluble vitamins are not stored in the body and must be consumed regularly. Excess amounts are excreted in urine.',
          ],
          bullets: [
            'B Vitamins (B1, B2, B3, B5, B6, B7, B9, B12): Energy metabolism, red blood cell production, nervous system function. Sources: meat, eggs, dairy, whole grains, legumes, leafy greens.',
            'Vitamin C: Immune function, collagen synthesis (important for joints and skin), iron absorption. Sources: citrus fruits, peppers, strawberries, broccoli.',
            'Key point: Because water-soluble vitamins are not stored, consistent daily intake through diet is important.',
          ],
        },
        {
          heading: 'Key Minerals for Active Individuals',
          paragraphs: [
            'Minerals are inorganic elements that the body cannot produce. They must come from food or, in some cases, supplementation.',
          ],
          bullets: [
            'Iron — carries oxygen in the blood via haemoglobin. Low iron = fatigue, poor performance, breathlessness. Sources: red meat, spinach, lentils, fortified cereals. Women and endurance athletes are at higher risk of deficiency.',
            'Calcium — essential for bone strength and muscle contraction. Sources: dairy products, fortified plant milks, leafy greens, tinned fish with bones.',
            'Magnesium — involved in over 300 enzymatic reactions. Supports muscle relaxation, sleep quality, and energy production. Sources: nuts, seeds, dark chocolate, leafy greens.',
            'Zinc — immune function, protein synthesis, wound healing. Sources: meat, shellfish, seeds, chickpeas.',
            'Sodium & Potassium — electrolytes critical for fluid balance, nerve function, and muscle contraction. Lost through sweat during exercise.',
          ],
        },
        {
          heading: 'Food First vs. Supplementation',
          paragraphs: [
            'The evidence consistently shows that obtaining micronutrients from whole foods is superior to supplementation for the vast majority of people. Whole foods contain micronutrients in forms the body absorbs most efficiently, alongside fibre and other beneficial compounds.',
            'Supplementation has a role in specific cases: Vitamin D during UK winters, iron for diagnosed deficiency, B12 for vegans, and folic acid during pregnancy. However, supplements should complement a good diet — not replace one.',
          ],
        },
      ],
      unbreakableInsight: 'You can eat enough calories and still be malnourished. A diet of processed food may hit your macros but leave you chronically deficient in the vitamins and minerals your body needs to actually function. Eat real food first.',
      coachNote: 'At Level 2, you don\'t need to memorise every vitamin and mineral. Focus on understanding the categories (fat-soluble vs water-soluble), the key minerals listed above, and the principle of "food first" supplementation. If you can explain why someone might be low in iron or vitamin D, you\'re in a strong position.',
      practicalTask: {
        title: 'Micronutrient Gap Finder',
        instructions: 'Review your typical weekly diet. Using the information in this chapter, identify which micronutrients you are likely consuming well and which may be lacking. Focus on the key vitamins and minerals covered.',
        reflectionQuestions: [
          'Are you consuming enough iron-rich foods?',
          'Do you get regular sunlight or consume vitamin D sources?',
          'How many servings of vegetables and fruits do you eat daily?',
        ],
      },
    },

    // ─── Chapter 3: Hydration & Fluid Balance ───
    {
      number: 3,
      title: 'Hydration & Fluid Balance',
      learningOutcome: 'Understand the role of water and electrolytes in the body, recognise the signs and effects of dehydration, and apply evidence-based hydration guidelines for health and exercise.',
      assessmentCriteria: [
        'Explain the role of water in thermoregulation, nutrient transport, and joint lubrication',
        'Identify the main electrolytes and their functions',
        'Recognise the signs and stages of dehydration',
        'Apply appropriate hydration strategies before, during, and after exercise',
      ],
      content: [
        {
          heading: 'Why Hydration Matters',
          paragraphs: [
            'Water makes up approximately 60% of adult body weight. It is involved in virtually every physiological process — from regulating body temperature to transporting nutrients to lubricating joints. Even mild dehydration (1-2% body weight loss) can impair physical and cognitive performance.',
            'For active individuals, hydration is not optional — it is a performance variable as important as sleep and nutrition.',
          ],
        },
        {
          heading: 'The Role of Water in the Body',
          paragraphs: [
            'Water serves several critical functions:',
          ],
          bullets: [
            'Thermoregulation — the body cools itself through sweating. Without adequate water, core temperature rises and heat-related illness becomes a risk.',
            'Nutrient transport — water is the medium through which nutrients are carried to cells and waste products are removed.',
            'Joint lubrication — synovial fluid, which cushions joints, is primarily water-based. Dehydration can increase joint stiffness and injury risk.',
            'Digestion — water is essential for breaking down food, absorbing nutrients, and maintaining gut health.',
            'Cognitive function — even mild dehydration reduces concentration, reaction time, and mood.',
          ],
          imageUrl: ch3Hydration,
          imageAlt: 'Diagram showing the role of water in the body, electrolyte balance, and recommended daily intake guidelines',
        },
        {
          heading: 'Electrolytes',
          paragraphs: [
            'Electrolytes are minerals that carry an electrical charge in solution. They are critical for fluid balance, nerve signalling, and muscle contraction. The key electrolytes are:',
          ],
          bullets: [
            'Sodium — the primary electrolyte lost in sweat. Regulates fluid balance and blood pressure. Sources: table salt, processed foods, electrolyte drinks.',
            'Potassium — works with sodium to maintain fluid balance. Supports muscle function and heart rhythm. Sources: bananas, potatoes, spinach, avocado.',
            'Magnesium — supports muscle relaxation and over 300 enzymatic reactions. Sources: nuts, seeds, dark chocolate, leafy greens.',
            'Calcium — essential for muscle contraction and bone health. Sources: dairy, fortified plant milks, leafy greens.',
          ],
        },
        {
          heading: 'Dehydration: Signs and Stages',
          paragraphs: [
            'Dehydration occurs when fluid loss exceeds fluid intake. It progresses through recognisable stages:',
          ],
          bullets: [
            'Mild (1-2% body weight loss): thirst, dry mouth, slightly darker urine, reduced concentration',
            'Moderate (3-5% body weight loss): headache, fatigue, dizziness, significantly reduced exercise performance (up to 25% decrease)',
            'Severe (>5% body weight loss): rapid heartbeat, confusion, muscle cramps, risk of heat stroke — medical emergency',
            'Urine colour guide: pale straw = well hydrated; dark yellow/amber = dehydrated; clear = potentially over-hydrated',
          ],
        },
        {
          heading: 'Hydration Guidelines for Exercise',
          paragraphs: [
            'Practical hydration strategies should be applied before, during, and after exercise:',
          ],
          bullets: [
            'Before exercise: drink 400-600ml of water 2-3 hours before training. Top up with 200ml 15-30 minutes before.',
            'During exercise: aim for 150-250ml every 15-20 minutes. For sessions over 60 minutes or in heat, consider an electrolyte solution.',
            'After exercise: replace 150% of fluid lost. Weigh yourself before and after training — each kg lost equals approximately 1 litre of fluid to replace.',
            'General daily intake: aim for 35ml per kg of bodyweight as a baseline (e.g., 80kg person = 2.8 litres). Increase with activity and heat.',
          ],
        },
      ],
      unbreakableInsight: 'Most people walk around chronically dehydrated without knowing it. That afternoon energy crash, that persistent headache, that plateau in your training — before you change your programme or your supplements, check your water intake. It\'s the cheapest performance enhancer there is.',
      coachNote: 'The urine colour guide is the simplest, most practical tool you can use. Don\'t overcomplicate hydration — drink consistently throughout the day, increase around training, and monitor your urine. If it\'s consistently pale straw, you\'re doing well.',
      practicalTask: {
        title: 'Hydration Tracking Day',
        instructions: 'For one full day, track every drink you consume (including water, tea, coffee, and other beverages). Note the total volume and check your urine colour at least three times during the day.',
        reflectionQuestions: [
          'How much total fluid did you consume?',
          'Was your urine colour consistently pale straw, or did it vary?',
          'How did your energy and focus feel compared to days when you drink less water?',
        ],
      },
    },

    // ─── Chapter 4: Energy Balance & Body Composition ───
    {
      number: 4,
      title: 'Energy Balance & Body Composition',
      learningOutcome: 'Understand the concept of energy balance, including TDEE, BMR, and the thermic effect of food. Apply this knowledge to explain how caloric surplus, deficit, and maintenance affect body composition.',
      assessmentCriteria: [
        'Define BMR, NEAT, TEF, and EAT and explain how they contribute to TDEE',
        'Explain the relationship between caloric surplus, deficit, and maintenance',
        'Describe how energy balance affects body composition (fat loss vs muscle gain)',
        'Identify common errors in estimating energy expenditure and intake',
      ],
      content: [
        {
          heading: 'The Energy Balance Equation',
          paragraphs: [
            'At its simplest, body composition change comes down to energy balance: the relationship between the calories you consume (energy in) and the calories you expend (energy out). This is not a diet philosophy — it is a law of thermodynamics.',
            'If you consume more energy than you expend, you are in a caloric surplus — your body stores the excess, primarily as body fat (or muscle, if you are training and eating appropriately). If you consume less than you expend, you are in a caloric deficit — your body uses stored energy to make up the difference.',
          ],
        },
        {
          heading: 'Components of Energy Expenditure (TDEE)',
          paragraphs: [
            'Your Total Daily Energy Expenditure (TDEE) is the total number of calories your body burns in a day. It is made up of four components:',
          ],
          bullets: [
            'BMR (Basal Metabolic Rate) — the energy your body needs at complete rest to maintain basic functions: breathing, circulation, cell production. This accounts for 60-70% of TDEE for most people.',
            'NEAT (Non-Exercise Activity Thermogenesis) — all the energy burned through daily movement that is NOT structured exercise: walking, fidgeting, standing, household tasks. This is the most variable component and can account for 15-30% of TDEE.',
            'TEF (Thermic Effect of Food) — the energy used to digest, absorb, and process food. This accounts for approximately 10% of TDEE. Protein has the highest TEF (~20-30%), followed by carbohydrates (~5-10%), then fats (~0-3%).',
            'EAT (Exercise Activity Thermogenesis) — the energy burned during structured exercise. For most people, this is only 5-10% of TDEE — far less than most assume.',
          ],
          imageUrl: ch4EnergyBalance,
          imageAlt: 'Diagram showing the components of Total Daily Energy Expenditure: BMR, NEAT, TEF, and EAT with their relative proportions',
        },
        {
          heading: 'Caloric Surplus, Deficit, and Maintenance',
          paragraphs: [
            'Understanding these three states is essential for any body composition goal:',
          ],
          bullets: [
            'Maintenance: Calories in = Calories out. Body weight remains stable. This is the baseline for any adjustment.',
            'Caloric surplus: Calories in > Calories out. Required for muscle gain. A moderate surplus of 200-500 calories above maintenance supports muscle growth while limiting excess fat gain.',
            'Caloric deficit: Calories in < Calories out. Required for fat loss. A moderate deficit of 300-500 calories below maintenance allows fat loss while preserving muscle mass (when combined with resistance training and adequate protein).',
            'Aggressive deficits (>750 calories) increase the risk of muscle loss, metabolic adaptation, nutrient deficiencies, and poor adherence.',
          ],
        },
        {
          heading: 'Common Mistakes in Energy Balance',
          paragraphs: [
            'Understanding energy balance is simple. Applying it accurately is harder. Common errors include:',
          ],
          bullets: [
            'Underestimating food intake: research consistently shows people underreport calorie consumption by 30-50%. This is the number one reason people think they "can\'t lose weight".',
            'Overestimating exercise calories: gym machines and fitness trackers often overestimate calorie burn by 20-40%. Do not "eat back" all exercise calories.',
            'Ignoring NEAT: a sedentary office worker and an active tradesperson with the same body weight, age, and gym routine can have TDEE differences of 500-800 calories per day due to NEAT alone.',
            'Focusing only on the scale: body composition is not the same as body weight. A person who gains 3kg of muscle and loses 3kg of fat may weigh the same but look and perform dramatically better.',
          ],
        },
        {
          heading: 'Practical Application',
          paragraphs: [
            'To estimate your TDEE, start with a BMR estimate using a validated formula (such as Mifflin-St Jeor), then multiply by an activity factor. However, treat any calculator as a starting point — not gospel. Track your intake and weight trends over 2-4 weeks and adjust based on real results.',
            'Remember: the goal is never "eat as little as possible". The goal is to eat as much as possible while still achieving your body composition target. This supports performance, health, and long-term sustainability.',
          ],
        },
      ],
      unbreakableInsight: 'The fitness industry profits from making nutrition complicated. Detoxes, clean eating, meal replacements, eliminating food groups — they all work (temporarily) because they create a caloric deficit by restriction. Once you understand energy balance, you see through every fad diet. You don\'t need to eliminate foods. You need to manage energy.',
      coachNote: 'Energy balance is the most important concept in nutrition for body composition. But it is not the ONLY thing that matters. Food quality, micronutrient density, meal timing, and psychological sustainability all play a role. Think of energy balance as the foundation — not the entire house.',
      practicalTask: {
        title: 'TDEE Estimation',
        instructions: 'Using the Mifflin-St Jeor equation (available online or in this platform\'s calculators), estimate your BMR. Then apply an activity multiplier to estimate your TDEE. Track your food intake for 3 days and compare your average intake to your estimated TDEE.',
        reflectionQuestions: [
          'Is your estimated intake above, below, or close to your TDEE?',
          'Does this align with any changes in your body weight over recent weeks?',
          'What is one adjustment you could make to better align with your goal?',
        ],
      },
    },

    // ─── Chapter 5: Reading Food Labels ───
    {
      number: 5,
      title: 'Reading Food Labels',
      learningOutcome: 'Interpret UK food labels accurately, including understanding serving sizes, nutritional information panels, ingredient lists, and common marketing claims.',
      assessmentCriteria: [
        'Read and interpret a UK nutrition information panel',
        'Identify the difference between "per serving" and "per 100g" values',
        'Explain common nutritional claims (e.g., "low fat", "high protein", "no added sugar")',
        'Identify hidden sugars and fats in ingredient lists',
      ],
      content: [
        {
          heading: 'Why Food Labels Matter',
          paragraphs: [
            'Food labels are your most powerful tool for making informed dietary choices. They tell you exactly what is in the food you are buying — but only if you know how to read them. Many people glance at the front-of-pack claims and assume they are getting something healthy, without checking the actual nutritional content.',
            'In the UK, food labelling is regulated by the Food Standards Agency (FSA) and follows EU-derived standards. Understanding these labels is a non-negotiable skill for anyone serious about their nutrition.',
          ],
        },
        {
          heading: 'Understanding the Nutrition Information Panel',
          paragraphs: [
            'UK food labels must display nutritional information per 100g (or 100ml for liquids). Many also provide a "per serving" column. The key values to look at are:',
          ],
          bullets: [
            'Energy (kJ and kcal) — the calorie content. Remember: "per 100g" allows comparison between products; "per serving" tells you what you actually eat.',
            'Fat (of which saturates) — total fat and the saturated fat within it. High saturated fat: >5g per 100g. Low: <1.5g per 100g.',
            'Carbohydrate (of which sugars) — total carbohydrate and the sugar within it. High sugar: >22.5g per 100g. Low: <5g per 100g.',
            'Fibre — aim for higher fibre products. Adults need 30g per day.',
            'Protein — important for satiety and muscle repair.',
            'Salt — high: >1.5g per 100g. Low: <0.3g per 100g. Adults should consume no more than 6g per day.',
          ],
          imageUrl: ch5FoodLabels,
          imageAlt: 'Annotated food label showing key sections: serving size, calories, macronutrients, daily values, and ingredient list',
        },
        {
          heading: 'Per 100g vs. Per Serving',
          paragraphs: [
            'This is where many people are misled. A product may appear low in calories or sugar "per serving" but the manufacturer has defined a serving size that is unrealistically small.',
          ],
          bullets: [
            'Example: A cereal bar states "99 calories per serving". The serving is listed as 25g. The actual bar weighs 50g. The true calorie content is 198 calories.',
            'Always check the serving size against how much you actually eat.',
            'Use "per 100g" values to compare products fairly — this is the only standardised comparison.',
          ],
        },
        {
          heading: 'Traffic Light System',
          paragraphs: [
            'Many UK products use a front-of-pack traffic light system showing red (high), amber (medium), and green (low) for fat, saturated fat, sugars, and salt per serving. This is voluntary but widely adopted.',
            'While useful as a quick guide, the traffic light system has limitations — it doesn\'t account for the overall nutritional quality of the food, and it can make nutrient-dense foods like nuts or oily fish appear "unhealthy" because of their fat content.',
          ],
        },
        {
          heading: 'Common Marketing Claims Decoded',
          paragraphs: [
            'Food marketing is designed to sell, not to educate. Understanding what claims actually mean under UK law is essential:',
          ],
          bullets: [
            '"Low fat" — must contain ≤3g fat per 100g. But often compensated with added sugar to maintain flavour.',
            '"Fat free" — must contain ≤0.5g fat per 100g. Does not mean calorie-free.',
            '"No added sugar" — no sugar was added during production. But the product can still be high in natural sugars (e.g., fruit juice).',
            '"High protein" — must provide ≥20% of energy from protein. Check the total protein per serving, not just the claim.',
            '"Light" or "Lite" — must be 30% lower in at least one value (usually fat or calories) compared to the standard product. Does not mean it is "healthy".',
            '"Natural" — has no legal definition in UK food law. Essentially meaningless as a health claim.',
          ],
        },
        {
          heading: 'Reading the Ingredient List',
          paragraphs: [
            'Ingredients are listed in descending order by weight — the first ingredient makes up the largest proportion. A general rule: the shorter the ingredient list, the less processed the food.',
          ],
          bullets: [
            'Hidden sugars: look for dextrose, maltodextrin, high-fructose corn syrup, sucrose, glucose syrup, agave nectar, invert sugar — these are all forms of added sugar.',
            'Hidden fats: palm oil, hydrogenated vegetable oil, partially hydrogenated fat — these are often low-quality or trans fats.',
            'If you cannot pronounce or recognise several ingredients, the product is heavily processed.',
          ],
        },
      ],
      unbreakableInsight: 'The front of a food package is advertising. The back is the truth. If you only ever read one thing, read the ingredient list and the per-100g nutritional panel. Companies spend millions making junk food look healthy. Your defence is knowledge.',
      coachNote: 'Don\'t become obsessive about label reading — that leads to orthorexia and anxiety. The goal is awareness and informed choice, not perfection. Focus on building the habit of checking the per-100g column and understanding serving sizes. That alone puts you ahead of most consumers.',
      practicalTask: {
        title: 'Food Label Comparison',
        instructions: 'Choose three products from the same category (e.g., three different yoghurts, or three breakfast cereals). Compare them using the per-100g nutritional information. Identify which is the best option and why.',
        reflectionQuestions: [
          'Which product had the most protein per 100g?',
          'Which product had the highest sugar content — was it the one you expected?',
          'Did the front-of-pack claims match the actual nutritional content?',
        ],
      },
    },

    // ─── Chapter 6: Nutrient Timing & Meal Structure ───
    {
      number: 6,
      title: 'Nutrient Timing & Meal Structure',
      learningOutcome: 'Understand the principles of nutrient timing around exercise, evaluate common meal frequency claims, and apply practical meal structuring strategies.',
      assessmentCriteria: [
        'Describe the importance of pre- and post-workout nutrition',
        'Explain the "anabolic window" and evaluate the evidence behind it',
        'Discuss the relationship between meal frequency and metabolic rate',
        'Design a practical daily meal structure based on an individual\'s training schedule',
      ],
      content: [
        {
          heading: 'What Is Nutrient Timing?',
          paragraphs: [
            'Nutrient timing refers to the strategic consumption of nutrients around training and throughout the day to optimise performance, recovery, and body composition. While total daily intake is the most important factor, timing can offer a meaningful advantage — particularly for those training at higher intensities or multiple times per day.',
            'The key principle: nutrient timing matters more as training demands increase. For a recreational gym-goer training 3-4 times per week, it is a fine-tuning tool, not a make-or-break factor.',
          ],
        },
        {
          heading: 'Pre-Workout Nutrition',
          paragraphs: [
            'The goal of pre-workout nutrition is to provide sufficient fuel for performance without causing digestive discomfort.',
          ],
          bullets: [
            '2-3 hours before training: a balanced meal containing protein, complex carbohydrates, and moderate fat. Example: chicken with rice and vegetables, or oats with protein powder and banana.',
            '30-60 minutes before training: a smaller, easily digestible snack. Example: banana, rice cakes with honey, or a small protein shake with fruit.',
            'Avoid high-fat, high-fibre meals close to training — these slow digestion and can cause bloating or nausea.',
            'Fasted training is viable for low-to-moderate intensity sessions but may impair high-intensity performance.',
          ],
          imageUrl: ch6NutrientTiming,
          imageAlt: 'Timeline diagram showing nutrient timing around exercise: pre-workout, during workout, and post-workout nutrition windows',
        },
        {
          heading: 'Post-Workout Nutrition',
          paragraphs: [
            'Post-workout nutrition supports recovery by replenishing glycogen, providing amino acids for muscle repair, and rehydrating the body.',
          ],
          bullets: [
            'The "anabolic window": traditional advice claimed you must consume protein within 30-60 minutes post-training. Current research suggests the window is much wider (several hours) — unless you trained fasted, in which case sooner is better.',
            'Post-workout meal: aim for 20-40g protein and a source of carbohydrates. Example: protein shake with banana, chicken wrap, or Greek yoghurt with fruit.',
            'Glycogen replenishment: particularly important for endurance athletes or those training twice daily. Consume 1-1.2g carbohydrate per kg of body weight in the hours following training.',
            'Rehydration: replace 150% of fluid lost (see Chapter 3).',
          ],
        },
        {
          heading: 'Meal Frequency: Myths and Evidence',
          paragraphs: [
            'One of the most persistent nutrition myths is that eating "6 small meals a day" boosts metabolism. This claim does not hold up to scientific scrutiny.',
          ],
          bullets: [
            'The thermic effect of food (TEF) is proportional to total calorie intake, not meal frequency. Whether you eat 2,000 calories in 3 meals or 6 meals, the TEF is the same.',
            'Meal frequency should be based on personal preference, lifestyle, and adherence — not metabolic dogma.',
            'For muscle building: distributing protein intake across 3-5 meals (with 20-40g per meal) appears optimal for maximising muscle protein synthesis.',
            'For fat loss: meal frequency matters less than total calorie and protein intake. Choose the pattern you can stick to consistently.',
          ],
        },
        {
          heading: 'Building a Practical Daily Structure',
          paragraphs: [
            'Rather than following rigid meal timing rules, build a flexible structure around your training schedule and daily routine:',
          ],
          bullets: [
            'Anchor meals around training: ensure adequate fuel before and recovery nutrition after.',
            'Distribute protein evenly: 3-5 servings of 20-40g protein throughout the day.',
            'Front-load or back-load carbohydrates based on preference and training time — there is no "best" time for carbs, but many people benefit from placing more carbohydrates around training.',
            'Allow flexibility: a structured plan you follow 80% of the time beats a "perfect" plan you follow 50% of the time.',
          ],
        },
      ],
      unbreakableInsight: 'Stop stressing about the "perfect" meal timing. The person who eats well-balanced meals at irregular times will always outperform the person who obsesses over timing but eats poorly. Get the basics right first — total calories, adequate protein, real food. Timing is the polish, not the foundation.',
      coachNote: 'At this level, the most important takeaway is: eat a balanced meal 2-3 hours before training, and a protein-rich meal or shake within a few hours after. Everything beyond that is optimisation. Don\'t skip meals before training and then wonder why you feel weak.',
      practicalTask: {
        title: 'Training Day Meal Planner',
        instructions: 'Design a full day of eating for a training day, including a pre-workout meal, a post-workout meal, and 2-3 additional meals. Ensure each meal contains adequate protein (20-40g) and that carbohydrate intake is placed around your training session.',
        reflectionQuestions: [
          'Does your plan provide enough fuel for your training session?',
          'How have you distributed protein across the day?',
          'Is this plan realistic for your lifestyle and schedule?',
        ],
      },
    },

    // ─── Chapter 7: Putting It All Together ───
    {
      number: 7,
      title: 'Putting It All Together',
      learningOutcome: 'Synthesise knowledge from the previous six chapters to build a sustainable, evidence-based daily nutrition approach. Identify common nutritional mistakes and develop strategies for long-term adherence.',
      assessmentCriteria: [
        'Design a balanced daily nutrition plan using macronutrient targets and food quality principles',
        'Identify at least five common nutritional mistakes and explain how to avoid them',
        'Explain why adherence and sustainability are more important than perfection',
        'Apply the 80/20 principle to nutrition planning',
      ],
      content: [
        {
          heading: 'From Knowledge to Practice',
          paragraphs: [
            'You now understand macronutrients, micronutrients, hydration, energy balance, food labels, and nutrient timing. But knowledge without application is worthless. This chapter bridges the gap between understanding nutrition and actually living it.',
            'The goal is not to eat "perfectly". The goal is to eat well consistently — in a way that supports your health, your training, and your life.',
          ],
        },
        {
          heading: 'Building a Balanced Day',
          paragraphs: [
            'A well-structured day of eating follows simple principles:',
          ],
          bullets: [
            'Protein at every meal: 20-40g per serving, distributed across 3-5 meals. This supports muscle protein synthesis, satiety, and recovery.',
            'Vegetables and/or fruit at most meals: aim for 5+ portions per day. These provide fibre, micronutrients, and volume (keeping you full for fewer calories).',
            'Quality carbohydrate sources: prioritise whole grains, potatoes, rice, oats, and fruit over processed carbohydrates. Place more carbs around training.',
            'Healthy fat sources: include nuts, seeds, olive oil, avocado, and oily fish. Don\'t fear fat — just be aware of its caloric density.',
            'Adequate hydration: 35ml per kg bodyweight as a baseline, more with exercise and heat.',
          ],
          imageUrl: ch7BalancedPlate,
          imageAlt: 'Diagram showing a balanced plate composition with protein, carbohydrates, vegetables, and healthy fats, alongside a full day meal structure',
        },
        {
          heading: 'The 80/20 Principle',
          paragraphs: [
            'Sustainable nutrition follows the 80/20 principle: 80% of your diet should come from whole, minimally processed, nutrient-dense foods. The remaining 20% can include foods you enjoy that may not be "optimal" but contribute to adherence, social life, and mental health.',
            'A diet that is 100% "clean" but causes stress, social isolation, or binge cycles is worse than a diet that is 80% nutritious with room for flexibility. The best diet is the one you can maintain for years — not weeks.',
          ],
        },
        {
          heading: 'Common Nutritional Mistakes',
          paragraphs: [
            'Recognising common errors helps you avoid them:',
          ],
          bullets: [
            'Not eating enough protein — especially common in people trying to lose weight. Protein protects muscle mass during a deficit.',
            'Drinking calories — fruit juice, sugary coffees, alcohol, and smoothies can add hundreds of calories without satisfying hunger.',
            'Skipping meals then overeating — irregular eating patterns often lead to poor food choices later in the day.',
            'Eliminating entire food groups — unless medically required (e.g., coeliac disease), removing carbs, fats, or dairy is rarely necessary and often counterproductive.',
            'Relying on supplements over food — protein shakes, multivitamins, and fat burners do not compensate for a poor diet.',
            'Ignoring fibre — low fibre intake is linked to poor gut health, reduced satiety, and increased risk of chronic disease. Aim for 30g per day.',
            'Confusing "healthy" food with "low calorie" food — nuts, avocado, olive oil, and dark chocolate are nutritious but calorie-dense. Portion awareness matters.',
          ],
        },
        {
          heading: 'Strategies for Long-Term Adherence',
          paragraphs: [
            'The evidence is clear: the most effective diet is the one you can stick to. Here are strategies that support long-term success:',
          ],
          bullets: [
            'Meal prep: preparing meals in advance reduces decision fatigue and reliance on convenience food.',
            'Flexible structure: have a framework (e.g., protein + veg + carb at each meal) rather than a rigid meal plan.',
            'Track when needed, intuitively eat when ready: food tracking is a learning tool, not a lifelong requirement. Use it to build awareness, then transition to intuitive eating as your understanding grows.',
            'Plan for social situations: don\'t avoid meals out, parties, or holidays. Make the best choice available and move on.',
            'Focus on habits, not willpower: willpower is finite. Build automatic habits (drinking water first thing, prepping lunches, keeping protein snacks available) instead of relying on daily motivation.',
          ],
        },
        {
          heading: 'The Unbreakable Approach to Nutrition',
          paragraphs: [
            'Nutrition is not about perfection — it is about consistency. The person who eats well 80% of the time for years will always outperform the person who eats "perfectly" for two weeks then quits.',
            'Your nutrition should support your training, your health, and your life. If it\'s making you miserable, it\'s not working — regardless of what the macros say.',
          ],
        },
      ],
      unbreakableInsight: 'The fitness industry wants you to believe nutrition is complicated so you keep buying products and programmes. It isn\'t. Eat enough protein. Eat your vegetables. Drink water. Move your body. Be consistent. That\'s 90% of the game. Everything else is optimisation.',
      coachNote: 'This chapter is the most important one in the unit. If you walk away understanding energy balance, the importance of protein, the value of whole foods, and the 80/20 principle — you have more knowledge than 90% of gym users. Focus on simplicity and consistency over complexity and perfection.',
      practicalTask: {
        title: 'Full Day Nutrition Plan',
        instructions: 'Design a complete day of eating that reflects everything you\'ve learned in this unit. Include 3-5 meals, ensure adequate protein distribution, include vegetables, plan hydration, and apply the 80/20 principle by including one food you enjoy that may not be "optimal".',
        reflectionQuestions: [
          'Does your plan hit your estimated macronutrient targets?',
          'Have you included adequate fibre, micronutrient-rich foods, and hydration?',
          'Is this plan something you could realistically follow most days?',
        ],
      },
    },
    {
      number: 8,
      title: 'Common Nutrition Myths & Misconceptions',
      learningOutcome: 'Identify and critically evaluate the most common nutrition myths encountered in popular media and gym culture, using evidence-based reasoning.',
      assessmentCriteria: [
        'Identify at least five common nutrition myths and explain why they are misleading or false',
        'Explain the difference between correlation and causation in nutrition research',
        'Apply critical thinking to evaluate new nutrition claims encountered in media or conversation',
      ],
      content: [
        {
          heading: 'Why Nutrition Myths Persist',
          paragraphs: [
            'Nutrition is one of the most misunderstood areas of health. Everyone eats, so everyone has an opinion. Social media amplifies extreme claims because moderate, evidence-based advice doesn\'t get clicks. Add in a supplement industry worth billions, and you have a recipe for widespread misinformation.',
            'The goal of this chapter isn\'t to tell you what to believe — it\'s to give you the tools to evaluate claims for yourself. Let\'s break down the biggest myths you\'ll encounter.',
          ],
        },
        {
          heading: 'Myth 1: "Eating Fat Makes You Fat"',
          paragraphs: [
            'This myth dominated nutrition advice from the 1980s through the 2000s. The logic seemed simple: fat has 9 calories per gram (vs 4 for carbs and protein), so eating less fat = fewer calories = less body fat. But it doesn\'t work that way.',
            'Body fat storage is primarily determined by total energy balance — calories in vs calories out. You can gain fat eating nothing but rice, and you can lose fat while eating 40% of your calories from fats. Dietary fat is essential for hormone production (including testosterone), vitamin absorption (A, D, E, K are fat-soluble), cell membrane integrity, and brain function.',
          ],
        },
        {
          heading: 'Myth 2: "You Need to Eat Every 2-3 Hours to Boost Metabolism"',
          paragraphs: [
            'The idea that frequent meals "stoke the metabolic fire" is one of the fitness industry\'s most persistent myths. Research has repeatedly shown that meal frequency has minimal impact on metabolic rate when total daily intake is the same.',
            'The thermic effect of food (TEF) — the energy used to digest food — is proportional to total intake, not how many meals you split it into. Six small meals and three larger meals produce the same total TEF. Eat in a pattern that fits your lifestyle and helps you stay consistent.',
          ],
        },
        {
          heading: 'Myth 3: "Carbs After 6pm Turn to Fat"',
          paragraphs: [
            'Your body doesn\'t have a clock that switches to fat-storage mode at a specific time. Whether you eat carbohydrates at 8am or 10pm, the metabolic process is the same. What matters is your total daily intake relative to your energy expenditure.',
            'In fact, there\'s evidence that eating carbohydrates in the evening can improve sleep quality — carbs help produce serotonin and melatonin. For people who train in the evening, post-workout carbs are essential for recovery regardless of the time.',
          ],
        },
        {
          heading: 'Myth 4: "You Can Only Absorb 30g of Protein Per Meal"',
          paragraphs: [
            'This myth has been debunked repeatedly. Your body can absorb far more than 30g of protein in a single sitting — absorption and utilisation are different things. A large steak containing 70g of protein doesn\'t result in 40g being wasted.',
            'What is true is that distributing protein across 3-5 meals (rather than cramming it all into one) may optimise muscle protein synthesis throughout the day. But the idea of a hard 30g ceiling is simply wrong. Eat the protein your body needs, distributed in a way that works for your schedule.',
          ],
        },
        {
          heading: 'Myth 5: "Detox Diets and Cleanses Remove Toxins"',
          paragraphs: [
            'Your body already has a highly effective detoxification system — it\'s called your liver and kidneys. They filter waste products from your blood 24 hours a day. No juice cleanse, charcoal supplement, or week-long fast does this job better than your own organs.',
            'Most "detox" products work by acting as laxatives or diuretics, causing water loss that looks like weight loss on the scale. The moment you eat normally again, the weight returns. Save your money — eat whole foods, drink water, and let your organs do what they\'re designed to do.',
          ],
        },
        {
          heading: 'How to Evaluate Nutrition Claims',
          paragraphs: [
            'When you see a bold nutrition claim, run it through these filters:',
          ],
          bullets: [
            'Who benefits? — Is someone selling something? Supplement companies, diet book authors, and influencers all have financial incentives to make extreme claims.',
            'What does the research say? — Is the claim based on a single study or a body of evidence? Single studies can show almost anything — look for systematic reviews and meta-analyses.',
            'Correlation vs causation — "People who eat breakfast weigh less" doesn\'t mean breakfast causes weight loss. It might mean health-conscious people tend to eat breakfast.',
            'Dose and context — Many substances are harmful at high doses but fine at normal levels. Sugar isn\'t poison. Saturated fat isn\'t deadly. Context and quantity matter.',
            'The "too good to be true" test — If it sounds like a miracle, it probably isn\'t. Real nutrition science is boring: eat mostly whole foods, get enough protein, maintain a healthy weight. That\'s it.',
          ],
          imagePlaceholder: 'Flowchart for evaluating nutrition claims: Who benefits? → What does the research say? → Is it correlation or causation? → Does dose/context matter? → Is it too good to be true?',
        },
      ],
      unbreakableInsight: 'The loudest voices in nutrition usually have the weakest evidence. The supplement that promises to "melt fat" while you sleep, the diet that demonises an entire food group, the influencer who found the "one thing" nobody else knows — they\'re all selling something. Eat real food. Don\'t overcomplicate it.',
      coachNote: 'You\'re going to encounter these myths constantly — from friends, family, social media, even personal trainers. You don\'t need to correct everyone, but knowing the truth gives you confidence in your own approach. When someone tells you carbs after 6pm are fattening, just smile — you know better.',
      practicalTask: {
        title: 'Myth-Busting Exercise',
        instructions: 'Over the next week, collect three nutrition claims you encounter in conversation, social media, or news articles. For each one, write down the claim, identify who made it and whether they have a financial interest, and then evaluate it against the critical thinking framework from this chapter.',
        reflectionQuestions: [
          'Were any of the claims you found based on genuine scientific evidence?',
          'Did you identify any claims that you previously believed to be true?',
          'How will you approach nutrition advice differently going forward?',
        ],
      },
    },
  ],
};

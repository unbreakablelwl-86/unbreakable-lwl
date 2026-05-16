import type { Unit } from '../types';
import ch1FourCs from '@/assets/university/nutl2-u3-ch1-four-cs.png';
import ch1Bacteria from '@/assets/university/nutl2-u3-ch1-bacteria.png';
import ch2TemperatureZones from '@/assets/university/nutl2-u3-ch2-temperature-zones.png';
import ch2Storage from '@/assets/university/nutl2-u3-ch2-storage.png';
import ch3CrossContamination from '@/assets/university/nutl2-u3-ch3-cross-contamination.png';
import ch3Prevention from '@/assets/university/nutl2-u3-ch3-prevention.png';
import ch4FoodLabels from '@/assets/university/nutl2-u3-ch4-food-labels.png';
import ch4TrafficLight from '@/assets/university/nutl2-u3-ch4-traffic-light.png';
import ch5BudgetShopping from '@/assets/university/nutl2-u3-ch5-budget-shopping.png';
import ch5BudgetFoods from '@/assets/university/nutl2-u3-ch5-budget-foods.png';
import ch6BatchCooking from '@/assets/university/nutl2-u3-ch6-batch-cooking.png';
import ch6BatchFundamentals from '@/assets/university/nutl2-u3-ch6-batch-fundamentals.png';
import ch7MealPrep from '@/assets/university/nutl2-u3-ch7-meal-prep.png';
import ch7CookingMethods from '@/assets/university/nutl2-u3-ch7-cooking-methods.png';
import ch8KitchenSafety from '@/assets/university/nutl2-u3-ch8-kitchen-safety.png';
import ch8KnifeSafety from '@/assets/university/nutl2-u3-ch8-knife-safety.png';

export const nutritionL2Unit3: Unit = {
  number: 3,
  title: 'Food Safety & Practical Skills',
  description: 'Learn essential food safety principles, label reading skills, and practical kitchen techniques that form the foundation of confident, independent meal preparation.',
  chapters: [
    {
      number: 1,
      title: 'Food Hygiene Fundamentals',
      learningOutcome: 'Understand the basic principles of food hygiene and their importance in preventing foodborne illness.',
      assessmentCriteria: [
        'Describe the four Cs of food hygiene',
        'Identify common foodborne bacteria and their sources',
        'Explain the importance of hand hygiene in food preparation',
      ],
      content: [
        {
          heading: 'The Four Cs of Food Hygiene',
          paragraphs: [
            'Food hygiene is about preventing foodborne illness through safe handling, preparation, and storage of food. The UK Food Standards Agency promotes four key principles — the "Four Cs" — as the foundation of safe food practice.',
          ],
          imageUrl: ch1FourCs,
          imageAlt: 'Four Cs of food hygiene diagram',
          bullets: [
            'Cleaning — Wash hands, utensils, and surfaces regularly. Always wash hands before handling food and after handling raw meat',
            'Cooking — Ensure food is cooked thoroughly to kill harmful bacteria. Use a food thermometer when possible',
            'Chilling — Keep perishable foods below 5°C. Refrigerate leftovers within 2 hours of cooking',
            'Cross-contamination — Prevent raw food (especially meat) from coming into contact with ready-to-eat food',
          ],
        },
        {
          heading: 'Common Foodborne Bacteria',
          imageUrl: ch1Bacteria,
          imageAlt: 'Common foodborne bacteria — Salmonella, Campylobacter, E. coli, Listeria, Staphylococcus',
          bullets: [
            'Salmonella — Found in raw poultry, eggs, and meat. Causes diarrhoea, fever, and abdominal cramps. Killed by thorough cooking',
            'Campylobacter — The most common cause of food poisoning in the UK. Found in raw poultry. Prevented by thorough cooking and avoiding cross-contamination',
            'E. coli — Found in undercooked beef, raw milk, and contaminated water. Some strains cause severe illness',
            'Listeria — Found in unpasteurised dairy, pâté, and pre-prepared salads. Particularly dangerous during pregnancy',
            'Staphylococcus aureus — Spread by hand contact. Produces toxins in food left at room temperature',
          ],
        },
        {
          heading: 'Hand Hygiene',
          paragraphs: [
            'Handwashing is the single most effective way to prevent the spread of foodborne bacteria. Wash hands with warm water and soap for at least 20 seconds — before preparing food, after handling raw meat, after using the toilet, and after touching bins or pets.',
          ],
        },
      ],
      unbreakableInsight: 'Food hygiene is not glamorous, but food poisoning is not either. The basics — clean hands, proper cooking, correct storage — protect you and everyone you cook for.',
      coachNote: 'Make food hygiene automatic. It takes seconds to wash your hands and minutes to check cooking temperatures. These habits prevent days of illness.',
      practicalTask: {
        title: 'Kitchen Hygiene Audit',
        instructions: 'Conduct an audit of your kitchen. Check handwashing availability, fridge temperature, chopping board separation, and general cleanliness.',
        reflectionQuestions: [
          'Is your fridge at or below 5°C?',
          'Do you use separate chopping boards for raw meat and ready-to-eat food?',
          'How consistently do you wash your hands before food preparation?',
        ],
      },
    },
    {
      number: 2,
      title: 'Food Storage & Temperatures',
      learningOutcome: 'Understand safe food storage practices and the importance of temperature control in preventing bacterial growth.',
      assessmentCriteria: [
        'State safe temperature ranges for refrigeration, freezing, and cooking',
        'Explain the "danger zone" for bacterial growth',
        'Describe best practices for storing different food types',
      ],
      content: [
        {
          heading: 'The Temperature Danger Zone',
          paragraphs: [
            'Bacteria multiply most rapidly between 8°C and 63°C — this is known as the "danger zone." Food should spend as little time as possible in this range. Below 5°C, bacterial growth slows significantly. Above 75°C, most harmful bacteria are killed.',
          ],
          imageUrl: ch2TemperatureZones,
          imageAlt: 'Food temperature danger zones diagram',
          bullets: [
            'Fridge — 0–5°C (slows bacterial growth)',
            'Freezer — -18°C or below (stops bacterial growth but does not kill bacteria)',
            'Danger zone — 8–63°C (rapid bacterial multiplication)',
            'Safe cooking temperature — Core temperature of 75°C for at least 2 minutes',
            'Hot holding — Food kept hot should remain above 63°C',
          ],
        },
        {
          heading: 'Storage Best Practices',
          imageUrl: ch2Storage,
          imageAlt: 'Fridge storage diagram showing proper shelf arrangement and temperature',
          bullets: [
            'Raw meat — Store on the bottom shelf of the fridge in sealed containers to prevent dripping onto other food',
            'Ready-to-eat food — Store above raw food in the fridge',
            'Leftovers — Cool to room temperature within 2 hours, then refrigerate. Consume within 2 days',
            'Frozen food — Label with date. Most foods safe indefinitely when frozen but quality declines over time',
            'Dry goods — Store in cool, dry places in sealed containers. Check use-by dates',
            'Opened tins — Transfer contents to a sealed container before refrigerating',
          ],
        },
        {
          heading: 'Use-By vs Best-Before',
          paragraphs: [
            'Use-by dates relate to food safety — do not eat food past its use-by date, even if it looks and smells fine. Best-before dates relate to quality — food may still be safe after this date but may not be at its best.',
          ],
        },
      ],
      unbreakableInsight: 'Temperature is the invisible line between safe food and food poisoning. A cheap fridge thermometer is one of the best investments you can make for your kitchen.',
      coachNote: 'Check your fridge temperature today. If it\'s above 5°C, adjust it. This single action reduces your food poisoning risk significantly.',
      practicalTask: {
        title: 'Temperature Check',
        instructions: 'Check the temperature of your fridge and freezer using a thermometer. Review how you store raw meat, leftovers, and opened packaging.',
        reflectionQuestions: [
          'Is your fridge at or below 5°C?',
          'Are raw and cooked foods stored separately?',
          'Do you follow the 2-hour rule for cooling and refrigerating leftovers?',
        ],
      },
    },
    {
      number: 3,
      title: 'Cross-Contamination',
      learningOutcome: 'Understand how cross-contamination occurs and how to prevent it in domestic and professional settings.',
      assessmentCriteria: [
        'Define cross-contamination and explain how it occurs',
        'Identify high-risk situations for cross-contamination',
        'Describe practical measures to prevent cross-contamination',
      ],
      content: [
        {
          heading: 'What Is Cross-Contamination?',
          paragraphs: [
            'Cross-contamination occurs when harmful bacteria are transferred from one food or surface to another. This is one of the most common causes of foodborne illness and is entirely preventable with proper practices.',
            'The most dangerous form is the transfer of bacteria from raw food (especially meat, poultry, and fish) to ready-to-eat food (salads, bread, cooked food). This can happen through direct contact, via hands, or through shared utensils and surfaces.',
          ],
          imageUrl: ch3CrossContamination,
          imageAlt: 'Cross-contamination pathways diagram',
        },
        {
          heading: 'High-Risk Situations',
          bullets: [
            'Using the same chopping board for raw meat and salad without washing',
            'Handling raw meat then touching ready-to-eat food without washing hands',
            'Storing raw meat above ready-to-eat food in the fridge (dripping)',
            'Using the same knife for raw and cooked food',
            'Not cleaning surfaces between preparing different food types',
            'Washing raw chicken — splashes can spread bacteria up to 3 feet from the sink',
          ],
        },
        {
          heading: 'Prevention Measures',
          imageUrl: ch3Prevention,
          imageAlt: 'Four cross-contamination prevention measures with colour-coded chopping boards',
          bullets: [
            'Use colour-coded chopping boards (red for raw meat, green for salad/veg)',
            'Wash hands thoroughly after handling raw food',
            'Clean and sanitise surfaces between tasks',
            'Store raw meat on the lowest shelf in the fridge',
            'Use separate utensils for raw and cooked food',
            'Never wash raw poultry — cooking kills bacteria; washing spreads it',
          ],
        },
      ],
      unbreakableInsight: 'Cross-contamination is invisible and odourless. You cannot see, smell, or taste the bacteria that make you ill. Prevention is the only strategy.',
      coachNote: 'Colour-coded chopping boards are cheap and effective. If you take one food safety lesson from this course, make it this: separate raw and ready-to-eat food at all times.',
      practicalTask: {
        title: 'Cross-Contamination Risk Assessment',
        instructions: 'Observe your next cooking session. Note every point where cross-contamination could occur and what you did (or didn\'t do) to prevent it.',
        reflectionQuestions: [
          'How many potential cross-contamination points did you identify?',
          'Do you use separate chopping boards for raw meat and vegetables?',
          'What one change would most reduce your cross-contamination risk?',
        ],
      },
    },
    {
      number: 4,
      title: 'Reading Food Labels',
      learningOutcome: 'Understand how to read and interpret UK food labels to make informed dietary choices.',
      assessmentCriteria: [
        'Identify the mandatory information on a UK food label',
        'Interpret the traffic light nutrition labelling system',
        'Use label information to compare similar products',
      ],
      content: [
        {
          heading: 'Mandatory Label Information',
          paragraphs: [
            'UK food law requires pre-packaged foods to display specific information to help consumers make informed choices. Understanding this information is a fundamental nutrition skill.',
          ],
          imageUrl: ch4FoodLabels,
          imageAlt: 'Annotated food label diagram',
          bullets: [
            'Product name and description',
            'Ingredients list — Listed in descending order by weight. The first ingredient is the most abundant',
            'Nutrition information — Per 100 g and often per serving. Must include energy, fat, saturates, carbohydrate, sugars, protein, and salt',
            'Allergen information — 14 major allergens must be highlighted (usually in bold)',
            'Use-by or best-before date',
            'Storage and preparation instructions',
            'Net weight or volume',
            'Manufacturer/retailer details',
          ],
        },
        {
          heading: 'Traffic Light Labels',
          imageUrl: ch4TrafficLight,
          imageAlt: 'UK traffic light food label system showing red, amber, and green indicators',
          paragraphs: [
            'The UK front-of-pack traffic light system uses colour coding to show at a glance whether a food is high (red), medium (amber), or low (green) in fat, saturated fat, sugar, and salt per serving or per 100 g.',
            'While voluntary, most major UK supermarkets use this system. It is a quick way to compare products without reading the full nutrition panel.',
          ],
          bullets: [
            'Green — Low. Choose freely',
            'Amber — Medium. Fine as part of a balanced diet',
            'Red — High. Eat less often and in smaller amounts',
            'Tip: Compare the "per 100 g" column when comparing different products, as serving sizes vary',
          ],
        },
        {
          heading: 'Common Label Pitfalls',
          bullets: [
            'Misleading serving sizes — A "serving" may be unrealistically small',
            '"Low fat" often means high sugar (and vice versa)',
            '"Natural" and "wholesome" have no legal definition',
            '"No added sugar" may still contain natural sugars or sweeteners',
            'Check the ingredients list — if sugar appears in the first three ingredients, the product is sugar-heavy',
          ],
        },
      ],
      unbreakableInsight: 'The front of the packet is marketing. The back of the packet is truth. Learn to read the ingredients list and nutrition panel — that is where the real information lives.',
      coachNote: 'Spend 30 seconds reading labels when shopping. Over time, you will know which products align with your goals without needing to check every time.',
      practicalTask: {
        title: 'Label Reading Exercise',
        instructions: 'Compare the nutrition labels of two similar products (e.g., two brands of yoghurt, cereal, or bread). Note the differences in calories, protein, sugar, and fibre per 100 g.',
        reflectionQuestions: [
          'Which product was more nutrient-dense per 100 g?',
          'Were there any surprising differences between the two products?',
          'How useful did you find the traffic light labelling?',
        ],
      },
    },
    {
      number: 5,
      title: 'Shopping on a Budget',
      learningOutcome: 'Understand strategies for eating nutritiously on a limited budget.',
      assessmentCriteria: [
        'Identify cost-effective nutrient-dense food sources',
        'Describe strategies for reducing food waste',
        'Plan a balanced weekly shop within a budget',
      ],
      content: [
        {
          heading: 'Healthy Eating Doesn\'t Have to Be Expensive',
          paragraphs: [
            'One of the most common barriers to healthy eating is the perception that it costs more. While some nutrient-dense foods are expensive, many are among the cheapest items in the supermarket. The key is knowing which foods offer the best nutritional value per pound.',
          ],
          imageUrl: ch5BudgetShopping,
          imageAlt: 'Cost per gram of protein comparison',
        },
        {
          heading: 'Budget-Friendly Nutrient-Dense Foods',
          imageUrl: ch5BudgetFoods,
          imageAlt: 'Budget-friendly nutrient-dense foods grid with cost per serving',
          bullets: [
            'Eggs — One of the cheapest complete protein sources. Versatile and nutritious',
            'Tinned fish (tuna, sardines, mackerel) — Affordable protein and omega-3s',
            'Lentils, beans, and chickpeas (dried or tinned) — Extremely cheap protein and fibre',
            'Frozen vegetables — Same nutritional value as fresh, longer shelf life, lower cost',
            'Oats — Cheap, high-fibre, filling breakfast staple',
            'Whole milk — Affordable source of protein, calcium, and calories',
            'Bananas — The cheapest fruit per portion',
            'Rice and pasta — Inexpensive energy sources. Buy in bulk',
            'Chicken thighs — Cheaper than breast, more flavourful, good protein source',
            'Seasonal produce — Buy what\'s in season for lower prices and better flavour',
          ],
        },
        {
          heading: 'Reducing Food Waste',
          bullets: [
            'Plan meals before shopping — buy only what you need',
            'Use a shopping list and stick to it',
            'Store food correctly to extend shelf life',
            'Use frozen options for vegetables, fruit, and fish',
            'Batch cook and freeze portions for later',
            'Use "use by" dates for safety, "best before" for quality only',
            'Get creative with leftovers — soups, stews, and stir-fries use up miscellaneous ingredients',
          ],
        },
      ],
      unbreakableInsight: 'Expensive food does not equal better nutrition. Eggs, lentils, frozen veg, and oats will outperform most overpriced "superfoods" for a fraction of the cost.',
      coachNote: 'Building a healthy diet on a budget is a skill. Start with a core list of cheap staples and build variety around them as your confidence grows.',
      practicalTask: {
        title: 'Budget Meal Plan',
        instructions: 'Plan three days of balanced meals spending no more than £15 total. Use the budget-friendly foods listed above as your foundation.',
        reflectionQuestions: [
          'Were you able to hit reasonable nutrition targets within the budget?',
          'Which budget-friendly foods offered the best value?',
          'How does this compare to your current weekly food spend?',
        ],
      },
    },
    {
      number: 6,
      title: 'Batch Cooking & Meal Prep',
      learningOutcome: 'Understand the principles of batch cooking and meal preparation for consistent, efficient healthy eating.',
      assessmentCriteria: [
        'Explain the benefits of meal preparation for nutrition consistency',
        'Describe safe batch cooking and storage practices',
        'Plan a basic batch cooking session',
      ],
      content: [
        {
          heading: 'Why Meal Prep Works',
          paragraphs: [
            'Meal preparation is the practice of cooking and portioning meals in advance — typically for 3–5 days. It removes the daily decision of "what should I eat?" and replaces it with a ready-made healthy option.',
            "The biggest benefit is consistency. When healthy food is ready and accessible, you eat it. When it isn\'t, you reach for convenience options that are often higher in calories and lower in nutrients.",
          ],
          imageUrl: ch6BatchCooking,
          imageAlt: 'Batch cooking workflow diagram',
        },
        {
          heading: 'Batch Cooking Fundamentals',
          imageUrl: ch6BatchFundamentals,
          imageAlt: 'Four-step batch cooking process — plan, shop, cook, store',
          bullets: [
            'Choose 2–3 protein sources to cook in bulk (e.g., chicken thighs, mince, lentils)',
            'Prepare 2–3 carbohydrate bases (rice, sweet potato, pasta)',
            'Wash and chop vegetables for the week',
            'Cook sauces or dressings in advance',
            'Portion into containers — glass containers are reusable and microwave-safe',
            'Label with date and contents',
          ],
        },
        {
          heading: 'Safe Storage Guidelines',
          bullets: [
            'Cool cooked food within 2 hours before refrigerating',
            'Refrigerated meals — consume within 3–4 days',
            'Frozen meals — safe indefinitely but best within 3 months for quality',
            'Reheat food to 75°C throughout before eating',
            'Only reheat food once',
            'Do not re-freeze previously frozen food that has been thawed',
          ],
        },
        {
          heading: 'Getting Started',
          paragraphs: [
            'Start small. You do not need to prep every meal for the entire week on day one. Begin with preparing lunches for the working week — this single habit eliminates five daily decisions and saves money compared to buying lunch out.',
          ],
        },
      ],
      unbreakableInsight: 'The meal you prepared on Sunday is the meal you eat on Wednesday — instead of the takeaway you would have ordered because you were tired and had nothing ready.',
      coachNote: 'Set aside 1–2 hours on a Sunday to batch cook your protein and carbohydrate bases. This one habit will do more for your nutrition consistency than any supplement.',
      practicalTask: {
        title: 'First Batch Cook',
        instructions: 'Complete a batch cooking session to prepare at least 4 meals. Choose one protein, one carbohydrate, and prepare vegetables. Portion into containers and refrigerate or freeze.',
        reflectionQuestions: [
          'How long did the batch cooking session take?',
          'How did having pre-prepared meals affect your eating during the week?',
          'What would you change for your next batch cooking session?',
        ],
      },
    },
    {
      number: 7,
      title: 'Meal Prep Fundamentals',
      learningOutcome: 'Develop practical skills for efficient meal preparation including time management and recipe adaptation.',
      assessmentCriteria: [
        'Plan a weekly meal prep schedule',
        'Adapt recipes for batch preparation',
        'Manage kitchen time efficiently during meal prep',
      ],
      content: [
        {
          heading: 'Planning Your Prep',
          paragraphs: [
            'Successful meal prep starts with a plan. Before you cook, decide what you will eat for the week, write a shopping list, and organise your kitchen. This preparation saves time, money, and stress.',
          ],
          imageUrl: ch7MealPrep,
          imageAlt: 'Weekly meal planning template',
          bullets: [
            'Review your schedule for the week — which days are busiest?',
            'Choose recipes that share ingredients to reduce waste and cost',
            'Write a shopping list based on your plan',
            'Prep on a consistent day each week (Sunday is most common)',
            'Start with simple recipes and build complexity over time',
          ],
        },
        {
          heading: 'Time-Efficient Cooking',
          imageUrl: ch7CookingMethods,
          imageAlt: 'Time-efficient cooking methods — sheet pan, slow cooker, one pot, stir-fry',
          bullets: [
            'Use the oven for multiple items at once (roast veg, bake chicken, cook sweet potato)',
            'While the oven is on, use the hob for rice, pasta, or sauces',
            'Use a slow cooker for hands-off cooking',
            'Cut all vegetables first, then all proteins, to minimise switching',
            'Clean as you go to avoid a mountain of washing up at the end',
          ],
        },
        {
          heading: 'Adapting Recipes for Bulk',
          paragraphs: [
            'Most recipes can be doubled or tripled for meal prep. The key is adjusting cooking times and liquid quantities. Soups, stews, curries, and casseroles scale up most easily. Stir-fries are harder to scale because they require high heat and small batches.',
          ],
          bullets: [
            'Soups and stews — Scale easily. Freeze in individual portions',
            'Curries — Double the recipe and freeze half',
            'Grains (rice, quinoa) — Cook a large batch and portion out',
            'Proteins — Roast or grill in bulk, slice and distribute',
            'Salads — Prep components separately and assemble when eating',
          ],
        },
      ],
      unbreakableInsight: 'The most valuable meal prep skill is not cooking — it is planning. The cooking is easy. Deciding what to cook, shopping for it, and scheduling the time — that is where most people fail.',
      coachNote: 'Keep your first few weeks of meal prep simple. Three recipes, repeated. Once the habit is locked in, you can start experimenting with variety.',
      practicalTask: {
        title: 'Weekly Meal Plan',
        instructions: 'Plan a full week of meals, create a shopping list, and schedule a meal prep session. Execute the plan and note what worked and what didn\'t.',
        reflectionQuestions: [
          'Did planning in advance reduce decision fatigue during the week?',
          'How much time did you spend on meal prep compared to daily cooking?',
          'What meals worked best for prep and which didn\'t store well?',
        ],
      },
    },
    {
      number: 8,
      title: 'Kitchen Safety',
      learningOutcome: 'Understand essential kitchen safety principles to prevent accidents and injuries during food preparation.',
      assessmentCriteria: [
        'Identify common kitchen hazards and how to prevent them',
        'Describe safe knife handling techniques',
        'Explain basic first aid for common kitchen injuries',
      ],
      content: [
        {
          heading: 'Common Kitchen Hazards',
          paragraphs: [
            'The kitchen is one of the most common locations for domestic accidents. Understanding potential hazards and how to prevent them is an essential life skill — whether you are cooking for yourself or for others.',
          ],
          imageUrl: ch8KitchenSafety,
          imageAlt: 'Kitchen safety hazards diagram',
          bullets: [
            'Burns and scalds — The most common kitchen injury. Use oven gloves, turn pan handles inward, and be cautious with steam',
            'Cuts — Caused by knives, broken glass, and tin lids. Keep knives sharp (dull knives slip more) and use a stable chopping board',
            'Slips and falls — Clean spills immediately. Do not leave obstacles on the floor',
            'Fire — Never leave cooking unattended. Keep a fire blanket accessible. Never use water on an oil fire',
            'Electrical hazards — Keep electrical appliances away from water. Check cables for damage',
          ],
        },
        {
          heading: 'Safe Knife Handling',
          imageUrl: ch8KnifeSafety,
          imageAlt: 'Safe knife handling rules with claw grip, carry, and washing guidelines',
          bullets: [
            'Always cut on a stable chopping board',
            'Use the "claw grip" — curl your fingers to protect them while holding food',
            'Keep knives sharp — a sharp knife is safer than a dull one',
            'Never try to catch a falling knife — step back and let it fall',
            'Carry a knife with the blade pointing downward, close to your body',
            'Wash knives separately — never leave them submerged in soapy water where they cannot be seen',
          ],
        },
        {
          heading: 'Basic Kitchen First Aid',
          bullets: [
            'Minor burns — Run cool (not cold) water over the area for at least 20 minutes. Do not apply butter or ice',
            'Cuts — Apply pressure with a clean cloth. Clean with water. Apply a blue plaster (visible if it falls into food)',
            'Oil splashes — Cool the area with running water. Seek medical attention for severe burns',
            'Fire — Turn off heat source. Use a fire blanket or damp cloth for small pan fires. Call 999 if it escalates',
          ],
        },
      ],
      unbreakableInsight: 'A confident cook is a safe cook. Learn proper technique, maintain your tools, and respect the kitchen. It is a workspace, not a playground.',
      coachNote: 'Invest in a good knife, a stable chopping board, and basic safety equipment (fire blanket, first aid kit). These are non-negotiable kitchen essentials.',
      practicalTask: {
        title: 'Kitchen Safety Check',
        instructions: 'Conduct a safety audit of your kitchen. Check for fire safety equipment, proper knife storage, clear work surfaces, and electrical safety.',
        reflectionQuestions: [
          'Do you have a fire blanket or extinguisher accessible?',
          'Are your knives stored safely and in good condition?',
          'What is the biggest safety improvement you could make in your kitchen?',
        ],
      },
    },
  ],
};

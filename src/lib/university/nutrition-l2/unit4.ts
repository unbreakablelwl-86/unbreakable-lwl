import { getUniversityImage } from '@/lib/university/imageMap';
import type { Unit } from '../types';

export const nutritionL2Unit4: Unit = {
  number: 4,
  title: 'Planning Balanced Diets',
  description: 'Apply your nutritional knowledge to set goals, track your intake, plan meals, and build sustainable eating habits that last.',
  chapters: [
    {
      number: 1,
      title: 'SMART Nutrition Goals',
      learningOutcome: 'Understand how to set effective, achievable nutrition goals using the SMART framework.',
      assessmentCriteria: [
        'Define each component of a SMART goal',
        'Apply the SMART framework to nutrition-specific objectives',
        'Differentiate between outcome goals and process goals',
      ],
      content: [
        {
          heading: 'What Are SMART Goals?',
          paragraphs: [
            'SMART goals provide structure and clarity to your nutrition objectives. Without clear goals, improvement is vague, unmeasurable, and difficult to sustain. The SMART framework turns "I want to eat better" into an actionable plan.',
          ],
          imageUrl: getUniversityImage('nutl2-u4-ch1-smart-goals'),
          imageAlt: 'SMART goal framework diagram',
          bullets: [
            'Specific — "Eat 30 grams of protein at breakfast" rather than "eat more protein"',
            'Measurable — You can objectively verify whether you achieved it',
            'Achievable — Realistic given your current lifestyle, budget, and skills',
            'Relevant — Aligned with your overall health and performance goals',
            'Time-bound — Has a deadline or review point (e.g., "for the next 4 weeks")',
          ],
        },
        {
          heading: 'Outcome Goals vs Process Goals',
          paragraphs: [
            'Outcome goals focus on results — "Lose 5 kg" or "Reduce body fat to 15%." These are useful for direction but are not fully within your control. Process goals focus on behaviours — "Eat 5 portions of vegetables daily" or "Meal prep every Sunday." These are within your control and drive the outcomes.',
            'The most effective approach combines both: set an outcome goal for direction, then build process goals that lead to it.',
          ],
          bullets: [
            'Outcome goal — "Reduce body fat over 12 weeks"',
            'Process goal — "Track calories 5 days per week"',
            'Process goal — "Eat protein at every meal"',
            'Process goal — "Drink 2 litres of water daily"',
          ],
        },
      ],
      unbreakableInsight: 'Goals without a plan are just wishes. Be specific about what you will do, measure whether you are doing it, and adjust when you are not.',
      coachNote: 'Start with one process goal at a time. Master it before adding another. Stacking too many new habits at once leads to failure.',
      practicalTask: {
        title: 'SMART Goal Setting',
        instructions: 'Write one outcome goal and three process goals for your nutrition over the next four weeks. Ensure each process goal meets all five SMART criteria.',
        reflectionQuestions: [
          'Is your outcome goal realistic for a four-week timeframe?',
          'Are your process goals specific and measurable?',
          'Which process goal will have the biggest impact on your outcome?',
        ],
      },
    },
    {
      number: 2,
      title: 'Understanding Calories',
      learningOutcome: 'Understand the concept of energy balance and how calories relate to body weight management.',
      assessmentCriteria: [
        'Define energy balance and its components',
        'Explain TDEE and how it is estimated',
        'Describe the relationship between caloric intake and body weight',
      ],
      content: [
        {
          heading: 'Energy Balance',
          paragraphs: [
            'Energy balance is the relationship between the calories you consume (energy in) and the calories you burn (energy out). This fundamental principle determines whether you gain, lose, or maintain body weight over time.',
            'A caloric surplus (eating more than you burn) leads to weight gain. A caloric deficit (eating less than you burn) leads to weight loss. Maintenance occurs when intake matches expenditure.',
          ],
          imageUrl: getUniversityImage('nutl2-u4-ch2-understanding-calories'),
          imageAlt: 'Energy balance diagram',
        },
        {
          heading: 'Components of Energy Expenditure',
          bullets: [
            'Basal Metabolic Rate (BMR) — The calories your body burns at complete rest to maintain basic functions (breathing, circulation, cell repair). Accounts for 60–70% of total expenditure',
            'Non-Exercise Activity Thermogenesis (NEAT) — Calories burned through daily movement that isn\'t structured exercise (walking, fidgeting, standing). Accounts for 15–30%',
            'Thermic Effect of Food (TEF) — Energy used to digest, absorb, and process food. Approximately 10% of intake. Protein has the highest TEF',
            'Exercise Activity Thermogenesis (EAT) — Calories burned during structured exercise. Typically 5–10% of total expenditure for most people',
          ],
        },
        {
          heading: 'Estimating Your Needs',
          paragraphs: [
            'Total Daily Energy Expenditure (TDEE) can be estimated using equations like Mifflin-St Jeor, which calculates BMR based on your weight, height, age, and sex, then multiplies by an activity factor. These are estimates — real-world testing through tracking and monitoring is needed for accuracy.',
          ],
        },
      ],
      unbreakableInsight: 'Calories are not the only thing that matters — but they are the thing that matters most for weight change. You cannot out-train a bad diet, and you cannot ignore energy balance.',
      coachNote: 'Understand calories as a compass, not a cage. Awareness of your energy balance guides better decisions without requiring obsessive tracking.',
      practicalTask: {
        title: 'TDEE Estimation',
        instructions: 'Calculate your estimated TDEE using an online calculator (Mifflin-St Jeor equation). Compare this to your actual intake for one day.',
        reflectionQuestions: [
          'Is your estimated TDEE higher or lower than expected?',
          'How does your actual intake compare to your estimated needs?',
          'What component of energy expenditure do you think you could increase most easily?',
        ],
      },
    },
    {
      number: 3,
      title: 'Introduction to Macro Tracking',
      learningOutcome: 'Understand the basics of tracking macronutrient intake and when it is useful.',
      assessmentCriteria: [
        'Explain what macro tracking involves',
        'Describe tools and methods for tracking macronutrients',
        'Identify when tracking is beneficial and when it may not be appropriate',
      ],
      content: [
        {
          heading: 'What Is Macro Tracking?',
          paragraphs: [
            'Macro tracking involves recording the grams of protein, carbohydrates, and fat you consume each day. It provides a detailed picture of your nutritional intake and helps ensure you are eating in line with your goals.',
            'Tracking is a skill — not a lifestyle. Most people benefit from periods of tracking to build awareness, learn portion sizes, and understand their eating patterns. It does not need to be permanent.',
          ],
          imageUrl: getUniversityImage('nutl2-u4-ch3-macro-tracking'),
          imageAlt: 'Macro tracking interface diagram',
        },
        {
          heading: 'Methods and Tools',
          bullets: [
            'Apps — MyFitnessPal, Cronometer, and similar apps have large food databases and barcode scanning',
            'Food scales — Weighing food is the most accurate method but not always practical',
            'Hand portions — Less precise but practical for situations where tracking isn\'t possible',
            'Food diary — Writing down what you eat increases awareness even without calculating macros',
          ],
        },
        {
          heading: 'When Tracking Helps',
          bullets: [
            'Learning phase — Building an understanding of what foods contain which macros',
            'Specific goals — Cutting, bulking, or competition preparation',
            'Plateau breaking — Identifying where your intake may be off',
            'Accountability — Keeping yourself honest about portions and food choices',
          ],
        },
        {
          heading: 'When Tracking May Not Be Appropriate',
          bullets: [
            'History of eating disorders or disordered eating patterns',
            'When it creates anxiety, obsession, or an unhealthy relationship with food',
            'When it adds stress without improving outcomes',
            'Long-term — Most people do not need to track indefinitely; the goal is to develop intuitive portion awareness',
          ],
        },
      ],
      unbreakableInsight: 'Tracking is a tool, not a test. Use it to learn, not to punish yourself. The goal is to eat well without needing to track forever.',
      coachNote: 'Track for 2–4 weeks to build awareness. After that, most people can shift to intuitive eating with periodic check-ins when needed.',
      practicalTask: {
        title: 'One-Day Track',
        instructions: 'Track everything you eat and drink for one full day using an app or food diary. Note your total calories, protein, carbohydrates, and fat.',
        reflectionQuestions: [
          'Were your macros close to recommended targets for your goals?',
          'Which macronutrient were you most over or under on?',
          'Did the experience feel informative or stressful?',
        ],
      },
    },
    {
      number: 4,
      title: 'Meal Planning Principles',
      learningOutcome: 'Understand the principles of effective meal planning for consistent, balanced nutrition.',
      assessmentCriteria: [
        'Describe the benefits of meal planning',
        'Explain how to structure a weekly meal plan',
        'Identify strategies for maintaining flexibility within a plan',
      ],
      content: [
        {
          heading: 'Why Plan Meals?',
          paragraphs: [
            'Meal planning is the bridge between nutritional knowledge and daily practice. Without a plan, even the most knowledgeable person defaults to convenience — and convenience rarely aligns with health goals.',
            'Planning reduces decision fatigue, saves money, minimises food waste, and ensures consistent nutrient intake. It does not mean eating the same thing every day — it means having a framework that makes healthy eating the default.',
          ],
          imageUrl: getUniversityImage('nutl2-u4-ch4-meal-planning'),
          imageAlt: 'Meal planning benefits diagram',
        },
        {
          heading: 'Building a Weekly Plan',
          bullets: [
            'Start with protein — decide your protein source for each main meal first',
            'Add carbohydrates — match to your energy needs and training schedule',
            'Include vegetables — aim for variety in colour and type across the week',
            'Plan snacks — prevent unplanned snacking by having healthy options ready',
            'Allow flexibility — plan 5 days tightly and leave 2 days flexible for social eating, leftovers, or eating out',
            'Batch-friendly meals — include at least 2–3 meals that can be prepared in bulk',
          ],
        },
        {
          heading: 'Maintaining Flexibility',
          paragraphs: [
            'A meal plan should serve you — not imprison you. The 80/20 rule applies: if 80% of your meals are planned and nutritious, the remaining 20% can be flexible without derailing progress. Plans that are too rigid are abandoned; plans with built-in flexibility are sustainable.',
          ],
        },
      ],
      unbreakableInsight: 'Planning is not about perfection. It is about making the healthy choice the easy choice. When your meals are decided in advance, willpower becomes irrelevant.',
      coachNote: 'Your meal plan should be boring enough to follow and varied enough to enjoy. Find the balance between structure and flexibility.',
      practicalTask: {
        title: 'Weekly Meal Plan',
        instructions: 'Create a 7-day meal plan that includes breakfast, lunch, dinner, and one snack. Plan 5 days tightly and leave 2 days flexible. Create a corresponding shopping list.',
        reflectionQuestions: [
          'Does your plan provide balanced nutrition across the week?',
          'Is it realistic given your schedule, budget, and cooking skills?',
          'How does having a plan affect your confidence about eating well?',
        ],
      },
    },
    {
      number: 5,
      title: 'Eating Out Strategies',
      learningOutcome: 'Understand how to make informed food choices when eating out or ordering takeaway.',
      assessmentCriteria: [
        'Describe strategies for maintaining nutritional goals when dining out',
        'Identify hidden calories in restaurant and takeaway meals',
        'Explain how to balance social eating with health goals',
      ],
      content: [
        {
          heading: 'The Challenge of Eating Out',
          paragraphs: [
            'Restaurant and takeaway meals are typically higher in calories, fat, sugar, and salt than home-cooked equivalents. Portions are larger, cooking methods use more fat, and sauces add hidden calories. However, eating out is a normal part of social life and does not need to derail your nutrition.',
            'The goal is not to avoid eating out — it is to make better choices when you do.',
          ],
          imageUrl: getUniversityImage('nutl2-u4-ch5-eating-out'),
          imageAlt: 'Restaurant meal calorie comparison',
        },
        {
          heading: 'Strategies for Smarter Choices',
          bullets: [
            'Check the menu in advance — decide what to order before you arrive to avoid impulsive choices',
            'Prioritise protein — choose grilled, baked, or steamed protein sources over fried',
            'Ask for sauces and dressings on the side — they often add 200–400 calories',
            'Choose one indulgence — starter OR dessert OR alcohol, not all three',
            'Share sides or starters to reduce total intake',
            'Drink water alongside any alcoholic drinks',
            'Don\'t arrive starving — have a small protein-rich snack before going out',
          ],
        },
        {
          heading: 'Hidden Calorie Traps',
          bullets: [
            'Salad dressings — Can add 300+ calories to an otherwise healthy salad',
            'Bread baskets — Easy to consume 400+ calories before the meal arrives',
            'Sugary cocktails — A single cocktail can contain 300–500 calories',
            'Side dishes — Chips, onion rings, and creamy sides add significant calories',
            'Portion sizes — Restaurant portions are often 50–100% larger than home servings',
          ],
        },
      ],
      unbreakableInsight: 'One meal out does not ruin your progress. One meal out every day might. The key is frequency and awareness — enjoy social eating without losing sight of your goals.',
      coachNote: 'Never make someone feel guilty for eating out. Instead, teach them to make slightly better choices each time. Small improvements compound over weeks and months.',
      practicalTask: {
        title: 'Restaurant Strategy',
        instructions: 'Choose a restaurant you enjoy and review their menu online. Plan a meal that balances enjoyment with nutritional awareness. Estimate the calorie and macro content.',
        reflectionQuestions: [
          'What strategies did you use to make a better choice?',
          'How did the estimated calories compare to your daily target?',
          'Could you apply these strategies consistently when eating out?',
        ],
      },
    },
    {
      number: 6,
      title: 'Common Diet Myths',
      learningOutcome: 'Identify and debunk common nutrition myths using evidence-based reasoning.',
      assessmentCriteria: [
        'Identify at least five common nutrition myths',
        'Explain the evidence against each myth',
        'Describe how to evaluate nutrition claims critically',
      ],
      content: [
        {
          heading: 'Why Myths Persist',
          paragraphs: [
            'Nutrition is surrounded by misinformation — from social media influencers, tabloid headlines, and well-meaning but uninformed advice. Myths persist because they offer simple answers to complex questions and because the nutrition industry profits from confusion.',
            'Critical thinking is your best defence. Always ask: "What is the evidence?" and "Who benefits from this claim?"',
          ],
          imageUrl: getUniversityImage('nutl2-u4-ch6-diet-myths'),
          imageAlt: 'Nutrition myths vs facts comparison',
        },
        {
          heading: 'Common Myths Debunked',
          bullets: [
            'Myth: "Carbs make you fat." Fact: Excess calories cause fat gain, not any single macronutrient. Carbohydrates are your body\'s preferred fuel source',
            'Myth: "You need to eat every 2–3 hours to boost metabolism." Fact: Meal frequency has minimal effect on metabolic rate. Total daily intake matters most',
            'Myth: "Eating late at night causes weight gain." Fact: It is total calories over 24 hours that matter, not when you eat them',
            'Myth: "Detox diets cleanse your body." Fact: Your liver and kidneys detoxify your body continuously. No juice or supplement does this better',
            'Myth: "Fat-free means healthy." Fact: Fat-free products often replace fat with sugar. Read the full nutrition label',
            'Myth: "Protein shakes are necessary for muscle growth." Fact: Whole food protein sources are equally effective. Supplements are convenient, not superior',
            'Myth: "You need 8 glasses of water a day." Fact: Fluid needs vary by individual. All fluids count, including tea, coffee, and food',
            'Myth: "Superfoods will transform your health." Fact: No single food is magic. Overall dietary pattern matters more than any individual ingredient',
          ],
        },
        {
          heading: 'Evaluating Nutrition Claims',
          bullets: [
            'Check the source — Is it from a peer-reviewed study or a social media post?',
            'Look for consensus — Does the claim align with mainstream scientific evidence?',
            'Follow the money — Who is selling something based on this claim?',
            'Beware of absolutes — "Always" and "never" claims are almost always wrong in nutrition',
            'Consider the context — Individual studies can be misleading without broader context',
          ],
        },
      ],
      unbreakableInsight: 'If a nutrition claim sounds too good or too simple to be true, it probably is. Real nutrition science is nuanced, boring, and rarely makes a good social media post.',
      coachNote: 'The best way to combat myths is with knowledge. The more you understand the fundamentals, the harder it is to be misled by trends and marketing.',
      practicalTask: {
        title: 'Myth Busting',
        instructions: 'Find three nutrition claims on social media or in a magazine. Research the evidence behind each claim and determine whether it is supported, partially supported, or debunked.',
        reflectionQuestions: [
          'Were the claims backed by credible evidence?',
          'What made the claims appealing despite lacking evidence?',
          'How will this exercise change how you evaluate nutrition information?',
        ],
      },
    },
    {
      number: 7,
      title: 'Building Sustainable Habits',
      learningOutcome: 'Understand the psychology of habit formation and how to build lasting nutritional habits.',
      assessmentCriteria: [
        'Describe the habit loop and how it applies to eating behaviours',
        'Explain the concept of habit stacking',
        'Identify strategies for overcoming common barriers to healthy eating',
      ],
      content: [
        {
          heading: 'The Habit Loop',
          paragraphs: [
            'Every habit follows a three-part loop: Cue (the trigger), Routine (the behaviour), and Reward (the positive outcome that reinforces the loop). Understanding this loop allows you to design new healthy habits and disrupt unhealthy ones.',
            'For nutrition, the cue might be a time of day, an emotion, or a visual trigger. The routine is what you eat. The reward is the satisfaction, energy, or comfort the food provides.',
          ],
          imageUrl: getUniversityImage('nutl2-u4-ch7-sustainable-habits'),
          imageAlt: 'Habit loop diagram',
        },
        {
          heading: 'Habit Stacking',
          paragraphs: [
            'Habit stacking attaches a new habit to an existing one. The formula is: "After I [existing habit], I will [new habit]." This uses your established routines as triggers for new behaviours.',
          ],
          bullets: [
            '"After I make my morning coffee, I will eat a protein-rich breakfast"',
            '"After I finish work, I will prep tomorrow\'s lunch"',
            '"After I sit down for dinner, I will fill half my plate with vegetables"',
            '"After I brush my teeth at night, I will fill my water bottle for tomorrow"',
          ],
        },
        {
          heading: 'Overcoming Barriers',
          bullets: [
            'Time — Batch cook and meal prep to remove daily cooking pressure',
            'Cost — Focus on budget-friendly staples (eggs, lentils, frozen veg, oats)',
            'Knowledge — Start with simple meals and build skills gradually',
            'Motivation — Rely on systems and routines, not willpower',
            'Social pressure — Plan how to handle social eating situations in advance',
            'All-or-nothing thinking — Progress, not perfection. A good day following a bad day is still progress',
          ],
        },
      ],
      unbreakableInsight: 'Willpower is a finite resource. It runs out. Habits do not. Build systems that make the healthy choice the default choice, and willpower becomes unnecessary.',
      coachNote: 'Focus on one new habit at a time. Research shows it takes an average of 66 days for a new behaviour to become automatic. Be patient with the process.',
      practicalTask: {
        title: 'Habit Design',
        instructions: 'Choose one nutrition habit you want to build. Define the cue, routine, and reward. Use habit stacking to attach it to an existing behaviour. Practice it daily for one week.',
        reflectionQuestions: [
          'What cue did you use to trigger your new habit?',
          'How consistent were you over the week?',
          'What would help you maintain this habit long-term?',
        ],
      },
    },
    {
      number: 8,
      title: 'Putting It All Together',
      learningOutcome: 'Integrate all nutritional knowledge from this unit into a practical, sustainable personal nutrition plan.',
      assessmentCriteria: [
        'Create a comprehensive personal nutrition plan using SMART goals',
        'Apply calorie and macro awareness to meal planning',
        'Demonstrate understanding of sustainable habit formation',
      ],
      content: [
        {
          heading: 'Your Nutrition Framework',
          paragraphs: [
            'This chapter brings together everything you have learned across Units 1–4. The goal is to create a personal nutrition framework that is practical, sustainable, and aligned with your goals. Not a rigid diet plan — a flexible system you can adapt as your life changes.',
          ],
          imageUrl: getUniversityImage('nutl2-u4-ch8-personal-plan'),
          imageAlt: 'Nutrition hierarchy pyramid',
        },
        {
          heading: 'The Nutrition Hierarchy',
          paragraphs: [
            'Not all nutritional factors carry equal weight. Focus on the fundamentals first:',
          ],
          bullets: [
            '1. Calories — The foundation. Get this right and everything else becomes easier',
            '2. Macronutrients — Adequate protein is the most impactful macro target for most people',
            '3. Food quality — Prioritise whole, nutrient-dense foods 80% of the time',
            '4. Meal timing — Matters for performance but is secondary to total intake',
            '5. Supplements — The cherry on top. Only useful when the foundation is solid',
          ],
        },
        {
          heading: 'Building Your Plan',
          bullets: [
            'Set one outcome goal and 2–3 process goals using the SMART framework',
            'Estimate your TDEE and set a calorie target aligned with your goal',
            'Plan your protein intake first (1.4–2.0 g/kg for active individuals)',
            'Build a weekly meal rotation based on foods you enjoy',
            'Implement one new habit per week using habit stacking',
            'Review and adjust every 4 weeks based on progress',
          ],
        },
        {
          heading: 'The Long View',
          paragraphs: [
            'Sustainable nutrition is not about the perfect week — it is about consistent good practice over months and years. Some weeks will be excellent, others will be average. What matters is the overall trend. Keep learning, keep adjusting, and keep showing up.',
          ],
        },
      ],
      unbreakableInsight: 'Knowledge without application is wasted. Everything you have learned in this course is worthless if you do not act on it. Start today. Start imperfectly. Just start.',
      coachNote: 'You now have the knowledge to eat well for life. The challenge from here is not learning more — it is doing more. Build your plan, execute it, and refine as you go.',
      practicalTask: {
        title: 'Personal Nutrition Plan',
        instructions: 'Create a comprehensive personal nutrition plan that includes: your SMART goals, estimated TDEE, daily macro targets, a 7-day meal plan, a shopping list, and the habits you will implement to support consistency.',
        reflectionQuestions: [
          'Does your plan feel sustainable for the next 12 weeks?',
          'What is the single most impactful change in your plan?',
          'How will you track progress and when will you review your plan?',
        ],
      },
    },
  ],
};

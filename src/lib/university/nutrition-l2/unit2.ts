import { getUniversityImage } from '@/lib/university/imageMap';
import type { Unit } from '../types';

export const nutritionL2Unit2: Unit = {
  number: 2,
  title: 'Nutritional Needs Across Life',
  description: 'Explore how nutritional requirements change across different life stages, activity levels, and dietary choices — from children to older adults, and from omnivores to vegans.',
  chapters: [
    {
      number: 1,
      title: 'Children & Adolescents',
      learningOutcome: 'Understand the unique nutritional requirements of children and adolescents during growth and development.',
      assessmentCriteria: [
        'Describe the increased nutritional demands during growth periods',
        'Identify key nutrients for child and adolescent development',
        'Explain why restrictive diets are inappropriate for growing individuals',
      ],
      content: [
        {
          heading: 'Growth and Development',
          paragraphs: [
            'Children and adolescents have proportionally higher energy and nutrient needs relative to their body weight compared to adults. This is because they are not only maintaining existing tissues but actively building new ones — bones, muscles, organs, and neural pathways.',
            'During puberty, growth accelerates significantly. Boys typically need more calories than girls due to greater increases in lean mass. Both sexes require adequate protein, calcium, iron, and zinc to support this growth.',
          ],
          imageUrl: getUniversityImage('nutl2-u2-ch1-growth-stages'),
          imageAlt: 'Growth and nutrient needs across life stages',
        },
        {
          heading: 'Key Nutrients for Young People',
          imageUrl: getUniversityImage('nutl2-u2-ch1-youth-nutrients'),
          imageAlt: 'Essential nutrients for growth — calcium, iron, vitamin D, protein, and omega-3',
          bullets: [
            'Calcium — Critical for bone development. Peak bone mass is established during adolescence. Dairy, fortified plant milks, and leafy greens are key sources',
            'Iron — Supports growth, cognitive development, and oxygen transport. Girls need more after menstruation begins',
            'Vitamin D — Essential for calcium absorption and bone health. Supplementation recommended in the UK',
            'Protein — Needed for muscle and tissue growth. Requirements are approximately 0.9–1.0 g/kg body weight',
            'Omega-3 fatty acids — Support brain development and cognitive function',
          ],
        },
        {
          heading: 'Dietary Restrictions in Young People',
          paragraphs: [
            'Restrictive diets (such as extreme low-calorie, low-carb, or elimination diets) are inappropriate for children and adolescents unless medically prescribed. They can impair growth, delay puberty, reduce bone density, and negatively impact mental health.',
            'Encouraging a positive relationship with food — variety, balance, and enjoyment — is far more important than imposing rigid dietary rules on young people.',
          ],
        },
      ],
      unbreakableInsight: 'A child\'s relationship with food is shaped by what they see and experience. Teach balance and enjoyment — not restriction and fear.',
      coachNote: 'If you are supporting a young person\'s nutrition, focus on adding nutrient-rich foods rather than removing anything. Make meals a positive experience.',
      practicalTask: {
        title: 'Youth Nutrition Assessment',
        instructions: 'If you know a young person (family member, friend\'s child), review their typical daily intake. Identify which key nutrients they are likely getting enough of and which might be lacking.',
        reflectionQuestions: [
          'Are they eating enough calcium-rich foods for bone development?',
          'Is their protein intake adequate for growth?',
          'How does their relationship with food appear — positive or stressed?',
        ],
      },
    },
    {
      number: 2,
      title: 'Older Adults',
      learningOutcome: 'Understand how nutritional needs change with ageing and how to support healthy ageing through diet.',
      assessmentCriteria: [
        'Describe how metabolism and body composition change with age',
        'Identify nutrients that become more critical in older adults',
        'Explain strategies to prevent age-related nutritional decline',
      ],
      content: [
        {
          heading: 'Ageing and Metabolism',
          paragraphs: [
            'As you age, basal metabolic rate gradually decreases — primarily due to loss of lean muscle mass (sarcopenia). This means calorie needs reduce, but nutrient needs remain the same or increase. The result is that older adults must eat more nutrient-dense foods per calorie consumed.',
            'Physical activity becomes even more important with age, both for maintaining muscle mass and for supporting appetite, bone density, and mental health.',
          ],
          imageUrl: getUniversityImage('nutl2-u2-ch2-ageing-metabolism'),
          imageAlt: 'Metabolic changes with ageing diagram',
        },
        {
          heading: 'Critical Nutrients for Older Adults',
          imageUrl: getUniversityImage('nutl2-u2-ch2-elderly-nutrients'),
          imageAlt: 'Critical nutrients for older adults — calcium, vitamin D, protein, B12, fibre',
          bullets: [
            'Protein — Requirements increase to 1.0–1.2 g/kg to prevent sarcopenia. Distribute protein evenly across meals (25–30 g per meal)',
            'Calcium and Vitamin D — Essential for preventing osteoporosis. Supplementation often necessary',
            'Vitamin B12 — Absorption decreases with age. Deficiency is common and affects cognition and energy',
            'Fibre — Supports digestive health, which often declines with age',
            'Omega-3 — Anti-inflammatory effects support cardiovascular and cognitive health',
            'Fluid — Thirst sensation diminishes with age, increasing dehydration risk',
          ],
        },
        {
          heading: 'Practical Strategies',
          bullets: [
            'Include protein at every meal — eggs, fish, dairy, or legumes',
            'Eat soft, nutrient-dense foods if chewing or swallowing is difficult',
            'Set regular meal times to maintain appetite and routine',
            'Drink fluids regularly, even without thirst',
            'Consider vitamin D and B12 supplements as standard',
          ],
        },
      ],
      unbreakableInsight: 'Ageing does not mean accepting decline. Proper nutrition — especially adequate protein — can preserve muscle, independence, and quality of life for decades longer than most people expect.',
      coachNote: 'The biggest risk for older adults is not eating enough protein. Focus on practical, enjoyable ways to increase intake at every meal.',
      practicalTask: {
        title: 'Ageing Nutrition Awareness',
        instructions: 'Review the diet of an older adult you know (or plan one for a hypothetical 70-year-old). Assess their protein, calcium, vitamin D, and fluid intake.',
        reflectionQuestions: [
          'Is their protein intake distributed across all meals?',
          'Are they at risk of vitamin D or B12 deficiency?',
          'What simple changes could improve their nutrient intake?',
        ],
      },
    },
    {
      number: 3,
      title: 'Pregnancy & Postnatal',
      learningOutcome: 'Understand the nutritional requirements during pregnancy and the postnatal period.',
      assessmentCriteria: [
        'Identify key nutrients required during pregnancy',
        'Explain the concept of "eating for two" versus actual increased needs',
        'Describe foods to avoid during pregnancy and the reasons why',
      ],
      content: [
        {
          heading: 'Nutritional Demands of Pregnancy',
          paragraphs: [
            'Pregnancy increases nutritional demands, but not as dramatically as many people believe. In the first trimester, no additional calories are needed. In the second trimester, approximately 340 extra calories per day are recommended, rising to about 450 in the third trimester.',
            'The focus should be on nutrient quality rather than quantity. Several micronutrients become critical for the health of both the mother and developing baby.',
          ],
          imageUrl: getUniversityImage('nutl2-u2-ch3-pregnancy-nutrition'),
          imageAlt: 'Trimester nutrition requirements',
        },
        {
          heading: 'Key Nutrients During Pregnancy',
          bullets: [
            'Folic acid (folate) — Critical in the first 12 weeks for neural tube development. 400 mcg daily supplement recommended before conception and during early pregnancy',
            'Iron — Blood volume increases by 50% during pregnancy, increasing iron needs significantly',
            'Calcium — Supports fetal bone development. If maternal intake is insufficient, calcium is drawn from the mother\'s bones',
            'Vitamin D — 10 mcg daily supplementation recommended throughout pregnancy',
            'Omega-3 (DHA) — Supports fetal brain and eye development',
            'Iodine — Required for thyroid function and fetal brain development',
          ],
        },
        {
          heading: 'Foods to Avoid',
          imageUrl: getUniversityImage('nutl2-u2-ch3-pregnancy-avoid'),
          imageAlt: 'Foods to avoid during pregnancy with warning icons',
          bullets: [
            'Raw or undercooked meat, fish, and eggs — Risk of toxoplasmosis and salmonella',
            'Unpasteurised dairy — Risk of listeria',
            'High-mercury fish (shark, swordfish, marlin) — Neurotoxic to the developing baby',
            'Liver and liver products — Excessive vitamin A can harm fetal development',
            'Alcohol — No safe level established during pregnancy',
            'Excessive caffeine — Limit to 200 mg per day (approximately two cups of coffee)',
          ],
        },
        {
          heading: 'Postnatal Nutrition',
          paragraphs: [
            'After birth, nutritional needs remain elevated — especially for breastfeeding mothers, who require approximately 500 additional calories per day. Continued focus on protein, calcium, iron, and hydration supports recovery and milk production.',
          ],
        },
      ],
      unbreakableInsight: 'Pregnancy is not a free pass to eat anything in unlimited quantities. It is a time when what you eat matters more than ever — for you and for the life you are building.',
      coachNote: 'Always recommend that pregnant individuals consult their GP or midwife for personalised nutritional advice. General guidance is a starting point, not a replacement for medical care.',
      practicalTask: {
        title: 'Pregnancy Nutrition Knowledge Check',
        instructions: 'List the key supplements recommended during pregnancy and the foods that should be avoided. Explain the reason for each.',
        reflectionQuestions: [
          'Why is folic acid particularly important in early pregnancy?',
          'What is the actual caloric increase needed during pregnancy compared to common belief?',
          'How does postnatal nutrition differ from pregnancy nutrition?',
        ],
      },
    },
    {
      number: 4,
      title: 'Vegetarian & Vegan Diets',
      learningOutcome: 'Understand how to meet nutritional needs on vegetarian and vegan diets.',
      assessmentCriteria: [
        'Identify nutrients at risk of deficiency in plant-based diets',
        'Explain strategies for achieving complete protein intake without meat',
        'Describe how to plan a nutritionally adequate vegan diet',
      ],
      content: [
        {
          heading: 'Types of Plant-Based Diets',
          paragraphs: [
            'Vegetarian diets exclude meat and fish but may include dairy (lacto-vegetarian), eggs (ovo-vegetarian), or both (lacto-ovo-vegetarian). Vegan diets exclude all animal products, including dairy, eggs, and honey.',
            'A well-planned vegetarian or vegan diet can meet all nutritional needs. However, certain nutrients require more attention because they are naturally found in higher concentrations in animal foods.',
          ],
          imageUrl: getUniversityImage('nutl2-u2-ch4-dietary-patterns'),
          imageAlt: 'Dietary pattern spectrum diagram',
        },
        {
          heading: 'Nutrients Requiring Attention',
          bullets: [
            'Vitamin B12 — Not found in plant foods. Supplementation or fortified foods are essential for vegans',
            'Iron — Plant-based (non-haem) iron is less well absorbed. Pair with vitamin C to enhance absorption',
            'Calcium — Available from fortified plant milks, tofu, and leafy greens, but requires intentional planning',
            'Omega-3 (EPA/DHA) — Plant sources provide ALA, which converts poorly to EPA/DHA. Consider algae-based supplements',
            'Zinc — Found in legumes, nuts, and seeds, but phytates in plant foods can inhibit absorption',
            'Iodine — Found in dairy and fish. Vegans may need supplementation or iodised salt',
            'Protein — Achievable through variety. Combine different plant proteins across the day for a full amino acid profile',
          ],
        },
        {
          heading: 'Achieving Complete Protein',
          imageUrl: getUniversityImage('nutl2-u2-ch4-protein-combining'),
          imageAlt: 'Plant-based protein combining diagram with grains, legumes, nuts, and seeds',
          paragraphs: [
            'Most plant proteins are "incomplete" — they lack one or more essential amino acids. However, you do not need to combine them in a single meal. Eating a variety of plant proteins throughout the day ensures you get all essential amino acids.',
          ],
          bullets: [
            'Legumes + grains (rice and beans, hummus and pitta)',
            'Soy products (tofu, tempeh, edamame) — one of few complete plant proteins',
            'Quinoa — Complete protein with all essential amino acids',
            'Mycoprotein (Quorn) — Complete protein, widely available in the UK',
          ],
        },
      ],
      unbreakableInsight: 'A plant-based diet can be excellent or terrible — just like any other diet. The difference is planning. Without it, deficiencies are not a possibility but a certainty.',
      coachNote: 'Support, don\'t judge. If someone chooses a plant-based diet, help them plan it properly rather than trying to change their mind.',
      practicalTask: {
        title: 'Plant-Based Day Plan',
        instructions: 'Plan a full day of vegan meals that covers all essential nutrients — protein, iron, calcium, B12, and omega-3. Use fortified foods and supplementation where necessary.',
        reflectionQuestions: [
          'Was it difficult to achieve adequate protein from plant sources?',
          'Which nutrients required supplements or fortified foods?',
          'Would this day of eating be sustainable long-term?',
        ],
      },
    },
    {
      number: 5,
      title: 'Cultural & Religious Diets',
      learningOutcome: 'Understand how cultural and religious practices influence dietary choices and how to ensure nutritional adequacy within these frameworks.',
      assessmentCriteria: [
        'Describe common dietary practices across major cultural and religious traditions',
        'Identify potential nutritional considerations within restricted diets',
        'Explain how to support nutritional balance while respecting cultural choices',
      ],
      content: [
        {
          heading: 'Diet and Culture',
          paragraphs: [
            'Food is deeply connected to cultural identity, religious practice, and social belonging. Understanding dietary traditions is essential for respecting individual choices while ensuring nutritional needs are met.',
            'Many cultural diets are inherently balanced and nutrient-rich. The Mediterranean diet, traditional Japanese diet, and Indian vegetarian cuisine are all examples of culturally-rooted eating patterns associated with excellent health outcomes.',
          ],
          imageUrl: getUniversityImage('nutl2-u2-ch5-cultural-diets'),
          imageAlt: 'World cultural dietary traditions map',
        },
        {
          heading: 'Religious Dietary Practices',
          imageUrl: getUniversityImage('nutl2-u2-ch5-religious-diets'),
          imageAlt: 'Religious dietary practices — Halal, Kosher, Hindu, and Buddhist food rules',
          bullets: [
            'Islam (Halal) — Pork and alcohol prohibited. Meat must be slaughtered according to Islamic law. Fasting during Ramadan (dawn to sunset)',
            'Judaism (Kosher) — Pork and shellfish prohibited. Meat and dairy must not be consumed together. Specific preparation requirements',
            'Hinduism — Many Hindus are vegetarian. Beef is avoided. Fasting is common on specific religious days',
            'Buddhism — Many practitioners are vegetarian or vegan. Some avoid garlic and onions',
            'Sikhism — Some Sikhs are vegetarian. Halal meat is generally avoided. Community meals (langar) are always vegetarian',
            'Christianity — Fasting practices vary (Lent, Orthodox fasting). Generally no permanent dietary restrictions',
          ],
        },
        {
          heading: 'Ensuring Nutritional Adequacy',
          paragraphs: [
            'The key is working within the dietary framework rather than against it. Every cultural and religious diet can support excellent nutrition with appropriate planning.',
          ],
          bullets: [
            'Identify which food groups are restricted and find permitted alternatives',
            'During fasting periods, focus on nutrient-dense foods during eating windows',
            'Respect dietary choices without judgement — nutrition support should adapt to the individual',
            'Be aware of potential nutrient gaps (iron, B12, calcium) in more restrictive patterns',
          ],
        },
      ],
      unbreakableInsight: 'Your diet is part of who you are. Good nutrition is about working with your values and traditions — not abandoning them for someone else\'s idea of "optimal."',
      coachNote: 'Never assume someone should change their cultural or religious dietary practices for health reasons. Instead, learn how to optimise nutrition within their existing framework.',
      practicalTask: {
        title: 'Cultural Diet Exploration',
        instructions: 'Choose a cultural or religious dietary tradition different from your own. Research its main principles and plan a nutritionally balanced day of meals within its guidelines.',
        reflectionQuestions: [
          'What are the strengths of the dietary tradition you explored?',
          'Were there any potential nutrient gaps you identified?',
          'How could you apply principles from this tradition to your own eating?',
        ],
      },
    },
    {
      number: 6,
      title: 'Food Allergies & Intolerances',
      learningOutcome: 'Understand the difference between food allergies and intolerances, their management, and how to maintain nutritional adequacy.',
      assessmentCriteria: [
        'Differentiate between a food allergy and a food intolerance',
        'Identify the 14 major allergens recognised in UK law',
        'Describe strategies for maintaining balanced nutrition when avoiding specific foods',
      ],
      content: [
        {
          heading: 'Allergy vs Intolerance',
          paragraphs: [
            'A food allergy is an immune system reaction that can be severe or life-threatening (anaphylaxis). Even tiny amounts of the allergen can trigger a response. Symptoms include swelling, hives, breathing difficulties, and in severe cases, anaphylactic shock.',
            'A food intolerance does not involve the immune system in the same way. Symptoms are usually digestive (bloating, cramping, diarrhoea) and are dose-dependent — small amounts may be tolerated. Lactose intolerance and non-coeliac gluten sensitivity are common examples.',
          ],
          imageUrl: getUniversityImage('nutl2-u2-ch6-allergy-intolerance'),
          imageAlt: 'Food allergy vs intolerance comparison',
        },
        {
          heading: 'The 14 Major Allergens (UK Law)',
          imageUrl: getUniversityImage('nutl2-u2-ch6-14-allergens'),
          imageAlt: 'The 14 major allergens required by UK food law with icons',
          paragraphs: [
            'UK food law requires that 14 allergens are clearly declared on food labels and in catering settings:',
          ],
          bullets: [
            'Celery — Including celeriac',
            'Cereals containing gluten — Wheat, rye, barley, oats',
            'Crustaceans — Prawns, crab, lobster',
            'Eggs',
            'Fish',
            'Lupin',
            'Milk (dairy)',
            'Molluscs — Mussels, snails, squid',
            'Mustard',
            'Tree nuts — Almonds, hazelnuts, walnuts, cashews, pecans, brazils, pistachios, macadamias',
            'Peanuts (groundnuts)',
            'Sesame seeds',
            'Soybeans',
            'Sulphur dioxide and sulphites (above 10 ppm)',
          ],
        },
        {
          heading: 'Maintaining Nutrition with Exclusions',
          paragraphs: [
            'When eliminating a food or food group, it is essential to find alternative sources of the nutrients it provided. For example, eliminating dairy requires alternative calcium sources. Eliminating gluten requires attention to fibre and B vitamin intake.',
          ],
          bullets: [
            'Dairy-free — Use fortified plant milks, eat leafy greens, and consider calcium supplementation',
            'Gluten-free — Choose naturally gluten-free grains (rice, quinoa, oats if certified)',
            'Egg-free — Ensure protein from other sources (meat, fish, legumes)',
            'Nut-free — Replace with seeds (sunflower, pumpkin) for healthy fats and minerals',
          ],
        },
      ],
      unbreakableInsight: 'A genuine allergy is not a choice or a trend — it is a medical reality. An intolerance is manageable with awareness. Neither is a reason to eat badly.',
      coachNote: 'Never diagnose food allergies or intolerances. If someone suspects an issue, advise them to see their GP for proper testing before eliminating foods.',
      practicalTask: {
        title: 'Allergen Awareness',
        instructions: 'Check the labels of five processed foods in your kitchen. Identify which of the 14 major allergens are present in each product.',
        reflectionQuestions: [
          'Were you surprised by any allergens listed in common foods?',
          'How clearly were allergens displayed on the packaging?',
          'If you had to avoid one of the 14 allergens, how would you adjust your diet?',
        ],
      },
    },
    {
      number: 7,
      title: 'Athletes vs Sedentary Individuals',
      learningOutcome: 'Understand how nutritional requirements differ between active and sedentary individuals.',
      assessmentCriteria: [
        'Compare energy and macronutrient needs of active vs sedentary people',
        'Explain how exercise increases micronutrient and fluid needs',
        'Describe the risks of inadequate nutrition for active individuals',
      ],
      content: [
        {
          heading: 'Energy Demands',
          paragraphs: [
            'The most obvious difference between active and sedentary individuals is total energy expenditure. A sedentary adult might burn 1,800–2,200 calories per day, while a highly active person might burn 3,000–5,000+ depending on the type, duration, and intensity of training.',
            'Under-fuelling is a significant risk for active individuals. Relative Energy Deficiency in Sport (RED-S) can impair performance, bone health, immune function, hormonal balance, and mental health.',
          ],
          imageUrl: getUniversityImage('nutl2-u2-ch7-caloric-needs'),
          imageAlt: 'Daily caloric needs comparison chart',
        },
        {
          heading: 'Macronutrient Differences',
          imageUrl: getUniversityImage('nutl2-u2-ch7-activity-macros'),
          imageAlt: 'Macronutrient needs comparison by activity level — sedentary, moderate, and highly active',
          bullets: [
            'Protein — Sedentary: 0.8 g/kg. Active: 1.4–2.2 g/kg depending on goal and training type',
            'Carbohydrates — Sedentary: 3–5 g/kg. Endurance athletes: 6–10 g/kg. Strength athletes: 4–7 g/kg',
            'Fat — Generally 20–35% of total calories for both groups, with active individuals needing more total fat due to higher calorie needs',
          ],
        },
        {
          heading: 'Increased Micronutrient and Fluid Needs',
          paragraphs: [
            'Exercise increases the turnover and loss of several micronutrients through sweat, increased metabolism, and tissue repair. Iron, zinc, magnesium, B vitamins, and electrolytes (sodium, potassium) all have higher demands in active people.',
          ],
          bullets: [
            'Iron — Lost through sweat and foot-strike haemolysis in runners',
            'Magnesium — Increased need for muscle contraction and recovery',
            'Sodium and potassium — Lost in sweat; replacement important for endurance activities',
            'Fluid — Active individuals may need 3–5+ litres per day depending on training and environment',
          ],
        },
      ],
      unbreakableInsight: 'If you train like an athlete, you need to eat like one. Under-eating does not make you leaner — it makes you weaker, slower, and more injury-prone.',
      coachNote: 'The biggest nutritional mistake active people make is not eating enough. Performance and body composition both improve when fuelling matches demand.',
      practicalTask: {
        title: 'Activity-Adjusted Nutrition',
        instructions: 'Estimate your current daily calorie needs using an online calculator. Compare this to your actual intake. Are you eating enough for your activity level?',
        reflectionQuestions: [
          'Is your calorie intake matched to your activity level?',
          'How does your protein intake compare to the active person recommendations?',
          'Are there signs you might be under-fuelling (fatigue, poor recovery, illness)?',
        ],
      },
    },
    {
      number: 8,
      title: 'Special Medical Considerations',
      learningOutcome: 'Understand basic nutritional considerations for common medical conditions and when to refer to a specialist.',
      assessmentCriteria: [
        'Describe dietary considerations for type 2 diabetes',
        'Identify nutritional factors in cardiovascular health',
        'Explain the importance of professional referral for medical nutrition therapy',
      ],
      content: [
        {
          heading: 'Nutrition and Type 2 Diabetes',
          paragraphs: [
            'Type 2 diabetes is characterised by insulin resistance — the body produces insulin but cells do not respond to it effectively, leading to elevated blood sugar levels. Nutritional management is a cornerstone of treatment.',
            'Key dietary strategies include reducing refined carbohydrates and added sugars, increasing fibre intake, managing portion sizes, and achieving or maintaining a healthy body weight. Consistent meal timing helps prevent blood sugar spikes and crashes.',
          ],
          imageUrl: getUniversityImage('nutl2-u2-ch8-blood-sugar'),
          imageAlt: 'Blood sugar response comparison diagram',
        },
        {
          heading: 'Cardiovascular Health',
          imageUrl: getUniversityImage('nutl2-u2-ch8-cardio-nutrition'),
          imageAlt: 'Nutrition and cardiovascular health — reduce saturated fat, increase omega-3, reduce sodium, increase fibre',
          paragraphs: [
            'Diet plays a major role in cardiovascular risk. Key factors include the type and amount of fat consumed, sodium intake, fibre consumption, and overall dietary patterns.',
          ],
          bullets: [
            'Replace saturated fats with unsaturated fats (olive oil, nuts, oily fish)',
            'Increase omega-3 intake — aim for 2 portions of oily fish per week',
            'Reduce sodium — aim for less than 6 g of salt per day',
            'Increase fibre — soluble fibre (oats, beans) helps reduce LDL cholesterol',
            'Eat plenty of fruit and vegetables — at least 5 portions per day',
            'Limit alcohol and processed foods',
          ],
        },
        {
          heading: 'When to Refer',
          paragraphs: [
            'General nutrition knowledge is valuable for supporting overall health, but medical conditions require specialist input. Registered dietitians (RDs) are the only legally regulated nutrition professionals in the UK and should be consulted for medical nutrition therapy.',
          ],
          bullets: [
            'Always refer to a GP or registered dietitian for medical conditions',
            'Do not diagnose or prescribe specific diets for medical conditions',
            'Understand your scope — you can support general healthy eating, but medical nutrition is specialist territory',
            'Coeliac disease, eating disorders, renal conditions, and cancer nutrition all require specialist care',
          ],
        },
      ],
      unbreakableInsight: 'Knowing your limits is a strength, not a weakness. General nutrition education empowers you to eat better — but medical conditions need medical professionals.',
      coachNote: 'Your role is to support healthy eating within your knowledge. If someone has a medical condition affecting their diet, encourage them to work with their GP or a registered dietitian.',
      practicalTask: {
        title: 'Scope of Practice Reflection',
        instructions: 'Write a list of nutritional topics you feel confident discussing and a separate list of topics that should be referred to a medical professional.',
        reflectionQuestions: [
          'Where is the boundary between general nutrition guidance and medical advice?',
          'How would you respond if someone asked you for dietary advice for a medical condition?',
          'What resources exist in your area for professional nutrition support?',
        ],
      },
    },
  ],
};

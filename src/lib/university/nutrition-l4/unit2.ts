import type { Unit } from '../types';

export const nutritionL4Unit2: Unit = {
  number: 2,
  title: 'Clinical Nutrition & Special Populations',
  description: 'Master evidence-based nutritional strategies for clinical conditions, special populations, and complex client scenarios — bridging the gap between general nutrition and specialised practice.',
  chapters: [
    {
      number: 1,
      title: 'Nutrition for Cardiovascular Health',
      learningOutcome: 'Understand the relationship between dietary patterns, lipid profiles, and cardiovascular disease risk — and the evidence behind current guidelines.',
      assessmentCriteria: [
        'Explain the roles of LDL, HDL, and triglycerides in cardiovascular health',
        'Compare the effects of saturated fat, trans fat, and unsaturated fat on lipid profiles',
        'Design dietary modifications to improve cardiovascular risk markers',
      ],
      content: [
        {
          heading: 'Beyond "Good" and "Bad" Cholesterol',
          paragraphs: [
            'Cardiovascular disease (CVD) remains the leading cause of death globally. The relationship between diet and CVD is well-established but frequently oversimplified. Total cholesterol is a poor predictor of risk — what matters is the balance between LDL particle number (LDL-P), HDL functionality, and triglyceride levels. Two people with identical total cholesterol can have dramatically different CVD risk profiles.',
            'LDL particles carry cholesterol to tissues. When present in excess, they penetrate the arterial wall and trigger atherosclerotic plaque formation. However, LDL particle size matters — small, dense LDL particles are more atherogenic than large, buoyant ones. HDL particles perform reverse cholesterol transport, removing cholesterol from arteries. A high HDL-to-triglyceride ratio is one of the strongest markers of cardiovascular health.',
          ],
        },
        {
          heading: 'Dietary Fat and Cardiovascular Risk',
          paragraphs: [
            'Trans fats (partially hydrogenated oils) are unequivocally harmful — raising LDL, lowering HDL, and increasing inflammation. They should be eliminated entirely. Saturated fat is more nuanced. Replacing saturated fat with polyunsaturated fat (omega-6 and omega-3) consistently reduces CVD risk in large meta-analyses. Replacing saturated fat with refined carbohydrates does not improve outcomes — and may worsen them by increasing triglycerides.',
            'The Mediterranean dietary pattern — rich in olive oil, fatty fish, nuts, vegetables, legumes, and moderate wine — has the strongest evidence base for cardiovascular protection. The PREDIMED trial demonstrated a 30% reduction in major cardiovascular events compared to a low-fat control diet. This is a dietary pattern, not a single nutrient — the synergy between foods matters more than any individual component.',
          ],
        },
        {
          heading: 'Practical Dietary Strategies',
          bullets: [
            'Prioritise omega-3 fatty acids from fatty fish (2-3 portions per week) — EPA and DHA reduce triglycerides, inflammation, and arrhythmia risk',
            'Use olive oil as the primary cooking fat — rich in oleic acid and polyphenols with direct endothelial benefits',
            'Include 30g nuts daily — walnuts, almonds, and pistachios consistently improve lipid profiles',
            'Increase soluble fibre from oats, beans, lentils, and barley — 5-10g/day of soluble fibre reduces LDL by 5-10%',
            'Limit added sugars and refined carbohydrates — these raise triglycerides more than dietary fat does',
            'Include plant sterols/stanols (2g/day) from fortified foods if LDL is elevated — evidence supports 10-15% LDL reduction',
          ],
        },
      ],
      unbreakableInsight: 'Heart health is built in the kitchen, but not by avoiding fat — by choosing the right fats, prioritising whole foods, and understanding that dietary patterns matter more than individual nutrients.',
      coachNote: 'When a client receives concerning blood work, your role is dietary optimisation within your scope. Refer to their GP for medical management. Never suggest dietary changes as a replacement for prescribed medication.',
      practicalTask: {
        title: 'Cardiovascular Nutrition Audit',
        instructions: 'Review a 3-day food diary (your own or a willing participant). Identify: omega-3 sources, saturated fat sources, fibre intake, and added sugar intake. Design three specific, practical swaps that would improve the cardiovascular profile of the diet.',
        reflectionQuestions: [
          'Which swap would have the greatest impact on lipid profile based on the evidence?',
          'How would you explain these changes to someone with no nutrition knowledge?',
          'What barriers might prevent adherence to these changes, and how would you address them?',
        ],
      },
    },
    {
      number: 2,
      title: 'Diabetes, Insulin Resistance & Glycaemic Management',
      learningOutcome: 'Understand the pathophysiology of Type 1 and Type 2 diabetes, the role of nutrition in glycaemic control, and evidence-based dietary strategies for prevention and management.',
      assessmentCriteria: [
        'Differentiate between Type 1 and Type 2 diabetes mechanisms',
        'Explain glycaemic index, glycaemic load, and their practical relevance',
        'Design nutritional strategies for improving insulin sensitivity',
      ],
      content: [
        {
          heading: 'Type 1 vs Type 2 — Different Diseases',
          paragraphs: [
            'Type 1 diabetes is an autoimmune condition where the immune system destroys insulin-producing beta cells in the pancreas. It is not caused by diet or lifestyle and requires exogenous insulin for survival. Type 2 diabetes develops when cells become resistant to insulin (insulin resistance), and the pancreas cannot compensate by producing enough insulin. Type 2 is strongly associated with excess body fat (particularly visceral fat), physical inactivity, and genetic predisposition.',
            'Pre-diabetes — characterised by fasting glucose of 5.6-6.9 mmol/L or HbA1c of 42-47 mmol/mol — is reversible with lifestyle modification. Weight loss of 5-7% combined with 150 minutes of weekly physical activity reduces progression to Type 2 diabetes by 58%. This makes pre-diabetes one of the most modifiable conditions in clinical nutrition.',
          ],
        },
        {
          heading: 'Glycaemic Index and Glycaemic Load',
          paragraphs: [
            'The glycaemic index (GI) ranks carbohydrates by how quickly they raise blood glucose compared to pure glucose (GI = 100). Low GI foods (≤55) produce slower, smaller rises. However, GI has significant limitations — it tests single foods in isolation, ignoring the mixed meals people actually eat. Adding protein, fat, or fibre to a high-GI food reduces the glycaemic response substantially.',
            'Glycaemic load (GL) accounts for both the GI and the amount of carbohydrate consumed. Watermelon has a high GI (72) but a low GL (4 per typical serving) because it contains very little carbohydrate per portion. GL is more practically useful than GI. Ultimately, total carbohydrate quality and quantity within the context of overall dietary pattern matters more than obsessing over individual food GI values.',
          ],
        },
        {
          heading: 'Nutrition Strategies for Insulin Sensitivity',
          bullets: [
            'Moderate caloric deficit (500 kcal/day) for individuals with excess body fat — even modest weight loss dramatically improves insulin sensitivity',
            'Prioritise fibre-rich carbohydrate sources — whole grains, legumes, vegetables. Target 30g+ fibre per day',
            'Include protein with every meal — slows gastric emptying, reduces postprandial glucose spikes, and improves satiety',
            'Distribute carbohydrates evenly across meals rather than concentrating them in one sitting',
            'Consider carbohydrate timing around physical activity — exercising muscles take up glucose independently of insulin',
            'Magnesium, chromium, and alpha-lipoic acid have modest evidence for improving insulin sensitivity, but dietary sources are preferred over supplements',
          ],
        },
      ],
      unbreakableInsight: 'Type 2 diabetes is not a life sentence — it is one of the most responsive conditions to lifestyle intervention. The same habits that improve insulin sensitivity also improve almost every other health marker.',
      coachNote: 'Never advise a diabetic client to change their medication or insulin dosing. Work alongside their medical team. Your role is optimising diet quality and supporting behaviour change — not clinical diabetes management.',
      practicalTask: {
        title: 'Glycaemic Response Experiment',
        instructions: 'Eat a high-GI carbohydrate source (white bread or rice) alone, then on a separate day eat the same amount combined with protein and fat (e.g., with chicken and olive oil). Note your hunger, energy, and satiety over the following 3 hours for each scenario.',
        reflectionQuestions: [
          'How did the mixed meal compare to the carbohydrate-only meal in terms of fullness and energy stability?',
          'What does this tell you about the practical limitations of using GI in isolation?',
          'How would you explain glycaemic management to a client without using technical language?',
        ],
      },
    },
    {
      number: 3,
      title: 'Nutrition for Bone & Joint Health',
      learningOutcome: 'Understand the nutritional factors that influence bone density, joint integrity, and the prevention of osteoporosis and inflammatory joint conditions.',
      assessmentCriteria: [
        'Describe the role of calcium, vitamin D, and vitamin K2 in bone metabolism',
        'Explain the relationship between protein intake, acid-base balance, and bone health',
        'Design dietary strategies for bone density preservation across the lifespan',
      ],
      content: [
        {
          heading: 'Building and Maintaining Bone',
          paragraphs: [
            'Bone is not a static structure — it is continuously remodelled through the balance of osteoblast activity (bone formation) and osteoclast activity (bone resorption). Peak bone mass is typically reached by age 30. After this, the goal shifts from building bone to preserving it. Osteoporosis — characterised by low bone mineral density and increased fracture risk — affects 1 in 3 women and 1 in 5 men over 50.',
            'Nutrition plays a critical role in both building peak bone mass (childhood through young adulthood) and slowing bone loss (mid-life onward). However, nutrition alone is insufficient — mechanical loading through resistance training and impact exercise is the strongest stimulus for bone adaptation. Nutrition provides the raw materials; exercise provides the signal.',
          ],
        },
        {
          heading: 'Key Nutrients for Bone',
          bullets: [
            'Calcium — 700-1200mg/day depending on age and sex. Dairy products are the most bioavailable source. Plant sources (kale, broccoli, fortified milks) contribute but have lower absorption rates. Supplementation above 500mg in a single dose has diminishing returns',
            'Vitamin D — Essential for calcium absorption. 10μg (400 IU) per day minimum; many experts recommend 25-50μg (1000-2000 IU) for optimal levels, especially in northern latitudes. Deficiency is extremely common in the UK',
            'Vitamin K2 — Directs calcium into bones and teeth rather than soft tissues. Found in fermented foods (natto, certain cheeses), egg yolks, and liver. Emerging evidence suggests K2 works synergistically with vitamin D',
            'Protein — Higher protein intakes (1.2-1.6g/kg) are associated with better bone density, contradicting the old myth that protein leaches calcium. Protein provides the collagen matrix that gives bone its flexibility',
            'Magnesium — 60% of the body\'s magnesium is stored in bone. Deficiency impairs bone crystal formation. Found in nuts, seeds, dark chocolate, and leafy greens',
          ],
        },
        {
          heading: 'The Protein-Bone Myth',
          paragraphs: [
            'For decades, it was claimed that high protein diets cause calcium loss through increased urinary calcium excretion. This has been thoroughly debunked. While protein does increase calcium excretion, it simultaneously increases calcium absorption from the gut by a greater amount. Net calcium balance improves with higher protein intake. Furthermore, protein provides the amino acids for collagen synthesis — the structural matrix of bone.',
            'The populations with the highest protein intakes and the highest dairy consumption do not have the highest fracture rates when confounding variables (physical activity, vitamin D status, body weight) are controlled for. The evidence is clear: adequate protein supports bone health, and inadequate protein is a risk factor for osteoporosis.',
          ],
        },
      ],
      unbreakableInsight: 'Your bones are alive — constantly adapting to the loads you place on them and the nutrients you provide. Investing in bone health at 30 pays dividends at 70. This is a long game that starts now.',
      coachNote: 'Post-menopausal women and older adults are at highest risk for osteoporosis. Encourage resistance training and adequate calcium/vitamin D/protein intake. Refer to their GP for bone density screening (DEXA) if risk factors are present.',
      practicalTask: {
        title: 'Bone Health Nutrition Check',
        instructions: 'Calculate your daily calcium intake from food sources over 3 days. Compare to the recommended 700-1200mg. Assess your vitamin D status — are you supplementing? Do you get regular sun exposure? Identify any gaps and design a plan to address them.',
        reflectionQuestions: [
          'Is your calcium intake adequate from food alone, or would targeted food additions help?',
          'What role does resistance training play alongside nutrition for bone health?',
          'How would you approach bone health nutrition differently for a 25-year-old versus a 55-year-old?',
        ],
      },
    },
    {
      number: 4,
      title: 'Nutrition in Pregnancy & Postnatal Recovery',
      learningOutcome: 'Understand the nutritional requirements during pregnancy and the postnatal period, including critical micronutrients, safe supplementation, and foods to avoid.',
      assessmentCriteria: [
        'Describe the key nutritional changes required during each trimester',
        'Identify critical micronutrients for foetal development',
        'Explain postnatal nutrition priorities for recovery and breastfeeding',
      ],
      content: [
        {
          heading: 'Nutrition Across Trimesters',
          paragraphs: [
            'The popular advice to "eat for two" is misleading and harmful. Energy requirements increase by only 200 kcal/day in the third trimester — and not at all in the first trimester. The quality of nutrition matters far more than the quantity. Excessive weight gain during pregnancy increases the risk of gestational diabetes, pre-eclampsia, and complications during delivery.',
            'First trimester: No additional calorie needs, but folate is critical. Second trimester: Modest increase in protein and iron requirements as blood volume expands and the foetus grows. Third trimester: Additional 200 kcal/day, increased calcium and omega-3 requirements for foetal bone and brain development. Throughout: hydration, fibre for digestive comfort, and regular small meals to manage nausea.',
          ],
        },
        {
          heading: 'Critical Micronutrients',
          bullets: [
            'Folate (folic acid) — 400μg daily from pre-conception through the first 12 weeks. Prevents neural tube defects (spina bifida). Found in dark leafy greens, fortified cereals, and legumes. Supplementation is universally recommended',
            'Iron — Requirements increase from 14.8mg to 27mg/day. Iron deficiency anaemia is the most common nutritional deficiency in pregnancy. Haem iron (meat, fish) is better absorbed than non-haem iron (plants), but vitamin C enhances non-haem absorption',
            'Iodine — Critical for foetal brain development and thyroid function. 200μg/day recommended. Found in dairy products, fish, and iodised salt. Deficiency is re-emerging in the UK',
            'Omega-3 DHA — Essential for foetal brain and retinal development, particularly in the third trimester. 200-300mg DHA daily from oily fish (max 2 portions/week during pregnancy) or algae-based supplements',
            'Vitamin D — 10μg (400 IU) daily throughout pregnancy and breastfeeding. Essential for foetal bone development and maternal immune function',
          ],
        },
        {
          heading: 'Foods to Avoid & Safety',
          paragraphs: [
            'Certain foods carry increased risk during pregnancy due to the immunosuppressive state required to prevent foetal rejection. Raw or undercooked meat and eggs risk Salmonella and Toxoplasma. Unpasteurised dairy and soft mould-ripened cheeses (Brie, Camembert) risk Listeria, which can cause miscarriage. High-mercury fish (shark, swordfish, marlin) should be limited. Liver products contain excessive vitamin A (retinol), which is teratogenic at high doses.',
            'Caffeine should be limited to 200mg/day (roughly 2 cups of coffee). Alcohol should be avoided entirely — there is no established safe level during pregnancy. These guidelines should be communicated sensitively, without judgment, as many pregnant women experience guilt and anxiety around dietary choices.',
          ],
        },
      ],
      unbreakableInsight: 'Pregnancy nutrition is not about perfection — it is about prioritising the nutrients that matter most for a developing life. A well-nourished mother builds the foundation for a healthy child.',
      coachNote: 'Pregnant and postnatal clients should always have medical clearance before changes to diet or exercise. Your role is supporting healthy food choices within established guidelines — not prescribing clinical nutrition plans.',
      practicalTask: {
        title: 'Pregnancy Nutrition Planning',
        instructions: 'Design a sample day of eating for a woman in her third trimester that meets increased calorie needs (+200 kcal), provides adequate folate, iron, calcium, omega-3, and vitamin D, and avoids restricted foods. Ensure the plan is practical, affordable, and enjoyable.',
        reflectionQuestions: [
          'How would you adapt this plan for a vegetarian or vegan pregnant woman?',
          'What are the key differences between prenatal and postnatal nutrition priorities?',
          'How would you communicate food restrictions without causing anxiety or guilt?',
        ],
      },
    },
    {
      number: 5,
      title: 'Nutrition for Older Adults',
      learningOutcome: 'Understand the specific nutritional challenges and requirements of ageing, with emphasis on sarcopenia prevention, cognitive health, and maintaining independence.',
      assessmentCriteria: [
        'Describe the physiological changes affecting nutrition needs in older adults',
        'Explain the role of protein and resistance training in preventing sarcopenia',
        'Design dietary strategies to support healthy ageing',
      ],
      content: [
        {
          heading: 'The Ageing Body and Nutrition',
          paragraphs: [
            'Ageing brings predictable physiological changes that directly affect nutritional needs. Basal metabolic rate declines by approximately 1-2% per decade after 30, primarily due to loss of muscle mass (sarcopenia). Appetite often decreases (the "anorexia of ageing"), creating a dangerous combination: lower calorie intake at a time when nutrient needs remain high or increase. The result is often simultaneous caloric sufficiency and micronutrient deficiency.',
            'Digestive efficiency declines — stomach acid production decreases (affecting B12 and calcium absorption), and gut motility slows (increasing constipation risk). Kidney function gradually reduces, affecting fluid balance and electrolyte regulation. Bone density decreases, particularly in post-menopausal women. These changes are not inevitable to the degree most people assume — they can be significantly delayed by nutrition, exercise, and lifestyle factors.',
          ],
        },
        {
          heading: 'Sarcopenia — The Silent Epidemic',
          paragraphs: [
            'Sarcopenia — age-related muscle loss — begins around age 30 and accelerates after 60. By age 80, individuals may have lost 30-50% of their muscle mass. This is not a cosmetic issue — it is the primary driver of falls, fractures, loss of independence, and increased mortality in older adults. Sarcopenia is more predictive of hospitalisation and death than obesity.',
            'Prevention requires two interventions working together: adequate protein and resistance training. Older adults need more protein per meal to stimulate muscle protein synthesis — the "leucine threshold" is higher in ageing muscle. Current evidence supports 1.2-1.6g protein per kg body weight daily, distributed across 3-4 meals with at least 25-30g per meal. Combined with progressive resistance training 2-3 times per week, muscle mass can be maintained and even regained well into the eighth decade.',
          ],
        },
        {
          heading: 'Nutrition for Cognitive Health',
          bullets: [
            'Omega-3 fatty acids (DHA in particular) — structural components of brain cell membranes. Regular fish consumption is associated with slower cognitive decline',
            'Antioxidant-rich foods — berries, dark leafy greens, and colourful vegetables provide polyphenols that reduce neuroinflammation',
            'B vitamins (B6, B12, folate) — deficiency causes elevated homocysteine, which is associated with accelerated cognitive decline and increased dementia risk',
            'Mediterranean dietary pattern — consistently associated with better cognitive outcomes and reduced Alzheimer\'s risk in large prospective studies',
            'Adequate hydration — older adults have reduced thirst sensation. Dehydration causes acute confusion and is a common preventable cause of hospital admission',
            'Vitamin D — deficiency is associated with increased dementia risk. Supplementation is recommended for all adults over 65 in the UK',
          ],
        },
      ],
      unbreakableInsight: 'Ageing is not a disease — it is a process you can influence profoundly. The 70-year-old who lifts weights, eats adequate protein, and stays socially engaged can be stronger and sharper than the sedentary 50-year-old.',
      coachNote: 'Older adult clients often undereat protein and overtrust low-fat dietary advice from decades past. Gently challenge outdated beliefs. "Eat less" is rarely the right advice for someone over 65 — "eat better and eat enough protein" usually is.',
      practicalTask: {
        title: 'Older Adult Nutrition Assessment',
        instructions: 'Design a full day of eating for a 70-year-old who weighs 65kg, aiming for 1.4g/kg protein (91g total), adequate calcium, vitamin D, B12, and fibre. Ensure meals are practical, palatable, and consider reduced appetite.',
        reflectionQuestions: [
          'How would you distribute protein across meals to maximise muscle protein synthesis?',
          'What barriers might an older adult face in meeting protein targets, and how would you address them?',
          'How does the nutritional advice for a 70-year-old differ from that for a 30-year-old athlete?',
        ],
      },
    },
    {
      number: 6,
      title: 'Mental Health & Nutritional Psychiatry',
      learningOutcome: 'Explore the emerging field of nutritional psychiatry — the evidence linking dietary patterns to mental health conditions including depression, anxiety, and cognitive function.',
      assessmentCriteria: [
        'Describe the gut-brain axis and its relevance to mental health',
        'Explain the dietary patterns associated with reduced depression and anxiety risk',
        'Identify specific nutrients with evidence for supporting mental health',
      ],
      content: [
        {
          heading: 'The Gut-Brain Axis',
          paragraphs: [
            'The gut and brain communicate bidirectionally through the vagus nerve, the immune system, and microbially-produced neurotransmitters. Approximately 95% of the body\'s serotonin is produced in the gut — not the brain. The composition of the gut microbiome directly influences the production of serotonin, dopamine, and GABA (the brain\'s primary calming neurotransmitter). This is the biological basis for the "gut feeling" — your gut literally influences your mood.',
            'Dysbiosis (an imbalanced microbiome) is associated with increased systemic inflammation, which is increasingly recognised as a driver of depression. The inflammatory model of depression suggests that chronic low-grade inflammation — driven by poor diet, stress, sleep deprivation, and sedentary behaviour — disrupts neurotransmitter function and brain plasticity. This does not replace other models of depression but adds a nutritional dimension to understanding and treatment.',
          ],
        },
        {
          heading: 'Dietary Patterns and Mental Health',
          paragraphs: [
            'The SMILES trial (2017) was the first randomised controlled trial to demonstrate that dietary improvement alone could significantly reduce symptoms of moderate-to-severe depression. Participants following a modified Mediterranean diet showed significantly greater improvement than those receiving social support alone. The "number needed to treat" was 4.1 — meaning for every 4 people who improved their diet, one experienced remission of depression. This is comparable to some pharmaceutical interventions.',
            'Consistent observational evidence shows that Western dietary patterns (high in ultra-processed foods, refined sugars, processed meats) are associated with 25-35% increased depression risk, while Mediterranean and traditional dietary patterns are associated with 25-35% reduced risk. The magnitude of this association is comparable to regular exercise.',
          ],
        },
        {
          heading: 'Key Nutrients for Mental Health',
          bullets: [
            'Omega-3 fatty acids (EPA particularly) — anti-inflammatory, supports cell membrane fluidity in the brain. Doses of 1-2g EPA daily show moderate antidepressant effects in meta-analyses',
            'Zinc — involved in neurotransmitter function. Deficiency is common in depression. Found in red meat, shellfish, pumpkin seeds, and legumes',
            'Magnesium — the "relaxation mineral." Deficiency causes anxiety, insomnia, and muscle tension. Supplementation (200-400mg glycinate or threonate) has anxiolytic effects',
            'B vitamins — particularly B6 (serotonin synthesis), B12, and folate (methylation and homocysteine clearance). Deficiency impairs neurotransmitter production',
            'Vitamin D — receptors throughout the brain. Deficiency is associated with seasonal depression and increased overall depression risk',
            'Fermented foods — yoghurt, kefir, kimchi, sauerkraut — directly supply beneficial microbes and improve gut-brain axis communication',
          ],
        },
      ],
      unbreakableInsight: 'What you eat changes how you think and feel — this is not philosophy, it is neuroscience. Feeding your gut microbiome well is one of the most underrated mental health interventions available.',
      coachNote: 'Nutrition is not a replacement for therapy or medication for clinical mental health conditions. However, it is a powerful complementary approach. If a client is struggling with their mental health, encourage them to seek professional support alongside dietary improvement.',
      practicalTask: {
        title: 'Mental Health Nutrition Review',
        instructions: 'Track your mood (1-10 scale) and food intake for 5 consecutive days. At the end, look for patterns: do your mood scores correlate with food quality? Identify your top 3 dietary changes that could support better mental health based on the evidence.',
        reflectionQuestions: [
          'Did you notice any relationship between food choices and mood or energy levels?',
          'How would you discuss the gut-brain axis with a client in simple, non-clinical language?',
          'What is the difference between "food as medicine" and responsible nutritional support for mental health?',
        ],
      },
    },
    {
      number: 7,
      title: 'Eating Disorders & Disordered Eating',
      learningOutcome: 'Understand the spectrum of eating disorders and disordered eating, recognise warning signs, and learn the boundaries of your scope of practice in supporting affected individuals.',
      assessmentCriteria: [
        'Differentiate between clinical eating disorders and subclinical disordered eating',
        'Identify warning signs and risk factors for eating disorders',
        'Describe appropriate referral pathways and scope of practice boundaries',
      ],
      content: [
        {
          heading: 'The Spectrum of Disordered Eating',
          paragraphs: [
            'Eating disorders exist on a spectrum. At one end are clinical conditions — anorexia nervosa, bulimia nervosa, binge eating disorder, and ARFID (avoidant/restrictive food intake disorder). These are serious mental health conditions with the highest mortality rate of any psychiatric illness. They require specialist treatment from eating disorder professionals — they are categorically outside the scope of a nutrition or fitness coach.',
            'In the middle of the spectrum is subclinical disordered eating — rigid food rules, guilt around eating, obsessive calorie counting, "clean eating" taken to extremes, exercise as punishment for eating, and binge-restrict cycles. These behaviours are alarmingly common in fitness culture and are often normalised or even celebrated. An estimated 40-60% of gym-going women and 20-30% of men exhibit some degree of disordered eating. As a nutrition professional, you will encounter this regularly.',
          ],
        },
        {
          heading: 'Warning Signs to Recognise',
          bullets: [
            'Extreme rigidity around food — refusing to eat food not prepared by them, refusing social eating, visible distress when "off plan"',
            'Rapid, unexplained weight loss — particularly if combined with food obsession, social withdrawal, or denial',
            'Compensatory behaviours — excessive exercise after eating, use of laxatives or diet pills, self-induced vomiting',
            'Obsessive body checking — constant weighing, mirror checking, measuring, skin pinching',
            'Binge eating episodes — eating unusually large amounts rapidly, feeling out of control, followed by intense shame',
            'Orthorexia — an obsession with "healthy" or "clean" eating that impairs social function, causes anxiety, and restricts variety',
            'Amenorrhoea (loss of menstrual period) — a red flag indicating energy availability is dangerously low',
          ],
        },
        {
          heading: 'Scope of Practice and Referral',
          paragraphs: [
            'If you suspect a client has a clinical eating disorder, your responsibility is to refer — not to treat. Eating disorders are complex mental health conditions driven by psychological factors that dietary advice alone cannot address. Well-meaning nutritional interventions without specialist oversight can cause harm. Refer to their GP as the first step, who can access eating disorder services through the NHS.',
            'For subclinical disordered eating, you can play a supportive role: model a healthy relationship with food, avoid language that reinforces guilt or food morality ("clean" vs "dirty"), challenge all-or-nothing thinking, and normalise flexibility and enjoyment in eating. If a client\'s relationship with food is deteriorating under your guidance, pause prescriptive dietary advice and focus on rebuilding a positive, relaxed relationship with eating.',
          ],
        },
      ],
      unbreakableInsight: 'The fitness industry creates more disordered eating than it cures. Your greatest contribution may not be the macros you prescribe — it may be the harmful relationship with food you help someone escape.',
      coachNote: 'Never compliment weight loss without knowing the context. Never use terms like "cheat meal" or "guilt-free." Never prescribe very low calorie diets. Watch for the client who is "too compliant" — extreme adherence is often a warning sign, not a virtue.',
      practicalTask: {
        title: 'Language and Attitudes Audit',
        instructions: 'Review the language you use (or have heard used) in fitness and nutrition contexts. List 5 common phrases that could reinforce disordered eating (e.g., "earn your food," "clean eating"). For each, write a healthier alternative that communicates the same nutritional principle without the moral judgment.',
        reflectionQuestions: [
          'Have you ever experienced or witnessed food guilt, rigid rules, or compensatory exercise? How did it affect wellbeing?',
          'Where is the line between disciplined nutrition and disordered eating?',
          'How would you respond if a client told you they purge after meals?',
        ],
      },
    },
    {
      number: 8,
      title: 'Food Allergies, Intolerances & Exclusion Diets',
      learningOutcome: 'Understand the immunological basis of food allergies versus intolerances, manage nutritional adequacy in exclusion diets, and recognise pseudoscientific testing and claims.',
      assessmentCriteria: [
        'Differentiate between IgE-mediated allergy, non-IgE sensitivity, and intolerance',
        'Identify nutritional risks of common exclusion diets and design compensatory strategies',
        'Evaluate the evidence behind popular food sensitivity tests',
      ],
      content: [
        {
          heading: 'Allergy vs Intolerance — Critical Distinctions',
          paragraphs: [
            'Food allergy involves an immune response — specifically IgE-mediated reactions that can cause anaphylaxis (a life-threatening emergency). Common allergens include peanuts, tree nuts, shellfish, eggs, milk, wheat, soy, and fish. These are serious medical conditions requiring strict avoidance and emergency action plans. Even trace contamination can trigger reactions.',
            'Food intolerance does not involve the immune system and is not life-threatening. Lactose intolerance (lacking lactase enzyme) causes digestive discomfort but not anaphylaxis. Non-coeliac gluten sensitivity is a recognised condition but its mechanisms are debated — FODMAPs (fermentable carbohydrates) in wheat may explain symptoms attributed to gluten in many cases. Coeliac disease is an autoimmune condition (not an allergy) triggered by gluten that damages the intestinal lining.',
          ],
        },
        {
          heading: 'Managing Exclusion Diets Safely',
          bullets: [
            'Dairy-free — Risk of inadequate calcium, vitamin D, iodine, and B12. Fortified alternatives (soya, oat milk) can compensate if consumed consistently. Check labels for calcium fortification',
            'Gluten-free (coeliac) — Risk of low fibre, B vitamins, and iron. Many GF products are refined and nutrient-poor. Emphasise naturally GF whole grains: rice, quinoa, oats (certified GF), buckwheat',
            'Nut-free — Minimal nutritional risk if seeds are included as alternatives for healthy fats and minerals',
            'Vegan — Risk of B12 (must supplement), omega-3 DHA/EPA, iron, zinc, iodine, and calcium deficiency. Well-planned vegan diets are nutritionally adequate; unplanned ones are not',
            'Multiple exclusions — Cumulative risk increases with each food group removed. Professional dietetic support recommended for clients excluding 2+ food groups',
          ],
        },
        {
          heading: 'Pseudoscientific Testing — A Warning',
          paragraphs: [
            'IgG food sensitivity tests — widely marketed online and in health food shops — are not supported by evidence. IgG antibodies to foods are a normal immune response to food exposure, not a marker of intolerance. A positive IgG result simply means you have eaten that food recently. These tests lead to unnecessary and potentially harmful food exclusions.',
            'Hair analysis, applied kinesiology, and electrodermal testing for food sensitivities have no scientific validity. The gold standard for identifying food intolerances is an elimination diet supervised by a registered dietitian, followed by systematic reintroduction. For suspected allergies, skin prick tests and specific IgE blood tests conducted by an allergist are the appropriate diagnostic tools.',
          ],
        },
      ],
      unbreakableInsight: 'Removing a food group is easy. Replacing the nutrients it provided is where the real skill lies. Every exclusion diet needs a compensatory strategy — or it becomes a deficiency diet.',
      coachNote: 'Clients who self-diagnose multiple food intolerances based on unvalidated tests often end up with unnecessarily restricted diets. Encourage evidence-based testing and, where appropriate, referral to an NHS dietitian or allergist.',
      practicalTask: {
        title: 'Exclusion Diet Nutrient Mapping',
        instructions: 'Choose one common exclusion diet (dairy-free, gluten-free, or vegan). List the nutrients at risk of deficiency. For each nutrient, identify 3 food sources that would compensate. Design a single day of meals that meets all requirements without the excluded food group.',
        reflectionQuestions: [
          'Which nutrient was the hardest to replace, and what does this tell you about the importance of planning?',
          'How would you respond to a client who says an IgG test told them to avoid 15 foods?',
          'What is the difference between a medically necessary exclusion and an elective one?',
        ],
      },
    },
    {
      number: 9,
      title: 'Paediatric & Adolescent Nutrition',
      learningOutcome: 'Understand the unique nutritional requirements of children and adolescents, including growth demands, sport-specific considerations, and the development of healthy eating behaviours.',
      assessmentCriteria: [
        'Describe how nutritional requirements differ during childhood growth phases',
        'Explain the risks of restrictive dieting and energy deficiency in young athletes',
        'Design age-appropriate nutrition strategies that support growth, performance, and a healthy relationship with food',
      ],
      content: [
        {
          heading: 'Growth and Nutritional Demands',
          paragraphs: [
            'Children and adolescents are not small adults — their nutritional requirements are fundamentally different. During growth periods (particularly infancy, early childhood, and the pubertal growth spurt), energy and nutrient demands are disproportionately high relative to body size. A 14-year-old male during peak growth velocity may need 2,800-3,200 kcal/day — sometimes more than their parents — simply to support growth, let alone sport participation.',
            'Key nutrients during growth include calcium and vitamin D (bone formation), iron (blood volume expansion, especially in menstruating girls), zinc (immune function and growth), and protein (muscle and tissue development). Caloric restriction during growth can permanently impair height attainment, bone density, and hormonal development. Weight loss diets are almost never appropriate for growing children.',
          ],
        },
        {
          heading: 'Young Athletes — RED-S and Energy Availability',
          paragraphs: [
            'Relative Energy Deficiency in Sport (RED-S) is a syndrome caused by insufficient energy availability relative to exercise expenditure. It is not limited to eating disorders — it can occur in well-meaning young athletes who simply do not eat enough for their training load. Consequences include impaired growth, stress fractures, menstrual dysfunction, weakened immunity, and mental health deterioration.',
            'Signs of RED-S include recurrent illness, stress fractures, delayed puberty, loss of menstrual period (amenorrhoea), poor concentration, and stalled performance despite increasing training. Coaches who prescribe caloric restriction or weight-making strategies for young athletes cause profound harm. The priority for young athletes is always: eat enough to support growth AND training, with emphasis on food quality rather than restriction.',
          ],
        },
        {
          heading: 'Building Healthy Eating Behaviours',
          bullets: [
            'Avoid labelling foods as "good" or "bad" — this creates food anxiety and moral associations with eating that persist into adulthood',
            'Model healthy eating rather than prescribing it — children learn more from observing adults than from instructions',
            'Never use food as reward or punishment — this creates emotional eating patterns',
            'Encourage variety through exposure without pressure — research shows it can take 15-20 exposures for a child to accept a new food',
            'Involve children in food preparation — this increases willingness to try new foods and builds practical nutrition skills',
            'Prioritise eating together — family meals are consistently associated with better dietary quality and healthier weight in children',
            'For young athletes: frame nutrition as "fuel for performance" rather than body weight management',
          ],
        },
      ],
      unbreakableInsight: 'The eating habits and attitudes formed in childhood last a lifetime. Every adult with a difficult relationship with food was once a child who learned that food was something to fear, control, or earn.',
      coachNote: 'If a parent asks you to put their child on a diet, proceed with extreme caution. Caloric restriction in growing children is rarely appropriate and can cause lasting harm. Focus on food quality, activity, and family eating habits — not calories.',
      practicalTask: {
        title: 'Youth Nutrition Strategy',
        instructions: 'Design a nutrition plan for a 14-year-old who trains 4 times per week in their chosen sport. The plan should support growth, training, and recovery without any restrictive language. Include strategies for school lunches, pre/post-training nutrition, and family meals.',
        reflectionQuestions: [
          'How does this plan differ from one you would design for an adult athlete?',
          'What would you do if a young athlete told you they were skipping meals to "make weight" or "get lean"?',
          'How can parents and coaches create an environment that promotes healthy eating without obsession?',
        ],
      },
    },
  ],
};

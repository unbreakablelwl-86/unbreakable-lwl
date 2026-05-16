import type { Unit } from '../types';
import ch1FatSolubleVitamins from '@/assets/university/nutl3-u2-ch1-fat-soluble-vitamins.png';
import ch1VitaminD from '@/assets/university/nutl3-u2-ch1-vitamin-d.png';
import ch1FatSolubleAEK from '@/assets/university/nutl3-u2-ch1-fat-soluble-aek.png';
import ch2WaterSolubleVitamins from '@/assets/university/nutl3-u2-ch2-water-soluble-vitamins.png';
import ch2IronAbsorption from '@/assets/university/nutl3-u2-ch2-iron-absorption.png';
import ch2ZincMagnesium from '@/assets/university/nutl3-u2-ch2-zinc-magnesium.png';
import ch3Supplementation from '@/assets/university/nutl3-u2-ch3-supplementation.png';
import ch3Creatine from '@/assets/university/nutl3-u2-ch3-creatine.png';
import ch3SupplementRedflags from '@/assets/university/nutl3-u2-ch3-supplement-redflags.png';
import ch4SpecialPopulations from '@/assets/university/nutl3-u2-ch4-special-populations.png';
import ch4PregnancyFoods from '@/assets/university/nutl3-u2-ch4-pregnancy-foods.png';
import ch4AgeingNutrition from '@/assets/university/nutl3-u2-ch4-ageing-nutrition.png';
import ch5RestrictedDiets from '@/assets/university/nutl3-u2-ch5-restricted-diets.png';
import ch5ProteinComplementation from '@/assets/university/nutl3-u2-ch5-protein-complementation.png';
import ch5Allergens from '@/assets/university/nutl3-u2-ch5-allergens.png';
import ch6ClinicalAwareness from '@/assets/university/nutl3-u2-ch6-clinical-awareness.png';
import ch6ScopeBoundaries from '@/assets/university/nutl3-u2-ch6-scope-boundaries.png';
import ch6ReferralPathway from '@/assets/university/nutl3-u2-ch6-referral-pathway.png';

export const nutritionL3Unit2: Unit = {
  number: 2,
  title: 'Micronutrients, Supplementation & Special Populations',
  description: 'Explore the advanced roles of vitamins and minerals, evaluate the evidence behind common supplements, and understand nutritional considerations for special populations.',
  chapters: [
    {
      number: 1,
      title: 'Fat-Soluble Vitamins — Advanced Roles',
      learningOutcome: 'Understand the advanced functions, toxicity risks, and practical intake strategies for vitamins A, D, E, and K.',
      assessmentCriteria: [
        'Describe the unique functions and food sources of each fat-soluble vitamin',
        'Explain why fat-soluble vitamins carry a risk of toxicity that water-soluble vitamins generally do not',
        'Discuss the prevalence and consequences of vitamin D deficiency in the UK',
      ],
      content: [
        {
          heading: 'Why Fat-Soluble Vitamins Are Different',
          paragraphs: [
            'Fat-soluble vitamins (A, D, E, and K) are absorbed alongside dietary fat and stored in your liver and adipose tissue. Unlike water-soluble vitamins, which are excreted in urine when consumed in excess, fat-soluble vitamins accumulate — making both deficiency and toxicity possible.',
            'This storage capacity means you do not need to consume them every single day, but chronic under-consumption or over-supplementation can cause significant problems over time.',
          ],
          imageUrl: ch1FatSolubleVitamins,
          imageAlt: 'Fat-soluble vitamins A, D, E, K comparison table',
        },
        {
          heading: 'Vitamin D — The UK Deficiency Crisis',
          paragraphs: [
            'Vitamin D is synthesised in your skin when exposed to UVB radiation from sunlight. In the UK, from October to March, the sun is too low in the sky for adequate UVB exposure — meaning most people cannot produce sufficient vitamin D for approximately half the year.',
            'Public Health England recommends that all UK adults consider supplementing with 10 micrograms (400 IU) of vitamin D daily during autumn and winter. Many experts argue that active individuals may benefit from higher doses (1,000–2,000 IU), though this should be guided by blood test results rather than guesswork.',
          ],
          bullets: [
            'Vitamin D supports calcium absorption, bone health, immune function, and muscle function',
            'Deficiency symptoms include fatigue, muscle weakness, bone pain, and increased infection risk',
            'Groups at higher risk — people with darker skin, those who cover most of their skin, people who spend little time outdoors, and older adults',
            'Food sources are limited — oily fish, egg yolks, fortified cereals and spreads provide small amounts',
          ],
          imageUrl: ch1VitaminD,
          imageAlt: 'UK vitamin D deficiency: October to March UVB gap',
        },
        {
          heading: 'Vitamins A, E, and K',
          paragraphs: [
            'Vitamin A supports vision, immune function, and skin health. It is found as retinol in animal foods (liver, dairy, eggs) and as beta-carotene in plant foods (carrots, sweet potatoes, spinach). Excessive supplementation of preformed retinol can be toxic — particularly dangerous during pregnancy.',
            'Vitamin E acts as an antioxidant, protecting cell membranes from oxidative damage. Deficiency is rare in developed countries, and supplementation has shown limited benefit in well-nourished populations. Food sources include nuts, seeds, and plant oils.',
            'Vitamin K is essential for blood clotting (K1) and bone metabolism (K2). K1 is found in green leafy vegetables, while K2 is produced by gut bacteria and found in fermented foods. Deficiency is uncommon in healthy adults but can occur with certain medications or gut conditions.',
          ],
          imageUrl: ch1FatSolubleAEK,
          imageAlt: 'Vitamins A, E, K: sources, functions, and risks',
        },
      ],
      unbreakableInsight: 'If you live in the UK and you are not supplementing vitamin D from October to March, you are almost certainly deficient. This is not a wellness trend — it is a public health recommendation backed by robust evidence.',
      coachNote: 'Get your vitamin D levels tested annually. Supplementing blindly is better than not supplementing at all, but knowing your actual levels allows you to dose appropriately.',
      practicalTask: {
        title: 'Fat-Soluble Vitamin Check',
        instructions: 'Review your current diet and supplementation. For each fat-soluble vitamin, identify your primary food sources and assess whether you are likely meeting the recommended intake.',
        reflectionQuestions: [
          'Are you currently supplementing vitamin D? If not, why?',
          'Do you consume at least two portions of oily fish per week?',
          'Are there any fat-soluble vitamins where your intake might be excessive?',
        ],
      },
    },
    {
      number: 2,
      title: 'Water-Soluble Vitamins & Minerals',
      learningOutcome: 'Understand the roles, sources, and deficiency risks of key water-soluble vitamins and essential minerals for active individuals.',
      assessmentCriteria: [
        'Explain the roles of B vitamins in energy metabolism',
        'Describe the importance of iron, zinc, and magnesium for active individuals',
        'Identify populations at risk of specific micronutrient deficiencies',
      ],
      content: [
        {
          heading: 'B Vitamins and Energy Metabolism',
          paragraphs: [
            'The B vitamin group (B1, B2, B3, B5, B6, B7, B9, B12) plays essential roles in energy metabolism — they act as coenzymes in the pathways that convert carbohydrates, fats, and proteins into usable ATP. This does not mean supplementing B vitamins gives you "more energy" — it means deficiency impairs your ability to utilise the energy from food.',
            'B12 is of particular concern for vegans and vegetarians, as it is found almost exclusively in animal products. Deficiency develops slowly (the liver stores several years\' worth) but causes irreversible nerve damage if left untreated. All vegans should supplement B12 — this is non-negotiable.',
          ],
          imageUrl: ch2WaterSolubleVitamins,
          imageAlt: 'B vitamins and energy metabolism pathways',
        },
        {
          heading: 'Iron — More Than Just Anaemia',
          paragraphs: [
            'Iron is essential for oxygen transport (via haemoglobin), energy production, and immune function. Iron deficiency is the most common nutritional deficiency worldwide and is particularly prevalent among women of reproductive age, endurance athletes, and those on restrictive diets.',
            'There are two forms of dietary iron: haem iron (from animal sources — red meat, liver, shellfish) and non-haem iron (from plant sources — lentils, spinach, fortified cereals). Haem iron is absorbed approximately 2–3 times more efficiently than non-haem iron. Consuming vitamin C alongside non-haem iron sources significantly improves absorption.',
          ],
          bullets: [
            'Symptoms of deficiency — Fatigue, breathlessness, pallor, reduced exercise capacity, frequent infections',
            'High-risk groups — Menstruating women, pregnant women, endurance athletes (due to foot-strike haemolysis and sweat losses), vegans and vegetarians',
            'Iron absorption inhibitors — Tannins (tea, coffee), phytates (wholegrains, legumes), calcium',
            'Iron absorption enhancers — Vitamin C, haem iron consumed alongside non-haem iron',
          ],
          imageUrl: ch2IronAbsorption,
          imageAlt: 'Iron absorption: haem vs non-haem, enhancers vs inhibitors',
        },
        {
          heading: 'Zinc and Magnesium',
          paragraphs: [
            'Zinc supports immune function, protein synthesis, wound healing, and testosterone production. Deficiency is associated with impaired immune response, poor wound healing, and reduced appetite. Oysters are the richest source, followed by red meat, poultry, beans, and nuts.',
            'Magnesium is involved in over 300 enzymatic reactions, including muscle contraction, nerve function, and energy production. Active individuals may have increased magnesium needs due to losses through sweat. Deficiency symptoms include muscle cramps, fatigue, and poor sleep quality. Good sources include dark leafy greens, nuts, seeds, and wholegrains.',
          ],
          imageUrl: ch2ZincMagnesium,
          imageAlt: 'Zinc and magnesium: roles, sources, and deficiency signs',
        },
      ],
      unbreakableInsight: 'Taking a multivitamin does not compensate for a poor diet. It fills gaps you do not have while missing the fibre, phytonutrients, and food synergies that only whole foods provide. Eat well first, then supplement strategically.',
      coachNote: 'If you are a menstruating woman who trains regularly, get your iron levels checked. Do not self-supplement with iron — excess iron is toxic. Test first, supplement under guidance if needed.',
      practicalTask: {
        title: 'Micronutrient Risk Assessment',
        instructions: 'Based on your diet, sex, age, and activity level, identify three micronutrients where you may be at risk of inadequate intake. Research the best food sources for each and plan how to include them.',
        reflectionQuestions: [
          'Are there any micronutrients you are supplementing without knowing whether you are actually deficient?',
          'How might your training volume increase your need for certain minerals?',
          'If you follow a restrictive diet, which micronutrients require the most attention?',
        ],
      },
    },
    {
      number: 3,
      title: 'Evidence-Based Supplementation',
      learningOutcome: 'Evaluate the evidence behind commonly marketed supplements and identify which have genuine support for health or performance.',
      assessmentCriteria: [
        'Categorise supplements into evidence-supported, potentially useful, and unsupported tiers',
        'Explain the mechanisms and practical applications of creatine and caffeine',
        'Identify red flags in supplement marketing claims',
      ],
      content: [
        {
          heading: 'The Supplement Hierarchy',
          paragraphs: [
            'The sports supplement industry generates billions of pounds annually, yet the vast majority of products have little or no evidence supporting their claims. Understanding the evidence hierarchy helps you avoid wasting money and focus on the few supplements that genuinely work.',
          ],
          imageUrl: ch3Supplementation,
          imageAlt: 'Supplement evidence tiers pyramid',
          bullets: [
            'Tier 1 — Strong evidence: Creatine monohydrate, caffeine, protein supplements (when dietary intake is insufficient), vitamin D (when deficient)',
            'Tier 2 — Moderate evidence: Beta-alanine (for high-intensity endurance), omega-3 fish oil (for inflammation and cardiovascular health), sodium bicarbonate (for repeated sprint performance)',
            'Tier 3 — Limited or no evidence: BCAAs (redundant if protein intake is adequate), glutamine (for healthy individuals), most "fat burners," testosterone boosters, collagen for muscle growth',
          ],
        },
        {
          heading: 'Creatine Monohydrate — The Gold Standard',
          paragraphs: [
            'Creatine is the most researched and consistently supported sports supplement in existence. It works by increasing your muscles\' stores of phosphocreatine, which is used to rapidly regenerate ATP during high-intensity, short-duration efforts — improving your capacity for an extra rep or two per set.',
            'The standard dose is 3–5 grams per day, every day, regardless of training. Loading protocols (20g per day for 5–7 days) saturate stores faster but are not necessary. Creatine monohydrate is the most studied form — newer forms (HCL, ethyl ester, buffered) have no proven advantage despite higher prices.',
          ],
          imageUrl: ch3Creatine,
          imageAlt: 'Creatine monohydrate: mechanism, dosing, and myths debunked',
          bullets: [
            'Proven benefits — Increased strength, power output, and lean mass. Improved recovery between sets',
            'Safety — Extensively studied for over 30 years with no evidence of harm in healthy individuals',
            'Side effects — Initial water retention of 1–2kg (intracellular, not bloating). Some individuals are non-responders',
            'Myths debunked — Does not cause kidney damage, hair loss, or dehydration in healthy individuals',
          ],
        },
        {
          heading: 'Caffeine — Performance in a Cup',
          paragraphs: [
            'Caffeine is a powerful performance enhancer that improves endurance, strength, power, and focus. It works primarily by blocking adenosine receptors in the brain, reducing perceived exertion and delaying fatigue.',
            'An effective dose is 3–6mg per kilogram of body weight, consumed 30–60 minutes before training. For a 70kg person, that is 210–420mg — roughly equivalent to 2–4 cups of coffee. Higher doses do not improve performance further and increase the risk of anxiety, jitteriness, and sleep disruption.',
          ],
        },
        {
          heading: 'Red Flags in Supplement Marketing',
          paragraphs: [
            'Be sceptical of any supplement that claims to "boost testosterone naturally," "burn fat while you sleep," or produce results comparable to pharmaceutical drugs. Legitimate supplements have modest, evidence-based effects — not dramatic transformations.',
            'Proprietary blends that hide individual ingredient doses, endorsements from sponsored athletes, before-and-after photos, and claims that are not supported by independent peer-reviewed research are all warning signs of marketing-driven products rather than science-driven ones.',
          ],
          imageUrl: ch3SupplementRedflags,
          imageAlt: 'Supplement marketing red flags checklist',
        },
      ],
      unbreakableInsight: 'If a supplement worked as well as the marketing claims, it would be a medicine requiring a prescription. The supplements that actually work have modest effects — and that is exactly why they are safe enough to sell without regulation.',
      coachNote: 'Start with creatine monohydrate (3–5g daily) and caffeine before training if tolerated. These two alone cover 90% of what legitimate supplementation can offer most people.',
      practicalTask: {
        title: 'Supplement Audit',
        instructions: 'List every supplement you currently take or have taken in the past year. For each, research whether it falls into Tier 1, 2, or 3 of the evidence hierarchy and calculate the monthly cost.',
        reflectionQuestions: [
          'How much money have you spent on supplements with limited or no evidence?',
          'Are there Tier 1 supplements you are not currently using?',
          'What could you achieve by redirecting supplement spending toward higher-quality food?',
        ],
      },
    },
    {
      number: 4,
      title: 'Nutrition for Pregnancy & Older Adults',
      learningOutcome: 'Understand the specific nutritional requirements, risks, and evidence-based recommendations for pregnant women and older adults.',
      assessmentCriteria: [
        'Describe increased nutritional demands during pregnancy and lactation',
        'Identify foods and supplements to avoid or prioritise during pregnancy',
        'Explain the nutritional challenges and strategies for healthy ageing',
      ],
      content: [
        {
          heading: 'Nutrition During Pregnancy',
          paragraphs: [
            'Pregnancy increases energy requirements by approximately 200 additional calories per day during the third trimester only — the common advice to "eat for two" is a myth that contributes to excessive gestational weight gain. However, while calorie needs increase modestly, micronutrient requirements increase significantly.',
            'Folic acid supplementation (400 micrograms daily) is recommended from the point of trying to conceive until 12 weeks of pregnancy, as it dramatically reduces the risk of neural tube defects. Vitamin D supplementation (10 micrograms daily) is recommended throughout pregnancy and breastfeeding.',
          ],
          imageUrl: ch4SpecialPopulations,
          imageAlt: 'Pregnancy nutritional requirements infographic',
        },
        {
          heading: 'Foods to Avoid During Pregnancy',
          paragraphs: [
            'Certain foods carry specific risks during pregnancy due to the potential for harmful bacteria or substances to affect foetal development.',
          ],
          imageUrl: ch4PregnancyFoods,
          imageAlt: 'Foods to avoid during pregnancy with risk explanations',
          bullets: [
            'Raw or undercooked meat and eggs — Risk of salmonella and toxoplasmosis',
            'Unpasteurised dairy and soft mould-ripened cheeses — Risk of listeria',
            'High-mercury fish (shark, swordfish, marlin) — Mercury can damage the developing nervous system. Limit tuna to two steaks or four medium cans per week',
            'Liver and liver products — Very high in vitamin A (retinol), which in excess can cause birth defects',
            'Alcohol — No safe level has been established during pregnancy. UK Chief Medical Officers advise complete abstinence',
            'Excessive caffeine — Limit to 200mg per day (approximately two cups of coffee)',
          ],
        },
        {
          heading: 'Nutrition for Older Adults',
          paragraphs: [
            'Ageing brings several nutritional challenges: reduced appetite, decreased absorption efficiency, loss of muscle mass (sarcopenia), reduced bone density, and often reduced physical activity. While total calorie needs may decrease, the need for specific nutrients — particularly protein, calcium, vitamin D, and B12 — increases or remains the same.',
            'Sarcopenia — the age-related loss of muscle mass and function — can be significantly slowed through adequate protein intake and resistance training. Older adults may need 1.2–1.6 grams of protein per kilogram of body weight daily, higher than the standard recommendation, to maintain muscle mass.',
          ],
          imageUrl: ch4AgeingNutrition,
          imageAlt: 'Ageing nutrition: sarcopenia, protein needs, and key nutrients',
          bullets: [
            'Protein — Higher per-meal doses (30–40g) may be needed to overcome anabolic resistance in older adults',
            'Calcium — 700mg daily (UK RNI), with additional needs for those at risk of osteoporosis',
            'Vitamin D — Supplementation is recommended year-round for adults over 65',
            'Vitamin B12 — Absorption decreases with age. Supplementation or fortified foods may be necessary',
            'Hydration — Reduced thirst sensation means older adults are at higher risk of dehydration',
          ],
        },
      ],
      unbreakableInsight: 'The nutritional advice that dominates social media is written for young, healthy adults. Pregnancy and ageing have profoundly different requirements — applying generic "fitness nutrition" to these populations is not just unhelpful, it can be dangerous.',
      coachNote: 'If you work with pregnant women or older adults in any capacity, ensure they are following guidance from their GP or midwife. Nutrition advice for these populations requires specific training beyond general fitness qualifications.',
      practicalTask: {
        title: 'Life Stage Nutrition Plan',
        instructions: 'Choose either pregnancy or healthy ageing. Create a one-day meal plan that addresses the specific nutritional requirements and restrictions for that life stage, referencing UK guidelines.',
        reflectionQuestions: [
          'Which micronutrients required the most careful planning?',
          'How did the meal plan differ from what you would typically eat?',
          'What food safety considerations were unique to the chosen life stage?',
        ],
      },
    },
    {
      number: 5,
      title: 'Vegetarian, Vegan & Restricted Diets',
      learningOutcome: 'Understand the nutritional challenges, required supplementation, and practical strategies for managing vegetarian, vegan, and other restricted dietary patterns.',
      assessmentCriteria: [
        'Identify nutrients of concern for vegetarian and vegan diets',
        'Explain the concept of protein complementation and its practical application',
        'Discuss the nutritional management of food allergies and intolerances',
      ],
      content: [
        {
          heading: 'Vegetarian and Vegan Diets — Nutrients of Concern',
          paragraphs: [
            'Well-planned vegetarian and vegan diets can meet all nutritional requirements. However, "well-planned" is the operative phrase. Several nutrients require deliberate attention when animal products are reduced or eliminated entirely.',
          ],
          imageUrl: ch5RestrictedDiets,
          imageAlt: 'Vegan nutrients of concern table',
          bullets: [
            'Vitamin B12 — No reliable plant source exists. All vegans must supplement (at least 10 micrograms daily or 2,000 micrograms weekly)',
            'Iron — Plant-based non-haem iron is less bioavailable. Combine with vitamin C sources and avoid tea/coffee at meals',
            'Omega-3 (EPA/DHA) — Plant ALA converts very poorly. Algae-based EPA/DHA supplements are recommended',
            'Zinc — Lower bioavailability from plant sources due to phytates. Soaking, sprouting, and fermenting improve absorption',
            'Calcium — Ensure adequate intake through fortified plant milks, tofu set with calcium sulphate, and green vegetables',
            'Iodine — Seaweed varies wildly in content. A supplement providing 150 micrograms daily is the most reliable approach',
          ],
        },
        {
          heading: 'Protein Quality and Complementation',
          paragraphs: [
            'Plant proteins are generally "incomplete" — they lack sufficient quantities of one or more essential amino acids. However, different plant proteins have different limiting amino acids. Combining complementary sources (e.g., rice with beans, bread with hummus) throughout the day provides a complete amino acid profile.',
            'The outdated concept of "complete protein combining at every meal" has been replaced by the understanding that your body pools amino acids over the course of 24 hours. You do not need to combine sources at every sitting — but you do need variety across the day.',
          ],
          imageUrl: ch5ProteinComplementation,
          imageAlt: 'Protein complementation: rice and beans, bread and hummus pairings',
        },
        {
          heading: 'Food Allergies and Intolerances',
          paragraphs: [
            'Food allergies involve an immune response (IgE-mediated) and can be life-threatening (anaphylaxis). The 14 major allergens in UK food law must be declared on packaging and in catering. Common allergens include peanuts, tree nuts, milk, eggs, wheat, soy, fish, shellfish, and sesame.',
            'Food intolerances (e.g., lactose intolerance, non-coeliac gluten sensitivity) do not involve the immune system and are not life-threatening, but can cause significant discomfort. Management involves identification through elimination diets (ideally supervised by a dietitian) and appropriate avoidance or substitution.',
          ],
          imageUrl: ch5Allergens,
          imageAlt: 'Food allergies vs intolerances comparison',
          bullets: [
            'Coeliac disease — An autoimmune condition triggered by gluten. Requires lifelong strict gluten avoidance',
            'Lactose intolerance — Inability to digest lactose due to insufficient lactase enzyme. Lactose-free dairy products are an effective alternative',
            'Non-coeliac gluten sensitivity — Symptoms without coeliac diagnosis. Often responds to reducing FODMAPs rather than strictly eliminating gluten',
          ],
        },
      ],
      unbreakableInsight: 'A vegan diet without B12 supplementation is not a healthy diet — it is a B12 deficiency waiting to happen. This is not anti-vegan; it is basic biochemistry. Responsible veganism includes responsible supplementation.',
      coachNote: 'Never assume that someone on a restricted diet has done the nutritional homework. Many people adopt dietary labels without understanding the specific nutrients that require attention.',
      practicalTask: {
        title: 'Restricted Diet Nutrient Plan',
        instructions: 'Design a one-day meal plan for a vegan individual that addresses all six nutrients of concern. Include specific food sources and supplementation where needed.',
        reflectionQuestions: [
          'Which nutrients were hardest to meet through food alone?',
          'How much supplementation was required to complete the nutritional profile?',
          'What practical barriers might someone face in following this plan daily?',
        ],
      },
    },
    {
      number: 6,
      title: 'Clinical Nutrition Awareness',
      learningOutcome: 'Understand when nutritional needs extend beyond general healthy eating guidance and recognise conditions that require specialist referral.',
      assessmentCriteria: [
        'Identify medical conditions that significantly affect nutritional requirements',
        'Explain the scope of practice boundaries between fitness professionals and registered dietitians',
        'Describe the nutritional considerations for type 2 diabetes and cardiovascular disease',
      ],
      content: [
        {
          heading: 'Scope of Practice',
          paragraphs: [
            'Understanding clinical nutrition awareness does not make you a clinical practitioner. In the UK, only registered dietitians (regulated by the HCPC) are qualified to provide medical nutrition therapy. Nutritional therapists, coaches, and personal trainers can provide general healthy eating guidance but must refer clients with medical conditions to appropriate healthcare professionals.',
            'Recognising the boundaries of your competence is a professional responsibility. Providing dietary advice for conditions such as diabetes, kidney disease, eating disorders, or severe food allergies without appropriate qualifications could cause harm and may have legal implications.',
          ],
          imageUrl: ch6ClinicalAwareness,
          imageAlt: 'Nutrition scope of practice diagram',
        },
        {
          heading: 'Type 2 Diabetes — Nutritional Considerations',
          paragraphs: [
            'Type 2 diabetes is characterised by insulin resistance — the body produces insulin but cells respond to it less effectively, resulting in elevated blood glucose levels. Nutritional management focuses on controlling blood glucose through carbohydrate awareness, weight management, and overall dietary quality.',
            'This does not necessarily mean a "low-carb" diet — the evidence supports moderate carbohydrate intake from whole food sources, with emphasis on low-glycaemic-index foods, adequate fibre, and regular meal timing to avoid blood glucose spikes and crashes.',
          ],
          imageUrl: ch6ScopeBoundaries,
          imageAlt: 'When to refer: scope of practice boundaries',
          bullets: [
            'The UK Diabetes Prevention Programme has shown that moderate weight loss (5–7% of body weight) significantly reduces risk of progression from pre-diabetes to type 2 diabetes',
            'Mediterranean dietary patterns consistently show benefits for blood glucose control and cardiovascular risk reduction',
            'Carbohydrate quality matters more than quantity — wholegrain, high-fibre sources are preferred over refined carbohydrates',
          ],
        },
        {
          heading: 'Cardiovascular Disease',
          paragraphs: [
            'Dietary patterns that reduce cardiovascular risk emphasise fruits, vegetables, wholegrains, lean protein, healthy fats (particularly omega-3 and monounsaturated), and limited sodium, added sugar, and saturated fat. The DASH (Dietary Approaches to Stop Hypertension) and Mediterranean diets have the strongest evidence base.',
            'Individual nutrients matter less than overall dietary patterns. Focusing on single nutrients (e.g., "avoid all saturated fat") misses the complexity of how foods interact within the whole diet. A person who eats a balanced, varied diet does not need to obsess over individual components.',
          ],
        },
        {
          heading: 'Eating Disorders — Recognition and Referral',
          paragraphs: [
            'Eating disorders (anorexia nervosa, bulimia nervosa, binge eating disorder, and others) are serious mental health conditions that require specialist treatment. As someone with nutrition knowledge, you are in a position to recognise potential warning signs — but never to diagnose or treat.',
            'Warning signs include extreme dietary restriction, obsessive calorie counting, food rituals, excessive exercise to "compensate" for eating, distorted body image, and significant weight changes. If you suspect someone may be struggling, encourage them to speak with their GP and direct them to Beat — the UK eating disorder charity.',
          ],
          imageUrl: ch6ReferralPathway,
          imageAlt: 'Eating disorder referral pathway: GP, Beat, specialist',
        },
      ],
      unbreakableInsight: 'Knowing when you are out of your depth is not a weakness — it is a professional strength. The most responsible thing you can do is recognise when someone needs help beyond your skillset and point them in the right direction.',
      coachNote: 'Keep a referral list of local registered dietitians, GPs with nutrition interest, and eating disorder services. When in doubt, refer — you can continue supporting someone alongside professional clinical care.',
      practicalTask: {
        title: 'Scope of Practice Scenarios',
        instructions: 'Review three scenarios: (1) A friend asks you for a meal plan to manage their newly diagnosed type 2 diabetes. (2) A training partner mentions they have been skipping meals and exercising excessively. (3) A colleague asks for general advice on eating more vegetables. For each, identify whether it is within scope or requires referral.',
        reflectionQuestions: [
          'How confident are you in recognising the boundary between general advice and clinical territory?',
          'What resources are available in your local area for specialist nutrition support?',
          'How would you handle a situation where someone resists your suggestion to seek professional help?',
        ],
      },
    },
    {
      number: 7,
      title: 'Food Safety & Hygiene',
      learningOutcome: 'Understand the principles of food safety, identify common foodborne hazards, and apply safe food handling practices relevant to meal preparation, sports nutrition, and working with clients.',
      assessmentCriteria: [
        'Identify the main types of foodborne hazards: biological, chemical, and physical',
        'Explain the principles of safe food storage, preparation, and cooking temperatures',
        'Apply food safety knowledge to meal prep scenarios relevant to fitness and sport',
      ],
      content: [
        {
          heading: 'Why Food Safety Matters for Nutrition Professionals',
          paragraphs: [
            'Food safety might seem disconnected from sports nutrition or performance coaching, but it is fundamental. A single bout of foodborne illness can cause days of training disruption, dehydration, muscle catabolism, and immune suppression. For athletes in competition preparation, food poisoning at the wrong time can derail months of work.',
            'If you advise others on nutrition — whether formally or informally — understanding food safety is part of your duty of care. Recommending meal prep strategies, high-protein diets, or specific food combinations carries implicit responsibility for safe handling practices.',
          ],
        },
        {
          heading: 'Types of Food Hazards',
          bullets: [
            'Biological hazards — Bacteria (Salmonella, E. coli, Campylobacter, Listeria), viruses (norovirus), and parasites. The most common cause of foodborne illness. Most are destroyed by proper cooking temperatures',
            'Chemical hazards — Pesticide residues, cleaning product contamination, heavy metals, and allergens. Minimised through proper washing, storage separation, and allergen awareness',
            'Physical hazards — Foreign objects in food: glass, bone fragments, plastic, metal. More relevant in commercial food production but also applicable to home kitchens',
            'Allergens — The 14 major allergens (including gluten, dairy, nuts, soy, eggs) must be considered when preparing food for others. Cross-contamination is as dangerous as direct inclusion',
          ],
        },
        {
          heading: 'Safe Food Handling Principles',
          bullets: [
            'Temperature danger zone — Bacteria multiply rapidly between 8°C and 63°C. Minimise the time food spends in this range. Refrigerate perishables within 2 hours of cooking',
            'Cooking temperatures — Cook poultry to 75°C internal temperature, minced meat to 70°C, and reheat leftovers to at least 70°C throughout. Use a food thermometer — colour is not a reliable indicator',
            'Cold storage — Refrigerator should be at or below 5°C. Freezer at or below -18°C. Store raw meat on the lowest shelf to prevent dripping onto ready-to-eat foods',
            'Meal prep safety — Cooked meal-prepped food should be cooled within 90 minutes, portioned, and refrigerated. Consume within 3–4 days or freeze. Reheating should reach 70°C throughout',
            'Cross-contamination — Use separate chopping boards for raw meat and ready-to-eat foods. Wash hands thoroughly after handling raw meat, eggs, or unwashed vegetables',
            'Personal hygiene — Wash hands before food preparation and after handling raw foods, using the toilet, or touching your face. Tie back hair and cover any cuts with waterproof dressings',
          ],
        },
      ],
      unbreakableInsight: 'The best meal plan in the world is worthless if it gives someone food poisoning. Food safety is not glamorous, but it is non-negotiable — whether you are prepping your own meals or advising others.',
      coachNote: 'If you batch-cook (and you should for consistency), master the basics: cool food quickly, store properly, label with dates, and reheat thoroughly. Most meal-prep-related illness comes from improper cooling or reheating.',
      practicalTask: {
        title: 'Kitchen Safety Audit',
        instructions: 'Conduct a full audit of your own kitchen and meal prep practices. Check: refrigerator temperature (use a thermometer), storage organisation (raw meat location), chopping board hygiene, food dating practices, and reheating methods. Score yourself out of 10 and identify the three highest-risk practices to correct.',
        reflectionQuestions: [
          'Were there any food safety practices you were unaware of or had been ignoring?',
          'How confident are you that your meal prep routine is safe from a food hygiene perspective?',
          'If you were advising a client on meal prep, what food safety guidance would you include?',
        ],
      },
    },
    {
      number: 8,
      title: 'Gut Health & Digestive Optimisation',
      learningOutcome: 'Understand common digestive issues, the relationship between gut health and overall wellbeing, and evidence-based nutritional strategies for optimising digestive function.',
      assessmentCriteria: [
        'Explain how digestive health influences nutrient absorption, immune function, and mental health',
        'Identify common digestive complaints and their nutritional management strategies',
        'Design a gut-supportive nutrition protocol using evidence-based approaches',
      ],
      content: [
        {
          heading: 'Digestion — Where Nutrition Becomes Real',
          paragraphs: [
            'You are not what you eat — you are what you absorb. The most meticulously planned nutrition strategy is only as effective as your digestive system\'s ability to break down, absorb, and utilise the nutrients you consume. Digestive complaints are among the most common issues reported by the general population and athletes alike, yet they are often dismissed or poorly managed.',
            'The gastrointestinal (GI) tract is far more than a processing tube. It is an endocrine organ, an immune barrier, a neurotransmitter factory, and the primary interface between the external environment and your internal physiology. Gut health is whole-body health.',
          ],
        },
        {
          heading: 'Common Digestive Issues & Nutritional Management',
          bullets: [
            'Bloating — Often caused by rapid fibre increase, swallowing air, fermentable carbohydrates (FODMAPs), or food intolerances. Strategy: increase fibre gradually (5g per week), eat slowly, identify trigger foods through elimination',
            'Irritable bowel syndrome (IBS) — Affects 10–15% of the population. Characterised by abdominal pain, bloating, and altered bowel habits. A low-FODMAP diet under professional guidance is the most evidence-based dietary intervention',
            'Acid reflux — Triggered by large meals, high-fat meals, caffeine, alcohol, and eating close to bedtime. Strategy: smaller frequent meals, avoid eating within 3 hours of lying down, identify personal triggers',
            'Exercise-related GI distress — Common in endurance athletes. Caused by reduced blood flow to the gut during exercise. Strategy: avoid high-fibre and high-fat foods 2–3 hours before training, practice race-day nutrition in training, prioritise hydration',
            'Constipation — Usually caused by inadequate fibre, insufficient water intake, low physical activity, or stress. Strategy: 30g+ fibre daily, 2–3L water, regular movement, and stress management',
          ],
        },
        {
          heading: 'Building a Gut-Supportive Diet',
          paragraphs: [
            'A gut-supportive diet is not complicated — it is a diverse, whole-food-based diet that provides the substrates your gut bacteria and digestive system need to function optimally.',
          ],
          bullets: [
            'Diversity — 30+ different plant foods per week feeds a diverse microbiome. Include vegetables, fruits, whole grains, legumes, nuts, seeds, herbs, and spices',
            'Fermented foods — Yoghurt, kefir, sauerkraut, kimchi, and kombucha provide live bacteria that support microbiome diversity. Aim for a serving daily if tolerated',
            'Prebiotic foods — Garlic, onions, leeks, asparagus, bananas, and oats feed beneficial bacteria. These are more important than probiotic supplements for most people',
            'Adequate protein — Gut cells (enterocytes) have the fastest turnover rate of any cells in the body, replacing themselves every 3–5 days. They need amino acids to do this',
            'Hydration — Water is essential for digestive function, from saliva production to stool formation. Dehydration directly impairs digestion',
            'Mindful eating — Eating slowly, chewing thoroughly, and eating without distraction improves digestive efficiency and reduces bloating',
          ],
        },
      ],
      unbreakableInsight: 'Your gut is the gateway to every nutrient your body needs. If the gateway is compromised, nothing downstream — muscle building, fat loss, energy production, immune function — works at full capacity. Fix the foundation first.',
      coachNote: 'If someone complains of persistent bloating, irregular bowel habits, or digestive pain, your first question should be about fibre, water, and eating speed — not about supplements. The basics are boring but they work.',
      practicalTask: {
        title: 'Gut Health Optimisation Plan',
        instructions: 'For two weeks, implement three gut-supportive changes: (1) increase plant food variety toward 30+ per week, (2) add one serving of fermented food daily, (3) eat all meals without screens and chew each bite 15–20 times. Track digestive symptoms (bloating, regularity, energy) daily on a 1–10 scale.',
        reflectionQuestions: [
          'Did any of the three interventions produce a noticeable change in digestive comfort?',
          'How did eating without screens and chewing more slowly affect your experience of meals?',
          'What is your current daily fermented food intake, and how easy was it to add a serving?',
        ],
      },
    },
  ],
};

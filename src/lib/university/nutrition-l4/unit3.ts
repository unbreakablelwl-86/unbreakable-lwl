import type { Unit } from '../types';

export const nutritionL4Unit3: Unit = {
  number: 3,
  title: 'Performance Nutrition & Supplementation',
  description: 'Master the science of fuelling human performance — from evidence-based supplementation to competition nutrition, hydration science, and the physiology of weight manipulation for sport.',
  chapters: [
    {
      number: 1,
      title: 'Evidence-Based Supplementation',
      learningOutcome: 'Evaluate sports supplements using a tiered evidence framework — separating proven ergogenic aids from marketed hype.',
      assessmentCriteria: [
        'Categorise supplements into evidence tiers based on research quality',
        'Describe the mechanisms, dosing, and limitations of tier-one supplements',
        'Identify red flags in supplement marketing and the risks of unregulated products',
      ],
      content: [
        {
          heading: 'The Supplement Tier System',
          paragraphs: [
            'The sports supplement industry is worth over £5 billion in the UK alone — the vast majority of that money is wasted on products with little or no evidence of benefit. A tiered approach separates the proven from the plausible from the pointless. Tier 1 supplements have strong, consistent evidence from multiple well-designed human studies. Tier 2 have promising but incomplete evidence. Tier 3 have little or no evidence, or the evidence is negative.',
            'Even tier-one supplements provide marginal benefits — typically 1-5% improvements. This matters for competitive athletes where fractions of a percent separate medals, but for recreational exercisers, the priority should always be food quality, sleep, and training consistency. No supplement compensates for a poor diet, inadequate sleep, or a bad programme.',
          ],
        },
        {
          heading: 'Tier 1 — Strong Evidence',
          bullets: [
            'Creatine monohydrate — The most researched supplement in sports science. Increases phosphocreatine stores, improving high-intensity performance, power output, and lean mass. 3-5g/day. Loading is optional. Works for strength, power, and repeated sprint performance. Safe for long-term use. Also has emerging evidence for cognitive benefits',
            'Caffeine — 3-6mg/kg body weight 30-60 minutes before exercise. Improves endurance, power, and cognitive function during exercise. Tolerance develops with habitual use. Individual response varies due to CYP1A2 gene variants — some people are "fast metabolisers" (respond well) and others are "slow metabolisers" (may experience anxiety, GI distress)',
            'Protein supplements (whey, casein, plant blends) — Not magic — simply a convenient way to meet protein targets. Whey has rapid absorption kinetics, casein is slower. A well-balanced diet can provide all necessary protein without supplements',
            'Vitamin D — Supplementation recommended for UK residents October-March (10-25μg/day). Genuine deficiency impairs muscle function, immune health, and bone density',
            'Sodium bicarbonate — 0.2-0.3g/kg 60-90 minutes before sustained high-intensity efforts. Buffers hydrogen ions, delaying acidosis. GI side effects are common — test in training first',
          ],
        },
        {
          heading: 'What to Avoid',
          paragraphs: [
            'Proprietary blends hide ingredient doses behind branded names — you cannot assess what you are actually consuming. Fat burners typically contain caffeine, green tea extract, and unproven thermogenics at undisclosed doses, with bold claims and thin evidence. Testosterone boosters marketed to recreational gym-goers have no meaningful effect on testosterone levels in healthy individuals.',
            'The most serious concern with supplements is contamination. Unregulated products — particularly those purchased online or from overseas — have been found to contain unlisted anabolic steroids, stimulants, and heavy metals. For athletes subject to anti-doping testing, contamination can end careers. Use only products certified by Informed Sport or similar third-party testing programmes.',
          ],
        },
      ],
      unbreakableInsight: 'The best supplements are boring — creatine, caffeine, protein, and vitamin D. If a supplement sounds too good to be true, it is. The flashier the marketing, the weaker the evidence.',
      coachNote: 'Never recommend a supplement you have not researched yourself. Check the evidence, check the brand, check for third-party testing certification. Your reputation is linked to your recommendations.',
      practicalTask: {
        title: 'Supplement Audit',
        instructions: 'List every supplement you currently take (or have taken in the past year). For each, research the evidence using Examine.com or PubMed. Classify each as Tier 1, 2, or 3. Calculate the monthly cost of your supplement stack and compare it to what that money could buy in whole food.',
        reflectionQuestions: [
          'Were any of your supplements in Tier 3? How did they end up in your routine?',
          'What would happen if you replaced all Tier 3 supplements with food-based alternatives?',
          'How would you respond to a client who spends £200/month on supplements but eats poorly?',
        ],
      },
    },
    {
      number: 2,
      title: 'Hydration Science',
      learningOutcome: 'Understand the physiology of hydration, the impact of dehydration and overhydration on performance, and evidence-based fluid and electrolyte strategies.',
      assessmentCriteria: [
        'Explain the mechanisms by which dehydration impairs performance',
        'Describe the risks of both dehydration and hyponatraemia',
        'Design practical hydration strategies for different exercise contexts',
      ],
      content: [
        {
          heading: 'How Dehydration Affects Performance',
          paragraphs: [
            'Water constitutes approximately 60% of body mass and is essential for every physiological process. During exercise, thermoregulation (heat dissipation through sweating) is the primary demand on body water. Sweat rates vary enormously — from 0.5 to 2.5 litres per hour depending on exercise intensity, environmental temperature, humidity, fitness level, and individual physiology.',
            'Performance declines measurably at dehydration levels of 2-3% body mass loss. At this level, cardiovascular strain increases (higher heart rate for the same workload), thermoregulatory capacity is impaired (core temperature rises faster), perceived exertion increases, and cognitive function deteriorates. For a 75kg individual, 2% dehydration represents a loss of just 1.5 litres — easily achieved in a 90-minute training session in warm conditions without fluid intake.',
          ],
        },
        {
          heading: 'Hyponatraemia — The Danger of Overdrinking',
          paragraphs: [
            'Exercise-associated hyponatraemia (EAH) occurs when excessive fluid intake dilutes blood sodium below 135 mmol/L. Symptoms range from nausea and headache to seizures, cerebral oedema, and death. EAH is most common in endurance events where slower participants drink at every station "just in case." Several marathon and ultramarathon deaths have been attributed to hyponatraemia, not dehydration.',
            'The message should be nuanced: drink to thirst, not to a predetermined schedule. Thirst is an evolved mechanism that, for most people, adequately regulates fluid intake during exercise. Prescribing "drink 500ml every 15 minutes" regardless of sweat rate, body size, and conditions is not evidence-based and can be dangerous.',
          ],
        },
        {
          heading: 'Practical Hydration Strategies',
          bullets: [
            'Pre-exercise: Drink 5-7ml/kg body weight 2-4 hours before exercise. Urine should be pale straw-coloured, not clear',
            'During exercise: Drink to thirst. For sessions over 60 minutes, 400-800ml/hour is a general range — adjusted to individual sweat rate',
            'Post-exercise: Replace 150% of fluid lost (weigh before and after). Include sodium to aid retention — a salty meal or electrolyte drink',
            'Electrolytes: Sodium is the primary electrolyte lost in sweat (average 1g/L of sweat). Sports drinks (6-8% carbohydrate + sodium) are beneficial for sessions over 60-90 minutes but unnecessary for shorter sessions',
            'Sweat testing: Weigh nude before and after a 60-minute session with known fluid intake. Weight lost (g) + fluid consumed (ml) = sweat rate (ml/hour). This personalises hydration strategy',
            'Daily hydration: 35ml/kg body weight as a baseline, increased for training days, heat, and altitude',
          ],
        },
      ],
      unbreakableInsight: 'Hydration is individual, not universal. The person who drinks too little and the person who drinks too much are both making the same mistake — ignoring their own body\'s signals in favour of generic advice.',
      coachNote: 'Teach clients to monitor urine colour as a simple hydration indicator. Pale straw = well hydrated. Dark = drink more. Clear = possibly overhydrating. This simple tool prevents both extremes.',
      practicalTask: {
        title: 'Personal Sweat Rate Test',
        instructions: 'Perform a sweat rate test: weigh yourself (nude or in minimal clothing) before and after a 60-minute training session. Record all fluid consumed during the session. Calculate: (pre-weight - post-weight in grams) + fluid consumed (ml) = sweat rate (ml/hour). Repeat in different conditions (hot/cold, high/low intensity).',
        reflectionQuestions: [
          'Was your sweat rate higher or lower than you expected?',
          'How would your hydration strategy differ between a winter gym session and a summer outdoor run?',
          'Why is drinking to thirst generally more appropriate than following a fixed fluid schedule?',
        ],
      },
    },
    {
      number: 3,
      title: 'Competition Nutrition & Fuelling Strategy',
      learningOutcome: 'Design comprehensive nutrition strategies for competition day — from carbohydrate loading to intra-event fuelling, and recovery nutrition for multi-day events.',
      assessmentCriteria: [
        'Explain the principles and protocols of carbohydrate loading',
        'Design pre-competition, intra-competition, and post-competition nutrition plans',
        'Adapt competition nutrition for different sport types and durations',
      ],
      content: [
        {
          heading: 'Carbohydrate Loading',
          paragraphs: [
            'Carbohydrate loading (glycogen supercompensation) is a strategy to maximise muscle glycogen stores before endurance events lasting over 90 minutes. The modern protocol is simple: 10-12g carbohydrate per kg body weight per day for 36-48 hours before the event, combined with training taper. This can increase glycogen stores by 50-100% compared to a normal mixed diet.',
            'Carb loading is only relevant for prolonged endurance events — it provides no benefit for sprint events, team sports under 60 minutes, or strength sports. Body weight will increase by 1-2kg during loading (each gram of glycogen stores 3g of water) — athletes should expect this and not mistake it for fat gain. The extra weight is fuel and fluid, both of which will be used during the event.',
          ],
        },
        {
          heading: 'Race Day Nutrition',
          bullets: [
            'Pre-event meal: 1-4g/kg carbohydrate 3-4 hours before start. Familiar, low-fibre, low-fat foods. Nothing new on race day — ever',
            'Pre-event snack: Optional 30-60g carbohydrate 30-60 minutes before start. Some athletes perform better with this; others experience rebound hypoglycaemia. Test in training',
            'During events <60 minutes: Water only. No fuelling needed — glycogen stores are sufficient',
            'During events 60-150 minutes: 30-60g carbohydrate per hour. Gels, sports drinks, or easily digestible food',
            'During events 150+ minutes: Up to 90g carbohydrate per hour using multiple transportable carbohydrates (glucose + fructose in 2:1 ratio). This requires gut training — start at 30g/hour and build tolerance over weeks',
            'Post-event: 1-1.2g/kg carbohydrate + 0.3g/kg protein within 30-60 minutes. Critical for multi-day events or tournaments with short turnaround',
          ],
        },
        {
          heading: 'Sport-Specific Adaptations',
          paragraphs: [
            'Endurance sports (marathon, cycling, triathlon) demand the highest carbohydrate intakes and the most structured fuelling plans. Team sports (football, rugby) require periodic carbohydrate intake during breaks but benefit more from pre-match glycogen loading. Strength sports (powerlifting, weightlifting) have minimal intra-competition fuelling needs but benefit from strategic caffeine timing and maintaining hydration across long competition days.',
            'Combat sports and weight-category sports present unique challenges: athletes often deliberately dehydrate and restrict food to "make weight." Rapid weight cutting (>5% body mass in the final week) impairs performance, increases injury risk, and in extreme cases has caused death. Evidence-based approaches minimise the weight cut, rehydrate intelligently, and refuel adequately between weigh-in and competition.',
          ],
        },
      ],
      unbreakableInsight: 'The best nutrition strategy on race day is the one you have practised dozens of times in training. Nothing new on competition day — ever. Your stomach needs training just like your muscles.',
      coachNote: 'Competition nutrition anxiety is common. Build your athlete\'s confidence by rehearsing the exact competition nutrition plan during training sessions, using the exact products and timing they will use on the day.',
      practicalTask: {
        title: 'Competition Nutrition Blueprint',
        instructions: 'Choose an endurance event (real or hypothetical) lasting over 2 hours. Design the full nutrition plan: 48 hours pre-event (carb loading), pre-event meal, intra-event fuelling strategy (hourly), and post-event recovery meal. Specify exact foods, quantities, and timing.',
        reflectionQuestions: [
          'How would this plan change for a 45-minute event versus a 4-hour event?',
          'What would you do if the athlete experienced GI distress during competition fuelling?',
          'How would you adjust this plan for a team sport tournament with 3 games in one day?',
        ],
      },
    },
    {
      number: 4,
      title: 'Weight Manipulation for Sport',
      learningOutcome: 'Understand the science, risks, and evidence-based methods of weight manipulation in weight-category and aesthetic sports.',
      assessmentCriteria: [
        'Differentiate between acute weight cutting and chronic weight management',
        'Describe the physiological risks of rapid weight cutting',
        'Design safe weight management strategies for competitive athletes',
      ],
      content: [
        {
          heading: 'Weight Categories and Culture',
          paragraphs: [
            'Weight manipulation is endemic in combat sports (boxing, MMA, wrestling, judo), Olympic weightlifting, powerlifting, rowing (lightweight), and aesthetic sports (bodybuilding, physique). The culture often normalises extreme practices — severe dehydration, saunas, laxatives, and prolonged fasting in the 24-72 hours before weigh-in. These practices are dangerous, performance-impairing, and in documented cases, fatal.',
            'The fundamental question every athlete and coach must ask is: does cutting weight actually improve competitive performance? In many cases, the answer is no. If the weight cut leaves the athlete dehydrated, glycogen-depleted, mentally fatigued, and physically weakened, competing in a lower weight class provides no advantage. Walking around within 3-5% of competition weight is far superior to carrying 10%+ excess and cutting aggressively.',
          ],
        },
        {
          heading: 'Evidence-Based Weight Management',
          bullets: [
            'Chronic weight management — Gradually adjust body composition in the off-season through modest caloric deficit (300-500 kcal/day). Aim for 0.5-1% body weight loss per week to preserve lean mass. This is the gold standard',
            'Acute weight cutting — If necessary, limit to 2-3% body weight in the final week. Use water loading protocols (hyperhydration followed by restriction) rather than thermal dehydration (saunas)',
            'Water loading protocol — Drink 100ml/kg/day for 3 days, then restrict to 15ml/kg on the final day. This suppresses aldosterone, promoting natural water excretion',
            'Fibre and sodium manipulation — Reduce fibre 2-3 days before weigh-in to reduce gut content. Reduce sodium 24 hours before to reduce water retention',
            'Rehydration after weigh-in — Critical. Drink 1.5L per kg lost, including sodium (oral rehydration solutions). Begin carbohydrate refuelling immediately. Allow 12-24 hours between weigh-in and competition for optimal recovery',
            'Never cut weight for youth athletes — Full stop. Growing bodies require adequate nutrition. Weight manipulation in adolescents risks permanent developmental harm',
          ],
        },
        {
          heading: 'Contest Preparation — Bodybuilding',
          paragraphs: [
            'Bodybuilding contest preparation is a structured process of fat loss over 12-20+ weeks to achieve extremely low body fat percentages (5-8% for males, 12-16% for females). This requires sustained caloric restriction and is inherently unhealthy at the extreme end — it is a competitive practice, not a health goal. Hormonal disruption, immune suppression, muscle loss, and psychological effects (depression, irritability, obsessive thoughts about food) are expected side effects.',
            'Evidence-based prep includes: 0.5-1% body weight loss per week, protein at 2.3-3.1g/kg lean mass, carbohydrate and fat balanced according to training needs and preference, refeed days at maintenance every 1-2 weeks, and a structured reverse diet post-competition. The post-competition period is psychologically the most dangerous — binge eating, rapid weight regain, and body dysmorphia are extremely common. Support systems and realistic expectations are essential.',
          ],
        },
      ],
      unbreakableInsight: 'The bravest thing a fighter can do is compete at their natural weight. Cutting weight is not toughness — it is a gamble with your health that often costs more performance than it gains.',
      coachNote: 'If an athlete insists on cutting weight, ensure it is done safely and minimally. Your responsibility is harm reduction. If practices become extreme (severe dehydration, laxative use, sauna abuse), you have a duty to intervene.',
      practicalTask: {
        title: 'Weight Management Plan Comparison',
        instructions: 'Design two weight management scenarios for a 75kg combat sport athlete competing at 70kg: (a) a safe, evidence-based 8-week chronic approach, and (b) an aggressive 1-week acute cut. Compare the physiological effects, performance implications, and risks of each.',
        reflectionQuestions: [
          'Which approach would you recommend and why?',
          'What would you do if an athlete demanded an extreme cut against your advice?',
          'How does weight manipulation in sport differ from the weight loss goals of a general population client?',
        ],
      },
    },
    {
      number: 5,
      title: 'Nutrient Timing & Meal Distribution',
      learningOutcome: 'Evaluate the evidence for nutrient timing strategies — distinguishing meaningful effects from overhyped precision that adds complexity without benefit.',
      assessmentCriteria: [
        'Assess the evidence for the "anabolic window" and post-exercise nutrition',
        'Explain how meal frequency and distribution affect muscle protein synthesis',
        'Design practical meal timing strategies for different goals and schedules',
      ],
      content: [
        {
          heading: 'The Anabolic Window — Reality Check',
          paragraphs: [
            'The "30-minute anabolic window" — the idea that you must consume protein immediately after training or miss your gains — has been dramatically overstated. The post-exercise period does offer enhanced muscle protein synthesis, but the window is measured in hours, not minutes. For most people who consumed a mixed meal 2-3 hours before training, there is no urgency to consume protein immediately after.',
            'The true importance of post-exercise nutrition depends on context. For fasted training, consuming protein within 1-2 hours is genuinely beneficial. For someone who ate 2 hours before training, post-workout protein timing is a minor consideration. For athletes training twice per day, rapid post-training nutrition (protein + carbohydrate) is critical for recovery before the second session. Context determines importance.',
          ],
        },
        {
          heading: 'Meal Frequency and Protein Distribution',
          paragraphs: [
            'Total daily protein intake is far more important than meal timing for muscle growth and retention. However, protein distribution does matter to a degree. Research shows that distributing protein evenly across 3-5 meals (each containing 0.3-0.5g/kg or approximately 25-40g) maximises the total daily muscle protein synthesis response compared to consuming the same total in 1-2 large meals.',
            'The "muscle full" effect means there is a ceiling to how much protein can stimulate muscle protein synthesis in a single meal — approximately 0.4-0.55g/kg for most people. Excess protein in a single meal is not wasted (it is used for energy, gluconeogenesis, and other metabolic processes) but it does not further stimulate muscle building. This makes the case for spreading protein intake across the day rather than concentrating it.',
          ],
        },
        {
          heading: 'Practical Timing Strategies',
          bullets: [
            'General population: 3-4 meals per day, each containing 25-40g protein. Timing is secondary to total intake and consistency',
            'Strength athletes: Pre-training meal 2-3 hours before (mixed meal). Post-training protein within 2 hours if fasted or if next meal is 3+ hours away',
            'Endurance athletes: Carbohydrate availability before and during prolonged training is more important than post-training protein timing',
            'Fat loss phases: Higher meal frequency (4-5 smaller meals) may help manage hunger and prevent overeating. Protein at every meal supports satiety and muscle retention',
            'Intermittent fasting: Can achieve similar results to traditional meal patterns if total protein and calories are matched. However, compressed eating windows make hitting protein targets harder',
            'Pre-sleep protein: 30-40g casein before bed has evidence for increasing overnight muscle protein synthesis. Practical for athletes in caloric surplus',
          ],
        },
      ],
      unbreakableInsight: 'Nutrient timing is the icing on the cake — not the cake itself. Get your daily totals right first. Optimise timing second. Obsessing over timing while your overall diet is poor is like polishing the hubcaps on a car with no engine.',
      coachNote: 'Resist the temptation to overcomplicate meal timing for clients. Most people benefit more from consistent eating patterns and adequate total protein than from precisely timed meals. Complexity reduces adherence.',
      practicalTask: {
        title: 'Meal Timing Optimisation',
        instructions: 'Record your current meal times and protein content for 3 days. Calculate whether your protein is evenly distributed or concentrated in one meal. Design an optimised daily eating schedule that distributes protein across 4 meals, with strategic timing around your training.',
        reflectionQuestions: [
          'Is your protein currently well-distributed or skewed toward dinner (as is common)?',
          'How would you adjust your timing if you trained early morning in a fasted state?',
          'What would you prioritise first for a client: total protein intake or timing? Why?',
        ],
      },
    },
    {
      number: 6,
      title: 'Ergogenic Aids & Performance Enhancers',
      learningOutcome: 'Explore advanced ergogenic strategies beyond basic supplementation — including beetroot juice, beta-alanine, HMB, and the physiological basis of their effects.',
      assessmentCriteria: [
        'Explain the mechanisms of action for tier-two ergogenic aids',
        'Evaluate the evidence quality and practical significance of each aid',
        'Determine when ergogenic aids are appropriate versus unnecessary',
      ],
      content: [
        {
          heading: 'Beta-Alanine',
          paragraphs: [
            'Beta-alanine is a non-essential amino acid that increases intramuscular carnosine concentrations. Carnosine acts as an intracellular buffer, neutralising hydrogen ions produced during high-intensity exercise. Higher carnosine = greater acid-buffering capacity = sustained performance during efforts lasting 1-10 minutes (rowing intervals, repeated sprints, high-rep sets).',
            'Dosing: 3.2-6.4g per day, split into smaller doses to minimise paraesthesia (the harmless tingling sensation). Loading takes 4-8 weeks before meaningful carnosine increases occur. Beta-alanine is most effective for repeated high-intensity efforts in the 1-10 minute range. It provides minimal benefit for maximal single efforts (1RM) or prolonged low-intensity exercise.',
          ],
        },
        {
          heading: 'Beetroot Juice (Dietary Nitrate)',
          paragraphs: [
            'Dietary nitrate — concentrated in beetroot juice — is converted to nitric oxide (NO) in the body. NO dilates blood vessels, improving blood flow and reducing the oxygen cost of exercise. Meta-analyses show a 1-3% improvement in time-to-exhaustion in endurance exercise, particularly in recreational and moderately trained athletes. Effects are smaller in highly trained athletes.',
            'Dosing: 6-8 mmol nitrate (approximately 500ml beetroot juice or a concentrated shot) 2-3 hours before exercise. Chronic supplementation (3-7 days) appears more effective than acute single doses. Antibacterial mouthwash disrupts nitrate conversion by killing oral bacteria essential for the process — avoid mouthwash before exercise if using nitrate supplementation.',
          ],
        },
        {
          heading: 'Other Ergogenic Aids',
          bullets: [
            'HMB (beta-hydroxy beta-methylbutyrate) — A metabolite of leucine. Evidence supports anti-catabolic effects during caloric restriction or in untrained individuals. Benefits for well-trained athletes eating adequate protein are minimal. Dose: 3g/day',
            'Citrulline malate — Increases arginine and nitric oxide production. May improve high-rep resistance training performance (15+ reps). 6-8g 60 minutes before training. Evidence is promising but not definitive',
            'Tart cherry juice — Contains anthocyanins with anti-inflammatory properties. May reduce muscle soreness and speed recovery between sessions. 30ml concentrate twice daily around training. Best evidence is for repeated days of intense training',
            'Ashwagandha — Adaptogenic herb with moderate evidence for reducing cortisol, improving recovery, and modest strength gains. 300-600mg daily. Evidence is growing but not yet tier-one quality',
            'Glycerol — Hyperhydrating agent that helps retain fluid before prolonged exercise in heat. 1.2g/kg with 26ml/kg water 2 hours before exercise. Practical application is limited to extreme endurance events in hot conditions',
          ],
        },
      ],
      unbreakableInsight: 'Advanced ergogenic aids provide marginal gains — 1-3% at best. They belong at the top of the performance pyramid, not the base. Master the basics (nutrition, sleep, training) before investing in the margins.',
      coachNote: 'Clients who ask about advanced supplements before their diet and training are dialled in are focusing on the wrong things. Redirect the conversation: "Have you consistently hit your protein target and slept 7+ hours for the past month? Start there."',
      practicalTask: {
        title: 'Ergogenic Aid Cost-Benefit Analysis',
        instructions: 'Select two tier-two ergogenic aids relevant to your sport or training. For each, research the evidence, recommended dose, cost, and practical application. Create a decision matrix: is the investment of time, money, and complexity justified by the likely benefit for your specific goals?',
        reflectionQuestions: [
          'Would the same money and effort produce greater returns if invested in food quality or sleep improvement?',
          'How would you explain the concept of "marginal gains" to a client asking about advanced supplements?',
          'At what level of training and nutritional consistency do ergogenic aids become worth considering?',
        ],
      },
    },
    {
      number: 7,
      title: 'Nutrition for Endurance Performance',
      learningOutcome: 'Master the specific nutritional demands of endurance sports — from training fuel to race-day execution and recovery between events.',
      assessmentCriteria: [
        'Calculate carbohydrate requirements for different training volumes',
        'Design periodised nutrition plans that match fuel availability to training demands',
        'Explain the principles and risks of training with low glycogen availability',
      ],
      content: [
        {
          heading: 'Fuelling the Endurance Athlete',
          paragraphs: [
            'Endurance athletes have the highest carbohydrate requirements of any sport — 5-12g/kg/day depending on training volume. A marathon runner covering 100km per week may need 7-10g/kg, while an Ironman triathlete in peak training might require 10-12g/kg. These are substantially higher than general population guidelines and require deliberate planning to achieve.',
            'The concept of "fuel for the work required" (periodised carbohydrate availability) means adjusting carbohydrate intake based on the training session. High-intensity or long-duration sessions require high carbohydrate availability before, during, and after. Low-intensity recovery sessions can be performed with lower carbohydrate availability. This targeted approach maximises both performance on key sessions and metabolic adaptation on easy days.',
          ],
        },
        {
          heading: 'Train Low, Compete High',
          paragraphs: [
            'Training with low glycogen availability ("train low") enhances mitochondrial biogenesis, fat oxidation capacity, and metabolic efficiency. Strategies include sleeping low (depleting glycogen in an evening session, skipping carbohydrate overnight, training the next morning), twice-per-day training (second session with depleted glycogen), and fasted training. These approaches improve the body\'s capacity to oxidise fat — sparing glycogen during competition.',
            'However, "train low" has significant caveats. It impairs high-intensity performance, increases cortisol and protein breakdown, suppresses immune function, and can increase injury risk. It should be used strategically on selected easy sessions — never on key quality sessions where performance matters. Competition should always use high carbohydrate availability. The mantra is "train low, compete high."',
          ],
        },
        {
          heading: 'Practical Endurance Nutrition',
          bullets: [
            'Light training days (<1 hour, low intensity): 3-5g/kg carbohydrate. Focus on protein and vegetables. Fat from whole food sources',
            'Moderate training days (1-2 hours): 5-7g/kg carbohydrate. Pre-training meal essential. Post-training recovery drink or meal with carbohydrate + protein',
            'Heavy training days (2-4 hours): 7-10g/kg carbohydrate. Fuelling during training (30-60g/hour after the first hour). Aggressive post-training recovery nutrition',
            'Race day: Carb load 36-48 hours prior (10-12g/kg/day). Pre-race meal 3 hours before. During race: 60-90g/hour (glucose:fructose 2:1 for events 150+ minutes)',
            'Recovery between events (tournaments, multi-stage races): 1-1.2g/kg carbohydrate per hour for 4 hours post-event. 0.3g/kg protein. Sodium-containing fluids for rehydration',
            'Iron monitoring: Endurance athletes (especially female) are at high risk of iron depletion due to foot-strike haemolysis, GI blood loss, and sweat losses. Regular blood tests (ferritin, haemoglobin) recommended',
          ],
        },
      ],
      unbreakableInsight: 'Endurance performance is built on carbohydrates. The anti-carb culture in social media fitness is irrelevant to endurance sport — glycogen is the limiting factor in prolonged performance, and inadequate fuelling is the most common nutritional mistake in endurance athletes.',
      coachNote: 'Many recreational endurance athletes chronically underfuel, particularly women. This leads to fatigue, poor adaptation, illness, and injury. The conversation is often "eat more" rather than "eat less" — a fundamentally different coaching dynamic.',
      practicalTask: {
        title: 'Periodised Fuelling Plan',
        instructions: 'Design a 3-day nutrition plan for an endurance athlete with the following training schedule: Day 1 — easy 45min recovery run; Day 2 — 90min tempo run; Day 3 — 3-hour long run. Show how carbohydrate intake, meal timing, and fuelling strategy differ across the three days.',
        reflectionQuestions: [
          'How does the carbohydrate prescription change between the easy day and the long run day?',
          'When would "train low" be appropriate in this schedule, and when would it be harmful?',
          'What would you prioritise if the athlete reported constant fatigue despite adequate sleep?',
        ],
      },
    },
    {
      number: 8,
      title: 'Nutrition for Strength & Power Athletes',
      learningOutcome: 'Understand the specific nutritional demands of strength and power sports — from muscle hypertrophy to peaking for competition.',
      assessmentCriteria: [
        'Calculate caloric and macronutrient requirements for hypertrophy and strength phases',
        'Explain the evidence for protein quantity, quality, and distribution in strength sports',
        'Design nutritional strategies for competition peaking in strength sports',
      ],
      content: [
        {
          heading: 'Eating for Muscle Growth',
          paragraphs: [
            'Muscle hypertrophy requires three conditions: a training stimulus (progressive overload), adequate protein, and a caloric surplus. The optimal surplus for lean mass gain is approximately 300-500 kcal above maintenance — enough to support anabolism without excessive fat accumulation. Larger surpluses do not accelerate muscle growth; they simply increase fat storage.',
            'Protein requirements for hypertrophy are well-established: 1.6-2.2g/kg/day. Higher intakes show diminishing returns in meta-analyses. Protein quality matters — animal sources (whey, eggs, meat, fish) have superior amino acid profiles and digestibility scores compared to most plant sources. Plant-based athletes can achieve equivalent results by consuming slightly higher total protein (2.0-2.4g/kg) and combining complementary sources.',
          ],
        },
        {
          heading: 'Macronutrient Strategies',
          bullets: [
            'Protein: 1.6-2.2g/kg/day (up to 2.4g/kg during caloric deficit to preserve muscle). Distribute across 4+ meals. Include leucine-rich sources (whey, eggs, chicken) to maximise MPS per meal',
            'Carbohydrate: 4-7g/kg/day during hypertrophy phases. Carbohydrate fuels high-volume resistance training, supports recovery, and spares protein for anabolism. Low-carb diets impair high-volume training performance',
            'Fat: 0.5-1.5g/kg/day. Minimum 20% of total calories to support hormonal function (testosterone, oestrogen). Very low-fat diets reduce testosterone by 10-15%',
            'Caloric surplus (bulking): +300-500 kcal/day. Track body weight weekly. Target 0.25-0.5% body weight gain per week for trained individuals',
            'Caloric deficit (cutting): -300-500 kcal/day. Protein up to 2.2-3.1g/kg lean mass. Slow rate of loss (0.5-1% body weight/week) to minimise muscle loss',
            'Maintenance: Between phases. Allow metabolic recovery, hormonal normalisation, and psychological reset',
          ],
        },
        {
          heading: 'Competition Peaking',
          paragraphs: [
            'For strength sports (powerlifting, weightlifting), competition nutrition focuses on optimising body weight relative to weight class, maximising glycogen stores for peak performance, and managing the psychological stress of competition day. Unlike endurance sports, the actual competition is brief — nutrition in the days before matters more than nutrition during.',
            'Competition week: Maintain normal eating patterns. If weight cutting is necessary, minimise it (see Chapter 4). Day before competition: Carbohydrate-rich meals, adequate hydration, familiar foods. Competition day: Breakfast 3-4 hours before, caffeine 30-60 minutes before lifting, small snacks between attempts if the session is long. Post-competition: Celebrate. Eat what you enjoy. One day of unstructured eating after months of discipline is psychologically healthy.',
          ],
        },
      ],
      unbreakableInsight: 'Building muscle is a long game. The difference between good and great physique development is not a secret supplement or perfect timing — it is years of consistent training, adequate protein, and enough food to grow.',
      coachNote: 'The biggest mistake intermediate lifters make is not eating enough. Fear of fat gain leads to chronic under-fuelling, which limits muscle growth more than any training variable. Sometimes the best nutritional advice is simply "eat more."',
      practicalTask: {
        title: 'Hypertrophy Nutrition Plan',
        instructions: 'Calculate your maintenance calories (using a TDEE calculator or tracking average intake over 2 weeks). Design a hypertrophy-phase nutrition plan with a 400 kcal surplus, hitting 2g/kg protein, 5g/kg carbohydrate, and the remainder from fat. Plan 4 meals with balanced protein distribution.',
        reflectionQuestions: [
          'How does this caloric intake compare to what you currently eat?',
          'What would you adjust during a cutting phase while protecting muscle mass?',
          'How would you manage a client who is afraid of gaining any body fat during a muscle-building phase?',
        ],
      },
    },
    {
      number: 9,
      title: 'Anti-Doping, Ethics & Integrity in Sports Nutrition',
      learningOutcome: 'Understand the anti-doping framework, the ethical responsibilities of nutrition professionals, and the risks of contaminated supplements.',
      assessmentCriteria: [
        'Describe the WADA prohibited list categories relevant to nutrition',
        'Explain the risk of supplement contamination and how to mitigate it',
        'Discuss the ethical responsibilities of nutrition professionals in sport',
      ],
      content: [
        {
          heading: 'The Anti-Doping Framework',
          paragraphs: [
            'The World Anti-Doping Agency (WADA) maintains a Prohibited List updated annually, categorising substances banned in-competition, out-of-competition, or both. As a nutrition professional, you must be familiar with this list — particularly substances that can appear in supplements: anabolic agents (found in contaminated products), stimulants (ephedrine, DMAA — found in some pre-workouts), beta-2 agonists (clenbuterol — found in contaminated meat from some countries), and hormone modulators.',
            'Under strict liability, the athlete is responsible for every substance in their body, regardless of how it got there. "I didn\'t know it was in my supplement" is not an acceptable defence. This makes your role as a nutrition professional critically important — a contaminated supplement you recommended can end an athlete\'s career.',
          ],
        },
        {
          heading: 'Supplement Contamination',
          paragraphs: [
            'Studies consistently find that 10-25% of supplements available on the general market contain substances not listed on the label — including anabolic steroids, stimulants, and other prohibited substances. These are not deliberate additions for effect; they are cross-contamination from shared manufacturing equipment, or deliberate adulteration to make the product "work" without disclosing the actual active ingredient.',
            'Risk mitigation is straightforward but requires discipline. Only use supplements certified by third-party testing programmes: Informed Sport (the gold standard in the UK), NSF Certified for Sport, or BSCG. These programmes batch-test products for prohibited substances. If a product is not third-party certified, do not recommend it to any athlete subject to anti-doping testing. The saving on a cheaper product is never worth the career risk.',
          ],
        },
        {
          heading: 'Ethics and Professional Integrity',
          bullets: [
            'Never recommend supplements you have not independently verified for safety and evidence',
            'Never accept commissions or sponsorship deals that compromise your objectivity — if you are paid to promote a product, disclose this clearly',
            'Never provide nutrition advice beyond your scope of practice — refer to registered dietitians or medical professionals when conditions require clinical expertise',
            'Never prescribe caloric intakes so low that they endanger health, regardless of the athlete\'s competitive goals',
            'Always prioritise athlete health over competitive outcome — if a practice is dangerous, say so, even if the athlete or coach disagrees',
            'Document your recommendations — if an athlete experiences adverse effects, having a record of your evidence-based advice protects both parties',
            'Stay current — nutrition science evolves. Attend CPD, read research, and update your practice accordingly',
          ],
        },
      ],
      unbreakableInsight: 'Integrity is your most valuable professional asset. A single compromised recommendation — a contaminated supplement, an unsafe weight cut, advice beyond your scope — can destroy a career. Yours or your athlete\'s.',
      coachNote: 'Build a "trusted supplement list" for your athletes — only products from Informed Sport or equivalent certified programmes. Review it annually. When an athlete asks about a new product, the first question is always: "Is it third-party tested?"',
      practicalTask: {
        title: 'Supplement Safety Protocol',
        instructions: 'Review your current supplement stack (or a hypothetical athlete\'s stack). For each product, check whether it is certified by Informed Sport, NSF, or BSCG. If not, find a certified alternative. Create a written protocol for supplement selection that you could share with athletes or clients.',
        reflectionQuestions: [
          'How many of your current supplements are third-party certified? Were you surprised by any gaps?',
          'What would you say to a coach who pressured you to recommend an uncertified "performance-enhancing" supplement?',
          'How does anti-doping awareness apply to your work with recreational clients who are not competitive athletes?',
        ],
      },
    },
  ],
};

import type { Unit } from '../types';
import ch1EatingPsychology from '@/assets/university/nutl3-u4-ch1-eating-psychology.png';
import ch2BehaviourChange from '@/assets/university/nutl3-u4-ch2-behaviour-change.png';
import ch3CoachingSkills from '@/assets/university/nutl3-u4-ch3-coaching-skills.png';
import ch4NutritionPeriodisation from '@/assets/university/nutl3-u4-ch4-nutrition-periodisation.png';
import ch5EvidenceBased from '@/assets/university/nutl3-u4-ch5-evidence-based.png';
import ch6CompleteStrategy from '@/assets/university/nutl3-u4-ch6-complete-strategy.png';

export const nutritionL3Unit4: Unit = {
  number: 4,
  title: 'Nutrition Psychology, Behaviour Change & Professional Practice',
  description: 'Understand the psychological, behavioural, and professional dimensions of nutrition — from building sustainable habits to recognising disordered eating and practising within your scope.',
  chapters: [
    {
      number: 1,
      title: 'The Psychology of Eating',
      learningOutcome: 'Understand the psychological factors that influence food choices, eating behaviour, and the relationship between emotion and appetite.',
      assessmentCriteria: [
        'Describe the difference between physiological hunger and emotional eating',
        'Explain how environmental cues influence food intake',
        'Discuss the psychological impact of dietary restriction and labelling foods as "good" or "bad"',
      ],
      content: [
        {
          heading: 'Hunger vs Appetite vs Craving',
          paragraphs: [
            'Hunger is a physiological signal — your body genuinely needs energy. Appetite is the desire to eat, which can be triggered by sight, smell, time of day, social context, or emotion, regardless of actual energy needs. Cravings are intense, specific desires for particular foods, often linked to restriction, habit, or emotional state.',
            'Understanding these distinctions is the first step toward making conscious food choices rather than reactive ones. Most people who struggle with "willpower" are actually struggling with unrecognised emotional eating or environmental triggers — not a lack of discipline.',
          ],
          imageUrl: ch1EatingPsychology,
          imageAlt: 'Physiological vs emotional hunger diagram',
        },
        {
          heading: 'Environmental Influences on Eating',
          paragraphs: [
            'Research by Brian Wansink and others has demonstrated that the environment profoundly influences how much and what you eat — often without your awareness. Plate size, serving bowl placement, food visibility, portion packaging, and even dining companions all affect intake.',
            'You can use this knowledge constructively: keep healthy foods visible and accessible, use smaller plates, pre-portion snacks, and do not eat directly from large packages. These strategies reduce intake without requiring constant conscious effort or willpower.',
          ],
          bullets: [
            'Larger plates lead to larger portions — using a 25cm plate instead of a 30cm plate reduces intake by approximately 20%',
            'Food kept on the kitchen counter is consumed more frequently — keep fruit visible, keep biscuits in cupboards',
            'Eating while distracted (television, phone) increases intake by 10–25%',
            'Social eating — people eat more in groups than alone, and match their intake to dining companions',
          ],
        },
        {
          heading: 'The Problem with "Good" and "Bad" Foods',
          paragraphs: [
            'Labelling foods as "good" or "bad" creates a moral framework around eating that promotes guilt, shame, and cycles of restriction followed by overconsumption. When you eat a "bad" food, you feel like a "bad" person — which often triggers further overeating ("I have already ruined today, so I might as well keep going").',
            'A more constructive framework categorises foods by nutrient density — some foods provide more nutritional value per calorie than others, but no individual food determines your health. Your overall dietary pattern across weeks and months matters far more than any single meal or snack.',
          ],
        },
      ],
      unbreakableInsight: 'You do not lack willpower — you have an environment and a set of habits that make poor choices the default. Change the environment first, and the "discipline" follows naturally.',
      coachNote: 'Before blaming yourself for overeating, audit your environment. What food is visible on your kitchen counter? Do you eat at a table or in front of a screen? Small environmental changes produce larger effects than motivational speeches.',
      practicalTask: {
        title: 'Eating Environment Audit',
        instructions: 'Photograph your kitchen counter, fridge contents, and the place where you typically eat. Identify three environmental changes that could nudge your eating behaviour in a more positive direction without requiring willpower.',
        reflectionQuestions: [
          'Are your healthiest options the most visible and accessible?',
          'How often do you eat while distracted by screens?',
          'Do you notice differences in how much you eat when dining alone versus with others?',
        ],
      },
    },
    {
      number: 2,
      title: 'Behaviour Change Models',
      learningOutcome: 'Understand established behaviour change models and how to apply them to build sustainable nutritional habits.',
      assessmentCriteria: [
        'Describe the Transtheoretical Model (Stages of Change) and its application to nutrition',
        'Explain the concept of habit stacking and implementation intentions',
        'Discuss the role of self-efficacy in sustained behaviour change',
      ],
      content: [
        {
          heading: 'The Stages of Change',
          paragraphs: [
            'The Transtheoretical Model (Prochaska and DiClemente) describes behaviour change as a process through five stages: Precontemplation (not considering change), Contemplation (thinking about change), Preparation (planning change), Action (actively changing), and Maintenance (sustaining the change).',
            'Understanding where you are in this process helps you apply the right strategies. Someone in contemplation needs education and motivation — not a detailed meal plan. Someone in the action stage needs practical tools, accountability, and strategies for overcoming obstacles.',
          ],
          imageUrl: ch2BehaviourChange,
          imageAlt: 'Transtheoretical Model stages diagram',
          bullets: [
            'Precontemplation — "I do not need to change my diet." Strategy: Raise awareness of consequences without judgement',
            'Contemplation — "I know I should eat better, but..." Strategy: Explore pros and cons, build motivation',
            'Preparation — "I am going to start next week." Strategy: Set specific goals, remove barriers, plan first steps',
            'Action — "I am tracking my food and meal prepping." Strategy: Provide tools, celebrate small wins, troubleshoot obstacles',
            'Maintenance — "I have been eating well for six months." Strategy: Prevent relapse, build identity around the behaviour',
          ],
        },
        {
          heading: 'Habit Stacking and Implementation Intentions',
          paragraphs: [
            'Habit stacking involves attaching a new desired behaviour to an existing established habit. "After I pour my morning coffee, I will prepare my lunch for the day." By linking the new behaviour to an existing cue, you reduce the cognitive effort required and increase the likelihood of follow-through.',
            'Implementation intentions formalise this with "if-then" planning: "If it is Sunday evening, then I will meal prep for three days." Research consistently shows that people who form specific implementation intentions are significantly more likely to follow through than those who simply intend to change.',
          ],
        },
        {
          heading: 'Self-Efficacy — The Belief That You Can',
          paragraphs: [
            'Self-efficacy is your belief in your own ability to succeed at a specific task. It is one of the strongest predictors of sustained behaviour change. High self-efficacy means you approach challenges as things to be mastered rather than threats to be avoided.',
            'Self-efficacy is built through mastery experiences (starting small and succeeding), social modelling (seeing people similar to you succeed), verbal persuasion (encouragement from others), and managing your physiological state (reducing stress and fatigue that undermine confidence).',
          ],
        },
      ],
      unbreakableInsight: 'Motivation gets you started. Systems keep you going. If your nutrition plan depends on feeling motivated every day, it will fail. Build systems that work even when motivation is absent.',
      coachNote: 'Start with one new habit, master it until it is automatic (typically 4–8 weeks), then add another. Trying to overhaul your entire diet simultaneously is the fastest route to failure.',
      practicalTask: {
        title: 'Habit Stacking Plan',
        instructions: 'Identify one nutritional behaviour you want to adopt. Link it to an existing daily habit using the habit stacking formula. Write three "if-then" implementation intentions for situations that might otherwise derail you.',
        reflectionQuestions: [
          'Which existing habit is the most reliable anchor for your new behaviour?',
          'What obstacles are most likely to prevent follow-through?',
          'How will you measure whether the new habit has become automatic?',
        ],
      },
    },
    {
      number: 3,
      title: 'Disordered Eating Awareness',
      learningOutcome: 'Understand the spectrum of disordered eating, recognise warning signs, and know when and how to refer to specialist support.',
      assessmentCriteria: [
        'Distinguish between disordered eating and clinically diagnosed eating disorders',
        'Identify warning signs and risk factors for disordered eating',
        'Explain the appropriate response and referral pathway when disordered eating is suspected',
      ],
      content: [
        {
          heading: 'The Disordered Eating Spectrum',
          paragraphs: [
            'Disordered eating exists on a spectrum. At one end is a healthy, flexible relationship with food. At the other are clinically diagnosed eating disorders (anorexia nervosa, bulimia nervosa, binge eating disorder). In between lies a wide range of problematic eating behaviours that may not meet clinical diagnostic criteria but still significantly impair physical and mental health.',
            'The fitness and bodybuilding communities have normalised many behaviours that sit on this spectrum — obsessive macro tracking, extreme food restriction, categorising foods as "clean" or "dirty," guilt around eating, and excessive compensatory exercise. Just because a behaviour is common in these communities does not make it healthy.',
          ],
          imageUrl: ch3CoachingSkills,
          imageAlt: 'Healthy eating to disordered eating spectrum',
        },
        {
          heading: 'Warning Signs',
          paragraphs: [
            'Recognising disordered eating in yourself or others requires awareness of both behavioural and psychological indicators. No single sign is diagnostic, but patterns of multiple indicators should prompt concern and action.',
          ],
          bullets: [
            'Behavioural signs — Skipping meals, avoiding social eating, excessive food rules, binge-restrict cycles, hiding food or eating in secret, excessive exercise to "earn" or "burn off" food',
            'Psychological signs — Intense guilt or shame after eating, preoccupation with food or body shape that dominates daily thoughts, distorted body image, anxiety around unplanned meals',
            'Physical signs — Significant weight changes, fatigue, hair loss, dental erosion (from vomiting), loss of menstrual cycle, poor concentration',
            'Contextual risk factors — History of dieting, perfectionist personality, participation in weight-class or aesthetic sports, history of trauma or anxiety',
          ],
        },
        {
          heading: 'What to Do',
          paragraphs: [
            'If you recognise these signs in yourself, seeking help is a sign of strength, not weakness. Speak with your GP as a first step — they can assess your situation and refer you to appropriate services. Beat (beateatingdisorders.org.uk) is the UK\'s leading eating disorder charity and provides confidential helplines, online support, and local services.',
            'If you recognise these signs in someone else, approach with compassion rather than confrontation. Express concern without judgement, avoid commenting on their weight or appearance, and encourage them to speak with a healthcare professional. Do not attempt to provide therapy or clinical nutrition advice — this requires specialist training.',
          ],
        },
      ],
      unbreakableInsight: 'The line between "dedicated" and "disordered" is often thinner than you think. If tracking food causes anxiety, if missing a meal causes panic, or if your self-worth depends on your body composition — those are not signs of commitment. They are warning signs.',
      coachNote: 'Check in with yourself honestly. Does your relationship with food enhance your life, or does it control it? If tracking, meal prepping, or macro counting has become a source of stress rather than empowerment, step back and reassess.',
      practicalTask: {
        title: 'Relationship with Food Reflection',
        instructions: 'Answer the following questions honestly in writing: Do you feel guilty after eating certain foods? Do you avoid social situations because of food? Does missing a planned meal cause significant anxiety? Do you exercise primarily to compensate for eating?',
        reflectionQuestions: [
          'Did any of your answers surprise or concern you?',
          'Would you feel comfortable discussing your relationship with food with a trusted person?',
          'What resources are available to you if you or someone you know needed support?',
        ],
      },
    },
    {
      number: 4,
      title: 'Motivational Interviewing Basics',
      learningOutcome: 'Understand the principles of motivational interviewing and how they apply to supporting nutritional behaviour change in yourself and others.',
      assessmentCriteria: [
        'Describe the four core principles of motivational interviewing',
        'Explain the difference between sustain talk and change talk',
        'Discuss how motivational interviewing differs from directive advice-giving',
      ],
      content: [
        {
          heading: 'What Is Motivational Interviewing?',
          paragraphs: [
            'Motivational interviewing (MI) is a counselling approach developed by Miller and Rollnick that helps people explore and resolve ambivalence about change. Rather than telling someone what to do (which often provokes resistance), MI guides them toward their own reasons for change.',
            'The approach is built on the understanding that people are more likely to commit to change when they articulate their own motivations rather than being lectured. This is as true for your own internal dialogue about nutrition as it is when supporting others.',
          ],
          imageUrl: ch4NutritionPeriodisation,
          imageAlt: 'Motivational interviewing principles diagram',
        },
        {
          heading: 'The Four Principles',
          bullets: [
            'Express Empathy — Seek to understand rather than judge. "It sounds like you find it difficult to plan meals during a busy week" rather than "You need to try harder"',
            'Develop Discrepancy — Help identify the gap between current behaviour and desired goals. "You mentioned wanting more energy, but you also skip breakfast most days — how do those two things connect?"',
            'Roll with Resistance — Avoid arguing or confronting. When someone pushes back, acknowledge their perspective rather than fighting it. Resistance often decreases when it is not met with opposition',
            'Support Self-Efficacy — Reinforce the belief that change is possible. Highlight past successes, no matter how small. "You managed to meal prep last Sunday — what made that work?"',
          ],
        },
        {
          heading: 'Change Talk vs Sustain Talk',
          paragraphs: [
            'Change talk is any language that favours movement toward change: "I want to," "I could," "I need to," "I can." Sustain talk favours the status quo: "I cannot," "I do not want to," "It is too hard." The goal in MI is to evoke and reinforce change talk while gently exploring sustain talk without reinforcing it.',
            'You can use these principles on yourself. Notice when your internal dialogue uses sustain talk ("I will never be able to eat healthily during the week") and consciously reframe toward change talk ("I have managed it before when I meal prepped on Sunday — I could try that again").',
          ],
        },
      ],
      unbreakableInsight: 'Nobody ever changed their diet because someone lectured them hard enough. People change when they discover their own reasons for change — and when they believe they are capable of it.',
      coachNote: 'Next time you are tempted to give someone unsolicited nutrition advice, try asking a question instead. "What would better eating look like for you?" opens a door. "You should eat more protein" closes one.',
      practicalTask: {
        title: 'Motivational Interviewing Practice',
        instructions: 'Think of one nutritional change you have been ambivalent about. Write out a motivational interviewing dialogue with yourself, using all four principles. Identify your own change talk and sustain talk.',
        reflectionQuestions: [
          'What is your primary reason for wanting this change?',
          'What has prevented you from making this change so far?',
          'What is one small step you could take this week that you are confident you could complete?',
        ],
      },
    },
    {
      number: 5,
      title: 'Practical Meal Planning & Preparation',
      learningOutcome: 'Develop advanced practical skills in meal planning, batch cooking, budget management, and adapting plans to real-world constraints.',
      assessmentCriteria: [
        'Design a weekly meal plan that meets specific macronutrient targets',
        'Explain batch cooking strategies that maximise efficiency and minimise waste',
        'Discuss how to maintain nutritional quality on a limited budget',
      ],
      content: [
        {
          heading: 'From Theory to Kitchen',
          paragraphs: [
            'All the nutritional knowledge in the world is worthless if you cannot translate it into actual meals on your plate. This chapter bridges the gap between understanding what to eat and actually doing it — consistently, affordably, and without spending your entire Sunday in the kitchen.',
            'Effective meal planning is not about creating elaborate recipes for every meal. It is about having a reliable system that ensures you have the right foods available when you need them, with enough flexibility to accommodate real life.',
          ],
          imageUrl: ch5EvidenceBased,
          imageAlt: 'Weekly meal planning system flowchart',
        },
        {
          heading: 'The Batch Cooking System',
          paragraphs: [
            'Batch cooking involves preparing large quantities of base ingredients that can be combined in different ways throughout the week. Rather than cooking seven different dinners, you prepare three or four protein sources, two or three carbohydrate bases, and several vegetable options — then mix and match daily.',
          ],
          bullets: [
            'Protein bases — Roast a whole chicken, brown 1kg mince, bake a tray of salmon fillets, hard-boil a dozen eggs',
            'Carbohydrate bases — Cook a large pot of rice, roast a tray of potatoes, prepare overnight oats in batches',
            'Vegetable options — Roast mixed vegetables, prep salad ingredients, steam broccoli and green beans',
            'Sauces and flavourings — Prepare two or three different sauces or dressings to add variety without additional cooking',
            'Total time — Approximately 2–3 hours on a Sunday for 15–20 meals worth of components',
          ],
        },
        {
          heading: 'Eating Well on a Budget',
          paragraphs: [
            'Healthy eating does not require expensive ingredients. Frozen vegetables are nutritionally equivalent to fresh (often picked and frozen at peak ripeness), tinned fish and beans are excellent protein sources at a fraction of the cost of fresh meat, and buying in bulk reduces per-serving costs significantly.',
            'The most expensive approach to eating is buying individual meals, takeaways, and prepared foods. The most affordable approach is buying raw ingredients in bulk and cooking them yourself. Meal planning also reduces food waste — one of the largest hidden costs in most household food budgets.',
          ],
          bullets: [
            'Cheapest protein sources — Eggs, tinned tuna, frozen chicken thighs, lentils, beans, milk',
            'Cheapest carbohydrate sources — Oats, rice, pasta, potatoes, bread',
            'Cheapest vegetable sources — Frozen mixed vegetables, tinned tomatoes, onions, carrots, cabbage',
            'Planning tip — Build your meal plan around supermarket offers rather than deciding meals first and then shopping',
          ],
        },
      ],
      unbreakableInsight: 'You do not need a chef\'s kitchen or a large budget to eat well. You need a system. Two hours of batch cooking per week will do more for your nutrition than any amount of theoretical knowledge.',
      coachNote: 'Start with the simplest version of meal prep — even just cooking extra at dinner and packing it for tomorrow\'s lunch. Once that is automatic, expand to a full batch cooking session.',
      practicalTask: {
        title: 'One-Week Meal Prep Challenge',
        instructions: 'Plan and execute a one-week batch cooking session. Prepare at least three protein sources, two carbohydrate bases, and three vegetable options. Track the total cost and time invested.',
        reflectionQuestions: [
          'How much time did the batch cooking session take compared to cooking daily?',
          'What was the approximate cost per meal?',
          'What would you change about your approach next week?',
        ],
      },
    },
    {
      number: 6,
      title: 'Nutrition Communication & Scope of Practice',
      learningOutcome: 'Understand how to communicate nutrition information responsibly and practise within appropriate professional boundaries.',
      assessmentCriteria: [
        'Explain the differences between a registered dietitian, nutritionist, and nutrition coach in the UK',
        'Identify situations that require referral to a registered healthcare professional',
        'Discuss the ethical responsibilities of sharing nutrition information',
      ],
      content: [
        {
          heading: 'Professional Titles in UK Nutrition',
          paragraphs: [
            'In the UK, the title "dietitian" is legally protected — only those registered with the Health and Care Professions Council (HCPC) can use it. Dietitians complete a minimum three-year degree programme and are qualified to provide medical nutrition therapy, including managing clinical conditions.',
            'The title "nutritionist" is not legally protected in the same way, though the Association for Nutrition (AfN) maintains a voluntary register. "Nutrition coach," "nutrition advisor," and similar titles have no regulatory protection — anyone can use them regardless of qualifications.',
          ],
          imageUrl: ch6CompleteStrategy,
          imageAlt: 'UK nutrition professional titles comparison',
          bullets: [
            'Registered Dietitian (RD) — HCPC regulated, can provide medical nutrition therapy, work in NHS and clinical settings',
            'Registered Nutritionist (RNutr/ANutr) — AfN registered, can provide public health and community nutrition advice',
            'Nutrition Coach/Advisor — No regulatory requirement. Quality varies enormously. Some are excellent; others have minimal training',
            'Personal Trainer with nutrition qualification — Can provide general healthy eating guidance but not medical nutrition therapy',
          ],
        },
        {
          heading: 'When to Refer',
          paragraphs: [
            'Regardless of your qualifications, certain situations always require referral to a registered dietitian or medical professional. These include suspected eating disorders, management of diagnosed medical conditions (diabetes, kidney disease, coeliac disease), pregnancy complications, severe food allergies, and any situation where inappropriate advice could cause harm.',
            'Referring is not a failure — it is a professional responsibility that protects both you and the person you are trying to help. The best approach is to maintain a referral network of healthcare professionals you can direct people toward when situations exceed your scope.',
          ],
        },
        {
          heading: 'Responsible Communication',
          paragraphs: [
            'Whether you share nutrition information professionally or simply with friends and family, you have a responsibility to communicate accurately. This means distinguishing between evidence-based guidelines and personal opinion, acknowledging uncertainty, avoiding absolute statements ("never eat X," "always do Y"), and being transparent about the limitations of your knowledge.',
            'Social media has created an environment where nutrition misinformation spreads rapidly. Being a responsible voice — even a small one — means checking sources, citing evidence, and being willing to say "I do not know" rather than guessing.',
          ],
        },
      ],
      unbreakableInsight: 'Having a nutrition qualification does not make you qualified to treat medical conditions. Having strong opinions does not make you qualified to give advice. Know your lane, stay in it, and refer when the situation demands it.',
      coachNote: 'Build a referral network now, before you need it. Identify a local registered dietitian, a GP with nutrition interest, and the contact details for Beat (eating disorder charity). Having these ready means you can act quickly when someone needs help beyond your scope.',
      practicalTask: {
        title: 'Scope of Practice Boundaries',
        instructions: 'Write out five hypothetical scenarios involving nutrition questions or concerns. For each, determine whether the situation is within the scope of general healthy eating advice or requires referral to a specialist.',
        reflectionQuestions: [
          'Were there any scenarios where the boundary was unclear?',
          'How would you explain to someone why you are referring them rather than advising them directly?',
          'What continuing professional development would help you expand your knowledge responsibly?',
        ],
      },
    },
    {
      number: 7,
      title: 'Client Consultation Skills',
      learningOutcome: 'Develop the practical skills needed to conduct effective nutrition consultations, including intake assessment, goal setting, rapport building, and creating actionable nutrition plans for real clients.',
      assessmentCriteria: [
        'Describe the structure and key components of an initial nutrition consultation',
        'Explain how to gather relevant dietary, medical, and lifestyle information safely',
        'Design an actionable, individualised nutrition plan based on consultation findings',
      ],
      content: [
        {
          heading: 'The Consultation Is Where Knowledge Becomes Practice',
          paragraphs: [
            'Everything in this course — macronutrients, micronutrients, supplementation, sports nutrition, behaviour change — converges in the consultation. This is where you translate theoretical knowledge into practical advice for a real person with real preferences, constraints, and goals. The quality of your consultation determines whether your advice is followed or forgotten.',
            'A good consultation is not a lecture. It is a structured conversation that gathers information, builds trust, identifies priorities, and co-creates an actionable plan. The client should leave feeling heard, understood, and equipped — not overwhelmed.',
          ],
        },
        {
          heading: 'Consultation Structure',
          bullets: [
            'Pre-consultation — Send an intake questionnaire covering: current eating patterns, medical history, allergies/intolerances, medications, training schedule, goals, and any previous nutrition interventions. This saves time and provides a baseline',
            'Opening (5 min) — Build rapport. Ask open questions: "What made you book this session?" "What would you most like to change?" Listen first, advise later',
            'Information gathering (15 min) — Review the intake questionnaire together. Clarify ambiguities. Ask about a typical day of eating (not an ideal day). Note food preferences, cooking ability, budget, and time constraints',
            'Assessment (5 min) — Summarise what you have heard. Identify the 2–3 highest-impact changes (not 10). Check that the client agrees these are priorities',
            'Action planning (10 min) — Co-create specific, achievable actions for the next 1–2 weeks. Each action should pass the "would you bet £50 you will do this?" test. Fewer, realistic actions beat ambitious wishlists',
            'Close (5 min) — Summarise the agreed actions. Set a follow-up date. Ask: "Is there anything else that is important that we have not covered?"',
          ],
        },
        {
          heading: 'Common Consultation Mistakes',
          bullets: [
            'Talking more than listening — The ideal ratio is approximately 70% client, 30% practitioner in the first consultation. Your job is to understand their world before advising',
            'Giving too much information — Overloading a client with science does not help them change behaviour. Keep explanations brief and practical',
            'Ignoring the client\'s starting point — Recommending a "perfect" diet that bears no resemblance to their current habits guarantees non-adherence. Start where they are, not where you want them to be',
            'Assuming readiness — Not every client is ready to change everything immediately. Use the stages of change model (pre-contemplation through maintenance) to calibrate your expectations',
            'Neglecting follow-up — The consultation is not the intervention. The follow-up — checking in, adjusting the plan, celebrating progress — is where behaviour change actually happens',
          ],
        },
      ],
      unbreakableInsight: 'The best nutritional advice in the world is useless if the person cannot or will not follow it. Your job is not to create the perfect plan — it is to create the best plan that this specific person will actually do.',
      coachNote: 'When in doubt, ask one more question before giving advice. Every extra minute spent understanding the client saves ten minutes of wasted advice that does not fit their life.',
      practicalTask: {
        title: 'Mock Consultation Practice',
        instructions: 'Conduct a 30-minute mock nutrition consultation with a willing friend, family member, or training partner. Use the consultation structure above. Gather their information, identify priorities, and co-create 2–3 actionable steps. Record yourself (audio only) and review it afterwards, noting how much you listened versus talked.',
        reflectionQuestions: [
          'What percentage of the consultation did you spend talking versus listening?',
          'Were the actions you agreed on realistic given the person\'s actual lifestyle?',
          'What would you do differently in your next consultation based on this practice?',
        ],
      },
    },
    {
      number: 8,
      title: 'Professional Development & Continuing Education',
      learningOutcome: 'Understand the importance of continuing professional development (CPD), learn to critically evaluate nutrition research, and create a framework for lifelong learning in the rapidly evolving field of nutrition science.',
      assessmentCriteria: [
        'Explain why continuing professional development is essential in nutrition practice',
        'Apply critical evaluation criteria to assess the quality of nutrition research and media claims',
        'Design a personal CPD plan for the next 12 months',
      ],
      content: [
        {
          heading: 'Nutrition Science Never Stops Evolving',
          paragraphs: [
            'What you know today is a snapshot. Nutrition science is a rapidly evolving field where consensus shifts, new evidence emerges, and yesterday\'s certainties become today\'s nuances. A practitioner who stops learning after qualification quickly becomes outdated — and outdated advice can cause real harm.',
            'Continuing professional development (CPD) is not optional — it is an ethical obligation. If you advise others on nutrition, you owe them current, evidence-based guidance. This requires active, ongoing engagement with research, peer learning, and self-reflection.',
          ],
        },
        {
          heading: 'Evaluating Nutrition Research & Media Claims',
          paragraphs: [
            'The nutrition space is flooded with misinformation — from supplement companies, social media influencers, journalists seeking clicks, and even well-meaning but under-qualified practitioners. Developing a critical eye for evidence quality is one of the most valuable skills you can build.',
          ],
          bullets: [
            'Hierarchy of evidence — Systematic reviews and meta-analyses carry more weight than single studies. Randomised controlled trials (RCTs) carry more weight than observational studies. Expert opinion is the lowest tier',
            'Study design — Was the study done in humans (not cells or mice)? Was it randomised and controlled? How large was the sample? How long did it run?',
            'Conflict of interest — Who funded the study? Studies funded by supplement or food companies are not automatically wrong, but funding bias is well-documented',
            'Effect size vs statistical significance — A statistically significant finding can be practically meaningless if the effect size is tiny. Ask: "How much difference does this actually make?"',
            'Media translation — Headlines distort research. Always read the abstract of the actual study before forming an opinion based on a news article or social media post',
            'Reproducibility — Has the finding been replicated by independent researchers? Single studies — no matter how well-designed — should not change practice until confirmed',
          ],
        },
        {
          heading: 'Building Your CPD Framework',
          bullets: [
            'Read regularly — Follow 2–3 reputable journals or research review services (e.g., BJSM, Examine.com, Alan Aragon\'s Research Review). Even 30 minutes per week compounds rapidly',
            'Attend workshops and courses — At least one formal CPD event per year. These provide structured learning, networking, and exposure to perspectives you would not seek independently',
            'Join a community of practice — Find other nutrition professionals (online or in person) to discuss cases, share learnings, and challenge each other\'s thinking',
            'Reflect on practice — After each client interaction, ask: "What went well? What would I do differently? What do I need to learn more about?"',
            'Teach to learn — Explaining concepts to others (writing, presenting, mentoring) deepens your own understanding more than passive study',
            'Maintain a learning log — Document what you read, learn, and apply. This creates a searchable personal knowledge base and evidence of CPD for professional bodies',
          ],
        },
      ],
      unbreakableInsight: 'The most dangerous nutrition practitioner is the one who thinks they know everything. Humility, curiosity, and a commitment to evidence are what separate professionals from influencers.',
      coachNote: 'Set a weekly 30-minute "learning block" in your calendar — same day, same time. Use it to read one research summary, listen to one podcast episode, or review one case. Consistency beats intensity in CPD, just as it does in training.',
      practicalTask: {
        title: 'CPD Plan & Critical Evaluation Practice',
        instructions: 'Create a 12-month CPD plan: identify 3 knowledge gaps you want to address, select learning resources for each (journals, courses, podcasts, books), and schedule monthly learning blocks. Then find a recent nutrition headline or social media claim and critically evaluate it using the criteria above. Write a 200-word analysis of whether the claim is supported by the evidence.',
        reflectionQuestions: [
          'What are your three biggest knowledge gaps in nutrition, and how will you address them?',
          'How did the nutrition claim you evaluated hold up under critical scrutiny?',
          'What habits can you build now to ensure you are still learning and improving in five years?',
        ],
      },
    },
  ],
};

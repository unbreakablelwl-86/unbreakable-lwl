import type { Unit } from '../types';

export const level4Unit2: Unit = {
  number: 2,
  title: 'Biomechanics & Injury Prevention',
  description: 'Apply biomechanical principles to optimise lifting technique, prevent common injuries, and develop long-term joint health and mobility strategies.',
  chapters: [
    {
      number: 1,
      title: 'Applied Biomechanics for Compound Lifts',
      learningOutcome: 'Understand how lever lengths, joint angles, and anthropometry influence optimal technique in the squat, bench press, and deadlift.',
      assessmentCriteria: [
        'Explain how femur-to-torso ratio affects squat mechanics',
        'Describe how grip width and arch height influence bench press efficiency',
        'Identify how limb proportions inform conventional vs sumo deadlift selection',
      ],
      content: [
        {
          heading: 'Why One Size Does Not Fit All',
          paragraphs: [
            'Every person who walks into a gym has a unique skeleton — different limb lengths, joint socket depths, muscle attachment points, and spinal curvatures. These structural differences mean that "textbook" form for the squat, bench press, or deadlift is a starting point, not a destination. Optimal technique must be individualised based on the lifter\'s anatomy.',
            'Understanding basic biomechanics allows you to troubleshoot technique issues that have nothing to do with weakness or flexibility — they are simply structural mismatches between the lifter\'s body and the technique they are attempting.',
          ],
        },
        {
          heading: 'Squat Biomechanics',
          paragraphs: [
            'The primary anthropometric factor in squatting is the ratio of femur length to torso length. Lifters with long femurs relative to their torso must lean forward more to keep the barbell over the mid-foot — this is not a technique flaw but a physical necessity. Forcing these lifters to stay upright often results in their heels rising or depth becoming impossible.',
          ],
          bullets: [
            'Long femurs, short torso — More forward lean required. Consider low bar position, wider stance, and elevated heels (squat shoes or heel wedges)',
            'Short femurs, long torso — More upright torso naturally. High bar or front squat positions work well',
            'Hip socket depth — Deep sockets (Celtic hip) allow narrower stances; shallow sockets (Dalmatian hip) often suit wider stances',
            'Ankle mobility — Limited ankle dorsiflexion forces compensations up the chain. Heel elevation is a legitimate long-term solution, not a crutch',
          ],
        },
        {
          heading: 'Bench Press and Deadlift Considerations',
          paragraphs: [
            'In the bench press, arm length determines range of motion — longer arms means more distance to travel, which increases time under tension and total work per rep. Wider grip reduces range of motion but increases shoulder stress. Arch height reduces range of motion while keeping shoulders in a safer position. Each lifter must find the grip width and arch that optimises their structure.',
            'For the deadlift, arm-to-leg ratio is decisive. Long arms relative to legs favour conventional pulling (hips higher, back more horizontal). Short arms favour sumo (wider stance, more upright torso, shorter bar path). Neither style is inherently superior — the best choice is the one that produces the shortest, most mechanically efficient bar path for your proportions.',
          ],
        },
      ],
      unbreakableInsight: 'Your body is not wrong for not matching textbook form. Textbook form is a generalisation — your technique should be optimised for your unique structure. Work with your anatomy, not against it.',
      coachNote: 'Before correcting someone\'s technique, ask: is this a genuine fault, or are they adapting to their structure? Video review from multiple angles helps distinguish between structural adaptations and actual technique errors.',
      practicalTask: {
        title: 'Structural Self-Assessment',
        instructions: 'Assess your own limb proportions: measure your femur length (hip to knee), torso length (hip to shoulder), and arm length (shoulder to wrist). Calculate your femur:torso ratio. Then review your squat, bench, and deadlift technique — does your current form match your structure?',
        reflectionQuestions: [
          'Does your femur:torso ratio explain any squat difficulties you have experienced?',
          'Have you ever been given technique advice that contradicted your body\'s natural tendencies?',
          'Would changing your stance width, grip, or bar position better suit your anatomy?',
        ],
      },
    },
    {
      number: 2,
      title: 'Force Production & Leverage Systems',
      learningOutcome: 'Understand how the musculoskeletal system creates force through lever systems and how this knowledge applies to exercise selection and technique.',
      assessmentCriteria: [
        'Describe the three classes of levers in the human body with examples',
        'Explain the concept of moment arms and their influence on joint torque',
        'Discuss how muscle attachment points affect force production capacity',
      ],
      content: [
        {
          heading: 'The Body as a Lever System',
          paragraphs: [
            'Every movement your body produces is the result of muscles pulling on bones that rotate around joints. These are lever systems, and understanding them explains why some exercises feel harder at certain points in the range of motion, why some people are "built" for certain lifts, and how to select exercises that target specific muscles more effectively.',
            'A lever has three components: the fulcrum (the joint), the effort (the muscle force), and the load (the weight being moved). The relative positions of these three components determine the mechanical advantage — how efficiently muscle force is converted into movement.',
          ],
        },
        {
          heading: 'Three Classes of Levers',
          bullets: [
            'First class — Fulcrum between effort and load. Example: nodding your head (atlanto-occipital joint). Rare in the body but provides good mechanical advantage',
            'Second class — Load between fulcrum and effort. Example: calf raise (ball of foot is fulcrum, body weight is load, calf muscles provide effort). Provides mechanical advantage — the effort arm is always longer than the load arm',
            'Third class — Effort between fulcrum and load. Example: bicep curl (elbow is fulcrum, bicep inserts close to elbow, load is at the hand). Most common in the body. Provides speed and range of motion at the cost of mechanical advantage',
          ],
        },
        {
          heading: 'Moment Arms and Practical Application',
          paragraphs: [
            'A moment arm is the perpendicular distance from the line of force to the joint. Longer moment arms create greater torque for a given force. This is why the sticking point in a bench press occurs when the moment arm at the shoulder is longest (when the upper arm is horizontal) — not because the muscles are weakest at that point, but because the leverage demand is highest.',
            'Understanding moment arms allows you to select exercises and modify technique to change the training stimulus. Incline pressing increases the shoulder moment arm compared to flat pressing, shifting emphasis to the anterior deltoid. Sumo deadlifting reduces the hip moment arm compared to conventional, changing the relative demands on the posterior chain.',
          ],
        },
      ],
      unbreakableInsight: 'Strength is not just about how hard your muscles can contract — it is about how efficiently your skeleton transmits that force. Understanding leverage turns technique from guesswork into engineering.',
      coachNote: 'When an exercise feels "wrong" or disproportionately difficult, think in terms of moment arms before blaming muscle weakness. The issue may be leverage, not strength.',
      practicalTask: {
        title: 'Sticking Point Analysis',
        instructions: 'Film your squat, bench press, and deadlift from the side. Identify the sticking point in each lift. Then analyse the moment arms at the sticking point — which joint has the longest moment arm? This tells you where leverage demand is highest.',
        reflectionQuestions: [
          'Where is your sticking point in each lift?',
          'Does the moment arm analysis match your experience of where lifts feel hardest?',
          'What exercise variations would specifically strengthen you at the sticking point?',
        ],
      },
    },
    {
      number: 3,
      title: 'Common Lifting Injuries & Mechanisms',
      learningOutcome: 'Understand the mechanisms behind common weight training injuries and how to prevent them through programme design and technique management.',
      assessmentCriteria: [
        'Describe the most common injury sites in weight training and their mechanisms',
        'Explain the difference between acute injuries and overuse injuries',
        'Discuss how load management reduces injury risk more than technique perfection',
      ],
      content: [
        {
          heading: 'Injury Epidemiology in Strength Training',
          paragraphs: [
            'Weight training is one of the safest forms of physical activity when properly managed. Injury rates are significantly lower than in team sports, running, or CrossFit. However, injuries do occur — primarily to the shoulders, lower back, knees, and elbows. Understanding why and how these injuries happen is the first step toward preventing them.',
            'The single most important concept in injury prevention is load management — the relationship between training load and the tissue\'s capacity to handle that load. Most lifting injuries occur not because of "bad form" but because the accumulated load exceeded the tissue\'s tolerance. This can happen through sudden spikes in volume or intensity, insufficient recovery, or training through pain.',
          ],
        },
        {
          heading: 'Common Injury Sites',
          bullets: [
            'Shoulders — Rotator cuff tendinopathy, biceps tendon irritation, labral issues. Usually from excessive pressing volume, insufficient pulling volume, or poor scapular positioning. Bench press and overhead press are the primary aggravators',
            'Lower back — Disc herniations, facet joint irritation, muscular strains. Usually from load spikes (sudden increase in deadlift or squat volume), poor bracing, or training with excessive fatigue. The disc itself is rarely the primary cause — it is the culmination of accumulated stress',
            'Knees — Patellar tendinopathy (jumper\'s/lifter\'s knee), meniscus irritation. Usually from high-frequency squatting without adequate recovery or rapid volume increases',
            'Elbows — Medial epicondylitis (golfer\'s elbow), triceps tendinopathy. Usually from high-frequency pressing or excessive grip-intensive work without graduated exposure',
          ],
        },
        {
          heading: 'Load Management Trumps Form Perfection',
          paragraphs: [
            'The fitness industry has overemphasised "perfect form" as the primary injury prevention strategy. While technique matters, research consistently shows that load management is far more predictive of injury risk than technique. You can have impeccable form and still get injured if your training load exceeds your recovery capacity.',
            'The acute:chronic workload ratio (ACWR) provides a useful framework. Your "chronic" workload is your average training volume over the past 4 weeks. Your "acute" workload is this week\'s volume. When the ratio exceeds 1.3–1.5 (this week\'s load is 30–50% higher than your recent average), injury risk increases significantly. Gradual, consistent progression with planned deloads keeps this ratio in the safe zone.',
          ],
        },
      ],
      unbreakableInsight: 'Most injuries are not accidents — they are the predictable result of doing too much, too soon, with too little recovery. The lifter who progresses slowly and consistently outlasts the one who chases rapid gains every session.',
      coachNote: 'If a client has a niggle that has persisted for more than two weeks, do not push through it. Modify the aggravating movement (change grip, reduce range of motion, reduce load) and refer to a physiotherapist if it does not improve within another two weeks.',
      practicalTask: {
        title: 'Training Load Audit',
        instructions: 'Calculate your acute:chronic workload ratio for each main lift. Look at your total weekly sets and load for the past 4 weeks. Is this week significantly higher than your 4-week average?',
        reflectionQuestions: [
          'Have you experienced any injuries or niggles in the past year? Can you link them to spikes in training load?',
          'Is your current training volume sustainable week after week?',
          'What would a 10% weekly volume increase look like — and is that what you are currently doing?',
        ],
      },
    },
    {
      number: 4,
      title: 'Prehabilitation Strategies',
      learningOutcome: 'Design a prehabilitation programme that proactively strengthens common weak points and maintains joint health.',
      assessmentCriteria: [
        'Define prehabilitation and distinguish it from rehabilitation',
        'Identify the most common areas requiring prehabilitation in strength athletes',
        'Design a time-efficient prehabilitation routine for a specific training programme',
      ],
      content: [
        {
          heading: 'Prevention Over Cure',
          paragraphs: [
            'Prehabilitation (prehab) is proactive work performed to strengthen vulnerable structures before they become injured. It targets the muscles, tendons, and movement patterns most at risk given your training programme. Unlike rehabilitation (which responds to existing injury), prehab aims to prevent problems before they start.',
            'The most effective prehab is specific to your training programme. A powerlifter needs different prehab than a swimmer. The principle is simple: identify the structures that receive the highest stress in your training and the supporting structures that are relatively undertrained, then strengthen them specifically.',
          ],
        },
        {
          heading: 'Key Prehab Areas for Strength Athletes',
          bullets: [
            'Rotator cuff — External rotations, face pulls, band pull-aparts. 2–3 sets of 15–20 reps before pressing sessions. These small muscles stabilise the shoulder during heavy pressing and are easily overwhelmed by the much larger prime movers',
            'Rear deltoids and mid-traps — Band pull-aparts, reverse flyes, prone Y-raises. Balance the pressing volume that dominates most programmes. Aim for a 2:1 pulling-to-pressing ratio in total weekly sets',
            'Hip flexors and adductors — Copenhagen adduction exercises, hip flexor strengthening (not just stretching). These muscles stabilise the pelvis during squats and deadlifts and are frequently neglected',
            'Tibialis anterior — Tibialis raises or backwards sled drags. Prevent shin splints and anterior knee pain. Particularly important for lifters who also run or play sports',
            'Spinal erectors and core — McGill Big Three (curl-up, side plank, bird-dog). Build spinal endurance and stability without compressive loading. Particularly important during high-volume squat and deadlift phases',
          ],
        },
        {
          heading: 'Programming Prehab Efficiently',
          paragraphs: [
            'Prehab does not require a separate training session. Integrate it into your warm-up (5–10 minutes before your main lifts) or as filler work between main lift sets. This approach adds minimal time to your session while providing consistent, accumulated benefit over weeks and months.',
            'Volume and intensity should be moderate — prehab should prepare you for training, not fatigue you before it. Light to moderate loads, higher reps (12–20), and controlled tempos. The goal is blood flow, activation, and gradual tendon strengthening — not exhaustion.',
          ],
        },
      ],
      unbreakableInsight: 'The five minutes of prehab you skip before each session will cost you five weeks of rehabilitation when the injury finally arrives. Prehab is the cheapest insurance policy in strength training.',
      coachNote: 'Make prehab non-negotiable by putting it first in the session. If it comes after the main work, it will be skipped. Five minutes of face pulls and band work before pressing is worth more than any amount of post-workout stretching.',
      practicalTask: {
        title: 'Personal Prehab Programme',
        instructions: 'Based on your current training programme, identify the three structures most at risk of overuse or injury. Design a 10-minute prehab routine that targets these areas and can be performed before your main training.',
        reflectionQuestions: [
          'Which muscles in your programme receive the least direct training despite being involved in your main lifts?',
          'Do you currently have any minor aches or tightness that could be addressed with targeted prehab?',
          'How will you ensure this prehab routine actually gets done rather than skipped?',
        ],
      },
    },
    {
      number: 5,
      title: 'Return to Training After Injury',
      learningOutcome: 'Understand how to safely return to training after injury, including load modification, progressive exposure, and managing training psychology.',
      assessmentCriteria: [
        'Describe a staged return-to-training protocol following common lifting injuries',
        'Explain how pain should be used as a guide during rehabilitation',
        'Discuss the psychological challenges of returning from injury and strategies for managing them',
      ],
      content: [
        {
          heading: 'The Return-to-Training Continuum',
          paragraphs: [
            'Returning to training after injury is not a binary switch — it is a gradual continuum from modified training through progressive loading back to full training. The biggest mistakes are returning too quickly (re-injury) and waiting too long (detraining and fear avoidance). The goal is to find the earliest point at which you can train productively without aggravating the injury.',
            'In most cases, complete rest is only necessary for the first few days to a week. After that, modified training — avoiding the specific movement that aggravates the injury while continuing to train everything else — preserves fitness, maintains mental health, and may actually accelerate healing through improved blood flow.',
          ],
        },
        {
          heading: 'Pain as a Guide',
          paragraphs: [
            'Modern pain science recognises that pain is not a reliable indicator of tissue damage — it is the brain\'s assessment of threat. Some pain during rehabilitation is normal and acceptable. The key guidelines for managing pain during return to training are:',
          ],
          bullets: [
            'Pain during exercise up to 3/10 is generally acceptable if it settles within 24 hours',
            'Pain that increases progressively during a session = stop that exercise and modify',
            'Morning-after pain that is worse than the previous day = you did too much, reduce load next session',
            'Pain that is consistently improving week to week = you are on the right track, continue progressing',
            'Pain that plateaus or worsens over 2+ weeks = seek reassessment from a physiotherapist',
          ],
        },
        {
          heading: 'The Psychology of Return',
          paragraphs: [
            'The psychological impact of injury is often underestimated. Fear of re-injury (kinesiophobia) can persist long after the physical injury has healed, leading to compensatory movement patterns, avoidance of previously injured movements, and loss of confidence under heavy loads.',
            'Overcoming this requires gradual exposure: start with loads well below your pre-injury capacity (even if the tissue can handle more), build confidence through successful repetitions, and progressively increase load as trust in the movement is rebuilt. This is the same principle used in anxiety treatment — graded exposure to the feared stimulus in a controlled environment.',
          ],
        },
      ],
      unbreakableInsight: 'Injury is not the end of training — it is a forced modification. The person who trains intelligently around an injury recovers faster and stronger than the person who either pushes through recklessly or stops completely.',
      coachNote: 'The most important question to ask after injury is not "when can I lift heavy again?" but "what can I do right now that does not make this worse?" There is almost always something productive you can do.',
      practicalTask: {
        title: 'Return-to-Training Protocol',
        instructions: 'Design a 4-week return-to-training protocol for a hypothetical lower back strain. Week 1: complete rest from aggravating lifts, modified upper body training. Week 2: introduction of light hip hinge patterns. Weeks 3–4: progressive loading back toward normal training.',
        reflectionQuestions: [
          'How would you determine when it is safe to increase load during rehabilitation?',
          'What would you do if pain increased during week 3?',
          'How would you address the psychological fear of re-injury when approaching previous working weights?',
        ],
      },
    },
    {
      number: 6,
      title: 'Mobility Programming for Performance',
      learningOutcome: 'Distinguish between effective and ineffective mobility work and design a mobility programme that genuinely improves training performance.',
      assessmentCriteria: [
        'Differentiate between flexibility, mobility, and stability',
        'Explain why excessive static stretching before training may impair performance',
        'Design a mobility programme that addresses individual limitations without wasting training time',
      ],
      content: [
        {
          heading: 'Flexibility vs Mobility vs Stability',
          paragraphs: [
            'These three terms are often used interchangeably but describe different qualities. Flexibility is the passive range of motion available at a joint — how far you can be moved by an external force. Mobility is the active range of motion you can control with your own muscles. Stability is your ability to maintain joint position under load within your available range.',
            'For strength training, mobility and stability matter far more than flexibility. Having the passive flexibility to do a full split means nothing if you cannot control that range under load. Conversely, having limited passive range is not a problem if you have sufficient active mobility for your training demands. The goal is not maximum range of motion — it is sufficient controlled range for your specific movements.',
          ],
        },
        {
          heading: 'Evidence-Based Mobility Work',
          bullets: [
            'Dynamic warm-up — Controlled articular rotations (CARs), leg swings, arm circles, and movement-specific rehearsals. Prepares joints and tissues for the session ahead. 5–10 minutes before training',
            'Loaded stretching — Using exercises at full range under moderate load (e.g., deep pause squats, Romanian deadlifts, deficit push-ups). Simultaneously improves mobility and strength at end-range. More effective than passive stretching for long-term mobility gains',
            'Post-training static stretching — Held stretches (30–60 seconds) for muscles that feel tight after training. Provides temporary relief and may support long-term flexibility. Does not significantly impair strength when done post-session',
            'Foam rolling — Provides temporary pain relief and increased range of motion (5–15 minutes). Does not physically "break up" tissue or "release" fascia. Useful as part of a warm-up if it helps you move better in the session',
          ],
        },
        {
          heading: 'What Doesn\'t Work',
          paragraphs: [
            'Extended static stretching before training reduces force production by 2–5% and should be avoided before strength-focused sessions. "Mobility routines" that take 30+ minutes and do not translate to improved movement during your actual training are time poorly spent. Mobility work should be targeted, efficient, and measurably improving your training performance.',
            'The best mobility programme is the one that takes 5–10 minutes, addresses your specific limitations (not a generic routine), and produces a noticeable improvement in your training movements. If your overhead squat assessment reveals limited thoracic extension, spend your mobility time on thoracic work — not hamstring stretches.',
          ],
        },
      ],
      unbreakableInsight: 'Mobility work is only valuable if it makes your training better. If you spend 30 minutes stretching and your squat still feels the same, you are not training mobility — you are wasting time.',
      coachNote: 'Test and retest. Pick one mobility drill, do it for 2 minutes, then immediately test the movement it should improve (e.g., overhead squat after thoracic CARs). If the movement is visibly better, keep the drill. If not, try something else.',
      practicalTask: {
        title: 'Targeted Mobility Assessment',
        instructions: 'Identify your most limited movement pattern (deep squat depth, overhead reach, hip hinge range). Select three different mobility interventions and test each one: perform the drill for 2 minutes, then immediately assess whether your target movement has improved. Keep only the interventions that produce measurable change.',
        reflectionQuestions: [
          'Which intervention produced the most noticeable improvement?',
          'Were you surprised by what worked versus what didn\'t?',
          'How will you integrate the effective drill into your regular warm-up?',
        ],
      },
    },
    {
      number: 7,
      title: 'Movement Screening & Assessment',
      learningOutcome: 'Conduct basic movement assessments to identify mobility restrictions, stability deficits, and asymmetries that may limit training performance or increase injury risk.',
      assessmentCriteria: [
        'Describe the purpose and limitations of movement screening',
        'Perform and interpret a basic overhead squat assessment',
        'Identify when screening findings warrant referral to a physiotherapist or medical professional',
      ],
      content: [
        {
          heading: 'The Purpose of Screening',
          paragraphs: [
            'Movement screening is an observational tool that provides a snapshot of how someone moves. It identifies gross movement limitations, obvious asymmetries, and compensatory patterns that may need addressing before loading heavy. It is not a diagnostic tool — it cannot tell you why a limitation exists or whether it will cause injury.',
            'The practical value of screening is in programme design: if a screen reveals that someone cannot achieve a full overhead squat, you know they need ankle, hip, or thoracic mobility work before loading that pattern. If they cannot perform a single-leg stance without excessive wobble, their programme should include stability work before progressing to heavy unilateral movements.',
          ],
        },
        {
          heading: 'The Overhead Squat Assessment',
          paragraphs: [
            'The overhead squat (arms extended overhead, squat to depth) is one of the most informative single assessments because it simultaneously demands ankle dorsiflexion, hip flexion, thoracic extension, and shoulder flexion. Compensations reveal the weakest link in the chain.',
          ],
          bullets: [
            'Heels rise — Limited ankle dorsiflexion. Solution: heel wedges, ankle mobilisation, and calf stretching',
            'Knees cave inward — Weak glute medius or poor hip control. Solution: banded squats, lateral band walks, single-leg work',
            'Excessive forward lean — Limited ankle mobility, poor thoracic extension, or long femurs. Solution: depends on cause — screen each joint individually',
            'Arms fall forward — Limited thoracic extension or shoulder flexion. Solution: thoracic CARs, overhead stretches, wall slides',
            'Lower back rounds (butt wink) — Insufficient hip mobility or motor control at end range. Solution: deep squat holds, hip CARs, goblet squat pauses',
          ],
        },
        {
          heading: 'Limitations of Screening',
          paragraphs: [
            'Movement screens are observational, not predictive. Research has shown that scoring poorly on movement screens like the FMS does not reliably predict injury in strength athletes. What screens do reliably identify is movement limitations that can be improved — which in itself is valuable for programming.',
            'Never use a screen to tell someone they "cannot" or "should not" train a certain way. Use it to identify starting points and guide exercise modifications. Everyone can train — the screen helps determine the most appropriate starting point and progression.',
          ],
        },
      ],
      unbreakableInsight: 'A screen does not judge — it informs. It tells you where to start, not where you are stuck. Every limitation identified is simply the next thing to work on.',
      coachNote: 'Film your overhead squat assessment from the front, side, and rear. Many compensations are only visible from one angle. Review the footage slowly — in real time, you will miss subtle compensatory patterns.',
      practicalTask: {
        title: 'Self-Screen Protocol',
        instructions: 'Film yourself performing an overhead squat (front and side view), a single-leg balance (30 seconds each side), and a wall-facing overhead reach. Review the footage and identify the most significant limitation revealed by each test.',
        reflectionQuestions: [
          'Was there a noticeable asymmetry between left and right sides?',
          'Which limitation do you think has the biggest impact on your current training?',
          'How would you address your primary limitation — mobility work, stability work, or technique modification?',
        ],
      },
    },
    {
      number: 8,
      title: 'Joint Health & Training Longevity',
      learningOutcome: 'Understand the factors that influence long-term joint health and implement strategies to train hard while protecting your joints for decades.',
      assessmentCriteria: [
        'Describe how joints adapt to training and why gradual progression matters for joint health',
        'Explain the role of tendon loading and recovery in preventing tendinopathy',
        'Discuss lifestyle factors outside the gym that influence joint health and recovery',
      ],
      content: [
        {
          heading: 'Joints Adapt — But Slowly',
          paragraphs: [
            'Muscles adapt to training in weeks. Tendons and ligaments take months. Cartilage and bone remodel over years. This mismatch is why gradual, progressive training is essential for long-term joint health. Your muscles may be strong enough to squat 200kg within two years of training, but your tendons, cartilage, and connective tissue may need five years of graduated loading to safely support that weight repeatedly.',
            'Joint injuries in strength training are rarely single-event failures. They are almost always the cumulative result of loading that exceeded the tissue\'s adaptation capacity over weeks or months. The solution is not to avoid heavy training — it is to progress at a rate that all tissues can keep up with, not just muscle.',
          ],
        },
        {
          heading: 'Tendon Health',
          paragraphs: [
            'Tendons respond to progressive loading by becoming stronger and stiffer — but they require adequate recovery between loading bouts. Tendon tissue turnover is slower than muscle, meaning tendon recovery takes 48–72 hours, compared to 24–48 hours for muscle. Training the same tendon with heavy loads on consecutive days is one of the most common causes of tendinopathy in strength athletes.',
          ],
          bullets: [
            'Isometric loading — Holds at moderate intensity (e.g., wall sit, single-leg bridge hold) stimulate tendon remodelling with minimal risk. Useful both for prevention and as part of tendinopathy rehabilitation',
            'Eccentric loading — Slow eccentric contractions (e.g., slow negative heel raises for Achilles tendinopathy) stimulate tendon adaptation. The gold standard for tendinopathy management',
            'Progressive overload — Tendons respond best to gradual, consistent loading over months. Sudden jumps in volume or intensity are the primary risk factor for tendon injury',
            'Rest days — Tendons need more recovery time than muscles. Programme heavy tendon-loading exercises (heavy squats, deadlifts) with at least 48 hours between sessions for the same tendon',
          ],
        },
        {
          heading: 'Lifestyle Factors for Joint Longevity',
          paragraphs: [
            'What happens outside the gym influences joint health as much as what happens inside it. Sleep deprivation impairs tissue repair. Chronic inflammation from poor diet accelerates joint degradation. Dehydration reduces synovial fluid quality. Excessive body weight increases compressive forces on weight-bearing joints.',
          ],
          bullets: [
            'Sleep — 7–9 hours is non-negotiable for tissue repair. Growth hormone, which drives tendon and cartilage remodelling, is primarily released during deep sleep',
            'Nutrition — Omega-3 fatty acids reduce systemic inflammation. Collagen supplementation (15g with vitamin C, 30–60 minutes before training) may support tendon health. Adequate protein supports connective tissue repair',
            'Hydration — Joint cartilage is 65–80% water. Dehydration reduces its shock-absorbing capacity. Drink consistently throughout the day',
            'Body composition — Excess body fat increases both mechanical load on joints and systemic inflammation. Maintaining a healthy body composition is one of the most effective long-term joint protection strategies',
            'Movement variety — Repetitive identical loading patterns accelerate wear. Include exercise variations that load joints through different angles and ranges',
          ],
        },
      ],
      unbreakableInsight: 'The goal is not just to be strong now — it is to still be training in 30 years. Every session that respects your joints is an investment in decades of future performance. Every session that abuses them is a withdrawal from a finite account.',
      coachNote: 'If something hurts repeatedly in the same way during the same exercise, your body is sending you a clear message. Modify the movement, reduce the load, or swap the exercise. Pushing through chronic pain is not tough — it is short-sighted.',
      practicalTask: {
        title: 'Joint Health Inventory',
        instructions: 'Honestly assess every joint involved in your training: shoulders, elbows, wrists, hips, knees, ankles, lower back. Rate each from 1 (pain-free, no issues) to 5 (persistent pain or significant limitation). For any joint rated 3 or above, identify the likely contributing factor and a plan to address it.',
        reflectionQuestions: [
          'Are any of your joint issues being caused or worsened by your current programming?',
          'What changes to your programme would reduce stress on your most vulnerable joints?',
          'Are you prioritising sleep, nutrition, and hydration sufficiently to support joint health?',
        ],
      },
    },
  ],
};

import type { Unit } from '../types';
import ch1AnatomicalPlanes from '@/assets/university/ch1-anatomical-planes.png';
import ch1DirectionalTerms from '@/assets/university/ch1-directional-terms.png';
import ch1GymPlanes from '@/assets/university/ch1-gym-planes.png';
import ch2JointTypes from '@/assets/university/ch2-joint-types.png';
import ch2SkeletalFunctions from '@/assets/university/ch2-skeletal-functions.png';
import ch2SynovialJoint from '@/assets/university/ch2-synovial-joint.png';
import ch3MuscleGroups from '@/assets/university/ch3-muscle-groups.png';
import ch3MuscleContractions from '@/assets/university/ch3-muscle-contractions.png';
import ch3AgonistAntagonist from '@/assets/university/ch3-agonist-antagonist.png';
import ch4Cardiovascular from '@/assets/university/ch4-cardiovascular.png';
import ch4CirculatorySystem from '@/assets/university/ch4-circulatory-system.png';
import ch4AcuteResponses from '@/assets/university/ch4-acute-responses.png';
import ch4ChronicAdaptations from '@/assets/university/ch4-chronic-adaptations.png';
import ch5EnergySystems from '@/assets/university/ch5-energy-systems.png';
import ch5AtpBreakdown from '@/assets/university/ch5-atp-breakdown.png';
import ch5EnergyTimeline from '@/assets/university/ch5-energy-timeline.png';
import ch5RepRanges from '@/assets/university/ch5-rep-ranges.png';
import ch6RespiratoryPathway from '@/assets/university/l2-u1-ch6-respiratory-pathway.png';
import ch6BreathingComparison from '@/assets/university/l2-u1-ch6-breathing-comparison.png';
import ch7MotorUnitRecruitment from '@/assets/university/l2-u1-ch7-motor-unit-recruitment.png';
import ch8PostureDeviations from '@/assets/university/l2-u1-ch8-posture-deviations.png';
import ch8MobilityAreas from '@/assets/university/l2-u1-ch8-mobility-areas.png';
import ch6GasExchange from '@/assets/university/l2-u1-ch6-gas-exchange.png';
import ch7NervousSystem from '@/assets/university/l2-u1-ch7-nervous-system.png';
import ch7Proprioceptors from '@/assets/university/l2-u1-ch7-proprioceptors.png';

export const level2Unit1: Unit = {
  number: 1,
  title: 'Understanding the Body',
  description: 'Learn the fundamental anatomy and physiology that underpins all training. Understand how your body moves, adapts, and produces energy.',
  chapters: [
    {
      number: 1,
      title: 'Basic Anatomy for Training',
      learningOutcome: 'Understand the basic anatomical terminology and body planes used in exercise science, and identify how they relate to common gym movements.',
      assessmentCriteria: [
        'Define the three anatomical planes of movement (sagittal, frontal, transverse)',
        'Use correct anatomical directional terms (anterior, posterior, medial, lateral, superior, inferior)',
        'Identify at least three gym exercises and classify them by movement plane',
      ],
      content: [
        {
          heading: 'Why Anatomy Matters',
          paragraphs: [
            'You don\'t need a medical degree to train effectively — but you do need to understand the basics. Knowing how your body is structured helps you select the right exercises, understand why certain movements feel different, and communicate clearly about what you\'re training.',
            'Think of anatomy as the instruction manual for your body. Without it, you\'re guessing.',
          ],
        },
        {
          heading: 'The Three Planes of Movement',
          paragraphs: [
            'Every movement your body makes can be classified into one of three planes:',
          ],
          bullets: [
            'Sagittal Plane — divides the body into left and right. Movements in this plane go forwards and backwards. Examples: squats, bicep curls, lunges, running.',
            'Frontal Plane — divides the body into front and back. Movements go side to side. Examples: lateral raises, side lunges, star jumps.',
            'Transverse Plane — divides the body into top and bottom. Movements involve rotation. Examples: cable woodchops, Russian twists, throwing a punch.',
          ],
          imageUrl: ch1AnatomicalPlanes,
          imageAlt: 'Diagram showing the three anatomical planes on a human figure with example exercises labelled for each plane',
        },
        {
          heading: 'Directional Terms',
          paragraphs: [
            'When describing the body in exercise science, we use specific terms to avoid confusion:',
          ],
          bullets: [
            'Anterior — the front of the body (e.g., your quads are anterior)',
            'Posterior — the back of the body (e.g., your hamstrings are posterior)',
            'Medial — towards the midline (e.g., the inner thigh)',
            'Lateral — away from the midline (e.g., the outer thigh)',
            'Superior — towards the head (e.g., the shoulders are superior to the hips)',
            'Inferior — towards the feet (e.g., the ankles are inferior to the knees)',
          ],
          imageUrl: ch1DirectionalTerms,
          imageAlt: 'Labelled human figure showing anatomical directional terms: anterior, posterior, medial, lateral, superior, inferior',
        },
        {
          heading: 'Applying This in the Gym',
          paragraphs: [
            'When someone says "this exercise targets the anterior deltoid", they mean the front of the shoulder. When a programme says "lateral movement", it means side-to-side work in the frontal plane.',
            'Understanding these terms means you\'ll never be confused by programme instructions, coaching cues, or exercise descriptions again.',
          ],
          imageUrl: ch1GymPlanes,
          imageAlt: 'Three exercises classified by movement plane: squat (sagittal), lateral raise (frontal), cable woodchop (transverse)',
        },
      ],
      unbreakableInsight: 'Most people train only in the sagittal plane — forward and back. That\'s why they end up stiff, imbalanced, and eventually injured. Train in all three planes or pay the price.',
      coachNote: 'You don\'t need to memorise every Latin term. Focus on understanding the three planes and the six directional terms listed above. If you can classify your exercises by plane and describe where a muscle is, you\'re ahead of 90% of gym users.',
      practicalTask: {
        title: 'Movement Plane Audit',
        instructions: 'Review your last three training sessions. For each exercise you performed, identify which plane of movement it primarily works in. Count how many exercises fall into each plane.',
        reflectionQuestions: [
          'Which plane of movement dominates your training?',
          'Are there any planes you\'re neglecting entirely?',
          'Can you identify one exercise to add that fills a gap?',
        ],
      },
    },
    {
      number: 2,
      title: 'The Skeletal System',
      learningOutcome: 'Understand the role of the skeletal system in movement and exercise, including the main types of joints and their relevance to training.',
      assessmentCriteria: [
        'Describe at least three functions of the skeletal system',
        'Identify the main types of synovial joints and provide a gym-based example for each',
        'Explain the importance of joint health for long-term training',
      ],
      content: [
        {
          heading: 'What the Skeleton Does',
          paragraphs: [
            'Your skeleton isn\'t just scaffolding. It serves several critical functions that directly affect your training:',
          ],
          bullets: [
            'Support — provides the rigid framework that holds your body upright and gives muscles something to pull against',
            'Protection — shields vital organs (ribs protect the lungs, skull protects the brain)',
            'Movement — bones act as levers that muscles pull on to create motion',
            'Mineral storage — bones store calcium and phosphorus, releasing them when needed',
            'Blood cell production — red and white blood cells are produced in bone marrow',
          ],
          imageUrl: ch2SkeletalFunctions,
          imageAlt: 'Skeleton diagram with five functions labelled: support, protection, movement, mineral storage, blood cell production',
        },
        {
          heading: 'Types of Joints',
          paragraphs: [
            'Joints are where two or more bones meet. The joints most relevant to gym training are synovial joints — freely movable joints surrounded by a fluid-filled capsule:',
          ],
          bullets: [
            'Hinge joints — move in one direction, like a door. Examples: elbow (bicep curls), knee (leg extensions)',
            'Ball-and-socket joints — allow movement in all directions. Examples: shoulder (overhead press), hip (squats)',
            'Pivot joints — allow rotation around a single axis. Example: the neck turning side to side',
            'Gliding joints — allow sliding movements. Example: wrist movements during pressing',
          ],
          imageUrl: ch2JointTypes,
          imageAlt: 'Labelled diagram showing hinge, ball-and-socket, pivot, and gliding joints with their gym exercise equivalents',
        },
        {
          heading: 'Joint Health and Training',
          paragraphs: [
            'Every time you lift a weight, your joints are under load. Joint health is not optional — it\'s the foundation of a long training career.',
            'Synovial fluid lubricates joints and reduces friction. Warming up before training increases synovial fluid production, which is why cold joints feel stiff and creaky.',
            'Cartilage covers the ends of bones at joints. It doesn\'t have its own blood supply, so it relies on movement to receive nutrients. Sedentary lifestyles lead to cartilage deterioration. Regular training — with proper technique — actually improves joint health over time.',
          ],
          imageUrl: ch2SynovialJoint,
          imageAlt: 'Cross-section of a synovial joint showing cartilage, synovial fluid, joint capsule, and warm-up effects',
        },
      ],
      unbreakableInsight: 'Your muscles will recover in days. A damaged joint can take months — or never fully heal. Respect your joints. Warm up properly. Use full range of motion. Ego lifting destroys joints.',
      coachNote: 'You don\'t need to know every bone in the body. Focus on understanding that bones are levers, joints are pivot points, and both need to be looked after. A proper warm-up is not a suggestion — it\'s joint maintenance.',
      practicalTask: {
        title: 'Joint Awareness Check',
        instructions: 'During your next training session, pay attention to every joint involved in each exercise. Note which joints feel smooth and which feel tight or restricted. Record your observations.',
        reflectionQuestions: [
          'Which joints felt the most restricted?',
          'Did your warm-up adequately prepare those joints?',
          'What could you change about your warm-up to improve joint readiness?',
        ],
      },
    },
    {
      number: 3,
      title: 'The Muscular System',
      learningOutcome: 'Understand the structure and function of skeletal muscles, including how muscles contract and the major muscle groups used in resistance training.',
      assessmentCriteria: [
        'Describe the three types of muscle contraction (concentric, eccentric, isometric)',
        'Identify the major muscle groups and their primary functions',
        'Explain the concept of agonist and antagonist muscle pairs',
      ],
      content: [
        {
          heading: 'How Muscles Work',
          paragraphs: [
            'Skeletal muscles are the engines of movement. They attach to bones via tendons and contract to produce force. Understanding how muscles contract is fundamental to effective training.',
          ],
        },
        {
          heading: 'Types of Muscle Contraction',
          paragraphs: [
            'Every rep you perform involves one or more types of contraction:',
          ],
          bullets: [
            'Concentric — the muscle shortens under load. This is the "lifting" phase. Example: curling a dumbbell upward.',
            'Eccentric — the muscle lengthens under load. This is the "lowering" phase. Example: slowly lowering a dumbbell back down. Eccentric contractions cause the most muscle damage and are crucial for growth.',
            'Isometric — the muscle produces force without changing length. Example: holding a plank, pausing at the bottom of a squat.',
          ],
          imageUrl: ch3MuscleContractions,
          imageAlt: 'Three types of muscle contraction shown with bicep curl: concentric (shortening), eccentric (lengthening), isometric (static hold)',
        },
        {
          heading: 'Major Muscle Groups',
          paragraphs: [
            'You need to know where the main muscles are and what they do:',
          ],
          bullets: [
            'Chest (Pectoralis Major) — pushes things away from you. Bench press, press-ups.',
            'Back (Latissimus Dorsi, Trapezius, Rhomboids) — pulls things towards you. Rows, pull-ups, deadlifts.',
            'Shoulders (Deltoids — anterior, medial, posterior) — lifts the arm in all directions. Overhead press, lateral raises.',
            'Arms — Biceps (front, elbow flexion), Triceps (back, elbow extension).',
            'Core (Rectus Abdominis, Obliques, Transverse Abdominis, Erector Spinae) — stabilises the trunk. Planks, anti-rotation work.',
            'Legs — Quadriceps (front of thigh, knee extension), Hamstrings (back of thigh, knee flexion and hip extension), Glutes (hip extension, the strongest muscle group), Calves (ankle plantar flexion).',
          ],
          imageUrl: ch3MuscleGroups,
          imageAlt: 'Labelled diagram of major muscle groups from front and rear view of the human body',
        },
        {
          heading: 'Agonist and Antagonist Pairs',
          paragraphs: [
            'Muscles work in pairs. When one muscle contracts (the agonist), the opposing muscle relaxes (the antagonist):',
          ],
          bullets: [
            'Biceps and Triceps — when you curl, biceps contract and triceps relax',
            'Quadriceps and Hamstrings — when you extend the knee, quads contract and hamstrings relax',
            'Chest and Back — when you push, chest contracts and back relaxes',
          ],
          imageUrl: ch3AgonistAntagonist,
          imageAlt: 'Diagram showing agonist and antagonist muscle pairs: biceps/triceps and quadriceps/hamstrings',
        },
        {
          paragraphs: [
            'Understanding this pairing helps you build balanced programmes. If you only train one side of a pair, you create muscular imbalances that lead to poor posture and injury.',
          ],
        },
      ],
      unbreakableInsight: 'Everyone wants to train the muscles they can see in the mirror. The muscles you can\'t see — your back, rear delts, hamstrings, glutes — are the ones that keep you strong and injury-free. Train what you can\'t see, twice as hard.',
      coachNote: 'Learn the major muscle groups and what they do. When you read a programme that says "horizontal push", you should immediately think "chest". When it says "hip hinge", think "hamstrings and glutes". This fluency makes you a better, more self-sufficient trainee.',
      practicalTask: {
        title: 'Muscle Map Exercise',
        instructions: 'Take your current programme and, for each exercise, write down the primary muscle (agonist) and its opposing muscle (antagonist). Check whether your programme has roughly equal volume for each pair.',
        reflectionQuestions: [
          'Are any muscle pairs significantly imbalanced in your programme?',
          'Which antagonist muscles are you neglecting?',
          'How could you adjust your programme to improve balance?',
        ],
      },
    },
    {
      number: 4,
      title: 'The Cardiovascular System',
      learningOutcome: 'Understand the structure and function of the cardiovascular system and how it responds to exercise, including the acute and chronic adaptations that improve fitness.',
      assessmentCriteria: [
        'Describe the basic structure of the cardiovascular system (heart, blood vessels, blood)',
        'Explain the acute responses of the cardiovascular system during exercise',
        'Identify at least three chronic adaptations from regular cardiovascular training',
      ],
      content: [
        {
          heading: 'The Cardiovascular System Overview',
          paragraphs: [
            'The cardiovascular system is your body\'s transport network. It delivers oxygen and nutrients to working muscles and removes waste products like carbon dioxide and lactic acid.',
            'It consists of three main components: the heart (the pump), blood vessels (the pipes), and blood (the delivery fluid).',
          ],
          imageUrl: ch4CirculatorySystem,
          imageAlt: 'Circulatory system diagram showing heart, arteries, veins, capillaries, and lungs with blood flow direction',
        },
        {
          heading: 'The Heart',
          paragraphs: [
            'The heart is a muscular pump with four chambers. The right side pumps deoxygenated blood to the lungs. The left side pumps oxygenated blood to the rest of the body.',
            'Your resting heart rate is a reliable indicator of cardiovascular fitness. Trained individuals typically have lower resting heart rates because their hearts pump more blood per beat (higher stroke volume).',
          ],
          imageUrl: ch4Cardiovascular,
          imageAlt: 'Heart diagram with acute responses and chronic adaptations of the cardiovascular system',
        },
        {
          heading: 'Acute Responses to Exercise',
          paragraphs: [
            'When you start training, your cardiovascular system responds immediately:',
          ],
          bullets: [
            'Heart rate increases — to pump more blood to working muscles',
            'Stroke volume increases — each beat pushes out more blood',
            'Blood pressure rises temporarily — to force blood through vessels faster',
            'Blood is redistributed — away from the digestive system and towards muscles',
            'Breathing rate increases — to take in more oxygen and expel more carbon dioxide',
          ],
          imageUrl: ch4AcuteResponses,
          imageAlt: 'Infographic showing five acute cardiovascular responses to exercise: heart rate, stroke volume, blood pressure, redistribution, breathing',
        },
        {
          heading: 'Chronic Adaptations',
          paragraphs: [
            'Over weeks and months of consistent training, your cardiovascular system physically changes:',
          ],
          bullets: [
            'Cardiac hypertrophy — the heart muscle wall thickens, making each contraction stronger',
            'Increased stroke volume — more blood pumped per beat, meaning a lower resting heart rate',
            'Greater capillary density — more tiny blood vessels grow around muscles, improving oxygen delivery',
            'Improved VO2 max — your body becomes more efficient at using oxygen during exercise',
            'Lower resting blood pressure — blood vessels become more elastic and efficient',
          ],
          imageUrl: ch4ChronicAdaptations,
          imageAlt: 'Before and after comparison of chronic cardiovascular adaptations: cardiac hypertrophy, capillary density, VO2 max improvements',
        },
      ],
      unbreakableInsight: 'You can have all the muscle in the world, but if your heart can\'t deliver oxygen efficiently, you\'ll gas out in every session. Cardiovascular fitness isn\'t optional — it\'s the foundation everything else sits on.',
      coachNote: 'You don\'t need to become a marathon runner. But 2-3 sessions of moderate cardiovascular work per week — even brisk walking — will improve recovery between sets, between sessions, and between training blocks. It makes everything else work better.',
      practicalTask: {
        title: 'Resting Heart Rate Baseline',
        instructions: 'Measure your resting heart rate first thing in the morning for five consecutive days. Record each reading. Calculate the average. This is your cardiovascular fitness baseline.',
        reflectionQuestions: [
          'What was your average resting heart rate?',
          'How does this compare to the general population ranges (60-100bpm for adults, under 60 for trained individuals)?',
          'What cardiovascular training could you add to your routine to improve this number?',
        ],
      },
    },
    {
      number: 5,
      title: 'Energy Systems',
      learningOutcome: 'Understand the three energy systems the body uses during exercise, and how they relate to different types of training intensity and duration.',
      assessmentCriteria: [
        'Name and describe the three energy systems (ATP-PC, anaerobic glycolysis, aerobic)',
        'Explain when each system is predominantly used during exercise',
        'Apply energy system knowledge to justify the structure of different training methods',
      ],
      content: [
        {
          heading: 'Where Energy Comes From',
          paragraphs: [
            'Every muscle contraction requires energy. That energy comes from a molecule called ATP (adenosine triphosphate). Your body has three systems for producing ATP, and which one dominates depends on the intensity and duration of the exercise.',
          ],
          imageUrl: ch5AtpBreakdown,
          imageAlt: 'ATP molecule diagram showing phosphate bond breaking to release energy, producing ADP and free phosphate',
        },
        {
          heading: 'The Three Energy Systems',
          bullets: [
            'ATP-PC (Phosphocreatine) System — immediate energy, lasts 8-12 seconds. Used for maximal effort: a heavy single on deadlift, a 40m sprint. No oxygen needed. Recovers in 2-5 minutes.',
            'Anaerobic Glycolysis — short-duration energy, lasts 30 seconds to 2 minutes. Breaks down glucose without oxygen. Produces lactic acid as a by-product. Used for high-rep sets, 400m sprints, circuit training.',
            'Aerobic System — long-duration energy, used for anything lasting more than 2-3 minutes. Uses oxygen to break down carbohydrates and fats. Used for steady-state cardio, long walks, extended training sessions.',
          ],
          imageUrl: ch5EnergySystems,
          imageAlt: 'Chart showing the three energy systems with duration on the x-axis and contribution percentage on the y-axis, with example activities marked',
        },
        {
          heading: 'How They Work Together',
          paragraphs: [
            'All three systems work simultaneously — but one always dominates depending on intensity and duration. A heavy set of 3 reps uses mostly the ATP-PC system. A set of 15 reps relies more on anaerobic glycolysis. A 30-minute jog is primarily aerobic.',
            'Understanding this helps you structure rest periods correctly. Heavy strength work needs 2-5 minutes of rest to replenish phosphocreatine. Hypertrophy sets need 60-90 seconds. Endurance work can use shorter rests or continuous effort.',
          ],
          imageUrl: ch5EnergyTimeline,
          imageAlt: 'Timeline showing energy system dominance: ATP-PC peaks at 0-12 seconds, anaerobic glycolysis at 30s-2min, aerobic after 2-3 minutes',
        },
        {
          heading: 'Practical Implications',
          bullets: [
            'Training for strength (1-5 reps) — primarily ATP-PC, needs long rest (3-5 minutes)',
            'Training for hypertrophy (6-12 reps) — mix of ATP-PC and anaerobic glycolysis, moderate rest (60-120 seconds)',
            'Training for endurance (15+ reps or cardio) — primarily aerobic/anaerobic glycolysis, short rest (30-60 seconds)',
            'Creatine supplementation works because it helps replenish the ATP-PC system faster',
          ],
          imageUrl: ch5RepRanges,
          imageAlt: 'Infographic mapping rep ranges to energy systems and recommended rest periods',
        },
      ],
      unbreakableInsight: 'If you\'re resting 30 seconds between heavy deadlift sets and wondering why you can\'t hit your numbers — now you know. You haven\'t given your ATP-PC system time to reload. Rest properly or fail repeatedly. Your choice.',
      coachNote: 'This is one of the most practical chapters in the entire course. Once you understand energy systems, your rest periods, set structures, and even your supplement choices suddenly make sense. Come back to this chapter whenever you\'re designing or adjusting a programme.',
      practicalTask: {
        title: 'Energy System Session Analysis',
        instructions: 'Take one strength session and one cardio session from your recent training. For each exercise or activity, identify which energy system is primarily being used and whether your rest periods match the recommendations.',
        reflectionQuestions: [
          'Were your rest periods appropriate for the energy system being used?',
          'Did you notice any exercises where fatigue was unusually high — could this be an energy system mismatch?',
          'How would you adjust your rest periods based on what you\'ve learnt?',
        ],
      },
    },
    {
      number: 6,
      title: 'The Respiratory System',
      learningOutcome: 'Understand how the respiratory system delivers oxygen to working muscles and removes carbon dioxide, and why breathing technique matters during training.',
      assessmentCriteria: [
        'Describe the pathway of air from the mouth/nose to the alveoli',
        'Explain gas exchange in the lungs and how oxygen reaches muscle cells',
        'Identify common breathing mistakes during resistance training and how to correct them',
      ],
      content: [
        {
          heading: 'Why Breathing Matters More Than You Think',
          paragraphs: [
            'You can survive weeks without food, days without water, but only minutes without oxygen. Your respiratory system is the engine behind every rep, every sprint, every recovery breath between sets. Yet most people in the gym have never thought about how they breathe — let alone why it matters.',
            'Poor breathing mechanics limit performance, increase blood pressure unnecessarily, and can even cause dizziness or fainting during heavy lifts. Understanding the basics puts you ahead immediately.',
          ],
        },
        {
          heading: 'The Pathway of Air',
          paragraphs: [
            'When you inhale, air enters through your nose or mouth and travels down the trachea (windpipe). The trachea splits into two bronchi — one for each lung. These branch into smaller and smaller tubes called bronchioles, which end in tiny air sacs called alveoli.',
            'The alveoli are where the magic happens. There are roughly 300 million of them in your lungs, creating a surface area about the size of a tennis court. This massive surface area allows efficient gas exchange — oxygen passes into your blood, and carbon dioxide passes out.',
          ],
          imageUrl: ch6RespiratoryPathway,
          imageAlt: 'Diagram showing the respiratory pathway from nose/mouth through trachea, bronchi, bronchioles, to alveoli with gas exchange details',
        },
        {
          heading: 'Gas Exchange & Oxygen Delivery',
          paragraphs: [
            'At the alveoli, oxygen diffuses across a thin membrane into capillaries, where it binds to haemoglobin in red blood cells. These cells transport oxygen through the bloodstream to working muscles. At the same time, carbon dioxide — a waste product of energy production — diffuses from the blood into the alveoli and is exhaled.',
            'During exercise, your breathing rate increases to match higher oxygen demand. At rest you might breathe 12-20 times per minute. During intense exercise that can rise to 40-60 breaths per minute. Your body automatically adjusts based on CO2 levels in the blood.',
          ],
          imageUrl: ch6GasExchange,
          imageAlt: 'Diagram of gas exchange at the alveoli showing O2 diffusing into capillary blood and CO2 diffusing out',
        },
        {
          heading: 'Breathing During Resistance Training',
          paragraphs: [
            'The general rule for resistance training is: exhale during the effort phase (concentric) and inhale during the lowering phase (eccentric). This helps maintain intra-abdominal pressure without excessive blood pressure spikes.',
          ],
          bullets: [
            'Bench press — inhale as you lower the bar, exhale as you press it up',
            'Squat — inhale as you descend, exhale as you drive up',
            'Deadlift — brace and breathe in before the pull, exhale at lockout',
            'The Valsalva Manoeuvre — holding your breath against a closed glottis to create maximum core pressure. Used in heavy lifting (1-3 rep maxes) by experienced lifters. Increases blood pressure significantly — not recommended for beginners or anyone with cardiovascular concerns.',
          ],
        },
        {
          heading: 'Common Breathing Mistakes',
          bullets: [
            'Holding your breath through entire sets — causes unnecessary blood pressure spikes and can lead to dizziness',
            'Shallow chest breathing — only using the upper chest instead of the diaphragm, reducing oxygen intake',
            'Breathing too fast — hyperventilation reduces CO2 levels, causing light-headedness and tingling',
            'Forgetting to breathe at all — surprisingly common during focused efforts. Your muscles need oxygen to perform.',
          ],
          imageUrl: ch6BreathingComparison,
          imageAlt: 'Side-by-side comparison of diaphragmatic breathing versus shallow chest breathing, showing correct and incorrect technique',
        },
      ],
      unbreakableInsight: 'Your muscles don\'t just need to be strong — they need oxygen. If your breathing is off, your performance ceiling drops no matter how much muscle you\'ve built. Master the basics: breathe through your diaphragm, time it to your reps, and stop holding your breath through entire sets.',
      coachNote: 'The Valsalva technique is genuinely useful for experienced lifters going heavy, but it\'s a tool — not a default. For most of your training, controlled breathing through the rep is safer and still creates adequate core pressure. If you\'re new, focus on exhaling during effort and inhaling during the eccentric.',
      practicalTask: {
        title: 'Breathing Awareness Session',
        instructions: 'During your next training session, consciously focus on your breathing for every set. For each exercise, note when you inhale and exhale relative to the movement. Also spend 2 minutes before training practising diaphragmatic breathing — place one hand on your chest and one on your belly, and breathe so only the belly hand moves.',
        reflectionQuestions: [
          'Did you notice any exercises where you were unconsciously holding your breath?',
          'How did focused breathing affect your perceived effort during sets?',
          'Were you using diaphragmatic breathing or shallow chest breathing during rest periods?',
        ],
      },
    },
    {
      number: 7,
      title: 'The Nervous System & Movement Control',
      learningOutcome: 'Understand how the nervous system controls voluntary movement, coordinates muscle contractions, and adapts to training through neural pathways.',
      assessmentCriteria: [
        'Describe the basic structure and function of the central and peripheral nervous systems in relation to movement',
        'Explain what a motor unit is and how motor unit recruitment affects force production',
        'Identify the role of proprioception in balance, coordination, and injury prevention',
      ],
      content: [
        {
          heading: 'Your Body\'s Command Centre',
          paragraphs: [
            'Every time you pick up a dumbbell, stabilise during a squat, or catch yourself from tripping — your nervous system made it happen. Muscles don\'t move on their own. They respond to electrical signals from your brain and spinal cord.',
            'The nervous system is split into two main parts: the Central Nervous System (CNS) — your brain and spinal cord — and the Peripheral Nervous System (PNS) — the network of nerves that extends to every muscle, joint, and organ in your body.',
          ],
          imageUrl: ch7NervousSystem,
          imageAlt: 'Diagram showing the central and peripheral nervous systems with somatic and autonomic branches',
        },
        {
          heading: 'Motor Units: The Link Between Brain & Muscle',
          paragraphs: [
            'A motor unit consists of a single motor neuron and all the muscle fibres it controls. When the neuron fires, every fibre in that motor unit contracts. Small motor units control fine movements (writing, eye movements). Large motor units control powerful movements (jumping, heavy lifting).',
            'Your body recruits motor units in order — small ones first, large ones only when more force is needed. This is called the Size Principle. It\'s why light weights feel easy — you\'re only using small motor units. As the load increases, larger motor units are recruited to produce more force.',
          ],
          imageUrl: ch7MotorUnitRecruitment,
          imageAlt: 'Progressive bar chart showing motor unit recruitment from light load to maximal load following the size principle',
        },
        {
          heading: 'Why Beginners Get Stronger Before They Get Bigger',
          paragraphs: [
            'When you first start training, your strength increases rapidly — but your muscles don\'t visibly grow for weeks or months. This is because early strength gains are neural, not muscular. Your nervous system learns to:',
          ],
          bullets: [
            'Recruit more motor units simultaneously (more total fibres firing)',
            'Fire motor units more rapidly (rate coding) — producing more force per contraction',
            'Coordinate opposing muscle groups better — reducing wasted energy from co-contraction',
            'Improve the timing and sequencing of muscle activation patterns',
          ],
          paragraphs: [
            'This is why practising a movement makes you stronger at that movement, even before hypertrophy occurs. Neural efficiency is the first adaptation.',
          ],
        },
        {
          heading: 'Proprioception: Your Sixth Sense',
          paragraphs: [
            'Proprioception is your body\'s ability to sense its own position in space without looking. Specialised receptors in your muscles (muscle spindles), tendons (Golgi tendon organs), and joints send constant feedback to your brain about limb position, movement speed, and force.',
            "Good proprioception means better balance, more precise movements, and fewer injuries. It\'s why you can walk without watching your feet, and why experienced lifters can feel when their squat depth is right without a mirror.",
          ],
          bullets: [
            'Muscle spindles — detect changes in muscle length and speed of stretch. Trigger the stretch reflex (e.g., knee-jerk test)',
            'Golgi tendon organs — detect changes in muscle tension. Provide a protective mechanism against excessive force',
            'Joint receptors — detect joint position, movement direction, and pressure. Essential for stability and coordination',
          ],
          imageUrl: ch7Proprioceptors,
          imageAlt: 'Three types of proprioceptive receptors: muscle spindles, Golgi tendon organs, and joint receptors with their functions',
        },
        {
          heading: 'Training the Nervous System',
          paragraphs: [
            'Your nervous system responds to training just like your muscles do. Specific training methods target neural adaptations:',
          ],
          bullets: [
            'Heavy lifting (85%+ 1RM) — improves motor unit recruitment and rate coding',
            'Explosive/plyometric training — improves rate of force development and reactive ability',
            'Balance and stability work — improves proprioception and joint awareness',
            'Skill practice (repeating movements) — strengthens neural pathways through myelination, making signals travel faster',
            'CNS fatigue is real — heavy or explosive training taxes the nervous system. This is why powerlifters can feel exhausted without muscle soreness, and why deload weeks matter.',
          ],
        },
      ],
      unbreakableInsight: 'Strength isn\'t just about muscle size — it\'s about how well your brain can talk to your muscles. Two people with the same amount of muscle can produce very different amounts of force. The difference is neural efficiency. Train the movement, not just the muscle.',
      coachNote: 'This is why beginners should focus on compound movements and practise them frequently rather than chasing muscle fatigue with isolation exercises. Build the neural pathways first. The hypertrophy follows. And if you ever hit a strength plateau, consider that the issue might be neural — not muscular.',
      practicalTask: {
        title: 'Neural Adaptation Log',
        instructions: 'Choose one compound exercise (squat, bench, deadlift, or overhead press). Perform it three times over the next week, noting how the movement feels each session. Pay attention to coordination, bar path, balance, and confidence under load — not just weight lifted.',
        reflectionQuestions: [
          'Did the movement feel smoother or more controlled by the third session?',
          'Were you able to produce more force without the weight feeling heavier?',
          'Can you identify a point in the movement where your coordination breaks down?',
        ],
      },
    },
    {
      number: 8,
      title: 'Posture, Alignment & Mobility',
      learningOutcome: 'Understand the importance of postural alignment for training safety and performance, and learn practical approaches to assessing and improving mobility.',
      assessmentCriteria: [
        'Describe correct standing posture and identify the most common postural deviations seen in gym users',
        'Explain the difference between flexibility and mobility and why mobility matters more for training',
        'Design a basic mobility routine targeting the most common restriction areas for gym users',
      ],
      content: [
        {
          heading: 'Why Posture Matters for Performance',
          paragraphs: [
            'Posture isn\'t just about looking good standing up — it directly affects how you perform under load. Poor postural alignment creates compensations during exercise, meaning some muscles overwork while others switch off. Over time, this leads to pain, plateau, and injury.',
            'Think about a squat performed with excessive forward lean: the lower back takes load that should be shared by the glutes and quads. Or a bench press with rounded shoulders: the shoulder joint is in a compromised position before you\'ve even unracked the bar.',
          ],
        },
        {
          heading: 'Common Postural Deviations',
          bullets: [
            'Upper Crossed Syndrome — tight chest and neck muscles paired with weak upper back and deep neck flexors. Causes rounded shoulders and forward head posture. Extremely common in office workers and phone users.',
            'Lower Crossed Syndrome — tight hip flexors and lower back paired with weak glutes and abdominals. Causes excessive lower back arch (anterior pelvic tilt). Common in people who sit all day.',
            'Kyphosis — excessive rounding of the upper back. Can be structural or habitual. Limits overhead pressing ability and increases shoulder impingement risk.',
            'Lateral imbalances — one shoulder higher than the other, hips shifted to one side, or rotation through the torso. Often caused by carrying bags on one side or sport-specific dominance.',
          ],
          imageUrl: ch8PostureDeviations,
          imageAlt: 'Diagram showing common postural deviations: upper crossed syndrome, lower crossed syndrome, and lateral imbalance with causes and effects',
        },
        {
          heading: 'Flexibility vs Mobility',
          paragraphs: [
            'These terms are often used interchangeably, but they mean different things:',
          ],
          bullets: [
            'Flexibility — the passive range of motion at a joint. How far a muscle can be stretched (e.g., touching your toes with straight legs).',
            'Mobility — the active range of motion at a joint under control. How much range you can use with strength (e.g., reaching overhead with a loaded barbell).',
          ],
          paragraphs: [
            'For training, mobility is what matters. Being passively flexible but unable to control that range under load is a recipe for injury. A gymnast might be hypermobile but get hurt if they can\'t stabilise those positions. A powerlifter needs enough mobility to hit depth in a squat — but also enough stability to stay rigid under maximal load.',
          ],
        },
        {
          heading: 'The Key Mobility Areas for Gym Users',
          paragraphs: [
            'Most gym-related mobility problems come from the same few areas. If you focus your mobility work here, you\'ll cover 90% of what you need:',
          ],
          bullets: [
            'Thoracic spine — needs extension and rotation. Stiffness here limits overhead pressing, squat posture, and deadlift setup.',
            'Hips — need flexion, extension, and rotation. Tight hips limit squat depth, pull from the floor, and contribute to lower back pain.',
            'Ankles — need dorsiflexion. Limited ankle mobility forces the torso forward in a squat and can cause knee tracking issues.',
            'Shoulders — need flexion, external rotation, and extension. Limited shoulder mobility restricts overhead pressing and back squat bar position.',
          ],
          imageUrl: ch8MobilityAreas,
          imageAlt: 'Key mobility areas for gym users: thoracic spine, shoulders, hips, and ankles with specific limitations each causes',
        },
        {
          heading: 'A Practical Approach to Mobility',
          paragraphs: [
            'You don\'t need a 30-minute mobility routine before every session. What you need is targeted work on your specific limitations:',
          ],
          bullets: [
            'Assess first — if you can squat to depth with good posture, your hip and ankle mobility is probably fine. Don\'t fix what isn\'t broken.',
            'Warm-up mobility — 5-10 minutes of dynamic movements targeting the joints you\'re about to load. Leg swings, arm circles, thoracic rotations, bodyweight squats.',
            'Dedicated mobility work — do this separately (evenings, rest days). Sustained holds (60-120 seconds) in positions that challenge your end range.',
            'Loaded stretching — using light weight through a full range of motion (e.g., deep pause squats, Romanian deadlifts). One of the most effective ways to build usable mobility.',
          ],
        },
      ],
      unbreakableInsight: 'If you can\'t get into a position without a barbell, you have no business loading that position with one. Mobility isn\'t optional — it\'s a prerequisite. Train through a full range of motion or watch your body slowly tighten around a narrower and narrower set of movements until something breaks.',
      coachNote: 'Most beginners don\'t need extensive mobility work — they need to train through full ranges of motion consistently. Deep squats, overhead presses, Romanian deadlifts, and pull-ups done properly will build mobility while building strength. Add dedicated mobility work only for specific restrictions that limit your training positions.',
      practicalTask: {
        title: 'Mobility Self-Assessment',
        instructions: 'Perform these four tests and rate yourself as Pass/Needs Work for each: (1) Overhead squat with arms extended — can you sit below parallel with heels flat and arms overhead? (2) Wall angel — stand with back flat against a wall and slide arms up and down without arching your back. (3) Deep bodyweight squat — hold the bottom position for 30 seconds with heels flat. (4) Shoulder flexion — lie face down and lift straight arms off the floor.',
        reflectionQuestions: [
          'Which areas showed the most restriction?',
          'Can you identify any exercises in your programme where these limitations might be causing compensations?',
          'What two mobility drills could you add to your warm-up to address your biggest restriction?',
        ],
      },
    },
  ],
};

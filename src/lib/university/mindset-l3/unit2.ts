import type { Unit } from '../types';
import ch1AdvancedBreathwork from '@/assets/university/mindl3-u2-ch1-advanced-breathwork.png';
import ch2ColdScience from '@/assets/university/mindl3-u2-ch2-cold-science.png';
import ch3HeatExposure from '@/assets/university/mindl3-u2-ch3-heat-exposure.png';
import ch4SportBreathing from '@/assets/university/mindl3-u2-ch4-sport-breathing.png';
import ch5ContrastTherapy from '@/assets/university/mindl3-u2-ch5-contrast-therapy.png';
import ch6AltitudeTimeline from '@/assets/university/mindl3-u2-ch6-altitude-timeline.png';

export const mindsetL3Unit2: Unit = {
  number: 2,
  title: 'Advanced Breathing & Exposure Science',
  description: 'Master advanced breathwork protocols, understand the science of deliberate cold and heat exposure, and apply structured exposure practices for physiological and psychological adaptation.',
  chapters: [
    {
      number: 1,
      title: 'Advanced Breathwork Protocols',
      learningOutcome: 'Apply advanced breathing techniques including cyclic hyperventilation, CO2 tolerance training, and resonance frequency breathing for specific physiological outcomes.',
      assessmentCriteria: [
        'Explain the physiological mechanisms behind cyclic hyperventilation and its effects on blood chemistry',
        'Describe CO2 tolerance training and how it improves breathing efficiency and stress resilience',
        'Apply resonance frequency breathing to optimise heart rate variability',
      ],
      content: [
        {
          heading: 'Cyclic Hyperventilation — Controlled Intensity',
          paragraphs: [
            'Cyclic hyperventilation protocols (such as Wim Hof breathing, Tummo, and holotropic breathwork) deliberately lower blood CO2, raising blood pH (respiratory alkalosis). This creates tingling sensations, lightheadedness, and a controlled adrenaline response. The subsequent breath hold after exhalation allows CO2 to rise sharply, creating a powerful sympathetic-to-parasympathetic transition.',
            'Advanced protocols extend round counts (4–5 rounds vs beginner 3), increase breath pace, and extend retention times. The physiological benefits include improved CO2 tolerance, enhanced vagal tone (from the recovery phase), and acute increases in noradrenaline and dopamine that can last hours.',
          ],
          imageUrl: ch1AdvancedBreathwork,
          imageAlt: 'Advanced breathwork protocols showing Wim Hof method cycles, CO2 tolerance curve, and oxygen-CO2 exchange diagram',
          imagePlaceholder: 'Graph showing blood CO2 and O2 levels across a 4-round cyclic hyperventilation session, with breath hold periods and recovery phases marked',
        },
        {
          heading: 'CO2 Tolerance Training',
          paragraphs: [
            'Your body\'s urge to breathe is primarily driven by rising CO2, not falling O2. Most people have poor CO2 tolerance — they breathe too fast and too shallowly, keeping CO2 chronically low. This creates a sensitised respiratory drive that amplifies anxiety and hyperventilation under stress.',
            'CO2 tolerance training gradually teaches your chemoreceptors to tolerate higher CO2 levels. Techniques include extended exhale holds (breathing normally, then holding after an exhalation), CO2 tables (repeated holds with decreasing rest intervals), and slow breathing practice (reducing breathing rate to 4–6 breaths per minute). Improved CO2 tolerance directly correlates with reduced anxiety and better performance under pressure.',
          ],
          bullets: [
            'BOLT score improvement — Track your Body Oxygen Level Test score weekly as you train',
            'Extended exhale holds — After normal exhale, hold comfortably. Aim for 40+ seconds over time',
            'CO2 tables — Series of holds with decreasing rest (e.g., 8 holds, resting 60s, 50s, 40s, etc.)',
            'Slow breathing — Reduce rate to 5–6 breaths/min for 10 minutes daily. This alone improves tolerance significantly',
          ],
        },
        {
          heading: 'Resonance Frequency Breathing',
          paragraphs: [
            'Every individual has a resonance frequency — a specific breathing rate (typically 4.5–7 breaths per minute) at which heart rate variability is maximised. Breathing at this rate creates maximum oscillation in your autonomic nervous system, training it to be more flexible and responsive.',
            'Higher HRV is associated with better emotional regulation, cognitive performance, and stress recovery. To find your resonance frequency, breathe at different rates (starting at 6 breaths/min) while monitoring HRV, and identify the rate that produces the largest oscillations. Once found, practise at this rate for 20 minutes daily.',
          ],
        },
      ],
      unbreakableInsight: 'Your breath is the only autonomic function you can consciously override. Master it, and you have a direct control panel for your entire nervous system.',
      coachNote: 'Do not rush advanced protocols. Ensure your BOLT score is above 25 before progressing to intense cyclic hyperventilation. Foundation breathing must be solid first.',
      practicalTask: {
        title: 'CO2 Tolerance Progression',
        instructions: 'Test your BOLT score. Then follow a two-week CO2 tolerance programme: Week 1 — 10 minutes daily slow breathing at 6 breaths/min plus 3 gentle exhale holds. Week 2 — Add a CO2 table (8 holds with decreasing rest). Retest BOLT after two weeks.',
        reflectionQuestions: [
          'How did your BOLT score change over the two weeks?',
          'Did you notice any changes in your daily breathing patterns or anxiety levels?',
          'Which protocol felt most challenging, and how did you manage the discomfort?',
        ],
      },
    },
    {
      number: 2,
      title: 'Cold Exposure Science',
      learningOutcome: 'Understand the detailed physiological adaptations to cold exposure, apply progressive cold exposure protocols safely, and evaluate the evidence base for cold therapy benefits.',
      assessmentCriteria: [
        'Explain the cold shock response and the body\'s thermoregulatory mechanisms',
        'Describe the neurochemical effects of cold exposure including noradrenaline, dopamine, and brown fat activation',
        'Design a progressive cold exposure protocol with appropriate safety considerations',
      ],
      content: [
        {
          heading: 'The Cold Shock Response',
          paragraphs: [
            'When cold water contacts your skin, the cold shock response triggers an involuntary gasp, rapid breathing, and sharp increases in heart rate and blood pressure. This is mediated by cutaneous cold receptors signalling the sympathetic nervous system. The response is most intense in the first 30–60 seconds and diminishes with repeated exposure as habituation occurs.',
            'Understanding this response is essential for safety. The gasp reflex is dangerous in water (drowning risk), and the cardiovascular strain can be risky for those with heart conditions. Progressive exposure — starting with cold showers rather than immersion — builds habituation safely.',
          ],
          imageUrl: ch2ColdScience,
          imageAlt: 'Cold exposure science showing thermogenesis pathways, brown adipose tissue activation, and progressive cold protocol',
          imagePlaceholder: 'Timeline diagram of the cold shock response showing heart rate, breathing rate, and noradrenaline levels from 0 to 5 minutes of cold water exposure',
        },
        {
          heading: 'Neurochemical Benefits',
          paragraphs: [
            'Cold exposure triggers a significant and sustained increase in noradrenaline (200–300% increase) and dopamine (250% increase that can last 2–3 hours). These neurochemicals improve alertness, mood, focus, and motivation. Unlike caffeine or stimulant drugs, the dopamine increase from cold exposure is gradual and sustained rather than spiked and crashed.',
            'Regular cold exposure also activates brown adipose tissue (BAT) — metabolically active fat that generates heat by burning calories. While the caloric impact is modest, the metabolic and insulin sensitivity improvements are meaningful. Cold exposure also reduces systemic inflammation markers (IL-6, TNF-α) with regular practice.',
          ],
          bullets: [
            'Noradrenaline — 200–300% increase; improves alertness, focus, and mood',
            'Dopamine — 250% increase lasting 2–3 hours; improves motivation without crash',
            'Brown fat activation — Increased thermogenesis, improved insulin sensitivity',
            'Anti-inflammatory — Reduced IL-6 and TNF-α with consistent practice',
            'Habituation — The discomfort decreases with practice; the benefits do not',
          ],
        },
        {
          heading: 'Progressive Cold Protocol',
          paragraphs: [
            'Start with 30 seconds of cold water at the end of a normal shower (week 1–2). Progress to 1–2 minutes (week 3–4). Then try 2–3 minutes of cold-only showers (week 5–6). Only consider cold water immersion (bath, outdoor swimming) after 6+ weeks of shower-based practice.',
            'During cold exposure, focus on breathing control — slow, deliberate nasal breathing. This is the training: maintaining calm in the face of acute physiological stress. The psychological carry-over to other stressful situations is the primary benefit for most people.',
          ],
        },
      ],
      unbreakableInsight: 'Cold exposure is voluntary discomfort with measurable benefits. Every time you choose the cold, you prove to yourself that comfort is optional. That lesson transfers to everything.',
      coachNote: 'The goal is not suffering — it is controlled exposure with conscious breathing. If you are gasping and panicking the entire time, reduce the intensity. Calm in the cold is the objective.',
      practicalTask: {
        title: 'Cold Exposure Log',
        instructions: 'Follow the progressive protocol for two weeks. Record temperature (if available), duration, heart rate, and a subjective discomfort rating (1–10) for each session. Also note mood and energy levels 1 hour after exposure.',
        reflectionQuestions: [
          'How did your discomfort ratings change across the two weeks?',
          'Did you notice any mood or energy benefits after cold exposure sessions?',
          'What breathing strategies were most effective for managing the cold shock response?',
        ],
      },
    },
    {
      number: 3,
      title: 'Heat Exposure & Sauna Science',
      learningOutcome: 'Understand the physiological effects of deliberate heat exposure, evaluate the evidence for sauna-based health benefits, and apply safe heat exposure protocols.',
      assessmentCriteria: [
        'Describe the cardiovascular and hormonal responses to heat exposure',
        'Evaluate the evidence base for sauna use in cardiovascular health, recovery, and longevity',
        'Design a progressive heat exposure protocol with appropriate safety considerations',
      ],
      content: [
        {
          heading: 'Cardiovascular Response to Heat',
          paragraphs: [
            'Deliberate heat exposure (sauna, hot baths) creates cardiovascular stress comparable to moderate exercise. Core body temperature rises, heart rate increases to 100–150 bpm, blood vessels dilate, and blood pressure initially drops before the cardiovascular system compensates. This "passive cardiovascular conditioning" has measurable benefits for heart health.',
            'Finnish longitudinal studies (involving 2,300+ participants over 20 years) found that frequent sauna use (4–7 sessions per week at 80°C+) was associated with a 40% reduction in all-cause mortality and a 50% reduction in cardiovascular disease events compared to once-weekly use.',
          ],
          imageUrl: ch3HeatExposure,
          imageAlt: 'Sauna and heat exposure science showing heat shock protein activation, growth hormone release, and cardiovascular benefits',
          imagePlaceholder: 'Infographic showing the cardiovascular response to sauna use — heart rate, blood pressure, and core temperature changes over a 20-minute session',
        },
        {
          heading: 'Hormonal & Recovery Benefits',
          paragraphs: [
            'Heat exposure triggers the release of heat shock proteins (HSPs) — molecular chaperones that repair damaged proteins and protect cells from stress. Regular heat exposure increases baseline HSP levels, improving your body\'s ability to handle all forms of stress.',
            'Growth hormone release is significantly increased by heat exposure — studies show up to a 200–300% increase with protocols of 20 minutes at 80°C. However, this is acute and transient. Sauna use also reduces cortisol, improves sleep quality (via the post-sauna core temperature drop), and may reduce muscle soreness after training through improved blood flow.',
          ],
          bullets: [
            'Heat shock proteins — Cellular protection that improves resilience to multiple stressors',
            'Growth hormone — Acute increases of 200–300% with 20-minute sauna sessions',
            'Cortisol reduction — Regular use lowers baseline stress hormone levels',
            'Sleep improvement — The post-sauna temperature drop promotes deeper sleep onset',
            'BDNF increase — Brain-derived neurotrophic factor supports neuroplasticity and mood',
          ],
        },
        {
          heading: 'Safe Heat Protocol',
          paragraphs: [
            'Start with 10–15 minutes at a moderate temperature (70–80°C) 2–3 times per week. Progress to 15–20 minutes at 80–100°C. Listen to your body: dizziness, nausea, or feeling faint means exit immediately. Hydrate before and after — you can lose 0.5–1 litre of sweat in a single session.',
            'Contrast therapy (alternating heat and cold) amplifies the cardiovascular benefits and hormonal responses. A typical protocol: 15 minutes sauna, 2 minutes cold plunge, repeated 2–3 times. End on cold if you want alertness; end on heat if you want relaxation.',
          ],
        },
      ],
      unbreakableInsight: 'Heat is as powerful a stress inoculation tool as cold. The discipline to sit with rising discomfort — choosing not to escape — builds exactly the same mental muscle you need everywhere else.',
      coachNote: 'If you do not have access to a sauna, a hot bath (40°C for 20 minutes) provides many of the same benefits. The key is deliberate, regular heat stress.',
      practicalTask: {
        title: 'Heat Exposure Protocol',
        instructions: 'Complete 6 heat exposure sessions over two weeks using a sauna or hot bath. Record duration, temperature, heart rate, and subjective tolerance (1–10). Note sleep quality on sauna days vs non-sauna days.',
        reflectionQuestions: [
          'Did your tolerance to the heat improve across the six sessions?',
          'Was there a noticeable difference in sleep quality on heat exposure days?',
          'How did the discomfort management skills from heat exposure compare to cold exposure?',
        ],
      },
    },
    {
      number: 4,
      title: 'Breathing for Sport & Competition',
      learningOutcome: 'Apply specialised breathing techniques for different phases of sport and competition, including pre-performance arousal regulation, intra-competition focus, and post-performance recovery.',
      assessmentCriteria: [
        'Select appropriate breathing protocols for different competitive demands (power, endurance, precision)',
        'Apply pre-performance breathing routines to optimise arousal levels',
        'Use post-performance breathing to accelerate parasympathetic recovery',
      ],
      content: [
        {
          heading: 'Pre-Performance Breathing',
          paragraphs: [
            'The goal before performance is to reach your optimal arousal zone — not too calm, not too activated. For power events (heavy lifts, sprints), you want moderate sympathetic activation: short, sharp nasal breathing or 2–3 forced exhales through the mouth can raise arousal. For precision events (archery, putting), you want parasympathetic dominance: slow 4-7-8 breathing to lower heart rate.',
            'The Inverted-U hypothesis (Yerkes-Dodson Law) explains this: performance peaks at moderate arousal and declines at both extremes. Different tasks have different optimal arousal points. Your job is to learn where your personal peak is for each type of performance and use breathing to dial to that level.',
          ],
          imageUrl: ch4SportBreathing,
          imageAlt: 'Breathing for sport and competition showing pre-competition activation, inter-set recovery, and nasal vs mouth breathing',
          imagePlaceholder: 'Inverted-U curve diagram showing the Yerkes-Dodson relationship between arousal and performance, with breathing protocols mapped to different zones',
        },
        {
          heading: 'Intra-Performance Breathing',
          paragraphs: [
            'During performance, breathing serves multiple functions: oxygen delivery, core stabilisation, and anxiety regulation. For heavy lifts, the Valsalva manoeuvre (deep breath, hold, brace, lift) maximises intra-abdominal pressure and spinal stability. For endurance, rhythmic breathing matched to movement cadence optimises efficiency.',
            'For managing mid-competition anxiety, "tactical breathing" (4-count inhale, 4-count hold, 4-count exhale, 4-count hold) can be performed between sets, during breaks, or even during lower-intensity phases. Elite performers report using anchor breaths — single deep breaths that reset focus at specific trigger points.',
          ],
          bullets: [
            'Power — Valsalva manoeuvre for maximum bracing and force production',
            'Endurance — Nasal breathing where possible; rhythmic patterns matched to cadence',
            'Precision — Exhale on execution (e.g., release the arrow at the bottom of the exhale)',
            'Recovery between efforts — 3–5 slow nasal breaths to accelerate parasympathetic recovery',
            'Anxiety management — Tactical box breathing during breaks or transitions',
          ],
        },
        {
          heading: 'Post-Performance Recovery Breathing',
          paragraphs: [
            'After intense performance, your sympathetic nervous system is highly activated. Deliberately switching to parasympathetic mode accelerates recovery: heart rate recovery, cortisol clearance, and glycogen replenishment all improve when you shift out of fight-or-flight quickly.',
            'A post-performance protocol: immediately after finishing, lie down or sit with legs elevated. Breathe slowly through the nose: 4 seconds in, 8 seconds out. Continue for 5–10 minutes. This simple practice can reduce heart rate recovery time by 30% and measurably lower post-exercise cortisol.',
          ],
        },
      ],
      unbreakableInsight: 'Your breathing during competition is your scoreboard. Chaotic breathing means chaotic performance. Controlled breathing means controlled output. Master this and you master pressure.',
      coachNote: 'Practise your pre-performance breathing routine in training first. Do not introduce new techniques for the first time in competition — train them until they are automatic.',
      practicalTask: {
        title: 'Performance Breathing Protocol',
        instructions: 'Identify your primary training activity (strength, endurance, or precision). Design a pre-, intra-, and post-performance breathing protocol specific to that activity. Use it for six training sessions and record its impact on focus, performance, and recovery.',
        reflectionQuestions: [
          'Did the pre-performance breathing routine affect your readiness and focus?',
          'Which intra-performance breathing technique had the biggest impact?',
          'How did deliberate post-performance breathing affect your recovery time and feeling after sessions?',
        ],
      },
    },
    {
      number: 5,
      title: 'Contrast Therapy & Hormetic Stress',
      learningOutcome: 'Understand the concept of hormesis, how deliberate stress exposure drives adaptation, and how to combine cold, heat, and breathing protocols into integrated resilience practices.',
      assessmentCriteria: [
        'Define hormesis and explain how it applies to cold, heat, breathing, and exercise',
        'Evaluate the evidence for contrast therapy combining heat and cold exposure',
        'Design an integrated weekly protocol combining multiple hormetic stressors',
      ],
      content: [
        {
          heading: 'What Is Hormesis?',
          paragraphs: [
            'Hormesis is the biological principle that low-to-moderate doses of a stressor stimulate beneficial adaptive responses, while high doses cause harm. Exercise is the most obvious example: moderate training stress builds fitness, while overtraining causes breakdown.',
            'The same principle applies to cold exposure (builds cold tolerance and neurochemical resilience), heat exposure (triggers heat shock proteins and cardiovascular adaptation), breathing challenges (improves CO2 tolerance and vagal tone), and even psychological stress (builds coping capacity through controlled challenge). The key is dose — enough to trigger adaptation, not so much that you overwhelm recovery.',
          ],
          imageUrl: ch5ContrastTherapy,
          imageAlt: 'Contrast therapy and hormetic stress showing dose-response curve and cellular stress adaptation pathways',
          imagePlaceholder: 'Hormesis dose-response curve showing the beneficial adaptation zone between no-effect threshold and harmful overdose, with examples of cold, heat, and exercise mapped along the curve',
        },
        {
          heading: 'Contrast Therapy Protocols',
          paragraphs: [
            'Contrast therapy alternates between heat and cold to amplify the vascular, hormonal, and neurological benefits of each. The temperature oscillation creates a "pump" effect in blood vessels: vasodilation in heat, vasoconstriction in cold. This enhances circulation, reduces inflammation, and creates powerful hormonal cascades.',
            'A standard protocol: 15 minutes sauna (or hot bath at 40°C) → 2 minutes cold (shower at 10–15°C or cold plunge) → repeat 2–3 rounds. End on cold for alertness and energy; end on hot for relaxation and sleep preparation. Studies show contrast therapy reduces DOMS by 20–30% and accelerates heart rate recovery.',
          ],
        },
        {
          heading: 'Designing Your Hormetic Week',
          paragraphs: [
            'An integrated week might include: 2–3 cold exposures (morning showers or plunges), 2–3 heat exposures (sauna or hot baths), daily breathwork (10–20 minutes), and 3–5 training sessions (the original hormetic stressor). The key is periodising your stress — not stacking all stressors on the same day without recovery.',
            'Monitor your response through subjective measures (energy, mood, sleep quality, motivation) and objective measures (resting heart rate, HRV, BOLT score). If sleep deteriorates, motivation drops, or resting heart rate rises, you are overdoing it — reduce exposure frequency until recovery normalises.',
          ],
          bullets: [
            'Monday — Morning cold shower (2 min), breathwork (15 min), strength training',
            'Tuesday — Evening sauna (20 min), gentle stretching, extended exhale breathing',
            'Wednesday — Morning cold shower, breathwork, active recovery or cardio',
            'Thursday — Rest from exposure stressors; strength training only',
            'Friday — Contrast therapy (sauna + cold), breathwork',
            'Weekend — One exposure session plus leisure activity; minimum one full rest day',
          ],
        },
      ],
      unbreakableInsight: 'Every stressor you deliberately choose and recover from makes you harder to break. The gym, the cold, the heat, the breath hold — they are all the same lesson: you can handle more than you think.',
      coachNote: 'Start with one hormetic practice at a time. Master cold showers before adding sauna. Master both before adding contrast therapy. Stack gradually, not ambitiously.',
      practicalTask: {
        title: 'Hormetic Week Design',
        instructions: 'Design and follow a one-week integrated protocol combining at least two hormetic stressors (cold, heat, advanced breathwork) alongside your regular training. Track sleep quality, energy, mood, and performance daily.',
        reflectionQuestions: [
          'How did the combined protocol affect your overall energy and recovery compared to training alone?',
          'Was there a point where you felt you were doing too much? How did you adjust?',
          'Which combination of stressors produced the best subjective feeling of resilience?',
        ],
      },
    },
    {
      number: 6,
      title: 'Altitude Training & Oxygen Manipulation',
      learningOutcome: 'Understand the physiological adaptations caused by reduced oxygen availability, and how altitude simulation and breath-hold training can be used to enhance endurance, resilience, and oxygen efficiency.',
      assessmentCriteria: [
        'Explain the body\'s acute and chronic responses to reduced oxygen (hypoxia) at altitude',
        'Describe the difference between live-high/train-low and simulated altitude training methods',
        'Design a safe introductory protocol using breath-hold walking or simulated hypoxic training',
      ],
      content: [
        {
          heading: 'Why Altitude Matters',
          paragraphs: [
            'At sea level, the air contains approximately 20.9% oxygen. At 2,500 metres, the air still contains 20.9% oxygen — but the reduced atmospheric pressure means each breath delivers fewer oxygen molecules to your lungs. Your body must adapt or suffer.',
            'Elite endurance athletes have trained at altitude for decades because these adaptations — more red blood cells, improved oxygen efficiency, greater capillary density — transfer directly to better performance at sea level. But you don\'t need to move to the mountains. Modern science has given us accessible ways to trigger similar adaptations.',
          ],
        },
        {
          heading: 'Acute vs Chronic Responses to Hypoxia',
          paragraphs: [
            'When you first experience reduced oxygen, your body mounts an immediate response:',
          ],
          bullets: [
            'Breathing rate increases — your body tries to get more air in',
            'Heart rate rises — pumping blood faster to deliver available oxygen more quickly',
            'Blood pressure increases — prioritising oxygen delivery to vital organs',
            'Cognitive function may decrease — the brain is extremely sensitive to oxygen levels',
          ],
          paragraphs: [
            'If the hypoxic exposure is repeated consistently over days and weeks, chronic adaptations begin:',
          ],
          bullets: [
            'EPO production increases — erythropoietin, a hormone produced by the kidneys, stimulates the bone marrow to produce more red blood cells',
            'Haemoglobin concentration rises — more oxygen-carrying capacity per unit of blood',
            'Capillary density increases — more blood vessels in muscle tissue means better oxygen delivery at the cellular level',
            'Mitochondrial efficiency improves — cells become better at using available oxygen',
            'Ventilatory response adapts — breathing becomes more efficient, extracting more oxygen per breath',
          ],
          imageUrl: ch6AltitudeTimeline,
          imageAlt: 'Timeline showing acute altitude responses transitioning to chronic adaptations over weeks, with accessible training methods listed',
        },
        {
          heading: 'Training Methods',
          paragraphs: [
            'There are several approaches to altitude and hypoxic training, ranging from natural to simulated:',
          ],
          bullets: [
            'Live High / Train Low (LHTL) — the gold standard. Living at altitude (2,000-2,500m) triggers chronic adaptations while training at low altitude maintains high-intensity performance. Used by elite endurance athletes worldwide.',
            'Intermittent Hypoxic Training (IHT) — breathing reduced-oxygen air through a mask or altitude simulator during training sessions. More accessible but provides less total hypoxic exposure.',
            'Altitude tents / hypoxic chambers — sleeping in a reduced-oxygen environment to trigger EPO production. Requires specialised equipment but available for home use.',
            'Breath-hold training (simulated altitude) — using breath-hold protocols during walking or exercise to create transient hypoxic conditions. The most accessible method — requires no equipment.',
          ],
        },
        {
          heading: 'Breath-Hold Walking Protocol',
          paragraphs: [
            'Developed from the Oxygen Advantage methodology, breath-hold walking is the simplest way to introduce hypoxic training without any equipment:',
          ],
          bullets: [
            'Walk at a normal pace on flat ground',
            'Take a normal breath in, a relaxed breath out, then hold your nose and continue walking',
            'Count your steps during the breath hold. Walk until you feel a moderate to strong air hunger — not maximum',
            'Release the hold, breathe normally through your nose for 30-60 seconds',
            'Repeat 8-10 times',
            'Your step count will typically increase over weeks as your CO2 tolerance and oxygen efficiency improve',
          ],
          paragraphs: [
            'This protocol creates repeated transient drops in blood oxygen saturation, triggering a mild version of the same adaptations seen at altitude. It also trains your chemoreceptors to tolerate higher CO2 levels, which improves breathing efficiency during exercise.',
          ],
        },
        {
          heading: 'Safety Considerations',
          paragraphs: [
            'Hypoxic training — even mild breath-hold protocols — must be approached with respect:',
          ],
          bullets: [
            'Never practise breath holds in water — shallow water blackout kills even experienced swimmers',
            'Stop immediately if you feel dizzy, see spots, or experience tingling beyond mild discomfort',
            'Start conservatively — use moderate (not maximum) breath holds and increase gradually over weeks',
            'Avoid hypoxic training if you have cardiovascular conditions, are pregnant, or have epilepsy without medical clearance',
            'Breath-hold training on land while walking is inherently safe because if you were to lose consciousness (extremely unlikely at moderate holds), you would simply start breathing again automatically',
          ],
        },
      ],
      unbreakableInsight: 'You don\'t need a mountain to train like you live on one. Every breath hold you perform during a walk teaches your body to do more with less oxygen. This is the same adaptation that separates recreational athletes from elite performers — oxygen efficiency. The air is free. Use it wisely.',
      coachNote: 'Start with breath-hold walking before investing in altitude tents or hypoxic masks. It\'s free, it\'s safe when done on land, and it gives you a direct experience of what hypoxic training feels like. Track your step count during holds — watching it increase over weeks is one of the most satisfying metrics in training.',
      practicalTask: {
        title: 'Breath-Hold Walking Introduction',
        instructions: 'Perform 3 sessions of breath-hold walking over one week (minimum 48 hours between sessions). Each session: 10 minutes of normal nasal breathing walking to warm up, then 8 breath-hold walks with 60-second recovery breathing between each. Record your step count for each hold. Do not push to maximum — aim for a strong but manageable air hunger.',
        reflectionQuestions: [
          'Did your step count increase across the three sessions?',
          'How did you feel in the minutes after completing the breath-hold sets compared to normal walking?',
          'Can you see how this method could complement your existing training programme?',
        ],
      },
    },
    {
      number: 7,
      title: 'Breathwork for Recovery & Sleep',
      learningOutcome: 'Master advanced breathwork protocols specifically designed to enhance post-training recovery, improve sleep onset and quality, and accelerate parasympathetic restoration.',
      assessmentCriteria: [
        'Explain the physiological mechanisms by which breathwork enhances recovery',
        'Design a post-training breathwork cool-down protocol',
        'Apply pre-sleep breathing techniques to improve sleep onset latency',
      ],
      content: [
        {
          heading: 'Breathing as a Recovery Accelerator',
          paragraphs: [
            'Recovery is not passive — it is an active physiological process driven by the parasympathetic nervous system. The faster and more completely you can shift from sympathetic dominance (training mode) to parasympathetic dominance (recovery mode), the more effectively your body repairs tissue, reduces inflammation, replenishes glycogen, and consolidates motor learning.',
            'Breathwork is the most direct, voluntary pathway into the parasympathetic system. While passive rest eventually achieves the shift, targeted breathwork protocols can accelerate the transition from minutes to seconds — making them among the most time-efficient recovery tools available.',
          ],
        },
        {
          heading: 'Post-Training Recovery Protocols',
          bullets: [
            'Physiological sigh (double inhale + long exhale) — One of the fastest ways to reduce sympathetic arousal. Two quick nasal inhales followed by a long mouth exhale. Repeat 5–10 times immediately after training',
            'Extended exhale breathing — 4-count inhale, 6–8-count exhale through the nose for 3–5 minutes. The extended exhale directly stimulates the vagus nerve and shifts cardiac rhythm toward parasympathetic dominance',
            'Legs-up-the-wall breathing — Lie with legs elevated against a wall. Combine with slow nasal breathing for 5 minutes. Gravity assists venous return while breathwork accelerates nervous system downregulation',
            'Crocodile breathing — Lie face down with forehead on stacked hands. Breathe into the belly, feeling the abdomen push into the floor. This position restricts chest breathing and forces diaphragmatic patterns. 3–5 minutes',
          ],
        },
        {
          heading: 'Pre-Sleep Breathing Protocols',
          paragraphs: [
            'Sleep onset requires a shift into parasympathetic dominance. Many people struggle to fall asleep because they carry residual sympathetic activation from the day — racing thoughts, elevated heart rate, muscle tension. Targeted pre-sleep breathing short-circuits this pattern.',
          ],
          bullets: [
            '4-7-8 breathing — Inhale for 4 counts, hold for 7 counts, exhale for 8 counts. The long hold and extended exhale create a powerful parasympathetic signal. Complete 4 cycles',
            'Body scan with breath — Progressively direct attention to each body part while breathing slowly. This combines mindfulness with breathwork, reducing both cognitive and somatic arousal',
            'Left-nostril breathing — Block the right nostril and breathe only through the left for 2–3 minutes. In yogic tradition and some research, left-nostril breathing is associated with parasympathetic activation and cooling',
            'Timing — Begin your pre-sleep protocol 10–15 minutes before your target sleep time. Consistency trains your body to associate the protocol with sleep onset',
          ],
        },
      ],
      unbreakableInsight: 'Most people treat the gap between training and sleep as dead time. Elite performers use it strategically — accelerating recovery with breathwork that takes less time than scrolling social media. The same five minutes, radically different outcomes.',
      coachNote: 'Try adding a three-minute extended exhale protocol immediately after your next training session. Track how you feel two hours later compared to sessions without it. Most people notice a significant difference within the first week.',
      practicalTask: {
        title: 'Recovery Breathwork Protocol',
        instructions: 'For two weeks, implement a structured post-training and pre-sleep breathwork routine. After each training session: 5 physiological sighs followed by 3 minutes of extended exhale breathing. Before bed: 4 rounds of 4-7-8 breathing. Rate your recovery quality and sleep onset time daily.',
        reflectionQuestions: [
          'Did post-training breathwork change your perceived recovery between sessions?',
          'How did pre-sleep breathing affect your time to fall asleep?',
          'Which specific protocol felt most effective for you?',
        ],
      },
    },
    {
      number: 8,
      title: 'Environmental Stress Tolerance Programming',
      learningOutcome: 'Design a structured, periodised programme combining cold, heat, breathwork, and physical stress to systematically expand your stress tolerance and hormetic adaptation capacity.',
      assessmentCriteria: [
        'Explain the principle of hormesis and how it applies to stress tolerance training',
        'Design a progressive multi-stressor exposure programme',
        'Identify signs of overexposure and appropriate deload strategies',
      ],
      content: [
        {
          heading: 'Hormesis — Stress That Strengthens',
          paragraphs: [
            'Hormesis is the biological principle that controlled, moderate exposure to a stressor triggers adaptive responses that make you more resilient to that stressor — and often to other stressors as well. Cold exposure builds cold tolerance but also improves stress recovery. Heat exposure enhances cardiovascular resilience. Breathwork training expands CO2 tolerance. The key word is controlled — the dose determines whether stress strengthens or damages.',
            'This chapter integrates everything from Unit 2 into a structured programme. Individual techniques are useful; a periodised programme combining them is transformative. Like physical training, stress tolerance training requires progressive overload, adequate recovery, and intelligent programming.',
          ],
        },
        {
          heading: 'Programming Principles',
          bullets: [
            'Start conservative — Begin with the lowest effective dose of each stressor. A 30-second cold shower is sufficient to trigger adaptation. More is not always better',
            'Progress one variable at a time — Increase duration OR intensity OR frequency, never all three simultaneously. This prevents overexposure and allows you to identify what drives adaptation',
            'Combine stressors strategically — Cold exposure after training enhances mental resilience but may blunt hypertrophy signals. Time your exposures based on your primary goal',
            'Periodise exposure — Like training, cycle through phases: accumulation (building tolerance), intensification (pushing limits), and deload (recovery). A 3:1 pattern works well — three weeks of progressive exposure, one week of reduced volume',
            'Listen to your body — Signs of overexposure include persistent fatigue, sleep disruption, elevated resting heart rate, mood disturbance, and increased illness. If these appear, reduce the dose',
          ],
        },
        {
          heading: 'Sample 8-Week Programme Structure',
          bullets: [
            'Weeks 1–2 (Foundation) — Cold: 30s cold finish on showers, 3×/week. Breathwork: 5 min daily diaphragmatic + box breathing. Heat: none yet',
            'Weeks 3–4 (Building) — Cold: 60s cold showers, 4×/week. Breathwork: add CO2 tolerance tables 2×/week. Heat: introduce 10-min sauna/hot bath 2×/week',
            'Weeks 5–6 (Intensification) — Cold: 90–120s cold showers or cold plunge. Breathwork: 15-min sessions including breath holds. Heat: 15–20 min sauna 2–3×/week. Add contrast therapy 1×/week',
            'Week 7 (Peak) — Combine stressors in single sessions: breathwork → cold → heat → breathwork. Push comfort zone boundaries safely',
            'Week 8 (Deload) — Reduce all exposures by 50%. Maintain daily breathwork only. Assess progress and plan next cycle',
          ],
        },
      ],
      unbreakableInsight: 'Comfort is not the enemy of resilience — but permanent comfort is. You need controlled discomfort to expand your capacity. The goal is not to suffer; it is to systematically expand the range of conditions under which you can function well.',
      coachNote: 'Do not rush through this. The temptation is to jump to extreme cold plunges and long sauna sessions immediately. The person who progresses slowly and consistently for twelve months will be far more resilient than the person who goes hard for two weeks and burns out.',
      practicalTask: {
        title: 'Personal Stress Tolerance Programme',
        instructions: 'Design your own 4-week stress tolerance programme using the principles above. Choose 2–3 stressors you want to work with (cold, heat, breathwork, physical). Define your starting dose, weekly progression, and recovery strategy. Execute the programme and track your adaptation.',
        reflectionQuestions: [
          'Which stressor did you find most challenging, and did your tolerance measurably improve?',
          'Did you notice cross-adaptation — improvements in stress tolerance beyond the specific stressor you trained?',
          'How did you determine when to progress versus when to hold or deload?',
        ],
      },
    },
  ],
};

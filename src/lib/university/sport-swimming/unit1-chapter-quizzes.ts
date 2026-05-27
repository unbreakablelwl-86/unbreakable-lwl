import type { ChapterQuiz } from '../types';

function cq(unit: number, ch: number, questions: any[]): ChapterQuiz {
  return { unitNumber: unit, chapterNumber: ch, questionBank: questions, pickCount: 5, passMarkPercent: 80 };
}

export const sportSwimmingUnit1ChapterQuizzes: ChapterQuiz[] = [
  cq(1, 1, [
    { type: 'multiple_choice', question: 'How much denser is water than air?', options: ['800 times', '100 times', '10 times', '2000 times'], correctAnswer: 0, explanation: 'Water is approximately 800 times denser than air.' },
    { type: 'multiple_choice', question: 'What percentage of energy in a 200m swim is aerobic?', options: ['20%', '45%', '90%', '65%'], correctAnswer: 3, explanation: '200m events are approximately 65% aerobic.' },
    { type: 'multiple_choice', question: 'How many shoulder rotations do swimmers perform annually?', options: ['100,000', '500,000', '1-2 million', '5 million'], correctAnswer: 2, explanation: 'Swimmers perform 1-2 million shoulder rotations per year.' },
    { type: 'multiple_choice', question: 'What is Critical Swim Speed?', options: ['The swimming equivalent of lactate threshold', 'Average training pace', 'Maximum sprint speed', 'The speed of the water current'], correctAnswer: 0, explanation: 'CSS represents the sustainable threshold pace in swimming.' },
    { type: 'multiple_choice', question: 'Why do swimmers carry slightly more body fat than runners?', options: ['It has no benefit', 'Less training volume', 'Extra body fat aids buoyancy and body position in water', 'Poor diet'], correctAnswer: 2, explanation: 'Buoyancy from body fat improves horizontal body position.' },
  ]),
  cq(1, 2, [
    { type: 'multiple_choice', question: 'What is the most swim-specific strength exercise?', options: ['Bench press', 'Pull-ups — they mirror the catch and pull phases', 'Bicep curl', 'Leg extension'], correctAnswer: 1, explanation: 'Pull-ups directly simulate the primary propulsive movement in swimming.' },
    { type: 'multiple_choice', question: 'Why is core stability important for swimmers?', options: ['It transfers upper-body force into forward propulsion', 'Core exercises are easy', 'Rules require it', 'Appearance'], correctAnswer: 0, explanation: 'The core is the rigid platform through which pulling force becomes forward motion.' },
    { type: 'multiple_choice', question: 'What drives the fastest portions of a swim race?', options: ['Kick strength', 'Arm speed', 'Breathing technique', 'Lower-body power for starts and turns'], correctAnswer: 3, explanation: 'Starts and turns are the fastest race segments, powered by leg explosiveness.' },
    { type: 'multiple_choice', question: 'How many gym sessions per week in-season?', options: ['5 sessions', '7 sessions', 'None', '2-3 sessions of 30-45 minutes'], correctAnswer: 3, explanation: '2-3 sessions keep the pool as priority.' },
    { type: 'multiple_choice', question: 'What should happen if gym work impairs stroke technique?', options: ['Add more pool time to compensate', 'Reduce gym load immediately', 'Ignore it', 'Train harder'], correctAnswer: 1, explanation: 'If technique deteriorates, gym load is too high.' },
  ]),
  cq(1, 3, [
    { type: 'multiple_choice', question: 'What has greater impact on swim speed?', options: ['Increasing propulsion', 'Swimming harder', 'Bigger muscles', 'Reducing drag'], correctAnswer: 3, explanation: 'Drag reduction has greater impact than propulsion increase.' },
    { type: 'multiple_choice', question: 'What is the Early Vertical Forearm (EVF)?', options: ['A type of start', 'Maintaining a high elbow and vertical forearm during the catch to maximise propulsion', 'A stretching technique', 'A breathing technique'], correctAnswer: 1, explanation: 'EVF maximises the surface area pushing water backward.' },
    { type: 'multiple_choice', question: 'What percentage of a short-course race can turns and underwater account for?', options: ['15-20%', '50%+', '25-40%', '5-10%'], correctAnswer: 2, explanation: 'Turns and underwater phases are 25-40% of short-course races.' },
    { type: 'multiple_choice', question: 'What is the biggest technique fix for age-group swimmers?', options: ['Kicking harder', 'Breathing less', 'Faster arm turnover', 'Fixing the dropped elbow during the catch'], correctAnswer: 3, explanation: 'Dropping the elbow during the catch is the most common technique error.' },
    { type: 'multiple_choice', question: 'Why does sprint training need full recovery?', options: ['To maintain technique at maximum speed — form breakdown means too much fatigue', 'Recovery is not needed', 'Swimmers get tired', 'Rules require it'], correctAnswer: 0, explanation: 'Full recovery preserves technical quality during maximal efforts.' },
  ]),
  cq(1, 4, [
    { type: 'multiple_choice', question: 'What advantage does pool conditioning have over dry-land?', options: ['It burns more calories', 'There is no advantage', 'It is easier', 'It simultaneously trains technique and feel for the water'], correctAnswer: 3, explanation: 'Pool conditioning integrates fitness and technical development.' },
    { type: 'multiple_choice', question: 'What pace should aerobic base sets use?', options: ['At or below CSS pace', 'Walking pace', 'All-out effort', 'Maximum sprint'], correctAnswer: 0, explanation: 'CSS pace corresponds to the aerobic threshold.' },
    { type: 'multiple_choice', question: 'How much does the kick contribute to freestyle propulsion?', options: ['Less than 1%', '50%', '10-15%', '5%'], correctAnswer: 2, explanation: 'The kick contributes 10-15% of freestyle propulsion.' },
    { type: 'multiple_choice', question: 'How often should VO2max sets be performed?', options: ['Once per month', 'Never', '1-2 per week', 'Every session'], correctAnswer: 2, explanation: 'VO2max sets are demanding and should be limited to 1-2 weekly.' },
    { type: 'multiple_choice', question: 'What rest is needed for sprint training (12.5-25m max effort)?', options: ['No rest', '30 seconds', '10 seconds', '2-3 minutes'], correctAnswer: 3, explanation: 'Long rest ensures maximal quality for each sprint repetition.' },
  ]),
  cq(1, 5, [
    { type: 'multiple_choice', question: 'What percentage of competitive swimmers experience shoulder problems?', options: ['25-35%', '10-20%', '40-90%', 'Less than 5%'], correctAnswer: 2, explanation: "Swimmer\'s shoulder affects 40-90% of competitors." },
    { type: 'multiple_choice', question: "What strength ratio protects the swimmer\'s shoulder?", options: ['1:1 push to pull', '2:1 external to internal rotation', '3:1 internal to external rotation', 'Ratios do not matter'], correctAnswer: 1, explanation: '2:1 external-to-internal rotation maintains shoulder balance.' },
    { type: 'multiple_choice', question: 'What percentage of breaststroke specialists experience knee pain?', options: ['25%', '10%', 'Up to 75%', 'Less than 5%'], correctAnswer: 2, explanation: 'Breaststroke knee affects up to 75% of specialists.' },
    { type: 'multiple_choice', question: 'What protects the spine from butterfly and breaststroke demands?', options: ['Back extensions', 'Stretching only', 'Core anti-extension exercises like dead bugs and ab wheel', 'More swimming'], correctAnswer: 2, explanation: 'Anti-extension core work protects against repetitive hyperextension.' },
    { type: 'multiple_choice', question: 'How long does an effective pre-swim prehab routine take?', options: ['1 hour', '5 minutes', '30 seconds', '30 minutes'], correctAnswer: 1, explanation: 'Five minutes of targeted shoulder and core work reduces injury risk significantly.' },
  ]),
  cq(1, 6, [
    { type: 'multiple_choice', question: 'What daily calorie intake may male competitive swimmers need?', options: ['2,000-2,500', '8,000+', '3,000-3,500', '4,000-6,000+'], correctAnswer: 3, explanation: 'Male swimmers may need 4,000-6,000+ kcal during heavy training.' },
    { type: 'multiple_choice', question: 'What carbohydrate intake should swimmers target daily?', options: ['4-5g/kg', '2-3g/kg', '6-10g/kg', '15g/kg'], correctAnswer: 2, explanation: '6-10g/kg/day supports the glycogen demands of high-volume training.' },
    { type: 'multiple_choice', question: 'Why is dehydration a concern in swimming?', options: ['Chlorine prevents dehydration', 'It is not a concern', 'Swimmers lose fluid through sweat, breathing, and diuretic effects despite being in water', 'Water enters through the skin'], correctAnswer: 2, explanation: 'Fluid loss occurs through multiple mechanisms even in the pool.' },
    { type: 'multiple_choice', question: 'What should post-training nutrition include?', options: ['Nothing for 2 hours', 'Just water', 'Only protein', '20-30g protein + 1g/kg carbs within 30 minutes'], correctAnswer: 3, explanation: 'Combined protein and carbohydrate within 30 minutes maximises recovery.' },
    { type: 'multiple_choice', question: 'Why does cold water swimming increase appetite?', options: ['Psychological effect', 'Water suppresses satiety', 'It does not increase appetite', 'The body burns extra calories maintaining core temperature through thermoregulation'], correctAnswer: 3, explanation: 'Thermoregulation in cold water increases energy expenditure.' },
  ]),
  cq(1, 7, [
    { type: 'multiple_choice', question: 'What is the most common race management error in swimming?', options: ['Starting too fast and fading', 'Starting too slow', 'Not warming up', 'Breathing too much'], correctAnswer: 0, explanation: 'Front-loaded races fade dramatically — even or negative splitting is better.' },
    { type: 'multiple_choice', question: 'What are process goals during racing?', options: ['Focusing on controllable technique cues like high elbow catch', 'Watching competitors', 'Thinking about winning', 'Checking the clock constantly'], correctAnswer: 0, explanation: 'Process goals keep focus on controllable actions.' },
    { type: 'multiple_choice', question: 'Why is a consistent pre-race routine important?', options: ['It wastes time', 'Coaches require it', 'It has no benefit', 'Familiarity creates comfort in unfamiliar competition environments'], correctAnswer: 3, explanation: 'Routine familiarity reduces anxiety in new settings.' },
    { type: 'multiple_choice', question: 'How should training motivation be maintained in swimming?', options: ['Train alone', 'Set specific technical goals for each session and connect to long-term aims', 'Only think about race day', 'Just swim more'], correctAnswer: 1, explanation: 'Session-specific goals and long-term connection maintain engagement.' },
    { type: 'multiple_choice', question: 'What pacing strategy works best for events 200m and above?', options: ['Cruise the first half, sprint the second', 'Negative or even splitting', 'All-out from the start', 'It does not matter'], correctAnswer: 1, explanation: 'Even or negative splits produce better performances.' },
  ]),
  cq(1, 8, [
    { type: 'multiple_choice', question: 'How much performance improvement does a proper swimming taper produce?', options: ['2-3%', '0.5%', '10%', 'Tapers do not help'], correctAnswer: 0, explanation: '2-3% improvement from optimal tapering — often the margin of qualification.' },
    { type: 'multiple_choice', question: 'How much should volume drop during a swimming taper?', options: ['40-60%', '20%', '10%', '90%'], correctAnswer: 0, explanation: 'Volume reduces 40-60% while intensity and frequency are maintained.' },
    { type: 'multiple_choice', question: 'Why is maintaining pool sessions during taper important?', options: ['Volume is needed', 'Calorie burning', 'Water feel must be maintained — frequency should not drop dramatically', 'Coaches require it'], correctAnswer: 2, explanation: 'Feel for the water is a perishable skill that requires regular practice.' },
    { type: 'multiple_choice', question: 'How many peaks per year is standard in competitive swimming?', options: ['Peaks are not planned', 'Four', 'Two (double periodisation)', 'One'], correctAnswer: 2, explanation: 'Short-course and long-course seasons create two peak opportunities.' },
    { type: 'multiple_choice', question: 'What sleep duration is recommended for swimmers training 8-10x/week?', options: ['8-9 hours', '12 hours', '5-6 hours', '7 hours'], correctAnswer: 0, explanation: '8-9 hours supports recovery from high-frequency training.' },
  ]),
];
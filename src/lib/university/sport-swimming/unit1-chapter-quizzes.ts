import type { ChapterQuiz } from '../types';

function cq(unit: number, ch: number, questions: any[]): ChapterQuiz {
  return { unitNumber: unit, chapterNumber: ch, questionBank: questions, pickCount: 5, passMarkPercent: 80 };
}

export const sportSwimmingUnit1ChapterQuizzes: ChapterQuiz[] = [
  cq(1, 1, [
    { type: 'multiple_choice', question: 'How much denser is water than air?', options: ['10 times', '100 times', '800 times', '2000 times'], correctAnswer: 2, explanation: 'Water is approximately 800 times denser than air.' },
    { type: 'multiple_choice', question: 'What percentage of energy in a 200m swim is aerobic?', options: ['20%', '45%', '65%', '90%'], correctAnswer: 2, explanation: '200m events are approximately 65% aerobic.' },
    { type: 'multiple_choice', question: 'How many shoulder rotations do swimmers perform annually?', options: ['100,000', '500,000', '1-2 million', '5 million'], correctAnswer: 2, explanation: 'Swimmers perform 1-2 million shoulder rotations per year.' },
    { type: 'multiple_choice', question: 'What is Critical Swim Speed?', options: ['Maximum sprint speed', 'The swimming equivalent of lactate threshold', 'The speed of the water current', 'Average training pace'], correctAnswer: 1, explanation: 'CSS represents the sustainable threshold pace in swimming.' },
    { type: 'multiple_choice', question: 'Why do swimmers carry slightly more body fat than runners?', options: ['Poor diet', 'Extra body fat aids buoyancy and body position in water', 'Less training volume', 'It has no benefit'], correctAnswer: 1, explanation: 'Buoyancy from body fat improves horizontal body position.' },
  ]),
  cq(1, 2, [
    { type: 'multiple_choice', question: 'What is the most swim-specific strength exercise?', options: ['Bench press', 'Pull-ups — they mirror the catch and pull phases', 'Leg extension', 'Bicep curl'], correctAnswer: 1, explanation: 'Pull-ups directly simulate the primary propulsive movement in swimming.' },
    { type: 'multiple_choice', question: 'Why is core stability important for swimmers?', options: ['Appearance', 'It transfers upper-body force into forward propulsion', 'Core exercises are easy', 'Rules require it'], correctAnswer: 1, explanation: 'The core is the rigid platform through which pulling force becomes forward motion.' },
    { type: 'multiple_choice', question: 'What drives the fastest portions of a swim race?', options: ['Arm speed', 'Kick strength', 'Lower-body power for starts and turns', 'Breathing technique'], correctAnswer: 2, explanation: 'Starts and turns are the fastest race segments, powered by leg explosiveness.' },
    { type: 'multiple_choice', question: 'How many gym sessions per week in-season?', options: ['None', '2-3 sessions of 30-45 minutes', '5 sessions', '7 sessions'], correctAnswer: 1, explanation: '2-3 sessions keep the pool as priority.' },
    { type: 'multiple_choice', question: 'What should happen if gym work impairs stroke technique?', options: ['Train harder', 'Reduce gym load immediately', 'Add more pool time to compensate', 'Ignore it'], correctAnswer: 1, explanation: 'If technique deteriorates, gym load is too high.' },
  ]),
  cq(1, 3, [
    { type: 'multiple_choice', question: 'What has greater impact on swim speed?', options: ['Increasing propulsion', 'Reducing drag', 'Swimming harder', 'Bigger muscles'], correctAnswer: 1, explanation: 'Drag reduction has greater impact than propulsion increase.' },
    { type: 'multiple_choice', question: 'What is the Early Vertical Forearm (EVF)?', options: ['A stretching technique', 'Maintaining a high elbow and vertical forearm during the catch to maximise propulsion', 'A type of start', 'A breathing technique'], correctAnswer: 1, explanation: 'EVF maximises the surface area pushing water backward.' },
    { type: 'multiple_choice', question: 'What percentage of a short-course race can turns and underwater account for?', options: ['5-10%', '15-20%', '25-40%', '50%+'], correctAnswer: 2, explanation: 'Turns and underwater phases are 25-40% of short-course races.' },
    { type: 'multiple_choice', question: 'What is the biggest technique fix for age-group swimmers?', options: ['Faster arm turnover', 'Fixing the dropped elbow during the catch', 'Kicking harder', 'Breathing less'], correctAnswer: 1, explanation: 'Dropping the elbow during the catch is the most common technique error.' },
    { type: 'multiple_choice', question: 'Why does sprint training need full recovery?', options: ['Swimmers get tired', 'To maintain technique at maximum speed — form breakdown means too much fatigue', 'Rules require it', 'Recovery is not needed'], correctAnswer: 1, explanation: 'Full recovery preserves technical quality during maximal efforts.' },
  ]),
  cq(1, 4, [
    { type: 'multiple_choice', question: 'What advantage does pool conditioning have over dry-land?', options: ['It is easier', 'It simultaneously trains technique and feel for the water', 'It burns more calories', 'There is no advantage'], correctAnswer: 1, explanation: 'Pool conditioning integrates fitness and technical development.' },
    { type: 'multiple_choice', question: 'What pace should aerobic base sets use?', options: ['Maximum sprint', 'At or below CSS pace', 'All-out effort', 'Walking pace'], correctAnswer: 1, explanation: 'CSS pace corresponds to the aerobic threshold.' },
    { type: 'multiple_choice', question: 'How much does the kick contribute to freestyle propulsion?', options: ['Less than 1%', '5%', '10-15%', '50%'], correctAnswer: 2, explanation: 'The kick contributes 10-15% of freestyle propulsion.' },
    { type: 'multiple_choice', question: 'How often should VO2max sets be performed?', options: ['Every session', '1-2 per week', 'Once per month', 'Never'], correctAnswer: 1, explanation: 'VO2max sets are demanding and should be limited to 1-2 weekly.' },
    { type: 'multiple_choice', question: 'What rest is needed for sprint training (12.5-25m max effort)?', options: ['10 seconds', '30 seconds', '2-3 minutes', 'No rest'], correctAnswer: 2, explanation: 'Long rest ensures maximal quality for each sprint repetition.' },
  ]),
  cq(1, 5, [
    { type: 'multiple_choice', question: 'What percentage of competitive swimmers experience shoulder problems?', options: ['10-20%', '25-35%', '40-90%', 'Less than 5%'], correctAnswer: 2, explanation: 'Swimmer\'s shoulder affects 40-90% of competitors.' },
    { type: 'multiple_choice', question: 'What strength ratio protects the swimmer\'s shoulder?', options: ['1:1 push to pull', '2:1 external to internal rotation', '3:1 internal to external rotation', 'Ratios do not matter'], correctAnswer: 1, explanation: '2:1 external-to-internal rotation maintains shoulder balance.' },
    { type: 'multiple_choice', question: 'What percentage of breaststroke specialists experience knee pain?', options: ['10%', '25%', 'Up to 75%', 'Less than 5%'], correctAnswer: 2, explanation: 'Breaststroke knee affects up to 75% of specialists.' },
    { type: 'multiple_choice', question: 'What protects the spine from butterfly and breaststroke demands?', options: ['More swimming', 'Core anti-extension exercises like dead bugs and ab wheel', 'Back extensions', 'Stretching only'], correctAnswer: 1, explanation: 'Anti-extension core work protects against repetitive hyperextension.' },
    { type: 'multiple_choice', question: 'How long does an effective pre-swim prehab routine take?', options: ['30 seconds', '5 minutes', '30 minutes', '1 hour'], correctAnswer: 1, explanation: 'Five minutes of targeted shoulder and core work reduces injury risk significantly.' },
  ]),
  cq(1, 6, [
    { type: 'multiple_choice', question: 'What daily calorie intake may male competitive swimmers need?', options: ['2,000-2,500', '3,000-3,500', '4,000-6,000+', '8,000+'], correctAnswer: 2, explanation: 'Male swimmers may need 4,000-6,000+ kcal during heavy training.' },
    { type: 'multiple_choice', question: 'What carbohydrate intake should swimmers target daily?', options: ['2-3g/kg', '4-5g/kg', '6-10g/kg', '15g/kg'], correctAnswer: 2, explanation: '6-10g/kg/day supports the glycogen demands of high-volume training.' },
    { type: 'multiple_choice', question: 'Why is dehydration a concern in swimming?', options: ['It is not a concern', 'Swimmers lose fluid through sweat, breathing, and diuretic effects despite being in water', 'Water enters through the skin', 'Chlorine prevents dehydration'], correctAnswer: 1, explanation: 'Fluid loss occurs through multiple mechanisms even in the pool.' },
    { type: 'multiple_choice', question: 'What should post-training nutrition include?', options: ['Just water', '20-30g protein + 1g/kg carbs within 30 minutes', 'Only protein', 'Nothing for 2 hours'], correctAnswer: 1, explanation: 'Combined protein and carbohydrate within 30 minutes maximises recovery.' },
    { type: 'multiple_choice', question: 'Why does cold water swimming increase appetite?', options: ['Psychological effect', 'The body burns extra calories maintaining core temperature through thermoregulation', 'Water suppresses satiety', 'It does not increase appetite'], correctAnswer: 1, explanation: 'Thermoregulation in cold water increases energy expenditure.' },
  ]),
  cq(1, 7, [
    { type: 'multiple_choice', question: 'What is the most common race management error in swimming?', options: ['Starting too slow', 'Starting too fast and fading', 'Breathing too much', 'Not warming up'], correctAnswer: 1, explanation: 'Front-loaded races fade dramatically — even or negative splitting is better.' },
    { type: 'multiple_choice', question: 'What are process goals during racing?', options: ['Thinking about winning', 'Focusing on controllable technique cues like high elbow catch', 'Watching competitors', 'Checking the clock constantly'], correctAnswer: 1, explanation: 'Process goals keep focus on controllable actions.' },
    { type: 'multiple_choice', question: 'Why is a consistent pre-race routine important?', options: ['Coaches require it', 'Familiarity creates comfort in unfamiliar competition environments', 'It wastes time', 'It has no benefit'], correctAnswer: 1, explanation: 'Routine familiarity reduces anxiety in new settings.' },
    { type: 'multiple_choice', question: 'How should training motivation be maintained in swimming?', options: ['Just swim more', 'Set specific technical goals for each session and connect to long-term aims', 'Train alone', 'Only think about race day'], correctAnswer: 1, explanation: 'Session-specific goals and long-term connection maintain engagement.' },
    { type: 'multiple_choice', question: 'What pacing strategy works best for events 200m and above?', options: ['All-out from the start', 'Negative or even splitting', 'Cruise the first half, sprint the second', 'It does not matter'], correctAnswer: 1, explanation: 'Even or negative splits produce better performances.' },
  ]),
  cq(1, 8, [
    { type: 'multiple_choice', question: 'How much performance improvement does a proper swimming taper produce?', options: ['0.5%', '2-3%', '10%', 'Tapers do not help'], correctAnswer: 1, explanation: '2-3% improvement from optimal tapering — often the margin of qualification.' },
    { type: 'multiple_choice', question: 'How much should volume drop during a swimming taper?', options: ['10%', '20%', '40-60%', '90%'], correctAnswer: 2, explanation: 'Volume reduces 40-60% while intensity and frequency are maintained.' },
    { type: 'multiple_choice', question: 'Why is maintaining pool sessions during taper important?', options: ['Volume is needed', 'Water feel must be maintained — frequency should not drop dramatically', 'Coaches require it', 'Calorie burning'], correctAnswer: 1, explanation: 'Feel for the water is a perishable skill that requires regular practice.' },
    { type: 'multiple_choice', question: 'How many peaks per year is standard in competitive swimming?', options: ['One', 'Two (double periodisation)', 'Four', 'Peaks are not planned'], correctAnswer: 1, explanation: 'Short-course and long-course seasons create two peak opportunities.' },
    { type: 'multiple_choice', question: 'What sleep duration is recommended for swimmers training 8-10x/week?', options: ['5-6 hours', '7 hours', '8-9 hours', '12 hours'], correctAnswer: 2, explanation: '8-9 hours supports recovery from high-frequency training.' },
  ]),
];
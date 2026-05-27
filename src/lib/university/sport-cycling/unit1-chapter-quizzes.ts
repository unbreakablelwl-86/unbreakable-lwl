import type { ChapterQuiz } from '../types';

function cq(unit: number, ch: number, questions: any[]): ChapterQuiz {
  return { unitNumber: unit, chapterNumber: ch, questionBank: questions, pickCount: 5, passMarkPercent: 80 };
}

export const sportCyclingUnit1ChapterQuizzes: ChapterQuiz[] = [
  cq(1, 1, [
    { type: 'multiple_choice', question: 'What peak power do track sprinters produce?', options: ['5,000W+', '1,000-1,500W', '500-800W', '2,000-2,400W'], correctAnswer: 3, explanation: 'Track sprinters produce 2,000-2,400 watts peak.' },
    { type: 'multiple_choice', question: 'What VO2max do professional road cyclists typically have?', options: ['60-70 mL/kg/min', '50-60 mL/kg/min', '70-85 mL/kg/min', '90+ mL/kg/min'], correctAnswer: 2, explanation: 'Professional road cyclists achieve 70-85 mL/kg/min.' },
    { type: 'multiple_choice', question: 'What is FTP?', options: ['Fast Track Power', 'The highest power sustainable for approximately 60 minutes', 'Finishing Time Prediction', 'First Training Phase'], correctAnswer: 1, explanation: 'FTP represents the highest sustainable 60-minute power output.' },
    { type: 'multiple_choice', question: 'Why is cycling ideal for high-volume training?', options: ['It is easy', 'It requires no equipment', 'It trains all muscles', 'It is non-impact and body-weight-supported, reducing injury risk'], correctAnswer: 3, explanation: 'Non-impact nature allows high training volumes with reduced injury.' },
    { type: 'multiple_choice', question: 'What is the fundamental cycling performance metric?', options: ['Heart rate', 'Power-to-weight ratio (W/kg)', 'Speed alone', 'Cadence'], correctAnswer: 1, explanation: 'W/kg determines climbing, time-trialling, and sprinting ability.' },
  ]),
  cq(1, 2, [
    { type: 'multiple_choice', question: 'By how much does strength training improve cycling?', options: ['0.5%', '2-8%', 'No improvement', '15-20%'], correctAnswer: 1, explanation: 'Research shows 2-8% improvement from heavy resistance training.' },
    { type: 'multiple_choice', question: 'What is the foundational strength exercise for cyclists?', options: ['Leg extension', 'Hamstring curl', 'Calf raise', 'Squat'], correctAnswer: 3, explanation: 'The squat develops the primary pedalling muscles.' },
    { type: 'multiple_choice', question: 'Why is core strength important for cycling?', options: ['It provides the stable platform for power transfer and prevents lower back pain', 'Appearance', 'It helps with handling only', 'Core is not important for cycling'], correctAnswer: 0, explanation: 'The core links upper body stability to lower body power output.' },
    { type: 'multiple_choice', question: "Why doesn\'t strength training cause unwanted bulk in cyclists?", options: ['It does cause bulk', 'Endurance training volume prevents significant hypertrophy', "Cyclists don\'t eat enough", 'They use light weights only'], correctAnswer: 1, explanation: 'Concurrent endurance training limits muscle growth.' },
    { type: 'multiple_choice', question: 'When should heavy legs be avoided relative to key rides?', options: ['Within 1 week', 'Only on race day', 'Within 48 hours of key rides or races', 'No restriction'], correctAnswer: 2, explanation: '48 hours prevents residual fatigue from affecting important sessions.' },
  ]),
  cq(1, 3, [
    { type: 'multiple_choice', question: 'What percentage of training should be Zone 2?', options: ['75-80%', '30-40%', '50-60%', '100%'], correctAnswer: 0, explanation: 'Zone 2 should constitute 75-80% of total volume.' },
    { type: 'multiple_choice', question: 'What is FTP?', options: ['Finishing Time Power', 'First Threshold Pace', 'Fastest Training Performance', 'The highest power output sustainable for ~60 minutes'], correctAnswer: 3, explanation: 'FTP is the highest power sustainable for approximately one hour.' },
    { type: 'multiple_choice', question: 'What is sweet spot training?', options: ['Training at 88-93% FTP for high stress with manageable recovery', 'Very easy riding', 'Zone 1 recovery', 'Maximum sprint efforts'], correctAnswer: 0, explanation: 'Sweet spot allows high training stress without excessive recovery cost.' },
    { type: 'multiple_choice', question: 'How often should VO2max intervals be performed?', options: ['Once per month', 'Never', '1-2 per week when fresh', 'Daily'], correctAnswer: 2, explanation: 'VO2max intervals are demanding and should be limited to 1-2 weekly.' },
    { type: 'multiple_choice', question: 'What mistake do recreational cyclists commonly make?', options: ['Riding too far', 'Riding too hard on easy days and too easy on hard days', 'Not enough intervals', 'Riding too slow'], correctAnswer: 1, explanation: 'Moderate-intensity on every ride limits development of both base and top-end.' },
  ]),
  cq(1, 4, [
    { type: 'multiple_choice', question: 'Why are sprint and anaerobic power important in cycling?', options: ['Decisive race moments (sprints, attacks, gaps) are almost always anaerobic', 'Only for track cyclists', 'They are not important', 'Tradition'], correctAnswer: 0, explanation: 'Race outcomes are determined in short, explosive efforts.' },
    { type: 'multiple_choice', question: 'How should neuromuscular sprints be trained?', options: ['Continuous high cadence', '6-8x 10s all-out from rolling start with 5min full recovery', '30-minute efforts', 'Sprint only in races'], correctAnswer: 1, explanation: 'Short maximal sprints with full recovery develop peak power.' },
    { type: 'multiple_choice', question: 'What does high-cadence work develop?', options: ['Endurance', 'The neural coordination to spin at race-winning speeds', 'Core strength', 'Flexibility'], correctAnswer: 1, explanation: 'High RPM training develops sprint-specific neural patterns.' },
    { type: 'multiple_choice', question: 'Why is tactical sprint training important?', options: ['It is not important', 'It burns more calories', 'Physical sprint ability is wasted without knowledge of when and how to use it', 'Coaches require it'], correctAnswer: 2, explanation: 'Sprint training must simulate race scenarios for practical application.' },
    { type: 'multiple_choice', question: 'What is anaerobic capacity in cycling context?', options: ['Maximum speed', 'The ability to sustain above-threshold efforts for 30s-3min', 'Recovery speed', 'Total distance capacity'], correctAnswer: 1, explanation: '30s-3min above-threshold efforts determine attack and breakaway ability.' },
  ]),
  cq(1, 5, [
    { type: 'multiple_choice', question: 'What percentage of recreational cyclists experience knee pain?', options: ['40-60%', '20-30%', '10-15%', 'Less than 5%'], correctAnswer: 0, explanation: 'Knee pain affects 40-60% of recreational cyclists.' },
    { type: 'multiple_choice', question: 'What is the best investment for cycling injury prevention?', options: ['New shoes', 'Expensive bike', 'A professional bike fit', 'More training'], correctAnswer: 2, explanation: 'Proper bike fit addresses the most common causes of cycling injuries.' },
    { type: 'multiple_choice', question: 'What causes most cycling knee pain?', options: ['Cold weather', 'Using clipless pedals', 'Riding too far', 'Improper saddle height, position, and cleat alignment'], correctAnswer: 3, explanation: 'Bike fit issues are the primary cause of cycling knee pain.' },
    { type: 'multiple_choice', question: 'How often should cyclists stand during rides?', options: ['Never', 'Every 5 minutes', 'Only on hills', 'Every 15-20 minutes for position changes'], correctAnswer: 3, explanation: 'Regular standing prevents sustained lower back stress.' },
    { type: 'multiple_choice', question: 'What daily mobility areas should cyclists target?', options: ['No mobility needed', 'Hip flexors, hamstrings, and thoracic spine', 'Ankles only', 'Only hamstrings'], correctAnswer: 1, explanation: 'These areas tighten most from the cycling position.' },
  ]),
  cq(1, 6, [
    { type: 'multiple_choice', question: 'How many calories can a Grand Tour stage burn?', options: ['10,000+', '2,000-3,000', '4,000-8,000', '1,000-2,000'], correctAnswer: 2, explanation: 'Professional stages can burn 4,000-8,000 kcal.' },
    { type: 'multiple_choice', question: 'How much carbohydrate per hour for rides over 90 minutes?', options: ['200g+', '40-50g', '60-90g', '20-30g'], correctAnswer: 2, explanation: '60-90g per hour with trained gut tolerance.' },
    { type: 'multiple_choice', question: 'When should eating begin on long rides?', options: ['Within the first 30 minutes', 'When hungry', 'Only at aid stations', 'After 2 hours'], correctAnswer: 0, explanation: 'Early fuelling prevents the onset of glycogen depletion.' },
    { type: 'multiple_choice', question: 'What is the most effective legal performance enhancer for cycling?', options: ['Beet juice', 'BCAAs', 'Caffeine (3-6mg/kg)', 'Creatine'], correctAnswer: 2, explanation: 'Caffeine improves power, reduces perceived exertion, and delays fatigue.' },
    { type: 'multiple_choice', question: 'When should weight loss be pursued?', options: ['During base training phases, gradually, never restricting on training days', 'During competition periods', 'Never', 'Only before big races'], correctAnswer: 0, explanation: 'Gradual loss during base phases protects performance and health.' },
  ]),
  cq(1, 7, [
    { type: 'multiple_choice', question: 'Why is going too hard early catastrophic in cycling?', options: ['Equipment breaks down', 'You can crack and lose 30% of power output — far worse than just slowing down', 'It only affects beginners', 'It is not a problem'], correctAnswer: 1, explanation: 'Cycling bonking is more severe than simply slowing pace.' },
    { type: 'multiple_choice', question: 'What is internal calibration in cycling?', options: ['Bike computer calibration', 'The ability to sense effort level accurately and adjust pace', 'Cadence matching', 'Heart rate monitor setup'], correctAnswer: 1, explanation: 'Learning to ride by feel through training with data tools.' },
    { type: 'multiple_choice', question: 'What is poker-faced riding?', options: ['A card game on bikes', 'Appearing fresh when suffering to conceal vulnerability from competitors', 'Riding with sunglasses', 'Not talking during rides'], correctAnswer: 1, explanation: 'Concealing fatigue is a tactical race skill.' },
    { type: 'multiple_choice', question: 'How should time trials be mentally approached?', options: ['Think about the finish from the start', 'Do not think at all', 'Focus on competitors', 'Break into segments, use technique cues, accept discomfort'], correctAnswer: 3, explanation: 'Segmenting and acceptance strategies manage sustained-effort psychology.' },
    { type: 'multiple_choice', question: 'What should training logs track besides physical data?', options: ['Weather conditions', 'Diet only', 'Nothing else', 'Mood, motivation, and enjoyment to identify psychological patterns'], correctAnswer: 3, explanation: 'Psychological state tracking identifies motivation patterns.' },
  ]),
  cq(1, 8, [
    { type: 'multiple_choice', question: 'What TSB range indicates readiness for peak performance?', options: ['-20 to -10', '0', '+50', '+10 to +25'], correctAnswer: 3, explanation: 'TSB of +10 to +25 indicates fresh and fit.' },
    { type: 'multiple_choice', question: 'What should the off-season focus on?', options: ['Complete rest with no activity', 'Recovery, gym work, cross-training, and addressing weaknesses', 'Racing every weekend', 'Maximum cycling volume'], correctAnswer: 1, explanation: 'Off-season addresses weaknesses and provides recovery.' },
    { type: 'multiple_choice', question: 'How should base phase volume increase?', options: ['All at once', '10% per week with recovery every 4th week', 'No increase needed', '50% per week'], correctAnswer: 1, explanation: 'Progressive 10% increases with recovery weeks prevent overtraining.' },
    { type: 'multiple_choice', question: 'When should bike fit changes be made?', options: ['Never change fit', 'During the off-season', 'During races', 'Mid-season'], correctAnswer: 1, explanation: 'Off-season allows adaptation to fit changes before racing.' },
    { type: 'multiple_choice', question: 'What replaces sweet spot in the build phase?', options: ['More Zone 2', 'Sprinting only', 'Threshold and VO2max work', 'Recovery rides'], correctAnswer: 2, explanation: 'Higher-intensity work replaces moderate sweet spot during build.' },
  ]),
];
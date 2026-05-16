import type { ChapterQuiz } from '../types';

function cq(unit: number, ch: number, questions: any[]): ChapterQuiz {
  return { unitNumber: unit, chapterNumber: ch, questionBank: questions, pickCount: 5, passMarkPercent: 80 };
}

export const sportCyclingUnit1ChapterQuizzes: ChapterQuiz[] = [
  cq(1, 1, [
    { type: 'multiple_choice', question: 'What peak power do track sprinters produce?', options: ['500-800W', '1,000-1,500W', '2,000-2,400W', '5,000W+'], correctAnswer: 2, explanation: 'Track sprinters produce 2,000-2,400 watts peak.' },
    { type: 'multiple_choice', question: 'What VO2max do professional road cyclists typically have?', options: ['50-60 mL/kg/min', '60-70 mL/kg/min', '70-85 mL/kg/min', '90+ mL/kg/min'], correctAnswer: 2, explanation: 'Professional road cyclists achieve 70-85 mL/kg/min.' },
    { type: 'multiple_choice', question: 'What is FTP?', options: ['First Training Phase', 'The highest power sustainable for approximately 60 minutes', 'Fast Track Power', 'Finishing Time Prediction'], correctAnswer: 1, explanation: 'FTP represents the highest sustainable 60-minute power output.' },
    { type: 'multiple_choice', question: 'Why is cycling ideal for high-volume training?', options: ['It is easy', 'It is non-impact and body-weight-supported, reducing injury risk', 'It requires no equipment', 'It trains all muscles'], correctAnswer: 1, explanation: 'Non-impact nature allows high training volumes with reduced injury.' },
    { type: 'multiple_choice', question: 'What is the fundamental cycling performance metric?', options: ['Heart rate', 'Cadence', 'Power-to-weight ratio (W/kg)', 'Speed alone'], correctAnswer: 2, explanation: 'W/kg determines climbing, time-trialling, and sprinting ability.' },
  ]),
  cq(1, 2, [
    { type: 'multiple_choice', question: 'By how much does strength training improve cycling?', options: ['0.5%', '2-8%', '15-20%', 'No improvement'], correctAnswer: 1, explanation: 'Research shows 2-8% improvement from heavy resistance training.' },
    { type: 'multiple_choice', question: 'What is the foundational strength exercise for cyclists?', options: ['Leg extension', 'Squat', 'Calf raise', 'Hamstring curl'], correctAnswer: 1, explanation: 'The squat develops the primary pedalling muscles.' },
    { type: 'multiple_choice', question: 'Why is core strength important for cycling?', options: ['Appearance', 'It provides the stable platform for power transfer and prevents lower back pain', 'Core is not important for cycling', 'It helps with handling only'], correctAnswer: 1, explanation: 'The core links upper body stability to lower body power output.' },
    { type: 'multiple_choice', question: 'Why doesn\'t strength training cause unwanted bulk in cyclists?', options: ['It does cause bulk', 'Endurance training volume prevents significant hypertrophy', 'Cyclists don\'t eat enough', 'They use light weights only'], correctAnswer: 1, explanation: 'Concurrent endurance training limits muscle growth.' },
    { type: 'multiple_choice', question: 'When should heavy legs be avoided relative to key rides?', options: ['No restriction', 'Within 48 hours of key rides or races', 'Only on race day', 'Within 1 week'], correctAnswer: 1, explanation: '48 hours prevents residual fatigue from affecting important sessions.' },
  ]),
  cq(1, 3, [
    { type: 'multiple_choice', question: 'What percentage of training should be Zone 2?', options: ['30-40%', '50-60%', '75-80%', '100%'], correctAnswer: 2, explanation: 'Zone 2 should constitute 75-80% of total volume.' },
    { type: 'multiple_choice', question: 'What is FTP?', options: ['Fastest Training Performance', 'The highest power output sustainable for ~60 minutes', 'First Threshold Pace', 'Finishing Time Power'], correctAnswer: 1, explanation: 'FTP is the highest power sustainable for approximately one hour.' },
    { type: 'multiple_choice', question: 'What is sweet spot training?', options: ['Very easy riding', 'Training at 88-93% FTP for high stress with manageable recovery', 'Maximum sprint efforts', 'Zone 1 recovery'], correctAnswer: 1, explanation: 'Sweet spot allows high training stress without excessive recovery cost.' },
    { type: 'multiple_choice', question: 'How often should VO2max intervals be performed?', options: ['Daily', '1-2 per week when fresh', 'Once per month', 'Never'], correctAnswer: 1, explanation: 'VO2max intervals are demanding and should be limited to 1-2 weekly.' },
    { type: 'multiple_choice', question: 'What mistake do recreational cyclists commonly make?', options: ['Riding too slow', 'Riding too hard on easy days and too easy on hard days', 'Riding too far', 'Not enough intervals'], correctAnswer: 1, explanation: 'Moderate-intensity on every ride limits development of both base and top-end.' },
  ]),
  cq(1, 4, [
    { type: 'multiple_choice', question: 'Why are sprint and anaerobic power important in cycling?', options: ['They are not important', 'Decisive race moments (sprints, attacks, gaps) are almost always anaerobic', 'Only for track cyclists', 'Tradition'], correctAnswer: 1, explanation: 'Race outcomes are determined in short, explosive efforts.' },
    { type: 'multiple_choice', question: 'How should neuromuscular sprints be trained?', options: ['30-minute efforts', '6-8x 10s all-out from rolling start with 5min full recovery', 'Continuous high cadence', 'Sprint only in races'], correctAnswer: 1, explanation: 'Short maximal sprints with full recovery develop peak power.' },
    { type: 'multiple_choice', question: 'What does high-cadence work develop?', options: ['Endurance', 'The neural coordination to spin at race-winning speeds', 'Flexibility', 'Core strength'], correctAnswer: 1, explanation: 'High RPM training develops sprint-specific neural patterns.' },
    { type: 'multiple_choice', question: 'Why is tactical sprint training important?', options: ['Physical sprint ability is wasted without knowledge of when and how to use it', 'It is not important', 'Coaches require it', 'It burns more calories'], correctAnswer: 0, explanation: 'Sprint training must simulate race scenarios for practical application.' },
    { type: 'multiple_choice', question: 'What is anaerobic capacity in cycling context?', options: ['Maximum speed', 'The ability to sustain above-threshold efforts for 30s-3min', 'Total distance capacity', 'Recovery speed'], correctAnswer: 1, explanation: '30s-3min above-threshold efforts determine attack and breakaway ability.' },
  ]),
  cq(1, 5, [
    { type: 'multiple_choice', question: 'What percentage of recreational cyclists experience knee pain?', options: ['10-15%', '20-30%', '40-60%', 'Less than 5%'], correctAnswer: 2, explanation: 'Knee pain affects 40-60% of recreational cyclists.' },
    { type: 'multiple_choice', question: 'What is the best investment for cycling injury prevention?', options: ['Expensive bike', 'A professional bike fit', 'New shoes', 'More training'], correctAnswer: 1, explanation: 'Proper bike fit addresses the most common causes of cycling injuries.' },
    { type: 'multiple_choice', question: 'What causes most cycling knee pain?', options: ['Riding too far', 'Improper saddle height, position, and cleat alignment', 'Cold weather', 'Using clipless pedals'], correctAnswer: 1, explanation: 'Bike fit issues are the primary cause of cycling knee pain.' },
    { type: 'multiple_choice', question: 'How often should cyclists stand during rides?', options: ['Never', 'Every 15-20 minutes for position changes', 'Only on hills', 'Every 5 minutes'], correctAnswer: 1, explanation: 'Regular standing prevents sustained lower back stress.' },
    { type: 'multiple_choice', question: 'What daily mobility areas should cyclists target?', options: ['Only hamstrings', 'Hip flexors, hamstrings, and thoracic spine', 'Ankles only', 'No mobility needed'], correctAnswer: 1, explanation: 'These areas tighten most from the cycling position.' },
  ]),
  cq(1, 6, [
    { type: 'multiple_choice', question: 'How many calories can a Grand Tour stage burn?', options: ['1,000-2,000', '2,000-3,000', '4,000-8,000', '10,000+'], correctAnswer: 2, explanation: 'Professional stages can burn 4,000-8,000 kcal.' },
    { type: 'multiple_choice', question: 'How much carbohydrate per hour for rides over 90 minutes?', options: ['20-30g', '40-50g', '60-90g', '200g+'], correctAnswer: 2, explanation: '60-90g per hour with trained gut tolerance.' },
    { type: 'multiple_choice', question: 'When should eating begin on long rides?', options: ['When hungry', 'Within the first 30 minutes', 'After 2 hours', 'Only at aid stations'], correctAnswer: 1, explanation: 'Early fuelling prevents the onset of glycogen depletion.' },
    { type: 'multiple_choice', question: 'What is the most effective legal performance enhancer for cycling?', options: ['Creatine', 'Caffeine (3-6mg/kg)', 'BCAAs', 'Beet juice'], correctAnswer: 1, explanation: 'Caffeine improves power, reduces perceived exertion, and delays fatigue.' },
    { type: 'multiple_choice', question: 'When should weight loss be pursued?', options: ['During competition periods', 'During base training phases, gradually, never restricting on training days', 'Never', 'Only before big races'], correctAnswer: 1, explanation: 'Gradual loss during base phases protects performance and health.' },
  ]),
  cq(1, 7, [
    { type: 'multiple_choice', question: 'Why is going too hard early catastrophic in cycling?', options: ['It is not a problem', 'You can crack and lose 30% of power output — far worse than just slowing down', 'It only affects beginners', 'Equipment breaks down'], correctAnswer: 1, explanation: 'Cycling bonking is more severe than simply slowing pace.' },
    { type: 'multiple_choice', question: 'What is internal calibration in cycling?', options: ['Bike computer calibration', 'The ability to sense effort level accurately and adjust pace', 'Heart rate monitor setup', 'Cadence matching'], correctAnswer: 1, explanation: 'Learning to ride by feel through training with data tools.' },
    { type: 'multiple_choice', question: 'What is poker-faced riding?', options: ['A card game on bikes', 'Appearing fresh when suffering to conceal vulnerability from competitors', 'Riding with sunglasses', 'Not talking during rides'], correctAnswer: 1, explanation: 'Concealing fatigue is a tactical race skill.' },
    { type: 'multiple_choice', question: 'How should time trials be mentally approached?', options: ['Think about the finish from the start', 'Break into segments, use technique cues, accept discomfort', 'Do not think at all', 'Focus on competitors'], correctAnswer: 1, explanation: 'Segmenting and acceptance strategies manage sustained-effort psychology.' },
    { type: 'multiple_choice', question: 'What should training logs track besides physical data?', options: ['Nothing else', 'Mood, motivation, and enjoyment to identify psychological patterns', 'Diet only', 'Weather conditions'], correctAnswer: 1, explanation: 'Psychological state tracking identifies motivation patterns.' },
  ]),
  cq(1, 8, [
    { type: 'multiple_choice', question: 'What TSB range indicates readiness for peak performance?', options: ['-20 to -10', '0', '+10 to +25', '+50'], correctAnswer: 2, explanation: 'TSB of +10 to +25 indicates fresh and fit.' },
    { type: 'multiple_choice', question: 'What should the off-season focus on?', options: ['Maximum cycling volume', 'Recovery, gym work, cross-training, and addressing weaknesses', 'Complete rest with no activity', 'Racing every weekend'], correctAnswer: 1, explanation: 'Off-season addresses weaknesses and provides recovery.' },
    { type: 'multiple_choice', question: 'How should base phase volume increase?', options: ['All at once', '10% per week with recovery every 4th week', '50% per week', 'No increase needed'], correctAnswer: 1, explanation: 'Progressive 10% increases with recovery weeks prevent overtraining.' },
    { type: 'multiple_choice', question: 'When should bike fit changes be made?', options: ['Mid-season', 'During the off-season', 'During races', 'Never change fit'], correctAnswer: 1, explanation: 'Off-season allows adaptation to fit changes before racing.' },
    { type: 'multiple_choice', question: 'What replaces sweet spot in the build phase?', options: ['More Zone 2', 'Threshold and VO2max work', 'Recovery rides', 'Sprinting only'], correctAnswer: 1, explanation: 'Higher-intensity work replaces moderate sweet spot during build.' },
  ]),
];
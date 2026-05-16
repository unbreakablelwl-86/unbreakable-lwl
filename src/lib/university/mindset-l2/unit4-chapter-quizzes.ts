import type { ChapterQuiz } from '../types';

function cq(unit: number, ch: number, questions: any[]): ChapterQuiz {
  return { unitNumber: unit, chapterNumber: ch, questionBank: questions, pickCount: 5, passMarkPercent: 80 }

export const mindsetL2Unit4ChapterQuizzes: ChapterQuiz[] = [
  cq(4, 1, [
    { type: 'multiple_choice', question: 'What is the most important quality of a morning routine?', options: ['Length', 'Start time', 'Consistency', 'Complexity'], correctAnswer: 2, explanation: 'A consistent short routine beats an ambitious one that is abandoned.' },
    { type: 'multiple_choice', question: 'Why avoid checking your phone first thing?', options: ['Screens are bad', 'It is impolite', 'Battery conservation', 'It puts you in reactive mode'], correctAnswer: 3, explanation: 'Checking your phone immediately floods you with external demands and reactive thinking.' },
    { type: 'multiple_choice', question: 'How much water should you drink upon waking?', options: ['500ml', '2 litres', 'None', 'A sip'], correctAnswer: 0, explanation: 'You wake mildly dehydrated — 500ml rehydrates and supports alertness.' },
    { type: 'multiple_choice', question: 'What is the recommended starting duration for a morning routine?', options: ['10–15 minutes', '5 seconds', '2 hours', '90 minutes'], correctAnswer: 0, explanation: 'Start with 10–15 minutes and build as the habit solidifies.' },
    { type: 'multiple_choice', question: 'What is the core principle of morning routine design?', options: [', ', ', ', ', ', 'Copy someone else\'], correctAnswer: 0, explanation: 'A sustainable short routine done daily transforms life; an ambitious one abandoned does not.' },
  ]),
  cq(4, 2, [
    { type: 'multiple_choice', question: 'What is stress inoculation training based on?', options: ['Avoiding stress', 'Maximum stress exposure', 'Medication', 'Controlled exposure to manageable stress builds resilience'], correctAnswer: 3, explanation: 'Like a vaccine, SIT uses controlled exposure to build capacity for handling larger stressors.' },
    { type: 'multiple_choice', question: 'What is the key difference between SIT and uncontrolled stress?', options: ['No difference', 'SIT only works for soldiers', 'SIT is harder', 'SIT is chosen and progressive with coping tools; uncontrolled stress overwhelms'], correctAnswer: 3, explanation: 'Controlled, chosen exposure with tools builds capacity; overwhelming stress causes harm.' },
    { type: 'multiple_choice', question: 'What is Phase 2 of SIT?', options: ['Education', 'Recovery', 'Application', 'Skill Acquisition — learning coping tools'], correctAnswer: 3, explanation: 'Phase 2 involves learning the tools (breathing, reappraisal, visualisation) before applying them.' },
    { type: 'multiple_choice', question: 'What does each successful stress exposure provide?', options: ['More stress', 'Physical strength', 'Evidence that you can handle hard things', 'Nothing'], correctAnswer: 2, explanation: 'Successful exposure builds experiential confidence that no theory can replicate.' },
    { type: 'multiple_choice', question: 'What is the enemy of growth in this context?', options: ['Other people', 'Challenge', 'Knowledge', 'Comfort'], correctAnswer: 3, explanation: 'Sustained comfort prevents the adaptive challenges needed for resilience growth.' },
  ]),
  cq(4, 3, [
    { type: 'multiple_choice', question: 'What is mindfulness?', options: ['Paying attention to the present moment without judgement', 'Clearing your mind', 'Thinking positive thoughts', 'Meditation only'], correctAnswer: 0, explanation: 'Mindfulness is present-moment awareness — not thought suppression or forced positivity.' },
    { type: 'multiple_choice', question: 'Where does most mental suffering come from?', options: ['Past rumination and future worry', 'Physical pain', 'The present', 'Other people'], correctAnswer: 0, explanation: 'Most suffering comes from dwelling on the past (regret) or worrying about the future (anxiety).' },
    { type: 'multiple_choice', question: 'What is the minimum effective daily mindfulness practice?', options: ['30 minutes', '3 minutes', '1 hour', '0 minutes — just think about it'], correctAnswer: 1, explanation: 'Even 3 minutes of consistent daily practice produces measurable benefits.' },
    { type: 'multiple_choice', question: 'When your mind wanders during meditation, what should you do?', options: ['Try harder to stop thoughts', 'Get frustrated', 'Give up', 'Notice it wandered and gently return to the breath'], correctAnswer: 3, explanation: 'Noticing and returning is the practice itself — each return strengthens the attention muscle.' },
    { type: 'multiple_choice', question: 'Can mindfulness be practised during daily activities?', options: ['No — only during formal meditation', 'Only in silence', 'Only during yoga', 'Yes — eating, walking, or commuting mindfully counts'], correctAnswer: 3, explanation: 'Informal mindfulness (eating, walking without distraction) is equally valuable practice.' },
  ]),
  cq(4, 4, [
    { type: 'multiple_choice', question: 'What is the minimum effective dose for a daily protocol?', options: ['2 hours', 'Whatever you can do consistently', '90 minutes', '30 seconds'], correctAnswer: 1, explanation: 'The minimum effective dose is the shortest practice you can maintain every single day.' },
    { type: 'multiple_choice', question: 'How often should you adjust your resilience protocol?', options: ['Daily', 'Never', 'Every hour', 'Monthly'], correctAnswer: 3, explanation: 'Monthly reviews allow assessment of what works while keeping the protocol evolving.' },
    { type: 'multiple_choice', question: 'What is the ultimate goal of resilience training?', options: ['Following a strict protocol forever', 'Integration — practices feel as natural as brushing your teeth', 'Becoming invincible', 'Eliminating all emotions'], correctAnswer: 1, explanation: 'The goal is for practices to become automatic parts of your identity, not forced routines.' },
    { type: 'multiple_choice', question: 'When should you progress to harder challenges?', options: ['Never', 'When the current level feels manageable and consistent', 'After reading more theory', 'Immediately'], correctAnswer: 1, explanation: 'Only progress when the current level is consistent — rushing leads to burnout.' },
    { type: 'multiple_choice', question: 'What matters more than the specific practices chosen?', options: ['How impressive they sound', 'The equipment used', 'How long each takes', 'Consistency of doing them'], correctAnswer: 3, explanation: 'Consistent small practices beat sporadic impressive ones — always.' },
  ]),
];

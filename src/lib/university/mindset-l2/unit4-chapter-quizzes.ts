import type { ChapterQuiz } from '../types';

function cq(unit: number, ch: number, questions: any[]): ChapterQuiz {
  return { unitNumber: unit, chapterNumber: ch, questionBank: questions, pickCount: 5, passMarkPercent: 80 }

export const mindsetL2Unit4ChapterQuizzes: ChapterQuiz[] = [
  cq(4, 1, [
    { type: 'multiple_choice', question: 'What is the most important quality of a morning routine?', options: ['Length', 'Start time', 'Complexity', 'Consistency'], correctAnswer: 3, explanation: 'A consistent short routine beats an ambitious one that is abandoned.' },
    { type: 'multiple_choice', question: 'Why avoid checking your phone first thing?', options: ['Screens are bad', 'It is impolite', 'It puts you in reactive mode', 'Battery conservation'], correctAnswer: 2, explanation: 'Checking your phone immediately floods you with external demands and reactive thinking.' },
    { type: 'multiple_choice', question: 'How much water should you drink upon waking?', options: ['2 litres', '500ml', 'None', 'A sip'], correctAnswer: 1, explanation: 'You wake mildly dehydrated — 500ml rehydrates and supports alertness.' },
    { type: 'multiple_choice', question: 'What is the recommended starting duration for a morning routine?', options: ['10–15 minutes', '5 seconds', '2 hours', '90 minutes'], correctAnswer: 0, explanation: 'Start with 10–15 minutes and build as the habit solidifies.' },
    { type: 'multiple_choice', question: 'What is the core principle of morning routine design?', options: ['Copy someone else\'s exactly', 'Complexity builds discipline', 'More is better', 'Sustainability over ambition'], correctAnswer: 3, explanation: 'A sustainable short routine done daily transforms life; an ambitious one abandoned does not.' },
  ]),
  cq(4, 2, [
    { type: 'multiple_choice', question: 'What is stress inoculation training based on?', options: ['Avoiding stress', 'Maximum stress exposure', 'Controlled exposure to manageable stress builds resilience', 'Medication'], correctAnswer: 2, explanation: 'Like a vaccine, SIT uses controlled exposure to build capacity for handling larger stressors.' },
    { type: 'multiple_choice', question: 'What is the key difference between SIT and uncontrolled stress?', options: ['No difference', 'SIT is chosen and progressive with coping tools; uncontrolled stress overwhelms', 'SIT is harder', 'SIT only works for soldiers'], correctAnswer: 1, explanation: 'Controlled, chosen exposure with tools builds capacity; overwhelming stress causes harm.' },
    { type: 'multiple_choice', question: 'What is Phase 2 of SIT?', options: ['Skill Acquisition — learning coping tools', 'Recovery', 'Application', 'Education'], correctAnswer: 0, explanation: 'Phase 2 involves learning the tools (breathing, reappraisal, visualisation) before applying them.' },
    { type: 'multiple_choice', question: 'What does each successful stress exposure provide?', options: ['More stress', 'Physical strength', 'Nothing', 'Evidence that you can handle hard things'], correctAnswer: 3, explanation: 'Successful exposure builds experiential confidence that no theory can replicate.' },
    { type: 'multiple_choice', question: 'What is the enemy of growth in this context?', options: ['Other people', 'Challenge', 'Comfort', 'Knowledge'], correctAnswer: 2, explanation: 'Sustained comfort prevents the adaptive challenges needed for resilience growth.' },
  ]),
  cq(4, 3, [
    { type: 'multiple_choice', question: 'What is mindfulness?', options: ['Clearing your mind', 'Paying attention to the present moment without judgement', 'Thinking positive thoughts', 'Meditation only'], correctAnswer: 1, explanation: 'Mindfulness is present-moment awareness — not thought suppression or forced positivity.' },
    { type: 'multiple_choice', question: 'Where does most mental suffering come from?', options: ['Past rumination and future worry', 'Physical pain', 'The present', 'Other people'], correctAnswer: 0, explanation: 'Most suffering comes from dwelling on the past (regret) or worrying about the future (anxiety).' },
    { type: 'multiple_choice', question: 'What is the minimum effective daily mindfulness practice?', options: ['30 minutes', '0 minutes — just think about it', '1 hour', '3 minutes'], correctAnswer: 3, explanation: 'Even 3 minutes of consistent daily practice produces measurable benefits.' },
    { type: 'multiple_choice', question: 'When your mind wanders during meditation, what should you do?', options: ['Try harder to stop thoughts', 'Get frustrated', 'Notice it wandered and gently return to the breath', 'Give up'], correctAnswer: 2, explanation: 'Noticing and returning is the practice itself — each return strengthens the attention muscle.' },
    { type: 'multiple_choice', question: 'Can mindfulness be practised during daily activities?', options: ['No — only during formal meditation', 'Yes — eating, walking, or commuting mindfully counts', 'Only during yoga', 'Only in silence'], correctAnswer: 1, explanation: 'Informal mindfulness (eating, walking without distraction) is equally valuable practice.' },
  ]),
  cq(4, 4, [
    { type: 'multiple_choice', question: 'What is the minimum effective dose for a daily protocol?', options: ['Whatever you can do consistently', '2 hours', '90 minutes', '30 seconds'], correctAnswer: 0, explanation: 'The minimum effective dose is the shortest practice you can maintain every single day.' },
    { type: 'multiple_choice', question: 'How often should you adjust your resilience protocol?', options: ['Daily', 'Never', 'Every hour', 'Monthly'], correctAnswer: 3, explanation: 'Monthly reviews allow assessment of what works while keeping the protocol evolving.' },
    { type: 'multiple_choice', question: 'What is the ultimate goal of resilience training?', options: ['Following a strict protocol forever', 'Becoming invincible', 'Integration — practices feel as natural as brushing your teeth', 'Eliminating all emotions'], correctAnswer: 2, explanation: 'The goal is for practices to become automatic parts of your identity, not forced routines.' },
    { type: 'multiple_choice', question: 'When should you progress to harder challenges?', options: ['Never', 'When the current level feels manageable and consistent', 'After reading more theory', 'Immediately'], correctAnswer: 1, explanation: 'Only progress when the current level is consistent — rushing leads to burnout.' },
    { type: 'multiple_choice', question: 'What matters more than the specific practices chosen?', options: ['Consistency of doing them', 'The equipment used', 'How long each takes', 'How impressive they sound'], correctAnswer: 0, explanation: 'Consistent small practices beat sporadic impressive ones — always.' },
  ]),
];

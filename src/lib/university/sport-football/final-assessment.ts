import type { UnitAssessment } from '../types';

export const sportFootballFinalAssessment: UnitAssessment = {
  unitNumber: 0,
  title: 'Football — Final Assessment',
  passMarkPercent: 80,
  pickCount: 15,
  questions: [
    { type: 'multiple_choice', question: 'What is the typical high-speed running distance in a professional football match?', options: ['2,000-3,000m', '800-1,200m', '5,000m+', '200-400m'], correctAnswer: 1, explanation: 'Professional footballers cover 800-1,200m at high-intensity sprint speed per match.' },
    { type: 'multiple_choice', question: 'Which strength exercise is most important for hamstring injury prevention?', options: ['Hip adduction machine', 'Leg press', 'Nordic hamstring curl', 'Leg extension'], correctAnswer: 2, explanation: 'Nordic curls reduce hamstring injury rates by up to 50%.' },
    { type: 'multiple_choice', question: 'What carbohydrate intake is recommended on match day minus 2?', options: ['7-10g/kg', '2-3g/kg', '4-5g/kg', 'No specific recommendation'], correctAnswer: 0, explanation: 'Carb loading at 7-10g/kg should begin 36-48 hours before match day.' },
    { type: 'multiple_choice', question: 'What is the primary factor that separates agility from change of direction speed?', options: ['Strength', 'Perception and decision-making', 'Physical speed', 'Flexibility'], correctAnswer: 1, explanation: 'Agility adds reactive decision-making to physical direction change ability.' },
    { type: 'multiple_choice', question: 'When should the main gym session be placed in a football training week?', options: ['Any day', 'MD-3 or MD-4', 'MD-1', 'Match day'], correctAnswer: 1, explanation: 'Main sessions at MD-3/4 allow adequate recovery before match day.' },
    { type: 'multiple_choice', question: 'What does the acute:chronic workload ratio measure?', options: ['Calories burned', "This week\'s load relative to the 4-week average", 'Maximum strength', 'Sprint speed'], correctAnswer: 1, explanation: 'ACWR monitors training load spikes relative to what the body is prepared for.' },
    { type: 'multiple_choice', question: 'What is the most effective aerobic conditioning method for footballers?', options: ['Swimming', 'Long slow distance running', 'Yoga', 'Small-sided games'], correctAnswer: 3, explanation: 'SSGs develop aerobic fitness alongside tactical and technical skills.' },
    { type: 'multiple_choice', question: 'How does in-season strength training volume compare to pre-season?', options: ['Reduces by 90%', 'Reduces by 40-60%', 'Increases by 20%', 'Same volume'], correctAnswer: 1, explanation: 'Volume drops 40-60% while intensity is maintained to preserve adaptations.' },
    { type: 'multiple_choice', question: 'What is the three-second rule for managing mistakes?', options: ['Ignore mistakes for 3 seconds', 'Discuss with coach within 3 seconds', 'Feel the emotion, reset with a physical trigger, refocus', 'Wait 3 seconds before reacting'], correctAnswer: 2, explanation: 'The rule manages emotional response without suppression.' },
    { type: 'multiple_choice', question: 'Why should youth footballers avoid early specialisation?', options: ['They are not talented enough', 'Only professionals should specialise', 'Multi-sport development builds broader physical foundations and reduces overuse injuries', 'Specialisation has no benefits at any age'], correctAnswer: 2, explanation: 'Multi-sport approaches create more adaptable, resilient athletes.' },
    { type: 'multiple_choice', question: 'What rest period is needed between maximal sprints for speed development?', options: ['1 minute', '3-5 minutes', '30 seconds', '10 minutes'], correctAnswer: 1, explanation: 'Full neural recovery requires 3-5 minutes for quality speed work.' },
    { type: 'multiple_choice', question: 'What protein intake supports muscle repair in footballers?', options: ['4.0g/kg/day', '1.6-2.2g/kg/day', '0.5g/kg/day', '1.0g/kg/day'], correctAnswer: 1, explanation: '1.6-2.2g/kg/day supports repair, adaptation, and immune function.' },
  ],
};
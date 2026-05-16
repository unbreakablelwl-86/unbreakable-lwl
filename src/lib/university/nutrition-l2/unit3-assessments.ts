import type { UnitAssessment } from '../types';

export const nutritionL2Unit3Assessment: UnitAssessment = {
  unitNumber: 3,
  title: 'Unit 3 Assessment — Food Safety & Practical Skills',
  passMarkPercent: 80,
  questions: [
    { type: 'multiple_choice', question: 'The danger zone for bacterial growth is:', options: ['63–100°C', '5–63°C', '0–5°C', 'Above 100°C'], correctAnswer: 1, explanation: 'Bacteria multiply most rapidly between 5°C and 63°C — the danger zone.' },
    { type: 'multiple_choice', question: 'Raw meat should be stored on which shelf of the fridge?', options: ['Bottom shelf', 'Top shelf', 'Any shelf', 'Middle shelf'], correctAnswer: 0, explanation: 'Raw meat should be stored on the bottom shelf to prevent drips contaminating other foods.' },
    { type: 'multiple_choice', question: 'Cross-contamination is:', options: ['Cooking food too long', 'Using too much seasoning', 'Eating expired food', 'Transfer of bacteria from one surface or food to another'], correctAnswer: 3, explanation: 'Cross-contamination is the transfer of harmful bacteria between foods, surfaces, or equipment.' },
    { type: 'multiple_choice', question: 'On UK food labels, ingredients are listed by:', options: ['Nutritional value', 'Calorie content', 'Weight — highest to lowest', 'Alphabetical order'], correctAnswer: 2, explanation: 'Ingredients are listed in descending order of weight, so the first ingredient is the most abundant.' },
    { type: 'multiple_choice', question: 'Frozen vegetables compared to fresh are:', options: ['Only suitable for cooking, not eating', 'Often equally nutritious and more cost-effective', 'Unsafe to eat', 'Always less nutritious'], correctAnswer: 1, explanation: 'Frozen vegetables are typically frozen at peak freshness and retain comparable nutritional content to fresh.' },
    { type: 'multiple_choice', question: 'Batch-cooked meals can be safely stored in the fridge for:', options: ['3–4 days', '2 weeks', 'Indefinitely', '1 day'], correctAnswer: 0, explanation: 'Most cooked meals are safe in the fridge for 3–4 days when properly cooled and stored.' },
    { type: 'multiple_choice', question: 'The safest way to defrost food is:', options: ['On the kitchen counter', 'Under hot water', 'In direct sunlight', 'In the fridge overnight'], correctAnswer: 3, explanation: 'Defrosting in the fridge maintains safe temperatures throughout the process.' },
    { type: 'scenario', question: 'What is the safety concern?', scenario: 'A sharp knife is left in a sink full of soapy water.', options: ['No concern', 'It will rust', 'It is a cut hazard — knives should be washed separately and stored safely', 'Soapy water cleans it better'], correctAnswer: 2, explanation: 'Submerged knives in soapy water are invisible and pose a serious cut risk. They should be washed separately and stored safely.' },
    { type: 'multiple_choice', question: 'What should you do if a pan of oil catches fire?', options: ['Blow on it', 'Turn off the heat and smother with a fire blanket', 'Move it to the sink', 'Pour water on it'], correctAnswer: 1, explanation: 'Water on an oil fire causes a dangerous flare-up. Turn off the heat and smother with a fire blanket or damp cloth.' },
    { type: 'multiple_choice', question: '"Use by" dates relate to:', options: ['Food safety — eating after this date is potentially dangerous', 'Food quality only', 'Packaging appearance', 'Selling regulations only'], correctAnswer: 0, explanation: '"Use by" dates are about food safety. Consuming food after this date risks foodborne illness.' },
  ],
};

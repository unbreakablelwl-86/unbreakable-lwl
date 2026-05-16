import type { UnitAssessment } from '../types';

export const nutritionL2Unit2Assessment: UnitAssessment = {
  unitNumber: 2,
  title: 'Unit 2 Assessment — Nutritional Needs Across Life',
  passMarkPercent: 80,
  questions: [
    { type: 'multiple_choice', question: 'Peak bone mass is primarily established during:', options: ['Old age', 'Middle age', 'Infancy', 'Adolescence'], correctAnswer: 3, explanation: 'Adolescence is the critical period for establishing peak bone mass, making calcium intake during this time essential.' },
    { type: 'multiple_choice', question: 'Sarcopenia refers to:', options: ['Age-related vision loss', 'Bone softening', 'Age-related muscle mass loss', 'A childhood disease'], correctAnswer: 2, explanation: 'Sarcopenia is the progressive loss of skeletal muscle mass and strength associated with ageing.' },
    { type: 'multiple_choice', question: 'Folic acid supplementation is recommended before and during early pregnancy to prevent:', options: ['Miscarriage', 'Neural tube defects', 'Gestational diabetes', 'Anaemia'], correctAnswer: 1, explanation: 'Folic acid significantly reduces the risk of neural tube defects such as spina bifida.' },
    { type: 'multiple_choice', question: 'Which nutrient must vegans supplement?', options: ['Vitamin B12', 'Vitamin C', 'Iron', 'Calcium'], correctAnswer: 0, explanation: 'Vitamin B12 is found almost exclusively in animal products and must be supplemented on a vegan diet.' },
    { type: 'multiple_choice', question: 'Halal dietary law prohibits:', options: ['All dairy', 'All meat', 'Wheat and gluten', 'Pork and alcohol'], correctAnswer: 3, explanation: 'Halal law prohibits pork, alcohol, and meat not slaughtered according to Islamic guidelines.' },
    { type: 'multiple_choice', question: 'How many major allergens must be declared on UK food labels?', options: ['10', '8', '14', '20'], correctAnswer: 2, explanation: 'UK food law requires 14 major allergens to be declared on food labels.' },
    { type: 'multiple_choice', question: 'Active individuals typically need more:', options: ['Fat and less carbohydrate', 'Calories, protein, and fluids', 'Supplements only', 'Sleep and less food'], correctAnswer: 1, explanation: 'Higher activity levels increase requirements for energy, protein, and hydration.' },
    { type: 'scenario', question: 'What should you do?', scenario: 'A client with newly diagnosed Type 1 diabetes asks you to create a meal plan for managing their blood sugar.', options: ['Refer them to a registered dietitian who specialises in diabetes management', 'Create a detailed diabetes meal plan', 'Research diabetes diets and try your best', 'Tell them to avoid all sugar'], correctAnswer: 0, explanation: 'Medical nutrition therapy for diabetes is outside the scope of a general nutrition adviser. Referral to a specialist is essential.' },
    { type: 'multiple_choice', question: 'Iron from plant sources is called:', options: ['Ferrous iron', 'Haem iron', 'Complete iron', 'Non-haem iron'], correctAnswer: 3, explanation: 'Plant-based iron is non-haem iron, which is less readily absorbed than haem iron from animal sources.' },
    { type: 'multiple_choice', question: 'Vitamin C enhances the absorption of:', options: ['Vitamin D', 'Calcium', 'Non-haem iron', 'Zinc'], correctAnswer: 2, explanation: 'Vitamin C significantly improves the absorption of non-haem iron from plant sources when consumed together.' },
  ],
};

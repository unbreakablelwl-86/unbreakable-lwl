import type { UnitAssessment } from '../types';

export const nutritionL2Unit1Assessment: UnitAssessment = {
  unitNumber: 1,
  title: 'Unit 1 Assessment — Principles of Healthy Eating',
  passMarkPercent: 80,
  questions: [
    { type: 'multiple_choice', question: 'The Eatwell Guide recommends fruit and vegetables make up approximately what proportion of your diet?', options: ['Half', 'Just over a third', 'A quarter', 'Two-thirds'], correctAnswer: 1, explanation: 'Fruit and vegetables should make up just over a third of your daily food intake according to the Eatwell Guide.' },
    { type: 'multiple_choice', question: 'Which macronutrient provides 9 calories per gram?', options: ['Fat', 'Carbohydrate', 'Protein', 'Alcohol'], correctAnswer: 0, explanation: 'Fat provides 9 calories per gram — more than double the energy density of protein and carbohydrate (4 kcal/g each).' },
    { type: 'multiple_choice', question: 'Vitamin D is important for:', options: ['Red blood cell production', 'Blood clotting', 'Protein synthesis', 'Bone health and calcium absorption'], correctAnswer: 3, explanation: 'Vitamin D aids calcium absorption and is essential for bone health and immune function.' },
    { type: 'multiple_choice', question: 'The UK recommended daily fibre intake for adults is:', options: ['20 grams', '15 grams', '30 grams', '50 grams'], correctAnswer: 2, explanation: 'Adults in the UK are recommended to consume 30 grams of dietary fibre per day.' },
    { type: 'multiple_choice', question: 'Dehydration of 2% body weight during exercise can:', options: ['Have no effect', 'Reduce physical and cognitive performance', 'Improve performance', 'Only affect marathon runners'], correctAnswer: 1, explanation: 'Even mild dehydration impairs physical performance, cognitive function, and increases perceived exertion.' },
    { type: 'multiple_choice', question: 'Oily fish are important because they contain:', options: ['Omega-3 fatty acids', 'No fat', 'Vitamin B12 only', 'High levels of calcium'], correctAnswer: 0, explanation: 'Oily fish (salmon, mackerel, sardines) are rich sources of omega-3 fatty acids, supporting heart and brain health.' },
    { type: 'scenario', question: 'What advice would you give?', scenario: 'A person eats the same three meals every day and feels healthy but is concerned about nutrient gaps.', options: ['Suggest they take supplements instead', 'If they feel fine, there is no issue', 'Tell them to eat more of the same foods', 'Recommend variety — eating a wider range of foods reduces the risk of micronutrient deficiencies'], correctAnswer: 3, explanation: 'Dietary variety is essential for covering the full spectrum of vitamins, minerals, and phytonutrients. Repetitive diets increase deficiency risk.' },
    { type: 'multiple_choice', question: 'The hand method uses your fist to estimate a portion of:', options: ['Vegetables', 'Protein', 'Carbohydrate', 'Fat'], correctAnswer: 2, explanation: 'Your fist approximates a portion of carbohydrate (rice, pasta, potatoes). Your palm is used for protein, thumb for fat.' },
    { type: 'multiple_choice', question: 'A balanced meal should contain:', options: ['Protein and supplements', 'Protein, carbohydrate, fat, and vegetables', 'Only protein and fat', 'Carbohydrate only'], correctAnswer: 1, explanation: 'A balanced meal combines protein, carbohydrate, healthy fat, and vegetables to provide all macronutrients and micronutrients.' },
    { type: 'multiple_choice', question: 'Which vitamin is water-soluble and NOT stored in the body?', options: ['Vitamin C', 'Vitamin A', 'Vitamin D', 'Vitamin K'], correctAnswer: 0, explanation: 'Vitamin C is water-soluble and cannot be stored in the body, requiring regular dietary intake.' },
  ],
};

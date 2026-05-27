import type { UnitAssessment } from '../types';
import { nutritionL2Unit1Assessment } from './assessments';
import { nutritionL2Unit2Assessment } from './unit2-assessments';
import { nutritionL2Unit3Assessment } from './unit3-assessments';
import { nutritionL2Unit4Assessment } from './unit4-assessments';

export const nutritionL2FinalAssessment: UnitAssessment = {
  unitNumber: 0,
  title: 'Level 2 Nutrition — Final Assessment',
  passMarkPercent: 80,
  pickCount: 40,
  questions: [
    // Pull from all unit assessments + additional questions
    ...nutritionL2Unit1Assessment.questions,
    ...nutritionL2Unit2Assessment.questions,
    ...nutritionL2Unit3Assessment.questions,
    ...nutritionL2Unit4Assessment.questions,
    // Additional cross-unit questions
    { type: 'multiple_choice', question: 'Which macronutrient is stored as glycogen in muscles and the liver?', options: ['Fibre', 'Fat', 'Protein', 'Carbohydrate'], correctAnswer: 3, explanation: 'Carbohydrate is stored as glycogen in the muscles and liver for readily available energy.' },
    { type: 'multiple_choice', question: 'Which mineral helps prevent muscle cramps and supports nerve function?', options: ['Calcium', 'Iron', 'Magnesium', 'Zinc'], correctAnswer: 2, explanation: 'Magnesium supports muscle relaxation, nerve function, and over 300 enzymatic reactions in the body.' },
    { type: 'multiple_choice', question: 'A food allergen is:', options: ['Only found in processed food', 'The same as a food intolerance', 'A substance that triggers an immune system response in sensitive individuals', 'Any food that tastes bad'], correctAnswer: 2, explanation: 'A food allergen is a protein that triggers an immune-mediated response, which can range from mild to life-threatening.' },
    { type: 'multiple_choice', question: 'The thermic effect of food (TEF) is highest for which macronutrient?', options: ['Alcohol', 'Protein', 'Fat', 'Carbohydrate'], correctAnswer: 1, explanation: 'Protein has the highest TEF (20–35% of calories consumed), meaning the body uses more energy to digest and process protein than other macronutrients.' },
    { type: 'scenario', question: 'What should be the priority?', scenario: 'A beginner asks you to help them improve their nutrition. They currently skip breakfast, eat fast food for lunch, and have a large dinner.', options: ['Start with one change — adding a protein-rich breakfast — and build from there', 'Put them on a strict meal plan', 'Tell them to fast until dinner', 'Overhaul everything immediately'], correctAnswer: 0, explanation: 'Starting with one manageable change builds confidence and momentum. Trying to change everything at once leads to overwhelm and failure.' },
    { type: 'multiple_choice', question: 'Soluble fibre can help:', options: ['Build muscle', 'Lower blood cholesterol and stabilise blood sugar', 'Replace protein in the diet', 'Increase fat absorption'], correctAnswer: 1, explanation: 'Soluble fibre forms a gel in the gut that can help lower blood cholesterol and moderate blood sugar spikes.' },
    { type: 'multiple_choice', question: 'Which cooking method retains the most nutrients in vegetables?', options: ['Boiling for a long time', 'Deep frying', 'Steaming or microwaving briefly', 'Soaking in water overnight'], correctAnswer: 2, explanation: 'Steaming and brief microwaving preserve more water-soluble vitamins than boiling, which leaches nutrients into the cooking water.' },
    { type: 'multiple_choice', question: 'An eating disorder should be treated by:', options: ['A personal trainer', 'Self-help books only', 'A nutrition adviser alone', 'A qualified mental health professional with eating disorder expertise'], correctAnswer: 3, explanation: 'Eating disorders are serious mental health conditions requiring specialist treatment from qualified professionals, not general nutrition advisers.' },
    { type: 'multiple_choice', question: 'What is the most practical indicator of hydration status?', options: ['Body weight', 'How thirsty you feel', 'How much you sweat', 'Urine colour — pale straw indicates good hydration'], correctAnswer: 3, explanation: 'Urine colour is the most practical day-to-day indicator of hydration. Pale straw colour suggests adequate hydration; dark yellow indicates dehydration.' },
    { type: 'multiple_choice', question: 'The best approach to long-term healthy eating is:', options: ['Relying on willpower alone', 'Eliminating entire food groups', 'Following the strictest diet available', 'Building sustainable habits through small, consistent changes over time'], correctAnswer: 3, explanation: 'Long-term success comes from sustainable, incremental habit changes — not extreme diets or reliance on willpower.' },
  ],
};

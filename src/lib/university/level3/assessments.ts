import type { UnitAssessment } from '../types';

export const level3Unit1Assessment: UnitAssessment = {
  unitNumber: 1,
  title: 'Advanced Nutrition — Unit Assessment',
  passMarkPercent: 80,
  questions: [
    // ─── CH1: Macro Periodisation ───
    {
      type: 'multiple_choice',
      question: 'During a hypertrophy phase, which macronutrient ratio shift is most appropriate?',
      options: ['Higher fat, lower carbs', 'Equal across all three', 'Protein only, minimal carbs and fat', 'Higher carbs, moderate protein'],
      correctAnswer: 3,
      explanation: 'Hypertrophy phases benefit from higher carbohydrate intake to fuel intense training volume while maintaining moderate protein for muscle repair.',
    },
    {
      type: 'multiple_choice',
      question: 'What is the primary purpose of adjusting macros between training phases?',
      options: ['To keep meals interesting', 'To eliminate the need for supplements', 'To match energy and nutrient demands to training goals', 'To reduce food costs'],
      correctAnswer: 2,
      explanation: 'Macro periodisation ensures your nutrition supports the specific demands of each training phase — whether building, maintaining, or cutting.',
    },
    {
      type: 'multiple_choice',
      question: 'In a fat-loss phase, what typically happens to protein intake relative to other macros?',
      options: ['It is replaced by fats', 'It stays the same or increases', 'It decreases proportionally', 'It becomes irrelevant'],
      correctAnswer: 1,
      explanation: 'Protein is kept high (or increased) during a deficit to preserve lean mass while carbs and fats are reduced.',
    },
    // ─── CH2: Nutrient Timing ───
    {
      type: 'multiple_choice',
      question: 'What is the "anabolic window" in current evidence-based thinking?',
      options: ['A broader 3–5 hour period around training', 'A debunked myth with no basis', 'Only applies to elite athletes', 'A strict 30-minute post-workout period'],
      correctAnswer: 0,
      explanation: 'Modern research shows the post-exercise nutritional window is much wider than the 30-minute claim — spanning several hours either side of training.',
    },
    {
      type: 'multiple_choice',
      question: 'Why might carbohydrates be beneficial before a high-intensity session?',
      options: ['They reduce the need for warm-ups', 'They increase fat oxidation', 'They slow digestion', 'They top up glycogen stores for fuel'],
      correctAnswer: 3,
      explanation: 'Carbohydrates are the primary fuel for high-intensity exercise, and pre-workout carbs help ensure glycogen stores are adequate.',
    },
    {
      type: 'multiple_choice',
      question: 'Intra-workout nutrition is most relevant for sessions lasting longer than:',
      options: ['20 minutes', '45 minutes', '90 minutes', 'Any duration'],
      correctAnswer: 2,
      explanation: 'For most people, intra-workout nutrition only becomes meaningfully beneficial during prolonged sessions exceeding 90 minutes.',
    },
    // ─── CH3: Supplementation ───
    {
      type: 'multiple_choice',
      question: 'Which supplement has the strongest evidence base for improving strength performance?',
      options: ['CLA', 'Creatine monohydrate', 'Glutamine', 'BCAAs'],
      correctAnswer: 1,
      explanation: 'Creatine monohydrate is the most researched and consistently supported ergogenic supplement for strength and power.',
    },
    {
      type: 'multiple_choice',
      question: 'What does "evidence-based supplementation" mean in practice?',
      options: ['Using only supplements with robust peer-reviewed research', 'Taking everything available just in case', 'Avoiding all supplements entirely', 'Following influencer recommendations'],
      correctAnswer: 0,
      explanation: 'Evidence-based supplementation means choosing products backed by high-quality, peer-reviewed studies rather than marketing claims.',
    },
    // ─── CH4: Body Composition ───
    {
      type: 'multiple_choice',
      question: 'Body recomposition refers to:',
      options: ['Maintaining the same body weight indefinitely', 'Bulking followed by cutting', 'Losing weight as fast as possible', 'Simultaneously gaining muscle and losing fat'],
      correctAnswer: 3,
      explanation: 'Recomposition is the process of gaining lean muscle while losing body fat, often achieved at maintenance or a slight deficit with high protein.',
    },
    {
      type: 'multiple_choice',
      question: 'Which method of measuring body composition is considered the most accessible and repeatable for general use?',
      options: ['DEXA scan', 'Visual estimation', 'Skinfold callipers with consistent technique', 'BMI calculation'],
      correctAnswer: 2,
      explanation: 'While DEXA is highly accurate, consistent skinfold measurements are the most practical repeatable method for tracking changes over time.',
    },
    // ─── CH5: Metabolic Adaptation ───
    {
      type: 'multiple_choice',
      question: 'Adaptive thermogenesis describes:',
      options: ['Your body burning more calories over time', 'A reduction in energy expenditure beyond what weight loss alone predicts', 'Higher metabolism from eating more protein', 'Increased appetite after exercise'],
      correctAnswer: 1,
      explanation: 'Adaptive thermogenesis is the body\'s defence mechanism — reducing metabolic rate beyond the expected drop from reduced body mass during prolonged dieting.',
    },
    {
      type: 'multiple_choice',
      question: 'A diet break typically involves:',
      options: ['Returning to maintenance calories for 1–2 weeks', 'Doubling protein intake temporarily', 'Fasting for 48 hours', 'Eating whatever you want for a week'],
      correctAnswer: 0,
      explanation: 'A structured diet break raises calories to estimated maintenance for a planned period to help mitigate metabolic adaptation and psychological fatigue.',
    },
    {
      type: 'multiple_choice',
      question: 'Reverse dieting is the process of:',
      options: ['Eating meals in reverse order', 'Cutting calories as fast as possible', 'Eliminating carbs entirely', 'Gradually increasing calories after a deficit phase'],
      correctAnswer: 3,
      explanation: 'Reverse dieting slowly increases caloric intake post-diet to rebuild metabolic rate while minimising excessive fat regain.',
    },
    // ─── CH6: Calorie Cycling ───
    {
      type: 'multiple_choice',
      question: 'A refeed day is best described as:',
      options: ['Doubling fat intake for hormonal support', 'Skipping meals to save calories', 'A planned higher-calorie day emphasising carbohydrates', 'A cheat day with no limits'],
      correctAnswer: 2,
      explanation: 'Refeeds are structured increases in calorie intake — primarily through carbohydrates — to support leptin, thyroid function, and training performance.',
    },
    {
      type: 'multiple_choice',
      question: 'Calorie cycling is most useful for people who are:',
      options: ['Already at maintenance with no goals', 'In a prolonged calorie deficit', 'Only training once per week', 'Complete beginners with no training history'],
      correctAnswer: 1,
      explanation: 'Calorie cycling provides the greatest benefit during extended fat-loss phases, helping manage hormonal and psychological downsides of sustained restriction.',
    },
    // ─── CH7: Gut Health ───
    {
      type: 'multiple_choice',
      question: 'Which dietary factor has the greatest positive impact on gut microbiome diversity?',
      options: ['High fibre intake from varied plant sources', 'High protein intake', 'Frequent use of antibiotics', 'Low carbohydrate dieting'],
      correctAnswer: 0,
      explanation: 'A diverse range of plant fibres feeds different bacterial species, promoting a healthy and resilient gut microbiome.',
    },
    {
      type: 'multiple_choice',
      question: 'A food intolerance differs from a food allergy in that:',
      options: ['Allergies only affect children', 'Intolerances are always more severe', 'They are the same thing', 'Intolerances involve digestive discomfort, not immune-mediated reactions'],
      correctAnswer: 3,
      explanation: 'Food intolerances cause digestive symptoms (bloating, gas, discomfort) but do not involve the immune system the way true allergies do.',
    },
    // ─── CH8: Goal-Specific Nutrition ───
    {
      type: 'multiple_choice',
      question: 'During a structured bulk, a caloric surplus of what range is generally recommended to minimise excess fat gain?',
      options: ['500–1000 kcal', '100–200 kcal', '200–500 kcal', '1000+ kcal'],
      correctAnswer: 2,
      explanation: 'A moderate surplus of 200–500 kcal supports muscle growth while limiting unnecessary fat accumulation — often called a "lean bulk".',
    },
    {
      type: 'multiple_choice',
      question: 'When fuelling for endurance performance, which macronutrient takes priority?',
      options: ['Fibre', 'Carbohydrates', 'Fat', 'Protein'],
      correctAnswer: 1,
      explanation: 'Endurance activities rely heavily on glycogen stores, making carbohydrates the primary fuel source for sustained performance.',
    },
    {
      type: 'scenario',
      question: 'A lifter has been in a deficit for 16 weeks and has stalled. Their energy is low, sleep is poor, and gym performance has dropped. What is the most appropriate next step?',
      scenario: 'They are reluctant to increase calories because they fear regaining fat.',
      options: [
        'Implement a structured diet break at maintenance for 1–2 weeks',
        'Cut calories further to push through the plateau',
        'Add two hours of daily cardio',
        'Switch to a ketogenic diet immediately',
      ],
      correctAnswer: 0,
      explanation: 'After 16 weeks of dieting, metabolic adaptation and fatigue are likely significant. A diet break restores metabolic rate and psychological readiness without abandoning the overall goal.',
    },
  ],
};

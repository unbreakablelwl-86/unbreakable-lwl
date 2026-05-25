import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const HIGH_PROTEIN_RECIPES = [
  // BREAKFAST (5)
  {
    name: "Steak & Egg Breakfast Skillet",
    pack: "high-protein",
    category: "breakfast",
    servings: 2,
    prep_time_minutes: 5,
    cook_time_minutes: 12,
    calories_per_serving: 420,
    protein_g: 42,
    carbs_g: 8,
    fat_g: 24,
    dietary_tags: ["GF", "DF", "HP", "Q"],
    instructions:
      "1. Season sirloin steak and sear in a hot skillet for 3 minutes per side.\n2. Remove steak and rest for 2 minutes.\n3. In the same pan, fry eggs sunny-side up.\n4. Slice steak, serve alongside eggs with sautéed spinach and cherry tomatoes.",
    ingredients: [
      { name: "Sirloin steak", quantity: "300g", calories: 510, protein_g: 62, carbs_g: 0, fat_g: 28 },
      { name: "Eggs", quantity: "2", calories: 156, protein_g: 12, carbs_g: 2, fat_g: 11 },
      { name: "Fresh spinach", quantity: "100g", calories: 23, protein_g: 3, carbs_g: 4, fat_g: 0 },
      { name: "Cherry tomatoes", quantity: "100g", calories: 18, protein_g: 1, carbs_g: 4, fat_g: 0 },
    ],
  },
  {
    name: "Turkey & Sweet Potato Hash",
    pack: "high-protein",
    category: "breakfast",
    servings: 2,
    prep_time_minutes: 10,
    cook_time_minutes: 15,
    calories_per_serving: 380,
    protein_g: 38,
    carbs_g: 28,
    fat_g: 12,
    dietary_tags: ["GF", "DF", "HP"],
    instructions:
      "1. Dice sweet potato into small cubes, sauté in olive oil for 8 minutes.\n2. Add turkey mince and cook until browned.\n3. Stir in diced peppers, paprika and garlic.\n4. Top with a poached egg and fresh coriander.",
    ingredients: [
      { name: "Turkey mince", quantity: "250g", calories: 275, protein_g: 55, carbs_g: 0, fat_g: 5 },
      { name: "Sweet potato", quantity: "200g", calories: 172, protein_g: 3, carbs_g: 40, fat_g: 0 },
      { name: "Eggs", quantity: "2", calories: 156, protein_g: 12, carbs_g: 2, fat_g: 11 },
      { name: "Bell pepper", quantity: "1", calories: 31, protein_g: 1, carbs_g: 6, fat_g: 0 },
    ],
  },
  {
    name: "Protein Overnight Oats",
    pack: "high-protein",
    category: "breakfast",
    servings: 1,
    prep_time_minutes: 5,
    cook_time_minutes: 0,
    calories_per_serving: 410,
    protein_g: 35,
    carbs_g: 45,
    fat_g: 10,
    dietary_tags: ["V", "HP", "MP"],
    instructions:
      "1. Combine oats, Greek yogurt, protein powder and almond milk in a jar.\n2. Stir in chia seeds and a drizzle of honey.\n3. Refrigerate overnight.\n4. Top with berries and a sprinkle of almonds before serving.",
    ingredients: [
      { name: "Rolled oats", quantity: "50g", calories: 190, protein_g: 7, carbs_g: 34, fat_g: 3 },
      { name: "Greek yogurt (0%)", quantity: "150g", calories: 87, protein_g: 15, carbs_g: 6, fat_g: 0 },
      { name: "Whey protein powder", quantity: "25g", calories: 100, protein_g: 20, carbs_g: 2, fat_g: 1 },
      { name: "Chia seeds", quantity: "1 tbsp", calories: 58, protein_g: 2, carbs_g: 5, fat_g: 4 },
    ],
  },
  {
    name: "Smoked Salmon Protein Wrap",
    pack: "high-protein",
    category: "breakfast",
    servings: 1,
    prep_time_minutes: 5,
    cook_time_minutes: 0,
    calories_per_serving: 350,
    protein_g: 32,
    carbs_g: 22,
    fat_g: 15,
    dietary_tags: ["HP", "Q"],
    instructions:
      "1. Spread cream cheese on a wholemeal wrap.\n2. Layer smoked salmon, sliced cucumber and rocket.\n3. Squeeze fresh lemon juice over the top.\n4. Roll tightly and slice in half.",
    ingredients: [
      { name: "Smoked salmon", quantity: "100g", calories: 180, protein_g: 25, carbs_g: 0, fat_g: 8 },
      { name: "Wholemeal wrap", quantity: "1", calories: 120, protein_g: 4, carbs_g: 20, fat_g: 3 },
      { name: "Light cream cheese", quantity: "30g", calories: 45, protein_g: 2, carbs_g: 2, fat_g: 3 },
      { name: "Rocket", quantity: "30g", calories: 8, protein_g: 1, carbs_g: 1, fat_g: 0 },
    ],
  },
  {
    name: "High-Protein Banana Pancakes",
    pack: "high-protein",
    category: "breakfast",
    servings: 2,
    prep_time_minutes: 5,
    cook_time_minutes: 8,
    calories_per_serving: 340,
    protein_g: 30,
    carbs_g: 32,
    fat_g: 10,
    dietary_tags: ["GF", "V", "HP", "Q"],
    instructions:
      "1. Blend banana, eggs, protein powder and oats until smooth.\n2. Heat a non-stick pan with coconut oil.\n3. Pour small rounds, cook 2 minutes per side.\n4. Serve stacked with Greek yogurt and a drizzle of honey.",
    ingredients: [
      { name: "Banana", quantity: "1 medium", calories: 105, protein_g: 1, carbs_g: 27, fat_g: 0 },
      { name: "Eggs", quantity: "3", calories: 234, protein_g: 18, carbs_g: 3, fat_g: 16 },
      { name: "Whey protein powder", quantity: "30g", calories: 120, protein_g: 24, carbs_g: 2, fat_g: 1 },
      { name: "Oats", quantity: "30g", calories: 114, protein_g: 4, carbs_g: 20, fat_g: 2 },
    ],
  },

  // LUNCH (5)
  {
    name: "Grilled Chicken & Quinoa Power Bowl",
    pack: "high-protein",
    category: "lunch",
    servings: 2,
    prep_time_minutes: 10,
    cook_time_minutes: 20,
    calories_per_serving: 450,
    protein_g: 42,
    carbs_g: 35,
    fat_g: 14,
    dietary_tags: ["GF", "DF", "HP"],
    instructions:
      "1. Grill seasoned chicken breast for 6-7 minutes per side.\n2. Cook quinoa according to package instructions.\n3. Assemble bowls with quinoa, sliced chicken, edamame, avocado and mixed greens.\n4. Drizzle with lemon-tahini dressing.",
    ingredients: [
      { name: "Chicken breast", quantity: "300g", calories: 330, protein_g: 72, carbs_g: 0, fat_g: 4 },
      { name: "Quinoa", quantity: "100g", calories: 120, protein_g: 4, carbs_g: 21, fat_g: 2 },
      { name: "Edamame", quantity: "80g", calories: 94, protein_g: 8, carbs_g: 7, fat_g: 4 },
      { name: "Avocado", quantity: "½", calories: 117, protein_g: 1, carbs_g: 6, fat_g: 11 },
    ],
  },
  {
    name: "Tuna Steak Niçoise Salad",
    pack: "high-protein",
    category: "lunch",
    servings: 2,
    prep_time_minutes: 10,
    cook_time_minutes: 8,
    calories_per_serving: 400,
    protein_g: 40,
    carbs_g: 20,
    fat_g: 18,
    dietary_tags: ["GF", "DF", "HP"],
    instructions:
      "1. Sear tuna steaks for 2 minutes per side (medium rare).\n2. Boil eggs and green beans.\n3. Arrange salad with lettuce, olives, tomatoes, beans and sliced egg.\n4. Top with sliced tuna and olive oil dressing.",
    ingredients: [
      { name: "Tuna steak", quantity: "250g", calories: 310, protein_g: 62, carbs_g: 0, fat_g: 6 },
      { name: "Eggs", quantity: "2", calories: 156, protein_g: 12, carbs_g: 2, fat_g: 11 },
      { name: "Green beans", quantity: "100g", calories: 31, protein_g: 2, carbs_g: 7, fat_g: 0 },
      { name: "Mixed olives", quantity: "40g", calories: 58, protein_g: 0, carbs_g: 2, fat_g: 6 },
    ],
  },
  {
    name: "Spicy Prawn & Black Bean Tacos",
    pack: "high-protein",
    category: "lunch",
    servings: 2,
    prep_time_minutes: 10,
    cook_time_minutes: 8,
    calories_per_serving: 420,
    protein_g: 38,
    carbs_g: 38,
    fat_g: 12,
    dietary_tags: ["DF", "HP", "Q"],
    instructions:
      "1. Season prawns with smoked paprika and chili.\n2. Pan-fry prawns for 2-3 minutes per side.\n3. Warm black beans with cumin and lime.\n4. Fill corn tortillas with beans, prawns, salsa and fresh coriander.",
    ingredients: [
      { name: "King prawns", quantity: "300g", calories: 300, protein_g: 60, carbs_g: 0, fat_g: 4 },
      { name: "Black beans (tinned)", quantity: "200g", calories: 220, protein_g: 14, carbs_g: 36, fat_g: 1 },
      { name: "Corn tortillas", quantity: "4", calories: 200, protein_g: 5, carbs_g: 40, fat_g: 3 },
      { name: "Fresh salsa", quantity: "60g", calories: 12, protein_g: 0, carbs_g: 3, fat_g: 0 },
    ],
  },
  {
    name: "Chicken Tikka Protein Box",
    pack: "high-protein",
    category: "lunch",
    servings: 2,
    prep_time_minutes: 15,
    cook_time_minutes: 15,
    calories_per_serving: 430,
    protein_g: 44,
    carbs_g: 30,
    fat_g: 14,
    dietary_tags: ["GF", "HP"],
    instructions:
      "1. Marinate diced chicken in yogurt, tikka paste and lemon.\n2. Thread onto skewers and grill for 12-15 minutes.\n3. Serve with brown rice, cucumber raita and mixed salad.\n4. Garnish with mint and a wedge of lemon.",
    ingredients: [
      { name: "Chicken breast", quantity: "300g", calories: 330, protein_g: 72, carbs_g: 0, fat_g: 4 },
      { name: "Greek yogurt", quantity: "80g", calories: 47, protein_g: 8, carbs_g: 3, fat_g: 0 },
      { name: "Brown rice", quantity: "100g (dry)", calories: 350, protein_g: 8, carbs_g: 72, fat_g: 3 },
      { name: "Tikka paste", quantity: "2 tbsp", calories: 60, protein_g: 1, carbs_g: 4, fat_g: 4 },
    ],
  },
  {
    name: "Turkey & Lentil Soup",
    pack: "high-protein",
    category: "lunch",
    servings: 4,
    prep_time_minutes: 10,
    cook_time_minutes: 30,
    calories_per_serving: 320,
    protein_g: 34,
    carbs_g: 28,
    fat_g: 8,
    dietary_tags: ["GF", "DF", "HP", "MP"],
    instructions:
      "1. Brown turkey mince in a large pot.\n2. Add diced onion, carrots, celery and garlic.\n3. Stir in red lentils and chicken stock.\n4. Simmer for 25 minutes. Season with cumin and smoked paprika.",
    ingredients: [
      { name: "Turkey mince", quantity: "400g", calories: 440, protein_g: 88, carbs_g: 0, fat_g: 8 },
      { name: "Red lentils", quantity: "150g", calories: 510, protein_g: 36, carbs_g: 90, fat_g: 2 },
      { name: "Carrots", quantity: "2", calories: 50, protein_g: 1, carbs_g: 12, fat_g: 0 },
      { name: "Chicken stock", quantity: "1 litre", calories: 30, protein_g: 2, carbs_g: 2, fat_g: 0 },
    ],
  },

  // MAIN (5)
  {
    name: "Herb-Crusted Salmon with Asparagus",
    pack: "high-protein",
    category: "main",
    servings: 2,
    prep_time_minutes: 10,
    cook_time_minutes: 18,
    calories_per_serving: 440,
    protein_g: 42,
    carbs_g: 8,
    fat_g: 26,
    dietary_tags: ["GF", "HP"],
    instructions:
      "1. Mix breadcrumbs with parsley, lemon zest and parmesan.\n2. Press onto salmon fillets.\n3. Bake at 200°C for 15 minutes.\n4. Roast asparagus alongside with olive oil. Serve with lemon wedges.",
    ingredients: [
      { name: "Salmon fillets", quantity: "2 x 180g", calories: 748, protein_g: 72, carbs_g: 0, fat_g: 50 },
      { name: "Asparagus", quantity: "200g", calories: 40, protein_g: 4, carbs_g: 8, fat_g: 0 },
      { name: "Parmesan", quantity: "30g", calories: 120, protein_g: 10, carbs_g: 1, fat_g: 8 },
      { name: "Panko breadcrumbs", quantity: "2 tbsp", calories: 54, protein_g: 2, carbs_g: 10, fat_g: 0 },
    ],
  },
  {
    name: "Lean Beef Bolognese with Zoodles",
    pack: "high-protein",
    category: "main",
    servings: 4,
    prep_time_minutes: 10,
    cook_time_minutes: 30,
    calories_per_serving: 380,
    protein_g: 38,
    carbs_g: 15,
    fat_g: 18,
    dietary_tags: ["GF", "DF", "LC", "HP"],
    instructions:
      "1. Brown lean beef mince with onion and garlic.\n2. Add tinned tomatoes, tomato paste, oregano and basil.\n3. Simmer for 25 minutes.\n4. Spiralize courgettes and serve topped with bolognese.",
    ingredients: [
      { name: "Lean beef mince (5%)", quantity: "500g", calories: 600, protein_g: 100, carbs_g: 0, fat_g: 22 },
      { name: "Tinned tomatoes", quantity: "400g", calories: 80, protein_g: 4, carbs_g: 16, fat_g: 0 },
      { name: "Courgettes", quantity: "4 large", calories: 68, protein_g: 5, carbs_g: 13, fat_g: 1 },
      { name: "Onion", quantity: "1", calories: 40, protein_g: 1, carbs_g: 9, fat_g: 0 },
    ],
  },
  {
    name: "Chicken & Broccoli Stir Fry",
    pack: "high-protein",
    category: "main",
    servings: 2,
    prep_time_minutes: 10,
    cook_time_minutes: 12,
    calories_per_serving: 400,
    protein_g: 44,
    carbs_g: 18,
    fat_g: 16,
    dietary_tags: ["DF", "HP", "Q"],
    instructions:
      "1. Slice chicken breast thin, season with soy sauce and ginger.\n2. Stir-fry chicken on high heat for 4 minutes.\n3. Add broccoli florets, mangetout and garlic.\n4. Finish with sesame oil and serve with a sprinkle of sesame seeds.",
    ingredients: [
      { name: "Chicken breast", quantity: "350g", calories: 385, protein_g: 84, carbs_g: 0, fat_g: 5 },
      { name: "Broccoli", quantity: "250g", calories: 85, protein_g: 7, carbs_g: 17, fat_g: 1 },
      { name: "Soy sauce", quantity: "2 tbsp", calories: 16, protein_g: 2, carbs_g: 2, fat_g: 0 },
      { name: "Sesame oil", quantity: "1 tbsp", calories: 120, protein_g: 0, carbs_g: 0, fat_g: 14 },
    ],
  },
  {
    name: "Baked Cod with Sweet Potato Mash",
    pack: "high-protein",
    category: "main",
    servings: 2,
    prep_time_minutes: 10,
    cook_time_minutes: 25,
    calories_per_serving: 400,
    protein_g: 40,
    carbs_g: 35,
    fat_g: 10,
    dietary_tags: ["GF", "HP"],
    instructions:
      "1. Boil sweet potatoes until tender, mash with a knob of butter.\n2. Season cod with lemon, dill and olive oil.\n3. Bake cod at 200°C for 15 minutes.\n4. Serve on sweet potato mash with steamed green beans.",
    ingredients: [
      { name: "Cod fillets", quantity: "2 x 200g", calories: 360, protein_g: 80, carbs_g: 0, fat_g: 2 },
      { name: "Sweet potato", quantity: "300g", calories: 258, protein_g: 5, carbs_g: 60, fat_g: 0 },
      { name: "Green beans", quantity: "100g", calories: 31, protein_g: 2, carbs_g: 7, fat_g: 0 },
      { name: "Butter", quantity: "10g", calories: 72, protein_g: 0, carbs_g: 0, fat_g: 8 },
    ],
  },
  {
    name: "Lamb Kofta with Tzatziki",
    pack: "high-protein",
    category: "main",
    servings: 4,
    prep_time_minutes: 15,
    cook_time_minutes: 12,
    calories_per_serving: 380,
    protein_g: 35,
    carbs_g: 12,
    fat_g: 22,
    dietary_tags: ["GF", "HP"],
    instructions:
      "1. Mix lamb mince with cumin, coriander, garlic and onion.\n2. Shape into kofta around skewers.\n3. Grill for 10-12 minutes, turning halfway.\n4. Serve with tzatziki, salad and warm pitta.",
    ingredients: [
      { name: "Lamb mince", quantity: "500g", calories: 1000, protein_g: 100, carbs_g: 0, fat_g: 68 },
      { name: "Greek yogurt (tzatziki)", quantity: "150g", calories: 87, protein_g: 15, carbs_g: 6, fat_g: 0 },
      { name: "Cucumber", quantity: "½", calories: 8, protein_g: 0, carbs_g: 2, fat_g: 0 },
      { name: "Garlic", quantity: "3 cloves", calories: 12, protein_g: 1, carbs_g: 3, fat_g: 0 },
    ],
  },

  // DESSERTS (5)
  {
    name: "Protein Chocolate Mousse",
    pack: "high-protein",
    category: "desserts",
    servings: 2,
    prep_time_minutes: 10,
    cook_time_minutes: 0,
    calories_per_serving: 220,
    protein_g: 24,
    carbs_g: 16,
    fat_g: 8,
    dietary_tags: ["GF", "V", "HP", "Q"],
    instructions:
      "1. Blend silken tofu, cocoa powder, protein powder and maple syrup until smooth.\n2. Chill for 30 minutes.\n3. Serve topped with fresh raspberries and dark chocolate shavings.",
    ingredients: [
      { name: "Silken tofu", quantity: "200g", calories: 110, protein_g: 10, carbs_g: 4, fat_g: 6 },
      { name: "Chocolate protein powder", quantity: "30g", calories: 120, protein_g: 24, carbs_g: 3, fat_g: 1 },
      { name: "Cocoa powder", quantity: "2 tbsp", calories: 24, protein_g: 2, carbs_g: 6, fat_g: 2 },
      { name: "Maple syrup", quantity: "1 tbsp", calories: 52, protein_g: 0, carbs_g: 13, fat_g: 0 },
    ],
  },
  {
    name: "Greek Yogurt Berry Parfait",
    pack: "high-protein",
    category: "desserts",
    servings: 1,
    prep_time_minutes: 5,
    cook_time_minutes: 0,
    calories_per_serving: 280,
    protein_g: 28,
    carbs_g: 30,
    fat_g: 6,
    dietary_tags: ["GF", "V", "HP", "Q"],
    instructions:
      "1. Layer Greek yogurt in a glass with mixed berries.\n2. Sprinkle granola and a drizzle of honey between layers.\n3. Top with flaked almonds.\n4. Serve immediately.",
    ingredients: [
      { name: "Greek yogurt (0%)", quantity: "200g", calories: 116, protein_g: 20, carbs_g: 8, fat_g: 0 },
      { name: "Mixed berries", quantity: "100g", calories: 45, protein_g: 1, carbs_g: 10, fat_g: 0 },
      { name: "Granola", quantity: "30g", calories: 120, protein_g: 3, carbs_g: 18, fat_g: 4 },
      { name: "Honey", quantity: "1 tsp", calories: 21, protein_g: 0, carbs_g: 6, fat_g: 0 },
    ],
  },
  {
    name: "Peanut Butter Protein Balls",
    pack: "high-protein",
    category: "desserts",
    servings: 10,
    prep_time_minutes: 15,
    cook_time_minutes: 0,
    calories_per_serving: 140,
    protein_g: 10,
    carbs_g: 12,
    fat_g: 7,
    dietary_tags: ["GF", "V", "HP", "MP", "N"],
    instructions:
      "1. Mix peanut butter, protein powder, oats and honey.\n2. Add dark chocolate chips.\n3. Roll into 10 balls.\n4. Refrigerate for 1 hour before serving.",
    ingredients: [
      { name: "Peanut butter", quantity: "100g", calories: 588, protein_g: 25, carbs_g: 20, fat_g: 50 },
      { name: "Vanilla protein powder", quantity: "40g", calories: 160, protein_g: 32, carbs_g: 3, fat_g: 2 },
      { name: "Oats", quantity: "60g", calories: 228, protein_g: 8, carbs_g: 40, fat_g: 4 },
      { name: "Honey", quantity: "2 tbsp", calories: 126, protein_g: 0, carbs_g: 34, fat_g: 0 },
    ],
  },
  {
    name: "Cottage Cheese Cheesecake Cups",
    pack: "high-protein",
    category: "desserts",
    servings: 4,
    prep_time_minutes: 10,
    cook_time_minutes: 0,
    calories_per_serving: 180,
    protein_g: 18,
    carbs_g: 16,
    fat_g: 5,
    dietary_tags: ["V", "HP", "Q"],
    instructions:
      "1. Blend cottage cheese, vanilla protein powder and lemon juice until smooth.\n2. Crush digestive biscuits and press into cup bases.\n3. Spoon filling on top.\n4. Chill for 2 hours. Top with fresh berries to serve.",
    ingredients: [
      { name: "Cottage cheese", quantity: "300g", calories: 246, protein_g: 33, carbs_g: 9, fat_g: 7 },
      { name: "Vanilla protein powder", quantity: "30g", calories: 120, protein_g: 24, carbs_g: 2, fat_g: 1 },
      { name: "Digestive biscuits", quantity: "4", calories: 280, protein_g: 4, carbs_g: 44, fat_g: 10 },
      { name: "Mixed berries", quantity: "80g", calories: 36, protein_g: 1, carbs_g: 8, fat_g: 0 },
    ],
  },
  {
    name: "Banana Protein Ice Cream",
    pack: "high-protein",
    category: "desserts",
    servings: 2,
    prep_time_minutes: 5,
    cook_time_minutes: 0,
    calories_per_serving: 200,
    protein_g: 18,
    carbs_g: 28,
    fat_g: 3,
    dietary_tags: ["GF", "V", "HP", "Q"],
    instructions:
      "1. Blend frozen banana chunks with protein powder and a splash of almond milk.\n2. Process until thick and creamy.\n3. Serve immediately as soft-serve or freeze for 30 minutes for firmer texture.\n4. Top with crushed nuts or cacao nibs.",
    ingredients: [
      { name: "Frozen bananas", quantity: "2 medium", calories: 210, protein_g: 2, carbs_g: 54, fat_g: 0 },
      { name: "Vanilla protein powder", quantity: "30g", calories: 120, protein_g: 24, carbs_g: 2, fat_g: 1 },
      { name: "Almond milk", quantity: "50ml", calories: 7, protein_g: 0, carbs_g: 0, fat_g: 0 },
      { name: "Cacao nibs", quantity: "1 tbsp", calories: 50, protein_g: 2, carbs_g: 4, fat_g: 4 },
    ],
  },

  // SHAKES (5)
  {
    name: "Chocolate Peanut Butter Power Shake",
    pack: "high-protein",
    category: "shakes",
    servings: 1,
    prep_time_minutes: 3,
    cook_time_minutes: 0,
    calories_per_serving: 420,
    protein_g: 40,
    carbs_g: 35,
    fat_g: 14,
    dietary_tags: ["GF", "V", "HP", "Q", "N"],
    instructions:
      "1. Add almond milk, protein powder, peanut butter and banana to blender.\n2. Add cocoa powder and a handful of ice.\n3. Blend until smooth and creamy.\n4. Pour and serve immediately.",
    ingredients: [
      { name: "Chocolate protein powder", quantity: "40g", calories: 160, protein_g: 32, carbs_g: 4, fat_g: 2 },
      { name: "Peanut butter", quantity: "1 tbsp", calories: 94, protein_g: 4, carbs_g: 3, fat_g: 8 },
      { name: "Banana", quantity: "1", calories: 105, protein_g: 1, carbs_g: 27, fat_g: 0 },
      { name: "Almond milk", quantity: "300ml", calories: 39, protein_g: 1, carbs_g: 1, fat_g: 2 },
    ],
  },
  {
    name: "Berry Blast Recovery Shake",
    pack: "high-protein",
    category: "shakes",
    servings: 1,
    prep_time_minutes: 3,
    cook_time_minutes: 0,
    calories_per_serving: 320,
    protein_g: 35,
    carbs_g: 32,
    fat_g: 5,
    dietary_tags: ["GF", "V", "HP", "Q"],
    instructions:
      "1. Blend frozen mixed berries with Greek yogurt and protein powder.\n2. Add a splash of water or milk to reach desired consistency.\n3. Blend until smooth.\n4. Pour into a glass and enjoy.",
    ingredients: [
      { name: "Vanilla protein powder", quantity: "30g", calories: 120, protein_g: 24, carbs_g: 2, fat_g: 1 },
      { name: "Frozen mixed berries", quantity: "150g", calories: 67, protein_g: 1, carbs_g: 15, fat_g: 0 },
      { name: "Greek yogurt (0%)", quantity: "100g", calories: 58, protein_g: 10, carbs_g: 4, fat_g: 0 },
      { name: "Honey", quantity: "1 tbsp", calories: 63, protein_g: 0, carbs_g: 17, fat_g: 0 },
    ],
  },
  {
    name: "Green Machine Protein Shake",
    pack: "high-protein",
    category: "shakes",
    servings: 1,
    prep_time_minutes: 3,
    cook_time_minutes: 0,
    calories_per_serving: 300,
    protein_g: 32,
    carbs_g: 28,
    fat_g: 8,
    dietary_tags: ["GF", "DF", "V", "HP", "Q"],
    instructions:
      "1. Add spinach, banana, protein powder and almond milk to blender.\n2. Add avocado quarter and ice.\n3. Blend on high for 60 seconds.\n4. Pour and drink fresh.",
    ingredients: [
      { name: "Vanilla protein powder", quantity: "30g", calories: 120, protein_g: 24, carbs_g: 2, fat_g: 1 },
      { name: "Fresh spinach", quantity: "60g", calories: 14, protein_g: 2, carbs_g: 2, fat_g: 0 },
      { name: "Banana", quantity: "1", calories: 105, protein_g: 1, carbs_g: 27, fat_g: 0 },
      { name: "Avocado", quantity: "¼", calories: 58, protein_g: 1, carbs_g: 3, fat_g: 5 },
    ],
  },
  {
    name: "Tropical Mango Protein Shake",
    pack: "high-protein",
    category: "shakes",
    servings: 1,
    prep_time_minutes: 3,
    cook_time_minutes: 0,
    calories_per_serving: 340,
    protein_g: 33,
    carbs_g: 40,
    fat_g: 6,
    dietary_tags: ["GF", "V", "HP", "Q"],
    instructions:
      "1. Blend frozen mango chunks with coconut milk and protein powder.\n2. Add a squeeze of lime juice.\n3. Blend until thick and smooth.\n4. Serve with a sprinkle of desiccated coconut.",
    ingredients: [
      { name: "Vanilla protein powder", quantity: "30g", calories: 120, protein_g: 24, carbs_g: 2, fat_g: 1 },
      { name: "Frozen mango", quantity: "150g", calories: 99, protein_g: 1, carbs_g: 25, fat_g: 0 },
      { name: "Coconut milk (light)", quantity: "200ml", calories: 80, protein_g: 1, carbs_g: 2, fat_g: 7 },
      { name: "Greek yogurt", quantity: "50g", calories: 29, protein_g: 5, carbs_g: 2, fat_g: 0 },
    ],
  },
  {
    name: "Coffee Protein Shake",
    pack: "high-protein",
    category: "shakes",
    servings: 1,
    prep_time_minutes: 3,
    cook_time_minutes: 0,
    calories_per_serving: 280,
    protein_g: 32,
    carbs_g: 22,
    fat_g: 7,
    dietary_tags: ["GF", "V", "HP", "Q"],
    instructions:
      "1. Brew espresso and allow to cool slightly.\n2. Blend with protein powder, almond milk and banana.\n3. Add ice and blend until frothy.\n4. Pour and serve — perfect pre-workout fuel.",
    ingredients: [
      { name: "Chocolate protein powder", quantity: "30g", calories: 120, protein_g: 24, carbs_g: 3, fat_g: 1 },
      { name: "Espresso", quantity: "1 shot (30ml)", calories: 2, protein_g: 0, carbs_g: 0, fat_g: 0 },
      { name: "Almond milk", quantity: "250ml", calories: 33, protein_g: 1, carbs_g: 1, fat_g: 2 },
      { name: "Banana", quantity: "½", calories: 53, protein_g: 1, carbs_g: 14, fat_g: 0 },
    ],
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let inserted = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const recipe of HIGH_PROTEIN_RECIPES) {
      // Check if recipe already exists
      const { data: existing } = await supabase
        .from("recipes")
        .select("id")
        .eq("name", recipe.name)
        .eq("pack", "high-protein")
        .maybeSingle();

      if (existing) {
        skipped++;
        continue;
      }

      const { ingredients, ...recipeData } = recipe;

      const { data: newRecipe, error: insertError } = await supabase
        .from("recipes")
        .insert({
          ...recipeData,
          is_public: true,
          is_favourite: false,
          user_id: null,
        })
        .select("id")
        .single();

      if (insertError) {
        errors.push(`${recipe.name}: ${insertError.message}`);
        continue;
      }

      // Insert ingredients
      if (ingredients && ingredients.length > 0) {
        const ingredientRows = ingredients.map((ing, idx) => ({
          recipe_id: newRecipe.id,
          name: ing.name,
          quantity: null as number | null,
          unit: ing.quantity,
          calories: ing.calories,
          protein_g: ing.protein_g,
          carbs_g: ing.carbs_g,
          fat_g: ing.fat_g,
          sort_order: idx,
        }));

        const { error: ingError } = await supabase
          .from("recipe_ingredients")
          .insert(ingredientRows);

        if (ingError) {
          errors.push(`${recipe.name} ingredients: ${ingError.message}`);
        }
      }

      inserted++;
    }

    return new Response(
      JSON.stringify({
        message: `Seeded ${inserted} new High Protein recipes. ${skipped} already existed.`,
        inserted,
        skipped,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Seed error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
